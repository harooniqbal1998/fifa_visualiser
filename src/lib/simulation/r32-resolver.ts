import { resolveR32Participants } from "@/data/tournament-paths";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";
import type { SimMatchResult } from "@/lib/simulation/types";

export { selectAdvancingThirdPlaceGroups };

export function resolveR32Match(
  matchId: string,
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): { home?: string; away?: string } {
  const standings = buildStandingsFromGroupResults(groupResults);
  const thirdGroups =
    advancingThirdGroups ??
    selectAdvancingThirdPlaceGroups(standings, createSeededRng(42));
  return resolveR32Participants(matchId, standings, thirdGroups);
}

export { buildStandingsFromGroupResults };
