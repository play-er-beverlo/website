import { describe, expect, it } from "vitest";
import { resolveMatch, buildResultsGrid, computeDayStandings, computeSummerRanking } from "../shared/summerCup/standings";
import { playDayResults } from "../shared/data/summerCupResults";

const day17 = playDayResults.find((d) => d.playDayId === "2026-06-17")!;
const day19 = playDayResults.find((d) => d.playDayId === "2026-06-19")!;

describe("resolveMatch", () => {
  it("derives the frame winner from point scores", () => {
    expect(resolveMatch({ a: "x", b: "y", frames: [{ a: 45, b: 57 }] })).toEqual({
      framesA: 0,
      framesB: 1,
      winnerId: "y",
    });
  });

  it("counts frames won across multiple frames and leaves a 1-1 undecided", () => {
    expect(
      resolveMatch({ a: "x", b: "y", frames: [{ a: 60, b: 40 }, { a: 30, b: 70 }] })
    ).toEqual({ framesA: 1, framesB: 1, winnerId: null });
  });

  it("treats a winner-only match as a single decisive frame", () => {
    expect(resolveMatch({ a: "x", b: "y", winner: "a" })).toEqual({
      framesA: 1,
      framesB: 0,
      winnerId: "x",
    });
  });
});

describe("buildResultsGrid (2026-06-17)", () => {
  it("reproduces the screenshot matrix (cell = frames row won vs col)", () => {
    expect(buildResultsGrid(day17)).toEqual([
      [null, 0, 1, 1, 1],
      [1, null, 1, 0, 1],
      [0, 0, null, 1, 0],
      [0, 1, 0, null, 0],
      [0, 0, 1, 1, null],
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
      "Eddy Ritzen",
      "Ronnie De Reydt",
    ]);
  });

  it("counts frames and matches won", () => {
    expect(byName("Andy Vleugels").framesWon).toBe(3);
    expect(byName("Andy Vleugels").matchesWon).toBe(3);
    expect(byName("Danny Moors").framesWon).toBe(2);
    expect(byName("Ronnie De Reydt").matchesWon).toBe(1);
  });

  it("awards participation, ranking and bonus points", () => {
    const andy = byName("Andy Vleugels");
    expect(andy.participationPoints).toBe(2);
    expect(andy.rankingPoints).toBe(5);
    expect(andy.bonusPoints).toBe(1);
    expect(andy.totalPoints).toBe(8);

    expect(byName("Marco Vitali").totalPoints).toBe(7);
    expect(byName("Danny Moors").totalPoints).toBe(5);
    expect(byName("Eddy Ritzen").totalPoints).toBe(4);
    expect(byName("Ronnie De Reydt").totalPoints).toBe(3);
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
      [8, "Eddy Ritzen", 4],
      [9, "Luc Vermeulen", 4],
      [10, "Ronnie De Reydt", 3],
      [11, "Geert Willems", 3],
    ]);
  });
});
