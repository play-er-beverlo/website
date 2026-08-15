import { describe, expect, it } from "vitest";
import { finaleDay } from "../shared/data/summerCup";
import { finaleBreakSource, finaleDayResults } from "../shared/data/summerCupFinale";
import { playDayResults } from "../shared/data/summerCupResults";
import { computeBreaksRanking } from "../shared/summerCup/breaks";
import { buildResultsGrid, computeSummerRanking } from "../shared/summerCup/standings";
import { computeSeasonFacts } from "../shared/summerCup/stats";

/** Frames won per player id inside a poule. */
function pouleFrames(poule: (typeof finaleDayResults.poules)[number]) {
  const grid = buildResultsGrid(poule);
  return new Map(
    poule.players.map((player, i) => [
      player.id,
      (grid[i] ?? []).reduce<number>((sum, cell) => sum + (cell ?? 0), 0),
    ])
  );
}

describe("finale day data", () => {
  it("is dated on the finale day and not among the play days", () => {
    expect(finaleDayResults.id).toBe(finaleDay.id);
    expect(playDayResults.find((d) => d.playDayId === finaleDay.id)).toBeUndefined();
  });

  it("has two poules of four with a complete round robin", () => {
    expect(finaleDayResults.poules).toHaveLength(2);
    for (const poule of finaleDayResults.poules) {
      expect(poule.players).toHaveLength(4);
      expect(poule.matches).toHaveLength(6);
      const pairs = new Set(poule.matches.map((m) => [m.a, m.b].sort().join("|")));
      expect(pairs.size).toBe(6);
      const ids = new Set(poule.players.map((p) => p.id));
      for (const match of poule.matches) {
        expect(ids.has(match.a)).toBe(true);
        expect(ids.has(match.b)).toBe(true);
        // 4 players still played a single frame per match on the finale day.
        expect(match.framesA + match.framesB).toBe(1);
      }
    }
  });

  it("qualifies the two poule players with the most frames", () => {
    for (const poule of finaleDayResults.poules) {
      const frames = pouleFrames(poule);
      const top2 = [...frames.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 2)
        .map(([id]) => id);
      expect(poule.qualified).toEqual(top2);
    }
  });

  it("records the poule results from the score cards", () => {
    const [poule1, poule2] = finaleDayResults.poules;
    expect([...pouleFrames(poule1!).values()]).toEqual([1, 2, 3, 0]); // Eddy, Andy, Marco, Klaas
    expect([...pouleFrames(poule2!).values()]).toEqual([2, 3, 0, 1]); // Steff, Danny, Roman, Ibe
  });

  it("only lets qualified players play the knockout rounds", () => {
    const qualified = new Set(finaleDayResults.poules.flatMap((p) => p.qualified));
    for (const round of finaleDayResults.rounds) {
      for (const tie of round.ties) {
        expect(qualified.has(tie.a.id)).toBe(true);
        expect(qualified.has(tie.b.id)).toBe(true);
        expect(tie.framesA).not.toBe(tie.framesB); // every tie has a winner
      }
    }
  });

  it("classifies every participant exactly once", () => {
    const ranked = finaleDayResults.finalRanking.map((p) => p.id);
    const played = finaleDayResults.poules.flatMap((p) => p.players.map((x) => x.id));
    expect(ranked).toHaveLength(8);
    expect([...ranked].sort()).toEqual([...played].sort());
  });

  it("takes places 1 to 4 from the finale and the troostfinale", () => {
    const decided = (roundName: string) => {
      const tie = finaleDayResults.rounds.find((r) => r.name === roundName)?.ties[0]!;
      return tie.framesA > tie.framesB ? [tie.a, tie.b] : [tie.b, tie.a];
    };

    expect(finaleDayResults.finalRanking.slice(0, 4).map((p) => p.name)).toEqual(
      [...decided("Finale"), ...decided("Troostfinale")].map((p) => p.name)
    );
    expect(finaleDayResults.finalRanking.slice(0, 4).map((p) => p.name)).toEqual([
      "Danny Moors",
      "Steff Beckers",
      "Marco Vitali",
      "Andy Vleugels",
    ]);
  });

  it("takes places 5 to 8 from the poule exits, most frames first", () => {
    const frames = new Map(
      finaleDayResults.poules.flatMap((poule) => [...pouleFrames(poule).entries()])
    );
    const exits = finaleDayResults.finalRanking.slice(4);
    const qualified = new Set(finaleDayResults.poules.flatMap((p) => p.qualified));

    for (const player of exits) expect(qualified.has(player.id)).toBe(false);
    // Both poule thirds (1 frame) rank above both poule fourths (0 frames); the pairs
    // themselves finished level across the poules, so only the order stored in the
    // data separates them.
    expect(exits.map((p) => frames.get(p.id))).toEqual([1, 1, 0, 0]);
    expect(exits.map((p) => p.name)).toEqual([
      "Eddy Ritzen",
      "Ibe Sijben",
      "Roman Szpyt",
      "Klaas Piekarczyk",
    ]);
  });
});

describe("finale break source", () => {
  it("carries every finale player and no matches", () => {
    expect(finaleBreakSource.matches).toEqual([]);
    expect(finaleBreakSource.players).toHaveLength(8);
    const ids = new Set(finaleBreakSource.players.map((p) => p.id));
    expect(ids.size).toBe(8);
    for (const b of finaleDayResults.breaks) expect(ids.has(b.player)).toBe(true);
  });

  it("uses the same player ids as the regular play days", () => {
    const known = new Set(playDayResults.flatMap((d) => d.players.map((p) => p.id)));
    for (const player of finaleBreakSource.players) {
      expect(known.has(player.id)).toBe(true);
    }
  });

  it("does not feed the SummER Ranking", () => {
    // Participation points come from the registrable play days only; a finale day that
    // leaked into the ranking would hand its 8 players an extra day (and 2 points).
    const daysPlayed = new Map(
      computeSummerRanking(playDayResults).map((row) => [row.player.id, row.playDaysPlayed])
    );
    for (const player of finaleBreakSource.players) {
      const played = playDayResults.filter((day) =>
        day.players.some((p) => p.id === player.id)
      ).length;
      expect(daysPlayed.get(player.id)).toBe(played);
    }
  });

  it("adds the finale breaks to the breaks ranking", () => {
    const ranking = computeBreaksRanking([...playDayResults, finaleBreakSource]);
    expect(ranking.slice(0, 3).map((r) => [r.player.name, r.breaks])).toEqual([
      ["Steff Beckers", [35]],
      ["Andy Vleugels", [32]],
      ["Marco Vitali", [32]],
    ]);
  });

  it("counts the finale breaks in the season facts without adding frames or players", () => {
    const base = computeSeasonFacts(playDayResults);
    const facts = computeSeasonFacts([...playDayResults, finaleBreakSource]);
    expect(facts.totalFrames).toBe(base.totalFrames);
    expect(facts.totalMatches).toBe(base.totalMatches);
    expect(facts.uniquePlayers).toBe(base.uniquePlayers);
    expect(facts.drawCount).toBe(base.drawCount);
    expect(facts.breaksCount).toBe(base.breaksCount + 2);
    expect(facts.highestBreak).toEqual({
      player: { id: "steff-beckers", name: "Steff Beckers" },
      value: 35,
    });
  });
});
