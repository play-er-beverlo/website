export interface DayPlayer {
  id: string;
  name: string;
}

/** One frame's point totals; whoever has more points wins the frame. */
export interface Frame {
  a: number; // points for match.a, e.g. 45
  b: number; // points for match.b, e.g. 57
}

export interface Match {
  a: string;          // DayPlayer.id (row in the grid)
  b: string;          // DayPlayer.id (col in the grid)
  frames?: Frame[];   // real per-frame point scores (1 or 2 frames per field size)
  winner?: "a" | "b"; // fallback when only the outcome is known
}

export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // one entry per round-robin pairing
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
}

const marco = "marco-vitali";
const andy = "andy-vleugels";
const eddy = "eddy-ritzen";
const ronnie = "ronnie-de-reydt";
const danny = "danny-moors";
const tom = "tom-janssens";
const bart = "bart-peeters";
const koen = "koen-maes";
const wim = "wim-claes";
const luc = "luc-vermeulen";
const geert = "geert-willems";

export const playDayResults: PlayDayResults[] = [
  {
    playDayId: "2026-06-17",
    players: [
      { id: marco, name: "Marco Vitali" },
      { id: andy, name: "Andy Vleugels" },
      { id: eddy, name: "Eddy Ritzen" },
      { id: ronnie, name: "Ronnie De Reydt" },
      { id: danny, name: "Danny Moors" },
    ],
    // Only match outcomes are known for this play day (win/loss), so each match
    // is stored as a winner. Replace with `frames: [{ a, b }, ...]` once real
    // frame point scores (e.g. 45-57) are recorded.
    matches: [
      { a: marco, b: andy, winner: "b" },
      { a: marco, b: eddy, winner: "a" },
      { a: marco, b: ronnie, winner: "a" },
      { a: marco, b: danny, winner: "a" },
      { a: andy, b: eddy, winner: "a" },
      { a: andy, b: ronnie, winner: "b" },
      { a: andy, b: danny, winner: "a" },
      { a: eddy, b: ronnie, winner: "a" },
      { a: eddy, b: danny, winner: "b" },
      { a: ronnie, b: danny, winner: "b" },
    ],
  },
  {
    playDayId: "2026-06-19",
    players: [
      { id: tom, name: "Tom Janssens" },
      { id: marco, name: "Marco Vitali" },
      { id: geert, name: "Geert Willems" },
      { id: bart, name: "Bart Peeters" },
      { id: danny, name: "Danny Moors" },
      { id: luc, name: "Luc Vermeulen" },
      { id: koen, name: "Koen Maes" },
      { id: wim, name: "Wim Claes" },
    ],
    // 8 players -> 1 frame per match; outcomes only, entered as winners. Marco and
    // Danny also played on 2026-06-17, so only their best day of tournament 1 counts
    // in the Summer Ranking.
    matches: [
      { a: tom, b: marco, winner: "a" },
      { a: tom, b: geert, winner: "a" },
      { a: tom, b: bart, winner: "a" },
      { a: tom, b: danny, winner: "b" },
      { a: tom, b: luc, winner: "a" },
      { a: tom, b: koen, winner: "a" },
      { a: tom, b: wim, winner: "a" },
      { a: marco, b: geert, winner: "a" },
      { a: marco, b: bart, winner: "b" },
      { a: marco, b: danny, winner: "b" },
      { a: marco, b: luc, winner: "a" },
      { a: marco, b: koen, winner: "b" },
      { a: marco, b: wim, winner: "b" },
      { a: geert, b: bart, winner: "b" },
      { a: geert, b: danny, winner: "b" },
      { a: geert, b: luc, winner: "b" },
      { a: geert, b: koen, winner: "b" },
      { a: geert, b: wim, winner: "b" },
      { a: bart, b: danny, winner: "b" },
      { a: bart, b: luc, winner: "a" },
      { a: bart, b: koen, winner: "a" },
      { a: bart, b: wim, winner: "a" },
      { a: danny, b: luc, winner: "a" },
      { a: danny, b: koen, winner: "a" },
      { a: danny, b: wim, winner: "a" },
      { a: luc, b: koen, winner: "b" },
      { a: luc, b: wim, winner: "b" },
      { a: koen, b: wim, winner: "a" },
    ],
  },
];
