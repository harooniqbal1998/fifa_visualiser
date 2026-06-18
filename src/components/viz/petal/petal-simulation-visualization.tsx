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

export type SimulationSessionPhase = "idle" | "running" | "frozen" | "completed";

export type PetalSimulationVisualizationRef = {
  stopSimulation: () => void;
  startSimulation: () => void;
  resetSimulation: () => void;
};

type PetalSimulationVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
  sessionPhase: SimulationSessionPhase;
  onSimulatingChange: (simulating: boolean) => void;
  onSessionComplete: (winnerId: string) => void;
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
  { teams, snapshot, sessionPhase, onSimulatingChange, onSessionComplete, onDayChange },
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

  const useLiveData = sessionPhase !== "idle";
  const isSimulating = sessionPhase === "running";
  const freezeLayout = sessionPhase === "frozen" || sessionPhase === "completed";

  probabilitiesRef.current = useLiveData
    ? (liveProbabilities ?? snapshot.probabilities)
    : snapshot.probabilities;

  const displayProbabilities = useLiveData
    ? (liveProbabilities ?? snapshot.probabilities)
    : snapshot.probabilities;

  const standings = useLiveData
    ? (liveStandings ?? getGroupStandings(snapshot.day))
    : getGroupStandings(snapshot.day);

  const bracketDepths = useLiveData
    ? (liveBracketDepths ?? snapshot.bracketDepths ?? {})
    : (snapshot.bracketDepths ?? {});

  const eliminated = useMemo(() => {
    if (useLiveData && liveEliminated) return liveEliminated;
    return getStaticEliminated(teams, snapshot.probabilities);
  }, [useLiveData, liveEliminated, teams, snapshot.probabilities]);

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
    canvasRef.current?.stop();
  }, [onSimulatingChange]);

  const resetSimulation = useCallback(() => {
    abortRef.current = true;
    setLiveProbabilities(null);
    setLiveStandings(null);
    setLiveBracketDepths(null);
    setLiveEliminated(null);

    const staticEliminated = getStaticEliminated(teams, snapshot.probabilities);
    eliminatedRef.current = new Set(staticEliminated);
    probabilitiesRef.current = snapshot.probabilities;
    standingsRef.current = getGroupStandings(snapshot.day);
    bracketDepthsRef.current = snapshot.bracketDepths ?? {};

    canvasRef.current?.stop();
    canvasRef.current?.clearEliminated();
    canvasRef.current?.setEliminated(staticEliminated);

    const layout = computeLayout(
      standingsRef.current,
      bracketDepthsRef.current,
      staticEliminated,
    );
    canvasRef.current?.resetDisplay(layout);
    if (staticEliminated.size > 0) {
      canvasRef.current?.markTeamsDropped([...staticEliminated]);
    }
  }, [teams, snapshot, computeLayout]);

  const startSimulation = useCallback(async () => {
    if (sessionPhase === "running") return;

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
    if (bootstrap.eliminated.size > 0) {
      canvasRef.current?.markTeamsDropped([...bootstrap.eliminated]);
    }

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
          const matchTeams = [event.home, event.away];
          const groupId = teams.find((team) => team.id === event.home)?.group;
          const groupTeamIds = groupId
            ? teams.filter((team) => team.group === groupId).map((team) => team.id)
            : matchTeams;
          canvasRef.current?.setLayoutTargets(layout, matchTeams);
          await canvasRef.current?.animateRankTransition(matchTeams, groupTeamIds);
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
        onComplete: (finalState) => {
          onSimulatingChange(false);
          const survivors = teams.filter((team) => !finalState.eliminated.has(team.id));
          if (survivors.length === 1) {
            onSessionComplete(survivors[0]!.id);
          }
        },
        shouldAbort: () => abortRef.current,
      },
      { startDay },
    );
  }, [
    sessionPhase,
    onSimulatingChange,
    onSessionComplete,
    snapshot.day,
    computeLayout,
    onDayChange,
    teams,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      stopSimulation,
      startSimulation,
      resetSimulation,
    }),
    [stopSimulation, startSimulation, resetSimulation],
  );

  return (
    <section ref={containerRef} className="relative h-full min-h-0 min-w-0 w-full">
      <PetalCanvas
        ref={canvasRef}
        teams={teams}
        probabilities={displayProbabilities}
        standings={standings}
        bracketDepths={bracketDepths}
        eliminated={eliminated}
        config={DEFAULT_PETAL_CONFIG}
        isSimulating={isSimulating}
        freezeLayout={freezeLayout}
      />
    </section>
  );
});
