<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const title = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return "Pagina niet gevonden";
    default:
      return "Er ging iets mis";
  }
});

const description = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return "Deze pagina kon niet gevonden worden of bestaat niet meer.";
    default:
      return "Er ging hier iets mis. Probeer het later opnieuw.";
  }
});

useHead({
  title,
});
</script>

<template>
  <u-app>
    <nuxt-layout>
      <section class="max-w-6xl mx-auto flex flex-col gap-8 px-8 py-16 w-full">
        <img src="~/assets/images/Play-ER.svg" alt="Play-ER logo" width="240" />
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <div>
          <u-button
            label="Terug naar startpagina"
            icon="i-lucide-arrow-left"
            to="/"
            color="secondary"
            size="xl"
          />
        </div>
      </section>
    </nuxt-layout>
  </u-app>
</template>
