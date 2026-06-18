import { teams } from "@/data/teams";
import { buildInitialEloRatings } from "@/lib/probability/match-elo";
import { buildOpeningProbabilities } from "@/lib/probability/tournament-priors";
import type { ProbabilityConfig, ProbabilityState } from "@/lib/probability/types";

export function initProbabilityState(config: ProbabilityConfig): ProbabilityState {
  return {
    eloRatings: buildInitialEloRatings(teams, config),
    probabilities: buildOpeningProbabilities(),
    eliminated: new Set(),
    lastDeltas: [],
  };
}
