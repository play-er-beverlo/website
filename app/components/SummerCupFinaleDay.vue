<script setup lang="ts">
import type { DayPlayer } from "#shared/data/summerCupResults";
import type { FinaleDayResults } from "#shared/data/summerCupFinale";
import type { PlayerBreaks } from "#shared/summerCup/breaks";
import { buildResultsGrid } from "#shared/summerCup/standings";

const props = defineProps<{
  finale: FinaleDayResults;
  breaks: PlayerBreaks[];
}>();

/** Shown instead of the position number for the top 3. */
const MEDALS = ["🏆", "🥈", "🥉"];

const poules = computed(() =>
  props.finale.poules.map((poule) => {
    const byId = new Map(poule.players.map((p) => [p.id, p]));
    return {
      name: poule.name,
      players: poule.players,
      grid: buildResultsGrid(poule),
      note: poule.note,
      // Kept in the stored order, which is their finishing order in the poule.
      qualified: poule.qualified
        .map((id) => byId.get(id))
        .filter((p): p is DayPlayer => p !== undefined),
    };
  })
);
</script>

<template>
  <div class="flex flex-col gap-10">
    <div class="grid gap-10 lg:grid-cols-2">
      <div v-for="poule in poules" :key="poule.name" class="flex flex-col gap-4">
        <h3 class="text-lg font-semibold">{{ poule.name }}</h3>
        <summer-cup-results-grid :players="poule.players" :grid="poule.grid" />
        <div class="flex flex-col gap-1 text-sm opacity-80">
          <p>
            Naar de halve finale:
            <span class="font-semibold">{{ poule.qualified.map((p) => p.name).join(" en ") }}</span>
          </p>
          <p v-if="poule.note">{{ poule.note }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div v-for="round in finale.rounds" :key="round.name" class="flex flex-col gap-3">
        <h3 class="text-lg font-semibold">
          {{ round.name }}
          <span class="text-sm font-normal opacity-80">({{ round.format }})</span>
        </h3>
        <ul class="flex flex-col gap-2">
          <li
            v-for="tie in round.ties"
            :key="`${tie.a.id}-${tie.b.id}`"
            class="grid max-w-lg grid-cols-[1fr_auto_1fr] items-baseline gap-3"
          >
            <span class="text-right" :class="tie.framesA > tie.framesB ? 'font-bold' : ''">
              {{ tie.a.name }}
            </span>
            <span class="font-bold">{{ tie.framesA }} - {{ tie.framesB }}</span>
            <span :class="tie.framesB > tie.framesA ? 'font-bold' : ''">{{ tie.b.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">Eindstand finaledag</h3>
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
        <ol class="flex flex-col gap-3">
          <li
            v-for="(finalist, i) in finale.finalRanking"
            :key="finalist.id"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-sm font-semibold"
              aria-hidden="true"
            >
              {{ MEDALS[i] ?? i + 1 }}
            </span>
            <span class="sr-only">Plaats {{ i + 1 }}:</span>
            <span :class="i === 0 ? 'font-bold' : ''">{{ finalist.name }}</span>
          </li>
        </ol>
        <figure class="flex flex-col gap-2 sm:w-80 sm:shrink-0">
          <nuxt-img
            src="/images/6-reds-summer-cup-finaledag-top-3.jpg"
            alt="De top 3 van de finaledag met hun prijzen aan de snookertafel"
            sizes="100vw sm:320px"
            class="w-full rounded-lg"
          />
          <figcaption class="text-sm opacity-80">
            Steff, Danny en Marco @ The egg room by <a class="font-semibold opacity-100" href="https://lec.be" target="_blank" rel="noopener noreferrer">LEC</a>.
          </figcaption>
        </figure>
      </div>
    </div>

    <summer-cup-breaks v-if="breaks.length" :breaks="breaks" />
  </div>
</template>
