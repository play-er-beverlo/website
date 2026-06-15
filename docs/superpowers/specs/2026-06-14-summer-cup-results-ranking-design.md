# 6 Reds SummER Cup — results & ranking

**Date:** 2026-06-14
**Status:** Approved (brainstorm)
**Page:** `app/pages/6-reds-summer-cup.vue` (`#rangschikking` section)

## Goal

Visualise each play day's round-robin results as a cross-table grid and a day
standings table, and produce the overall **Summer Ranking** — all computed from
stored results using the point system already documented on the page. First data:
play day **2026-06-17** (Toernooi 1, woensdag).

## Documented rules (source of truth — already on the page)

**Points per play day** ("Puntensysteem en ranking"):

- Every participant gets **2 deelnamepunten**.
- Ranking points by final position: the winner gets points equal to the number of
  participants, each lower place one point less (1st = n, last = 1).
- The **top 2** of each play day get **+1 bonuspunt**.

**Within-day ranking** ("Rangschikking tijdens een speeldag"), tie-break order:

1. Frames won
2. Matches won
3. Head-to-head (onderling resultaat)
4. Black ball game (BO3)
5. Up-and-down over one cushion

Criteria 4–5 cannot be computed from scores; they are handled by a manual
`tiebreak` override in the data when needed.

## Data model — `shared/summerCup/results.ts`

Source of truth is the list of matches with per-frame point scores. Everything
shown (the grid, frames won, matches won, standings, points) is derived.

```ts
export interface DayPlayer {
  id: string;   // stable slug, e.g. "marco-vitali"
  name: string; // display name, e.g. "Marco Vitali"
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
  winner?: "a" | "b"; // fallback when only the outcome is known (e.g. 2026-06-17)
}

export interface PlayDayResults {
  playDayId: string;     // links to playDays[].id in shared/data/summerCup.ts
  players: DayPlayer[];  // table order = grid row/col order (1..n)
  matches: Match[];      // every round-robin pairing, one entry per pair
  tiebreak?: string[];   // optional manual order (player ids) for unresolved ties
}

export const playDayResults: PlayDayResults[] = [ /* 2026-06-17 ... */ ];
```

### Representing a match

A `Match` is resolved one of two ways:

- **`frames` present** — the real case. Frame winner = higher point total. A
  player's frames-won for the match = number of frames they win. Match winner =
  more frames won.
- **`winner` present, no `frames`** — outcome-only (the 2026-06-17 import, where
  only win/loss is known). Treated as a single decisive frame: the winner gets
  1 frame won and the match; the loser 0.

**Open rule (documented TODO):** with exactly two frames a 1–1 split leaves the
match winner undecided by frames alone. The exact resolution (e.g. total points)
is not specified in the current rules and no two-frame data exists yet, so
`computeDayStandings` will mark such a match's winner as undecided and a `// TODO`
notes that the organiser must confirm the rule before two-frame data is entered.
This does not affect 2026-06-17 (all winner-only) or the frames-won tiebreaker,
which still counts each won frame.

### 2026-06-17 data

Players (grid order): Marco Vitali, Andy Vleugels, Eddy Ritzen, Ronnie De Reydt,
Danny Moors. Ten matches entered as `winner`-only, reproducing the screenshot grid.
Match outcomes (from the matrix, verified mirror-consistent):

- Andy beat Marco; Marco beat Eddy, Ronnie, Danny
- Andy beat Eddy, Danny; Ronnie beat Andy
- Eddy beat Ronnie; Danny beat Eddy
- Danny beat Ronnie

## Computation — same module, pure & unit-tested

```ts
export interface DayStanding {
  player: DayPlayer;
  position: number;        // 1-based, after tie-breaks
  framesWon: number;
  matchesWon: number;
  participationPoints: number; // always 2
  rankingPoints: number;       // n .. 1 by position
  bonusPoints: number;         // 1 if position <= 2 else 0
  totalPoints: number;         // sum of the three
}

export function computeDayStandings(day: PlayDayResults): DayStanding[];

export interface SummerRow {
  player: DayPlayer;
  playDaysPlayed: number;
  totalPoints: number;
  position: number;
}

export function computeSummerRanking(days: PlayDayResults[]): SummerRow[];
```

**Ordering** in `computeDayStandings`: sort by framesWon desc → matchesWon desc →
head-to-head → `tiebreak` override. Head-to-head for a tied subgroup is a
mini-table of frames won counting only matches among the tied players; if that
still ties and no `tiebreak` is given, original input order is kept (stable).

**Summer Ranking**: per-player sum of `totalPoints` across all play days, sorted
by total desc. The documented "enkel je beste resultaat telt per toernooi" rule
(a player on both days of one tournament) only matters once such data exists; for
now a straight sum is correct and a `// TODO` marks where that rule would apply.

### Expected 2026-06-17 standings (test fixtures)

| # | Speler | Frames | Matches | Deelname | Ranking | Bonus | Totaal |
|---|--------|:------:|:-------:|:--------:|:-------:|:-----:|:------:|
| 1 | Andy Vleugels   | 3 | 3 | 2 | 5 | 1 | 8 |
| 2 | Marco Vitali    | 3 | 3 | 2 | 4 | 1 | 7 |
| 3 | Danny Moors     | 2 | 2 | 2 | 3 | 0 | 5 |
| 4 | Eddy Ritzen     | 1 | 1 | 2 | 2 | 0 | 4 |
| 5 | Ronnie De Reydt | 1 | 1 | 2 | 1 | 0 | 3 |

Andy > Marco and Eddy > Ronnie resolved by head-to-head. Point totals sum to 27
(10 deelname + 15 ranking + 2 bonus).

## UI — `#rangschikking` section

Replaces the current "Binnenkort" `u-alert`. Layout top to bottom:

1. **Summer Ranking** (overall) — table: `#`, Speler, Speeldagen, Punten.
   Reflects 2026-06-17 only for now; grows as play days are added.
2. **Per speeldag** block, one per play day that has results, newest first:
   - Heading with the play day label (from `getPlayDay`).
   - **Cross-table grid** styled like the screenshot: numbered player legend, an
     n×n matrix (derived frames-won per cell, blacked-out diagonal), Score column.
   - **Day standings** table with the columns from the table above (points
     breakdown: Deelname / Ranking / Bonus / Totaal).

### Components

Two presentational components (matching the existing `SummerCupRegistration.vue`
pattern), receiving derived data as props — no logic inside:

- `app/components/SummerCupResultsGrid.vue` — the cross-table for one play day.
- `app/components/SummerCupStandings.vue` — a standings table (reused for the day
  standings and, with a column variant, the Summer Ranking).

The page orchestrates: imports `playDayResults`, calls the compute functions, and
passes results into the components. Mobile: horizontal scroll wrapper like the
existing Kalender table.

## Testing

First project Vitest test, colocated: `shared/summerCup/results.test.ts`.

- Frame-winner derivation from point scores (e.g. 45–57 → b wins) and winner-only.
- Frames-won and matches-won counts for 2026-06-17.
- Head-to-head tie-break (Andy/Marco, Eddy/Ronnie).
- Points math: participation, ranking (n..1), bonus (top 2), totals.
- Full 2026-06-17 standings match the table above.
- `computeSummerRanking` aggregates a single play day correctly.

Run with `pnpm test` (`vitest run`).

## Out of scope (YAGNI)

- Database storage or an admin entry screen — results live in versioned data,
  edited in the file.
- "Best result per tournament" aggregation — `// TODO`, no data needs it yet.
- Two-frame 1–1 match-winner rule — `// TODO`, confirm with organiser.
