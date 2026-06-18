import type { Team, Match, Snapshot, Group } from "@/types";
import { teams, teamsById } from "@/data/teams";
import { matches, timelineDays, getPlayedMatchesUpToDay } from "@/data/matches";
import { snapshots, snapshotsByDay } from "@/data/snapshots";
import { groups, groupsById } from "@/data/groups";
import { computeGroupStandings } from "@/lib/standings";
export { getFlagUrl } from "@/lib/flags";

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
