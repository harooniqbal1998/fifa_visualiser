"use client";

import type { Snapshot, Team } from "@/types";
import { Flag } from "@/components/flag";
import { CollapsibleSection } from "@/components/collapsible-section";
import { getGroupStandings } from "@/lib/tournament";

type GroupsPanelProps = {
  teams: Team[];
  snapshot: Snapshot;
  day: number;
};

export function GroupsPanel({ teams, snapshot, day }: GroupsPanelProps) {
  const teamsById = Object.fromEntries(teams.map((team) => [team.id, team]));
  const standings = getGroupStandings(day);
  const groupIds = [...new Set(teams.map((team) => team.group))].sort();

  return (
    <CollapsibleSection
      className="border-t border-zinc-200 dark:border-zinc-800"
      contentClassName="px-6 pb-4"
      summary={
        <div className="px-6 py-4">
          <h2 className="text-sm font-medium">Groups</h2>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {groupIds.map((groupId) => {
          const table = standings[groupId] ?? [];
          return (
            <div
              key={groupId}
              className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Group {groupId}
              </h3>
              <ul className="space-y-1.5">
                {table.map((row) => {
                  const team = teamsById[row.teamId];
                  if (!team) return null;
                  const probability = snapshot.probabilities[team.id] ?? 0;
                  const active = probability > 0;

                  return (
                    <li
                      key={team.id}
                      className={`flex items-center gap-1.5 text-xs ${
                        active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      <Flag isoCode={team.isoCode} size={16} className="rounded-sm" />
                      <span className="min-w-0 flex-1 truncate">{team.name}</span>
                      <span className="shrink-0 tabular-nums text-zinc-400">
                        {row.points}pt
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
