"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Snapshot, Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import { getGroupStandings, getSnapshotByDay } from "@/lib/tournament";
import { PetalCanvas, type PetalCanvasRef } from "@/components/viz/petal/petal-canvas";
import { DEFAULT_PETAL_CONFIG } from "@/components/viz/petal/petal-config";
import { computePetalPositions } from "@/components/viz/petal/petal-layout";
import {
  createSimulationSeed,
  DEFAULT_ANIMATION_PARAMS,
} from "@/lib/simulation/animation-params";
import {
  buildSimulationBootstrap,
  getScriptedResultsUpToDay,
} from "@/lib/simulation/advancement";
import { buildStandingsFromGroupResults } from "@/lib/simulation/group-advancement";
import { getEliminatedFromResults } from "@/lib/simulation/bracket-state";
import type { ProbabilityState } from "@/lib/probability/types";
import type { CollisionEvent, SimMatchResult } from "@/lib/simulation/types";
import { runSimulation } from "@/lib/simulation/simulation-engine";
import { getVizSizing } from "@/components/viz/viz-math";

export type SimulationSessionPhase = "idle" | "running" | "frozen" | "completed";

export type PetalSimulationVisualizationRef = {
  stopSimulation: () => void;
  startSimulation: () => void;
  resetSimulation: (restoreDay?: number) => void;
};

type PetalSimulationVisualizationProps = {
  teams: Team[];
  snapshot: Snapshot;
  sessionPhase: SimulationSessionPhase;
  onSimulatingChange: (simulating: boolean) => void;
  onSessionComplete: (winnerId: string) => void;
  onDayChange?: (day: number) => void;
  onProbabilityStateUpdate?: (payload: {
    state: ProbabilityState;
    groupResults: SimMatchResult[];
    knockoutResults: SimMatchResult[];
  }) => void;
  onActiveMatchesChange?: (matches: CollisionEvent[]) => void;
};

function getSnapshotEliminated(snapshot: Snapshot): Set<string> {
  if (snapshot.eliminatedTeamIds) {
    return new Set(snapshot.eliminatedTeamIds);
  }
  const results = getScriptedResultsUpToDay(snapshot.day);
  const groupResults = results.filter((r) => r.stage === "group");
  const knockoutResults = results.filter((r) => r.stage !== "group");
  return getEliminatedFromResults(snapshot.day, knockoutResults, groupResults);
}

function collisionEventToResult(event: CollisionEvent): SimMatchResult {
  return {
    matchId: event.matchId,
    stage: event.stage,
    day: event.day,
    home: event.home,
    away: event.away,
    winner: event.winner,
  };
}

function upsertMatchResult(
  results: SimMatchResult[],
  result: SimMatchResult,
): SimMatchResult[] {
  return [...results.filter((r) => r.matchId !== result.matchId), result];
}

export const PetalSimulationVisualization = memo(
  forwardRef<PetalSimulationVisualizationRef, PetalSimulationVisualizationProps>(
    function PetalSimulationVisualization(
  { teams, snapshot, sessionPhase, onSimulatingChange, onSessionComplete, onDayChange, onProbabilityStateUpdate, onActiveMatchesChange },
  ref,
) {
  const canvasRef = useRef<PetalCanvasRef>(null);
  const containerRef = useRef<HTMLElement>(null);
  const abortRef = useRef(false);
  const activeMatchesRef = useRef<CollisionEvent[]>([]);
  const probabilitiesRef = useRef(snapshot.probabilities);
  const standingsRef = useRef<Record<string, StandingRow[]>>(getGroupStandings(snapshot.day));
  const bracketDepthsRef = useRef<Record<string, number>>(snapshot.bracketDepths ?? {});
  const eliminatedRef = useRef<Set<string>>(getSnapshotEliminated(snapshot));
  const groupResultsRef = useRef<SimMatchResult[]>([]);
  const knockoutResultsRef = useRef<SimMatchResult[]>([]);
  const probabilityStateRef = useRef<ProbabilityState | null>(null);
  const prevSnapshotDayRef = useRef(snapshot.day);

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

  const standings = useMemo(
    () =>
      useLiveData
        ? (liveStandings ?? getGroupStandings(snapshot.day))
        : getGroupStandings(snapshot.day),
    [useLiveData, liveStandings, snapshot.day],
  );

  const bracketDepths = useLiveData
    ? (liveBracketDepths ?? snapshot.bracketDepths ?? {})
    : (snapshot.bracketDepths ?? {});

  const eliminated = useMemo(() => {
    if (useLiveData && liveEliminated) return liveEliminated;
    return getSnapshotEliminated(snapshot);
  }, [useLiveData, liveEliminated, snapshot]);

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

  const clearActiveMatches = useCallback(() => {
    activeMatchesRef.current = [];
    onActiveMatchesChange?.([]);
  }, [onActiveMatchesChange]);

  const notifyStructureState = useCallback(() => {
    const probState = probabilityStateRef.current;
    if (!probState) return;
    onProbabilityStateUpdate?.({
      state: probState,
      groupResults: groupResultsRef.current,
      knockoutResults: knockoutResultsRef.current,
    });
  }, [onProbabilityStateUpdate]);

  const commitMatchResult = useCallback((event: CollisionEvent) => {
    const result = collisionEventToResult(event);
    if (event.isKnockout) {
      knockoutResultsRef.current = upsertMatchResult(knockoutResultsRef.current, result);
    } else {
      groupResultsRef.current = upsertMatchResult(groupResultsRef.current, result);
    }
  }, []);

  const stopSimulation = useCallback(() => {
    abortRef.current = true;
    onSimulatingChange(false);
    canvasRef.current?.stop();
    clearActiveMatches();
  }, [onSimulatingChange, clearActiveMatches]);

  const resetSimulation = useCallback(
    (restoreDay?: number) => {
      abortRef.current = true;
      setLiveProbabilities(null);
      setLiveStandings(null);
      setLiveBracketDepths(null);
      setLiveEliminated(null);

      const restoreSnapshot =
        getSnapshotByDay(restoreDay ?? snapshot.day) ?? snapshot;
      const staticEliminated = getSnapshotEliminated(restoreSnapshot);
      eliminatedRef.current = new Set(staticEliminated);
      probabilitiesRef.current = restoreSnapshot.probabilities;
      standingsRef.current = getGroupStandings(restoreSnapshot.day);
      bracketDepthsRef.current = restoreSnapshot.bracketDepths ?? {};
      groupResultsRef.current = [];
      knockoutResultsRef.current = [];
      probabilityStateRef.current = null;

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
      clearActiveMatches();
    },
    [snapshot, computeLayout, clearActiveMatches],
  );

  useLayoutEffect(() => {
    if (sessionPhase === "running") {
      prevSnapshotDayRef.current = snapshot.day;
      return;
    }
    if (prevSnapshotDayRef.current === snapshot.day) return;
    prevSnapshotDayRef.current = snapshot.day;
    resetSimulation(snapshot.day);
  }, [snapshot.day, sessionPhase, resetSimulation]);

  const startSimulation = useCallback(async () => {
    if (sessionPhase === "running") return;

    const startDay = snapshot.day;
    const simulationSeed = createSimulationSeed();
    const params = { ...DEFAULT_ANIMATION_PARAMS, simulationSeed };
    const bootstrap = buildSimulationBootstrap(startDay);

    abortRef.current = false;
    onSimulatingChange(true);

    probabilitiesRef.current = { ...bootstrap.probabilities };
    standingsRef.current = bootstrap.standings;
    bracketDepthsRef.current = bootstrap.bracketDepths;
    groupResultsRef.current = bootstrap.runState.groupResults;
    knockoutResultsRef.current = bootstrap.runState.results;
    probabilityStateRef.current = bootstrap.runState.probability;
    eliminatedRef.current = new Set(bootstrap.eliminated);

    setLiveProbabilities({ ...bootstrap.probabilities });
    setLiveStandings(bootstrap.standings);
    setLiveBracketDepths(bootstrap.bracketDepths);
    setLiveEliminated(new Set(bootstrap.eliminated));

    // Canvas already reflects idle snapshot layout — keep display state on play.
    canvasRef.current?.setProbabilities(bootstrap.probabilities);

    await runSimulation(
      params,
      {
        onDayChange: (day) => {
          onDayChange?.(day);
        },
        onCollision: async (event) => {
          activeMatchesRef.current = [...activeMatchesRef.current, event];
          onActiveMatchesChange?.([...activeMatchesRef.current]);
          try {
            await canvasRef.current!.playMatch(event);
          } finally {
            commitMatchResult(event);
            notifyStructureState();
            activeMatchesRef.current = activeMatchesRef.current.filter(
              (m) => m.matchId !== event.matchId,
            );
            onActiveMatchesChange?.([...activeMatchesRef.current]);
          }
        },
        onMatchResolved: async (event: CollisionEvent, groupResults) => {
          groupResultsRef.current = groupResults;
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
          canvasRef.current?.setLayoutTargets(layout, matchTeams, groupTeamIds);
          await canvasRef.current?.animateRankTransition(matchTeams, groupTeamIds);
          canvasRef.current?.syncRadiusTargetsFromLayout(layout);
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
          const layout = computeLayout(
            standingsRef.current,
            bracketDepthsRef.current,
            eliminatedRef.current,
          );
          canvasRef.current?.syncRadiusTargetsFromLayout(layout);
        },
        onProbabilityStateUpdate: (probState) => {
          probabilityStateRef.current = probState;
          onProbabilityStateUpdate?.({
            state: probState,
            groupResults: groupResultsRef.current,
            knockoutResults: knockoutResultsRef.current,
          });
        },
        onBracketStateChange: (state) => {
          bracketDepthsRef.current = state.bracketDepths;
          setLiveBracketDepths(state.bracketDepths);
        },
        onComplete: (finalState) => {
          onSimulatingChange(false);
          const survivors = teams.filter(
            (team) => !finalState.probability.eliminated.has(team.id),
          );
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
    onActiveMatchesChange,
    commitMatchResult,
    notifyStructureState,
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
        showRankBorders={snapshot.day < 12}
      />
    </section>
  );
  }),
);
