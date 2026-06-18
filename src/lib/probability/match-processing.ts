import { applyProbUpdate } from "@/lib/probability/prob-update";
import {
  applyEloMatchResult,
  pickMatchWinner,
} from "@/lib/probability/match-elo";
import {
  computeProbDeltas,
  zeroEliminated,
} from "@/lib/probability/tournament-priors";
import type {
  MatchInput,
  ProbabilityConfig,
  ProbabilityState,
  ProbUpdateEvent,
} from "@/lib/probability/types";
import type { SimMatchResult } from "@/lib/simulation/types";

export function applyKnownMatchResult(
  probability: ProbabilityState,
  match: MatchInput,
  winnerId: string | undefined,
  groupResults: SimMatchResult[],
  _knockoutResults: SimMatchResult[],
  config: ProbabilityConfig,
): ProbabilityState {
  const isKnockout = match.stage !== "group";
  const eliminated = new Set(probability.eliminated);

  if (isKnockout && winnerId) {
    eliminated.add(winnerId === match.home ? match.away : match.home);
  }

  const eloRatings =
    winnerId !== undefined
      ? applyEloMatchResult(
          match.home,
          match.away,
          winnerId,
          probability.eloRatings,
          config.eloKFactor,
        )
      : { ...probability.eloRatings };

  return {
    ...probability,
    eliminated,
    eloRatings,
    lastDeltas: [],
  };
}

export function processKnownMatchResult(
  probability: ProbabilityState,
  match: MatchInput,
  winnerId: string | undefined,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  config: ProbabilityConfig,
): ProbabilityState {
  const isKnockout = match.stage !== "group";
  const beforeProbs = { ...probability.probabilities };

  let next = applyKnownMatchResult(
    probability,
    match,
    winnerId,
    groupResults,
    knockoutResults,
    config,
  );

  const update = applyProbUpdate(next, groupResults, knockoutResults, match.day);
  next = {
    ...next,
    probabilities: isKnockout
      ? zeroEliminated(update.probabilities, next.eliminated)
      : update.probabilities,
    lastAnalyticalStats: update.stats,
    finishRankDistribution: update.finishRankDistribution,
    lastDeltas: update.deltas,
  };

  if (isKnockout) {
    const afterElim = zeroEliminated(next.probabilities, next.eliminated);
    const elimDeltas = computeProbDeltas(beforeProbs, afterElim, "elimination");
    if (elimDeltas.length > 0) {
      next = {
        ...next,
        probabilities: afterElim,
        lastDeltas: [...next.lastDeltas, ...elimDeltas],
      };
    }
  }

  return next;
}

export function resolveMatchWinnerOnly(
  probability: ProbabilityState,
  match: MatchInput,
  config: ProbabilityConfig,
  rng: () => number,
): string {
  return pickMatchWinner(match.home, match.away, probability.eloRatings, rng);
}

export function resolveMatch(
  probability: ProbabilityState,
  match: MatchInput,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  config: ProbabilityConfig,
  rng: () => number,
): { state: ProbabilityState; winnerId: string; deltas: ProbUpdateEvent[] } {
  const winnerId = resolveMatchWinnerOnly(probability, match, config, rng);
  const state = processKnownMatchResult(
    probability,
    match,
    winnerId,
    groupResults,
    knockoutResults,
    config,
  );
  return { state, winnerId, deltas: state.lastDeltas };
}

export { recomputeTournamentProbabilities } from "@/lib/probability/prob-update";
