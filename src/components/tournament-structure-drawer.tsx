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
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-light-gray bg-background transition-[width,flex] duration-200 ease-out dark:border-light-gray/25 dark:bg-dark-heather ${
        open ? "min-w-0 flex-1" : "w-0 border-l-0"
      }`}
      aria-hidden={!open}
      aria-label="Tournament structure"
      {...(!open ? { inert: true } : {})}
    >
      <div className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto [scrollbar-width:thin]">
        <section className="shrink-0 snap-start snap-always px-4 py-3">
          <TournamentGroupsPanel
            structure={structure}
            teamsById={teamsById}
            day={day}
          />
        </section>
        <section className="min-h-full shrink-0 snap-start snap-always px-4 pb-3 pt-1">
          <TournamentBracketTree
            structure={structure}
            teamsById={teamsById}
            activeMatches={activeMatches}
          />
        </section>
      </div>
    </aside>
  );
}
