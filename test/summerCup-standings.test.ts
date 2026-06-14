import { describe, expect, it } from "vitest";
import { resolveMatch, buildResultsGrid, computeDayStandings, computeSummerRanking } from "../shared/summerCup/standings";
import { playDayResults } from "../shared/data/summerCupResults";

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

describe("computeSummerRanking (best result per tournament)", () => {
  const ranking = computeSummerRanking(playDayResults);
  const row = (name: string) => ranking.find((r) => r.player.name === name)!;

  it("keeps only a two-day player's best day of the tournament", () => {
    // Marco: Wed 7 vs Fri 5 -> Wed kept. Danny: Wed 5 vs Fri 11 -> Fri kept.
    expect(row("Marco Vitali").totalPoints).toBe(7);
    expect(row("Danny Moors").totalPoints).toBe(11);
    expect(row("Marco Vitali").playDaysCounted).toBe(1);
    expect(row("Danny Moors").playDaysCounted).toBe(1);
  });

  it("ranks single-day players on their only result", () => {
    expect(row("Andy Vleugels").totalPoints).toBe(8);
    expect(row("Tom Janssens").totalPoints).toBe(10);
    expect(row("Geert Willems").totalPoints).toBe(3);
  });

  it("produces the full ordered ranking", () => {
    expect(ranking.map((r) => [r.position, r.player.name, r.totalPoints])).toEqual([
      [1, "Danny Moors", 11],
      [2, "Tom Janssens", 10],
      [3, "Andy Vleugels", 8],
      [4, "Bart Peeters", 8],
      [5, "Marco Vitali", 7],
      [6, "Koen Maes", 7],
      [7, "Wim Claes", 6],
      [8, "Ronnie De Reydt", 4],
      [9, "Luc Vermeulen", 4],
      [10, "Eddy Ritzen", 3],
      [11, "Geert Willems", 3],
    ]);
  });
});
