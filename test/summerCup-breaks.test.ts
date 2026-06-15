import { describe, expect, it } from "vitest";
import { computeDayBreaks, computeBreaksRanking } from "../shared/summerCup/breaks";
import type { PlayDayResults } from "../shared/data/summerCupResults";

const anna = { id: "anna", name: "Anna" };
const bob = { id: "bob", name: "Bob" };
const cas = { id: "cas", name: "Cas" };

function day(id: string, players: { id: string; name: string }[], breaks: { player: string; value: number }[]): PlayDayResults {
  return { playDayId: id, players, matches: [], breaks };
}

describe("computeDayBreaks", () => {
  it("groups a player's breaks descending and orders players by highest break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 38 },
        { player: "bob", value: 47 },
        { player: "anna", value: 52 },
      ]),
    );
    expect(result).toEqual([
      { player: anna, breaks: [52, 38], highest: 52 },
      { player: bob, breaks: [47], highest: 47 },
    ]);
  });

  it("orders equal-highest players by the next-highest break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 52 },
        { player: "anna", value: 38 },
        { player: "bob", value: 52 },
        { player: "bob", value: 31 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("ranks a longer break list above a shorter one when compared values are equal", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 52 },
        { player: "anna", value: 38 },
        { player: "bob", value: 52 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("breaks remaining ties alphabetically by player name", () => {
    const result = computeDayBreaks(
      day("d1", [bob, anna], [
        { player: "bob", value: 40 },
        { player: "anna", value: 40 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("ignores breaks below 30 and excludes players with no 30+ break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 29 },
        { player: "bob", value: 30 },
      ]),
    );
    expect(result).toEqual([{ player: bob, breaks: [30], highest: 30 }]);
  });

  it("returns an empty array when the day has no breaks", () => {
    expect(computeDayBreaks({ playDayId: "d1", players: [anna], matches: [] })).toEqual([]);
  });
});

describe("computeBreaksRanking", () => {
  it("aggregates a player's breaks across all play days, including a day that would be discarded for points", () => {
    const days = [
      day("d1", [anna, bob], [{ player: "anna", value: 52 }, { player: "bob", value: 33 }]),
      // anna plays a second day of the same tournament; for points only one day counts,
      // but every break must still be counted here.
      day("d2", [anna, cas], [{ player: "anna", value: 60 }, { player: "cas", value: 45 }]),
    ];
    const result = computeBreaksRanking(days);
    expect(result).toEqual([
      { player: anna, breaks: [60, 52], highest: 60 },
      { player: cas, breaks: [45], highest: 45 },
      { player: bob, breaks: [33], highest: 33 },
    ]);
  });

  it("returns an empty array when there are no breaks anywhere", () => {
    const days = [day("d1", [anna], []), { playDayId: "d2", players: [bob], matches: [] }];
    expect(computeBreaksRanking(days)).toEqual([]);
  });
});
