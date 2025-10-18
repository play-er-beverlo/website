const runtimeConfig = useRuntimeConfig();
const apiKeys = runtimeConfig.calApiKeys as Record<number, string>;
const bookingGuests = runtimeConfig.calBookingGuests as string[];
const baseUrl = "https://api.cal.com/v2";
const timeZone = "Europe/Brussels";

export function getSlots({
  eventTypeId,
  date,
  duration,
}: {
  eventTypeId: number;
  date: string;
  duration: number;
}) {
  return $fetch(`${baseUrl}/slots`, {
    headers: {
      Authorization: `Bearer ${apiKeys[eventTypeId]}`,
      "cal-api-version": "2024-09-04",
    },
    query: {
      timeZone,
      eventTypeId,
      start: date,
      end: date,
      duration,
    },
  });
}

export function reserveSlot({
  eventTypeId,
  slotStart,
  slotDuration,
}: {
  eventTypeId: number;
  slotStart: Date;
  slotDuration: number;
}) {
  return $fetch(`${baseUrl}/slots/reservations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKeys[eventTypeId]}`,
      "cal-api-version": "2024-09-04",
      "Content-Type": "application/json",
    },
    body: {
      eventTypeId,
      slotStart: slotStart.toISOString(),
      slotDuration,
    },
  });
}

export function deleteReservedSlot({ eventTypeId, uid }: { eventTypeId: number; uid: string }) {
  return $fetch(`${baseUrl}/slots/reservations/${uid}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKeys[eventTypeId]}`,
      "cal-api-version": "2024-09-04",
    },
  });
}

export function createBooking({
  eventTypeId,
  date,
  details,
  duration,
  reservationUid,
}: {
  eventTypeId: number;
  date: Date;
  details: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  duration: number;
  reservationUid: string;
}) {
  return $fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKeys[eventTypeId]}`,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: {
      start: date,
      attendee: {
        name: details.name,
        email: details.email,
        phoneNumber: details.phoneNumber,
        language: "nl",
        timeZone,
      },
      eventTypeId,
      lengthInMinutes: duration,
      metadata: {
        reservationUid,
      },
      guests: bookingGuests,
    },
  });
}

export function cancelBooking({
  eventTypeId,
  uid,
  cancellationReason,
}: {
  eventTypeId: number;
  uid: string;
  cancellationReason: string;
}) {
  return $fetch(`${baseUrl}/bookings/${uid}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKeys[eventTypeId]}`,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: {
      cancellationReason,
    },
  });
}
