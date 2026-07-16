<script setup lang="ts">
import type { PlayerStats } from "#shared/summerCup/stats";

defineProps<{
  stats: PlayerStats[];
}>();

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function avg(value: number): string {
  return value.toFixed(1);
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-white/30">
          <th class="py-2 pr-4">Speler</th>
          <th class="py-2 pr-4 text-center">Frames (G/T)</th>
          <th class="py-2 pr-4 text-center">Winst-%</th>
          <th class="py-2 pr-4 text-center">Matchen (W-V-G)</th>
          <th class="py-2 pr-4 text-center">Dagwinsten</th>
          <th class="py-2 pr-4 text-center">Podiums</th>
          <th class="py-2 pr-4 text-center">Gem. positie</th>
          <th class="py-2 text-center">Perfecte dagen</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in stats" :key="s.player.id" class="border-b border-white/15">
          <td class="py-2 pr-4">{{ s.player.name }}</td>
          <td class="py-2 pr-4 text-center">{{ s.framesWon }}/{{ s.framesPlayed }}</td>
          <td class="py-2 pr-4 text-center font-bold">{{ pct(s.frameWinPct) }}</td>
          <td class="py-2 pr-4 text-center">{{ s.matchesWon }}-{{ s.matchesLost }}-{{ s.matchesDrawn }}</td>
          <td class="py-2 pr-4 text-center">{{ s.dayWins }}</td>
          <td class="py-2 pr-4 text-center">{{ s.podiums }}</td>
          <td class="py-2 pr-4 text-center">{{ avg(s.avgPosition) }}</td>
          <td class="py-2 text-center">{{ s.perfectDays > 0 ? "🏆".repeat(s.perfectDays) : "—" }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
