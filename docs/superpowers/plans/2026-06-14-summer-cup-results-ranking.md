# Summer Cup Results & Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each 6 Reds SummER Cup play day's round-robin results as a cross-table grid and a points-based day standings, plus an overall Summer Ranking, all derived from stored results — starting with play day 2026-06-17.

**Architecture:** Results are stored as data (matches with optional per-frame point scores) in `shared/data/summerCupResults.ts`. Pure, unit-tested functions in `shared/summerCup/standings.ts` derive frames won, matches won, day standings (per the documented point system) and the aggregated Summer Ranking. Two presentational Vue components render the grid and the standings; the `#rangschikking` section of the page orchestrates them.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Tailwind CSS v4, Vitest. Shared modules are imported in app code via the `#shared/...` alias.

---

## File Structure

- **Create** `shared/data/summerCupResults.ts` — data shapes (`DayPlayer`, `Frame`, `Match`, `PlayDayResults`) and the `playDayResults` array (2026-06-17 data). Mirrors the existing `shared/data/summerCup.ts` data-only pattern.
- **Create** `shared/summerCup/standings.ts` — pure derivation: `resolveMatch`, `buildResultsGrid`, `computeDayStandings`, `computeSummerRanking`, plus the derived types `MatchOutcome`, `DayStanding`, `SummerRow`. Mirrors the existing `shared/summerCup/capacity.ts` logic pattern.
- **Create** `shared/summerCup/standings.test.ts` — Vitest coverage (first project test).
- **Create** `app/components/SummerCupResultsGrid.vue` — cross-table grid for one play day (presentational; props only).
- **Create** `app/components/SummerCupStandings.vue` — day standings table (presentational; props only).
- **Modify** `app/pages/6-reds-summer-cup.vue` — replace the "Binnenkort" `u-alert` in `#rangschikking` with the Summer Ranking table + a per-play-day block (grid + standings); add the imports and the computed data in `<script setup>`.

**Note on the Summer Ranking table:** it is a simple 4-column table rendered inline in the page (consistent with the existing inline "Kalender" table on the same page), not a separate component — the only reused component is `SummerCupStandings.vue` for the richer day standings.

---

## Task 1: Results data model + 2026-06-17 data

Pure data and type declarations — no behaviour to test in isolation; the data is exercised by the grid and standings tests in Tasks 3–4.

**Files:**
- Create: `shared/data/summerCupResults.ts`

- [ ] **Step 1: Create the data file**

```ts
export interface DayPlayer {
  id: string;
  name: string;
}

/** One frame's point totals; whoever has more points wins the frame. */
export interface Frame {
  a: number; // points for match.a, e.g. 45
  b: number; // points for match.b, e.g. 57
}

export interface Match {
  a: string;          // DayPlayer.id (row in the grid)
  b: string;          // DayPlayer.id (col in the grid)
  frames?: Frame[];   // real per-frame point scores (1 or 2 frames per field size)
  winner?: "a" | "b"; // fallback when only the outcome is known
}

export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // one entry per round-robin pairing
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
}

const marco = "marco-vitali";
const andy = "andy-vleugels";
const eddy = "eddy-ritzen";
const ronnie = "ronnie-de-reydt";
const danny = "danny-moors";

export const playDayResults: PlayDayResults[] = [
  {
    playDayId: "2026-06-17",
    players: [
      { id: marco, name: "Marco Vitali" },
      { id: andy, name: "Andy Vleugels" },
      { id: eddy, name: "Eddy Ritzen" },
      { id: ronnie, name: "Ronnie De Reydt" },
      { id: danny, name: "Danny Moors" },
    ],
    // Only match outcomes are known for this play day (win/loss), so each match
    // is stored as a winner. Replace with `frames: [{ a, b }, ...]` once real
    // frame point scores (e.g. 45-57) are recorded.
    matches: [
      { a: marco, b: andy, winner: "b" },
      { a: marco, b: eddy, winner: "a" },
      { a: marco, b: ronnie, winner: "a" },
      { a: marco, b: danny, winner: "a" },
      { a: andy, b: eddy, winner: "a" },
      { a: andy, b: ronnie, winner: "b" },
      { a: andy, b: danny, winner: "a" },
      { a: eddy, b: ronnie, winner: "a" },
      { a: eddy, b: danny, winner: "b" },
      { a: ronnie, b: danny, winner: "b" },
    ],
  },
];
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm exec tsc --noEmit -p tsconfig.json` (or rely on the editor / the test run in Task 2).
Expected: no errors from `shared/data/summerCupResults.ts`.

- [ ] **Step 3: Commit**

```bash
git add shared/data/summerCupResults.ts
git commit -m "feat: add Summer Cup results data model and 2026-06-17 data"
```

---

## Task 2: `resolveMatch` — frame counts and match winner

**Files:**
- Create: `shared/summerCup/standings.ts`
- Create (test): `shared/summerCup/standings.test.ts`

- [ ] **Step 1: Write the failing test**

Create `shared/summerCup/standings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveMatch } from "./standings";

describe("resolveMatch", () => {
  it("derives the frame winner from point scores", () => {
    expect(resolveMatch({ a: "x", b: "y", frames: [{ a: 45, b: 57 }] })).toEqual({
      framesA: 0,
      framesB: 1,
      winnerId: "y",
    });
  });

  it("counts frames won across multiple frames and leaves a 1-1 undecided", () => {
    expect(
      resolveMatch({ a: "x", b: "y", frames: [{ a: 60, b: 40 }, { a: 30, b: 70 }] })
    ).toEqual({ framesA: 1, framesB: 1, winnerId: null });
  });

  it("treats a winner-only match as a single decisive frame", () => {
    expect(resolveMatch({ a: "x", b: "y", winner: "a" })).toEqual({
      framesA: 1,
      framesB: 0,
      winnerId: "x",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: FAIL — cannot resolve module `./standings` / `resolveMatch` is not a function.

- [ ] **Step 3: Write the minimal implementation**

Create `shared/summerCup/standings.ts`:

```ts
import type { Match } from "../data/summerCupResults";

export interface MatchOutcome {
  framesA: number;
  framesB: number;
  /** id of the winning player, or null if undecided (e.g. a 1-1 frame split) */
  winnerId: string | null;
}

export function resolveMatch(match: Match): MatchOutcome {
  if (match.frames && match.frames.length > 0) {
    let framesA = 0;
    let framesB = 0;
    for (const frame of match.frames) {
      if (frame.a > frame.b) framesA++;
      else if (frame.b > frame.a) framesB++;
    }
    let winnerId: string | null = null;
    if (framesA > framesB) winnerId = match.a;
    else if (framesB > framesA) winnerId = match.b;
    // TODO(organiser): with an even number of frames a 1-1 split leaves the match
    // winner undecided by frames alone. Confirm the rule (e.g. total points) before
    // two-frame point data is entered; for now such a match counts for neither.
    return { framesA, framesB, winnerId };
  }

  // Outcome-only: treat as a single decisive frame.
  if (match.winner === "a") return { framesA: 1, framesB: 0, winnerId: match.a };
  if (match.winner === "b") return { framesA: 0, framesB: 1, winnerId: match.b };
  return { framesA: 0, framesB: 0, winnerId: null };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: PASS (3 tests in the `resolveMatch` suite).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/standings.ts shared/summerCup/standings.test.ts
git commit -m "feat: resolve Summer Cup match into frame counts and winner"
```

---

## Task 3: `buildResultsGrid` — derived cross-table matrix

**Files:**
- Modify: `shared/summerCup/standings.ts`
- Modify (test): `shared/summerCup/standings.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `shared/summerCup/standings.test.ts`:

```ts
import { buildResultsGrid } from "./standings";
import { playDayResults } from "../data/summerCupResults";

const day17 = playDayResults.find((d) => d.playDayId === "2026-06-17")!;

describe("buildResultsGrid (2026-06-17)", () => {
  it("reproduces the screenshot matrix (cell = frames row won vs col)", () => {
    expect(buildResultsGrid(day17)).toEqual([
      [null, 0, 1, 1, 1],
      [1, null, 1, 0, 1],
      [0, 0, null, 1, 0],
      [0, 1, 0, null, 0],
      [0, 0, 1, 1, null],
    ]);
  });
});
```

> Move the two new `import` lines to the top of the file with the existing imports; they are shown here next to the test only for clarity.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: FAIL — `buildResultsGrid` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Add to `shared/summerCup/standings.ts` (and extend the type import):

```ts
import type { Match, PlayDayResults } from "../data/summerCupResults";

// ...existing resolveMatch above...

/** Matrix where cell [i][j] = frames player i won vs player j; diagonal is null. */
export function buildResultsGrid(day: PlayDayResults): (number | null)[][] {
  const index = new Map<string, number>();
  day.players.forEach((player, i) => index.set(player.id, i));

  const grid: (number | null)[][] = day.players.map((_, i) =>
    day.players.map((_, j) => (i === j ? null : 0))
  );

  for (const match of day.matches) {
    const i = index.get(match.a);
    const j = index.get(match.b);
    if (i === undefined || j === undefined) continue;
    const outcome = resolveMatch(match);
    grid[i][j] = outcome.framesA;
    grid[j][i] = outcome.framesB;
  }

  return grid;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: PASS (`buildResultsGrid` suite green, `resolveMatch` still green).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/standings.ts shared/summerCup/standings.test.ts
git commit -m "feat: derive Summer Cup cross-table grid from results"
```

---

## Task 4: `computeDayStandings` — ordering + points

**Files:**
- Modify: `shared/summerCup/standings.ts`
- Modify (test): `shared/summerCup/standings.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `shared/summerCup/standings.test.ts`:

```ts
import { computeDayStandings } from "./standings";

describe("computeDayStandings (2026-06-17)", () => {
  const standings = computeDayStandings(day17);
  const byName = (name: string) => standings.find((s) => s.player.name === name)!;

  it("orders by frames won then head-to-head", () => {
    expect(standings.map((s) => s.player.name)).toEqual([
      "Andy Vleugels",
      "Marco Vitali",
      "Danny Moors",
      "Eddy Ritzen",
      "Ronnie De Reydt",
    ]);
  });

  it("counts frames and matches won", () => {
    expect(byName("Andy Vleugels").framesWon).toBe(3);
    expect(byName("Andy Vleugels").matchesWon).toBe(3);
    expect(byName("Danny Moors").framesWon).toBe(2);
    expect(byName("Ronnie De Reydt").matchesWon).toBe(1);
  });

  it("awards participation, ranking and bonus points", () => {
    const andy = byName("Andy Vleugels");
    expect(andy.participationPoints).toBe(2);
    expect(andy.rankingPoints).toBe(5);
    expect(andy.bonusPoints).toBe(1);
    expect(andy.totalPoints).toBe(8);

    expect(byName("Marco Vitali").totalPoints).toBe(7);
    expect(byName("Danny Moors").totalPoints).toBe(5);
    expect(byName("Eddy Ritzen").totalPoints).toBe(4);
    expect(byName("Ronnie De Reydt").totalPoints).toBe(3);
  });

  it("gives the bonus point only to the top 2 positions", () => {
    expect(
      standings.filter((s) => s.bonusPoints === 1).map((s) => s.position)
    ).toEqual([1, 2]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: FAIL — `computeDayStandings` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Add to `shared/summerCup/standings.ts` (also extend the type import to include `DayPlayer`):

```ts
import type { DayPlayer, Match, PlayDayResults } from "../data/summerCupResults";

export interface DayStanding {
  player: DayPlayer;
  position: number;            // 1-based, after tie-breaks
  framesWon: number;
  matchesWon: number;
  participationPoints: number; // always 2
  rankingPoints: number;       // n .. 1 by position
  bonusPoints: number;         // 1 if position <= 2 else 0
  totalPoints: number;
}

interface Tally {
  player: DayPlayer;
  framesWon: number;
  matchesWon: number;
}

/** Frames won counting only matches played among the given player ids. */
function headToHeadFrames(day: PlayDayResults, ids: Set<string>): Map<string, number> {
  const frames = new Map<string, number>();
  ids.forEach((id) => frames.set(id, 0));
  for (const match of day.matches) {
    if (!ids.has(match.a) || !ids.has(match.b)) continue;
    const outcome = resolveMatch(match);
    frames.set(match.a, (frames.get(match.a) ?? 0) + outcome.framesA);
    frames.set(match.b, (frames.get(match.b) ?? 0) + outcome.framesB);
  }
  return frames;
}

/** Resolve the order within a group of players tied on frames + matches won. */
function breakTie(day: PlayDayResults, group: Tally[]): Tally[] {
  const h2h = headToHeadFrames(day, new Set(group.map((t) => t.player.id)));

  const tiebreakIndex = new Map<string, number>();
  (day.tiebreak ?? []).forEach((id, i) => tiebreakIndex.set(id, i));

  const inputIndex = new Map<string, number>();
  day.players.forEach((player, i) => inputIndex.set(player.id, i));

  return [...group].sort((x, y) => {
    const fx = h2h.get(x.player.id) ?? 0;
    const fy = h2h.get(y.player.id) ?? 0;
    if (fy !== fx) return fy - fx; // more head-to-head frames first

    const tx = tiebreakIndex.get(x.player.id);
    const ty = tiebreakIndex.get(y.player.id);
    if (tx !== undefined && ty !== undefined && tx !== ty) return tx - ty;

    return (inputIndex.get(x.player.id) ?? 0) - (inputIndex.get(y.player.id) ?? 0);
  });
}

function orderPlayers(day: PlayDayResults, tallies: Tally[]): Tally[] {
  const byPrimary = [...tallies].sort((x, y) => {
    if (y.framesWon !== x.framesWon) return y.framesWon - x.framesWon;
    return y.matchesWon - x.matchesWon;
  });

  const result: Tally[] = [];
  let i = 0;
  while (i < byPrimary.length) {
    let j = i + 1;
    while (
      j < byPrimary.length &&
      byPrimary[j].framesWon === byPrimary[i].framesWon &&
      byPrimary[j].matchesWon === byPrimary[i].matchesWon
    ) {
      j++;
    }
    const group = byPrimary.slice(i, j);
    result.push(...(group.length > 1 ? breakTie(day, group) : group));
    i = j;
  }
  return result;
}

export function computeDayStandings(day: PlayDayResults): DayStanding[] {
  const tallies = new Map<string, Tally>();
  for (const player of day.players) {
    tallies.set(player.id, { player, framesWon: 0, matchesWon: 0 });
  }

  for (const match of day.matches) {
    const outcome = resolveMatch(match);
    const a = tallies.get(match.a);
    const b = tallies.get(match.b);
    if (!a || !b) continue;
    a.framesWon += outcome.framesA;
    b.framesWon += outcome.framesB;
    if (outcome.winnerId === match.a) a.matchesWon++;
    else if (outcome.winnerId === match.b) b.matchesWon++;
  }

  const n = day.players.length;
  return orderPlayers(day, [...tallies.values()]).map((tally, i) => {
    const position = i + 1;
    const participationPoints = 2;
    const rankingPoints = n - i; // 1st = n, last = 1
    const bonusPoints = position <= 2 ? 1 : 0;
    return {
      player: tally.player,
      position,
      framesWon: tally.framesWon,
      matchesWon: tally.matchesWon,
      participationPoints,
      rankingPoints,
      bonusPoints,
      totalPoints: participationPoints + rankingPoints + bonusPoints,
    };
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: PASS (all `computeDayStandings` tests green; earlier suites still green).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/standings.ts shared/summerCup/standings.test.ts
git commit -m "feat: compute Summer Cup day standings with tie-breaks and points"
```

---

## Task 5: `computeSummerRanking` — overall aggregation

**Files:**
- Modify: `shared/summerCup/standings.ts`
- Modify (test): `shared/summerCup/standings.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `shared/summerCup/standings.test.ts`:

```ts
import { computeSummerRanking } from "./standings";

describe("computeSummerRanking", () => {
  it("aggregates a single play day", () => {
    const ranking = computeSummerRanking(playDayResults);
    expect(ranking[0]).toMatchObject({ position: 1, totalPoints: 8, playDaysPlayed: 1 });
    expect(ranking[0].player.name).toBe("Andy Vleugels");
    expect(ranking.at(-1)).toMatchObject({ totalPoints: 3 });
  });

  it("keeps the head-to-head tie order (Eddy over Ronnie)", () => {
    const ranking = computeSummerRanking(playDayResults);
    const eddy = ranking.findIndex((r) => r.player.name === "Eddy Ritzen");
    const ronnie = ranking.findIndex((r) => r.player.name === "Ronnie De Reydt");
    expect(eddy).toBeLessThan(ronnie);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: FAIL — `computeSummerRanking` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Add to `shared/summerCup/standings.ts`:

```ts
export interface SummerRow {
  player: DayPlayer;
  playDaysPlayed: number;
  totalPoints: number;
  position: number; // 1-based
}

export function computeSummerRanking(days: PlayDayResults[]): SummerRow[] {
  const rows = new Map<string, { player: DayPlayer; playDaysPlayed: number; totalPoints: number }>();

  for (const day of days) {
    for (const standing of computeDayStandings(day)) {
      const existing = rows.get(standing.player.id);
      // TODO(organiser): "enkel je beste resultaat telt per toernooi" - when a
      // player appears on both days of one tournament, only the best result should
      // count. No such data exists yet; a straight sum is correct for now.
      if (existing) {
        existing.playDaysPlayed += 1;
        existing.totalPoints += standing.totalPoints;
      } else {
        rows.set(standing.player.id, {
          player: standing.player,
          playDaysPlayed: 1,
          totalPoints: standing.totalPoints,
        });
      }
    }
  }

  return [...rows.values()]
    .sort((x, y) => y.totalPoints - x.totalPoints)
    .map((row, i) => ({ ...row, position: i + 1 }));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test shared/summerCup/standings.test.ts`
Expected: PASS (all suites green).

- [ ] **Step 5: Commit**

```bash
git add shared/summerCup/standings.ts shared/summerCup/standings.test.ts
git commit -m "feat: aggregate Summer Cup overall ranking from play days"
```

---

## Task 6: `SummerCupResultsGrid.vue` — cross-table component

**Files:**
- Create: `app/components/SummerCupResultsGrid.vue`

No unit test: the project has no Vue component test harness installed (Vitest covers the pure logic only). This component is presentational and is verified visually in Task 9.

- [ ] **Step 1: Create the component**

```vue
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
            <th class="w-10"></th>
            <th
              v-for="(player, j) in players"
              :key="player.id"
              class="w-10 border border-white/25 py-1 font-semibold"
            >
              {{ j + 1 }}
            </th>
            <th class="border border-white/25 px-3 py-1 font-semibold">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in grid" :key="players[i].id">
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SummerCupResultsGrid.vue
git commit -m "feat: add Summer Cup cross-table results grid component"
```

---

## Task 7: `SummerCupStandings.vue` — day standings component

**Files:**
- Create: `app/components/SummerCupStandings.vue`

No unit test (presentational; verified visually in Task 9).

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { DayStanding } from "#shared/summerCup/standings";

defineProps<{
  standings: DayStanding[];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-white/30">
          <th class="py-2 pr-4">#</th>
          <th class="py-2 pr-4">Speler</th>
          <th class="py-2 pr-4 text-center">Frames</th>
          <th class="py-2 pr-4 text-center">Wedstrijden</th>
          <th class="py-2 pr-4 text-center">Deelname</th>
          <th class="py-2 pr-4 text-center">Ranking</th>
          <th class="py-2 pr-4 text-center">Bonus</th>
          <th class="py-2 text-center">Totaal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in standings" :key="s.player.id" class="border-b border-white/15">
          <td class="py-2 pr-4">{{ s.position }}</td>
          <td class="py-2 pr-4">{{ s.player.name }}</td>
          <td class="py-2 pr-4 text-center">{{ s.framesWon }}</td>
          <td class="py-2 pr-4 text-center">{{ s.matchesWon }}</td>
          <td class="py-2 pr-4 text-center">{{ s.participationPoints }}</td>
          <td class="py-2 pr-4 text-center">{{ s.rankingPoints }}</td>
          <td class="py-2 pr-4 text-center">{{ s.bonusPoints }}</td>
          <td class="py-2 text-center font-bold">{{ s.totalPoints }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/SummerCupStandings.vue
git commit -m "feat: add Summer Cup day standings component"
```

---

## Task 8: Wire results & ranking into the page

**Files:**
- Modify: `app/pages/6-reds-summer-cup.vue`

- [ ] **Step 1: Add imports and computed data in `<script setup>`**

The first line currently is:

```ts
import { finaleDay, MIN_PER_PLAY_DAY, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS, REGISTRATION_FEE, PLAY_TIME } from "#shared/data/summerCup";
```

Replace it with (adds `getPlayDay` and the two new modules):

```ts
import { finaleDay, getPlayDay, MIN_PER_PLAY_DAY, MAX_PER_PLAY_DAY, MAX_UNIQUE_PLAYERS, REGISTRATION_FEE, PLAY_TIME } from "#shared/data/summerCup";
import { playDayResults } from "#shared/data/summerCupResults";
import { buildResultsGrid, computeDayStandings, computeSummerRanking } from "#shared/summerCup/standings";
```

Then add, just after the `const showMoreInfo = ref(false);` line:

```ts
const summerRanking = computeSummerRanking(playDayResults);

// Play days that have results, newest first.
const resultBlocks = [...playDayResults]
  .sort((a, b) => (a.playDayId < b.playDayId ? 1 : -1))
  .map((day) => ({
    id: day.playDayId,
    label: getPlayDay(day.playDayId)?.label ?? day.playDayId,
    players: day.players,
    grid: buildResultsGrid(day),
    standings: computeDayStandings(day),
  }));
```

- [ ] **Step 2: Replace the "Binnenkort" placeholder in the `#rangschikking` section**

Replace this block:

```vue
      <h1>RANGSCHIKKING</h1>
      <u-alert
        title="Binnenkort"
        description="De rangschikking van de deelnemers wordt later toegevoegd."
        color="neutral"
        variant="subtle"
      />
```

with:

```vue
      <h1>RANGSCHIKKING</h1>

      <div class="flex flex-col gap-4">
        <h2>Summer Ranking</h2>
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
                <td class="py-2 pr-4 text-center">{{ row.playDaysPlayed }}</td>
                <td class="py-2 text-center font-bold">{{ row.totalPoints }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-for="block in resultBlocks" :key="block.id" class="flex flex-col gap-6">
        <h2>{{ block.label }}</h2>
        <summer-cup-results-grid :players="block.players" :grid="block.grid" />
        <summer-cup-standings :standings="block.standings" />
      </div>
```

- [ ] **Step 3: Run the dev server and check the page**

Run: `pnpm dev`
Open: `http://localhost:3000/6-reds-summer-cup` → scroll to RANGSCHIKKING.
Expected: a Summer Ranking table (Andy 8, Marco 7, Danny 5, Eddy 4, Ronnie 3), then a "Toernooi 1 — woensdag 17 juni 2026" block with the cross-table grid (matching the screenshot: scores 3/3/1/1/2, black diagonal) and the day standings table. Stop the server when done (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add app/pages/6-reds-summer-cup.vue
git commit -m "feat: render Summer Cup results and ranking on the page"
```

---

## Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: all `shared/summerCup/standings.test.ts` suites PASS; no other project tests exist.

- [ ] **Step 2: Type-check / build**

Run: `pnpm build`
Expected: build succeeds with no type errors. (If `pnpm build` is heavy locally, `pnpm exec nuxi typecheck` is an acceptable substitute.)

- [ ] **Step 3: Lint the changed files**

Run: `pnpm exec eslint app/pages/6-reds-summer-cup.vue app/components/SummerCupResultsGrid.vue app/components/SummerCupStandings.vue shared/summerCup/standings.ts shared/data/summerCupResults.ts`
Expected: no lint errors.

- [ ] **Step 4: Final visual confirmation**

Run: `pnpm dev` and re-check the RANGSCHIKKING section on desktop and a narrow (mobile) width — the grid and tables scroll horizontally rather than overflowing. Stop the server when done.

---

## Self-Review

**Spec coverage:**
- Data model (matches w/ per-frame scores + winner fallback) → Task 1. ✓
- Frame-winner / frames-won / matches-won derivation → Tasks 2, 4. ✓
- Documented point system (2 deelname, n..1 ranking, +1 bonus top 2) → Task 4. ✓
- Tie-break order (frames → matches → head-to-head → `tiebreak` override) → Task 4 (`orderPlayers`/`breakTie`). ✓
- Cross-table grid (derived, black diagonal, Score column) → Tasks 3, 6. ✓
- Day standings table → Tasks 4, 7. ✓
- Summer Ranking (aggregate) → Tasks 5, 8 (inline table). ✓
- 2026-06-17 expected standings (Andy 8 … Ronnie 3) → Task 4 tests. ✓
- Vitest coverage → Tasks 2–5. ✓
- UI in `#rangschikking`, mobile horizontal scroll → Task 8. ✓
- Documented TODOs (1-1 frame split, best-result-per-tournament) → Tasks 2, 5. ✓

**Placeholder scan:** No "TBD"/"implement later" in steps. The two `// TODO(organiser)` comments are intentional, documented scope boundaries (per the spec's "Out of scope"), each with concrete fallback behaviour already implemented.

**Type consistency:** `MatchOutcome { framesA, framesB, winnerId }` is produced by `resolveMatch` (Task 2) and consumed by `buildResultsGrid` (Task 3) and `computeDayStandings` (Task 4). `DayStanding` (Task 4) is consumed by `SummerCupStandings.vue` (Task 7) and `computeSummerRanking` (Task 5). `SummerRow` (Task 5) is consumed by the page's inline table (Task 8). `DayPlayer` is imported into `SummerCupResultsGrid.vue` (Task 6). Component tags `<summer-cup-results-grid>` / `<summer-cup-standings>` match the auto-import filenames. Props (`players`, `grid`, `standings`) match the page bindings in Task 8. All consistent.
