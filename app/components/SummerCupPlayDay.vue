<script lang="ts" setup>
import { PLAY_TIME } from "#shared/data/summerCup";
import { isSelectable } from "#shared/summerCup/capacity";
import type { AvailabilityDay } from "#shared/summerCup/availability";

const props = defineProps<{
  day: AvailabilityDay;
  selected: boolean;
  defaultOpen: boolean;
}>();

const emit = defineEmits<{ select: [] }>();

// Past days close for good: those players show up in the RESULTATEN section instead.
const expandable = computed(() => !props.day.past);
// Registration closes once a day is full or past, but the list stays readable.
const canSelect = computed(() => isSelectable(props.day));

// Tracked locally (instead of reading `open` off UCollapsible's default-slot scope) to
// dodge a @vue/compiler-sfc crash: `v-slot="{ open }"` on a component that also has a
// named #content slot fails codegen ("Cannot read properties of undefined (reading
// 'type')") in this project's Vue 3.5.33 / Vite 7.3.2. The crash is specific to that
// shorthand form — `<template #default="{ open }">` compiles fine and would also work.
// v-model:open sidesteps it while keeping the same open/closed behavior.
const open = ref(props.defaultOpen);
</script>

<template>
  <u-collapsible v-model:open="open" :disabled="!expandable">
    <u-button
      class="w-full justify-between"
      size="xl"
      :color="selected ? 'primary' : 'neutral'"
      :variant="selected ? 'solid' : 'outline'"
      :disabled="!expandable"
    >
      <span>{{ day.label }} — {{ PLAY_TIME }}</span>
      <span class="flex items-center gap-2">
        <span v-if="day.past">Voorbij</span>
        <span v-else-if="day.full">Volzet</span>
        <span v-else>nog {{ day.remaining }}/{{ day.capacity }} plaatsen vrij</span>
        <u-icon v-if="expandable" :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" />
      </span>
    </u-button>

    <template #content>
      <div class="flex flex-col gap-3 px-4 py-4">
        <p v-if="!day.players.length" class="opacity-80">
          Nog niemand ingeschreven — wees de eerste
        </p>
        <ul v-else class="flex flex-col gap-1" aria-label="Ingeschreven spelers">
          <!-- Index as key: two players may share a name (uniqueness is playDayId + email). -->
          <li v-for="(name, i) in day.players" :key="i">{{ name }}</li>
        </ul>
        <u-button
          v-if="canSelect"
          class="self-start"
          :label="selected ? 'Geselecteerd' : 'Kies deze speeldag'"
          :icon="selected ? 'i-lucide-check' : undefined"
          :color="selected ? 'primary' : 'neutral'"
          :variant="selected ? 'solid' : 'outline'"
          :disabled="selected"
          @click="emit('select')"
        />
      </div>
    </template>
  </u-collapsible>
</template>
