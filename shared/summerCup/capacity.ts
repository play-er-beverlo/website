import { getPlayDay, MAX_PER_PLAY_DAY } from "../data/summerCup";

export type RegistrationDenyReason =
  | "unknown_play_day"
  | "past"
  | "duplicate"
  | "full";

export interface ExistingRegistration {
  playDayId: string;
  email: string;
}

export interface CapacityResult {
  ok: boolean;
  reason?: RegistrationDenyReason;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** True when the play day's ISO date is before today's (date-level, like registration). */
export function isPlayDayPast(playDayId: string, now: Date): boolean {
  return playDayId < now.toISOString().slice(0, 10);
}

export function checkRegistrationAllowed(params: {
  playDayId: string;
  email: string;
  existing: ExistingRegistration[];
  now: Date;
}): CapacityResult {
  const playDay = getPlayDay(params.playDayId);
  if (!playDay) return { ok: false, reason: "unknown_play_day" };

  if (isPlayDayPast(playDay.id, params.now)) return { ok: false, reason: "past" };

  const email = normalizeEmail(params.email);
  const existing = params.existing.map((r) => ({
    playDayId: r.playDayId,
    email: normalizeEmail(r.email),
  }));

  if (existing.some((r) => r.playDayId === params.playDayId && r.email === email)) {
    return { ok: false, reason: "duplicate" };
  }

  const dayCount = existing.filter((r) => r.playDayId === params.playDayId).length;
  if (dayCount >= MAX_PER_PLAY_DAY) return { ok: false, reason: "full" };

  return { ok: true };
}

/**
 * Groups registration names per play day, each list sorted alphabetically with Dutch
 * collation — the same ordering the wedstrijdblad endpoint already uses. Play days
 * without registrations are absent from the map; callers fall back to an empty array.
 */
export function playerNamesByPlayDay(
  rows: { playDayId: string; name: string }[]
): Map<string, string[]> {
  const byDay = new Map<string, string[]>();

  for (const row of rows) {
    const names = byDay.get(row.playDayId);
    if (names) names.push(row.name);
    else byDay.set(row.playDayId, [row.name]);
  }

  for (const names of byDay.values()) {
    names.sort((a, b) => a.localeCompare(b, "nl"));
  }

  return byDay;
}

/**
 * Whether a visitor can still register for a play day. Structurally typed so this
 * module stays import-free; the availability response satisfies it. Both the play-day
 * row and the surrounding list read the rule from here instead of restating it.
 */
export function isSelectable(day: { full: boolean; past: boolean }): boolean {
  return !day.full && !day.past;
}
