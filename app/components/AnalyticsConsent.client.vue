<script setup>
const consent = useNuxtApp().$analyticsConsent;
const editing = ref(false);
const heading = useTemplateRef("heading");
const preferences = useTemplateRef("preferences");
const { height: viewportHeight } = useWindowSize();
const { top: footerTop, height: footerHeight } = useElementBounding(
  () => preferences.value?.closest("footer"),
);
const visibleFooterHeight = computed(() =>
  Math.max(0, Math.min(footerHeight.value, viewportHeight.value - footerTop.value)),
);

async function openPreferences() {
  editing.value = true;
  await nextTick();
  heading.value?.focus({ preventScroll: true });
}

function closePreferences() {
  editing.value = false;
  preferences.value?.focus({ preventScroll: true });
}

function choose(choice) {
  consent.value = choice;
  if (editing.value) closePreferences();
}
</script>

<template>
  <div v-if="consent !== undefined" class="print:hidden">
    <button
      ref="preferences"
      type="button"
      class="min-h-11 cursor-pointer hover:text-primary"
      :aria-expanded="!consent || editing"
      @click="openPreferences"
    >
      Cookievoorkeuren
    </button>
    <section
      v-if="!consent || editing"
      aria-labelledby="analytics-consent-title"
      class="consent-panel fixed z-50 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-5 text-left text-neutral-900 shadow-xl sm:p-6"
      :style="{ '--footer-visible': visibleFooterHeight + 'px' }"
      @keydown.esc="consent && editing && closePreferences()"
    >
      <div class="mb-3 flex items-center gap-3">
        <img src="~/assets/images/P.svg" width="36" height="36" alt="">
        <h2
          id="analytics-consent-title"
          ref="heading"
          tabindex="-1"
          class="text-xl font-bold tracking-tight text-neutral-900"
        >
          Cookies
        </h2>
      </div>
      <p class="text-[0.9375rem] leading-6 text-neutral-700">
        Mogen we met Google Analytics meten welke pagina’s je bezoekt?
        <template v-if="consent === 'accepted'">Je staat dit momenteel toe.</template>
        <template v-else-if="consent === 'declined'">Je hebt dit geweigerd.</template>
        <template v-else>Je kunt je keuze later wijzigen onderaan de pagina.</template>
      </p>
      <div class="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" class="consent-choice" @click="choose('declined')">Weigeren</button>
        <button type="button" class="consent-choice" @click="choose('accepted')">Toestaan</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.consent-panel {
  --gap: 0.75rem;
  --bottom: calc(var(--gap) + max(env(safe-area-inset-bottom), var(--footer-visible)));
  inset-inline-end: max(var(--gap), env(safe-area-inset-right));
  bottom: var(--bottom);
  max-height: calc(100dvh - var(--bottom) - var(--gap));
  width: min(23rem, calc(100% - 1.5rem));
}

@media (min-width: 40rem) {
  .consent-panel {
    --gap: 1.5rem;
  }
}

.consent-choice {
  @apply min-h-11 cursor-pointer rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-900 transition-colors hover:border-blue-500 hover:bg-blue-100 active:bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700;
}
</style>
