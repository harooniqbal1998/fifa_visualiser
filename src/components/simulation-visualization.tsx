"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Snapshot, Team } from "@/types";
import { TeamCanvas, type TeamCanvasRef } from "@/components/viz/team-canvas";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";

export type SimulationVisualizationRef = {
  stopSimulation: () => void;
};

type SimulationVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
  isSimulating: boolean;
  onSimulatingChange: (simulating: boolean) => void;
};

export const SimulationVisualization = forwardRef<
  SimulationVisualizationRef,
  SimulationVisualizationProps
>(function SimulationVisualization(
  { teams, snapshot, isSimulating, onSimulatingChange },
  ref,
) {
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

  const stopSimulation = useCallback(() => {
    onSimulatingChange(false);
    setLiveProbabilities(null);
    setLiveOpponents(null);
    setLiveBracketDepths(null);
    canvasRef.current?.setProbabilities(snapshot.probabilities);
  }, [snapshot.probabilities, onSimulatingChange]);

  useImperativeHandle(ref, () => ({ stopSimulation }), [stopSimulation]);

  return (
    <section className="relative min-h-0 min-w-0 flex-1">
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
    </section>
  );
});
