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
  type AnimationParams,
} from "@/lib/simulation/animation-params";
import {
  buildSimulationBootstrap,
  getScriptedResultsUpToDay,
} from "@/lib/simulation/advancement";
import { buildStandingsFromGroupResults } from "@/lib/simulation/group-advancement";
import { getEliminatedFromResults } from "@/lib/simulation/bracket-state";
import type { ProbabilityState } from "@/lib/probability/types";
import type { CollisionEvent, SimMatchResult, SimulationRunState } from "@/lib/simulation/types";
import { runSimulation } from "@/lib/simulation/simulation-engine";
import { getVizSizing } from "@/components/viz/viz-math";

export type SimulationSessionPhase = "idle" | "running" | "paused" | "completed";

export type PetalSimulationVisualizationRef = {
  stopSimulation: () => Promise<void>;
  startSimulation: () => Promise<void>;
  resetSimulation: (restoreDay?: number) => Promise<void>;
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
    advancingThirdGroups?: string[];
  }) => void;
  onActiveMatchesChange?: (matches: CollisionEvent[]) => void;
  starredTeamIds?: string[];
  onTeamClick?: (teamId: string) => void;
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

type SimulationCheckpoint = {
  seed: number;
  params: AnimationParams;
  runState: SimulationRunState;
};

export const PetalSimulationVisualization = memo(
  forwardRef<PetalSimulationVisualizationRef, PetalSimulationVisualizationProps>(
    function PetalSimulationVisualization(
  { teams, snapshot, sessionPhase, onSimulatingChange, onSessionComplete, onDayChange, onProbabilityStateUpdate, onActiveMatchesChange, starredTeamIds = [], onTeamClick },
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
  const advancingThirdGroupsRef = useRef<string[] | undefined>(undefined);
  const probabilityStateRef = useRef<ProbabilityState | null>(null);
  const prevSnapshotDayRef = useRef(snapshot.day);
  const checkpointRef = useRef<SimulationCheckpoint | null>(null);
  const simulationRunRef = useRef<Promise<SimulationRunState> | null>(null);
  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const sessionPhaseRef = useRef(sessionPhase);
  sessionPhaseRef.current = sessionPhase;

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
  const freezeLayout = sessionPhase === "paused" || sessionPhase === "completed";

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
      advancingThirdGroups?: string[],
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
        advancingThirdGroups,
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
      advancingThirdGroups: advancingThirdGroupsRef.current,
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

  const stopSimulation = useCallback(async () => {
    const stopWork = async () => {
      abortRef.current = true;
      canvasRef.current?.stop();
      clearActiveMatches();

      const run = simulationRunRef.current;
      if (run) {
        const runState = await run;
        if (checkpointRef.current) {
          checkpointRef.current = { ...checkpointRef.current, runState };
        }
      }
    };

    stopPromiseRef.current = stopWork();
    try {
      await stopPromiseRef.current;
    } finally {
      stopPromiseRef.current = null;
    }
  }, [clearActiveMatches]);

  const resetSimulation = useCallback(
    async (restoreDay?: number) => {
      abortRef.current = true;

      const run = simulationRunRef.current;
      if (run) {
        await run;
      }
      checkpointRef.current = null;
      simulationRunRef.current = null;

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
      advancingThirdGroupsRef.current = undefined;
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
    if (stopPromiseRef.current) {
      await stopPromiseRef.current;
    }

    if (sessionPhaseRef.current === "running") return;

    if (simulationRunRef.current) {
      await simulationRunRef.current;
    }

    const isResume =
      sessionPhaseRef.current === "paused" && checkpointRef.current !== null;

    let params: AnimationParams;
    let startDay: number;
    let initialState: SimulationRunState | undefined;
    let resume = false;

    if (isResume) {
      const checkpoint = checkpointRef.current!;
      params = checkpoint.params;
      initialState = checkpoint.runState;
      startDay = checkpoint.runState.day;
      advancingThirdGroupsRef.current = checkpoint.runState.advancingThirdGroups;
      resume = true;
    } else {
      const simulationSeed = createSimulationSeed();
      params = { ...DEFAULT_ANIMATION_PARAMS, simulationSeed };
      startDay = snapshot.day;
      const bootstrap = buildSimulationBootstrap(startDay);

      probabilitiesRef.current = { ...bootstrap.probabilities };
      standingsRef.current = bootstrap.standings;
      bracketDepthsRef.current = bootstrap.bracketDepths;
      groupResultsRef.current = bootstrap.runState.groupResults;
      knockoutResultsRef.current = bootstrap.runState.results;
      probabilityStateRef.current = bootstrap.runState.probability;
      advancingThirdGroupsRef.current = bootstrap.runState.advancingThirdGroups;
      eliminatedRef.current = new Set(bootstrap.eliminated);

      setLiveProbabilities({ ...bootstrap.probabilities });
      setLiveStandings(bootstrap.standings);
      setLiveBracketDepths(bootstrap.bracketDepths);
      setLiveEliminated(new Set(bootstrap.eliminated));

      canvasRef.current?.setProbabilities(bootstrap.probabilities);

      checkpointRef.current = {
        seed: simulationSeed,
        params,
        runState: bootstrap.runState,
      };
    }

    abortRef.current = false;
    onSimulatingChange(true);

    simulationRunRef.current = runSimulation(
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
              advancingThirdGroupsRef.current,
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
            advancingThirdGroupsRef.current,
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
            advancingThirdGroupsRef.current,
          );
          canvasRef.current?.syncRadiusTargetsFromLayout(layout);
        },
        onProbabilityStateUpdate: (probState, meta) => {
          probabilityStateRef.current = probState;
          if (meta?.advancingThirdGroups) {
            advancingThirdGroupsRef.current = meta.advancingThirdGroups;
          }
          onProbabilityStateUpdate?.({
            state: probState,
            groupResults: groupResultsRef.current,
            knockoutResults: knockoutResultsRef.current,
            advancingThirdGroups: advancingThirdGroupsRef.current,
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
      { startDay, initialState, resume },
    );

    const runState = await simulationRunRef.current;
    if (checkpointRef.current) {
      checkpointRef.current = { ...checkpointRef.current, runState };
    }
  }, [
    onSimulatingChange,
    onSessionComplete,
    onProbabilityStateUpdate,
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
        starredTeamIds={starredTeamIds}
        onTeamClick={onTeamClick}
      />
    </section>
  );
  }),
);
