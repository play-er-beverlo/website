<script setup lang="ts">
import { finaleDay, getPlayDay, MIN_PER_PLAY_DAY, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS, REGISTRATION_FEE, PLAY_TIME } from "#shared/data/summerCup";
import { playDayResults } from "#shared/data/summerCupResults";
import { buildResultsGrid, computeDayStandings, computeSummerRanking } from "#shared/summerCup/standings";

useSeoMeta({
  title: "6 Reds SummER Cup 2026",
  description:
    "Recreatieve zomercompetitie in 6 Reds snookerformaat bij Play-ER in Beverlo. Bekijk het reglement en schrijf je in voor een speeldag.",
});

const showMoreInfo = ref(false);

const summerRanking = computeSummerRanking(playDayResults);

// Play days that have results, newest first.
const resultBlocks = [...playDayResults]
  .sort((a, b) => (a.playDayId < b.playDayId ? 1 : -1))
  .map((day) => ({
    id: day.playDayId,
    label: getPlayDay(day.playDayId)?.label ?? day.playDayId,
    players: day.players,
    grid: buildResultsGrid(day),
    standings: computeDayStandings(day),
  }));
</script>

<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <section id="hero" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 h-[220px] md:h-[320px] flex flex-col items-center justify-center gap-4 text-center text-white">
      <h1 class="text-shadow-lg">6 REDS SUMMER CUP 2026</h1>
      <p class="text-lg">Recreatieve zomercompetitie 6 Reds snooker · juni – augustus 2026</p>
    </div>
  </section>

  <section id="uitleg" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-12">
      <div class="flex flex-col gap-4">
        <h1>HET TOERNOOI</h1>
        <p>
          De 6 Reds SummER Cup 2026 is een recreatieve zomercompetitie in 6 Reds snookerformaat,
          georganiseerd over meerdere toernooiedities gedurende de zomer van 2026. Het toernooi is
          enkel georganiseerd voor leden van Play-ER.
        </p>
        <p>
          Er wordt gespeeld om de twee weken, telkens op woensdag en vrijdag vanaf {{ PLAY_TIME }}.
          De eerste speeldag vindt plaats op woensdag 17 juni 2026.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <h2>Kalender</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="py-2 pr-4">Toernooi</th>
                <th class="py-2 pr-4">Woensdag</th>
                <th class="py-2">Vrijdag</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 1</td><td class="py-2 pr-4">woe 17 juni 2026</td><td class="py-2">vrij 19 juni 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 2</td><td class="py-2 pr-4">woe 1 juli 2026</td><td class="py-2">vrij 3 juli 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 3</td><td class="py-2 pr-4">woe 15 juli 2026</td><td class="py-2">vrij 17 juli 2026</td></tr>
              <tr class="border-b border-gray-700"><td class="py-2 pr-4">Toernooi 4</td><td class="py-2 pr-4">woe 29 juli 2026</td><td class="py-2">vrij 31 juli 2026</td></tr>
              <tr><td class="py-2 pr-4 font-semibold">Finaledag</td><td class="py-2 pr-4">—</td><td class="py-2 font-semibold">vrij 14 augustus 2026</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm opacity-80">Alle speeldagen starten om {{ PLAY_TIME }}.</p>
      </div>

      <u-button
        :label="showMoreInfo ? 'Minder informatie' : 'Meer informatie'"
        :trailing-icon="showMoreInfo ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        size="xl"
        @click="showMoreInfo = !showMoreInfo"
      />

      <div v-show="showMoreInfo" class="flex flex-col gap-12">
        <div class="flex flex-col gap-4">
          <h2>Inschrijvingen &amp; plaatsen</h2>
          <ul class="list-disc ps-6 flex flex-col gap-2">
            <li>Per toernooi zijn er twee afzonderlijke speeldagen: woensdag en vrijdag.</li>
            <li>Spelers mogen deelnemen aan één speeldag per toernooi OF aan beide indien er nog plaatsen beschikbaar zijn (enkel je beste resultaat telt en spelers die nog niet speelden, krijgen voorrang).</li>
            <li>Minimum {{ MIN_PER_PLAY_DAY }} en maximum {{ MAX_PER_PLAY_DAY }} deelnemers per speeldag.</li>
            <li>Maximum {{ MAX_UNIQUE_PLAYERS }} unieke deelnemers voor de editie 2026.</li>
          </ul>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Inschrijvingsgeld</h2>
          <ul class="list-disc ps-6 flex flex-col gap-2">
            <li>Het inschrijvingsgeld bedraagt &euro; {{ REGISTRATION_FEE }} per speelavond.</li>
            <li>Betaling gebeurt vóór aanvang van de speeldag om je inschrijving te bevestigen, op het rekeningnummer dat je in de bevestigingsmail ontvangt.</li>
            <li>Een deel van het inschrijvingsgeld is voor de huur van de tafels. Met het andere deel worden prijzen voorzien (cash, drankkaarten, …).</li>
          </ul>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Wedstrijdformat</h2>
          <ul class="list-disc ps-6 flex flex-col gap-2">
            <li>Iedere speeldag wordt gespeeld in 1 poule.</li>
            <li>Iedere speler speelt tegen iedere andere speler.</li>
            <li>Bij 4 of 5 deelnemers worden wedstrijden gespeeld over 2 frames.</li>
            <li>Bij meer dan 5 deelnemers worden wedstrijden gespeeld over 1 frame.</li>
          </ul>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Puntensysteem en ranking</h2>
          <ul class="list-disc ps-6 flex flex-col gap-2">
            <li>Iedere deelnemer ontvangt 2 deelnamepunten per speeldag.</li>
            <li>Daarnaast ontvangt iedere speler rankingpunten op basis van zijn eindpositie.</li>
            <li>Het aantal punten voor de winnaar is gelijk aan het aantal deelnemers, telkens één punt minder voor de volgende plaats.</li>
            <li>De top 2 van iedere speeldag ontvangt telkens 1 extra bonuspunt.</li>
          </ul>
          <p class="font-semibold">Voorbeeld bij 7 deelnemers</p>
          <p class="text-sm opacity-90">
            1e plaats: 8 punten · 2e plaats: 7 punten · 3e plaats: 5 punten · 4e plaats: 4 punten ·
            5e plaats: 3 punten · 6e plaats: 2 punten · 7e plaats: 1 punt. Bovenstaande punten komen
            bovenop de 2 deelnamepunten.
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Rangschikking tijdens een speeldag</h2>
          <p>
            Het aantal gewonnen frames bepaalt je plaats in de rangschikking van de speelavond
            (poule). Bij ex aequo wordt van boven naar beneden afgegaan:
          </p>
          <ol class="list-decimal ps-6 flex flex-col gap-2">
            <li>Aantal gewonnen frames</li>
            <li>Aantal gewonnen wedstrijden</li>
            <li>Onderling resultaat</li>
            <li>Black ball game (BO3)</li>
            <li>Indien na de BBG nog steeds gelijk: op en neer spelen over één band. Wie het dichtst bij de bovenband ligt, eindigt het hoogst.</li>
          </ol>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Finaledag</h2>
          <p>
            De beste 8 spelers uit de algemene Summer Ranking plaatsen zich voor de finaledag op
            {{ finaleDay.shortLabel }}. Het exacte format van de finaledag wordt later bekendgemaakt.
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <h2>(Gedrags)regels en andere</h2>
          <ul class="list-disc ps-6 flex flex-col gap-2">
            <li>Van alle deelnemers wordt sportief en respectvol gedrag verwacht. Onsportief gedrag kan leiden tot waarschuwing, puntenaftrek of uitsluiting.</li>
            <li>Een frame is afgelopen vanaf dat je méér dan 3 snookers nodig hebt nadat de laatste rode bal is gepot. Dit om de avond vlot te laten verlopen en nachtwerk te vermijden.</li>
            <li>Er wordt gewerkt met een aangepast handicapsysteem: spelers uit eerste afdeling en hoger starten op 0 punten, spelers uit 2e en 3e afdeling op 5 punten, spelers uit 4e en 5e afdeling op 10 punten. Voor spelers met een reservestatuut wordt vooraf in eer en geweten bepaald wat de startscore is.</li>
          </ul>
        </div>

        <div class="flex flex-col gap-4">
          <h2>Organisatie</h2>
          <p>
            De organisatie behoudt zich het recht voor om planning of formats aan te passen indien
            nodig. Door deelname aan de 6 Reds SummER Cup 2026 verklaart iedere speler zich akkoord
            met dit reglement.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="resultaten" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-8">
      <h1>RESULTATEN</h1>

      <div class="flex flex-col gap-4">
        <h2>SummER Ranking</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/30">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Speler</th>
                <th class="py-2 pr-4 text-center">Speeldagen</th>
                <th class="py-2 text-center">Punten</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summerRanking" :key="row.player.id" class="border-b border-white/15">
                <td class="py-2 pr-4">{{ row.position }}</td>
                <td class="py-2 pr-4">{{ row.player.name }}</td>
                <td class="py-2 pr-4 text-center">{{ row.playDaysCounted }}</td>
                <td class="py-2 text-center font-bold">{{ row.totalPoints }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-for="block in resultBlocks" :key="block.id" class="flex flex-col gap-6">
        <h2>{{ block.label }}</h2>
        <summer-cup-results-grid :players="block.players" :grid="block.grid" />
        <summer-cup-standings :standings="block.standings" />
      </div>
    </div>
  </section>

  <section id="inschrijven" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-8">
      <h1>INSCHRIJVEN</h1>
      <summer-cup-registration />
    </div>
  </section>
</template>

<style scoped>
@reference "./../../assets/css/main.css";

section#hero {
  @apply bg-neutral-500;
  background: radial-gradient(circle, rgba(102, 102, 102, 1) 0%, rgba(50, 48, 49, 1) 75%);
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.4) 10%, rgba(0, 0, 0, 0.9) 100%),
    url("~/assets/images/home_banner.jpg");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

section#resultaten {
  @apply bg-neutral-500 text-white;
}

/* The global h2 colour (text-neutral-500) matches this section's background,
   so make subtitles readable on the dark background. */
section#resultaten h2 {
  @apply text-white;
}
</style>
