import { getPlayDay } from "../data/summerCup";
import type { PlayDay } from "../data/summerCup";

/**
 * Resolve a `DD-MM-YYYY` URL param (e.g. "17-06-2026") to its play day.
 * Returns undefined for malformed input or a date that is not a play day.
 */
export function playDayFromDateParam(param: string): PlayDay | undefined {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(param);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return getPlayDay(`${year}-${month}-${day}`);
}

/** Convert an ISO play day id ("2026-06-17") to a `DD-MM-YYYY` param ("17-06-2026"). */
export function dateParamFromPlayDayId(id: string): string {
  const [year, month, day] = id.split("-");
  return `${day}-${month}-${year}`;
}
