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

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [isSimulating, setIsSimulating] = useState(false);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const vizRef = useRef<SimulationVisualizationRef>(null);

  return (
    <div className="flex h-full w-full min-h-0">
      <SimulationVisualization
        ref={vizRef}
        teams={teams}
        snapshot={snapshot}
        isSimulating={isSimulating}
        onSimulatingChange={setIsSimulating}
      />
      <SimulationDrawer
        day={day}
        onDayChange={setDay}
        isSimulating={isSimulating}
        onStop={() => vizRef.current?.stopSimulation()}
      />
    </div>
  );
}
