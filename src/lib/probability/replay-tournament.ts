import { getScriptedResultsUpToDay } from "@/lib/simulation/advancement";
import { deriveTournamentStateAtDay } from "@/lib/probability/derive-tournament-state";
import type { ProbabilityConfig, ProbabilityState } from "@/lib/probability/types";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";
import { countUnplayedGroupMatches } from "@/lib/probability/unplayed-group-matches";
import type { SimMatchResult } from "@/lib/simulation/types";

export type ReplayResult = {
  probability: ProbabilityState;
  groupResults: SimMatchResult[];
  knockoutResults: SimMatchResult[];
};

export function replayTournamentToDay(
  targetDay: number,
  _rng?: () => number,
  config: ProbabilityConfig = DEFAULT_PROBABILITY_CONFIG,
): ReplayResult {
  const scripted = getScriptedResultsUpToDay(targetDay);
  return deriveTournamentStateAtDay(targetDay, config, scripted);
}
