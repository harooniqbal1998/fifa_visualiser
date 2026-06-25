"use client";

import { teamsById } from "@/data/teams";
import { getStarredTeamSummaries } from "@/lib/starred-teams/team-probability-delta";
import { TeamFlagAvatar } from "@/components/team-flag-avatar";
import type { ProbabilityState } from "@/lib/probability/types";
import type { SimulationSessionPhase } from "@/components/viz/petal/petal-simulation-visualization";
import type { Snapshot } from "@/types";

type StarredTeamsSummaryPillProps = {
  starredTeamIds: string[];
  day: number;
  sessionPhase: SimulationSessionPhase;
  liveState: ProbabilityState | null;
  snapshot: Snapshot;
};

function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? "+" : "";
  return `(${sign}${deltaPct.toFixed(1)}%)`;
}

function DeltaText({ deltaPct }: { deltaPct: number }) {
  if (Math.abs(deltaPct) < 0.01) {
    return <span className="font-mono tabular-nums">(0.0%)</span>;
  }

  const sign = deltaPct > 0 ? "+" : "";
  const colorClass =
    deltaPct > 0 ? "text-average-green" : deltaPct < 0 ? "text-torch-red" : "";

  return (
    <span className="font-mono tabular-nums">
      (<span className={colorClass}>{sign}{deltaPct.toFixed(1)}</span>%)
    </span>
  );
}

export function StarredTeamsSummaryPill({
  starredTeamIds,
  day,
  sessionPhase,
  liveState,
  snapshot,
}: StarredTeamsSummaryPillProps) {
  if (starredTeamIds.length === 0) return null;

  const summaries = getStarredTeamSummaries({
    starredIds: starredTeamIds,
    day,
    sessionPhase,
    liveState,
    snapshot,
  });

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-2">
      {summaries.map((summary) => {
        const team = teamsById[summary.teamId];
        if (!team) return null;

        return (
          <div
            key={summary.teamId}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-hermes px-2.5 text-xs font-medium text-white dark:bg-light-gray dark:text-dark-heather"
            title={`${team.name} ${summary.winPct}% ${formatDelta(summary.deltaPct)}`}
          >
            <TeamFlagAvatar isoCode={team.isoCode} size={14} />
            <span className="font-mono tabular-nums">{summary.winPct.toFixed(1)}%</span>
            <DeltaText deltaPct={summary.deltaPct} />
          </div>
        );
      })}
    </div>
  );
}
