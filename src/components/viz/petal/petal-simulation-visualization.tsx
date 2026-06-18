"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Snapshot, Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import { getGroupStandings } from "@/lib/tournament";
import { PetalCanvas, type PetalCanvasRef } from "@/components/viz/petal/petal-canvas";
import { DEFAULT_PETAL_CONFIG } from "@/components/viz/petal/petal-config";
import { computePetalPositions } from "@/components/viz/petal/petal-layout";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";
import {
  buildSimulationBootstrap,
  buildStandingsFromGroupResults,
} from "@/lib/simulation/advancement";
import type { CollisionEvent } from "@/lib/simulation/types";
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

function getStaticEliminated(
  teams: Team[],
  probabilities: Record<string, number>,
): Set<string> {
  return new Set(
    teams.filter((team) => (probabilities[team.id] ?? 0) === 0).map((team) => team.id),
  );
}

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
  const probabilitiesRef = useRef(snapshot.probabilities);
  const standingsRef = useRef<Record<string, StandingRow[]>>(getGroupStandings(snapshot.day));
  const bracketDepthsRef = useRef<Record<string, number>>(snapshot.bracketDepths ?? {});
  const eliminatedRef = useRef<Set<string>>(
    getStaticEliminated(teams, snapshot.probabilities),
  );

  const [liveProbabilities, setLiveProbabilities] = useState<Record<string, number> | null>(
    null,
  );
  const [liveStandings, setLiveStandings] = useState<Record<string, StandingRow[]> | null>(
    null,
  );
  const [liveBracketDepths, setLiveBracketDepths] = useState<Record<string, number> | null>(
    null,
  );
  const [liveEliminated, setLiveEliminated] = useState<Set<string> | null>(null);

  probabilitiesRef.current = liveProbabilities ?? snapshot.probabilities;

  const displayProbabilities = isSimulating
    ? (liveProbabilities ?? snapshot.probabilities)
    : snapshot.probabilities;

  const standings =
    isSimulating && liveStandings ? liveStandings : getGroupStandings(snapshot.day);

  const bracketDepths =
    isSimulating && liveBracketDepths
      ? liveBracketDepths
      : (snapshot.bracketDepths ?? {});

  const eliminated = useMemo(() => {
    if (isSimulating && liveEliminated) return liveEliminated;
    return getStaticEliminated(teams, snapshot.probabilities);
  }, [isSimulating, liveEliminated, teams, snapshot.probabilities]);

  const getCanvasSize = () => {
    const el = containerRef.current;
    if (!el) return { width: 800, height: 600 };
    return {
      width: el.clientWidth,
      height: el.clientHeight || Math.max(el.clientWidth * 0.65, 480),
    };
  };

  const computeLayout = useCallback(
    (
      standingsTable: Record<string, StandingRow[]>,
      depths: Record<string, number>,
      eliminatedSet: Set<string>,
    ) => {
      const { width, height } = getCanvasSize();
      return computePetalPositions(
        teams,
        probabilitiesRef.current,
        standingsTable,
        depths,
        width,
        height,
        DEFAULT_PETAL_CONFIG,
        getVizSizing(),
        eliminatedSet,
      );
    },
    [teams],
  );

  const stopSimulation = useCallback(() => {
    abortRef.current = true;
    onSimulatingChange(false);
    setLiveProbabilities(null);
    setLiveStandings(null);
    setLiveBracketDepths(null);
    setLiveEliminated(null);
    canvasRef.current?.stop();
    canvasRef.current?.clearEliminated();
    canvasRef.current?.setProbabilities(snapshot.probabilities);
  }, [snapshot.probabilities, onSimulatingChange]);

  const startSimulation = useCallback(async () => {
    if (isSimulating) return;

    const startDay = snapshot.day;
    const bootstrap = buildSimulationBootstrap(startDay);

    abortRef.current = false;
    onSimulatingChange(true);

    probabilitiesRef.current = { ...bootstrap.probabilities };
    standingsRef.current = bootstrap.standings;
    bracketDepthsRef.current = bootstrap.bracketDepths;
    eliminatedRef.current = new Set(bootstrap.eliminated);

    setLiveProbabilities({ ...bootstrap.probabilities });
    setLiveStandings(bootstrap.standings);
    setLiveBracketDepths(bootstrap.bracketDepths);
    setLiveEliminated(new Set(bootstrap.eliminated));

    canvasRef.current?.setEliminated(bootstrap.eliminated);
    const initialLayout = computeLayout(
      bootstrap.standings,
      bootstrap.bracketDepths,
      bootstrap.eliminated,
    );
    canvasRef.current?.resetDisplay(initialLayout);

    await runSimulation(
      DEFAULT_ANIMATION_PARAMS,
      {
        onDayChange: (day) => {
          onDayChange?.(day);
        },
        onCollision: (event) => canvasRef.current!.playMatch(event),
        onMatchResolved: async (event: CollisionEvent, groupResults) => {
          if (event.isKnockout) {
            eliminatedRef.current.add(event.loser);
            setLiveEliminated(new Set(eliminatedRef.current));
            await canvasRef.current?.eliminateTeams([event.loser]);

            const layout = computeLayout(
              standingsRef.current,
              bracketDepthsRef.current,
              eliminatedRef.current,
            );
            canvasRef.current?.setLayoutTargets(layout);
            await canvasRef.current?.animateRankTransition();
            return;
          }

          const newStandings = buildStandingsFromGroupResults(groupResults);
          standingsRef.current = newStandings;
          setLiveStandings(newStandings);

          const layout = computeLayout(
            newStandings,
            bracketDepthsRef.current,
            eliminatedRef.current,
          );
          canvasRef.current?.setLayoutTargets(layout);
          await canvasRef.current?.animateRankTransition();
        },
        onEliminations: async ({ teamIds }) => {
          for (const id of teamIds) {
            eliminatedRef.current.add(id);
          }
          setLiveEliminated(new Set(eliminatedRef.current));
          await canvasRef.current?.eliminateTeams(teamIds);
        },
        onProbabilitiesUpdate: (probs) => {
          probabilitiesRef.current = probs;
          setLiveProbabilities(probs);
          canvasRef.current?.setProbabilities(probs);
        },
        onBracketStateChange: (state) => {
          bracketDepthsRef.current = state.bracketDepths;
          setLiveBracketDepths(state.bracketDepths);
        },
        onComplete: () => {
          onSimulatingChange(false);
          setLiveProbabilities(null);
          setLiveStandings(null);
          setLiveBracketDepths(null);
          setLiveEliminated(null);
        },
        shouldAbort: () => abortRef.current,
      },
      { startDay },
    );
  }, [isSimulating, onSimulatingChange, snapshot.day, computeLayout, onDayChange]);

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
        eliminated={eliminated}
        config={DEFAULT_PETAL_CONFIG}
        isSimulating={isSimulating}
      />
    </section>
  );
});
