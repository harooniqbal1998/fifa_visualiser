import type { Match, MatchStage } from "@/types";
import { matches } from "@/data/matches";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE, THIRD_PLACE_NODE } from "@/data/knockout-bracket";
import { teamsById } from "@/data/teams";
import { resolveR32Match } from "@/lib/simulation/r32-resolver";
import type { SimMatchResult } from "@/lib/simulation/types";

export type ResolvedMatch = {
  matchId: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
};

const knockoutMetaById = new Map(
  matches
    .filter((m) => m.stage !== "group")
    .map((m) => [m.id, { stage: m.stage, day: m.day }]),
);

function getWinner(results: SimMatchResult[], matchId: string): string | undefined {
  return results.find((r) => r.matchId === matchId)?.winner;
}

function getLoser(results: SimMatchResult[], matchId: string): string | undefined {
  const result = results.find((r) => r.matchId === matchId);
  if (!result) return undefined;
  return result.winner === result.home ? result.away : result.home;
}

function resolveNodeParticipants(
  node: BracketNode,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
): { home?: string; away?: string } {
  if (node.matchId.startsWith("r32-")) {
    return resolveR32Match(node.matchId, groupResults);
  }

  const home = node.homeSource ? getWinner(results, node.homeSource.matchId) : undefined;
  const away = node.awaySource ? getWinner(results, node.awaySource.matchId) : undefined;
  return { home, away };
}

function resolveThirdPlaceParticipants(
  results: SimMatchResult[],
): { home?: string; away?: string } {
  const home = getLoser(results, THIRD_PLACE_NODE.homeSource!.matchId);
  const away = getLoser(results, THIRD_PLACE_NODE.awaySource!.matchId);
  return { home, away };
}

function collectKnockoutNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectKnockoutNodes(node.homeSource, acc);
  if (node.awaySource) collectKnockoutNodes(node.awaySource, acc);
  return acc;
}

const ALL_KNOCKOUT_NODES = collectKnockoutNodes(KNOCKOUT_TREE);

export function resolveKnockoutMatchesForDay(
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
): ResolvedMatch[] {
  const resolved: ResolvedMatch[] = [];

  for (const node of ALL_KNOCKOUT_NODES) {
    const meta = knockoutMetaById.get(node.matchId);
    if (!meta || meta.day !== day) continue;

    const { home, away } = resolveNodeParticipants(node, results, groupResults);
    if (!home || !away) continue;
    if (eliminated.has(home) || eliminated.has(away)) continue;
    if (results.some((r) => r.matchId === node.matchId)) continue;

    resolved.push({
      matchId: node.matchId,
      stage: meta.stage,
      day,
      home,
      away,
    });
  }

  const tpMeta = knockoutMetaById.get("tp-1");
  if (tpMeta && tpMeta.day === day) {
    const { home, away } = resolveThirdPlaceParticipants(results);
    if (
      home &&
      away &&
      !eliminated.has(home) &&
      !eliminated.has(away) &&
      !results.some((r) => r.matchId === "tp-1")
    ) {
      resolved.push({
        matchId: "tp-1",
        stage: tpMeta.stage,
        day,
        home,
        away,
      });
    }
  }

  return resolved;
}

export function resolveGroupMatchesForDay(
  day: number,
  results: SimMatchResult[],
): ResolvedMatch[] {
  return matches
    .filter((m) => m.stage === "group" && m.day === day)
    .filter((m) => !results.some((r) => r.matchId === m.id))
    .map((m) => ({
      matchId: m.id,
      stage: m.stage,
      day: m.day,
      home: m.home,
      away: m.away,
    }));
}

export function batchMatchesByTeams(matchesToBatch: ResolvedMatch[]): ResolvedMatch[][] {
  const batches: ResolvedMatch[][] = [];
  const scheduled = new Set<string>();

  const remaining = [...matchesToBatch];

  function matchGroups(match: ResolvedMatch): Set<string> {
    const groups = new Set<string>();
    const homeGroup = teamsById[match.home]?.group;
    const awayGroup = teamsById[match.away]?.group;
    if (homeGroup) groups.add(homeGroup);
    if (awayGroup) groups.add(awayGroup);
    return groups;
  }

  while (remaining.length > 0) {
    const batch: ResolvedMatch[] = [];
    const usedTeams = new Set<string>();
    const usedGroups = new Set<string>();

    for (let i = remaining.length - 1; i >= 0; i--) {
      const match = remaining[i];
      if (usedTeams.has(match.home) || usedTeams.has(match.away)) continue;
      if (scheduled.has(match.matchId)) continue;

      const groups = matchGroups(match);
      if ([...groups].some((group) => usedGroups.has(group))) continue;

      batch.push(match);
      usedTeams.add(match.home);
      usedTeams.add(match.away);
      for (const group of groups) {
        usedGroups.add(group);
      }
      scheduled.add(match.matchId);
      remaining.splice(i, 1);
    }

    if (batch.length === 0 && remaining.length > 0) {
      batch.push(remaining.shift()!);
    }

    if (batch.length > 0) {
      batches.push(batch);
    }
  }

  return batches;
}
