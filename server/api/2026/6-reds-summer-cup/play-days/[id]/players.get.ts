import { sixRedsSummerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/sixRedsSummerCup2026/data/edition";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";

  const playDay = getPlayDay(id);
  if (!playDay) {
    throw createError({ statusCode: 404, statusMessage: "Onbekende speeldag" });
  }

  const rows = await db
    .select({ name: sixRedsSummerCupRegistrations.name })
    .from(sixRedsSummerCupRegistrations)
    .where(eq(sixRedsSummerCupRegistrations.playDayId, id))
    .all();

  return {
    playDayId: playDay.id,
    label: playDay.label,
    players: rows
      .map((r) => ({ name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "nl")),
  };
});
