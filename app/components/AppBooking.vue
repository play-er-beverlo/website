<script lang="ts" setup>
import { getLocalTimeZone, parseDate, today, type DateValue } from "@internationalized/date";
import {
  closingHour,
  openingHour,
  games,
  gameLocations,
  durations,
  gameLocationDisplayNames,
  gameLocationPostfix,
} from "#shared/data/booking";

import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeError,
  type StripePaymentElement,
} from "@stripe/stripe-js";
import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";
import {
  allowedDurations,
  formatDate,
  formatDuration,
  formatTime,
  freeBlocks,
  MIN_DURATION,
  type BookingSelection,
} from "#shared/booking/dayGrid";
import type { BookingColumn } from "./AppBookingDayGrid.vue";

const runtimeConfig = useRuntimeConfig();
const toast = useToast();

const selectedGame = useLocalStorage("booking:game", null as string | null, {
  initOnMounted: true,
});

watch(selectedGame, async (value, oldValue) => {
  // Not on the initial restore from localStorage (null -> game), so a reload keeps the selection.
  if (oldValue && value !== oldValue) {
    selectedSlot.value = null;
  }

  await fetchSlots();
});

const calendarDateToday = today(getLocalTimeZone());

const date = useLocalStorage("booking:date", calendarDateToday, {
  initOnMounted: true,
  serializer: {
    read: (x) => parseDate(x),
    write: (x) => x.toString(),
  },
});

watch(date, async (value, oldValue) => {
  if (value && value.toDate(getLocalTimeZone()) < calendarDateToday.toDate(getLocalTimeZone())) {
    date.value = calendarDateToday;
  }

  // fetchSlots drops a selection that is not free on the new date.
  if (value.toString() != oldValue.toString()) {
    await fetchSlots();
  }
});

const isDateUnavailable = (date: DateValue) =>
  date.toDate(getLocalTimeZone()) < calendarDateToday.toDate(getLocalTimeZone());

const isToday = computed(() => date.value.compare(calendarDateToday) <= 0);

const shiftDate = (days: number) => {
  date.value = date.value.add({ days });
};

const dateLabel = computed(() =>
  date.value.toDate(getLocalTimeZone()).toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
);

const selectedLocation = useLocalStorage("booking:location", 1, {
  initOnMounted: true,
  serializer: {
    read: (x) => +x,
    write: (x) => x + "",
  },
});

const selectedSlot = useLocalStorage("booking:slot", null, {
  initOnMounted: true,
  serializer: {
    read: (x) => (x ? new Date(x) : null),
    write: (x) => (x ? x.toISOString() : ""),
  },
});

const selectedDuration = useLocalStorage("booking:duration", 60, {
  initOnMounted: true,
});

const selectedSlotEnd = computed(() => {
  if (!selectedSlot.value || !selectedDuration.value) {
    return null;
  }

  return new Date(selectedSlot.value.valueOf() + selectedDuration.value * 60 * 1000);
});

const selection = computed<BookingSelection | null>({
  get: () =>
    selectedSlot.value
      ? {
          location: selectedLocation.value,
          start: selectedSlot.value,
          duration: selectedDuration.value,
        }
      : null,
  set: (value) => {
    if (!value) {
      selectedSlot.value = null;
      return;
    }

    selectedLocation.value = value.location;
    selectedDuration.value = value.duration;
    selectedSlot.value = value.start;
  },
});

// Free 60-minute slot starts per table; the day grid derives free and occupied blocks from them.
const slotStartsByLocation = ref<Record<number, Date[]>>({});
const slotsPending = ref(false);
// True when no table could be loaded at all, as opposed to a day that is fully booked.
const slotsFailed = ref(false);
let latestSlotsRequest = 0;

const fetchSlots = async () => {
  if (!selectedGame.value || !date.value) {
    return;
  }

  const request = ++latestSlotsRequest;
  const locations = gameLocations[selectedGame.value] ?? [];
  const query = {
    date: date.value.toDate("UTC").toISOString().substring(0, 10),
    duration: MIN_DURATION,
    game: selectedGame.value,
  };

  slotsPending.value = true;

  const results = await Promise.allSettled(
    locations.map((location) =>
      $fetch<string[]>("/api/bookings/slots", { query: { ...query, location } })
    )
  );

  if (request !== latestSlotsRequest) {
    return;
  }

  const loaded = results.map(
    (result) => result.status === "fulfilled" && Array.isArray(result.value)
  );

  // A table whose slots could not be loaded shows as fully occupied.
  slotStartsByLocation.value = Object.fromEntries(
    locations.map((location, index) => {
      const result = results[index];

      return [
        location,
        loaded[index] && result?.status === "fulfilled"
          ? result.value.map((x) => new Date(x))
          : [],
      ];
    })
  );
  slotsFailed.value = locations.length > 0 && !loaded.some(Boolean);
  slotsPending.value = false;

  // Drop a selection that is no longer free. Keep it when its table failed to load: that says
  // nothing about availability, and the server checks again when booking.
  const selectedIndex = locations.indexOf(selectedLocation.value);

  if (
    selectedSlot.value &&
    (selectedIndex === -1 || loaded[selectedIndex]) &&
    !allowedDurations(
      freeBlocks(slotStartsByLocation.value[selectedLocation.value] ?? []),
      selectedSlot.value.valueOf(),
      durations
    ).includes(selectedDuration.value)
  ) {
    selectedSlot.value = null;
  }
};

const locationLabel = (game: string, location: number, short = false) => {
  const name = gameLocationDisplayNames[game] ?? "";
  const postfix = gameLocationPostfix[game]?.[location] ?? "";

  return short
    ? `${location}${postfix}`
    : `${name.charAt(0).toUpperCase()}${name.slice(1)} ${location}${postfix}`;
};

const columns = computed<BookingColumn[]>(() =>
  selectedGame.value
    ? (gameLocations[selectedGame.value] ?? []).map((location) => ({
        location,
        label: locationLabel(selectedGame.value!, location),
        shortLabel: locationLabel(selectedGame.value!, location, true),
        slotStarts: slotStartsByLocation.value[location] ?? [],
      }))
    : []
);

const hasFreeSlots = computed(() => columns.value.some((column) => column.slotStarts.length > 0));

// A fully booked day still says when the venue is open, for whoever wants to drop by anyway.
const noSlotsMessage = computed(() => {
  if (!isToday.value) {
    const opening = openingHour(date.value.toDate(getLocalTimeZone()).getDay());

    return `Er zijn op deze dag geen vrije tijdsloten meer, maar we zijn wel open van ${opening}:00 tot ${closingHour}:00.`;
  }

  // The hour in the venue's time zone.
  return Number(formatTime(Date.now()).split(":")[0]) >= closingHour
    ? "Vandaag zijn er geen vrije tijdsloten meer en we zijn ondertussen gesloten."
    : `Vandaag zijn er geen vrije tijdsloten meer, maar we zijn open tot ${closingHour}:00.`;
});


const details = useLocalStorage(
  "booking:details",
  {
    name: "",
    email: "",
    phoneNumber: "",
  },
  {
    initOnMounted: true,
  }
);

watch(details, async (value) => {
  // console.log("details", value);
});

const bookingData = useLocalStorage("booking:data", null as unknown, {
  initOnMounted: true,
  serializer: {
    read: (x) => (x ? JSON.parse(x) : null),
    write: (x) => (x ? JSON.stringify(x) : ""),
  },
});

const fetchBookingData = async () => {
  if (!bookingData.value) {
    return;
  }

  bookingData.value = await $fetch(`/api/bookings/${bookingData.value.id}`);
};

watch(bookingData, async (value) => {
  // console.log("bookingData", value);

  if (
    bookingData.value &&
    (bookingData.value.calStatus === "CANCELLED" || bookingData.value.calStatus === "REJECTED")
  ) {
    await reset();
  }
});

const bookingPending = ref(false);

const book = async () => {
  if (
    bookingPending.value ||
    slotsPending.value ||
    !selectedGame.value ||
    !date.value ||
    !selectedLocation.value ||
    !selectedSlot.value ||
    !selectedDuration.value
  ) {
    return;
  }

  bookingPending.value = true;

  try {
    bookingData.value = await $fetch("/api/bookings", {
      method: "POST",
      body: {
        date: selectedSlot.value!.toISOString(),
        details: details.value,
        duration: selectedDuration.value,
        game: selectedGame.value,
        location: selectedLocation.value,
      },
    });
  } catch (response) {
    const errorToast: Partial<Toast> = {
      title: "Mislukt!",
      description: "Er ging iets mis tijdens het reserveren. Probeer het later even opnieuw.",
      color: "error",
    };

    if ((response as any)?.data?.data?.error?.code === "UnprocessableEntityException") {
      errorToast.description = "Je gekozen tijdstip is niet meer beschikbaar.";
      selectedSlot.value = null;
    }

    toast.add(errorToast);

    await fetchSlots();
    return;
  } finally {
    bookingPending.value = false;
  }

  scrollToBookingTop();
  createStripePaymentElement();
};

const cancelPending = ref(false);

const cancel = async () => {
  if (cancelPending.value || !bookingData.value) {
    return;
  }

  cancelPending.value = true;

  try {
    await $fetch(`/api/bookings/${bookingData.value.id}/cancel`, {
      method: "POST",
    });
  } catch (response) {
    const errorToast: Partial<Toast> = {
      title: "Mislukt!",
      description:
        "Er ging iets mis tijdens annuleren van je reservatie. Probeer het later even opnieuw.",
      color: "error",
    };

    toast.add(errorToast);

    return;
  } finally {
    cancelPending.value = false;
  }

  await reset();
};

let stripe: Stripe | null;
const stripePaymentElementPlaceholder = ref<HTMLElement>();
let stripeElements = ref<StripeElements>();
let stripePaymentElement = ref<StripePaymentElement>();

const paymentPending = ref(false);

const pay = async () => {
  if (paymentPending.value || !stripe || !stripeElements.value) {
    return;
  }

  paymentPending.value = true;

  const { error: submitError } = await stripeElements.value.submit();

  if (submitError) {
    handlePaymentError(submitError);
    return;
  }

  const { error } = await stripe.confirmPayment({
    clientSecret: (bookingData.value as any).stripeClientSecret,
    elements: stripeElements.value,
    confirmParams: {
      return_url: `${location.origin}/api/bookings/stripe/callback`,
    },
    redirect: "always",
  });

  if (error) {
    handlePaymentError(error);
  }

  paymentPending.value = false;
};

const handlePaymentError = (error: StripeError) => {
  const errorToast: Partial<Toast> = {
    title: "Mislukt!",
    description:
      "Er ging iets mis tijdens het betalen van de reservatie. Probeer het later even opnieuw.",
    color: "error",
  };

  toast.add(errorToast);

  paymentPending.value = false;
};

const createStripePaymentElement = () => {
  if (!stripe || !(bookingData.value as any).stripeClientSecret) {
    return;
  }

  stripeElements.value = stripe.elements({
    clientSecret: (bookingData.value as any).stripeClientSecret,
  });

  stripePaymentElement.value = stripeElements.value.create("payment", {
    defaultValues: {
      billingDetails: {
        name: details.value.name,
        email: details.value.email,
        phone: details.value.phoneNumber,
      },
    },
  });

  if (stripePaymentElement.value && stripePaymentElementPlaceholder.value) {
    stripePaymentElement.value.mount(stripePaymentElementPlaceholder.value);
  }
};

const reset = async () => {
  stripePaymentElement.value?.clear();
  stripePaymentElement.value?.unmount();
  stripePaymentElement.value = undefined;
  bookingData.value = null;
  selectedSlot.value = null;
  scrollToBookingTop();

  await fetchSlots();
};

const scrollToBookingTop = () => {
  const element = document.getElementById("reserveren");
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
};

onMounted(async () => {
  stripe = await loadStripe(runtimeConfig.public.stripePublishableApiKey, {
    locale: "nl",
  });

  if (bookingData.value) {
    await fetchBookingData();

    if (!bookingData.value.paid) {
      createStripePaymentElement();
    }
  }
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <div v-if="!bookingData" class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h2>Wat wil je spelen?</h2>
        <div class="flex flex-wrap gap-4">
          <u-button
            v-for="game in games"
            :key="game"
            class="flex-1"
            :label="game.toUpperCase()"
            size="xl"
            :color="game === selectedGame ? 'primary' : 'neutral'"
            :variant="game === selectedGame ? 'solid' : 'ghost'"
            @click="
              () => {
                selectedGame = game;
              }
            "
          />
        </div>
      </div>
      <div v-if="selectedGame" class="flex flex-col gap-4">
        <h2>Wanneer wil je spelen?</h2>
        <u-calendar
          v-model="date"
          class="mx-auto w-full max-w-77"
          size="xl"
          :is-date-unavailable="isDateUnavailable"
          :prevent-deselect="true"
          :year-controls="false"
        />
      </div>
      <div v-if="selectedGame && date" class="flex flex-col gap-4">
        <h2>{{ columns.length > 1 ? "Hoe laat en waar" : "Hoe laat" }} wil je spelen?</h2>
        <div class="flex items-center justify-between gap-4">
          <u-button
            icon="i-lucide-chevron-left"
            size="xl"
            color="neutral"
            variant="ghost"
            aria-label="Vorige dag"
            :disabled="isToday"
            @click="shiftDate(-1)"
          />
          <p class="text-center text-lg font-semibold">{{ dateLabel }}</p>
          <u-button
            icon="i-lucide-chevron-right"
            size="xl"
            color="neutral"
            variant="ghost"
            aria-label="Volgende dag"
            @click="shiftDate(1)"
          />
        </div>
        <app-booking-day-grid
          v-model:selection="selection"
          :columns="columns"
          :loading="slotsPending"
          :failed="slotsFailed"
          :empty-message="noSlotsMessage"
          @retry="fetchSlots()"
        />
        <!-- Always mounted, so screen readers announce the first selection too. -->
        <p aria-live="polite" :class="selectedSlot ? 'font-semibold' : 'text-muted'">
          <template v-if="selectedSlot && selectedSlotEnd">
            {{ locationLabel(selectedGame, selectedLocation) }} &middot;
            {{ formatTime(selectedSlot) }} &ndash; {{ formatTime(selectedSlotEnd) }} &middot;
            {{ formatDuration(selectedDuration) }}
          </template>
          <template v-else-if="!slotsPending && hasFreeSlots">
            Tik op een vrij blok om je startuur te kiezen; je reserveert minstens 1 uur. Sleep
            daarna de boven- of onderkant van je keuze om ze langer of korter te maken.
          </template>
        </p>
        <p v-if="selectedSlot" class="text-sm text-muted">
          Sleep de boven- of onderkant van je keuze om het start- of einduur te verzetten, of tik
          op een ander blok om opnieuw te kiezen.
        </p>
      </div>
      <div
        v-if="selectedGame && date && selectedLocation && selectedSlot && selectedDuration"
        class="flex flex-col gap-4"
      >
        <h2>Je gegevens</h2>
        <u-form-field class="flex-1" label="Naam" size="xl" :required="true">
          <u-input class="w-full" v-model="details.name" name="name" placeholder="Naam" />
        </u-form-field>
        <div class="flex flex-col sm:flex-row gap-4">
          <u-form-field class="flex-1" label="E-mailadres" size="xl" :required="true">
            <u-input
              class="w-full"
              v-model="details.email"
              name="email"
              type="email"
              placeholder="E-mailadres"
            />
          </u-form-field>
          <u-form-field class="flex-1" label="Telefoonnummer" size="xl" :required="true">
            <u-input
              class="w-full"
              v-model="details.phoneNumber"
              name="phoneNumber"
              placeholder="Telefoonnummer"
            />
          </u-form-field>
        </div>
      </div>
      <div
        v-if="
          selectedGame &&
          date &&
          selectedLocation &&
          selectedDuration &&
          selectedSlot &&
          details.name &&
          details.email &&
          details.phoneNumber
        "
        class="flex flex-col gap-4"
      >
        <h2>Overzicht</h2>
        <p>
          <span class="font-semibold">Spel</span>: {{ selectedGame.toUpperCase() }}
          {{ selectedLocation }}{{ gameLocationPostfix[selectedGame]?.[selectedLocation] }}
        </p>
        <p>
          <span class="font-semibold">Datum</span>:
          {{ formatDate(selectedSlot) }}
          {{ formatTime(selectedSlot)
          }}<span v-if="selectedSlotEnd">
            - {{ formatTime(selectedSlotEnd) }}</span
          >
        </p>
        <div class="flex flex-col">
          <p><span class="font-semibold">Naam</span>: {{ details.name }}</p>
          <p><span class="font-semibold">E-mail</span>: {{ details.email }}</p>
          <p><span class="font-semibold">Telefoonnummer</span>: {{ details.phoneNumber }}</p>
        </div>
        <div class="flex flex-col">
          <p><span class="font-semibold">Waarborg/voorschot reservatie</span>: &euro; 10</p>
        </div>
        <u-button
          :disabled="bookingPending || slotsPending"
          :loading="bookingPending"
          class="flex-1"
          label="Reserveer en betaal"
          size="xl"
          @click="book()"
        />
      </div>
    </div>
    <div v-else class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h2>Bevestiging</h2>
        <p>
          <span class="font-semibold">Spel</span>:
          {{ bookingData.calData.eventTitle.toUpperCase() }}
        </p>
        <p>
          <span class="font-semibold">Datum</span>:
          {{ formatDate(new Date(bookingData.calData.startTime)) }}
          {{ formatTime(new Date(bookingData.calData.startTime))
          }}<span v-if="bookingData.calData.endTime">
            -
            {{
              formatTime(new Date(bookingData.calData.endTime))
            }}</span
          >
        </p>
        <div class="flex flex-col">
          <p>
            <span class="font-semibold">Naam</span>:
            {{ bookingData.calData.attendees[0].name }}
          </p>
          <p>
            <span class="font-semibold">E-mail</span>: {{ bookingData.calData.attendees[0].email }}
          </p>
          <p>
            <span class="font-semibold">Telefoonnummer</span>:
            {{ bookingData.calData.attendees[0].phoneNumber }}
          </p>
        </div>
        <div v-if="bookingData.calData.price > 0" class="flex flex-col">
          <p><span class="font-semibold">Waarborg/voorschot reservatie</span>: &euro; 10</p>
          <p>
            <span class="font-semibold">Status</span>: <span v-if="bookingData.paid">Betaald</span
            ><span v-else>Nog niet betaald</span>
          </p>
        </div>
      </div>
    </div>
    <div
      v-show="bookingData && !bookingData.paid && stripePaymentElement"
      class="flex flex-col gap-4"
    >
      <h2>Betaling</h2>
      <div ref="stripePaymentElementPlaceholder"></div>
      <u-button
        :disabled="paymentPending"
        :loading="paymentPending"
        class="flex-1"
        label="Betalen"
        size="xl"
        @click="pay()"
      />
    </div>
    <u-alert
      v-if="bookingData && (bookingData.paid || !bookingData.calData.price)"
      title="Gereserveerd!"
      description="We wensen je alvast veel plezier bij Play-ER te Beverlo."
      color="success"
      variant="subtle"
    />
    <u-button
      v-if="bookingData && !bookingData.paid && !bookingData.calData?.disableCancelling"
      :disabled="cancelPending"
      :loading="cancelPending"
      class="flex-1"
      label="Annuleren"
      size="xl"
      color="error"
      variant="ghost"
      @click="cancel()"
    />
    <u-button
      v-if="bookingData && (!bookingData.stripeClientSecret || bookingData.paid)"
      class="flex-1"
      label="Maak nieuwe reservatie"
      size="xl"
      @click="reset()"
    />
  </div>
</template>

<style></style>
