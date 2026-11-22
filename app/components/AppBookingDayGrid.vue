<script lang="ts" setup>
import {
  BLOCK_MINUTES,
  formatTime,
  freeBlocks,
  moveSelection,
  nextSelection,
  resizeSelection,
  rowTimes,
  type BookingSelection,
} from "#shared/booking/dayGrid";
import { durations } from "#shared/data/booking";

export type BookingColumn = {
  location: number;
  label: string;
  shortLabel: string;
  slotStarts: Date[];
};

const props = defineProps<{
  columns: BookingColumn[];
  loading: boolean;
  failed: boolean;
}>();

defineEmits<{ retry: [] }>();

const selection = defineModel<BookingSelection | null>("selection", { default: null });

const BLOCK_MS = BLOCK_MINUTES * 60 * 1000;

const freeByLocation = computed(
  () => new Map(props.columns.map((column) => [column.location, freeBlocks(column.slotStarts)]))
);

const rows = computed(() => rowTimes([...freeByLocation.value.values()]));

// The loading skeleton keeps the height of the grid it replaces, so the page does not jump.
const ROW_REM = 2;
const skeletonRows = ref(8);

watch(rows, (value) => {
  if (value.length > 0) {
    skeletonRows.value = value.length;
  }
});

const isFree = (location: number, time: number) =>
  freeByLocation.value.get(location)?.has(time) ?? false;

const selectionEnd = computed(() =>
  selection.value ? selection.value.start.valueOf() + selection.value.duration * 60 * 1000 : 0
);

const isSelected = (location: number, time: number) =>
  !!selection.value &&
  selection.value.location === location &&
  time >= selection.value.start.valueOf() &&
  time < selectionEnd.value;

const selectionFor = (location: number, time: number) =>
  nextSelection(
    freeByLocation.value.get(location) ?? new Set(),
    selection.value,
    location,
    time,
    durations
  );

const select = (location: number, time: number) => {
  const next = selectionFor(location, time);

  if (next) {
    selection.value = next;
  }
};

// The selection is drawn as one bar on top of its blocks. Like in a calendar app, its top and
// bottom edge can be dragged to change the start or end, and the bar itself can be dragged to
// another time or table.
const bar = computed(() => {
  const current = selection.value;

  if (!current) {
    return null;
  }

  const column = props.columns.findIndex((item) => item.location === current.location);
  const row = rows.value.indexOf(current.start.valueOf());

  return column === -1 || row === -1
    ? null
    : {
        gridColumn: column + 2,
        gridRow: `${row + 2} / span ${current.duration / BLOCK_MINUTES}`,
      };
});

type Drag = {
  mode: "start" | "end" | "move";
  // Latest selection of this drag; the model only catches up after the parent re-renders.
  current: BookingSelection;
  // For a move: how far below the start of the bar it was grabbed.
  grabOffset: number;
  moved: boolean;
};

let drag: Drag | null = null;
let suppressClick = false;
const dragging = ref(false);

const cellAt = (event: MouseEvent) => {
  const element = document
    .elementsFromPoint(event.clientX, event.clientY)
    .find((item): item is HTMLElement => item instanceof HTMLElement && !!item.dataset.cell);

  if (!element) {
    return null;
  }

  const [location, time] = element.dataset.cell!.split(":").map(Number) as [number, number];

  return { location, time };
};

const onDragStart = (event: PointerEvent, mode: Drag["mode"]) => {
  // A finger on the bar scrolls the page; on touch only the two edges drag.
  if (!selection.value || (mode === "move" && event.pointerType === "touch")) {
    return;
  }

  const cell = cellAt(event);

  drag = {
    mode,
    current: selection.value,
    grabOffset: cell ? cell.time - selection.value.start.valueOf() : 0,
    moved: false,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const onDragMove = (event: PointerEvent) => {
  const cell = drag && cellAt(event);

  if (!drag || !cell) {
    return;
  }

  const { current } = drag;
  const next =
    drag.mode === "move"
      ? moveSelection(
          freeByLocation.value.get(cell.location) ?? new Set(),
          current,
          cell.location,
          cell.time - drag.grabOffset,
          durations
        )
      : resizeSelection(
          freeByLocation.value.get(current.location) ?? new Set(),
          current,
          drag.mode,
          cell.time,
          durations
        );

  if (
    next &&
    (next.location !== current.location ||
      next.start.valueOf() !== current.start.valueOf() ||
      next.duration !== current.duration)
  ) {
    drag.current = next;
    drag.moved = true;
    dragging.value = true;
    selection.value = next;
  }
};

const onDragEnd = () => {
  // The click that follows a drag must not count as a tap on the block under the pointer.
  suppressClick = !!drag?.moved;
  drag = null;
  dragging.value = false;
};

const onBarClick = (event: MouseEvent) => {
  if (suppressClick) {
    suppressClick = false;
    return;
  }

  const cell = cellAt(event);

  if (cell) {
    select(cell.location, cell.time);
  }
};

const cellLabel = (column: BookingColumn, time: number) => {
  const state = isSelected(column.location, time)
    ? "geselecteerd"
    : !isFree(column.location, time)
      ? "bezet"
      : selectionFor(column.location, time)
        ? "vrij"
        : "vrij, niet selecteerbaar";

  return `${column.label}, ${formatTime(time)} tot ${formatTime(time + BLOCK_MS)}, ${state}`;
};

// Keyboard: the grid is one tab stop and the arrow keys move between selectable blocks.
const grid = ref<HTMLElement>();
const focused = ref<string | null>(null);
const cellKey = (location: number, time: number) => `${location}:${time}`;

const tabStop = computed(() => {
  if (focused.value) {
    const [location, time] = focused.value.split(":").map(Number) as [number, number];

    if (selectionFor(location, time)) {
      return focused.value;
    }
  }

  const start = selection.value?.start.valueOf();

  if (selection.value && start && selectionFor(selection.value.location, start)) {
    return cellKey(selection.value.location, start);
  }

  for (const time of rows.value) {
    for (const column of props.columns) {
      if (selectionFor(column.location, time)) {
        return cellKey(column.location, time);
      }
    }
  }

  return null;
});

const arrowSteps: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const onKeydown = (event: KeyboardEvent, rowIndex: number, columnIndex: number) => {
  const step = arrowSteps[event.key];

  if (!step) {
    return;
  }

  event.preventDefault();

  let row = rowIndex + step[0];
  let column = columnIndex + step[1];

  // Skip over blocks that cannot be selected.
  while (row >= 0 && row < rows.value.length && column >= 0 && column < props.columns.length) {
    const location = props.columns[column]!.location;
    const time = rows.value[row]!;

    if (selectionFor(location, time)) {
      grid.value
        ?.querySelector<HTMLElement>(`[data-cell="${cellKey(location, time)}"]`)
        ?.focus();
      return;
    }

    row += step[0];
    column += step[1];
  }
};

const gridStyle = computed(() => ({
  gridTemplateColumns: `auto repeat(${props.columns.length}, minmax(0, 1fr))`,
}));
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="loading" class="grid gap-x-2 sm:gap-x-4" :style="gridStyle">
      <div class="w-10"></div>
      <u-skeleton
        v-for="column in columns"
        :key="column.location"
        :style="{ height: `${skeletonRows * ROW_REM + 2.5}rem` }"
      />
    </div>
    <div v-else-if="failed" class="flex flex-col items-start gap-4">
      <p>De beschikbaarheid kon niet geladen worden.</p>
      <u-button label="Opnieuw proberen" color="neutral" variant="subtle" @click="$emit('retry')" />
    </div>
    <p v-else-if="rows.length === 0">Er zijn op deze dag geen vrije tijdsloten meer.</p>
    <template v-else>
      <div
        ref="grid"
        class="grid gap-x-2 select-none sm:gap-x-4"
        :style="gridStyle"
        role="group"
        aria-label="Beschikbaarheid per tafel. Gebruik de pijltjestoetsen om een blok te kiezen."
      >
        <div class="sticky top-0 z-10 bg-default" :style="{ gridColumn: 1, gridRow: 1 }"></div>
        <div
          v-for="(column, columnIndex) in columns"
          :key="column.location"
          class="sticky top-0 z-10 bg-default py-2 text-center font-semibold"
          :style="{ gridColumn: columnIndex + 2, gridRow: 1 }"
        >
          <span class="hidden sm:inline">{{ column.label }}</span>
          <span class="sm:hidden">{{ column.shortLabel }}</span>
        </div>
        <template v-for="(time, rowIndex) in rows" :key="time">
          <div
            class="h-8 pr-1 text-sm tabular-nums leading-none"
            :class="formatTime(time).endsWith(':00') ? 'text-default' : 'text-dimmed'"
            :style="{ gridColumn: 1, gridRow: rowIndex + 2 }"
          >
            <!-- Quarter rows stay unlabelled to keep the time column readable. -->
            {{ /:(00|30)$/.test(formatTime(time)) ? formatTime(time) : "" }}
          </div>
          <button
            v-for="(column, columnIndex) in columns"
            :key="column.location"
            type="button"
            :data-cell="cellKey(column.location, time)"
            :style="{ gridColumn: columnIndex + 2, gridRow: rowIndex + 2 }"
            :tabindex="tabStop === cellKey(column.location, time) ? 0 : -1"
            class="day-grid-cell h-8 px-2 pt-1 text-left align-top text-sm leading-none font-semibold"
            :class="{
              'is-selected': isSelected(column.location, time),
              'is-start':
                isSelected(column.location, time) && time === selection?.start.valueOf(),
              'is-end': isSelected(column.location, time) && time + BLOCK_MS === selectionEnd,
              'is-free': isFree(column.location, time),
            }"
            :disabled="!selectionFor(column.location, time)"
            :aria-label="cellLabel(column, time)"
            :aria-pressed="isSelected(column.location, time)"
            @click="select(column.location, time)"
            @focus="focused = cellKey(column.location, time)"
            @keydown="onKeydown($event, rowIndex, columnIndex)"
          >
          </button>
        </template>
        <div
          v-if="bar && selection"
          aria-hidden="true"
          class="day-grid-bar"
          :class="{ 'is-dragging': dragging }"
          :style="bar"
          @pointerdown="onDragStart($event, 'move')"
          @pointermove="onDragMove"
          @pointerup="onDragEnd"
          @pointercancel="onDragEnd"
          @click="onBarClick"
        >
          <div
            class="day-grid-handle is-top"
            @pointerdown.stop="onDragStart($event, 'start')"
            @click.stop
          ></div>
          <span class="day-grid-bar-label">
            {{ formatTime(selection.start) }} &ndash; {{ formatTime(selectionEnd) }}
          </span>
          <div
            class="day-grid-handle is-bottom"
            @pointerdown.stop="onDragStart($event, 'end')"
            @click.stop
          ></div>
        </div>
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <span class="flex items-center gap-2">
          <span class="day-grid-cell is-free size-4"></span>Vrij
        </span>
        <span class="flex items-center gap-2">
          <span class="day-grid-cell size-4"></span>Bezet
        </span>
        <span class="flex items-center gap-2">
          <span class="day-grid-cell is-free is-selected size-4"></span>Jouw keuze
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Occupied by default: hatched, so it reads as unavailable without relying on colour alone. */
.day-grid-cell {
  background-image: repeating-linear-gradient(
    135deg,
    var(--ui-border) 0 2px,
    transparent 2px 8px
  );
  border-top: 1px solid var(--ui-bg);
  white-space: nowrap;
}

.day-grid-cell.is-free {
  background-image: none;
  background-color: color-mix(in oklab, var(--ui-primary) 14%, var(--ui-bg));
}

/* Colour only says free or occupied. A free block that cannot be tapped right now (no hour
   fits, or out of reach of the selection) looks the same and just has no pointer or hover. */
button.day-grid-cell:not(:disabled) {
  cursor: pointer;
}

button.day-grid-cell.is-free:not(:disabled):not(.is-selected):hover {
  background-color: color-mix(in oklab, var(--ui-primary) 32%, var(--ui-bg));
}

.day-grid-cell.is-selected {
  background-color: var(--ui-primary);
  border-top-color: transparent;
  color: var(--ui-text-inverted);
}

.day-grid-cell.is-start {
  border-top-left-radius: var(--ui-radius);
  border-top-right-radius: var(--ui-radius);
}

.day-grid-cell.is-end {
  border-bottom-left-radius: var(--ui-radius);
  border-bottom-right-radius: var(--ui-radius);
}

.day-grid-bar {
  position: relative;
  z-index: 2;
  cursor: grab;
  color: var(--ui-text-inverted);
}

.day-grid-bar.is-dragging {
  cursor: grabbing;
}

.day-grid-bar-label {
  display: block;
  padding: 0.75rem 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

/* Wider than it looks: the grip is a thin line, the area that takes the pointer is 20px. */
.day-grid-handle {
  position: absolute;
  inset-inline: 0;
  height: 20px;
  cursor: ns-resize;
  touch-action: none;
}

.day-grid-handle.is-top {
  top: -6px;
}

.day-grid-handle.is-bottom {
  bottom: -6px;
}

.day-grid-handle::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 1.75rem;
  height: 4px;
  border-radius: 2px;
  background-color: currentColor;
  opacity: 0.75;
  transform: translateX(-50%);
}

.day-grid-handle.is-top::after {
  top: 10px;
}

.day-grid-handle.is-bottom::after {
  bottom: 10px;
}

button.day-grid-cell:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
  position: relative;
  z-index: 1;
}
</style>
