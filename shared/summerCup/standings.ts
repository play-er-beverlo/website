import type { DayPlayer, Match, PlayDayResults } from "../data/summerCupResults";

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
