<script setup lang="ts">
import { MIN_PER_PLAY_DAY, MAX_PER_PLAY_DAY } from "#shared/data/summerCup";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Wedstrijdblad — leeg",
  robots: "noindex, nofollow",
});

const playerCounts = Array.from(
  { length: MAX_PER_PLAY_DAY - MIN_PER_PLAY_DAY + 1 },
  (_, i) => MIN_PER_PLAY_DAY + i,
);

const count = ref(MAX_PER_PLAY_DAY);
const tournament = ref("");
const date = ref("");
</script>

<template>
  <SummerCupWedstrijdbladSheet :count="count">
    <template #controls="{ print }">
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-neutral-700">Spelers:</span>
          <div class="flex gap-1">
            <button
              v-for="n in playerCounts"
              :key="n"
              type="button"
              class="h-8 w-8 rounded text-sm font-semibold"
              :class="
                n === count
                  ? 'bg-neutral-800 text-white'
                  : 'bg-white text-neutral-800 ring-1 ring-neutral-300 hover:bg-neutral-100'
              "
              @click="count = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm font-medium text-neutral-700">
          Toernooi:
          <input
            v-model="tournament"
            type="text"
            placeholder="bv. 1"
            class="w-24 rounded px-2 py-1 text-sm font-normal text-black ring-1 ring-neutral-300"
          >
        </label>

        <label class="flex items-center gap-2 text-sm font-medium text-neutral-700">
          Datum:
          <input
            v-model="date"
            type="text"
            placeholder="bv. woensdag 17 juni 2026"
            class="w-56 rounded px-2 py-1 text-sm font-normal text-black ring-1 ring-neutral-300"
          >
        </label>

        <button
          type="button"
          class="ml-auto rounded bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
          @click="print"
        >
          Afdrukken
        </button>
      </div>
    </template>

    <template #header>
      <div class="text-2xl font-bold text-primary">6 Reds SummER Cup</div>
      <div class="flex flex-wrap gap-x-10 gap-y-1 text-lg">
        <div class="flex items-baseline gap-2">
          <span class="font-semibold">Toernooi:</span>
          <span v-if="tournament">{{ tournament }}</span>
          <span v-else class="inline-block min-w-[40mm] border-b border-black">&nbsp;</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-semibold">Datum:</span>
          <span v-if="date">{{ date }}</span>
          <span v-else class="inline-block min-w-[70mm] border-b border-black">&nbsp;</span>
        </div>
      </div>
    </template>
  </SummerCupWedstrijdbladSheet>
</template>
