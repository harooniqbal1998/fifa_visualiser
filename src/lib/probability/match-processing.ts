import { applyEloMatchResult, pickMatchWinner } from "@/lib/probability/match-elo";
import type {
  MatchInput,
  ProbabilityConfig,
  ProbabilityState,
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

export function resolveMatchWinnerOnly(
  probability: ProbabilityState,
  match: MatchInput,
  config: ProbabilityConfig,
  rng: () => number,
): string {
  return pickMatchWinner(match.home, match.away, probability.eloRatings, rng);
}
