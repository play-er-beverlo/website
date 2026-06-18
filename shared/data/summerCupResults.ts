export interface DayPlayer {
  id: string;
  name: string;
}

export interface Match {
  a: string; // DayPlayer.id (row in the grid)
  b: string; // DayPlayer.id (col in the grid)
  // Frames won by each player. 4-5 players -> total 2 (2-0 / 1-1 / 0-2);
  // 6-8 players -> total 1 (1-0 / 0-1). A 1-1 is a draw (no match win).
  framesA: number;
  framesB: number;
}

export interface Break {
  player: string; // DayPlayer.id
  value: number;  // points in the break (recorded for 30+)
}

export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // one entry per round-robin pairing
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
  breaks?: Break[];      // 30+ breaks made on this play day (hand-entered)
}

// Results data (up to MAX_UNIQUE_PLAYERS = 16 unique players for the 2026 edition).
const andy = "andy-vleugels";
const danny = "danny-moors";
const eddy = "eddy-ritzen";
const jp = "jean-pierre-van-camp"
const koen = "koen-caerts";
const marc = "marc-de-l-arbre";
const marco = "marco-vitali";
const roman = "roman-szpyt";
const ronnie = "ronnie-de-reydt";
const steff = "steff-beckers";

export const playDayResults: PlayDayResults[] = [
  // ── Toernooi 1 — woensdag 17 juni 2026 ───────────────────────────────────────
  {
    playDayId: "2026-06-17",
    players: [
      { id: andy, name: "Andy Vleugels" },
      { id: jp, name: "Jean-Pierre Van Camp" },
      { id: koen, name: "Koen Caerts" },
      { id: marc, name: "Marc De l'Arbre" },
      { id: marco, name: "Marco Vitali" },
      { id: roman, name: "Roman Szpyt" },
      { id: ronnie, name: "Ronnie De Reydt" },
      { id: steff, name: "Steff Beckers" },
    ],
    // 8 players -> 1 frame per match, recorded as frames won (1-0 / 0-1).
    matches: [
      { a: andy, b: jp, framesA: 1, framesB: 0 },
      { a: andy, b: koen, framesA: 1, framesB: 0 },
      { a: andy, b: marc, framesA: 1, framesB: 0 },
      { a: andy, b: marco, framesA: 1, framesB: 0 },
      { a: andy, b: roman, framesA: 0, framesB: 1 },
      { a: andy, b: ronnie, framesA: 0, framesB: 1 },
      { a: andy, b: steff, framesA: 1, framesB: 0 },
      { a: jp, b: koen, framesA: 1, framesB: 0 },
      { a: jp, b: marc, framesA: 0, framesB: 1 },
      { a: jp, b: marco, framesA: 1, framesB: 0 },
      { a: jp, b: roman, framesA: 0, framesB: 1 },
      { a: jp, b: ronnie, framesA: 0, framesB: 1 },
      { a: jp, b: steff, framesA: 0, framesB: 1 },
      { a: koen, b: marc, framesA: 1, framesB: 0 },
      { a: koen, b: marco, framesA: 1, framesB: 0 },
      { a: koen, b: roman, framesA: 0, framesB: 1 },
      { a: koen, b: ronnie, framesA: 0, framesB: 1 },
      { a: koen, b: steff, framesA: 0, framesB: 1 },
      { a: marc, b: marco, framesA: 1, framesB: 0 },
      { a: marc, b: roman, framesA: 0, framesB: 1 },
      { a: marc, b: ronnie, framesA: 1, framesB: 0 },
      { a: marc, b: steff, framesA: 0, framesB: 1 },
      { a: marco, b: roman, framesA: 1, framesB: 0 },
      { a: marco, b: ronnie, framesA: 1, framesB: 0 },
      { a: marco, b: steff, framesA: 0, framesB: 1 },
      { a: roman, b: ronnie, framesA: 1, framesB: 0 },
      { a: roman, b: steff, framesA: 0, framesB: 1 },
      { a: ronnie, b: steff, framesA: 0, framesB: 1 },
    ],
    breaks: [
      { player: andy, value: 32 },
    ],
  },
];
