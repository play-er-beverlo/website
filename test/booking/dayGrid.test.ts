import { describe, expect, it } from "vitest";
import {
  allowedDurations,
  formatDate,
  formatDuration,
  formatTime,
  freeBlocks,
  moveSelection,
  nextSelection,
  resizeSelection,
  rowTimes,
} from "../../shared/booking/dayGrid";
import { durations } from "../../shared/data/booking";

const t = (hhmm: string) => new Date(`2026-11-28T${hhmm}:00.000Z`);
const ms = (hhmm: string) => t(hhmm).valueOf();
const QUARTER = 15 * 60000;

/** The quarter-hour slot starts Cal offers when a table is free from `from` until `to`. */
const starts = (from: string, to: string) => {
  const result: Date[] = [];

  for (let time = ms(from); time + 60 * 60000 <= ms(to); time += QUARTER) {
    result.push(new Date(time));
  }

  return result;
};

describe("durations", () => {
  it("offers every quarter from 1 hour up to 4 hours", () => {
    expect(durations).toEqual([60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240]);
  });
});

describe("freeBlocks", () => {
  it("marks the four quarters of every 60-minute slot as free", () => {
    expect([...freeBlocks([t("14:00"), t("14:15")])].sort()).toEqual([
      ms("14:00"),
      ms("14:15"),
      ms("14:30"),
      ms("14:45"),
      ms("15:00"),
    ]);
  });

  it("leaves a gap shorter than 60 minutes occupied", () => {
    // Cal offers 14:00 and 16:00 only, so 15:00-16:00 holds no bookable hour
    const free = freeBlocks([t("14:00"), t("16:00")]);
    expect(free.has(ms("15:30"))).toBe(false);
  });

  it("returns an empty set for no slots", () => {
    expect(freeBlocks([]).size).toBe(0);
  });
});

describe("rowTimes", () => {
  it("spans earliest to latest free block across columns in quarter steps", () => {
    const rows = rowTimes([freeBlocks([t("15:00")]), freeBlocks([t("14:00")])]);
    expect(rows).toHaveLength(8);
    expect(rows[0]).toBe(ms("14:00"));
    expect(rows[1]).toBe(ms("14:15"));
    expect(rows[7]).toBe(ms("15:45"));
  });

  it("is empty when nothing is free", () => {
    expect(rowTimes([new Set(), new Set()])).toEqual([]);
  });
});

describe("allowedDurations", () => {
  const free = freeBlocks(starts("14:00", "16:30"));

  it("returns every quarter step that fits before the next occupied block", () => {
    expect(allowedDurations(free, ms("14:00"), durations)).toEqual([60, 75, 90, 105, 120, 135, 150]);
  });

  it("returns nothing for a start with less than an hour left", () => {
    expect(allowedDurations(free, ms("15:45"), durations)).toEqual([]);
  });

  it("caps at 4 hours", () => {
    const long = freeBlocks(starts("10:00", "15:00"));
    expect(allowedDurations(long, ms("10:00"), durations)).toEqual(durations);
  });
});

describe("nextSelection", () => {
  // table 1 free 10:00-15:00, then occupied, then free 16:00-17:30
  const free = freeBlocks([...starts("10:00", "15:00"), ...starts("16:00", "17:30")]);
  const current = { location: 1, start: t("10:00"), duration: 60 };
  const tap = (selection: typeof current | null, location: number, hhmm: string) =>
    nextSelection(free, selection, location, ms(hhmm), durations);

  it("starts a one hour selection on a free block", () => {
    expect(tap(null, 1, "10:00")).toEqual({ location: 1, start: t("10:00"), duration: 60 });
  });

  it("can start on any quarter", () => {
    expect(tap(null, 1, "10:45")).toEqual({ location: 1, start: t("10:45"), duration: 60 });
  });

  it("extends by a quarter to the end of a later block in the same table", () => {
    expect(tap(current, 1, "11:00")).toEqual({ ...current, duration: 75 });
  });

  it("shortens when a block inside the selection is tapped", () => {
    expect(tap({ ...current, duration: 180 }, 1, "11:15")).toEqual({ ...current, duration: 90 });
  });

  it("moves the start later when a block in the first hour is tapped, keeping the end", () => {
    expect(tap({ ...current, duration: 180 }, 1, "10:30")).toEqual({
      location: 1,
      start: t("10:30"),
      duration: 150,
    });
  });

  it("keeps at least an hour when the start moves later", () => {
    expect(tap(current, 1, "10:30")).toEqual({ location: 1, start: t("10:30"), duration: 60 });
  });

  it("does not move the start when the hour would run into an occupied block", () => {
    // free until 15:00: from 14:15 only 45 minutes are left
    expect(tap({ location: 1, start: t("14:00"), duration: 60 }, 1, "14:15")).toBeNull();
  });

  it("extends to the 4 hour maximum", () => {
    expect(tap(current, 1, "13:45")).toEqual({ ...current, duration: 240 });
  });

  it("restarts on a block beyond the maximum duration", () => {
    expect(tap(current, 1, "14:00")).toEqual({ location: 1, start: t("14:00"), duration: 60 });
  });

  it("restarts on a block past an occupied block", () => {
    expect(tap(current, 1, "16:00")).toEqual({ location: 1, start: t("16:00"), duration: 60 });
  });

  it("restarts when another table is tapped", () => {
    expect(tap(current, 2, "11:00")).toEqual({ location: 2, start: t("11:00"), duration: 60 });
  });

  it("does nothing on an occupied block", () => {
    expect(tap(current, 1, "15:00")).toBeNull();
  });

  it("does nothing where less than an hour is left", () => {
    expect(tap(null, 1, "16:45")).toBeNull();
  });

  it("treats a selection that is no longer free as no selection", () => {
    const stale = { location: 1, start: t("15:00"), duration: 60 };
    expect(tap(stale, 1, "16:30")).toEqual({ location: 1, start: t("16:30"), duration: 60 });
  });
});

describe("resizeSelection", () => {
  // free 10:00-15:00, then occupied
  const free = freeBlocks(starts("10:00", "15:00"));
  const current = { location: 1, start: t("11:00"), duration: 90 };
  const drag = (selection: typeof current, edge: "start" | "end", hhmm: string) =>
    resizeSelection(free, selection, edge, ms(hhmm), durations);

  it("drags the end to the block under the pointer", () => {
    expect(drag(current, "end", "13:00")).toEqual({ ...current, duration: 135 });
    expect(drag(current, "end", "12:00")).toEqual({ ...current, duration: 75 });
  });

  it("keeps at least an hour when the end is dragged up, even above the start", () => {
    expect(drag(current, "end", "11:15")).toEqual({ ...current, duration: 60 });
    expect(drag(current, "end", "10:00")).toEqual({ ...current, duration: 60 });
  });

  it("stops the end at 4 hours", () => {
    expect(drag({ ...current, start: t("10:00") }, "end", "14:45")).toEqual({
      ...current,
      start: t("10:00"),
      duration: 240,
    });
  });

  it("stops the end at the next occupied block", () => {
    expect(drag({ ...current, start: t("13:00") }, "end", "16:00")).toEqual({
      ...current,
      start: t("13:00"),
      duration: 120,
    });
  });

  it("drags the start and keeps the end", () => {
    expect(drag(current, "start", "11:15")).toEqual({ ...current, start: t("11:15"), duration: 75 });
    expect(drag(current, "start", "10:15")).toEqual({ ...current, start: t("10:15"), duration: 135 });
  });

  it("keeps at least an hour when the start is dragged down", () => {
    expect(drag(current, "start", "12:15")).toEqual({ ...current, start: t("11:30"), duration: 60 });
  });

  it("stops the start at the previous occupied block", () => {
    expect(drag(current, "start", "09:00")).toEqual({ ...current, start: t("10:00"), duration: 150 });
  });

  it("stops the start at 4 hours before the end", () => {
    const late = { location: 1, start: t("14:00"), duration: 60 };
    expect(drag(late, "start", "10:00")).toEqual({ ...late, start: t("11:00"), duration: 240 });
  });
});

describe("moveSelection", () => {
  // free 10:00-15:00, then occupied
  const free = freeBlocks(starts("10:00", "15:00"));
  const current = { location: 1, start: t("11:00"), duration: 90 };

  it("moves the whole selection to a new start, also on another table", () => {
    expect(moveSelection(free, current, 2, ms("12:15"), durations)).toEqual({
      location: 2,
      start: t("12:15"),
      duration: 90,
    });
  });

  it("refuses a position that overlaps an occupied block", () => {
    expect(moveSelection(free, current, 1, ms("13:45"), durations)).toBeNull();
    expect(moveSelection(free, current, 1, ms("09:45"), durations)).toBeNull();
  });
});

describe("formatDuration", () => {
  it("writes hours and quarters the way people say them", () => {
    expect(formatDuration(60)).toBe("1u");
    expect(formatDuration(75)).toBe("1u15");
    expect(formatDuration(150)).toBe("2u30");
  });
});

describe("formatTime and formatDate", () => {
  it("formats times in the venue's time zone, in winter and summer", () => {
    expect(formatTime(new Date("2026-11-28T14:00:00.000Z"))).toBe("15:00");
    expect(formatTime(new Date("2026-07-01T14:30:00.000Z").valueOf())).toBe("16:30");
  });

  it("formats the date in the venue's time zone", () => {
    expect(formatDate(new Date("2026-11-28T23:30:00.000Z"))).toBe("29/11/2026");
  });
});
