import { matches } from "@/data/matches";
import type { MatchStage } from "@/types";
import type { SimMatchResult } from "@/lib/simulation/types";

export function getUnplayedGroupMatches(
  knownResults: SimMatchResult[],
): { matchId: string; stage: MatchStage; day: number; home: string; away: string }[] {
  const playedIds = new Set(knownResults.map((r) => r.matchId));
  return matches
    .filter((m) => m.stage === "group" && !playedIds.has(m.id))
    .map((m) => ({
      matchId: m.id,
      stage: m.stage,
      day: m.day,
      home: m.home,
      away: m.away,
    }));
}

export function countUnplayedGroupMatches(groupResults: SimMatchResult[]): number {
  return getUnplayedGroupMatches(groupResults).length;
}
