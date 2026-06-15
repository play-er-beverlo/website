import type { DayPlayer, Match, PlayDayResults } from "../data/summerCupResults";
import { getPlayDay } from "../data/summerCup";

export interface MatchOutcome {
  framesA: number;
  framesB: number;
  /** id of the winning player, or null if undecided (e.g. a 1-1 frame split) */
  winnerId: string | null;
}

export function resolveMatch(match: Match): MatchOutcome {
  const { framesA, framesB } = match;
  let winnerId: string | null = null;
  if (framesA > framesB) winnerId = match.a;
  else if (framesB > framesA) winnerId = match.b;
  // A 1-1 is a draw: 1 frame each, no match win.
  return { framesA, framesB, winnerId };
}

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
    const rowA = grid[i];
    const rowB = grid[j];
    if (!rowA || !rowB) continue;
    rowA[j] = outcome.framesA;
    rowB[i] = outcome.framesB;
  }

  return grid;
}

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
    const head = byPrimary[i];
    let j = i + 1;
    while (j < byPrimary.length) {
      const next = byPrimary[j];
      if (!head || !next) break;
      if (next.framesWon !== head.framesWon || next.matchesWon !== head.matchesWon) break;
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
    // Points are strictly by final position; genuinely tied players are separated
    // beforehand by head-to-head / the manual `tiebreak` (and in practice by the
    // organiser's black-ball game), so equal-rank point-splitting isn't modelled.
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

export interface SummerRow {
  player: DayPlayer;
  /** Counted days = the best day per tournament the player scored in. */
  playDaysCounted: number;
  totalPoints: number;
  position: number; // 1-based
}

export function computeSummerRanking(days: PlayDayResults[]): SummerRow[] {
  // "enkel je beste resultaat telt per toernooi": within one tournament only a
  // player's best day counts. Track the highest-points standing per (player,
  // tournament); process days chronologically so a points tie keeps the earlier day.
  const ordered = [...days].sort((a, b) => (a.playDayId < b.playDayId ? -1 : 1));

  const best = new Map<string, { player: DayPlayer; points: number }>();
  for (const day of ordered) {
    const tournament = getPlayDay(day.playDayId)?.tournament ?? day.playDayId;
    for (const standing of computeDayStandings(day)) {
      const key = `${standing.player.id}::${tournament}`;
      const existing = best.get(key);
      if (!existing || standing.totalPoints > existing.points) {
        best.set(key, { player: standing.player, points: standing.totalPoints });
      }
    }
  }

  const rows = new Map<string, { player: DayPlayer; playDaysCounted: number; totalPoints: number }>();
  for (const entry of best.values()) {
    const row = rows.get(entry.player.id);
    if (row) {
      row.playDaysCounted += 1;
      row.totalPoints += entry.points;
    } else {
      rows.set(entry.player.id, {
        player: entry.player,
        playDaysCounted: 1,
        totalPoints: entry.points,
      });
    }
  }

  return [...rows.values()]
    .sort((x, y) => y.totalPoints - x.totalPoints)
    .map((row, i) => ({ ...row, position: i + 1 }));
}
