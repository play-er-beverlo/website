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
