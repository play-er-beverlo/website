<script setup>
const consent = useNuxtApp().$analyticsConsent;
const editing = ref(false);

function choose(choice) {
  consent.value = choice;
  editing.value = false;
}
</script>

<template>
  <div v-if="consent !== undefined" class="print:hidden">
    <button type="button" class="cursor-pointer underline" @click="editing = true">
      Cookievoorkeuren
    </button>
    <section
      v-if="!consent || editing"
      aria-label="Analytische cookies"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-6 py-4 text-left text-neutral-900 shadow-lg"
    >
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p class="max-w-2xl">
          Mag Play-ER analytische cookies van Google Analytics gebruiken om te meten welke pagina’s
          worden bezocht? Je kunt je keuze later aanpassen via Cookievoorkeuren.
        </p>
        <div class="flex gap-3">
          <u-button label="Weigeren" color="neutral" variant="outline" @click="choose('declined')" />
          <u-button label="Toestaan" color="neutral" variant="outline" @click="choose('accepted')" />
        </div>
      </div>
    </section>
  </div>
</template>
