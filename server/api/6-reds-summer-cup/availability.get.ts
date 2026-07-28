import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { playDays, MAX_PER_PLAY_DAY } from "#shared/data/summerCup";
import { playerNamesByPlayDay } from "#shared/summerCup/capacity";
import type { AvailabilityResponse } from "#shared/summerCup/availability";

export default defineEventHandler(async (): Promise<AvailabilityResponse> => {
  const rows = await db
    .select({
      playDayId: summerCupRegistrations.playDayId,
      name: summerCupRegistrations.name,
    })
    .from(summerCupRegistrations)
    .all();

  const namesByDay = playerNamesByPlayDay(rows);
  const todayKey = new Date().toISOString().slice(0, 10);

  const days = playDays.map((d) => {
    const players = namesByDay.get(d.id) ?? [];
    const registered = players.length;
    return {
      id: d.id,
      label: d.label,
      shortLabel: d.shortLabel,
      tournament: d.tournament,
      registered,
      capacity: MAX_PER_PLAY_DAY,
      remaining: Math.max(0, MAX_PER_PLAY_DAY - registered),
      full: registered >= MAX_PER_PLAY_DAY,
      past: d.id < todayKey,
      players,
    };
  });

  return { playDays: days };
});
