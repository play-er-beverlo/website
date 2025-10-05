import crypto from "node:crypto";
import { bookings } from "~~/server/database/schema";
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

  if (body.triggerEvent === "BOOKING_PAYMENT_INITIATED") {
    // Save to database
    await useDrizzle()
      .insert(tables.bookings)
      .values({
        calId: body.payload.bookingId,
        calData: JSON.stringify(body.payload),
        calStatus: body.payload.status,
        createdAt: new Date(),
      });
  } else if (body.triggerEvent === "BOOKING_PAID") {
    await useDrizzle()
      .update(tables.bookings)
      .set({
        calStatus: body.payload.status,
        paid: true,
      })
      .where(eq(bookings.id, body.payload.bookingId));
  } else if (body.triggerEvent === "BOOKING_CANCELLED") {
    await useDrizzle()
      .update(tables.bookings)
      .set({ calStatus: body.payload.status })
      .where(eq(bookings.id, body.payload.bookingId));
  } else if (body.triggerEvent === "BOOKING_REJECTED") {
    await useDrizzle()
      .update(tables.bookings)
      .set({ calStatus: body.payload.status })
      .where(eq(bookings.id, body.payload.bookingId));
  }
});
