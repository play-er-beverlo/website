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
const count = computed(() => players.value.length);
// 4-5 players play 2 frames per match, 6-8 players play 1.
const framesPerMatch = computed(() => (count.value <= 5 ? 2 : 1));

function printSheet() {
  window.print();
}
</script>

<template>
  <div class="wedstrijdblad min-h-screen bg-neutral-200 py-8 text-black">
    <!-- Screen-only toolbar -->
    <div class="mx-auto mb-6 flex max-w-[277mm] items-center justify-between px-6 print:hidden">
      <span class="text-sm text-neutral-600">Afdrukken als liggend A4.</span>
      <button
        type="button"
        class="rounded bg-neutral-800 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
        @click="printSheet"
      >
        Afdrukken
      </button>
    </div>

    <!-- The printable sheet -->
    <div class="sheet mx-auto max-w-[277mm] bg-white p-10 shadow-lg print:max-w-none print:p-0 print:shadow-none">
      <header class="mb-6 flex flex-col gap-3 border-b-2 border-black pb-3">
        <img src="~/assets/images/Play-ER.svg" alt="Play-ER logo" class="h-12 w-auto self-start" />
        <div class="text-2xl font-bold text-primary">6 Reds SummER Cup — {{ playDay.label }}</div>
      </header>

      <p v-if="count === 0" class="text-lg">Nog geen inschrijvingen.</p>

      <div v-else class="flex flex-col gap-10">
        <div class="flex flex-wrap items-start gap-12">
        <!-- Player legend with a handicap start-score column.
             Cells are h-10 to match the matrix rows so the lines line up. -->
        <table class="border-collapse">
          <thead>
            <tr>
              <th class="h-10 border border-black px-2 font-semibold">#</th>
              <th class="h-10 border border-black px-4 text-left font-semibold">Speler</th>
              <th class="h-10 border border-black px-3 font-semibold">Handicap</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, i) in players" :key="i">
              <th class="h-10 border border-black px-2 text-center font-semibold">{{ i + 1 }}</th>
              <td class="h-10 border border-black px-4 whitespace-nowrap">{{ player.name }}</td>
              <td class="h-10 border border-black px-3"/>
            </tr>
          </tbody>
        </table>

        <!-- Blank round-robin results matrix -->
        <table class="border-collapse text-center">
          <caption class="caption-bottom pt-2 text-sm font-medium text-neutral-700">
            Telkens {{ framesPerMatch }} {{ framesPerMatch === 1 ? "frame" : "frames" }}
          </caption>
          <thead>
            <tr>
              <th class="h-10 w-10 border border-black font-semibold">#</th>
              <th
                v-for="j in count"
                :key="j"
                class="h-10 w-10 border border-black font-semibold"
              >
                {{ j }}
              </th>
              <th class="h-10 border border-black px-3 font-semibold">Totaal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in count" :key="i">
              <th class="h-10 w-10 border border-black font-semibold">{{ i }}</th>
              <td
                v-for="j in count"
                :key="j"
                class="h-10 w-10 border border-black"
                :class="i === j ? 'diagonal' : ''"
              />
              <td class="h-10 w-16 border border-black"/>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Hand-fillable breaks (30+) per player -->
        <div>
          <div class="mb-2 text-lg font-bold">Breaks (30+)</div>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="h-10 w-10 border border-black px-2 font-semibold">#</th>
                <th class="h-10 border border-black px-4 text-left font-semibold">Speler</th>
                <th class="h-10 border border-black px-3 text-left font-semibold">Breaks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(player, i) in players" :key="i">
                <th class="h-10 w-10 border border-black px-2 text-center font-semibold">{{ i + 1 }}</th>
                <td class="h-10 border border-black px-4 whitespace-nowrap">{{ player.name }}</td>
                <td class="h-10 border border-black px-3"/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The blacked-out diagonal of the matrix; force it to print. */
.diagonal {
  background: black;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 12mm;
  }

  .wedstrijdblad {
    min-height: 0;
    padding: 0;
    background: white;
  }

  /* Make table borders render reliably in print. */
  .sheet {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
