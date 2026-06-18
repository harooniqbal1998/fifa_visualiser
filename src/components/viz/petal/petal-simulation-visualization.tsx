"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Snapshot, Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import { getGroupStandings } from "@/lib/tournament";
import { PetalCanvas, type PetalCanvasRef } from "@/components/viz/petal/petal-canvas";
import {
  DEFAULT_PETAL_CONFIG,
  loadPetalConfigFromStorage,
  mergePetalConfig,
  type PetalLayoutConfig,
} from "@/components/viz/petal/petal-config";
import { computePetalPositions } from "@/components/viz/petal/petal-layout";
import { PetalTuningPanel } from "@/components/viz/petal/petal-tuning-panel";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";
import {
  buildStandingsFromGroupResults,
  getScriptedResultsBeforeDay,
} from "@/lib/simulation/advancement";
import { runSimulation } from "@/lib/simulation/simulation-engine";
import { getVizSizing } from "@/components/viz/viz-math";

export type PetalSimulationVisualizationRef = {
  stopSimulation: () => void;
  startSimulation: () => void;
};

type PetalSimulationVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
  isSimulating: boolean;
  onSimulatingChange: (simulating: boolean) => void;
  onDayChange?: (day: number) => void;
};

export const PetalSimulationVisualization = forwardRef<
  PetalSimulationVisualizationRef,
  PetalSimulationVisualizationProps
>(function PetalSimulationVisualization(
  { teams, snapshot, isSimulating, onSimulatingChange, onDayChange },
  ref,
) {
  const canvasRef = useRef<PetalCanvasRef>(null);
  const containerRef = useRef<HTMLElement>(null);
  const abortRef = useRef(false);
  const configRef = useRef<PetalLayoutConfig>(mergePetalConfig(loadPetalConfigFromStorage()));
  const probabilitiesRef = useRef(snapshot.probabilities);

  const [config, setConfig] = useState<PetalLayoutConfig>(() => configRef.current);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [liveProbabilities, setLiveProbabilities] = useState<Record<string, number> | null>(
    null,
  );
  const [liveStandings, setLiveStandings] = useState<Record<string, StandingRow[]> | null>(
    null,
  );

  configRef.current = config;
  probabilitiesRef.current = liveProbabilities ?? snapshot.probabilities;

  const displayProbabilities = isSimulating
    ? (liveProbabilities ?? snapshot.probabilities)
    : snapshot.probabilities;

  const standings =
    isSimulating && liveStandings ? liveStandings : getGroupStandings(snapshot.day);

  const bracketDepths = snapshot.bracketDepths ?? {};

  const getCanvasSize = () => {
    const el = containerRef.current;
    if (!el) return { width: 800, height: 600 };
    return {
      width: el.clientWidth,
      height: el.clientHeight || Math.max(el.clientWidth * 0.65, 480),
    };
  };

  const recomputeAndSetLayout = useCallback(
    (standingsTable: Record<string, StandingRow[]>) => {
      const { width, height } = getCanvasSize();
      return computePetalPositions(
        teams,
        probabilitiesRef.current,
        standingsTable,
        {},
        width,
        height,
        configRef.current,
        getVizSizing(),
      );
    },
    [teams],
  );

  const stopSimulation = useCallback(() => {
    abortRef.current = true;
    onSimulatingChange(false);
    setLiveProbabilities(null);
    setLiveStandings(null);
    canvasRef.current?.stop();
    canvasRef.current?.setProbabilities(snapshot.probabilities);
  }, [snapshot.probabilities, onSimulatingChange]);

  const startSimulation = useCallback(async () => {
    if (isSimulating) return;
    abortRef.current = false;
    onSimulatingChange(true);
    setLiveProbabilities({ ...snapshot.probabilities });

    const scriptedGroup = getScriptedResultsBeforeDay(snapshot.day).filter(
      (r) => r.stage === "group",
    );
    setLiveStandings(buildStandingsFromGroupResults(scriptedGroup));

    await runSimulation(
      DEFAULT_ANIMATION_PARAMS,
      {
        onDayChange: () => {},
        onCollision: (event) => canvasRef.current!.playMatch(event),
        onMatchResolved: async (_event, groupResults) => {
          const newStandings = buildStandingsFromGroupResults(groupResults);
          setLiveStandings(newStandings);
          const layout = recomputeAndSetLayout(newStandings);
          canvasRef.current?.setLayoutTargets(layout);
          await canvasRef.current?.animateRankTransition();
        },
        onEliminations: async () => {},
        onProbabilitiesUpdate: (probs) => {
          probabilitiesRef.current = probs;
          setLiveProbabilities(probs);
          canvasRef.current?.setProbabilities(probs);
        },
        onBracketStateChange: () => {},
        onComplete: () => {
          onSimulatingChange(false);
          if (configRef.current.autoAdvanceDay && onDayChange) {
            onDayChange(snapshot.day + 1);
          }
        },
        shouldAbort: () => abortRef.current,
      },
      {
        startDay: snapshot.day,
        snapshot,
        stopAfterDay: snapshot.day,
        groupStageOnly: true,
      },
    );
  }, [
    isSimulating,
    onSimulatingChange,
    snapshot,
    recomputeAndSetLayout,
    onDayChange,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      stopSimulation,
      startSimulation,
    }),
    [stopSimulation, startSimulation],
  );

  return (
    <section ref={containerRef} className="relative min-h-0 min-w-0 flex-1">
      <PetalCanvas
        ref={canvasRef}
        teams={teams}
        probabilities={displayProbabilities}
        standings={standings}
        bracketDepths={bracketDepths}
        config={config}
        isSimulating={isSimulating}
      />
      <PetalTuningPanel
        config={config}
        onChange={setConfig}
        collapsed={panelCollapsed}
        onCollapsedChange={setPanelCollapsed}
      />
    </section>
  );
});

export { DEFAULT_PETAL_CONFIG };
