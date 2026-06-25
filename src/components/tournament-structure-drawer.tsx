"use client";

import { useMemo, useState } from "react";
import type { Team } from "@/types";
import { TournamentBracketTree } from "@/components/tournament-bracket-tree";
import { TournamentGroupsPanel } from "@/components/tournament-groups-panel";
import { getStarredPathMatchIds } from "@/lib/starred-teams/team-bracket-path";
import type { CollisionEvent } from "@/lib/simulation/types";
import type { TournamentStructureView } from "@/lib/tournament-structure";
import { useStarredTeamsStore } from "@/stores/starred-teams-store";

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
  const starredTeamIds = useStarredTeamsStore((s) => s.starredTeamIds);
  const [pathFilterActive, setPathFilterActive] = useState(false);

  const starredPathMatchIds = useMemo(
    () => getStarredPathMatchIds(starredTeamIds, structure),
    [starredTeamIds, structure],
  );

  const showPathFilter = starredTeamIds.length > 0;

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-light-gray bg-background transition-[width] duration-200 ease-out will-change-[width] dark:border-light-gray/25 dark:bg-dark-heather ${
        open ? "w-1/2 min-w-0" : "w-0 border-l-0"
      }`}
      aria-hidden={!open}
      aria-label="Tournament structure"
      {...(!open ? { inert: true } : {})}
    >
      {open && showPathFilter ? (
        <div className="flex shrink-0 items-center justify-between border-b border-light-gray px-4 py-2 dark:border-light-gray/25">
          <span className="text-[11px] font-medium text-dark-heather dark:text-light-gray">
            My teams only
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={pathFilterActive}
            onClick={() => setPathFilterActive((active) => !active)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              pathFilterActive ? "bg-hermes dark:bg-average-green" : "bg-light-gray dark:bg-light-gray/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform dark:bg-dark-heather ${
                pathFilterActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ) : null}
      <div
        className={`min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto [scrollbar-width:thin] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
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
            pathFilterActive={pathFilterActive}
            starredPathMatchIds={starredPathMatchIds}
            starredTeamIds={new Set(starredTeamIds)}
          />
        </section>
      </div>
    </aside>
  );
}
