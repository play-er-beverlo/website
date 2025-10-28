import { bookings } from "~~/server/database/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const runtimeConfig = useRuntimeConfig();
const stripe = new Stripe(runtimeConfig.stripeSecretApiKey);

export default defineEventHandler(async (event) => {
  const secret = runtimeConfig.stripeWebhookSecret;

  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "Webhook secret not configured" });
  }

  const signature = getHeader(event, "Stripe-Signature");

  if (!signature) {
    throw createError({ statusCode: 401, statusMessage: "Missing signature" });
  }

  const raw = await readRawBody(event);
  const bodyBuffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || "");

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = await stripe.webhooks.constructEventAsync(bodyBuffer, signature, secret);
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: `Webhook error: ${err.message}` });
  }

  const body = await readBody(event);

  console.log("Stripe webhook body", body);

  if (stripeEvent.type === "payment_intent.created") {
    const calId = body.data.object.metadata.bookingId;

    let booking;
    let counter = 0;

    while (!booking && counter < 50) {
      booking = await useDrizzle()
        .select()
        .from(tables.bookings)
        .where(eq(bookings.calId, Number(calId)))
        .get();

      if (!booking && counter < 50) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        counter++;
      }
    }

    if (!booking) {
      throw createError({ statusCode: 400, statusMessage: `Booking not found.` });
    }

    await useDrizzle()
      .update(tables.bookings)
      .set({
        stripeClientSecret: body.data.object.client_secret,
        stripeData: JSON.stringify(body.data.object),
      })
      .where(eq(bookings.id, booking.id));
  }
});
