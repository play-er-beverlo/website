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
    // 5 players -> 2 frames per match, recorded as frames won (2-0 / 1-1 / 0-2).
    matches: [
      { a: marco, b: andy, framesA: 0, framesB: 2 },
      { a: marco, b: eddy, framesA: 2, framesB: 0 },
      { a: marco, b: ronnie, framesA: 2, framesB: 0 },
      { a: marco, b: danny, framesA: 2, framesB: 0 },
      { a: andy, b: eddy, framesA: 2, framesB: 0 },
      { a: andy, b: ronnie, framesA: 0, framesB: 2 },
      { a: andy, b: danny, framesA: 2, framesB: 0 },
      { a: eddy, b: ronnie, framesA: 1, framesB: 1 },
      { a: eddy, b: danny, framesA: 0, framesB: 2 },
      { a: ronnie, b: danny, framesA: 0, framesB: 2 },
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
    // 8 players -> 1 frame per match, recorded as frames won (1-0 / 0-1). Marco and
    // Danny also played on 2026-06-17, so only their best day of tournament 1 counts
    // in the Summer Ranking.
    matches: [
      { a: tom, b: marco, framesA: 1, framesB: 0 },
      { a: tom, b: geert, framesA: 1, framesB: 0 },
      { a: tom, b: bart, framesA: 1, framesB: 0 },
      { a: tom, b: danny, framesA: 0, framesB: 1 },
      { a: tom, b: luc, framesA: 1, framesB: 0 },
      { a: tom, b: koen, framesA: 1, framesB: 0 },
      { a: tom, b: wim, framesA: 1, framesB: 0 },
      { a: marco, b: geert, framesA: 1, framesB: 0 },
      { a: marco, b: bart, framesA: 0, framesB: 1 },
      { a: marco, b: danny, framesA: 0, framesB: 1 },
      { a: marco, b: luc, framesA: 1, framesB: 0 },
      { a: marco, b: koen, framesA: 0, framesB: 1 },
      { a: marco, b: wim, framesA: 0, framesB: 1 },
      { a: geert, b: bart, framesA: 0, framesB: 1 },
      { a: geert, b: danny, framesA: 0, framesB: 1 },
      { a: geert, b: luc, framesA: 0, framesB: 1 },
      { a: geert, b: koen, framesA: 0, framesB: 1 },
      { a: geert, b: wim, framesA: 0, framesB: 1 },
      { a: bart, b: danny, framesA: 0, framesB: 1 },
      { a: bart, b: luc, framesA: 1, framesB: 0 },
      { a: bart, b: koen, framesA: 1, framesB: 0 },
      { a: bart, b: wim, framesA: 1, framesB: 0 },
      { a: danny, b: luc, framesA: 1, framesB: 0 },
      { a: danny, b: koen, framesA: 1, framesB: 0 },
      { a: danny, b: wim, framesA: 1, framesB: 0 },
      { a: luc, b: koen, framesA: 0, framesB: 1 },
      { a: luc, b: wim, framesA: 0, framesB: 1 },
      { a: koen, b: wim, framesA: 1, framesB: 0 },
    ],
  },
];
