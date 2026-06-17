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

// Test data roster (up to MAX_UNIQUE_PLAYERS = 16 unique players for the 2026 edition).
// const marco = "marco-vitali";
// const andy = "andy-vleugels";
// const eddy = "eddy-ritzen";
// const ronnie = "ronnie-de-reydt";
// const danny = "danny-moors";

export const playDayResults: PlayDayResults[] = [];
