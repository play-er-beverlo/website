# Summer Cup — best-3-results points cap

## Problem

Some players can't make every play day or tournament. To keep the points
ranking fair, only a player's **best 3 results** should count toward the points
classification — "beste 3 van de mogelijks 8 speeldagen". The 2 participation
points must still be awarded for **every** play day actually played (play all 8
→ 16 participation points) as an incentive to play often. Breaks must keep
showing, including from results that don't count toward a player's points.

## Scoring rule (`computeSummerRanking`)

For each play day a player participated in, compute the day standing as today.

1. **Participation** counts for every day played:
   `participation = Σ participationPoints` (2 per day). Play all 8 → 16.
2. **Competitive points** per day = `rankingPoints + bonusPoints`.
3. Keep only the **best day per tournament** for the competitive points
   (existing rule, max 4 values — one per tournament played).
4. Sum the **best 3** of those per-tournament results. With 4 tournaments this
   means "drop your weakest tournament".
5. `totalPoints = participation + best-3 competitive results`.

A player who plays both days of a tournament still earns participation for both
days, but only their better day feeds the competitive total, and only their 3
best tournaments count there.

### Worked totals (current test data)

| Player | Days played | Participation | Best-3 competitive | Total |
|--------|-------------|---------------|--------------------|-------|
| Tom    | 4 | 8  | 8+7+8 = 23 | 31 |
| Danny  | 4 | 8  | 9+5+7 = 21 | 29 |
| Marco  | 5 | 10 | 6+6+5 = 17 | 27 |
| Andy   | 3 | 6  | 6+4+7 = 17 | 23 |
| Bart   | 3 | 6  | 6+5+3 = 14 | 20 |
| Koen   | 3 | 6  | 5+3+6 = 14 | 20 |
| Luc    | 3 | 6  | 2+3+5 = 10 | 16 |
| Eddy   | 3 | 6  | 1+2+6 = 9  | 15 |
| Jef    | 3 | 6  | 3+4+1 = 8  | 14 |
| Wim    | 3 | 6  | 4+1+2 = 7  | 13 |
| Geert  | 3 | 6  | 1+2+4 = 7  | 13 |
| Dirk   | 2 | 4  | 1+3 = 4    | 8  |
| Ronnie | 2 | 4  | 2+2 = 4    | 8  |
| Patrick| 2 | 4  | 1+1 = 2    | 6  |
| Rudy   | 2 | 4  | 1+1 = 2    | 6  |
| Chris  | 1 | 2  | 2          | 4  |

Marco illustrates the rule: his 4th tournament result is dropped from the
competitive total, but all 5 of his days still earn participation.

## Interface / UI

- Rename `SummerRow.playDaysCounted` → `playDaysPlayed` (now = total days
  played). Update the binding in `app/pages/6-reds-summer-cup/index.vue`. The
  "Speeldagen" column shows days played.
- New constant `BEST_RESULTS_COUNTED = 3` in `shared/data/summerCup.ts`, reused
  in the regulation copy so text and logic stay in sync.

## Regulation text (`index.vue`)

- "Puntensysteem en ranking": state that participation points are awarded for
  every play day, and only the best 3 tournament-results count toward the points
  ranking.
- Adjust the "Inschrijvingen" line so "enkel je beste resultaat telt" reads as
  per-tournament, while participation counts per day.

## Breaks

No logic change. `computeBreaksRanking` already aggregates every break
independent of the points rule, and per-day breaks render in each result block,
so breaks from non-counting results keep showing. Refresh the stale comment in
`shared/summerCup/breaks.ts` to mention the best-3 cap.

## Testing (TDD)

Rewrite the `computeSummerRanking` tests for the new totals. Assert per-player
`totalPoints` and `playDaysPlayed` (tie-order independent) plus the unambiguous
top of the ranking (Tom, Danny, Marco, Andy).
