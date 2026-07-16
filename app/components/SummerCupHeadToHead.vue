<script setup lang="ts">
import type { DayPlayer } from "#shared/data/summerCupResults";
import type { HeadToHeadCell } from "#shared/summerCup/stats";

defineProps<{
  players: DayPlayer[];
  /** grid[i][j] = record of player i vs player j; null on the diagonal */
  grid: (HeadToHeadCell | null)[][];
}>();
</script>

<template>
  <div class="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
    <!-- Numbered player legend -->
    <ol class="flex flex-col gap-3">
      <li v-for="(player, i) in players" :key="player.id" class="flex items-center gap-3">
        <span class="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-sm font-semibold">
          {{ i + 1 }}
        </span>
        <span>{{ player.name }}</span>
      </li>
    </ol>

    <!-- Head-to-head matrix -->
    <div class="overflow-x-auto">
      <table class="border-collapse text-center">
        <thead>
          <tr>
            <th class="w-12 border border-white/25 py-1 font-semibold">#</th>
            <th
              v-for="(player, j) in players"
              :key="player.id"
              class="w-12 border border-white/25 py-1 font-semibold"
            >
              {{ j + 1 }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in grid" :key="i">
            <th class="border border-white/25 px-2 py-1 font-semibold">{{ i + 1 }}</th>
            <td
              v-for="(cell, j) in row"
              :key="j"
              class="w-12 whitespace-nowrap border border-white/25 px-1 py-1 text-sm"
              :class="{
                'bg-black': cell === null,
                'font-semibold': cell !== null && cell.matches > 0 && cell.framesFor > cell.framesAgainst,
                'opacity-60': cell !== null && cell.matches > 0 && cell.framesFor < cell.framesAgainst,
              }"
            >
              {{ cell === null || cell.matches === 0 ? "" : `${cell.framesFor}–${cell.framesAgainst}` }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
