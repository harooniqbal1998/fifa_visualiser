"use client";

import type { Snapshot, Team } from "@/types";
import { TeamNetwork } from "@/components/viz/team-network";

type VisualizationProps = {
  snapshot: Snapshot;
  teams: Team[];
};

export function Visualization({ snapshot, teams }: VisualizationProps) {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col">
      <TeamNetwork snapshot={snapshot} teams={teams} />
    </section>
  );
}
