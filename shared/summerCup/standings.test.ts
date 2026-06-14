import { describe, expect, it } from "vitest";
import { resolveMatch } from "./standings";

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
