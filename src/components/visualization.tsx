"use client";

import type { Snapshot, Team } from "@/types";
import { WinProbabilityBars } from "@/components/viz/win-probability-bars";

type VisualizationProps = {
  snapshot: Snapshot;
  teams: Team[];
};

export function Visualization({ snapshot, teams }: VisualizationProps) {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      <WinProbabilityBars snapshot={snapshot} teams={teams} />
    </section>
  );
}
