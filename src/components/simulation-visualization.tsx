"use client";

import { useCallback, useRef, useState } from "react";
import type { Snapshot, Team } from "@/types";
import { TeamCanvas, type TeamCanvasRef } from "@/components/viz/team-canvas";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";

type SimulationVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
  day: number;
  isSimulating: boolean;
  onSimulatingChange: (simulating: boolean) => void;
  onDayChange: (day: number) => void;
};

export function SimulationVisualization({
  teams,
  snapshot,
  day,
  isSimulating,
  onSimulatingChange,
  onDayChange,
}: SimulationVisualizationProps) {
  const canvasRef = useRef<TeamCanvasRef>(null);
  const [liveProbabilities, setLiveProbabilities] = useState<Record<string, number> | null>(
    null,
  );
  const [liveOpponents, setLiveOpponents] = useState<Record<string, string[]> | null>(
    null,
  );
  const [liveBracketDepths, setLiveBracketDepths] = useState<Record<string, number> | null>(
    null,
  );

  const displayProbabilities = isSimulating
    ? (liveProbabilities ?? snapshot.probabilities)
    : snapshot.probabilities;

  const displayOpponents = isSimulating
    ? (liveOpponents ?? snapshot.possibleOpponents)
    : snapshot.possibleOpponents;

  const displayBracketDepths = isSimulating
    ? (liveBracketDepths ?? snapshot.bracketDepths ?? {})
    : (snapshot.bracketDepths ?? {});

  const seedKey = `day:${snapshot.day}`;

  const handleStop = useCallback(() => {
    onSimulatingChange(false);
    setLiveProbabilities(null);
    setLiveOpponents(null);
    setLiveBracketDepths(null);
    canvasRef.current?.setProbabilities(snapshot.probabilities);
  }, [snapshot.probabilities, onSimulatingChange]);

  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 px-6 py-4">
        <div>
          <h2 className="text-sm font-medium">Day {day}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isSimulating
              ? "Simulation in progress"
              : "Team win probability — scrub timeline or play simulation"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isSimulating ? (
            <button
              type="button"
              disabled
              title="Positioning pass — simulation coming next"
              className="cursor-not-allowed rounded-md bg-zinc-400 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-600"
            >
              Play simulation
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Stop
            </button>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 px-6 pb-4">
        <TeamCanvas
          ref={canvasRef}
          teams={teams}
          probabilities={displayProbabilities}
          possibleOpponents={displayOpponents}
          bracketDepths={displayBracketDepths}
          snapshotDay={snapshot.day}
          seedKey={seedKey}
          params={DEFAULT_ANIMATION_PARAMS}
          isSimulating={isSimulating}
        />
      </div>
    </section>
  );
}
