import type { Team, Match, Snapshot, TournamentData } from "@/types";
import { teams, teamsById } from "@/data/teams";
import { matches, matchesByDay } from "@/data/matches";
import { snapshots, snapshotsByDay } from "@/data/snapshots";

export function getTournamentData(): TournamentData {
  return { teams, matches, snapshots };
}

export function getTeams(): Team[] {
  return teams;
}

export function getTeamById(id: string): Team | undefined {
  return teamsById[id];
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
  return { min: 0, max: 35 };
}
