<script setup lang="ts">
import type { DayStanding } from "#shared/summerCup/standings";

defineProps<{
  standings: DayStanding[];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-white/30">
          <th class="py-2 pr-4">#</th>
          <th class="py-2 pr-4">Speler</th>
          <th class="py-2 pr-4 text-center">Frames</th>
          <!-- <th class="py-2 pr-4 text-center">Wedstrijden</th> -->
          <th class="py-2 pr-4 text-center">Punten:</th>
          <th class="py-2 pr-4 text-center">Ranking</th>
          <th class="py-2 pr-4 text-center">Deelname</th>
          <th class="py-2 pr-4 text-center">Bonus</th>
          <th class="py-2 text-center">Totaal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in standings" :key="s.player.id" class="border-b border-white/15">
          <td class="py-2 pr-4">{{ s.position }}</td>
          <td class="py-2 pr-4">{{ s.player.name }}</td>
          <td class="py-2 pr-4 text-center">{{ s.framesWon }}</td>
          <!-- <td class="py-2 pr-4 text-center">{{ s.matchesWon }}</td> -->
          <td class="py-2 pr-4 text-center"></td> 
          <td class="py-2 pr-4 text-center">{{ s.rankingPoints }}</td>
          <td class="py-2 pr-4 text-center">{{ s.participationPoints }}</td>
          <td class="py-2 pr-4 text-center">{{ s.bonusPoints }}</td>
          <td class="py-2 text-center font-bold">{{ s.totalPoints }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
