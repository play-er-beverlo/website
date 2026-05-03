import crypto from "node:crypto";
import { bookings } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";
import { timingSafeEqualHex } from "#shared/helpers";

const runtimeConfig = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const secret = runtimeConfig.calWebhookSecret;

  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "Webhook secret not configured" });
  }

  const signature = getHeader(event, "x-cal-signature-256");

  if (!signature) {
    throw createError({ statusCode: 401, statusMessage: "Missing signature" });
  }

  const rawBody = (await readRawBody(event, "utf8")) ?? "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const valid = timingSafeEqualHex(signature, expected);

  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: "Invalid signature" });
  }

  const body = await readBody(event);

  console.log("Cal.com webhook body", body);

  if (
    body.triggerEvent === "BOOKING_CREATED" ||
    body.triggerEvent === "BOOKING_PAYMENT_INITIATED"
  ) {
    // Save to database
    await db.insert(bookings).values({
      calId: body.payload.bookingId,
      calEventTypeId: body.payload.eventTypeId,
      calData: JSON.stringify(body.payload),
      calStatus: body.payload.status,
      createdAt: new Date(),
    });
  } else if (body.triggerEvent === "BOOKING_PAID") {
    await db
      .update(bookings)
      .set({
        calStatus: body.payload.status,
        paid: true,
      })
      .where(eq(bookings.calId, body.payload.bookingId));
  } else if (body.triggerEvent === "BOOKING_CANCELLED") {
    await db
      .update(bookings)
      .set({ calStatus: body.payload.status })
      .where(eq(bookings.calId, body.payload.bookingId));
  } else if (body.triggerEvent === "BOOKING_REJECTED") {
    await db
      .update(bookings)
      .set({ calStatus: body.payload.status })
      .where(eq(bookings.calId, body.payload.bookingId));
  }
});
