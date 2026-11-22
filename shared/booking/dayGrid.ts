export const BLOCK_MINUTES = 15;
export const MIN_DURATION = 60;

const BLOCK_MS = BLOCK_MINUTES * 60 * 1000;

/**
 * Free blocks of a table, as epoch-ms block starts. Every slot start marks
 * MIN_DURATION minutes as free, so gaps shorter than that stay occupied.
 */
export function freeBlocks(slotStarts: Date[]): Set<number> {
  const free = new Set<number>();

  for (const slotStart of slotStarts) {
    for (let offset = 0; offset < MIN_DURATION; offset += BLOCK_MINUTES) {
      free.add(slotStart.valueOf() + offset * 60 * 1000);
    }
  }

  return free;
}

/** Block starts from the earliest to the latest free block across all tables. */
export function rowTimes(columns: Set<number>[]): number[] {
  const all = columns.flatMap((column) => [...column]);

  if (all.length === 0) {
    return [];
  }

  const first = Math.min(...all);
  const last = Math.max(...all);
  const rows: number[] = [];

  for (let time = first; time <= last; time += BLOCK_MS) {
    rows.push(time);
  }

  return rows;
}

/** The durations (in minutes) that fit in the free time starting at `start`. */
export function allowedDurations(free: Set<number>, start: number, durations: number[]): number[] {
  let freeMinutes = 0;

  while (free.has(start + freeMinutes * 60 * 1000)) {
    freeMinutes += BLOCK_MINUTES;
  }

  return durations.filter((duration) => duration <= freeMinutes);
}

export type BookingSelection = { location: number; start: Date; duration: number };

/**
 * What tapping the block at `time` on table `location` selects, or null when the tap does
 * nothing. `free` holds the free blocks of that table.
 *
 * A later block in the selected table sets the end of the selection when that gives a
 * bookable duration. Any other block that leaves room for MIN_DURATION starts a new selection.
 */
export function nextSelection(
  free: Set<number>,
  current: BookingSelection | null,
  location: number,
  time: number,
  durations: number[]
): BookingSelection | null {
  if (!free.has(time)) {
    return null;
  }

  if (current && current.location === location && time > current.start.valueOf()) {
    const allowed = allowedDurations(free, current.start.valueOf(), durations);
    const length = (time + BLOCK_MS - current.start.valueOf()) / 60 / 1000;

    if (allowed.length > 0 && length <= Math.max(...allowed)) {
      return allowed.includes(length) ? { ...current, duration: length } : null;
    }
  }

  return allowedDurations(free, time, durations).includes(MIN_DURATION)
    ? { location, start: new Date(time), duration: MIN_DURATION }
    : null;
}

// The venue's time zone, so a visitor abroad sees the hours as they are in Beverlo.
const TIME_ZONE = "Europe/Brussels";

export const formatTime = (value: Date | number) =>
  new Date(value).toLocaleTimeString("nl-BE", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDate = (value: Date | number) =>
  new Date(value).toLocaleDateString("nl-BE", { timeZone: TIME_ZONE });

/** 75 -> "1u15" */
export const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}u${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;
