import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { isPlayDayPast } from "#shared/summerCup/capacity";
import { buildCancellationEmail } from "#shared/summerCup/email";

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");

  if (!token) {
    setResponseStatus(event, 400);
    return { success: false };
  }

  const row = await db
    .select({
      id: summerCupRegistrations.id,
      name: summerCupRegistrations.name,
      email: summerCupRegistrations.email,
      playDayId: summerCupRegistrations.playDayId,
    })
    .from(summerCupRegistrations)
    .where(eq(summerCupRegistrations.cancelToken, token))
    .get();

  // Idempotent: an unknown/already-used token (or an email-scanner replay) is harmless.
  if (!row) {
    return { success: true, alreadyGone: true };
  }

  const playDay = getPlayDay(row.playDayId);
  if (playDay && isPlayDayPast(playDay.id, new Date())) {
    setResponseStatus(event, 409);
    return { success: false, reason: "past" };
  }

  // Hard delete frees the spot (capacity counts rows) and allows re-registration.
  await db
    .delete(summerCupRegistrations)
    .where(eq(summerCupRegistrations.id, row.id))
    .run();

  // The cancellation is done; a failed confirmation email must not resurrect the row.
  try {
    const origin = getRequestURL(event).origin;
    const mail = buildCancellationEmail({
      name: row.name,
      playDayLabel: playDay?.label ?? row.playDayId,
      logoUrl: `${origin}/images/play-er.png`,
    });
    await sendTransactionalEmail({
      sender: { name: "Snooker Play-ER", email: "snooker@play-er.be" },
      to: [{ email: row.email, name: row.name }],
      bcc: [{ email: "snooker@play-er.be" }],
      replyTo: { email: "snooker@play-er.be" },
      subject: mail.subject,
      htmlContent: mail.htmlContent,
    });
  } catch (error) {
    console.error("Brevo cancellation mail failed (registration already removed)", error);
  }

  return { success: true };
});
