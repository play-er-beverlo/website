import type { DayPlayer, PlayDayResults } from "../data/summerCupResults";
import { computeDayStandings, resolveMatch } from "./standings";

export interface PlayerStats {
  player: DayPlayer;
  framesWon: number;
  framesPlayed: number;
  /** framesWon / framesPlayed, 0 when no frames played. */
  frameWinPct: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  /** Play days finished in 1st place. */
  dayWins: number;
  /** Play days finished in the top 2. */
  podiums: number;
  /** Average final position across played days. */
  avgPosition: number;
  /** Play days where the player won every match. */
  perfectDays: number;
}

interface StatsTally {
  player: DayPlayer;
  framesWon: number;
  framesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  dayWins: number;
  podiums: number;
  positionSum: number;
  daysPlayed: number;
  perfectDays: number;
}

export function computePlayerStats(days: PlayDayResults[]): PlayerStats[] {
  const tallies = new Map<string, StatsTally>();

  const tallyFor = (player: DayPlayer): StatsTally => {
    let tally = tallies.get(player.id);
    if (!tally) {
      tally = {
        player,
        framesWon: 0,
        framesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        dayWins: 0,
        podiums: 0,
        positionSum: 0,
        daysPlayed: 0,
        perfectDays: 0,
      };
      tallies.set(player.id, tally);
    }
    return tally;
  };

  for (const day of days) {
    const playerById = new Map(day.players.map((p) => [p.id, p]));

    for (const match of day.matches) {
      const a = playerById.get(match.a);
      const b = playerById.get(match.b);
      if (!a || !b) continue;
      const outcome = resolveMatch(match);
      const total = outcome.framesA + outcome.framesB;
      const tallyA = tallyFor(a);
      const tallyB = tallyFor(b);
      tallyA.framesWon += outcome.framesA;
      tallyA.framesPlayed += total;
      tallyB.framesWon += outcome.framesB;
      tallyB.framesPlayed += total;
      if (outcome.winnerId === match.a) {
        tallyA.matchesWon++;
        tallyB.matchesLost++;
      } else if (outcome.winnerId === match.b) {
        tallyB.matchesWon++;
        tallyA.matchesLost++;
      } else {
        tallyA.matchesDrawn++;
        tallyB.matchesDrawn++;
      }
    }

    const matchesPerPlayer = day.players.length - 1;
    for (const standing of computeDayStandings(day)) {
      const tally = tallyFor(standing.player);
      tally.daysPlayed++;
      tally.positionSum += standing.position;
      if (standing.position === 1) tally.dayWins++;
      if (standing.position <= 2) tally.podiums++;
      if (matchesPerPlayer > 0 && standing.matchesWon === matchesPerPlayer) {
        tally.perfectDays++;
      }
    }
  }

  const rows = [...tallies.values()].map((tally) => ({
    player: tally.player,
    framesWon: tally.framesWon,
    framesPlayed: tally.framesPlayed,
    frameWinPct: tally.framesPlayed > 0 ? tally.framesWon / tally.framesPlayed : 0,
    matchesWon: tally.matchesWon,
    matchesLost: tally.matchesLost,
    matchesDrawn: tally.matchesDrawn,
    dayWins: tally.dayWins,
    podiums: tally.podiums,
    avgPosition: tally.daysPlayed > 0 ? tally.positionSum / tally.daysPlayed : 0,
    perfectDays: tally.perfectDays,
  }));

  return rows.sort((x, y) => {
    if (y.frameWinPct !== x.frameWinPct) return y.frameWinPct - x.frameWinPct;
    if (y.framesWon !== x.framesWon) return y.framesWon - x.framesWon;
    return x.player.name.localeCompare(y.player.name);
  });
}

export interface SeasonFacts {
  totalFrames: number;
  totalMatches: number;
  uniquePlayers: number;
  highestBreak: { player: DayPlayer; value: number } | null;
  /** Number of recorded 30+ breaks. */
  breaksCount: number;
  /** Number of 1-1 drawn matches. */
  drawCount: number;
}

export function computeSeasonFacts(days: PlayDayResults[]): SeasonFacts {
  let totalFrames = 0;
  let totalMatches = 0;
  let drawCount = 0;
  let breaksCount = 0;
  let highestBreak: { player: DayPlayer; value: number } | null = null;
  const playerIds = new Set<string>();

  for (const day of days) {
    const playerById = new Map(day.players.map((p) => [p.id, p]));
    for (const player of day.players) playerIds.add(player.id);

    for (const match of day.matches) {
      const outcome = resolveMatch(match);
      totalMatches++;
      totalFrames += outcome.framesA + outcome.framesB;
      if (outcome.winnerId === null) drawCount++;
    }

    for (const b of day.breaks ?? []) {
      const player = playerById.get(b.player);
      if (!player) continue;
      breaksCount++;
      if (!highestBreak || b.value > highestBreak.value) {
        highestBreak = { player, value: b.value };
      }
    }
  }

  return {
    totalFrames,
    totalMatches,
    uniquePlayers: playerIds.size,
    highestBreak,
    breaksCount,
    drawCount,
  };
}
