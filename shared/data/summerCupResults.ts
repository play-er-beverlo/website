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
];
