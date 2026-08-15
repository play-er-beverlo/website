import { finaleDay } from "./summerCup";
import type { Break, DayPlayer, Match, PlayDayResults } from "./summerCupResults";
import {
  andy as andyId,
  danny as dannyId,
  eddy as eddyId,
  ibe as ibeId,
  klaas as klaasId,
  marco as marcoId,
  roman as romanId,
  steff as steffId,
} from "./summerCupResults";

/** One of the round-robin groups played before the knockout stage. */
export interface FinalePoule {
  /** Display name, e.g. "Poule 1". */
  name: string;
  /** Table order = grid row/col order (1..n), as on the score card. */
  players: DayPlayer[];
  matches: Match[];
  /** Ids of the players that reached the halve finale, in finishing order. */
  qualified: string[];
  /** Optional one-liner shown under the poule, e.g. a late replacement. */
  note?: string;
}

/** A knockout tie; the frames are the frames won inside that tie. */
export interface FinaleTie {
  a: DayPlayer;
  b: DayPlayer;
  framesA: number;
  framesB: number;
}

export interface FinaleRound {
  /** Display name, e.g. "Halve finale". */
  name: string;
  /** Match length, e.g. "best of 3". */
  format: string;
  ties: FinaleTie[];
}

export interface FinaleDayResults {
  /** Links to finaleDay.id in ./summerCup. */
  id: string;
  poules: FinalePoule[];
  /** Knockout rounds in the order they are shown. */
  rounds: FinaleRound[];
  /** Final classification of every participant, 1st place first. */
  finalRanking: DayPlayer[];
  /** 30+ breaks made on the finale day. */
  breaks: Break[];
}

const player = {
  andy: { id: andyId, name: "Andy Vleugels" },
  danny: { id: dannyId, name: "Danny Moors" },
  eddy: { id: eddyId, name: "Eddy Ritzen" },
  ibe: { id: ibeId, name: "Ibe Sijben" },
  klaas: { id: klaasId, name: "Klaas Piekarczyk" },
  marco: { id: marcoId, name: "Marco Vitali" },
  roman: { id: romanId, name: "Roman Szpyt" },
  steff: { id: steffId, name: "Steff Beckers" },
} satisfies Record<string, DayPlayer>;

/**
 * Finale day: the top 8 of the SummER Ranking were invited, Klaas took the place of
 * Jean-Pierre (9th replacing the only absentee). Instead of one poule of 8 there were
 * two poules of 4, with the top 2 of each poule going through to the halve finale.
 */
export const finaleDayResults: FinaleDayResults = {
  id: finaleDay.id,
  poules: [
    {
      name: "Poule 1",
      players: [player.eddy, player.andy, player.marco, player.klaas],
      // 1 frame per match, recorded as frames won (1-0 / 0-1).
      matches: [
        { a: eddyId, b: andyId, framesA: 0, framesB: 1 },
        { a: eddyId, b: marcoId, framesA: 0, framesB: 1 },
        { a: eddyId, b: klaasId, framesA: 1, framesB: 0 },
        { a: andyId, b: marcoId, framesA: 0, framesB: 1 },
        { a: andyId, b: klaasId, framesA: 1, framesB: 0 },
        { a: marcoId, b: klaasId, framesA: 1, framesB: 0 },
      ],
      qualified: [marcoId, andyId],
      note: "Klaas Piekarczyk nam de plaats in van Jean-Pierre Van Camp.",
    },
    {
      name: "Poule 2",
      players: [player.steff, player.danny, player.roman, player.ibe],
      matches: [
        { a: steffId, b: dannyId, framesA: 0, framesB: 1 },
        { a: steffId, b: romanId, framesA: 1, framesB: 0 },
        { a: steffId, b: ibeId, framesA: 1, framesB: 0 },
        { a: dannyId, b: romanId, framesA: 1, framesB: 0 },
        { a: dannyId, b: ibeId, framesA: 1, framesB: 0 },
        { a: romanId, b: ibeId, framesA: 0, framesB: 1 },
      ],
      qualified: [dannyId, steffId],
    },
  ],
  rounds: [
    {
      name: "Halve finale",
      format: "best of 3",
      ties: [
        { a: player.steff, b: player.marco, framesA: 2, framesB: 1 },
        { a: player.danny, b: player.andy, framesA: 2, framesB: 0 },
      ],
    },
    {
      name: "Finale",
      format: "best of 5",
      ties: [{ a: player.danny, b: player.steff, framesA: 3, framesB: 2 }],
    },
    {
      name: "Troostfinale",
      format: "best of 3",
      ties: [{ a: player.marco, b: player.andy, framesA: 2, framesB: 0 }],
    },
  ],
  // Places 1-4 come out of the finale and the troostfinale. Places 5-8 are the poule
  // exits: both poule thirds (Eddy, Ibe) ahead of both poule fourths (Roman, Klaas).
  // Eddy/Ibe and Roman/Klaas played in different poules and finished level there, so
  // nothing on the day separates them; their order follows the seeding for the day
  // (the startscore on the score card, which is the SummER Ranking order).
  finalRanking: [
    player.danny,
    player.steff,
    player.marco,
    player.andy,
    player.eddy,
    player.ibe,
    player.roman,
    player.klaas,
  ],
  breaks: [
    // Steff in the halve finale against Marco (highest break of the tournament),
    // Marco in the poule against Klaas.
    { player: steffId, value: 35 },
    { player: marcoId, value: 32 },
  ],
};

/**
 * The finale day shaped as a play day, deliberately without matches: the finale
 * results do not count toward the SummER Ranking, but the breaks made there do count
 * for the breaks ranking and the season facts. Feed this to the break aggregations
 * only — never to computeSummerRanking.
 */
export const finaleBreakSource: PlayDayResults = {
  playDayId: finaleDayResults.id,
  players: finaleDayResults.poules.flatMap((poule) => poule.players),
  matches: [],
  breaks: finaleDayResults.breaks,
};
