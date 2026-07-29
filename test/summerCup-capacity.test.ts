import { describe, expect, it } from "vitest";
import {
  checkRegistrationAllowed,
  isPlayDayPast,
  isSelectable,
  playerNamesByPlayDay,
  type ExistingRegistration,
} from "../shared/summerCup/capacity";

const NOW = new Date("2026-06-11T12:00:00Z"); // before the first play day

function make(count: number, playDayId: string, emailPrefix: string): ExistingRegistration[] {
  return Array.from({ length: count }, (_, i) => ({
    playDayId,
    email: `${emailPrefix}${i}@example.com`,
  }));
}

describe("checkRegistrationAllowed", () => {
  it("allows a registration when there is space", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });

  it("rejects an unknown play day", () => {
    const r = checkRegistrationAllowed({
      playDayId: "1999-01-01",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "unknown_play_day" });
  });

  it("rejects a play day in the past", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: new Date("2026-06-20T12:00:00Z"),
    });
    expect(r).toEqual({ ok: false, reason: "past" });
  });

  it("rejects a duplicate registration for the same day (case-insensitive)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "Jan@Example.com",
      existing: [{ playDayId: "2026-06-17", email: "jan@example.com" }],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects when the play day is full (8 registrations)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: make(8, "2026-06-17", "p"),
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "full" });
  });

  it("allows a new player even when many unique players already registered elsewhere", () => {
    // No edition-wide unique cap: only the per-play-day limit applies.
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "seventeenth@example.com",
      existing: make(16, "2026-06-17", "u"), // 16 unique emails on a different, full day
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });

  it("allows an already-registered player to add another day", () => {
    const existing = make(8, "2026-06-17", "u"); // u0..u7 on the Wednesday day
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "u3@example.com", // plays the Friday day too
      existing,
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });
});

describe("isPlayDayPast", () => {
  it("is true when the play day is before today", () => {
    expect(isPlayDayPast("2026-06-17", new Date("2026-06-18T10:00:00Z"))).toBe(true);
  });

  it("is false on the play day itself", () => {
    expect(isPlayDayPast("2026-06-18", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });

  it("is false when the play day is in the future", () => {
    expect(isPlayDayPast("2026-07-01", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });
});

describe("playerNamesByPlayDay", () => {
  it("groups names per play day", () => {
    const map = playerNamesByPlayDay([
      { playDayId: "2026-06-17", name: "Jan" },
      { playDayId: "2026-06-19", name: "Piet" },
      { playDayId: "2026-06-17", name: "Ann" },
    ]);
    expect(map.get("2026-06-17")).toEqual(["Ann", "Jan"]);
    expect(map.get("2026-06-19")).toEqual(["Piet"]);
  });

  it("sorts alphabetically using Dutch collation", () => {
    const map = playerNamesByPlayDay([
      { playDayId: "2026-06-17", name: "Zoë" },
      { playDayId: "2026-06-17", name: "Émile" },
      { playDayId: "2026-06-17", name: "ann" },
    ]);
    expect(map.get("2026-06-17")).toEqual(["ann", "Émile", "Zoë"]);
  });

  it("keeps both entries when two players share a name", () => {
    const map = playerNamesByPlayDay([
      { playDayId: "2026-06-17", name: "Jan Peeters" },
      { playDayId: "2026-06-17", name: "Jan Peeters" },
    ]);
    expect(map.get("2026-06-17")).toEqual(["Jan Peeters", "Jan Peeters"]);
  });

  it("omits play days without registrations", () => {
    const map = playerNamesByPlayDay([{ playDayId: "2026-06-17", name: "Jan" }]);
    expect(map.has("2026-06-19")).toBe(false);
  });

  it("returns an empty map for empty input", () => {
    expect(playerNamesByPlayDay([]).size).toBe(0);
  });
});

describe("isSelectable", () => {
  it("is true for a day with space that has not been played yet", () => {
    expect(isSelectable({ full: false, past: false })).toBe(true);
  });

  it("is false for a full day", () => {
    expect(isSelectable({ full: true, past: false })).toBe(false);
  });

  it("is false for a past day", () => {
    expect(isSelectable({ full: false, past: true })).toBe(false);
  });
});
