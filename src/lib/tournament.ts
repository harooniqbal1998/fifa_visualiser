import type { Team, Match, Snapshot, TournamentData, Group, TournamentMeta } from "@/types";
import { teams, teamsById } from "@/data/teams";
import { matches, matchesByDay, timelineDays, getPlayedMatchesUpToDay } from "@/data/matches";
import { snapshots, snapshotsByDay } from "@/data/snapshots";
import { groups, groupsById } from "@/data/groups";
import { tournamentMeta } from "@/data/tournament-meta";
import { computeGroupStandings } from "@/lib/standings";
export { getFlagUrl } from "@/lib/flags";

export function getTournamentData(): TournamentData {
  return { teams, matches, snapshots };
}

export function getTournamentMeta(): TournamentMeta {
  return tournamentMeta;
}

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: string): Team | undefined {
  return teamsById[id];
}

export function getGroups(): Group[] {
  return groups;
}

export function getGroupById(id: string): Group | undefined {
  return groupsById[id];
}

export function getTeamsByGroup(groupId: string): Team[] {
  const group = groupsById[groupId];
  if (!group) return [];
  return group.teamIds
    .map((id) => teamsById[id])
    .filter((team): team is Team => team !== undefined);
}

export function getMatches(): Match[] {
  return matches;
}

export function getMatchesForDay(day: number): Match[] {
  return matchesByDay[day] ?? [];
}

export function getSnapshots(): Snapshot[] {
  return snapshots;
}

export function getSnapshotByDay(day: number): Snapshot | undefined {
  return snapshotsByDay[day];
}

export function getDayRange(): { min: number; max: number } {
  const min = timelineDays[0]?.day ?? 0;
  const max = timelineDays[timelineDays.length - 1]?.day ?? min;
  return { min, max };
}

export function getTimelineDays() {
  return timelineDays;
}

export function getGroupStandings(day: number) {
  return computeGroupStandings(getPlayedMatchesUpToDay(day));
}

export function getUpcomingMatches(teamId: string, day: number): Match[] {
  return matches.filter(
    (match) =>
      match.stage === "group" &&
      match.day > day &&
      (match.home === teamId || match.away === teamId),
  );
}

export function getNextOpponents(
  teamId: string,
  day: number,
  snapshot?: Snapshot,
): string[] {
  if (snapshot?.possibleOpponents[teamId]) {
    return snapshot.possibleOpponents[teamId];
  }
  const snap = getSnapshotByDay(day);
  return snap?.possibleOpponents[teamId] ?? [];
}
