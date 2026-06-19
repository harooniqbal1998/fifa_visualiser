import { applyEloMatchResult } from "@/lib/probability/match-elo";
import { computeTournamentProbabilities } from "@/lib/probability/compute-tournament-probabilities";
import { initProbabilityState } from "@/lib/probability/state";
import { computeProbDeltas } from "@/lib/probability/tournament-priors";
import type { ProbabilityConfig, ProbabilityState } from "@/lib/probability/types";
import { getEliminatedFromResults } from "@/lib/simulation/bracket-state";
import type { SimMatchResult } from "@/lib/simulation/types";

export type DerivedTournamentState = {
  probability: ProbabilityState;
  groupResults: SimMatchResult[];
  knockoutResults: SimMatchResult[];
};

export function applyEloForResults(
  eloRatings: Record<string, number>,
  results: SimMatchResult[],
  kFactor: number,
): Record<string, number> {
  let elo = { ...eloRatings };
  for (const result of results) {
    if (!result.winner) continue;
    elo = applyEloMatchResult(result.home, result.away, result.winner, elo, kFactor);
  }
  return elo;
}

export function deriveTournamentStateAtDay(
  targetDay: number,
  config: ProbabilityConfig,
  scripted: SimMatchResult[],
): DerivedTournamentState {
  const sorted = [...scripted].sort(
    (a, b) => a.day - b.day || a.matchId.localeCompare(b.matchId),
  );
  const groupResults = sorted.filter((r) => r.stage === "group");
  const knockoutResults = sorted.filter((r) => r.stage !== "group");

  const eliminated = getEliminatedFromResults(targetDay, knockoutResults, groupResults);
  const opening = initProbabilityState(config);
  const eloRatings = applyEloForResults(opening.eloRatings, sorted, config.eloKFactor);

  const computed = computeTournamentProbabilities({
    day: targetDay,
    groupResults,
    knockoutResults,
    eloRatings,
    eliminated,
  });

  const probability: ProbabilityState = {
    eloRatings,
    probabilities: computed.probabilities,
    eliminated,
    lastDeltas: computeProbDeltas(
      opening.probabilities,
      computed.probabilities,
      "bracket_analytical",
    ),
    lastAnalyticalStats: computed.stats,
    finishRankDistribution: computed.finishRankDistribution,
  };

  return { probability, groupResults, knockoutResults };
}
