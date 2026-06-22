import type { MatchStage } from "@/types";
import { teams } from "@/data/teams";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { getAdvancingTeamIds } from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";
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

export type BracketState = {
  possibleOpponents: Record<string, string[]>;
  bracketDepths: Record<string, number>;
};

function getWinner(results: SimMatchResult[], matchId: string): string | undefined {
  return results.find((r) => r.matchId === matchId)?.winner;
}

function collectNodeParticipants(
  node: BracketNode,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
): string[] {
  const won = getWinner(results, node.matchId);
  if (won) return [won];

  if (node.matchId.startsWith("r32-")) {
    const { home, away } = resolveR32Match(node.matchId, groupResults);
    return [home, away].filter((id): id is string => Boolean(id));
  }

  const teams: string[] = [];
  if (node.homeSource) {
    teams.push(...collectNodeParticipants(node.homeSource, results, groupResults));
  }
  if (node.awaySource) {
    teams.push(...collectNodeParticipants(node.awaySource, results, groupResults));
  }
  return teams;
}

function getPossibleOpponentsForTeam(
  teamId: string,
  day: number,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  eliminated: Set<string>,
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

  const opponents = new Set<string>();

  function walk(node: BracketNode) {
    const branchTeams = collectNodeParticipants(node, results, groupResults);
    if (branchTeams.includes(teamId)) {
      for (const candidate of branchTeams) {
        if (candidate !== teamId && !eliminated.has(candidate)) {
          opponents.add(candidate);
        }
      }
      return;
    }
    if (node.homeSource) walk(node.homeSource);
    if (node.awaySource) walk(node.awaySource);
  }

  walk(KNOCKOUT_TREE);

  const finalists = collectNodeParticipants(KNOCKOUT_TREE, results, groupResults);
  if (finalists.length === 2 && finalists.includes(teamId)) {
    const other = finalists.find((id) => id !== teamId);
    return other ? [other] : [];
  }

  return [...opponents].sort();
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
): BracketState {
  const possibleOpponents: Record<string, string[]> = {};
  const bracketDepths: Record<string, number> = {};

  for (const team of teams) {
    possibleOpponents[team.id] = getPossibleOpponentsForTeam(
      team.id,
      day,
      results,
      groupResults,
      eliminated,
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
): Set<string> {
  const eliminated = new Set<string>();

  if (day >= 12) {
    const advancing = getAdvancingTeamIds(groupResults, createSeededRng(42 + day));
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
