"use client";

import { useCallback, useRef, useState } from "react";
import type { Snapshot, Team } from "@/types";
import { TeamCanvas, type TeamCanvasRef } from "@/components/viz/team-canvas";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";
import { runSimulation } from "@/lib/simulation/simulation-engine";

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
  const abortRef = useRef(false);
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

  const handlePlay = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    abortRef.current = false;
    onSimulatingChange(true);
    setLiveProbabilities(snapshot.probabilities);
    setLiveOpponents(snapshot.possibleOpponents);
    setLiveBracketDepths(snapshot.bracketDepths ?? {});

    await runSimulation(
      DEFAULT_ANIMATION_PARAMS,
      {
        onDayChange: (nextDay) => {
          onDayChange(nextDay);
        },
        onCollision: async (event) => {
          await canvas.playCollision(event);
        },
        onEliminations: async (event) => {
          await canvas.eliminateTeams(event.teamIds);
        },
        onProbabilitiesUpdate: (probs) => {
          setLiveProbabilities(probs);
          canvas.setProbabilities(probs);
        },
        onBracketStateChange: ({ possibleOpponents, bracketDepths }) => {
          setLiveOpponents(possibleOpponents);
          setLiveBracketDepths(bracketDepths);
          canvas.relayoutAnchors(bracketDepths);
        },
        onComplete: () => {
          setLiveProbabilities(null);
          setLiveOpponents(null);
          setLiveBracketDepths(null);
          onSimulatingChange(false);
        },
        shouldAbort: () => abortRef.current,
      },
      { startDay: day, snapshot },
    );

    if (abortRef.current) {
      onSimulatingChange(false);
      setLiveProbabilities(null);
      setLiveOpponents(null);
      setLiveBracketDepths(null);
      canvas.setProbabilities(snapshot.probabilities);
    }
  }, [day, onDayChange, onSimulatingChange, snapshot]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
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
              onClick={handlePlay}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
