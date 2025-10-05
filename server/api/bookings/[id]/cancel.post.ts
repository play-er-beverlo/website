import * as v from "valibot";
import { bookings } from "~~/server/database/schema";
import { eq } from "drizzle-orm";

const paramsSchema = v.object({
  id: v.pipe(
    v.string(),
    v.transform((x) => +x)
  ),
});

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (params) =>
    v.safeParse(paramsSchema, params)
  );

  if (!params.success) {
    setResponseStatus(event, 400);

    return {
      success: false,
      validationErrors: params.issues,
    };
  }

  const booking = await useDrizzle()
    .select()
    .from(tables.bookings)
    .where(eq(bookings.id, params.output.id))
    .get();

  if (!booking) {
    setResponseStatus(event, 404);
    return;
  }

  const calData = JSON.parse(booking.calData);

  return cancelBooking({ uid: calData.uid, cancellationReason: "Geannuleerd via website" });
});
