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

// Results data for the 2026 edition (up to MAX_PER_PLAY_DAY = 8 players per play day).
const andy = "andy-vleugels"; // Andy Vleugels
const danny = "danny-moors"; // Danny Moors
const eddy = "eddy-ritzen"; // Eddy Ritzen
const ibe = "ibe-sijben"; // Ibe Sijben
const jp = "jean-pierre-van-camp" // Jean-Pierre Van Camp
const klaas = "klaas-piekarczyk"; // Klaas Piekarczyk
const koen = "koen-caerts"; // Koen Caerts
const kurt = "kurt-belien"; // Kurt Beliën
const marc = "marc-de-l-arbre"; // Marc De l'Arbre
const marco = "marco-vitali"; // Marco Vitali
const nico = "nico-hoffmann" // Nico Hoffmann
const roman = "roman-szpyt"; // Roman Szpyt
const ronnie = "ronnie-de-reydt"; // Ronnie De Reydt
const steff = "steff-beckers"; // Steff Beckers
const thomas = "thomas-belmans"; // Thomas Belmans

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
  // ── Toernooi 1 — vrijdag 19 juni 2026 ────────────────────────────────────────
  {
    playDayId: "2026-06-19",
    players: [
      { id: nico, name: "Nico Hoffmann" },
      { id: kurt, name: "Kurt Beliën" },
      { id: danny, name: "Danny Moors" },
      { id: andy, name: "Andy Vleugels" },
      { id: thomas, name: "Thomas Belmans" },
    ],
    // 5 players -> 2 frames per match, recorded as frames won (2-0 / 1-1 / 0-2).
    // Andy and Nico finish level on frames (5); Andy beat Nico 2-0 head-to-head,
    // so he takes 2nd (matching the organiser's corrected order on the card).
    matches: [
      { a: nico, b: kurt, framesA: 2, framesB: 0 },
      { a: nico, b: danny, framesA: 2, framesB: 0 },
      { a: nico, b: andy, framesA: 0, framesB: 2 },
      { a: nico, b: thomas, framesA: 1, framesB: 1 },
      { a: kurt, b: danny, framesA: 0, framesB: 2 },
      { a: kurt, b: andy, framesA: 0, framesB: 2 },
      { a: kurt, b: thomas, framesA: 1, framesB: 1 },
      { a: danny, b: andy, framesA: 1, framesB: 1 },
      { a: danny, b: thomas, framesA: 0, framesB: 2 },
      { a: andy, b: thomas, framesA: 0, framesB: 2 },
    ],
  },
  // ── Toernooi 2 — vrijdag 3 juli 2026 ─────────────────────────────────────────
  {
    playDayId: "2026-07-03",
    players: [
      { id: andy, name: "Andy Vleugels" },
      { id: danny, name: "Danny Moors" },
      { id: eddy, name: "Eddy Ritzen" },
      { id: ibe, name: "Ibe Sijben" },
      { id: klaas, name: "Klaas Piekarczyk" },
      { id: roman, name: "Roman Szpyt" },
      { id: steff, name: "Steff Beckers" },
      { id: nico, name: "Nico Hoffmann" },
    ],
    // 8 players -> 1 frame per match, recorded as frames won (1-0 / 0-1). Danny and
    // Eddy top on 6 wins; a 4-way tie on 3 (Andy, Ibe, Roman, Steff) was settled by
    // a play-off. Head-to-head already lifts Andy/Ibe above Steff/Roman; `tiebreak`
    // forces Steff above Roman (their direct head-to-head) to match the card's order.
    matches: [
      { a: andy, b: danny, framesA: 0, framesB: 1 },
      { a: andy, b: eddy, framesA: 0, framesB: 1 },
      { a: andy, b: ibe, framesA: 1, framesB: 0 },
      { a: andy, b: klaas, framesA: 1, framesB: 0 },
      { a: andy, b: roman, framesA: 0, framesB: 1 },
      { a: andy, b: steff, framesA: 1, framesB: 0 },
      { a: andy, b: nico, framesA: 0, framesB: 1 },
      { a: danny, b: eddy, framesA: 1, framesB: 0 },
      { a: danny, b: ibe, framesA: 1, framesB: 0 },
      { a: danny, b: klaas, framesA: 1, framesB: 0 },
      { a: danny, b: roman, framesA: 1, framesB: 0 },
      { a: danny, b: steff, framesA: 0, framesB: 1 },
      { a: danny, b: nico, framesA: 1, framesB: 0 },
      { a: eddy, b: ibe, framesA: 1, framesB: 0 },
      { a: eddy, b: klaas, framesA: 1, framesB: 0 },
      { a: eddy, b: roman, framesA: 1, framesB: 0 },
      { a: eddy, b: steff, framesA: 1, framesB: 0 },
      { a: eddy, b: nico, framesA: 1, framesB: 0 },
      { a: ibe, b: klaas, framesA: 0, framesB: 1 },
      { a: ibe, b: roman, framesA: 1, framesB: 0 },
      { a: ibe, b: steff, framesA: 1, framesB: 0 },
      { a: ibe, b: nico, framesA: 1, framesB: 0 },
      { a: klaas, b: roman, framesA: 0, framesB: 1 },
      { a: klaas, b: steff, framesA: 0, framesB: 1 },
      { a: klaas, b: nico, framesA: 1, framesB: 0 },
      { a: roman, b: steff, framesA: 0, framesB: 1 },
      { a: roman, b: nico, framesA: 1, framesB: 0 },
      { a: steff, b: nico, framesA: 0, framesB: 1 },
    ],
    tiebreak: [andy, ibe, steff, roman],
  },
  // ── Toernooi 3 — woensdag 15 juli 2026 ───────────────────────────────────────
  {
    playDayId: "2026-07-15",
    players: [
      { id: eddy, name: "Eddy Ritzen" },
      { id: roman, name: "Roman Szpyt" },
      { id: steff, name: "Steff Beckers" },
      { id: marco, name: "Marco Vitali" },
      { id: andy, name: "Andy Vleugels" },
      { id: jp, name: "Jean-Pierre Van Camp" },
      { id: klaas, name: "Klaas Piekarczyk" },
      { id: ibe, name: "Ibe Sijben" },
    ],
    // 8 players -> 1 frame per match, recorded as frames won (1-0 / 0-1). Steff tops
    // on 6 wins. Marco and Eddy tie on 5; Marco won their head-to-head, so he takes
    // 2nd. Klaas, Andy and Roman tie on 3; head-to-head separates them cleanly
    // (Klaas 2 > Andy 1 > Roman 0), matching the card's 4-5-6 order.
    matches: [
      { a: eddy, b: roman, framesA: 1, framesB: 0 },
      { a: eddy, b: steff, framesA: 0, framesB: 1 },
      { a: eddy, b: marco, framesA: 0, framesB: 1 },
      { a: eddy, b: andy, framesA: 1, framesB: 0 },
      { a: eddy, b: jp, framesA: 1, framesB: 0 },
      { a: eddy, b: klaas, framesA: 1, framesB: 0 },
      { a: eddy, b: ibe, framesA: 1, framesB: 0 },
      { a: roman, b: steff, framesA: 0, framesB: 1 },
      { a: roman, b: marco, framesA: 1, framesB: 0 },
      { a: roman, b: andy, framesA: 0, framesB: 1 },
      { a: roman, b: jp, framesA: 1, framesB: 0 },
      { a: roman, b: klaas, framesA: 0, framesB: 1 },
      { a: roman, b: ibe, framesA: 1, framesB: 0 },
      { a: steff, b: marco, framesA: 1, framesB: 0 },
      { a: steff, b: andy, framesA: 1, framesB: 0 },
      { a: steff, b: jp, framesA: 0, framesB: 1 },
      { a: steff, b: klaas, framesA: 1, framesB: 0 },
      { a: steff, b: ibe, framesA: 1, framesB: 0 },
      { a: marco, b: andy, framesA: 1, framesB: 0 },
      { a: marco, b: jp, framesA: 1, framesB: 0 },
      { a: marco, b: klaas, framesA: 1, framesB: 0 },
      { a: marco, b: ibe, framesA: 1, framesB: 0 },
      { a: andy, b: jp, framesA: 1, framesB: 0 },
      { a: andy, b: klaas, framesA: 0, framesB: 1 },
      { a: andy, b: ibe, framesA: 1, framesB: 0 },
      { a: jp, b: klaas, framesA: 1, framesB: 0 },
      { a: jp, b: ibe, framesA: 0, framesB: 1 },
      { a: klaas, b: ibe, framesA: 1, framesB: 0 },
    ],
  },
  // ── Toernooi 3 — vrijdag 17 juli 2026 ────────────────────────────────────────
  {
    playDayId: "2026-07-17",
    players: [
      { id: koen, name: "Koen Caerts" },
      { id: kurt, name: "Kurt Beliën" },
      { id: eddy, name: "Eddy Ritzen" },
      { id: nico, name: "Nico Hoffmann" },
      { id: jp, name: "Jean-Pierre Van Camp" },
      { id: klaas, name: "Klaas Piekarczyk" },
      { id: ibe, name: "Ibe Sijben" },
      { id: danny, name: "Danny Moors" },
    ],
    // 8 players -> 1 frame per match, recorded as frames won (1-0 / 0-1). Danny wins
    // all 7 frames. Koen and Klaas tie on 3; Klaas won their head-to-head, so he
    // takes 4th. Kurt, Nico and Ibe tie on 2 with a circular head-to-head (Kurt beat
    // Ibe, Nico beat Kurt, Ibe beat Nico); `tiebreak` fixes the card's 6-7-8 order.
    matches: [
      { a: koen, b: kurt, framesA: 1, framesB: 0 },
      { a: koen, b: eddy, framesA: 1, framesB: 0 },
      { a: koen, b: nico, framesA: 0, framesB: 1 },
      { a: koen, b: jp, framesA: 0, framesB: 1 },
      { a: koen, b: klaas, framesA: 0, framesB: 1 },
      { a: koen, b: ibe, framesA: 1, framesB: 0 },
      { a: koen, b: danny, framesA: 0, framesB: 1 },
      { a: kurt, b: eddy, framesA: 0, framesB: 1 },
      { a: kurt, b: nico, framesA: 0, framesB: 1 },
      { a: kurt, b: jp, framesA: 0, framesB: 1 },
      { a: kurt, b: klaas, framesA: 1, framesB: 0 },
      { a: kurt, b: ibe, framesA: 1, framesB: 0 },
      { a: kurt, b: danny, framesA: 0, framesB: 1 },
      { a: eddy, b: nico, framesA: 1, framesB: 0 },
      { a: eddy, b: jp, framesA: 1, framesB: 0 },
      { a: eddy, b: klaas, framesA: 1, framesB: 0 },
      { a: eddy, b: ibe, framesA: 1, framesB: 0 },
      { a: eddy, b: danny, framesA: 0, framesB: 1 },
      { a: nico, b: jp, framesA: 0, framesB: 1 },
      { a: nico, b: klaas, framesA: 0, framesB: 1 },
      { a: nico, b: ibe, framesA: 0, framesB: 1 },
      { a: nico, b: danny, framesA: 0, framesB: 1 },
      { a: jp, b: klaas, framesA: 1, framesB: 0 },
      { a: jp, b: ibe, framesA: 0, framesB: 1 },
      { a: jp, b: danny, framesA: 0, framesB: 1 },
      { a: klaas, b: ibe, framesA: 1, framesB: 0 },
      { a: klaas, b: danny, framesA: 0, framesB: 1 },
      { a: ibe, b: danny, framesA: 0, framesB: 1 },
    ],
    tiebreak: [kurt, nico, ibe],
  },
];
