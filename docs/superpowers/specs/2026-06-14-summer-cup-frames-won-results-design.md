# 6 Reds SummER Cup — frames-won match results

**Date:** 2026-06-14
**Status:** Approved (brainstorm)
**Supersedes:** the per-frame point-score model from
[2026-06-14-summer-cup-results-ranking-design.md](2026-06-14-summer-cup-results-ranking-design.md)

## Goal

Stop modelling real per-frame point scores (45–57). A match result is the **frames
won by each player**:

- **4–5 players** → 2 frames per match → result is `2-0`, `1-1`, or `0-2`.
- **6–8 players** → 1 frame per match → result is `1-0` or `0-1`.

A **1–1 is a draw**: each player gets 1 frame won, neither gets a "match won". This
resolves the previous even-frame `TODO`. The black ball game stays a standings
tiebreaker (ex aequo), not a per-match decider.

## Data model — `shared/data/summerCupResults.ts`

```ts
export interface Match {
  a: string;
  b: string;
  /** Frames won by each player. 4–5 players → total 2 (2-0/1-1/0-2); 6–8 players → total 1 (1-0/0-1). */
  framesA: number;
  framesB: number;
}
```

Removed: the `Frame` interface (point totals) and the `winner` field.

## `resolveMatch` — `shared/summerCup/standings.ts`

```ts
export function resolveMatch(match: Match): MatchOutcome {
  const { framesA, framesB } = match;
  let winnerId: string | null = null;
  if (framesA > framesB) winnerId = match.a;
  else if (framesB > framesA) winnerId = match.b;
  return { framesA, framesB, winnerId };
}
```

A 1–1 yields `winnerId: null` (draw). The even-frame `TODO` comment is deleted.
`MatchOutcome`, `buildResultsGrid`, `computeDayStandings`, `computeSummerRanking`, the
two components, and the page are **unchanged** — they already consume `MatchOutcome`.

## Data changes

### 19/06 (8 players, 1 frame) — migrate representation only

Each `winner: "a"` → `framesA: 1, framesB: 0`; `winner: "b"` → `framesA: 0, framesB: 1`.
Results and standings are unchanged: Danny 11 · Tom 10 · Bart 8 · Koen 7 · Wim 6 ·
Marco 5 · Luc 4 · Geert 3.

### 17/06 (5 players, 2 frames) — redone as a 2-frame example

Same five players (order Marco, Andy, Eddy, Ronnie, Danny). Demonstrates a 2-0 sweep,
a **1–1 draw** (Eddy–Ronnie), and a **frames tie broken by head-to-head** (Andy &
Marco both 6 frames; Andy won their match 2–0). Ten matches (`a, b, framesA, framesB`):

```
Marco  vs Andy   -> 0 2      Andy   vs Eddy   -> 2 0      Eddy   vs Ronnie -> 1 1
Marco  vs Eddy   -> 2 0      Andy   vs Ronnie -> 0 2      Eddy   vs Danny  -> 0 2
Marco  vs Ronnie -> 2 0      Andy   vs Danny  -> 2 0      Ronnie vs Danny  -> 0 2
Marco  vs Danny  -> 2 0
```

Derived grid (cell = frames row won vs col; diagonal null):

```
[null, 0, 2, 2, 2]   Marco  -> 6
[2, null, 2, 0, 2]   Andy   -> 6
[0, 0, null, 1, 0]   Eddy   -> 1
[0, 2, 1, null, 0]   Ronnie -> 3
[0, 0, 2, 2, null]   Danny  -> 4
```

17/06 day standings:

| # | Speler | Frames | Matches | Punten |
|---|--------|:--:|:--:|:--:|
| 1 | Andy Vleugels | 6 | 3 | 8 |
| 2 | Marco Vitali | 6 | 3 | 7 |
| 3 | Danny Moors | 4 | 2 | 5 |
| 4 | Ronnie De Reydt | 3 | 1 | 4 |
| 5 | Eddy Ritzen | 1 | 0 | 3 |

(Andy > Marco on head-to-head; both 6 frames / 3 matches.)

## Resulting Summer Ranking

Only the bottom pair changes vs the current ranking (Ronnie's draw + win over Andy
lifts him above Eddy):

**Danny 11 · Tom 10 · Andy 8 · Bart 8 · Marco 7 · Koen 7 · Wim 6 · Ronnie 4 · Luc 4 · Eddy 3 · Geert 3**

Best-result rule still holds: Marco keeps Wed (7 > Fri 5), Danny keeps Fri (11 > Wed 5).

## Tests — `test/summerCup-standings.test.ts`

- Rewrite `resolveMatch` suite for `framesA/framesB`: `2-0` → winner a (2,0); `1-1` →
  draw (`winnerId: null`, 1,1); `0-1` → winner b (0,1).
- Update `buildResultsGrid (2026-06-17)` to the new matrix above.
- Update `computeDayStandings (2026-06-17)`: order Andy, Marco, Danny, Ronnie, Eddy;
  frames 6/6/4/3/1; points 8/7/5/4/3; bonus on positions 1–2.
- `computeDayStandings (2026-06-19)` stays green (unchanged standings).
- Update `computeSummerRanking` full-order fixture to the 11-row order above; the
  best-day assertions (Marco 7, Danny 11, `playDaysCounted` 1) are unchanged.

## Out of scope

- No frame-total validation against field size (hand-entered static data).
- Overall-ranking ties keep their deterministic stable order (unchanged).
