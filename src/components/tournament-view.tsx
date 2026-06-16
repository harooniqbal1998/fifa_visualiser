"use client";

import { useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { Timeline } from "@/components/timeline";
import { SimulationVisualization } from "@/components/simulation-visualization";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [isSimulating, setIsSimulating] = useState(false);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;

  return (
    <>
      <SimulationVisualization
        teams={teams}
        snapshot={snapshot}
        day={day}
        isSimulating={isSimulating}
        onSimulatingChange={setIsSimulating}
        onDayChange={setDay}
      />
      <Timeline
        day={day}
        onDayChange={setDay}
        isSimulating={isSimulating}
      />
    </>
  );
}
