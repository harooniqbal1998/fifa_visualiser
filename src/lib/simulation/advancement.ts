import type { Match } from "@/types";
import { matches } from "@/data/matches";
import type { StandingRow } from "@/lib/standings";
import { replayTournamentToDay } from "@/lib/probability/replay-tournament";
import { applyGroupStageCut } from "@/lib/probability";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";
import { createSeededRng } from "@/lib/simulation/animation-params";
import { buildBracketState } from "@/lib/simulation/bracket-state";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import type { SimMatchResult, SimulationRunState } from "@/lib/simulation/types";

export type SimulationBootstrap = {
  runState: SimulationRunState;
  standings: Record<string, StandingRow[]>;
  bracketDepths: Record<string, number>;
  probabilities: Record<string, number>;
  eliminated: Set<string>;
};

function matchToSimResult(match: Match): SimMatchResult | null {
  if (match.homeScore === undefined || match.awayScore === undefined) return null;
  return {
    matchId: match.id,
    stage: match.stage,
    day: match.day,
    home: match.home,
    away: match.away,
    winner: match.winner,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  };
}

export function getScriptedResultsUpToDay(day: number): SimMatchResult[] {
  return matches
    .filter((match) => match.day <= day && match.homeScore !== undefined)
    .map(matchToSimResult)
    .filter((result): result is SimMatchResult => result !== null);
}

/** Deterministic seed for bootstrap-only structure (not simulation outcomes). */
const BOOTSTRAP_STRUCTURE_SEED = 0;

export function buildSimulationBootstrap(startDay: number): SimulationBootstrap {
  const replay = replayTournamentToDay(startDay - 1);
  let { probability, groupResults, knockoutResults } = replay;

  let advancingThirdGroups: string[] | undefined;
  if (startDay > 12 && groupResults.length > 0) {
    const standings = buildStandingsFromGroupResults(groupResults);
    const thirdRng = createSeededRng(BOOTSTRAP_STRUCTURE_SEED);
    advancingThirdGroups = selectAdvancingThirdPlaceGroups(standings, thirdRng);
    probability = applyGroupStageCut(
      probability,
      groupResults,
      knockoutResults,
      DEFAULT_PROBABILITY_CONFIG,
      advancingThirdGroups,
    );
  }

  const { bracketDepths } = buildBracketState(
    startDay,
    knockoutResults,
    groupResults,
    probability.eliminated,
    { advancingThirdGroups },
  );

  const runState: SimulationRunState = {
    day: startDay,
    probability,
    results: [...knockoutResults],
    groupResults: [...groupResults],
    advancingThirdGroups,
  };

  return {
    runState,
    standings: buildStandingsFromGroupResults(groupResults),
    bracketDepths,
    probabilities: { ...probability.probabilities },
    eliminated: new Set(probability.eliminated),
  };
}
