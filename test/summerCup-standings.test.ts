import { describe, expect, it } from "vitest";
import { resolveMatch, buildResultsGrid, computeDayStandings, computeSummerRanking } from "../shared/summerCup/standings";
import type { PlayDayResults } from "../shared/data/summerCupResults";

// Frozen fixture: a self-contained copy of the original synthetic roster/results.
// These tests assert exact frame counts, points and the 16-player total, so they
// must NOT read shared/data/summerCupResults.ts — once real tournament results
// replace that file the numbers below would no longer match. The playDayIds match
// the real schedule in shared/data/summerCup.ts so getPlayDay() still resolves the
// tournament grouping used by computeSummerRanking.
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

const playDayResults: PlayDayResults[] = [
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

const day17 = playDayResults.find((d) => d.playDayId === "2026-06-17")!;
const day19 = playDayResults.find((d) => d.playDayId === "2026-06-19")!;

describe("resolveMatch", () => {
  it("returns the winner of a decisive frames-won result", () => {
    expect(resolveMatch({ a: "x", b: "y", framesA: 2, framesB: 0 })).toEqual({
      framesA: 2,
      framesB: 0,
      winnerId: "x",
    });
  });

  it("treats a 1-1 as a draw with no winner", () => {
    expect(resolveMatch({ a: "x", b: "y", framesA: 1, framesB: 1 })).toEqual({
      framesA: 1,
      framesB: 1,
      winnerId: null,
    });
  });

  it("handles a single-frame 0-1 result", () => {
    expect(resolveMatch({ a: "x", b: "y", framesA: 0, framesB: 1 })).toEqual({
      framesA: 0,
      framesB: 1,
      winnerId: "y",
    });
  });
});

describe("buildResultsGrid (2026-06-17)", () => {
  it("reproduces the 2-frame matrix (cell = frames row won vs col)", () => {
    expect(buildResultsGrid(day17)).toEqual([
      [null, 0, 2, 2, 2],
      [2, null, 2, 0, 2],
      [0, 0, null, 1, 0],
      [0, 2, 1, null, 0],
      [0, 0, 2, 2, null],
    ]);
  });
});

describe("computeDayStandings (2026-06-17)", () => {
  const standings = computeDayStandings(day17);
  const byName = (name: string) => standings.find((s) => s.player.name === name)!;

  it("orders by frames won then head-to-head", () => {
    expect(standings.map((s) => s.player.name)).toEqual([
      "Andy Vleugels",
      "Marco Vitali",
      "Danny Moors",
      "Ronnie De Reydt",
      "Eddy Ritzen",
    ]);
  });

  it("counts frames and matches won, with a 1-1 draw winning neither a match", () => {
    expect(byName("Andy Vleugels").framesWon).toBe(6);
    expect(byName("Andy Vleugels").matchesWon).toBe(3);
    expect(byName("Marco Vitali").framesWon).toBe(6);
    expect(byName("Danny Moors").framesWon).toBe(4);
    expect(byName("Ronnie De Reydt").framesWon).toBe(3);
    // Eddy drew Ronnie 1-1 and lost the rest: 1 frame, 0 matches won.
    expect(byName("Eddy Ritzen").framesWon).toBe(1);
    expect(byName("Eddy Ritzen").matchesWon).toBe(0);
  });

  it("awards participation, ranking and bonus points", () => {
    const andy = byName("Andy Vleugels");
    expect(andy.participationPoints).toBe(2);
    expect(andy.rankingPoints).toBe(5);
    expect(andy.bonusPoints).toBe(1);
    expect(andy.totalPoints).toBe(8);

    expect(byName("Marco Vitali").totalPoints).toBe(7);
    expect(byName("Danny Moors").totalPoints).toBe(5);
    expect(byName("Ronnie De Reydt").totalPoints).toBe(4);
    expect(byName("Eddy Ritzen").totalPoints).toBe(3);
  });

  it("gives the bonus point only to the top 2 positions", () => {
    expect(
      standings.filter((s) => s.bonusPoints === 1).map((s) => s.position)
    ).toEqual([1, 2]);
  });
});

describe("computeDayStandings (2026-06-19, 8 players)", () => {
  it("orders 8 players by wins with 1-frame matches and correct points", () => {
    const standings = computeDayStandings(day19);
    expect(standings.map((s) => [s.position, s.player.name, s.framesWon, s.totalPoints])).toEqual([
      [1, "Danny Moors", 7, 11],
      [2, "Tom Janssens", 6, 10],
      [3, "Bart Peeters", 5, 8],
      [4, "Koen Maes", 4, 7],
      [5, "Wim Claes", 3, 6],
      [6, "Marco Vitali", 2, 5],
      [7, "Luc Vermeulen", 1, 4],
      [8, "Geert Willems", 0, 3],
    ]);
  });
});

describe("computeSummerRanking (best 3 results, participation every day)", () => {
  const ranking = computeSummerRanking(playDayResults);
  const row = (name: string) => ranking.find((r) => r.player.name === name)!;

  it("awards participation for every day played, including both days of a tournament", () => {
    // Marco played both days of tournament 1 plus T2, T3, T4 = 5 days.
    expect(row("Marco Vitali").playDaysPlayed).toBe(5);
    // Danny played both T1 days plus T2 Fri and T4 Wed = 4 days.
    expect(row("Danny Moors").playDaysPlayed).toBe(4);
    expect(row("Tom Janssens").playDaysPlayed).toBe(4);
    expect(row("Andy Vleugels").playDaysPlayed).toBe(3);
  });

  it("counts only the best 3 tournament results toward the points total", () => {
    // Marco: 5 days -> 10 participation. Per-tournament best competitive points
    // [T1 5, T2 6, T3 6, T4 5]; best 3 = 6+6+5 = 17 (the weakest is dropped).
    expect(row("Marco Vitali").totalPoints).toBe(27);
    // Danny: 8 participation + best-3 competitive (9+7+5) = 29.
    expect(row("Danny Moors").totalPoints).toBe(29);
    expect(row("Tom Janssens").totalPoints).toBe(31);
    expect(row("Andy Vleugels").totalPoints).toBe(23);
  });

  it("ranks the leaders by total points", () => {
    expect(ranking.slice(0, 4).map((r) => [r.position, r.player.name, r.totalPoints])).toEqual([
      [1, "Tom Janssens", 31],
      [2, "Danny Moors", 29],
      [3, "Marco Vitali", 27],
      [4, "Andy Vleugels", 23],
    ]);
  });

  it("includes every player who scored", () => {
    expect(ranking).toHaveLength(16);
  });
});
