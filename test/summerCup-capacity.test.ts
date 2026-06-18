import { describe, expect, it } from "vitest";
import {
  checkRegistrationAllowed,
  isPlayDayPast,
  type ExistingRegistration,
} from "../shared/summerCup/capacity";

const NOW = new Date("2026-06-11T12:00:00Z"); // before the first play day

function make(count: number, playDayId: string, emailPrefix: string): ExistingRegistration[] {
  return Array.from({ length: count }, (_, i) => ({
    playDayId,
    email: `${emailPrefix}${i}@example.com`,
  }));
}

describe("checkRegistrationAllowed", () => {
  it("allows a registration when there is space", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });

  it("rejects an unknown play day", () => {
    const r = checkRegistrationAllowed({
      playDayId: "1999-01-01",
      email: "new@example.com",
      existing: [],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "unknown_play_day" });
  });

  it("rejects a play day in the past", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: [],
      now: new Date("2026-06-20T12:00:00Z"),
    });
    expect(r).toEqual({ ok: false, reason: "past" });
  });

  it("rejects a duplicate registration for the same day (case-insensitive)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "Jan@Example.com",
      existing: [{ playDayId: "2026-06-17", email: "jan@example.com" }],
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects when the play day is full (8 registrations)", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-17",
      email: "new@example.com",
      existing: make(8, "2026-06-17", "p"),
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "full" });
  });

  it("rejects a new unique player when the edition already has 16 unique players", () => {
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "seventeenth@example.com",
      existing: make(16, "2026-06-17", "u"), // 16 unique emails on a different day
      now: NOW,
    });
    expect(r).toEqual({ ok: false, reason: "edition_full" });
  });

  it("still allows an already-registered player to add another day at the 16-unique cap", () => {
    const existing = make(16, "2026-06-17", "u"); // u0..u15 unique
    const r = checkRegistrationAllowed({
      playDayId: "2026-06-19",
      email: "u3@example.com", // already counted unique
      existing,
      now: NOW,
    });
    expect(r).toEqual({ ok: true });
  });
});

describe("isPlayDayPast", () => {
  it("is true when the play day is before today", () => {
    expect(isPlayDayPast("2026-06-17", new Date("2026-06-18T10:00:00Z"))).toBe(true);
  });

  it("is false on the play day itself", () => {
    expect(isPlayDayPast("2026-06-18", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });

  it("is false when the play day is in the future", () => {
    expect(isPlayDayPast("2026-07-01", new Date("2026-06-18T10:00:00Z"))).toBe(false);
  });
});
