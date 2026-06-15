import { describe, expect, it } from "vitest";
import { playDays } from "../shared/data/summerCup";
import {
  playDayFromDateParam,
  dateParamFromPlayDayId,
  framesPerMatch,
} from "../shared/summerCup/wedstrijdblad";

describe("playDayFromDateParam", () => {
  it("resolves a DD-MM-YYYY param to its play day", () => {
    const day = playDayFromDateParam("17-06-2026");
    expect(day?.id).toBe("2026-06-17");
    expect(day?.tournament).toBe(1);
  });

  it("returns undefined for a date that is not a play day", () => {
    expect(playDayFromDateParam("01-01-2026")).toBeUndefined();
  });

  it("returns undefined for malformed input", () => {
    expect(playDayFromDateParam("2026-06-17")).toBeUndefined(); // ISO, wrong order
    expect(playDayFromDateParam("17/06/2026")).toBeUndefined(); // wrong separator
    expect(playDayFromDateParam("7-6-2026")).toBeUndefined(); // single digits
    expect(playDayFromDateParam("garbage")).toBeUndefined();
    expect(playDayFromDateParam("")).toBeUndefined();
  });
});

describe("dateParamFromPlayDayId", () => {
  it("converts an ISO play day id to a DD-MM-YYYY param", () => {
    expect(dateParamFromPlayDayId("2026-06-17")).toBe("17-06-2026");
    expect(dateParamFromPlayDayId("2026-07-31")).toBe("31-07-2026");
  });

  it("round-trips with playDayFromDateParam for every play day", () => {
    for (const day of playDays) {
      const param = dateParamFromPlayDayId(day.id);
      expect(playDayFromDateParam(param)?.id).toBe(day.id);
    }
  });
});

describe("framesPerMatch", () => {
  it("returns 2 frames for 4-5 players", () => {
    expect(framesPerMatch(4)).toBe(2);
    expect(framesPerMatch(5)).toBe(2);
  });

  it("returns 1 frame for 6-8 players", () => {
    expect(framesPerMatch(6)).toBe(1);
    expect(framesPerMatch(7)).toBe(1);
    expect(framesPerMatch(8)).toBe(1);
  });
});
