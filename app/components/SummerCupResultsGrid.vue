<script setup lang="ts">
import type { DayPlayer } from "#shared/data/summerCupResults";

const props = defineProps<{
  players: DayPlayer[];
  /** grid[i][j] = frames player i won vs player j; null on the diagonal */
  grid: (number | null)[][];
}>();

const scores = computed(() =>
  props.grid.map((row) => row.reduce<number>((sum, cell) => sum + (cell ?? 0), 0))
);
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

    <!-- Results matrix -->
    <div class="overflow-x-auto">
      <table class="border-collapse text-center">
        <thead>
          <tr>
            <th class="w-10 border border-white/25 py-1 font-semibold">#</th>
            <th
              v-for="(player, j) in players"
              :key="player.id"
              class="w-10 border border-white/25 py-1 font-semibold"
            >
              {{ j + 1 }}
            </th>
            <th class="border border-white/25 px-3 py-1 font-semibold">Totaal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in grid" :key="i">
            <th class="border border-white/25 px-2 py-1 font-semibold">{{ i + 1 }}</th>
            <td
              v-for="(cell, j) in row"
              :key="j"
              class="w-10 border border-white/25 py-1"
              :class="cell === null ? 'bg-black' : ''"
            >
              {{ cell === null ? "" : cell }}
            </td>
            <td class="border border-white/25 px-3 py-1 font-bold">{{ scores[i] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
