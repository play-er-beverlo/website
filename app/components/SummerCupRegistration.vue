<script lang="ts" setup>
import QRCode from "qrcode";
import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";
import { REGISTRATION_FEE, payment, PLAY_TIME, getPlayDay } from "#shared/data/summerCup";
import { buildEpcQrPayload } from "#shared/summerCup/epc";

interface AvailabilityDay {
  id: string;
  label: string;
  shortLabel: string;
  tournament: number;
  registered: number;
  capacity: number;
  remaining: number;
  full: boolean;
  past: boolean;
}
interface AvailabilityResponse {
  playDays: AvailabilityDay[];
  uniquePlayers: number;
  maxUniquePlayers: number;
  editionUniqueReached: boolean;
}

const toast = useToast();

const { data: availability, refresh } = await useFetch<AvailabilityResponse>(
  "/api/6-reds-summer-cup/availability"
);

const selectedPlayDayId = ref<string | null>(null);
const name = ref("");
const email = ref("");

const selectedDay = computed(() =>
  availability.value?.playDays.find((d) => d.id === selectedPlayDayId.value)
);

// A play day is selectable as long as it is not full or past. The 16-unique-players
// edition cap is enforced server-side: new players are rejected, but players who are
// already registered can still add another day that still has space.
const canSelect = (day: AvailabilityDay) => !day.full && !day.past;

const qrDataUrl = ref<string | null>(null);

watchEffect(async () => {
  const day = selectedPlayDayId.value ? getPlayDay(selectedPlayDayId.value) : null;
  if (day && name.value.trim()) {
    const payload = buildEpcQrPayload({
      name: name.value,
      shortLabel: day.shortLabel,
      amount: REGISTRATION_FEE,
    });
    qrDataUrl.value = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 256,
    });
  } else {
    qrDataUrl.value = null;
  }
});

const submitting = ref(false);
const confirmation = ref<null | {
  name: string;
  email: string;
  playDayLabel: string;
  communication: string;
  id: number;
}>(null);

const canSubmit = computed(
  () => !!selectedPlayDayId.value && !!name.value.trim() && !!email.value.trim() && !!qrDataUrl.value
);

const register = async () => {
  if (submitting.value || !canSubmit.value) return;
  submitting.value = true;

  const qrCodeBase64 = qrDataUrl.value!.replace(/^data:image\/png;base64,/, "");

  try {
    const res = await $fetch("/api/6-reds-summer-cup/registrations", {
      method: "POST",
      body: {
        playDayId: selectedPlayDayId.value,
        name: name.value,
        email: email.value,
        qrCodeBase64,
      },
    });

    confirmation.value = {
      id: res.id,
      name: res.name,
      email: res.email,
      playDayLabel: res.playDayLabel,
      communication: res.communication,
    };
  } catch (response) {
    const message =
      (response as any)?.data?.error ??
      "Er ging iets mis tijdens het inschrijven. Probeer het later opnieuw.";
    const errorToast: Partial<Toast> = {
      title: "Mislukt!",
      description: message,
      color: "error",
    };
    toast.add(errorToast);
    await refresh();
  } finally {
    submitting.value = false;
  }
};

const resetForm = async () => {
  confirmation.value = null;
  selectedPlayDayId.value = null;
  name.value = "";
  email.value = "";
  await refresh();
};
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Confirmation -->
    <div v-if="confirmation" class="flex flex-col gap-4">
      <u-alert
        title="Ingeschreven!"
        :description="`Je inschrijving voor ${confirmation.playDayLabel} is geregistreerd. We hebben een bevestigingsmail gestuurd naar ${confirmation.email}.`"
        color="success"
        variant="subtle"
      />
      <h2>Betaling</h2>
      <p>
        Schrijf <span class="font-semibold">&euro; {{ REGISTRATION_FEE }}</span> over vóór de
        speeldag om je plaats te bevestigen.
      </p>
      <div class="flex flex-col gap-1">
        <p><span class="font-semibold">Begunstigde</span>: {{ payment.beneficiary }}</p>
        <p><span class="font-semibold">IBAN</span>: {{ payment.iban }}</p>
        <p><span class="font-semibold">BIC</span>: {{ payment.bic }}</p>
        <p><span class="font-semibold">Mededeling</span>: {{ confirmation.communication }}</p>
      </div>
      <img
        :src="`/api/6-reds-summer-cup/registrations/${confirmation.id}/qr.png`"
        alt="Betaal-QR-code"
        width="220"
        height="220"
        class="bg-white p-2 rounded"
      />
      <u-button
        class="flex-1"
        label="Nieuwe inschrijving"
        size="xl"
        color="neutral"
        variant="ghost"
        @click="resetForm()"
      />
    </div>

    <!-- Form -->
    <div v-else class="flex flex-col gap-8">
      <u-alert
        v-if="availability?.editionUniqueReached"
        title="Maximum deelnemers bereikt"
        description="Het maximum aantal unieke deelnemers (16) voor editie 2026 is bereikt. Nieuwe deelnemers kunnen niet meer inschrijven. Ben je al ingeschreven? Dan kan je nog een extra speeldag bijboeken zolang er plaats is."
        color="warning"
        variant="subtle"
      />

      <div class="flex flex-col gap-4">
        <h2>Kies je speeldag</h2>
        <div class="flex flex-col gap-3">
          <u-button
            v-for="day in availability?.playDays"
            :key="day.id"
            class="justify-between"
            size="xl"
            :color="day.id === selectedPlayDayId ? 'primary' : 'neutral'"
            :variant="day.id === selectedPlayDayId ? 'solid' : 'outline'"
            :disabled="!canSelect(day)"
            @click="selectedPlayDayId = day.id"
          >
            <span>{{ day.label }} — {{ PLAY_TIME }}</span>
            <span v-if="day.past">Voorbij</span>
            <span v-else-if="day.full">Volzet</span>
            <span v-else>nog {{ day.remaining }}/{{ day.capacity }}</span>
          </u-button>
        </div>
      </div>

      <div v-if="selectedPlayDayId" class="flex flex-col gap-4">
        <h2>Je gegevens</h2>
        <u-form-field class="flex-1" label="Naam" size="xl" :required="true">
          <u-input class="w-full" v-model="name" name="name" placeholder="Voor- en achternaam" />
        </u-form-field>
        <u-form-field class="flex-1" label="E-mail" size="xl" :required="true">
          <u-input
            class="w-full"
            v-model="email"
            name="email"
            type="email"
            placeholder="E-mail"
          />
        </u-form-field>
      </div>

      <div v-if="selectedPlayDayId && name.trim() && email.trim()" class="flex flex-col gap-4">
        <h2>Overzicht</h2>
        <p><span class="font-semibold">Speeldag</span>: {{ selectedDay?.label }} — {{ PLAY_TIME }}</p>
        <div class="flex flex-col gap-1">
          <p><span class="font-semibold">Naam</span>: {{ name }}</p>
          <p><span class="font-semibold">E-mail</span>: {{ email }}</p>
        </div>
        <p><span class="font-semibold">Inschrijvingsgeld</span>: &euro; {{ REGISTRATION_FEE }}</p>
        <p class="text-sm opacity-80">
          Na het inschrijven tonen we de betaalgegevens met QR-code en sturen we ze ook per e-mail.
        </p>
        <u-button
          :disabled="!canSubmit || submitting"
          :loading="submitting"
          class="flex-1"
          label="Inschrijven"
          size="xl"
          @click="register()"
        />
      </div>
    </div>
  </div>
</template>

<style></style>
