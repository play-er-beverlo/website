import { describe, expect, it } from "vitest";
import { resolveMatch, buildResultsGrid } from "../shared/summerCup/standings";
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
