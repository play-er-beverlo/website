import * as v from "valibot";
import { bookings } from "~~/server/database/schema";
import { eq } from "drizzle-orm";
import { deleteReservedSlot } from "~~/server/utils/cal";

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

  if (!booking || !booking.calEventTypeId) {
    setResponseStatus(event, 404);
    return;
  }

  const calData = JSON.parse(booking.calData);

  if (calData.metadata.reservationUid) {
    await deleteReservedSlot({
      eventTypeId: booking.calEventTypeId,
      uid: calData.metadata.reservationUid,
    });
  }

  return cancelBooking({
    eventTypeId: calData.eventTypeId,
    uid: calData.uid,
    cancellationReason: "Geannuleerd via website",
  });
});
