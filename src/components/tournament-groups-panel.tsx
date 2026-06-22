"use client";

import { groups } from "@/data/groups";
import type { Team } from "@/types";
import { getFlagUrl } from "@/lib/flags";
import type { TournamentStructureView } from "@/lib/tournament-structure";
import type { StandingRow } from "@/lib/standings";

type TournamentGroupsPanelProps = {
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  day: number;
};

function TeamFlag({ isoCode }: { isoCode: string }) {
  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-600"
    />
  );
}

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
}: {
  groupId: string;
  rows: StandingRow[];
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  showAdvancement: boolean;
}) {
  return (
    <div className="w-1/3 shrink-0 border-r border-zinc-200 p-2 last:border-r-0 dark:border-zinc-700">
      <div className="mb-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        Group {groupId}
      </div>
      <div className="space-y-1">
        {rows.map((row, index) => {
          const team = teamsById[row.teamId];
          const eliminated = structure.eliminatedTeamIds.has(row.teamId);
          const advancing =
            showAdvancement && isAdvancingTeam(groupId, index, structure);

          return (
            <div
              key={row.teamId}
              className={`flex items-center gap-1.5 text-[11px] leading-tight ${
                eliminated
                  ? "opacity-40"
                  : advancing
                    ? "rounded bg-emerald-500/10 px-0.5"
                    : ""
              }`}
            >
              <span className="w-3 shrink-0 text-zinc-400">{index + 1}</span>
              <TeamFlag isoCode={team?.isoCode ?? ""} />
              <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-100">
                {team?.name ?? row.teamId}
              </span>
              <span className="shrink-0 font-mono text-zinc-500">{row.points}</span>
              <span className="w-6 shrink-0 text-right font-mono text-zinc-400">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </span>
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
  const showAdvancement = day >= 12 && structure.advancingThirdGroups.length > 0;

  return (
    <div className="flex flex-row overflow-x-auto border-t border-zinc-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:border-zinc-700">
      {groups.map((group) => {
        const rows = structure.standings[group.id] ?? [];
        return (
          <GroupCard
            key={group.id}
            groupId={group.id}
            rows={rows}
            structure={structure}
            teamsById={teamsById}
            showAdvancement={showAdvancement}
          />
        );
      })}
    </div>
  );
}
