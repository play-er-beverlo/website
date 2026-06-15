# 6 Reds SummER Cup — Breaks (30+) recording & display

**Date:** 2026-06-15
**Status:** Approved (design)

## Goal

A break in snooker is a run of points scored by potting several balls in one
visit. From 30 points or more in a single visit, the break is worth recording.
This feature lets the organiser:

1. **Write breaks by hand** on the printable wedstrijdblad (match sheet), per
   player.
2. **See the breaks of a single play day** on the web page, next to that day's
   results — grouped per player, the player with the highest break of the day on
   top.
3. **See a tournament-wide breaks overview** in the SummER Ranking section — a
   table next to the points ranking, listing every 30+ break per player.

## Decisions (from brainstorming)

- **Per-day display:** grouped per player. One row per player listing all their
  30+ breaks, ordered so the player with the highest break is on top.
- **Tournament overview:** all breaks listed per player (not just the highest),
  ordered by each player's highest break.
- **Wedstrijdblad:** per-player rows — a table listing each registered player
  with a wide blank box to write their breaks.
- **Breaks scope:** every 30+ break counts toward the tournament overview,
  independent of the best-day-per-tournament rule used for points. A break is an
  individual achievement, so a break made on a play day that is *discarded* for
  the points ranking still appears in the breaks overview.

## Architecture

Mirrors the existing SummER Cup split: pure logic in `shared/summerCup/`
(unit-tested), thin presentational components in `app/components/SummerCup*.vue`,
hand-entered data in `shared/data/summerCupResults.ts`.

### 1. Data model

Add an optional `breaks` field to `PlayDayResults` in
`shared/data/summerCupResults.ts`:

```ts
export interface Break {
  player: string; // DayPlayer.id
  value: number;  // points in the break (recorded for 30+)
}

export interface PlayDayResults {
  // ...existing fields (playDayId, players, matches, tiebreak?)...
  breaks?: Break[]; // 30+ breaks made on this play day
}
```

Breaks are entered by hand into the day's results, the same way `matches` are.
A player may have multiple entries. The compute functions defensively ignore any
entry with `value < 30` so stray data never surfaces.

### 2. Pure logic — `shared/summerCup/breaks.ts`

```ts
import type { DayPlayer } from "../data/summerCupResults";

// One row per player with all their breaks (descending), used for both the
// per-day display and the tournament overview.
export interface PlayerBreaks {
  player: DayPlayer;
  breaks: number[]; // sorted descending, all >= 30
  highest: number;  // breaks[0]
}

// Breaks for a single play day.
export function computeDayBreaks(day: PlayDayResults): PlayerBreaks[];

// Breaks aggregated across ALL play days — every break counts, independent of
// the best-day-per-tournament points rule.
export function computeBreaksRanking(days: PlayDayResults[]): PlayerBreaks[];
```

**Ordering rule (both functions):**

- Each player's `breaks` array is sorted descending and filtered to `>= 30`.
- Players are ordered by comparing their break lists element-wise (highest,
  then next-highest, and so on), so `52, 38` ranks above `52, 31`, and a longer
  list ranks above a shorter one when all compared values are equal.
- Remaining ties are broken alphabetically by player name (stable, deterministic
  output — important for snapshot-style tests).
- Players with no 30+ breaks are excluded from the output.

`computeBreaksRanking` resolves each player's display name from any day they
appear in (names are stable across days); breaks for the same `player` id from
different days are merged into one row.

### 3. Per-day breaks display — `app/components/SummerCupBreaks.vue`

- Props: `breaks: PlayerBreaks[]`.
- Renders a "Breaks (30+)" sub-block: one row per player — name + their breaks
  listed descending (e.g. `Marco Vitali — 52, 38`).
- Rendered inside each result block in
  `app/pages/6-reds-summer-cup/index.vue`, below `summer-cup-standings`, using
  `computeDayBreaks(day)`.
- **Empty state:** the component is omitted entirely for a day with no 30+
  breaks (guard in the page with `v-if`).

### 4. Tournament breaks ranking — `app/components/SummerCupBreaksRanking.vue`

- Props: `breaks: PlayerBreaks[]`.
- Columns: `#`, `Speler`, `Breaks` (comma-separated, descending).
- In `app/pages/6-reds-summer-cup/index.vue`, the existing single SummER Ranking
  (points) table and this new breaks table are wrapped in a responsive
  two-column layout (`grid md:grid-cols-2 gap-8`): **points ranking left, breaks
  ranking right**, stacked on mobile.
- The breaks table is fed by `computeBreaksRanking(playDayResults)`.
- **Empty state:** when no player has a 30+ break tournament-wide, the breaks
  side shows "Nog geen breaks van 30+ genoteerd." instead of an empty table.

### 5. Wedstrijdblad break table

In `app/pages/6-reds-summer-cup/wedstrijdblad/[date].vue`, add a "Breaks (30+)"
section below the existing legend + matrix row:

- A bordered table with one row per registered player: `#` (matching the legend
  numbering), `Speler` (name), and a wide blank `Breaks` cell for hand entry.
- Reuses the already-fetched `players` list; no extra data binding.
- `h-10` rows and `border border-black` to match the existing sheet styling;
  `print-color-adjust: exact` so borders print reliably (consistent with the
  current matrix/diagonal handling).
- Shares the page's empty state: when there are no registrations the section is
  not shown (the page already shows "Nog geen inschrijvingen.").

## Testing

`test/summerCup-breaks.test.ts` (vitest, in the style of
`test/summerCup-standings.test.ts`), covering `computeDayBreaks` and
`computeBreaksRanking`:

- Grouping multiple breaks under one player.
- Descending sort within a player's break list.
- Element-wise ordering across players (`52, 38` ranks above `52, 31`).
- Alphabetical tie-break for otherwise-equal players.
- Aggregation across all play days, **including a day discarded for points**, to
  prove every break counts.
- Filtering out `value < 30`.
- Empty / undefined `breaks` → empty result.

No existing tests are affected (the wedstrijdblad test only covers the pure date
helpers, not page markup).

## Out of scope

- No editing UI and no database storage for breaks — entered in the data file
  like match results.
- No enforcement of the 30 threshold at entry time (defensive filter only).
- No break statistics beyond the listed breaks (no averages, totals, or counts
  as separate columns).
