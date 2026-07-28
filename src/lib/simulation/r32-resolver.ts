import { resolveR32Participants } from "@/data/tournament-paths";
import {
  buildStandingsFromGroupResults,
  resolveAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";
import type { SimMatchResult } from "@/lib/simulation/types";

export function resolveR32Match(
  matchId: string,
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): { home?: string; away?: string } {
  if (groupResults.length === 0) {
    return {};
  }
  const standings = buildStandingsFromGroupResults(groupResults);
  const thirdGroups = resolveAdvancingThirdPlaceGroups(
    standings,
    createSeededRng(42),
    advancingThirdGroups,
  );
  return resolveR32Participants(matchId, standings, thirdGroups);
}
