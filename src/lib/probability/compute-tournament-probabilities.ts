import {
  recomputeFromBracketAnalytical,
  type AnalyticalStats,
  type FinishRankDistribution,
} from "@/lib/probability/bracket-analytical";
import { buildOpeningProbabilities } from "@/lib/probability/tournament-priors";
import { countUnplayedGroupMatches } from "@/lib/probability/unplayed-group-matches";
import type { SimMatchResult } from "@/lib/simulation/types";

export type ComputeTournamentProbabilitiesInput = {
  day: number;
  groupResults: SimMatchResult[];
  knockoutResults: SimMatchResult[];
  eloRatings: Record<string, number>;
  eliminated: Set<string>;
};

export type ComputeTournamentProbabilitiesResult = {
  probabilities: Record<string, number>;
  finishRankDistribution: FinishRankDistribution;
  stats: AnalyticalStats;
};

export function computeTournamentProbabilities(
  input: ComputeTournamentProbabilitiesInput,
): ComputeTournamentProbabilitiesResult {
  const hasResults = input.groupResults.length > 0 || input.knockoutResults.length > 0;

  if (input.day === 0 && !hasResults) {
    return {
      probabilities: buildOpeningProbabilities(),
      finishRankDistribution: {},
      stats: {
        method: "analytical",
        unplayedGroupMatches: countUnplayedGroupMatches(input.groupResults),
      },
    };
  }

  const result = recomputeFromBracketAnalytical(
    input.groupResults,
    input.knockoutResults,
    input.eliminated,
    input.eloRatings,
  );

  return {
    probabilities: result.probabilities,
    finishRankDistribution: result.finishRankDistribution,
    stats: result.stats,
  };
}
