import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { playDays, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS } from "#shared/data/summerCup";

export default defineEventHandler(async () => {
  const rows = await db
    .select({
      playDayId: summerCupRegistrations.playDayId,
      email: summerCupRegistrations.email,
    })
    .from(summerCupRegistrations)
    .all();

  const todayKey = new Date().toISOString().slice(0, 10);
  const uniqueEmails = new Set(rows.map((r) => r.email.trim().toLowerCase()));

  const days = playDays.map((d) => {
    const registered = rows.filter((r) => r.playDayId === d.id).length;
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
    };
  });

  return {
    playDays: days,
    uniquePlayers: uniqueEmails.size,
    maxUniquePlayers: MAX_UNIQUE_PLAYERS,
    editionUniqueReached: uniqueEmails.size >= MAX_UNIQUE_PLAYERS,
  };
});
