import { getPlayDay, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS } from "../data/summerCup";

export type RegistrationDenyReason =
  | "unknown_play_day"
  | "past"
  | "duplicate"
  | "full"
  | "edition_full";

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

  const uniqueEmails = new Set(existing.map((r) => r.email));
  if (!uniqueEmails.has(email) && uniqueEmails.size >= MAX_UNIQUE_PLAYERS) {
    return { ok: false, reason: "edition_full" };
  }

  return { ok: true };
}
