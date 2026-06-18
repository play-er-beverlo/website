import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { isPlayDayPast } from "#shared/summerCup/capacity";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    return { found: false };
  }

  const row = await db
    .select({
      name: summerCupRegistrations.name,
      playDayId: summerCupRegistrations.playDayId,
    })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.cancelToken, token))
    .get();

  if (!row) {
    return { found: false };
  }

  const playDay = getPlayDay(row.playDayId);

  return {
    found: true,
    name: row.name,
    playDayLabel: playDay?.label ?? row.playDayId,
    cancellable: !!playDay && !isPlayDayPast(playDay.id, new Date()),
  };
});
