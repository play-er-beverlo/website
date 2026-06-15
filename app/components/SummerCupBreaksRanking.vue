<script setup lang="ts">
import type { PlayerBreaks } from "#shared/summerCup/breaks";

defineProps<{
  breaks: PlayerBreaks[];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-white/30">
          <th class="py-2 pr-4">#</th>
          <th class="py-2 pr-4">Speler</th>
          <th class="py-2">Breaks</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in breaks" :key="row.player.id" class="border-b border-white/15">
          <td class="py-2 pr-4">{{ i + 1 }}</td>
          <td class="py-2 pr-4">{{ row.player.name }}</td>
          <td class="py-2 font-bold">{{ row.breaks.join(", ") }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
