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
 *  independent of the points rules (best day per tournament, best 3 results),
 *  so breaks from results that don't count toward a player's points still show. */
export function computeBreaksRanking(days: PlayDayResults[]): PlayerBreaks[] {
  const playerById = new Map<string, DayPlayer>();
  const all: Break[] = [];
  for (const day of days) {
    for (const p of day.players) if (!playerById.has(p.id)) playerById.set(p.id, p);
    for (const b of day.breaks ?? []) all.push(b);
  }
  return buildRows(playerById, all);
}
