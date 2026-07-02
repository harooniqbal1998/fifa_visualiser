"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Team } from "@/types";
import { TimelineDayPicker, type TimelineDayPickerMode } from "@/components/timeline";
import { TournamentBracketTree } from "@/components/tournament-bracket-tree";
import { TournamentGroupsPanel } from "@/components/tournament-groups-panel";
import { getRelevantMatchIds } from "@/lib/starred-teams/team-bracket-path";
import type { CollisionEvent } from "@/lib/simulation/types";
import type { TournamentStructureView } from "@/lib/tournament-structure";
import { useStarredTeamsStore } from "@/stores/starred-teams-store";

type TournamentStructureDrawerProps = {
  open: boolean;
  onClose?: () => void;
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  day: number;
  pickerDay: number;
  pickerMode: TimelineDayPickerMode;
  onPickerDayChange: (day: number) => void;
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
  pickerDay,
  pickerMode,
  onPickerDayChange,
  activeMatches = [],
}: TournamentStructureDrawerProps) {
  const starredTeamIds = useStarredTeamsStore((s) => s.starredTeamIds);
  const [pathFilterActive, setPathFilterActive] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const groupsSectionRef = useRef<HTMLElement>(null);
  const bracketSectionRef = useRef<HTMLElement>(null);
  const showKnockout = day >= 13;

  const relevantMatchIds = useMemo(
    () => getRelevantMatchIds(starredTeamIds, structure),
    [starredTeamIds, structure],
  );

  const showPathFilter = starredTeamIds.length > 0;

  useEffect(() => {
    if (!open) return;
    const target = showKnockout ? bracketSectionRef.current : groupsSectionRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [day, open, showKnockout]);

  return (
    <aside
      className={`flex min-h-0 shrink-0 flex-col overflow-hidden bg-transparent max-md:min-h-dvh ${
        open
          ? "max-md:fixed max-md:inset-0 max-md:z-40 max-md:w-full max-md:pt-[env(safe-area-inset-top)] max-md:pb-[env(safe-area-inset-bottom)] md:relative md:h-full md:w-1/2 md:min-w-0 md:border-l md:border-light-gray dark:md:border-light-gray/25"
          : "max-md:pointer-events-none max-md:invisible max-md:w-0 md:relative md:h-full md:w-0 md:border-l-0"
      } md:transition-[width] md:duration-200 md:ease-out md:will-change-[width]`}
      aria-hidden={!open}
      aria-label="Tournament structure"
      {...(!open ? { inert: true } : {})}
    >
      {open ? (
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2 border-b border-light-gray px-4 py-3 dark:border-light-gray/25">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-dark-heather md:hidden dark:text-light-gray">
              Tournament structure
            </span>
            <TimelineDayPicker
              day={pickerDay}
              onDayChange={onPickerDayChange}
              mode={pickerMode}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onClose ? (
              <button
                type="button"
                title="Close tournament structure"
                aria-label="Close tournament structure"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-light-gray text-dark-heather hover:bg-light-gray/20 md:hidden dark:border-light-gray/30 dark:text-light-gray dark:hover:bg-light-gray/10"
              >
                <CloseIcon />
              </button>
            ) : null}
            {showPathFilter ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[11px] font-medium text-dark-heather dark:text-light-gray">
                  My teams only
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pathFilterActive}
                  aria-label="My teams only"
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
          </div>
        </div>
      ) : null}
      <div
        ref={scrollContainerRef}
        className={`min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto [scrollbar-width:thin] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <section
          ref={groupsSectionRef}
          className="shrink-0 snap-start snap-always px-4 pt-3 pb-0"
        >
          <TournamentGroupsPanel
            structure={structure}
            teamsById={teamsById}
            day={day}
          />
        </section>
        <section
          ref={bracketSectionRef}
          className="shrink-0 snap-start snap-always px-4 pb-3 pt-0"
        >
          <TournamentBracketTree
            structure={structure}
            teamsById={teamsById}
            activeMatches={activeMatches}
            pathFilterActive={pathFilterActive}
            relevantMatchIds={relevantMatchIds}
          />
        </section>
      </div>
    </aside>
  );
}
