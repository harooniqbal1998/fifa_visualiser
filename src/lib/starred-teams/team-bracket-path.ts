import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { R32_FIXTURES } from "@/data/r32-fixtures";
import {
  getKnockoutChain,
  getR32EntryForTeam,
  type GroupFinish,
  type KnockoutChain,
} from "@/data/tournament-paths";
import { teamsById } from "@/data/teams";
import type { BracketMatchView, TournamentStructureView } from "@/lib/tournament-structure";

const LEFT_SF_ROOT = KNOCKOUT_TREE.homeSource!;
const RIGHT_SF_ROOT = KNOCKOUT_TREE.awaySource!;

function collectNodeIds(node: BracketNode, acc: Set<string>): void {
  acc.add(node.matchId);
  if (node.homeSource) collectNodeIds(node.homeSource, acc);
  if (node.awaySource) collectNodeIds(node.awaySource, acc);
}

const LEFT_HALF_IDS = new Set<string>();
const RIGHT_HALF_IDS = new Set<string>();
collectNodeIds(LEFT_SF_ROOT, LEFT_HALF_IDS);
collectNodeIds(RIGHT_SF_ROOT, RIGHT_HALF_IDS);

function findChainContainingMatch(matchId: string): KnockoutChain | null {
  for (const fixture of R32_FIXTURES) {
    const chain = getKnockoutChain(fixture.id);
    if (!chain) continue;
    if (
      chain.r32 === matchId ||
      chain.r16 === matchId ||
      chain.qf === matchId ||
      chain.sf === matchId ||
      chain.final === matchId
    ) {
      return chain;
    }
  }
  return null;
}

function getTeamGroupFinish(
  teamId: string,
  structure: TournamentStructureView,
): { group: string; rank: GroupFinish } | null {
  const team = teamsById[teamId];
  if (!team) return null;

  const rows = structure.standings[team.group];
  if (!rows) return null;

  const index = rows.findIndex((row) => row.teamId === teamId);
  if (index < 0) return null;

  return { group: team.group, rank: (index + 1) as GroupFinish };
}

export function resolveTeamR32MatchId(
  teamId: string,
  structure: TournamentStructureView,
): string | null {
  for (const match of structure.bracketMatches) {
    if (match.home.teamId === teamId || match.away.teamId === teamId) {
      if (match.matchId.startsWith("r32-")) return match.matchId;
      const chain = findChainContainingMatch(match.matchId);
      if (chain) return chain.r32;
    }
  }

  const finish = getTeamGroupFinish(teamId, structure);
  if (!finish) return null;

  const entry = getR32EntryForTeam(
    finish.group,
    finish.rank,
    structure.advancingThirdGroups,
  );
  return entry?.r32MatchId ?? null;
}

export function getTeamPathMatchIds(
  teamId: string,
  structure: TournamentStructureView,
): Set<string> {
  const r32MatchId = resolveTeamR32MatchId(teamId, structure);
  if (!r32MatchId) return new Set();

  const chain = getKnockoutChain(r32MatchId);
  if (!chain) return new Set();

  return new Set([chain.r32, chain.r16, chain.qf, chain.sf, chain.final]);
}

export function getStarredPathMatchIds(
  starredIds: string[],
  structure: TournamentStructureView,
): Set<string> {
  const matchIds = new Set<string>();
  for (const teamId of starredIds) {
    for (const id of getTeamPathMatchIds(teamId, structure)) {
      matchIds.add(id);
    }
  }
  return matchIds;
}

function isTeamInMatch(teamId: string, match: BracketMatchView): boolean {
  if (match.home.teamId === teamId || match.away.teamId === teamId) return true;
  if (match.homeCandidates?.some((candidate) => candidate.teamId === teamId)) {
    return true;
  }
  if (match.awayCandidates?.some((candidate) => candidate.teamId === teamId)) {
    return true;
  }
  return false;
}

function isTeamEliminatedInMatch(teamId: string, match: BracketMatchView): boolean {
  if (match.winnerId === undefined) return false;
  const participated =
    match.home.teamId === teamId || match.away.teamId === teamId;
  if (!participated) return false;
  return match.winnerId !== teamId;
}

function addChainMatchesForHit(
  teamId: string,
  hitMatchId: string,
  matchById: Map<string, BracketMatchView>,
  ids: Set<string>,
): void {
  const chain = findChainContainingMatch(hitMatchId);
  if (!chain) return;

  const ordered = [chain.r32, chain.r16, chain.qf, chain.sf, chain.final];
  const hitIdx = ordered.indexOf(hitMatchId);
  if (hitIdx < 0) return;

  for (let index = 0; index <= hitIdx; index++) {
    ids.add(ordered[index]);
  }

  for (let index = hitIdx + 1; index < ordered.length; index++) {
    const previousMatchId = ordered[index - 1];
    const previousMatch = matchById.get(previousMatchId);
    if (previousMatch && isTeamEliminatedInMatch(teamId, previousMatch)) {
      break;
    }
    ids.add(ordered[index]);
  }
}

function getTeamRelevantMatchIds(
  teamId: string,
  structure: TournamentStructureView,
): Set<string> {
  const matchById = new Map(
    structure.bracketMatches.map((match) => [match.matchId, match]),
  );
  const ids = new Set<string>();

  for (const match of structure.bracketMatches) {
    if (!isTeamInMatch(teamId, match)) continue;
    addChainMatchesForHit(teamId, match.matchId, matchById, ids);
  }

  return ids;
}

function touchesBothHalves(ids: Set<string>): boolean {
  let left = false;
  let right = false;
  for (const id of ids) {
    if (LEFT_HALF_IDS.has(id)) left = true;
    if (RIGHT_HALF_IDS.has(id)) right = true;
    if (left && right) return true;
  }
  return false;
}

/**
 * Returns match IDs to show when "My teams only" is active.
 * Returns null to mean "show full bracket" (both halves involved or no relevance).
 */
export function getRelevantMatchIds(
  starredIds: string[],
  structure: TournamentStructureView,
): Set<string> | null {
  if (starredIds.length === 0) return null;

  const union = new Set<string>();
  for (const teamId of starredIds) {
    for (const id of getTeamRelevantMatchIds(teamId, structure)) {
      union.add(id);
    }
  }

  if (union.size === 0) return null;
  if (touchesBothHalves(union)) return null;
  return union;
}

export function subtreeHasRelevant(node: BracketNode, ids: Set<string>): boolean {
  if (ids.has(node.matchId)) return true;
  if (node.homeSource && subtreeHasRelevant(node.homeSource, ids)) return true;
  if (node.awaySource && subtreeHasRelevant(node.awaySource, ids)) return true;
  return false;
}
