import { computeTournamentProbabilities } from "@/lib/probability/compute-tournament-probabilities";
import { computeProbDeltas, zeroEliminated } from "@/lib/probability/tournament-priors";
import type { ProbabilityState } from "@/lib/probability/types";
import type { SimMatchResult } from "@/lib/simulation/types";

export function applyProbUpdate(
  probability: ProbabilityState,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  day: number,
) {
  const before = { ...probability.probabilities };
  const result = computeTournamentProbabilities({
    day,
    groupResults,
    knockoutResults,
    eloRatings: probability.eloRatings,
    eliminated: probability.eliminated,
  });
  return {
    probabilities: result.probabilities,
    stats: result.stats,
    finishRankDistribution: result.finishRankDistribution,
    deltas: computeProbDeltas(before, result.probabilities, "bracket_analytical"),
  };
}

export function recomputeTournamentProbabilities(
  probability: ProbabilityState,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  day: number,
): ProbabilityState {
  const update = applyProbUpdate(probability, groupResults, knockoutResults, day);
  return {
    ...probability,
    probabilities: zeroEliminated(update.probabilities, probability.eliminated),
    lastAnalyticalStats: update.stats,
    finishRankDistribution: update.finishRankDistribution,
    lastDeltas: update.deltas,
  };
}
