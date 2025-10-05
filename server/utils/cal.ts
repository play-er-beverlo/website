const baseUrl = "https://api.cal.com/v2";

const runtimeConfig = useRuntimeConfig();

const headers = {
  Authorization: `Bearer ${runtimeConfig.calApiKey}`,
  "cal-api-version": new Date().toISOString().substring(0, 10),
};

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
      ...headers,
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
      ...headers,
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

export function createBooking({
  eventTypeId,
  date,
  details,
  duration,
}: {
  eventTypeId: number;
  date: Date;
  details: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  duration: number;
}) {
  return $fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: {
      ...headers,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: {
      start: date,
      attendee: {
        name: `${details.firstName} ${details.lastName}`,
        email: details.email,
        phoneNumber: details.phoneNumber,
        language: "nl",
        timeZone,
      },
      eventTypeId,
      lengthInMinutes: duration,
    },
  });
}

export function cancelBooking({
  uid,
  cancellationReason,
}: {
  uid: string;
  cancellationReason: string;
}) {
  return $fetch(`${baseUrl}/bookings/${uid}/cancel`, {
    method: "POST",
    headers: {
      ...headers,
      "cal-api-version": "2024-08-13",
      "Content-Type": "application/json",
    },
    body: {
      cancellationReason,
    },
  });
}
