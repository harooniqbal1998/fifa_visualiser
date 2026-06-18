"use client";

import { useRef, useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { SimulationDrawer } from "@/components/simulation-drawer";
import {
  PetalSimulationVisualization,
  type PetalSimulationVisualizationRef,
} from "@/components/viz/petal/petal-simulation-visualization";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [isSimulating, setIsSimulating] = useState(false);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);

  const handlePlay = () => {
    petalVizRef.current?.startSimulation();
  };

  const handleStop = () => {
    petalVizRef.current?.stopSimulation();
  };

  return (
    <div className="flex h-full w-full min-h-0">
      <PetalSimulationVisualization
        ref={petalVizRef}
        teams={teams}
        snapshot={snapshot}
        isSimulating={isSimulating}
        onSimulatingChange={setIsSimulating}
        onDayChange={setDay}
      />
      <SimulationDrawer
        day={day}
        onDayChange={setDay}
        isSimulating={isSimulating}
        onPlay={handlePlay}
        onStop={handleStop}
      />
    </div>
  );
}
