<script setup lang="ts">
import type { RankingEvolution } from "#shared/summerCup/stats";

const props = defineProps<{
  evolution: RankingEvolution;
}>();

const COLORS = [
  "#f59e0b", "#38bdf8", "#34d399", "#f472b6", "#a78bfa",
  "#fb923c", "#4ade80", "#f87171", "#22d3ee", "#facc15",
  "#c084fc", "#2dd4bf", "#fda4af", "#a3e635", "#93c5fd",
];

const STEP_X = 90;
const STEP_Y = 28;
const PAD_TOP = 16;
const PAD_LEFT = 36;
const LABEL_WIDTH = 190;
const AXIS_HEIGHT = 28;

const dayCount = computed(() => props.evolution.dayIds.length);
const playerCount = computed(() => props.evolution.series.length);
const width = computed(() => PAD_LEFT + STEP_X * Math.max(dayCount.value - 1, 0) + LABEL_WIDTH);
const height = computed(() => PAD_TOP * 2 + STEP_Y * Math.max(playerCount.value - 1, 0) + AXIS_HEIGHT);

function x(k: number): number {
  return PAD_LEFT + k * STEP_X;
}
function y(position: number): number {
  return PAD_TOP + (position - 1) * STEP_Y;
}

/** "2026-06-17" -> "17/06" */
function dayLabel(id: string): string {
  return `${id.slice(8, 10)}/${id.slice(5, 7)}`;
}

const lines = computed(() =>
  props.evolution.series.map((series, i) => {
    const points = series.positions
      .map((position, k) => (position === null ? null : { x: x(k), y: y(position) }))
      .filter((point): point is { x: number; y: number } => point !== null);
    const path = points
      .map((point, idx) => `${idx === 0 ? "M" : "L"}${point.x},${point.y}`)
      .join(" ");
    const last = points.at(-1);
    return { player: series.player, color: COLORS[i % COLORS.length], points, path, last };
  })
);

const positionTicks = computed(() =>
  Array.from({ length: playerCount.value }, (_, i) => i + 1)
);
</script>

<template>
  <div class="overflow-x-auto">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      role="img"
      aria-label="Positieverloop in de SummER Ranking per speeldag"
    >
      <!-- Position numbers on the left -->
      <text
        v-for="tick in positionTicks"
        :key="tick"
        :x="PAD_LEFT - 14"
        :y="y(tick) + 4"
        class="fill-white/60 text-[11px]"
        text-anchor="end"
      >
        {{ tick }}
      </text>

      <!-- Day labels along the bottom -->
      <text
        v-for="(dayId, k) in evolution.dayIds"
        :key="dayId"
        :x="x(k)"
        :y="height - 8"
        class="fill-white/60 text-[11px]"
        text-anchor="middle"
      >
        {{ dayLabel(dayId) }}
      </text>

      <!-- One line + dots + name label per player -->
      <g v-for="line in lines" :key="line.player.id">
        <path v-if="line.points.length > 1" :d="line.path" fill="none" :stroke="line.color" stroke-width="2" />
        <circle
          v-for="(point, idx) in line.points"
          :key="idx"
          :cx="point.x"
          :cy="point.y"
          r="3.5"
          :fill="line.color"
        />
        <text
          v-if="line.last"
          :x="line.last.x + 10"
          :y="line.last.y + 4"
          :fill="line.color"
          class="text-[12px] font-semibold"
        >
          {{ line.player.name }}
        </text>
      </g>
    </svg>
  </div>
</template>
