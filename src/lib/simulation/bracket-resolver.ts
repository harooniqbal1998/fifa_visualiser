import type { Match, MatchStage } from "@/types";
import { matches, matchesByDay } from "@/data/matches";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
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

export function resolveNodeParticipants(
  node: BracketNode,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): { home?: string; away?: string } {
  if (node.matchId.startsWith("r32-")) {
    return resolveR32Match(node.matchId, groupResults, advancingThirdGroups);
  }

  const home = node.homeSource ? getWinner(results, node.homeSource.matchId) : undefined;
  const away = node.awaySource ? getWinner(results, node.awaySource.matchId) : undefined;
  return { home, away };
}

export function collectKnockoutNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectKnockoutNodes(node.homeSource, acc);
  if (node.awaySource) collectKnockoutNodes(node.awaySource, acc);
  return acc;
}

export const ALL_KNOCKOUT_NODES = collectKnockoutNodes(KNOCKOUT_TREE);

export function getKnockoutMatchMeta(matchId: string) {
  return knockoutMetaById.get(matchId);
}

export function resolveKnockoutMatchesForDay(
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
  advancingThirdGroups?: string[],
): ResolvedMatch[] {
  const resolved: ResolvedMatch[] = [];

  for (const node of ALL_KNOCKOUT_NODES) {
    const meta = knockoutMetaById.get(node.matchId);
    if (!meta || meta.day !== day) continue;

    const { home, away } = resolveNodeParticipants(
      node,
      results,
      groupResults,
      advancingThirdGroups,
    );
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

export function orderMatchesByFixture(
  day: number,
  matchesToOrder: ResolvedMatch[],
): ResolvedMatch[] {
  const fixtureIndex = new Map(
    (matchesByDay[day] ?? []).map((match, index) => [match.id, index]),
  );
  return [...matchesToOrder].sort(
    (a, b) => (fixtureIndex.get(a.matchId) ?? 0) - (fixtureIndex.get(b.matchId) ?? 0),
  );
}

export function scheduleMatchBatches(
  day: number,
  matchesToSchedule: ResolvedMatch[],
): ResolvedMatch[][] {
  if (matchesToSchedule.length === 0) return [];

  const ordered = orderMatchesByFixture(day, matchesToSchedule);

  if (ordered.some((match) => match.stage !== "group")) {
    return ordered.map((match) => [match]);
  }

  const queues = new Map<string, ResolvedMatch[]>();
  for (const match of ordered) {
    const groupId = teamsById[match.home]?.group;
    if (!groupId) continue;
    const queue = queues.get(groupId) ?? [];
    queue.push(match);
    queues.set(groupId, queue);
  }

  const batches: ResolvedMatch[][] = [];
  while (queues.size > 0) {
    const batch: ResolvedMatch[] = [];
    for (const groupId of [...queues.keys()]) {
      const queue = queues.get(groupId)!;
      if (queue.length > 0) {
        batch.push(queue.shift()!);
      }
      if (queue.length === 0) {
        queues.delete(groupId);
      }
    }
    if (batch.length > 0) {
      batches.push(batch);
    }
  }

  return batches;
}
