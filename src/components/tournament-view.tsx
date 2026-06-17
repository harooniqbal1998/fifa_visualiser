"use client";

import { useRef, useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { SimulationDrawer } from "@/components/simulation-drawer";
import {
  SimulationVisualization,
  type SimulationVisualizationRef,
} from "@/components/simulation-visualization";
import { PetalVisualization } from "@/components/viz/petal/petal-visualization";

export type LayoutMode = "ring" | "petal";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [isSimulating, setIsSimulating] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("ring");
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const vizRef = useRef<SimulationVisualizationRef>(null);

  return (
    <div className="flex h-full w-full min-h-0">
      {layoutMode === "petal" ? (
        <PetalVisualization teams={teams} snapshot={snapshot} />
      ) : (
        <SimulationVisualization
          ref={vizRef}
          teams={teams}
          snapshot={snapshot}
          isSimulating={isSimulating}
          onSimulatingChange={setIsSimulating}
        />
      )}
      <SimulationDrawer
        day={day}
        onDayChange={setDay}
        isSimulating={isSimulating}
        onStop={() => vizRef.current?.stopSimulation()}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />
    </div>
  );
}
