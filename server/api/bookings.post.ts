import * as v from "valibot";
import { createBooking, reserveSlot } from "../utils/cal";
import { bookings } from "../database/schema";
import { gameLocationEventTypeIdMapping } from "#shared/data/booking";

const bodySchema = v.object({
  game: v.string(),
  date: v.pipe(
    v.string(),
    v.isoTimestamp(),
    v.transform((x) => new Date(x))
  ),
  location: v.number(),
  duration: v.number(),
  details: v.object({
    name: v.string(),
    email: v.pipe(v.string(), v.email()),
    phoneNumber: v.string(),
  }),
});

export default defineEventHandler(async (event) => {
  // TODO: Make more generic?
  const body = await readValidatedBody(event, (body) => v.safeParse(bodySchema, body));

  if (!body.success) {
    setResponseStatus(event, 400);

    return {
      success: false,
      validationErrors: body.issues,
    };
  }

  let eventTypeId = gameLocationEventTypeIdMapping[body.output.game]?.[body.output.location];

  if (!eventTypeId) {
    setResponseStatus(event, 400);

    return {
      success: false,
      error: "Event type id is invalid.",
    };
  }

  // const slotReservationData = await reserveSlot({
  //   eventTypeId,
  //   slotStart: body.output.date,
  //   slotDuration: body.output.duration,
  // });

  // console.log("slotReservationData", slotReservationData);

  const bookingData = await createBooking({
    eventTypeId,
    date: body.output.date,
    details: body.output.details,
    duration: body.output.duration,
    // reservationUid: (slotReservationData as any).data.reservationUid,
  });

  console.log("bookingData", bookingData);

  let booking;

  // Wait for booking data through webhook
  while (
    !booking ||
    ((bookingData as any).data.status === "pending" && !booking.stripeClientSecret)
  ) {
    booking = await useDrizzle()
      .select()
      .from(tables.bookings)
      .where(eq(bookings.calId, (bookingData as any).data.id))
      .get();

    if (
      !booking ||
      ((bookingData as any).data.status === "pending" && !booking.stripeClientSecret)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  booking.calData = JSON.parse(booking.calData);
  booking.stripeData = JSON.parse(booking.stripeData ?? "{}");

  return booking;
});
