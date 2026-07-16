<script setup lang="ts">
import type { SeasonFacts } from "#shared/summerCup/stats";

const props = defineProps<{
  facts: SeasonFacts;
}>();

const tiles = computed(() => {
  const list = [
    { label: "Frames gespeeld", value: String(props.facts.totalFrames) },
    { label: "Matchen gespeeld", value: String(props.facts.totalMatches) },
    { label: "Deelnemers", value: String(props.facts.uniquePlayers) },
    { label: "Breaks (30+)", value: String(props.facts.breaksCount) },
    { label: "Gelijke spelen (1-1)", value: String(props.facts.drawCount) },
  ];
  if (props.facts.highestBreak) {
    list.splice(3, 0, {
      label: `Hoogste break — ${props.facts.highestBreak.player.name}`,
      value: String(props.facts.highestBreak.value),
    });
  }
  return list;
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    <div
      v-for="tile in tiles"
      :key="tile.label"
      class="flex flex-col items-center justify-center gap-1 rounded-lg bg-white/10 p-4 text-center"
    >
      <span class="text-3xl font-bold">{{ tile.value }}</span>
      <span class="text-sm opacity-80">{{ tile.label }}</span>
    </div>
  </div>
</template>
