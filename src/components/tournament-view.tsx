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
import {
  PetalSimulationVisualization,
  type PetalSimulationVisualizationRef,
} from "@/components/viz/petal/petal-simulation-visualization";

export type LayoutMode = "ring" | "petal";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [isSimulating, setIsSimulating] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("petal");
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const ringVizRef = useRef<SimulationVisualizationRef>(null);
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);

  const handlePlay = () => {
    if (layoutMode === "petal") {
      petalVizRef.current?.startSimulation();
    } else {
      setIsSimulating(true);
    }
  };

  const handleStop = () => {
    if (layoutMode === "petal") {
      petalVizRef.current?.stopSimulation();
    } else {
      ringVizRef.current?.stopSimulation();
    }
  };

  return (
    <div className="flex h-full w-full min-h-0">
      {layoutMode === "petal" ? (
        <PetalSimulationVisualization
          ref={petalVizRef}
          teams={teams}
          snapshot={snapshot}
          isSimulating={isSimulating}
          onSimulatingChange={setIsSimulating}
          onDayChange={setDay}
        />
      ) : (
        <SimulationVisualization
          ref={ringVizRef}
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
        onPlay={handlePlay}
        onStop={handleStop}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
      />
    </div>
  );
}
