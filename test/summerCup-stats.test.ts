import { describe, expect, it } from "vitest";
import { computePlayerStats, computeSeasonFacts } from "../shared/summerCup/stats";
import type { PlayDayResults } from "../shared/data/summerCupResults";

const anna = { id: "anna", name: "Anna" };
const bob = { id: "bob", name: "Bob" };
const cas = { id: "cas", name: "Cas" };
const dre = { id: "dre", name: "Dre" };

// Dag met 3 spelers, 1 frame per match: Anna wint alles (perfecte dag).
const day1: PlayDayResults = {
  playDayId: "2026-06-17",
  players: [anna, bob, cas],
  matches: [
    { a: "anna", b: "bob", framesA: 1, framesB: 0 },
    { a: "anna", b: "cas", framesA: 1, framesB: 0 },
    { a: "bob", b: "cas", framesA: 0, framesB: 1 },
  ],
};

// Dag met 3 spelers, 2 frames per match, met een 1-1 gelijkspel.
const day2: PlayDayResults = {
  playDayId: "2026-06-19",
  players: [anna, bob, dre],
  matches: [
    { a: "anna", b: "bob", framesA: 1, framesB: 1 },
    { a: "anna", b: "dre", framesA: 0, framesB: 2 },
    { a: "bob", b: "dre", framesA: 2, framesB: 0 },
  ],
};

describe("computePlayerStats", () => {
  it("telt frames gewonnen en gespeeld over meerdere speeldagen", () => {
    const stats = computePlayerStats([day1, day2]);
    const a = stats.find((s) => s.player.id === "anna")!;
    // day1: 2 gewonnen van 2 gespeeld; day2: 1 gewonnen van 4 gespeeld.
    expect(a.framesWon).toBe(3);
    expect(a.framesPlayed).toBe(6);
    expect(a.frameWinPct).toBeCloseTo(0.5);
  });

  it("telt match-uitslagen incl. 1-1 als gelijkspel", () => {
    const stats = computePlayerStats([day2]);
    const a = stats.find((s) => s.player.id === "anna")!;
    expect(a.matchesWon).toBe(0);
    expect(a.matchesLost).toBe(1);
    expect(a.matchesDrawn).toBe(1);
  });

  it("telt dagoverwinningen, podiums en perfecte dagen via de dagstand", () => {
    const stats = computePlayerStats([day1, day2]);
    const a = stats.find((s) => s.player.id === "anna")!;
    // day1: Anna 1e (2 frames), perfecte dag; day2: bob 3 frames, dre 2, anna 1 -> anna 3e.
    expect(a.dayWins).toBe(1);
    expect(a.podiums).toBe(1);
    expect(a.perfectDays).toBe(1);
    expect(a.avgPosition).toBeCloseTo(2); // (1 + 3) / 2
    const d = stats.find((s) => s.player.id === "dre")!;
    expect(d.dayWins).toBe(0);
    expect(d.podiums).toBe(1); // 2e plaats op day2
    expect(d.perfectDays).toBe(0);
    const b = stats.find((s) => s.player.id === "bob")!;
    expect(b.dayWins).toBe(1);
    expect(b.perfectDays).toBe(0); // won niet alle matchen (1-1 tegen anna)
  });

  it("sorteert op winstpercentage, dan frames gewonnen, dan naam", () => {
    const stats = computePlayerStats([day1]);
    expect(stats.map((s) => s.player.id)).toEqual(["anna", "cas", "bob"]);
  });

  it("geeft een lege lijst zonder speeldagen", () => {
    expect(computePlayerStats([])).toEqual([]);
  });
});

describe("computeSeasonFacts", () => {
  it("telt frames, matchen, unieke spelers, breaks en gelijke spelen", () => {
    const day1WithBreaks: PlayDayResults = {
      ...day1,
      breaks: [
        { player: "anna", value: 32 },
        { player: "bob", value: 45 },
      ],
    };
    const facts = computeSeasonFacts([day1WithBreaks, day2]);
    expect(facts.totalMatches).toBe(6);
    expect(facts.totalFrames).toBe(3 + 6); // day1: 3 frames, day2: 6 frames
    expect(facts.uniquePlayers).toBe(4); // anna, bob, cas, dre
    expect(facts.breaksCount).toBe(2);
    expect(facts.highestBreak).toEqual({ player: bob, value: 45 });
    expect(facts.drawCount).toBe(1); // anna-bob 1-1 op day2
  });

  it("geeft null als hoogste break zonder breaks", () => {
    const facts = computeSeasonFacts([day1]);
    expect(facts.highestBreak).toBeNull();
    expect(facts.breaksCount).toBe(0);
  });
});
