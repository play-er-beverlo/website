<script lang="ts" setup>
import { getLocalTimeZone, parseDate, today, type DateValue } from "@internationalized/date";
import { games, gameLocations, durations, gameLocationDisplayNames } from "#shared/data/booking";

import {
  loadStripe,
  type Stripe,
  type StripeElements,
  type StripeError,
  type StripePaymentElement,
} from "@stripe/stripe-js";

const runtimeConfig = useRuntimeConfig();

const selectedGame = useLocalStorage("booking:game", null as string | null, {
  initOnMounted: true,
});

watch(selectedGame, async (value) => {
  // console.log("selectedGame", value);

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
  // console.log("date", value);

  if (value && value.toDate(getLocalTimeZone()) < calendarDateToday.toDate(getLocalTimeZone())) {
    date.value = calendarDateToday;
  }

  if (value.toString() != oldValue.toString()) {
    selectedSlot.value = null;
    await fetchSlots();
  }
});

const isDateUnavailable = (date: DateValue) =>
  date.toDate(getLocalTimeZone()) < calendarDateToday.toDate(getLocalTimeZone());

const selectedLocation = useLocalStorage("booking:location", 1, {
  initOnMounted: true,
  serializer: {
    read: (x) => +x,
    write: (x) => x + "",
  },
});

watch(selectedLocation, async (value) => {
  // console.log("selectedLocation", value);

  await fetchSlots();
});

const slots = ref<Date[]>([]);
const selectedSlot = useLocalStorage("booking:slot", null, {
  initOnMounted: true,
  serializer: {
    read: (x) => (x ? new Date(x) : null),
    write: (x) => (x ? x.toISOString() : ""),
  },
});

const selectedSlotEnd = computed(() => {
  if (!selectedSlot.value || !selectedDuration.value) {
    return null;
  }

  return new Date(selectedSlot.value.valueOf() + selectedDuration.value * 60 * 1000);
});

const fetchSlots = async () => {
  if (!selectedGame.value || !selectedLocation.value || !date.value || !selectedDuration.value) {
    return;
  }

  try {
    // TODO: Use useFetch here? So we can use the status
    const slotsData = await $fetch("/api/bookings/slots", {
      query: {
        date: date.value.toDate("UTC").toISOString().substring(0, 10),
        duration: selectedDuration.value,
        game: selectedGame.value,
        location: selectedLocation.value,
      },
    });

    slots.value = slotsData.map((x: any) => new Date(x));
  } catch (error) {
    slots.value = [];
  }
};

watch(slots, (value) => {
  // console.log("slots", value);

  if (
    selectedSlot.value &&
    !slots.value.map((x) => x.toISOString()).includes(selectedSlot.value.toISOString())
  ) {
    if (slots.value && slots.value.length > 0) {
      const lastSlot = slots.value[slots.value.length - 1];
      if (lastSlot && lastSlot < selectedSlot.value) {
        selectedSlot.value = lastSlot;
      } else {
        const firstSlot = slots.value[0];
        if (firstSlot && firstSlot > selectedSlot.value) {
          selectedSlot.value = firstSlot;
        }
      }
    } else {
      selectedSlot.value = null;
    }
  }
});

watch(selectedSlot, async (value) => {
  // console.log("selectedSlot", value?.toISOString());
});

const selectedDuration = useLocalStorage("booking:duration", 60, {
  initOnMounted: true,
});

watch(selectedDuration, async (value) => {
  // console.log("selectedDuration", value);

  await fetchSlots();
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

const book = async () => {
  if (
    !selectedGame.value ||
    !date.value ||
    !selectedLocation.value ||
    !selectedSlot.value ||
    !selectedDuration.value
  ) {
    return;
  }

  try {
    bookingData.value = await $fetch("/api/bookings", {
      method: "POST",
      body: {
        date: selectedSlot.value.toISOString(),
        details: details.value,
        duration: selectedDuration.value,
        game: selectedGame.value,
        location: selectedLocation.value,
      },
    });
  } catch (response) {
    if ((response as any).data.data.error.code === "UnprocessableEntityException") {
      // TODO: Show toast?
      selectedSlot.value = null;
    }

    await fetchSlots();
    return;
  }

  createStripePaymentElement();
};

const cancel = async () => {
  if (!bookingData.value) {
    return;
  }

  await $fetch(`/api/bookings/${bookingData.value.id}/cancel`, {
    method: "POST",
  });

  await reset();
};

let stripe: Stripe | null;
const stripePaymentElementPlaceholder = ref<HTMLElement>();
let stripeElements = ref<StripeElements>();
let stripePaymentElement = ref<StripePaymentElement>();

const pay = async () => {
  if (!stripe || !stripeElements.value) {
    return;
  }

  const { error: submitError } = await stripeElements.value.submit();

  if (submitError) {
    handlePaymentError(submitError);
    return;
  }

  const { error } = await stripe.confirmPayment({
    clientSecret: (bookingData.value as any).stripeClientSecret,
    elements: stripeElements.value,
    confirmParams: {
      return_url: `${location.origin}/#reserveren`,
    },
    redirect: "if_required",
  });

  if (error) {
    handlePaymentError(error);
  }
};

const handlePaymentError = (error: StripeError) => {
  // TODO: Visualize payment error messages
  console.error(`${error.code}: ${error.message}`);
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

  await fetchSlots();
};

onMounted(async () => {
  stripe = await loadStripe(runtimeConfig.public.stripePublishableApiKey, {
    locale: "nl",
  });

  if (bookingData.value) {
    await fetchBookingData();

    createStripePaymentElement();
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
            @click="selectedGame = game"
          />
        </div>
      </div>
      <div v-if="selectedGame" class="flex flex-col gap-4">
        <h2>Wanneer wil je spelen?</h2>
        <u-calendar
          v-model="date"
          size="xl"
          :is-date-unavailable="isDateUnavailable"
          :prevent-deselect="true"
          :year-controls="false"
        />
      </div>
      <div
        v-if="selectedGame && date && gameLocations[selectedGame] && gameLocations[selectedGame]!.length > 1"
        class="flex flex-col gap-4"
      >
        <h2>Welke {{ gameLocationDisplayNames[selectedGame] }} wil je reserveren?</h2>
        <div class="flex flex-wrap gap-4">
          <u-button
            v-for="location in gameLocations[selectedGame]"
            :key="location"
            class="flex-1"
            :label="location + ''"
            size="xl"
            :color="location === selectedLocation ? 'primary' : 'neutral'"
            :variant="location === selectedLocation ? 'solid' : 'ghost'"
            @click="selectedLocation = location"
          />
        </div>
      </div>
      <div v-if="selectedGame && date && selectedLocation" class="flex flex-col gap-4">
        <h2>Om hoe laat wil je spelen?</h2>
        <div class="flex flex-wrap gap-4">
          <u-button
            v-for="slot in slots"
            :key="slot.toISOString()"
            class="flex-1"
            :label="slot.toLocaleTimeString('nl-BE').substring(0, 5)"
            size="xl"
            :color="slot.toISOString() === selectedSlot?.toISOString() ? 'primary' : 'neutral'"
            :variant="slot.toISOString() === selectedSlot?.toISOString() ? 'solid' : 'ghost'"
            @click="selectedSlot = slot"
          />
          <p v-if="slots.length === 0">
            Er is geen tijdslot van {{ (selectedDuration / 60 + "u").replace(".", ",") }} meer
            beschikbaar voor {{ gameLocationDisplayNames[selectedGame] }} {{ selectedLocation }}.
          </p>
        </div>
      </div>
      <div v-if="selectedGame && date && selectedLocation" class="flex flex-col gap-4">
        <h2>Hoelang wil je reserveren?</h2>
        <div class="flex flex-wrap gap-4">
          <u-button
            v-for="duration in durations"
            :key="duration"
            class="flex-1"
            :label="(duration / 60 + 'u').replace('.', ',')"
            size="xl"
            :color="duration === selectedDuration ? 'primary' : 'neutral'"
            :variant="duration === selectedDuration ? 'solid' : 'ghost'"
            @click="selectedDuration = duration"
          />
        </div>
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
        <h2>Bevestiging</h2>
        <p>
          <span class="font-semibold">Spel</span>: {{ selectedGame.toUpperCase() }}
          {{ selectedLocation }}
        </p>
        <p>
          <span class="font-semibold">Datum</span>:
          {{ selectedSlot.toLocaleDateString("nl-BE") }}
          {{ selectedSlot.toLocaleTimeString("nl-BE").substring(0, 5)
          }}<span v-if="selectedSlotEnd">
            - {{ selectedSlotEnd.toLocaleTimeString("nl-BE").substring(0, 5) }}</span
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
        <u-button class="flex-1" label="Reserveer en betaal" size="xl" @click="book()" />
      </div>
    </div>
    <div v-else class="flex flex-col gap-8">
      <div class="flex flex-col gap-4">
        <h2>Bevestiging</h2>
        <p><span class="font-semibold">Spel</span>: {{ bookingData.calData.eventTitle }}</p>
        <p>
          <span class="font-semibold">Datum</span>:
          {{ new Date(bookingData.calData.startTime).toLocaleDateString("nl-BE") }}
          {{ new Date(bookingData.calData.startTime).toLocaleTimeString("nl-BE").substring(0, 5)
          }}<span v-if="bookingData.calData.endTime">
            -
            {{
              new Date(bookingData.calData.endTime).toLocaleTimeString("nl-BE").substring(0, 5)
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
          <p v-if="bookingData.paid"><span class="font-semibold">Betaalstatus</span>: Betaald</p>
        </div>
      </div>
    </div>
    <div
      v-show="bookingData && !bookingData.paid && stripePaymentElement"
      class="flex flex-col gap-4"
    >
      <h2>Betaling</h2>
      <div ref="stripePaymentElementPlaceholder"></div>
      <u-button class="flex-1" label="Betalen" size="xl" @click="pay()" />
    </div>
    <!-- TODO: Confirmation -->
    <u-button
      v-if="bookingData && !bookingData.paid && !bookingData.calData?.disableCancelling"
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
