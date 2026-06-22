"use client";

import type { Team } from "@/types";
import { TournamentBracketTree } from "@/components/tournament-bracket-tree";
import { TournamentGroupsPanel } from "@/components/tournament-groups-panel";
import type { CollisionEvent } from "@/lib/simulation/types";
import type { TournamentStructureView } from "@/lib/tournament-structure";

type TournamentStructureDrawerProps = {
  open: boolean;
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  day: number;
  activeMatches?: CollisionEvent[];
};

export function TournamentStructureDrawer({
  open,
  structure,
  teamsById,
  day,
  activeMatches = [],
}: TournamentStructureDrawerProps) {
  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-zinc-200 bg-white transition-[width,flex] duration-200 ease-out dark:border-zinc-700 dark:bg-zinc-900 ${
        open ? "min-w-0 flex-1" : "w-0 border-l-0"
      }`}
      aria-hidden={!open}
      aria-label="Tournament structure"
      {...(!open ? { inert: true } : {})}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section className="shrink-0 border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Groups
          </h3>
          <TournamentGroupsPanel
            structure={structure}
            teamsById={teamsById}
            day={day}
          />
        </section>
        <section className="flex min-h-0 flex-1 flex-col px-4 py-3">
          <h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Knockout
          </h3>
          <div className="min-h-0 flex-1 overflow-auto">
            <TournamentBracketTree
              structure={structure}
              teamsById={teamsById}
              activeMatches={activeMatches}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
