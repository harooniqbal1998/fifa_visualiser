"use client";

import { groups } from "@/data/groups";
import { StarToggleButton } from "@/components/star-toggle-button";
import { TeamFlagAvatar } from "@/components/team-flag-avatar";
import { useStarredTeamsStore } from "@/stores/starred-teams-store";
import type { Team } from "@/types";
import type { TournamentStructureView } from "@/lib/tournament-structure";
import type { StandingRow } from "@/lib/standings";

type TournamentGroupsPanelProps = {
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  day: number;
};

const GROUP_FLAG_PX = 16;

function isAdvancingTeam(
  groupId: string,
  rankIndex: number,
  structure: TournamentStructureView,
): boolean {
  if (structure.advancingThirdGroups.length === 0) return false;
  if (rankIndex < 2) return true;
  if (rankIndex === 2) {
    return structure.advancingThirdGroups.includes(groupId);
  }
  return false;
}

function GroupCard({
  groupId,
  rows,
  structure,
  teamsById,
  showAdvancement,
  starredTeamIds,
  toggleStar,
}: {
  groupId: string;
  rows: StandingRow[];
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  showAdvancement: boolean;
  starredTeamIds: Set<string>;
  toggleStar: (teamId: string) => void;
}) {
  return (
    <div className="w-[12rem] shrink-0 rounded-lg border border-light-gray p-2 dark:border-light-gray/25">
      <div className="mb-1 text-[10px] font-semibold text-dark-heather/55 dark:text-light-gray/55">
        Group {groupId}
      </div>
      <div className="space-y-1">
        {rows.map((row, index) => {
          const team = teamsById[row.teamId];
          const eliminated = structure.eliminatedTeamIds.has(row.teamId);
          const advancing =
            showAdvancement && isAdvancingTeam(groupId, index, structure);
          const starred = starredTeamIds.has(row.teamId);

          return (
            <div
              key={row.teamId}
              className={`flex items-center gap-1 text-[11px] leading-tight ${
                eliminated
                  ? "opacity-40"
                  : advancing
                    ? "rounded bg-average-green/10 px-0.5"
                    : ""
              }`}
            >
              <StarToggleButton
                starred={starred}
                onToggle={() => toggleStar(row.teamId)}
                blockedTitle={
                  !starred && starredTeamIds.size >= 3 ? "Max 3 teams" : undefined
                }
              />
              <TeamFlagAvatar
                isoCode={team?.isoCode ?? ""}
                size={GROUP_FLAG_PX}
              />
              <span className="min-w-0 flex-1 truncate text-dark-heather dark:text-light-gray">
                {team?.name ?? row.teamId}
              </span>
              <span className="shrink-0 font-mono font-bold text-dark-heather/55 dark:text-light-gray/55">{row.points}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TournamentGroupsPanel({
  structure,
  teamsById,
  day,
}: TournamentGroupsPanelProps) {
  const starredTeamIds = useStarredTeamsStore((s) => s.starredTeamIds);
  const toggleStar = useStarredTeamsStore((s) => s.toggleStar);
  const starredSet = new Set(starredTeamIds);
  const showAdvancement = day >= 12 && structure.advancingThirdGroups.length > 0;

  return (
    <div className="flex flex-row gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {groups.map((group) => {
        const rows = structure.standings[group.id] ?? [];
        return (
          <GroupCard
            key={group.id}
            groupId={group.id}
            rows={rows}
            structure={structure}
            teamsById={teamsById}
            starredTeamIds={starredSet}
            toggleStar={toggleStar}
            showAdvancement={showAdvancement}
          />
        );
      })}
    </div>
  );
}
