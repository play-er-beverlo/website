import { describe, expect, it } from "vitest";
import {
  playDays,
  finaleDay,
  getPlayDay,
  MAX_PER_PLAY_DAY,
  MAX_UNIQUE_PLAYERS,
  REGISTRATION_FEE,
  payment,
} from "../shared/data/summerCup";

describe("summerCup data", () => {
  it("has 8 registrable play days", () => {
    expect(playDays).toHaveLength(8);
  });

  it("does not include the finale day among play days", () => {
    expect(playDays.find((d) => d.id === finaleDay.id)).toBeUndefined();
  });

  it("resolves a play day by id", () => {
    expect(getPlayDay("2026-06-17")?.tournament).toBe(1);
    expect(getPlayDay("2026-07-31")?.shortLabel).toBe("vr 31 juli 2026");
    expect(getPlayDay("nope")).toBeUndefined();
  });

  it("exposes the agreed constants and payment data", () => {
    expect(MAX_PER_PLAY_DAY).toBe(8);
    expect(MAX_UNIQUE_PLAYERS).toBe(16);
    expect(REGISTRATION_FEE).toBe(15);
    expect(payment.ibanCompact).toBe("BE30063766394611");
    expect(payment.bic).toBe("GKCCBEBB");
    expect(payment.beneficiary).toBe("Beckers Steff");
  });
});
