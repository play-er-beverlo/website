<script setup lang="ts">
import type { PlayerBreaks } from "#shared/summerCup/breaks";

defineProps<{
  breaks: PlayerBreaks[];
}>();
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">Breaks (30+)</h3>
    <ul class="flex flex-col gap-2">
      <li v-for="row in breaks" :key="row.player.id" class="flex items-baseline gap-3">
        <span class="min-w-40">{{ row.player.name }}</span>
        <span class="font-bold">{{ row.breaks.join(", ") }}</span>
      </li>
    </ul>
  </div>
</template>
