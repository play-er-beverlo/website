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
const jef = "jef-mertens";
const patrick = "patrick-goossens";
const rudy = "rudy-wouters";
const chris = "chris-aerts";
const dirk = "dirk-segers";

export const playDayResults: PlayDayResults[] = [
  // ── Toernooi 1 ──────────────────────────────────────────────────────────────
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
    // The eddy/ronnie 1-1 exercises the "draw, no match win" path.
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
    breaks: [
      { player: marco, value: 52 },
      { player: andy, value: 47 },
      { player: marco, value: 38 },
      { player: eddy, value: 33 },
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
    breaks: [
      { player: tom, value: 61 },
      { player: danny, value: 41 },
      { player: marco, value: 35 },
    ],
  },

  // ── Toernooi 2 ──────────────────────────────────────────────────────────────
  {
    playDayId: "2026-07-01",
    players: [
      { id: tom, name: "Tom Janssens" },
      { id: marco, name: "Marco Vitali" },
      { id: jef, name: "Jef Mertens" },
      { id: patrick, name: "Patrick Goossens" },
      { id: andy, name: "Andy Vleugels" },
      { id: eddy, name: "Eddy Ritzen" },
    ],
    // 6 players -> 1 frame per match. Decisive ladder: Tom 5 wins down to Patrick 0.
    matches: [
      { a: tom, b: marco, framesA: 1, framesB: 0 },
      { a: tom, b: jef, framesA: 1, framesB: 0 },
      { a: tom, b: patrick, framesA: 1, framesB: 0 },
      { a: tom, b: andy, framesA: 1, framesB: 0 },
      { a: tom, b: eddy, framesA: 1, framesB: 0 },
      { a: marco, b: jef, framesA: 1, framesB: 0 },
      { a: marco, b: patrick, framesA: 1, framesB: 0 },
      { a: marco, b: andy, framesA: 1, framesB: 0 },
      { a: marco, b: eddy, framesA: 1, framesB: 0 },
      { a: jef, b: patrick, framesA: 1, framesB: 0 },
      { a: jef, b: andy, framesA: 0, framesB: 1 },
      { a: jef, b: eddy, framesA: 1, framesB: 0 },
      { a: patrick, b: andy, framesA: 0, framesB: 1 },
      { a: patrick, b: eddy, framesA: 0, framesB: 1 },
      { a: andy, b: eddy, framesA: 1, framesB: 0 },
    ],
    breaks: [
      { player: tom, value: 45 },
      { player: marco, value: 38 },
      { player: andy, value: 31 },
    ],
  },
  {
    playDayId: "2026-07-03",
    players: [
      { id: tom, name: "Tom Janssens" },
      { id: danny, name: "Danny Moors" },
      { id: geert, name: "Geert Willems" },
      { id: rudy, name: "Rudy Wouters" },
    ],
    // 4 players -> 2 frames per match. Tom and Danny finish level on frames (5) and
    // matches (2) with a drawn head-to-head, so the manual `tiebreak` decides the order.
    matches: [
      { a: tom, b: danny, framesA: 1, framesB: 1 },
      { a: tom, b: geert, framesA: 2, framesB: 0 },
      { a: tom, b: rudy, framesA: 2, framesB: 0 },
      { a: danny, b: geert, framesA: 2, framesB: 0 },
      { a: danny, b: rudy, framesA: 2, framesB: 0 },
      { a: geert, b: rudy, framesA: 2, framesB: 0 },
    ],
    tiebreak: [danny, tom],
    breaks: [
      { player: danny, value: 42 },
      { player: geert, value: 33 },
      { player: tom, value: 30 },
    ],
  },

  // ── Toernooi 3 ──────────────────────────────────────────────────────────────
  {
    playDayId: "2026-07-15",
    players: [
      { id: marco, name: "Marco Vitali" },
      { id: bart, name: "Bart Peeters" },
      { id: koen, name: "Koen Maes" },
      { id: wim, name: "Wim Claes" },
      { id: chris, name: "Chris Aerts" },
    ],
    // 5 players -> 2 frames per match.
    matches: [
      { a: marco, b: bart, framesA: 2, framesB: 0 },
      { a: marco, b: koen, framesA: 2, framesB: 0 },
      { a: marco, b: wim, framesA: 2, framesB: 0 },
      { a: marco, b: chris, framesA: 2, framesB: 0 },
      { a: bart, b: koen, framesA: 2, framesB: 0 },
      { a: bart, b: wim, framesA: 2, framesB: 0 },
      { a: bart, b: chris, framesA: 2, framesB: 0 },
      { a: koen, b: wim, framesA: 2, framesB: 0 },
      { a: koen, b: chris, framesA: 2, framesB: 0 },
      { a: wim, b: chris, framesA: 0, framesB: 2 },
    ],
    breaks: [
      { player: marco, value: 55 },
      { player: bart, value: 40 },
      { player: marco, value: 31 },
    ],
  },
  {
    playDayId: "2026-07-17",
    players: [
      { id: andy, name: "Andy Vleugels" },
      { id: eddy, name: "Eddy Ritzen" },
      { id: luc, name: "Luc Vermeulen" },
      { id: jef, name: "Jef Mertens" },
      { id: dirk, name: "Dirk Segers" },
      { id: patrick, name: "Patrick Goossens" },
    ],
    // 6 players -> 1 frame per match.
    matches: [
      { a: andy, b: eddy, framesA: 1, framesB: 0 },
      { a: andy, b: luc, framesA: 1, framesB: 0 },
      { a: andy, b: jef, framesA: 1, framesB: 0 },
      { a: andy, b: dirk, framesA: 1, framesB: 0 },
      { a: andy, b: patrick, framesA: 1, framesB: 0 },
      { a: eddy, b: luc, framesA: 1, framesB: 0 },
      { a: eddy, b: jef, framesA: 1, framesB: 0 },
      { a: eddy, b: dirk, framesA: 1, framesB: 0 },
      { a: eddy, b: patrick, framesA: 1, framesB: 0 },
      { a: luc, b: jef, framesA: 0, framesB: 1 },
      { a: luc, b: dirk, framesA: 1, framesB: 0 },
      { a: luc, b: patrick, framesA: 1, framesB: 0 },
      { a: jef, b: dirk, framesA: 1, framesB: 0 },
      { a: jef, b: patrick, framesA: 1, framesB: 0 },
      { a: dirk, b: patrick, framesA: 1, framesB: 0 },
    ],
    breaks: [
      { player: andy, value: 47 },
      { player: jef, value: 36 },
      { player: eddy, value: 33 },
    ],
  },

  // ── Toernooi 4 ──────────────────────────────────────────────────────────────
  {
    playDayId: "2026-07-29",
    players: [
      { id: tom, name: "Tom Janssens" },
      { id: danny, name: "Danny Moors" },
      { id: marco, name: "Marco Vitali" },
      { id: geert, name: "Geert Willems" },
      { id: bart, name: "Bart Peeters" },
      { id: ronnie, name: "Ronnie De Reydt" },
      { id: jef, name: "Jef Mertens" },
    ],
    // 7 players -> 1 frame per match.
    matches: [
      { a: tom, b: danny, framesA: 1, framesB: 0 },
      { a: tom, b: marco, framesA: 1, framesB: 0 },
      { a: tom, b: geert, framesA: 1, framesB: 0 },
      { a: tom, b: bart, framesA: 1, framesB: 0 },
      { a: tom, b: ronnie, framesA: 1, framesB: 0 },
      { a: tom, b: jef, framesA: 1, framesB: 0 },
      { a: danny, b: marco, framesA: 1, framesB: 0 },
      { a: danny, b: geert, framesA: 1, framesB: 0 },
      { a: danny, b: bart, framesA: 1, framesB: 0 },
      { a: danny, b: ronnie, framesA: 1, framesB: 0 },
      { a: danny, b: jef, framesA: 1, framesB: 0 },
      { a: marco, b: geert, framesA: 1, framesB: 0 },
      { a: marco, b: bart, framesA: 1, framesB: 0 },
      { a: marco, b: ronnie, framesA: 1, framesB: 0 },
      { a: marco, b: jef, framesA: 1, framesB: 0 },
      { a: geert, b: bart, framesA: 1, framesB: 0 },
      { a: geert, b: ronnie, framesA: 1, framesB: 0 },
      { a: geert, b: jef, framesA: 1, framesB: 0 },
      { a: bart, b: ronnie, framesA: 1, framesB: 0 },
      { a: bart, b: jef, framesA: 1, framesB: 0 },
      { a: ronnie, b: jef, framesA: 1, framesB: 0 },
    ],
    breaks: [
      { player: tom, value: 58 },
      { player: danny, value: 44 },
      { player: marco, value: 39 },
      { player: geert, value: 32 },
    ],
  },
  {
    playDayId: "2026-07-31",
    players: [
      { id: koen, name: "Koen Maes" },
      { id: wim, name: "Wim Claes" },
      { id: luc, name: "Luc Vermeulen" },
      { id: rudy, name: "Rudy Wouters" },
      { id: dirk, name: "Dirk Segers" },
    ],
    // 5 players -> 2 frames per match.
    matches: [
      { a: koen, b: wim, framesA: 2, framesB: 0 },
      { a: koen, b: luc, framesA: 2, framesB: 0 },
      { a: koen, b: rudy, framesA: 2, framesB: 0 },
      { a: koen, b: dirk, framesA: 2, framesB: 0 },
      { a: wim, b: luc, framesA: 0, framesB: 2 },
      { a: wim, b: rudy, framesA: 2, framesB: 0 },
      { a: wim, b: dirk, framesA: 0, framesB: 2 },
      { a: luc, b: rudy, framesA: 2, framesB: 0 },
      { a: luc, b: dirk, framesA: 2, framesB: 0 },
      { a: rudy, b: dirk, framesA: 0, framesB: 2 },
    ],
    breaks: [
      { player: koen, value: 50 },
      { player: luc, value: 37 },
      { player: dirk, value: 31 },
    ],
  },
];
