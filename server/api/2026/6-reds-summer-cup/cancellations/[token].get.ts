import { sixRedsSummerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/sixRedsSummerCup2026/data/edition";
import { isPlayDayPast } from "#shared/sixRedsSummerCup2026/capacity";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    return { found: false };
  }

  const row = await db
    .select({
      name: sixRedsSummerCupRegistrations.name,
      playDayId: sixRedsSummerCupRegistrations.playDayId,
    })
    .from(sixRedsSummerCupRegistrations)
    .where(eq(sixRedsSummerCupRegistrations.cancelToken, token))
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
