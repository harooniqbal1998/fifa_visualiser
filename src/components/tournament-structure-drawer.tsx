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
  onClose?: () => void;
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  day: number;
  activeMatches?: CollisionEvent[];
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function TournamentStructureDrawer({
  open,
  onClose,
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
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-background dark:bg-dark-heather ${
        open
          ? "max-md:fixed max-md:inset-0 max-md:z-40 max-md:w-full md:relative md:h-full md:w-1/2 md:min-w-0 md:border-l md:border-light-gray dark:md:border-light-gray/25"
          : "max-md:pointer-events-none max-md:invisible max-md:w-0 md:relative md:h-full md:w-0 md:border-l-0"
      } md:transition-[width] md:duration-200 md:ease-out md:will-change-[width]`}
      aria-hidden={!open}
      aria-label="Tournament structure"
      {...(!open ? { inert: true } : {})}
    >
      {open ? (
        <div className="flex shrink-0 items-center justify-between border-b border-light-gray px-4 py-3 md:hidden dark:border-light-gray/25">
          <span className="text-sm font-medium text-dark-heather dark:text-light-gray">
            Tournament structure
          </span>
          {onClose ? (
            <button
              type="button"
              title="Close tournament structure"
              aria-label="Close tournament structure"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-light-gray text-dark-heather hover:bg-light-gray/20 dark:border-light-gray/30 dark:text-light-gray dark:hover:bg-light-gray/10"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>
      ) : null}
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
