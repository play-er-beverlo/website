<script setup lang="ts">
const route = useRoute();
const token = computed(() => String(route.params.token ?? ""));

useSeoMeta({
  title: "Uitschrijven — 6 Reds SummER Cup 2026",
  robots: "noindex, nofollow",
});

interface CancelInfo {
  found: boolean;
  name?: string;
  playDayLabel?: string;
  cancellable?: boolean;
}

const { data: info } = await useFetch<CancelInfo>(
  () => `/api/6-reds-summer-cup/cancellations/${token.value}`
);

const submitting = ref(false);
const done = ref(false);
const failed = ref(false);

const cancel = async () => {
  if (submitting.value) return;
  submitting.value = true;
  failed.value = false;
  try {
    await $fetch(`/api/6-reds-summer-cup/cancellations/${token.value}`, {
      method: "POST",
    });
    done.value = true;
  } catch {
    failed.value = true;
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="w-full">
    <div class="mx-auto max-w-2xl px-8 py-16 flex flex-col gap-6">
      <h1>Uitschrijven</h1>

      <template v-if="done">
        <u-alert
          title="Je bent uitgeschreven"
          description="Je plaats is weer vrijgekomen. We hebben je een bevestigingsmail gestuurd."
          color="success"
          variant="subtle"
        />
        <u-button
          to="/6-reds-summer-cup"
          label="Terug naar de inschrijvingspagina"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template v-else-if="!info?.found">
        <u-alert
          title="Niet gevonden"
          description="Deze inschrijving bestaat niet (meer). Mogelijk ben je al uitgeschreven."
          color="warning"
          variant="subtle"
        />
        <u-button
          to="/6-reds-summer-cup"
          label="Naar de inschrijvingspagina"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template v-else-if="!info.cancellable">
        <u-alert
          title="Uitschrijven niet meer mogelijk"
          :description="`De speeldag (${info.playDayLabel}) is al begonnen of voorbij. Neem contact op via snooker@play-er.be als je nog vragen hebt.`"
          color="warning"
          variant="subtle"
        />
      </template>

      <template v-else>
        <p>
          Wil je je inschrijving voor
          <span class="font-semibold">{{ info.playDayLabel }}</span> annuleren? Je plaats komt
          dan weer vrij voor iemand anders.
        </p>
        <u-alert
          v-if="failed"
          title="Mislukt"
          description="Er ging iets mis. Probeer het later opnieuw."
          color="error"
          variant="subtle"
        />
        <div class="flex flex-wrap gap-3">
          <u-button
            label="Uitschrijving bevestigen"
            color="error"
            size="xl"
            :loading="submitting"
            :disabled="submitting"
            @click="cancel()"
          />
          <u-button
            to="/6-reds-summer-cup"
            label="Toch niet"
            color="neutral"
            variant="ghost"
            size="xl"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<style></style>
