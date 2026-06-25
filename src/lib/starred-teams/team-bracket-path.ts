import { R32_FIXTURES } from "@/data/r32-fixtures";
import {
  getKnockoutChain,
  getR32EntryForTeam,
  type GroupFinish,
  type KnockoutChain,
} from "@/data/tournament-paths";
import { teamsById } from "@/data/teams";
import type { TournamentStructureView } from "@/lib/tournament-structure";

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
