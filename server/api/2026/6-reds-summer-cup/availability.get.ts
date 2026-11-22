import { sixRedsSummerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { playDays, MAX_PER_PLAY_DAY } from "#shared/sixRedsSummerCup2026/data/edition";
import { playerNamesByPlayDay } from "#shared/sixRedsSummerCup2026/capacity";
import type { AvailabilityResponse } from "#shared/sixRedsSummerCup2026/availability";

export default defineEventHandler(async (): Promise<AvailabilityResponse> => {
  const rows = await db
    .select({
      playDayId: sixRedsSummerCupRegistrations.playDayId,
      name: sixRedsSummerCupRegistrations.name,
    })
    .from(sixRedsSummerCupRegistrations)
    .all();

  const namesByDay = playerNamesByPlayDay(rows);
  const todayKey = new Date().toISOString().slice(0, 10);

  const days = playDays.map((d) => {
    const players = namesByDay.get(d.id) ?? [];
    const registered = players.length;
    const past = d.id < todayKey;
    return {
      id: d.id,
      label: d.label,
      shortLabel: d.shortLabel,
      tournament: d.tournament,
      registered,
      capacity: MAX_PER_PLAY_DAY,
      remaining: Math.max(0, MAX_PER_PLAY_DAY - registered),
      full: registered >= MAX_PER_PLAY_DAY,
      past,
      // Past rows aren't expandable in the UI, so don't ship names nobody sees —
      // keep the payload limited to what's actually displayed.
      players: past ? [] : players,
    };
  });

  return { playDays: days };
});
