import { describe, expect, it } from "vitest";
import { resolveMatch, buildResultsGrid, computeDayStandings } from "../shared/summerCup/standings";
import { playDayResults } from "../shared/data/summerCupResults";

const day17 = playDayResults.find((d) => d.playDayId === "2026-06-17")!

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
