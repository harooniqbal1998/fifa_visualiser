import { teams } from "@/data/teams";
import {
  buildStandingsFromGroupResults,
  getAdvancingTeamIdsFromThirdGroups,
} from "@/lib/simulation/group-advancement";
import { applyProbUpdate } from "@/lib/probability/prob-update";
import {
  computeProbDeltas,
  zeroEliminated,
} from "@/lib/probability/tournament-priors";
import type { ProbabilityConfig, ProbabilityState } from "@/lib/probability/types";
import type { SimMatchResult } from "@/lib/simulation/types";

export function applyGroupStageCut(
  probability: ProbabilityState,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  _config: ProbabilityConfig,
  advancingThirdGroups: string[],
): ProbabilityState {
  const standings = buildStandingsFromGroupResults(groupResults);
  const advancing = getAdvancingTeamIdsFromThirdGroups(standings, advancingThirdGroups);
  const eliminated = new Set(probability.eliminated);
  const before = { ...probability.probabilities };

  for (const team of teams) {
    if (!advancing.has(team.id)) {
      eliminated.add(team.id);
    }
  }

  const afterElim = zeroEliminated(probability.probabilities, eliminated);
  const next: ProbabilityState = {
    ...probability,
    eliminated,
    probabilities: afterElim,
    lastDeltas: computeProbDeltas(before, afterElim, "elimination"),
  };

  const update = applyProbUpdate(next, groupResults, knockoutResults, 12);
  return {
    ...next,
    probabilities: update.probabilities,
    lastAnalyticalStats: update.stats,
    finishRankDistribution: update.finishRankDistribution,
    lastDeltas: [...next.lastDeltas, ...update.deltas],
  };
}

export function finalizeKnockoutDay(
  probability: ProbabilityState,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  config: ProbabilityConfig,
  day: number,
): ProbabilityState {
  if (config.knockoutRecomputeTrigger !== "each_knockout_day") {
    return probability;
  }

  const update = applyProbUpdate(probability, groupResults, knockoutResults, day);
  return {
    ...probability,
    probabilities: update.probabilities,
    lastAnalyticalStats: update.stats,
    finishRankDistribution: update.finishRankDistribution,
    lastDeltas: update.deltas,
  };
}
