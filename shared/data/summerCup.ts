export const EDITION_YEAR = 2026;
export const MIN_PER_PLAY_DAY = 4;
export const MAX_PER_PLAY_DAY = 8;
export const MAX_UNIQUE_PLAYERS = 16;
export const REGISTRATION_FEE = 15;
export const PLAY_TIME = "18u30";

export const payment = {
  iban: "BE30 0637 6639 4611",
  ibanCompact: "BE30063766394611",
  bic: "GKCCBEBB",
  beneficiary: "Beckers Steff",
};

export interface PlayDay {
  /** Stable key + ISO date, e.g. "2026-06-17". */
  id: string;
  tournament: number;
  weekday: "woensdag" | "vrijdag";
  /** Full label, e.g. "Toernooi 1 — woensdag 17 juni 2026". */
  label: string;
  /** Short label used in the payment communication, e.g. "wo 17 juni 2026". */
  shortLabel: string;
}

export const playDays: PlayDay[] = [
  { id: "2026-06-17", tournament: 1, weekday: "woensdag", label: "Toernooi 1 — woensdag 17 juni 2026", shortLabel: "wo 17 juni 2026" },
  { id: "2026-06-19", tournament: 1, weekday: "vrijdag", label: "Toernooi 1 — vrijdag 19 juni 2026", shortLabel: "vr 19 juni 2026" },
  { id: "2026-07-01", tournament: 2, weekday: "woensdag", label: "Toernooi 2 — woensdag 1 juli 2026", shortLabel: "wo 1 juli 2026" },
  { id: "2026-07-03", tournament: 2, weekday: "vrijdag", label: "Toernooi 2 — vrijdag 3 juli 2026", shortLabel: "vr 3 juli 2026" },
  { id: "2026-07-15", tournament: 3, weekday: "woensdag", label: "Toernooi 3 — woensdag 15 juli 2026", shortLabel: "wo 15 juli 2026" },
  { id: "2026-07-17", tournament: 3, weekday: "vrijdag", label: "Toernooi 3 — vrijdag 17 juli 2026", shortLabel: "vr 17 juli 2026" },
  { id: "2026-07-29", tournament: 4, weekday: "woensdag", label: "Toernooi 4 — woensdag 29 juli 2026", shortLabel: "wo 29 juli 2026" },
  { id: "2026-07-31", tournament: 4, weekday: "vrijdag", label: "Toernooi 4 — vrijdag 31 juli 2026", shortLabel: "vr 31 juli 2026" },
];

export const finaleDay = {
  id: "2026-08-14",
  label: "Finaledag — vrijdag 14 augustus 2026",
  shortLabel: "vr 14 augustus 2026",
};

export function getPlayDay(id: string): PlayDay | undefined {
  return playDays.find((d) => d.id === id);
}
