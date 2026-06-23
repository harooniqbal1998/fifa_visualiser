"use client";

import { useMemo, useRef, useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { SimulationPill } from "@/components/simulation-pill";
import { MatchSpotlightBar } from "@/components/match-spotlight-bar";
import { DEFAULT_PETAL_CONFIG } from "@/components/viz/petal/petal-config";
import { teamsById } from "@/data/teams";
import {
  PetalSimulationVisualization,
  type PetalSimulationVisualizationRef,
  type SimulationSessionPhase,
} from "@/components/viz/petal/petal-simulation-visualization";
import { replayTournamentToDay } from "@/lib/probability/replay-tournament";
import { createSeededRng } from "@/lib/simulation/animation-params";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";
import type { ProbabilityState } from "@/lib/probability/types";
import type { CollisionEvent, SimMatchResult } from "@/lib/simulation/types";
import { getScriptedResultsUpToDay } from "@/lib/simulation/advancement";
import { buildTournamentStructureView } from "@/lib/tournament-structure";
import { TournamentStructureDrawer } from "@/components/tournament-structure-drawer";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [sessionPhase, setSessionPhase] = useState<SimulationSessionPhase>("idle");
  const [liveProbabilityState, setLiveProbabilityState] = useState<ProbabilityState | null>(
    null,
  );
  const [liveGroupResults, setLiveGroupResults] = useState<SimMatchResult[]>([]);
  const [liveKnockoutResults, setLiveKnockoutResults] = useState<SimMatchResult[]>([]);
  const [activeMatches, setActiveMatches] = useState<CollisionEvent[]>([]);
  const [structureOpen, setStructureOpen] = useState(false);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);

  const structureGroupResults =
    sessionPhase === "idle"
      ? getScriptedResultsUpToDay(day).filter((r) => r.stage === "group")
      : liveGroupResults;

  const structureKnockoutResults =
    sessionPhase === "idle"
      ? getScriptedResultsUpToDay(day).filter((r) => r.stage !== "group")
      : liveKnockoutResults;

  const structureEloRatings = useMemo(() => {
    const replayElo = replayTournamentToDay(
      day,
      createSeededRng(42 + day),
      DEFAULT_PROBABILITY_CONFIG,
    ).probability.eloRatings;

    if (sessionPhase === "idle") {
      return replayElo;
    }

    return liveProbabilityState?.eloRatings ?? replayElo;
  }, [sessionPhase, day, liveProbabilityState]);

  const tournamentStructure = useMemo(
    () =>
      buildTournamentStructureView(day, structureGroupResults, structureKnockoutResults, {
        eloRatings: structureEloRatings,
      }),
    [day, structureGroupResults, structureKnockoutResults, structureEloRatings],
  );

  const handlePlay = () => {
    petalVizRef.current?.startSimulation();
  };

  const handleStop = () => {
    petalVizRef.current?.stopSimulation();
    setSessionPhase("frozen");
  };

  const handleRestart = () => {
    setSessionPhase("idle");
    setLiveProbabilityState(null);
    setLiveGroupResults([]);
    setLiveKnockoutResults([]);
    petalVizRef.current?.resetSimulation(day);
  };

  const handleDayChange = (newDay: number) => {
    if (sessionPhase !== "running") {
      setSessionPhase("idle");
      setLiveProbabilityState(null);
      setLiveGroupResults([]);
      setLiveKnockoutResults([]);
      setDay(newDay);
      petalVizRef.current?.resetSimulation(newDay);
      return;
    }
    setDay(newDay);
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
      <div className="relative flex h-full min-h-0 flex-row gap-4">
        <div className="relative min-h-0 min-w-0 flex-1">
          <PetalSimulationVisualization
            ref={petalVizRef}
            teams={teams}
            snapshot={snapshot}
            sessionPhase={sessionPhase}
            onSimulatingChange={handleSimulatingChange}
            onSessionComplete={handleSessionComplete}
            onDayChange={handleDayChange}
            onProbabilityStateUpdate={({ state, groupResults, knockoutResults }) => {
              setLiveProbabilityState(state);
              setLiveGroupResults(groupResults);
              setLiveKnockoutResults(knockoutResults);
            }}
            onActiveMatchesChange={setActiveMatches}
          />
        </div>
        <TournamentStructureDrawer
          open={structureOpen}
          structure={tournamentStructure}
          teamsById={teamsById}
          day={day}
          activeMatches={activeMatches}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          {activeMatches.length > 0 ? (
            <MatchSpotlightBar
              matches={activeMatches}
              teamsById={teamsById}
              holdDurationMs={DEFAULT_PETAL_CONFIG.matchHoldDurationMs}
            />
          ) : null}
          <div className="pointer-events-auto w-max max-w-[40vw]">
            <SimulationPill
              day={day}
              onDayChange={handleDayChange}
              sessionPhase={sessionPhase}
              onPlay={handlePlay}
              onStop={handleStop}
              onRestart={handleRestart}
              onTournamentStructureClick={() => setStructureOpen((open) => !open)}
              tournamentStructureOpen={structureOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
