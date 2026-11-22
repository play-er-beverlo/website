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
 * bookable duration, and moves the start when it is too close to the start for that. Any other
 * block that leaves room for MIN_DURATION starts a new selection.
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
      if (allowed.includes(length)) {
        return { ...current, duration: length };
      }

      // Too close to the start to be an end: the tap moves the start there instead, keeping
      // the end where that leaves a bookable duration.
      const end = current.start.valueOf() + current.duration * 60 * 1000;
      const duration = Math.max((end - time) / 60 / 1000, MIN_DURATION);

      return allowedDurations(free, time, durations).includes(duration)
        ? { location, start: new Date(time), duration }
        : null;
    }
  }

  return allowedDurations(free, time, durations).includes(MIN_DURATION)
    ? { location, start: new Date(time), duration: MIN_DURATION }
    : null;
}

/**
 * Moves the start or the end of the selection by `minutes`, or returns null when that is not
 * bookable. Moving the start keeps the end, unless the selection would become shorter than the
 * shortest or longer than the longest duration: then the end moves along.
 */
export function adjustSelection(
  free: Set<number>,
  current: BookingSelection,
  edge: "start" | "end",
  minutes: number,
  durations: number[]
): BookingSelection | null {
  const shortest = Math.min(...durations);
  const longest = Math.max(...durations);
  const start = current.start.valueOf() + (edge === "start" ? minutes * 60 * 1000 : 0);
  const duration =
    edge === "start"
      ? Math.min(Math.max(current.duration - minutes, shortest), longest)
      : current.duration + minutes;

  return allowedDurations(free, start, durations).includes(duration)
    ? { ...current, start: new Date(start), duration }
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
