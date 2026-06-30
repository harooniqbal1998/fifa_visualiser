import type { MatchStage } from "@/types";
import { teams } from "@/data/teams";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import {
  getAdvancingTeamIdsFromThirdGroups,
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";
import {
  ALL_KNOCKOUT_NODES,
  getKnockoutMatchMeta,
  resolveNodeParticipants,
} from "@/lib/simulation/bracket-resolver";
import { resolveR32Match } from "@/lib/simulation/r32-resolver";
import type { SimMatchResult } from "@/lib/simulation/types";

const STAGE_WIN_DEPTH: Partial<Record<MatchStage, number>> = {
  "round-of-32": 2,
  "round-of-16": 3,
  "quarter-final": 4,
  "semi-final": 5,
  final: 6,
};

const STAGE_ELIM_DEPTH: Partial<Record<MatchStage, number>> = {
  "round-of-32": 1,
  "round-of-16": 2,
  "quarter-final": 3,
  "semi-final": 4,
  final: 5,
};

const KNOCKOUT_STAGE_ORDER: MatchStage[] = [
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "final",
];

const NODES_BY_STAGE = KNOCKOUT_STAGE_ORDER.map((stage) =>
  ALL_KNOCKOUT_NODES.filter((node) => getKnockoutMatchMeta(node.matchId)?.stage === stage),
);

export type BracketState = {
  possibleOpponents: Record<string, string[]>;
  bracketDepths: Record<string, number>;
};

export type BuildBracketStateOptions = {
  advancingThirdGroups?: string[];
};

function getWinner(results: SimMatchResult[], matchId: string): string | undefined {
  return results.find((r) => r.matchId === matchId)?.winner;
}

function collectNodeParticipants(
  node: BracketNode,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): string[] {
  const won = getWinner(results, node.matchId);
  if (won) return [won];

  if (node.matchId.startsWith("r32-")) {
    const { home, away } = resolveR32Match(node.matchId, groupResults, advancingThirdGroups);
    return [home, away].filter((id): id is string => Boolean(id));
  }

  const participantIds: string[] = [];
  if (node.homeSource) {
    participantIds.push(
      ...collectNodeParticipants(node.homeSource, results, groupResults, advancingThirdGroups),
    );
  }
  if (node.awaySource) {
    participantIds.push(
      ...collectNodeParticipants(node.awaySource, results, groupResults, advancingThirdGroups),
    );
  }
  return participantIds;
}

function findNextUnresolvedMatchForTeam(
  teamId: string,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): BracketNode | null {
  for (const stageNodes of NODES_BY_STAGE) {
    for (const node of stageNodes) {
      if (getWinner(results, node.matchId)) continue;

      const participants = collectNodeParticipants(
        node,
        results,
        groupResults,
        advancingThirdGroups,
      );
      if (participants.includes(teamId)) {
        return node;
      }

      const { home, away } = resolveNodeParticipants(
        node,
        results,
        groupResults,
        advancingThirdGroups,
      );
      if (home === teamId || away === teamId) {
        return node;
      }
    }
  }
  return null;
}

function getPossibleOpponentsForTeam(
  teamId: string,
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
  advancingThirdGroups?: string[],
): string[] {
  if (eliminated.has(teamId)) return [];

  if (day < 12) {
    const team = teams.find((entry) => entry.id === teamId);
    if (!team) return [];

    const playedOpponents = new Set<string>();
    for (const result of groupResults) {
      if (result.day > day) continue;
      if (result.home === teamId) playedOpponents.add(result.away);
      if (result.away === teamId) playedOpponents.add(result.home);
    }

    return teams
      .filter(
        (entry) =>
          entry.group === team.group &&
          entry.id !== teamId &&
          !eliminated.has(entry.id) &&
          !playedOpponents.has(entry.id),
      )
      .map((entry) => entry.id);
  }

  const nextNode = findNextUnresolvedMatchForTeam(
    teamId,
    results,
    groupResults,
    advancingThirdGroups,
  );

  if (!nextNode) {
    const finalists = collectNodeParticipants(
      KNOCKOUT_TREE,
      results,
      groupResults,
      advancingThirdGroups,
    );
    if (finalists.length === 2 && finalists.includes(teamId)) {
      const other = finalists.find((id) => id !== teamId);
      return other && !eliminated.has(other) ? [other] : [];
    }
    return [];
  }

  const participants = collectNodeParticipants(
    nextNode,
    results,
    groupResults,
    advancingThirdGroups,
  );

  return participants
    .filter((candidate) => candidate !== teamId && !eliminated.has(candidate))
    .sort();
}

export function getTeamBracketDepth(
  teamId: string,
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
): number {
  if (eliminated.has(teamId)) {
    const loss = results.find(
      (r) =>
        r.stage !== "group" &&
        (r.home === teamId || r.away === teamId) &&
        r.winner !== teamId,
    );
    if (loss) {
      return STAGE_ELIM_DEPTH[loss.stage] ?? 1;
    }
    return day >= 12 ? 1 : 0;
  }

  let depth = day >= 12 ? 1 : 0;

  for (const result of results) {
    if (result.winner !== teamId || result.stage === "group") continue;
    const winDepth = STAGE_WIN_DEPTH[result.stage];
    if (winDepth !== undefined) {
      depth = Math.max(depth, winDepth);
    }
  }

  return depth;
}

export function buildBracketState(
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
  options?: BuildBracketStateOptions,
): BracketState {
  const possibleOpponents: Record<string, string[]> = {};
  const bracketDepths: Record<string, number> = {};
  const advancingThirdGroups = options?.advancingThirdGroups;

  for (const team of teams) {
    possibleOpponents[team.id] = getPossibleOpponentsForTeam(
      team.id,
      day,
      results,
      groupResults,
      eliminated,
      advancingThirdGroups,
    );
    bracketDepths[team.id] = getTeamBracketDepth(
      team.id,
      day,
      results,
      groupResults,
      eliminated,
    );
  }

  return { possibleOpponents, bracketDepths };
}

export function getEliminatedFromResults(
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  advancingThirdGroups?: string[],
): Set<string> {
  const eliminated = new Set<string>();

  if (day >= 12) {
    const standings = buildStandingsFromGroupResults(groupResults);
    const thirdGroups =
      advancingThirdGroups ??
      selectAdvancingThirdPlaceGroups(standings, createSeededRng(42 + day));
    const advancing = getAdvancingTeamIdsFromThirdGroups(standings, thirdGroups);
    for (const team of teams) {
      if (!advancing.has(team.id)) {
        eliminated.add(team.id);
      }
    }
  }

  for (const result of results) {
    if (result.day > day || result.stage === "group") continue;
    const loser = result.winner === result.home ? result.away : result.home;
    eliminated.add(loser);
  }

  return eliminated;
}
