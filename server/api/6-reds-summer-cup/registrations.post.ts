import * as v from "valibot";
import { summerCupRegistrations } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { getPlayDay } from "#shared/data/summerCup";
import { buildCommunication } from "#shared/summerCup/epc";
import {
  checkRegistrationAllowed,
  type RegistrationDenyReason,
} from "#shared/summerCup/capacity";
import { buildConfirmationEmail } from "#shared/summerCup/email";

const bodySchema = v.object({
  playDayId: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.trim(), v.nonEmpty(), v.maxLength(80)),
  email: v.pipe(v.string(), v.trim(), v.toLowerCase(), v.email(), v.maxLength(120)),
  qrCodeBase64: v.pipe(v.string(), v.nonEmpty(), v.maxLength(200000)),
});

const denyMessages: Record<RegistrationDenyReason, string> = {
  unknown_play_day: "Onbekende speeldag.",
  past: "Deze speeldag is al voorbij.",
  duplicate: "Je bent al ingeschreven voor deze speeldag.",
  full: "Deze speeldag is volzet.",
  edition_full: "Het maximum aantal unieke deelnemers (16) voor editie 2026 is bereikt.",
};

/** Validates that the string is base64 of a PNG (checks the PNG signature). */
function isPngBase64(value: string): boolean {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
  return value.startsWith("iVBORw0KGgo"); // base64 of the 8-byte PNG signature
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => v.safeParse(bodySchema, b));

  if (!body.success) {
    setResponseStatus(event, 400);
    return { success: false, validationErrors: body.issues };
  }

  const playDay = getPlayDay(body.output.playDayId);
  if (!playDay) {
    setResponseStatus(event, 400);
    return { success: false, error: denyMessages.unknown_play_day };
  }

  if (!isPngBase64(body.output.qrCodeBase64)) {
    setResponseStatus(event, 400);
    return { success: false, error: "Ongeldige QR-code." };
  }

  const existing = await db
    .select({
      playDayId: summerCupRegistrations.playDayId,
      email: summerCupRegistrations.email,
    })
    .from(summerCupRegistrations)
    .all();

  const check = checkRegistrationAllowed({
    playDayId: body.output.playDayId,
    email: body.output.email,
    existing,
    now: new Date(),
  });

  if (!check.ok) {
    setResponseStatus(event, 409);
    return { success: false, reason: check.reason, error: denyMessages[check.reason!] };
  }

  const communication = buildCommunication(body.output.name, playDay.shortLabel);

  // Insert first to claim the spot (and let the unique index guard against races).
  let inserted: { id: number };
  try {
    inserted = await db
      .insert(summerCupRegistrations)
      .values({
        playDayId: body.output.playDayId,
        name: body.output.name,
        email: body.output.email,
        communication,
        qrCodeBase64: body.output.qrCodeBase64,
        createdAt: new Date(),
      })
      .returning({ id: summerCupRegistrations.id })
      .get();
  } catch (error) {
    // Unique index violation => raced duplicate for the same play day.
    setResponseStatus(event, 409);
    return { success: false, reason: "duplicate", error: denyMessages.duplicate };
  }

  const origin = getRequestURL(event).origin;
  const qrImageUrl = `${origin}/api/6-reds-summer-cup/registrations/${inserted.id}/qr.png`;
  const logoUrl = `${origin}/images/play-er.png`;
  const mail = buildConfirmationEmail({
    name: body.output.name,
    playDayLabel: playDay.label,
    communication,
    qrImageUrl,
    logoUrl,
  });

  try {
    await sendTransactionalEmail({
      sender: { name: "Snooker Play-ER", email: "snooker@play-er.be" },
      to: [{ email: body.output.email, name: body.output.name }],
      bcc: [{ email: "snooker@play-er.be" }],
      replyTo: { email: "snooker@play-er.be" },
      subject: mail.subject,
      htmlContent: mail.htmlContent,
      attachment: [{ content: body.output.qrCodeBase64, name: "betaling-qr.png" }],
    });
  } catch (error) {
    // The email is essential: roll back so no registration persists without a confirmation.
    await db
      .delete(summerCupRegistrations)
      .where(eq(summerCupRegistrations.id, inserted.id))
      .run();
    console.error("Brevo send failed, registration rolled back", error);
    setResponseStatus(event, 502);
    return {
      success: false,
      error: "We konden de bevestigingsmail niet versturen. Probeer het later opnieuw.",
    };
  }

  return {
    success: true,
    id: inserted.id,
    playDayId: playDay.id,
    playDayLabel: playDay.label,
    name: body.output.name,
    email: body.output.email,
    communication,
  };
});
