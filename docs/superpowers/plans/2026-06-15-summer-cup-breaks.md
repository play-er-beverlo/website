# SummER Cup Breaks (30+) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record snooker breaks (30+) per player on the printable wedstrijdblad, show each play day's breaks grouped per player next to its results, and show a tournament-wide breaks overview beside the SummER points ranking.

**Architecture:** Mirror the existing SummER Cup split — a new `Break` type + optional `breaks` field on `PlayDayResults` (hand-entered data), pure unit-tested compute functions in `shared/summerCup/breaks.ts`, and two thin presentational components (`SummerCupBreaks.vue`, `SummerCupBreaksRanking.vue`) wired into the results page; a hand-fillable breaks table added to the wedstrijdblad.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Tailwind CSS v4, Vitest.

---

## File Structure

- **Modify** `shared/data/summerCupResults.ts` — add `Break` interface, optional `breaks` field on `PlayDayResults`, and sample break data for the two existing play days.
- **Create** `shared/summerCup/breaks.ts` — `PlayerBreaks` type, `computeDayBreaks`, `computeBreaksRanking`.
- **Create** `test/summerCup-breaks.test.ts` — unit tests for the compute functions.
- **Create** `app/components/SummerCupBreaks.vue` — per-day grouped-per-player breaks list.
- **Create** `app/components/SummerCupBreaksRanking.vue` — tournament breaks table.
- **Modify** `app/pages/6-reds-summer-cup/index.vue` — two-column ranking layout + per-day breaks block.
- **Modify** `app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue` — hand-fillable breaks table.

Component file names map to auto-imported kebab-case tags: `SummerCupBreaks.vue` → `<summer-cup-breaks>`, `SummerCupBreaksRanking.vue` → `<summer-cup-breaks-ranking>` (same convention as the existing `SummerCupStandings.vue`).

---

## Task 1: Data model + sample break data

**Files:**
- Modify: `shared/data/summerCupResults.ts`

- [ ] **Step 1: Add the `Break` interface and `breaks` field**

In `shared/data/summerCupResults.ts`, add the `Break` interface immediately after the `Match` interface (after the block ending at line 13), and add the `breaks` field to `PlayDayResults`.

Add after the `Match` interface:

```ts
export interface Break {
  player: string; // DayPlayer.id
  value: number;  // points in the break (recorded for 30+)
}
```

Change the `PlayDayResults` interface from:

```ts
export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // one entry per round-robin pairing
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
}
```

to:

```ts
export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // one entry per round-robin pairing
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
  breaks?: Break[];      // 30+ breaks made on this play day (hand-entered)
}
```

- [ ] **Step 2: Add sample break data to the two play days**

These are illustrative values (the match results for these days are already sample data) so the visualisation is populated; the organiser replaces them with real breaks. Marco's breaks deliberately span both days to demonstrate cross-day aggregation.

In the `2026-06-17` object, add a `breaks` array after its `matches` array (after the `matches` closing `],` near line 56):

```ts
    breaks: [
      { player: marco, value: 52 },
      { player: andy, value: 47 },
      { player: marco, value: 38 },
      { player: eddy, value: 33 },
    ],
```

In the `2026-06-19` object, add a `breaks` array after its `matches` array (after the `matches` closing `],` near line 102):

```ts
    breaks: [
      { player: tom, value: 61 },
      { player: danny, value: 41 },
      { player: marco, value: 35 },
    ],
```

- [ ] **Step 3: Verify the existing suite still passes**

Run: `pnpm test`
Expected: PASS — all existing tests still green (adding an optional field and data does not change standings/grid output).

- [ ] **Step 4: Commit**

```bash
git add shared/data/summerCupResults.ts
git commit -m "feat: add breaks data model to summer cup results"
```

---

## Task 2: Pure break logic (TDD)

**Files:**
- Create: `shared/summerCup/breaks.ts`
- Test: `test/summerCup-breaks.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `test/summerCup-breaks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeDayBreaks, computeBreaksRanking } from "../shared/summerCup/breaks";
import type { PlayDayResults } from "../shared/data/summerCupResults";

const anna = { id: "anna", name: "Anna" };
const bob = { id: "bob", name: "Bob" };
const cas = { id: "cas", name: "Cas" };

function day(id: string, players: { id: string; name: string }[], breaks: { player: string; value: number }[]): PlayDayResults {
  return { playDayId: id, players, matches: [], breaks };
}

describe("computeDayBreaks", () => {
  it("groups a player's breaks descending and orders players by highest break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 38 },
        { player: "bob", value: 47 },
        { player: "anna", value: 52 },
      ]),
    );
    expect(result).toEqual([
      { player: anna, breaks: [52, 38], highest: 52 },
      { player: bob, breaks: [47], highest: 47 },
    ]);
  });

  it("orders equal-highest players by the next-highest break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 52 },
        { player: "anna", value: 38 },
        { player: "bob", value: 52 },
        { player: "bob", value: 31 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("ranks a longer break list above a shorter one when compared values are equal", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 52 },
        { player: "anna", value: 38 },
        { player: "bob", value: 52 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("breaks remaining ties alphabetically by player name", () => {
    const result = computeDayBreaks(
      day("d1", [bob, anna], [
        { player: "bob", value: 40 },
        { player: "anna", value: 40 },
      ]),
    );
    expect(result.map((r) => r.player.id)).toEqual(["anna", "bob"]);
  });

  it("ignores breaks below 30 and excludes players with no 30+ break", () => {
    const result = computeDayBreaks(
      day("d1", [anna, bob], [
        { player: "anna", value: 29 },
        { player: "bob", value: 30 },
      ]),
    );
    expect(result).toEqual([{ player: bob, breaks: [30], highest: 30 }]);
  });

  it("returns an empty array when the day has no breaks", () => {
    expect(computeDayBreaks({ playDayId: "d1", players: [anna], matches: [] })).toEqual([]);
  });
});

describe("computeBreaksRanking", () => {
  it("aggregates a player's breaks across all play days, including a day that would be discarded for points", () => {
    const days = [
      day("d1", [anna, bob], [{ player: "anna", value: 52 }, { player: "bob", value: 33 }]),
      // anna plays a second day of the same tournament; for points only one day counts,
      // but every break must still be counted here.
      day("d2", [anna, cas], [{ player: "anna", value: 60 }, { player: "cas", value: 45 }]),
    ];
    const result = computeBreaksRanking(days);
    expect(result).toEqual([
      { player: anna, breaks: [60, 52], highest: 60 },
      { player: cas, breaks: [45], highest: 45 },
      { player: bob, breaks: [33], highest: 33 },
    ]);
  });

  it("returns an empty array when there are no breaks anywhere", () => {
    const days = [day("d1", [anna], []), { playDayId: "d2", players: [bob], matches: [] }];
    expect(computeBreaksRanking(days)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run test/summerCup-breaks.test.ts`
Expected: FAIL — cannot resolve `../shared/summerCup/breaks` / `computeDayBreaks is not a function`.

- [ ] **Step 3: Implement `shared/summerCup/breaks.ts`**

Create `shared/summerCup/breaks.ts`:

```ts
import type { Break, DayPlayer, PlayDayResults } from "../data/summerCupResults";

export interface PlayerBreaks {
  player: DayPlayer;
  breaks: number[]; // sorted descending, all >= 30
  highest: number;  // breaks[0]
}

/** Compare two descending break lists element-wise; higher ranks first.
 *  A longer list ranks above a shorter one when all compared values are equal. */
function compareBreakLists(x: number[], y: number[]): number {
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) {
    const xv = x[i] ?? -Infinity;
    const yv = y[i] ?? -Infinity;
    if (xv !== yv) return yv - xv; // descending
  }
  return 0;
}

/** Group breaks (>= 30) by player and order them for display. */
function buildRows(playerById: Map<string, DayPlayer>, breaks: Break[]): PlayerBreaks[] {
  const byPlayer = new Map<string, number[]>();
  for (const b of breaks) {
    if (b.value < 30) continue;
    if (!playerById.has(b.player)) continue;
    const list = byPlayer.get(b.player) ?? [];
    list.push(b.value);
    byPlayer.set(b.player, list);
  }

  const rows: PlayerBreaks[] = [];
  for (const [id, values] of byPlayer) {
    const player = playerById.get(id)!;
    const sorted = [...values].sort((a, b) => b - a);
    rows.push({ player, breaks: sorted, highest: sorted[0]! });
  }

  rows.sort((x, y) => {
    const cmp = compareBreakLists(x.breaks, y.breaks);
    if (cmp !== 0) return cmp;
    return x.player.name.localeCompare(y.player.name);
  });

  return rows;
}

/** Breaks (30+) for a single play day, grouped per player. */
export function computeDayBreaks(day: PlayDayResults): PlayerBreaks[] {
  const playerById = new Map(day.players.map((p) => [p.id, p]));
  return buildRows(playerById, day.breaks ?? []);
}

/** Breaks (30+) aggregated across all play days — every break counts,
 *  independent of the best-day-per-tournament points rule. */
export function computeBreaksRanking(days: PlayDayResults[]): PlayerBreaks[] {
  const playerById = new Map<string, DayPlayer>();
  const all: Break[] = [];
  for (const day of days) {
    for (const p of day.players) if (!playerById.has(p.id)) playerById.set(p.id, p);
    for (const b of day.breaks ?? []) all.push(b);
  }
  return buildRows(playerById, all);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run test/summerCup-breaks.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/breaks.ts test/summerCup-breaks.test.ts
git commit -m "feat: compute summer cup breaks per day and across tournament"
```

---

## Task 3: Per-day breaks component

**Files:**
- Create: `app/components/SummerCupBreaks.vue`

- [ ] **Step 1: Create the component**

Create `app/components/SummerCupBreaks.vue`:

```vue
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
```

- [ ] **Step 2: Verify it compiles with the suite**

Run: `pnpm test`
Expected: PASS — no test regressions (component has no unit test; this confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add app/components/SummerCupBreaks.vue
git commit -m "feat: add per-day summer cup breaks component"
```

---

## Task 4: Tournament breaks ranking component

**Files:**
- Create: `app/components/SummerCupBreaksRanking.vue`

- [ ] **Step 1: Create the component**

Create `app/components/SummerCupBreaksRanking.vue` (table styling matches the existing points table in `index.vue`):

```vue
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
```

- [ ] **Step 2: Verify it compiles with the suite**

Run: `pnpm test`
Expected: PASS — no regressions.

- [ ] **Step 3: Commit**

```bash
git add app/components/SummerCupBreaksRanking.vue
git commit -m "feat: add tournament summer cup breaks ranking component"
```

---

## Task 5: Wire breaks into the results page

**Files:**
- Modify: `app/pages/6-reds-summer-cup/index.vue`

- [ ] **Step 1: Import the compute functions and build the data**

In the `<script setup>` block, add a new import after the existing standings import (line 4):

```ts
import { computeDayBreaks, computeBreaksRanking } from "#shared/summerCup/breaks";
```

After `const summerRanking = computeSummerRanking(playDayResults);` (line 14), add:

```ts
const breaksRanking = computeBreaksRanking(playDayResults);
```

In the `resultBlocks` map (lines 19-25), add a `breaks` property. Change the mapped object from:

```ts
  .map((day) => ({
    id: day.playDayId,
    label: getPlayDay(day.playDayId)?.label ?? day.playDayId,
    players: day.players,
    grid: buildResultsGrid(day),
    standings: computeDayStandings(day),
  }));
```

to:

```ts
  .map((day) => ({
    id: day.playDayId,
    label: getPlayDay(day.playDayId)?.label ?? day.playDayId,
    players: day.players,
    grid: buildResultsGrid(day),
    standings: computeDayStandings(day),
    breaks: computeDayBreaks(day),
  }));
```

- [ ] **Step 2: Restructure the SummER Ranking block into two columns**

Replace the SummER Ranking block (lines 176-198), which currently is:

```html
      <div class="flex flex-col gap-4">
        <h2>SummER Ranking</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/30">
                <th class="py-2 pr-4">#</th>
                <th class="py-2 pr-4">Speler</th>
                <th class="py-2 pr-4 text-center">Speeldagen</th>
                <th class="py-2 text-center">Punten</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summerRanking" :key="row.player.id" class="border-b border-white/15">
                <td class="py-2 pr-4">{{ row.position }}</td>
                <td class="py-2 pr-4">{{ row.player.name }}</td>
                <td class="py-2 pr-4 text-center">{{ row.playDaysCounted }}</td>
                <td class="py-2 text-center font-bold">{{ row.totalPoints }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
```

with:

```html
      <div class="flex flex-col gap-4">
        <h2>SummER Ranking</h2>
        <div class="grid gap-8 md:grid-cols-2">
          <div class="flex flex-col gap-3">
            <h3 class="text-lg font-semibold">Punten</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-white/30">
                    <th class="py-2 pr-4">#</th>
                    <th class="py-2 pr-4">Speler</th>
                    <th class="py-2 pr-4 text-center">Speeldagen</th>
                    <th class="py-2 text-center">Punten</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in summerRanking" :key="row.player.id" class="border-b border-white/15">
                    <td class="py-2 pr-4">{{ row.position }}</td>
                    <td class="py-2 pr-4">{{ row.player.name }}</td>
                    <td class="py-2 pr-4 text-center">{{ row.playDaysCounted }}</td>
                    <td class="py-2 text-center font-bold">{{ row.totalPoints }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <h3 class="text-lg font-semibold">Breaks (30+)</h3>
            <summer-cup-breaks-ranking v-if="breaksRanking.length" :breaks="breaksRanking" />
            <p v-else class="opacity-80">Nog geen breaks van 30+ genoteerd.</p>
          </div>
        </div>
      </div>
```

- [ ] **Step 3: Add the per-day breaks block**

Replace the result block (lines 200-204), which currently is:

```html
      <div v-for="block in resultBlocks" :key="block.id" class="flex flex-col gap-6">
        <h2>{{ block.label }}</h2>
        <summer-cup-results-grid :players="block.players" :grid="block.grid" />
        <summer-cup-standings :standings="block.standings" />
      </div>
```

with:

```html
      <div v-for="block in resultBlocks" :key="block.id" class="flex flex-col gap-6">
        <h2>{{ block.label }}</h2>
        <summer-cup-results-grid :players="block.players" :grid="block.grid" />
        <summer-cup-standings :standings="block.standings" />
        <summer-cup-breaks v-if="block.breaks.length" :breaks="block.breaks" />
      </div>
```

- [ ] **Step 4: Verify the suite still passes**

Run: `pnpm test`
Expected: PASS — no regressions.

- [ ] **Step 5: Visually verify in the dev server**

Run: `pnpm dev`
Open `http://localhost:3000/6-reds-summer-cup` and confirm under **RESULTATEN**:
- The SummER Ranking shows two columns: **Punten** (left) and **Breaks (30+)** (right). The breaks table lists Tom (61), Marco (52, 35, 38 → shown `52, 38, 35`), Andy (47), Danny (41), Eddy (33), ordered by highest break.
- Each play day block shows a **Breaks (30+)** list below its standings, grouped per player, highest-break player on top.
Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add app/pages/6-reds-summer-cup/index.vue
git commit -m "feat: show summer cup breaks on results page"
```

---

## Task 6: Breaks table on the wedstrijdblad

**Files:**
- Modify: `app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue`

- [ ] **Step 1: Wrap the sheet body and add the breaks table**

Replace the non-empty results block (lines 53-104), which currently opens with:

```html
      <div v-else class="flex flex-wrap items-start gap-12">
```

and contains the legend table and the matrix table, then closes with `</div>` on line 104.

Change the opening tag and nesting so the legend+matrix row and a new breaks table stack vertically. Replace from line 53:

```html
      <div v-else class="flex flex-wrap items-start gap-12">
```

with:

```html
      <div v-else class="flex flex-col gap-10">
        <div class="flex flex-wrap items-start gap-12">
```

Then, immediately before the existing closing `</div>` on line 104 (the one that closed the old `flex flex-wrap` container), add the breaks table and an extra closing `</div>` for the new wrapper. Concretely, replace the single closing tag:

```html
        </table>
      </div>
```

(the matrix table's `</table>` followed by the `flex flex-wrap` container's `</div>`) with:

```html
        </table>
        </div>

        <!-- Hand-fillable breaks (30+) per player -->
        <div>
          <div class="mb-2 text-lg font-bold">Breaks (30+)</div>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="h-10 w-10 border border-black px-2 font-semibold">#</th>
                <th class="h-10 border border-black px-4 text-left font-semibold">Speler</th>
                <th class="h-10 border border-black px-3 text-left font-semibold">Breaks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(player, i) in players" :key="i">
                <th class="h-10 w-10 border border-black px-2 text-center font-semibold">{{ i + 1 }}</th>
                <td class="h-10 border border-black px-4 whitespace-nowrap">{{ player.name }}</td>
                <td class="h-10 border border-black px-3"/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
```

> Note on the indentation above: the first `</table>` closes the matrix; the first `</div>` closes the inner `flex flex-wrap` row; the breaks `<div>` is the second child of the new `flex flex-col` wrapper; the final `</div>` closes that wrapper. The `Breaks` cell is intentionally left empty for handwriting, and the `w-full` table lets the `Breaks` column take the remaining sheet width.

- [ ] **Step 2: Verify the suite still passes**

Run: `pnpm test`
Expected: PASS — no regressions (the wedstrijdblad test only covers the pure date helpers).

- [ ] **Step 3: Visually verify the printable sheet**

Run: `pnpm dev`
Open `http://localhost:3000/6-reds-summer-cup/wedstrijdblad/17-06-2026` and confirm:
- Below the legend + results matrix there is a full-width **Breaks (30+)** table with one row per registered player (`#`, `Speler`, and a wide blank `Breaks` cell).
- Use the browser print preview (or the "Afdrukken" button) and confirm the breaks table renders with visible black borders in landscape A4.
Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add "app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue"
git commit -m "feat: add breaks (30+) table to wedstrijdblad"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: PASS — all suites green, including the new `summerCup-breaks` tests.

- [ ] **Step 2: Confirm the working tree is clean**

Run: `git status`
Expected: nothing to commit, working tree clean (all changes committed across Tasks 1-6).

---

## Self-Review

- **Spec coverage:**
  - Wedstrijdblad hand-writing space (per-player rows) → Task 6.
  - Per-day breaks, grouped per player, highest on top → Tasks 3 + 5 (`computeDayBreaks` ordering verified in Task 2).
  - Tournament overview, all breaks listed per player, beside points ranking → Tasks 4 + 5.
  - Breaks scope (all breaks count, including discarded days) → `computeBreaksRanking` + Task 2 aggregation test.
  - Data model (`Break`, `breaks?`) and 30+ defensive filter → Tasks 1 + 2.
  - Empty states (per-day omitted, tournament placeholder text) → Task 5.
- **Placeholder scan:** none — every code step contains complete code and exact commands.
- **Type consistency:** `Break`, `PlayerBreaks`, `computeDayBreaks`, `computeBreaksRanking` names and signatures match across Tasks 1, 2, 3, 4, 5; component tags match file names; `breaks` field is the same everywhere.
