# 6 Reds SummER Cup — 19/06 play day + best result per tournament

**Date:** 2026-06-14
**Status:** Approved (brainstorm)
**Builds on:** [2026-06-14-summer-cup-results-ranking-design.md](2026-06-14-summer-cup-results-ranking-design.md)

## Goal

Add example results for the **vrijdag 19 juni 2026** play day (8 players), of whom
**2 also played wednesday 17 juni 2026**, and implement the documented rule
"enkel je beste resultaat telt per toernooi": for a player who played both days of
one tournament, only their best day counts toward the Summer Ranking. This replaces
the straight-sum `TODO` currently in `computeSummerRanking`.

## Rules applied

- Both 2026-06-17 and 2026-06-19 belong to **tournament 1** (`playDays[].tournament === 1`).
- 8 players → matches over **1 frame** ("Bij meer dan 5 deelnemers ... over 1 frame"),
  entered winner-only (only outcomes are known for an example), so a 28-match round-robin.
- **Best result = highest total day points** (deelname + ranking + bonus). Ties between
  a player's two days → keep the **earlier** day.
- Summer Ranking "Speeldagen" column shows **counted** days (best-per-tournament), not
  days played. With only tournament 1 present, every player shows 1.
- No overall-ranking tiebreak is defined in the rules, so equal-point rows keep a
  deterministic stable order (no invented tiebreak).

## Data — new `2026-06-19` entry in `shared/data/summerCupResults.ts`

`{ playDayId: "2026-06-19", players: [...8], matches: [...28] }`.

Players (grid/registration order, with their intended finishing rank 1=strongest):

| idx | name | id | rank | wins |
|----|------|----|----|----|
| 0 | Tom Janssens | `tom-janssens` | 2 | 6 |
| 1 | Marco Vitali | `marco-vitali` (reused) | 6 | 2 |
| 2 | Geert Willems | `geert-willems` | 8 | 0 |
| 3 | Bart Peeters | `bart-peeters` | 3 | 5 |
| 4 | Danny Moors | `danny-moors` (reused) | 1 | 7 |
| 5 | Luc Vermeulen | `luc-vermeulen` | 7 | 1 |
| 6 | Koen Maes | `koen-maes` | 4 | 4 |
| 7 | Wim Claes | `wim-claes` | 5 | 3 |

The two overlapping players **reuse the exact ids** `marco-vitali` and `danny-moors`
from 2026-06-17 — this is what links them across days in the ranking.

Results are a strict transitive order (stronger rank always wins), giving distinct win
counts 7…0 and no within-day ties. The 28 matches (`a, b, winner`), one per pair in
the array order above:

```
tom  vs marco  -> a      marco vs geert -> a      geert vs bart -> b      bart vs danny -> b
tom  vs geert  -> a      marco vs bart  -> b      geert vs danny -> b     bart vs luc   -> a
tom  vs bart   -> a      marco vs danny -> b      geert vs luc  -> b      bart vs koen  -> a
tom  vs danny  -> b      marco vs luc   -> a      geert vs koen -> b      bart vs wim   -> a
tom  vs luc    -> a      marco vs koen  -> b      geert vs wim  -> b      danny vs luc  -> a
tom  vs koen   -> a      marco vs wim   -> b                              danny vs koen -> a
tom  vs wim    -> a                                                       danny vs wim  -> a
luc  vs koen   -> b      luc vs wim -> b          koen vs wim -> a
```

### Expected 2026-06-19 day standings (test fixture)

| # | Speler | Frames | Matches | Punten |
|---|--------|:--:|:--:|:--:|
| 1 | Danny Moors | 7 | 7 | 11 |
| 2 | Tom Janssens | 6 | 6 | 10 |
| 3 | Bart Peeters | 5 | 5 | 8 |
| 4 | Koen Maes | 4 | 4 | 7 |
| 5 | Wim Claes | 3 | 3 | 6 |
| 6 | Marco Vitali | 2 | 2 | 5 |
| 7 | Luc Vermeulen | 1 | 1 | 4 |
| 8 | Geert Willems | 0 | 0 | 3 |

(1st = 2+8+1, 2nd = 2+7+1, 3rd..8th = 2 + (n−pos+1) ranking, bonus only top 2.)

## Logic — `computeSummerRanking` in `shared/summerCup/standings.ts`

Rewrite to group by tournament:

1. Import `getPlayDay` from `../data/summerCup`.
2. Process days chronologically (sort by `playDayId`, ISO so lexical).
3. For each day, derive its `tournament = getPlayDay(day.playDayId)?.tournament ?? day.playDayId`.
4. Track the **best** day standing per `(player.id, tournament)`: replace only when a
   later day has strictly greater `totalPoints` (so on a tie the earlier day, processed
   first, is kept).
5. Per player, sum the best points across tournaments; `playDaysCounted` = number of
   such best days (= number of tournaments the player scored in).
6. Sort by `totalPoints` desc (stable); assign 1-based `position`.

`SummerRow.playDaysPlayed` is renamed to **`playDaysCounted`**.

```ts
export interface SummerRow {
  player: DayPlayer;
  playDaysCounted: number;
  totalPoints: number;
  position: number;
}
```

### Expected Summer Ranking (test fixture)

| # | Speler | playDaysCounted | totalPoints | counted day |
|---|--------|:--:|:--:|---|
| 1 | Danny Moors | 1 | 11 | 19/06 (beats Wed 5) |
| 2 | Tom Janssens | 1 | 10 | 19/06 |
| 3 | Andy Vleugels | 1 | 8 | 17/06 |
| 4 | Bart Peeters | 1 | 8 | 19/06 |
| 5 | Marco Vitali | 1 | 7 | 17/06 (beats Fri 5) |
| 6 | Koen Maes | 1 | 7 | 19/06 |
| 7 | Wim Claes | 1 | 6 | 19/06 |
| 8 | Eddy Ritzen | 1 | 4 | 17/06 |
| 9 | Luc Vermeulen | 1 | 4 | 19/06 |
| 10 | Ronnie De Reydt | 1 | 3 | 17/06 |
| 11 | Geert Willems | 1 | 3 | 19/06 |

Order is produced by stable sort over the best-map insertion order (17/06 standings
first, then 19/06). The "counted day" column is documentation only — not rendered.

## UI — `app/pages/6-reds-summer-cup.vue`

Only change: the Summer Ranking table binding `row.playDaysPlayed` → `row.playDaysCounted`
(header stays "Speeldagen"). The `resultBlocks` loop already renders newest-first, so the
19/06 grid + standings appear above 17/06, each day's full standings shown. No component
changes.

## Testing — `test/summerCup-standings.test.ts`

- 2026-06-19 day standings: order and points match the fixture above (Danny 11 … Geert 3).
- `computeSummerRanking` with both days:
  - Marco Vitali totals **7** (Wed kept, not his Fri 5); Danny Moors totals **11** (Fri kept).
  - `playDaysCounted === 1` for Marco and Danny (played 2, counted 1).
  - Full 11-row order and points match the fixture.
- Update the existing single-day `computeSummerRanking` assertion (`playDaysPlayed` →
  `playDaysCounted`).

## Out of scope (unchanged)

- Even-frame 1–1 match-winner rule (still a documented `TODO`).
- Any overall-ranking tiebreak beyond deterministic stable order.
