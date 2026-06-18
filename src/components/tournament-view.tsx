"use client";

import { useEffect, useRef, useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { measurePillReserve } from "@/lib/viz-layout";
import { SimulationPill } from "@/components/simulation-pill";
import {
  PetalSimulationVisualization,
  type PetalSimulationVisualizationRef,
  type SimulationSessionPhase,
} from "@/components/viz/petal/petal-simulation-visualization";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [sessionPhase, setSessionPhase] = useState<SimulationSessionPhase>("idle");
  const [pillReserve, setPillReserve] = useState(0);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const updateReserve = () => {
      setPillReserve(measurePillReserve(pill));
    };

    updateReserve();
    const observer = new ResizeObserver(updateReserve);
    observer.observe(pill);
    window.addEventListener("resize", updateReserve);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateReserve);
    };
  }, [sessionPhase, day]);

  const handlePlay = () => {
    petalVizRef.current?.startSimulation();
  };

  const handleStop = () => {
    petalVizRef.current?.stopSimulation();
    setSessionPhase("frozen");
  };

  const handleRestart = () => {
    petalVizRef.current?.resetSimulation();
    setSessionPhase("idle");
  };

  const handleSimulatingChange = (simulating: boolean) => {
    if (simulating) {
      setSessionPhase("running");
    }
  };

  const handleSessionComplete = (_winnerId: string) => {
    setSessionPhase("completed");
  };

  return (
    <div className="relative h-full w-full min-h-0">
      <div
        className="min-h-0 w-full"
        style={{ height: `calc(100% - ${pillReserve}px)` }}
      >
        <PetalSimulationVisualization
          ref={petalVizRef}
          teams={teams}
          snapshot={snapshot}
          sessionPhase={sessionPhase}
          onSimulatingChange={handleSimulatingChange}
          onSessionComplete={handleSessionComplete}
          onDayChange={setDay}
        />
      </div>
      <SimulationPill
        ref={pillRef}
        day={day}
        onDayChange={setDay}
        sessionPhase={sessionPhase}
        onPlay={handlePlay}
        onStop={handleStop}
        onRestart={handleRestart}
      />
    </div>
  );
}
