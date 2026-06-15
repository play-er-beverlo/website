<script setup lang="ts">
import { playDayFromDateParam } from "#shared/summerCup/wedstrijdblad";

definePageMeta({ layout: false });

const route = useRoute();
const playDay = playDayFromDateParam(String(route.params.date));

if (!playDay) {
  throw createError({ statusCode: 404, statusMessage: "Onbekende speeldag", fatal: true });
}

const { data } = await useFetch(`/api/6-reds-summer-cup/play-days/${playDay.id}/players`);

useSeoMeta({
  title: `Wedstrijdblad — ${playDay.label}`,
  robots: "noindex, nofollow",
});

const players = computed(() => data.value?.players ?? []);
const names = computed(() => players.value.map((p) => p.name));
</script>

<template>
  <SummerCupWedstrijdbladSheet :count="names.length" :player-names="names">
    <template #header>
      <div class="text-2xl font-bold text-primary">6 Reds SummER Cup — {{ playDay.label }}</div>
    </template>
  </SummerCupWedstrijdbladSheet>
</template>
