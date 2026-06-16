import type { Group } from "@/types";
import { teams } from "./teams";

const GROUP_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export const groups: Group[] = GROUP_IDS.map((id) => {
  const groupTeams = teams
    .filter((team) => team.group === id)
    .sort((a, b) => a.groupPosition - b.groupPosition)
    .map((team) => team.id);

  return {
    id,
    teamIds: groupTeams as [string, string, string, string],
  };
});

export const groupsById: Record<string, Group> = Object.fromEntries(
  groups.map((group) => [group.id, group]),
);

export function getGroupFixtures(groupId: string): [string, string][] {
  const group = groupsById[groupId];
  if (!group) return [];

  const [t1, t2, t3, t4] = group.teamIds;
  return [
    [t1, t2],
    [t3, t4],
    [t1, t3],
    [t2, t4],
    [t1, t4],
    [t2, t3],
  ];
}
