import * as v from "valibot";
import { bookings } from "hub:db:schema";
import { db } from "hub:db";
import { eq } from "drizzle-orm";

const querySchema = v.object({
  payment_intent: v.string(),
  payment_intent_client_secret: v.string(),
  redirect_status: v.string(),
});

export default defineEventHandler(async (event) => {
  // TODO: Make more generic?
  const query = await getValidatedQuery(event, (query) => v.safeParse(querySchema, query));

  if (!query.success) {
    setResponseStatus(event, 400);

    return {
      success: false,
      validationErrors: query.issues,
    };
  }

  if (query.output.redirect_status === "succeeded") {
    let booking;
    let counter = 0;

    while (!booking?.paid && counter < 50) {
      booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.stripeClientSecret, query.output.payment_intent_client_secret))
        .get();

      if (!booking?.paid && counter < 50) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        counter++;
      }
    }
  }

  return sendRedirect(event, "/#reserveren");
});
