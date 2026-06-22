"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDayRange,
  getLatestSimStartDay,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { measurePillReserve } from "@/lib/viz-layout";
import { SimulationPill } from "@/components/simulation-pill";
import { MatchSpotlightBar } from "@/components/match-spotlight-bar";
import { DEFAULT_PETAL_CONFIG } from "@/components/viz/petal/petal-config";
import { teamsById } from "@/data/teams";
import {
  DebugToggleButton,
  ProbabilityDebugPanel,
} from "@/components/probability-debug-panel";
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

const isDev = process.env.NODE_ENV === "development";

export function TournamentView() {
  const { min } = getDayRange();
  const latestSimStartDay = getLatestSimStartDay();
  const teams = getTeams();
  const [day, setDay] = useState(latestSimStartDay);
  const [sessionPhase, setSessionPhase] = useState<SimulationSessionPhase>("idle");
  const [pillReserve, setPillReserve] = useState(0);
  const [pillWidth, setPillWidth] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);
  const [liveProbabilityState, setLiveProbabilityState] = useState<ProbabilityState | null>(
    null,
  );
  const [liveGroupResults, setLiveGroupResults] = useState<SimMatchResult[]>([]);
  const [liveKnockoutResults, setLiveKnockoutResults] = useState<SimMatchResult[]>([]);
  const [activeMatches, setActiveMatches] = useState<CollisionEvent[]>([]);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const idleReplay = useMemo(() => {
    if (!isDev || !debugOpen || sessionPhase !== "idle") return null;
    const rng = createSeededRng(42 + day);
    return replayTournamentToDay(day, rng, DEFAULT_PROBABILITY_CONFIG);
  }, [debugOpen, sessionPhase, day]);

  const debugProbabilityState = isDev
    ? sessionPhase === "idle"
      ? (idleReplay?.probability ?? null)
      : liveProbabilityState
    : null;

  const debugGroupResults = isDev
    ? sessionPhase === "idle"
      ? (idleReplay?.groupResults ??
        getScriptedResultsUpToDay(day).filter((r) => r.stage === "group"))
      : liveGroupResults
    : [];

  const debugKnockoutResults = isDev
    ? sessionPhase === "idle"
      ? (idleReplay?.knockoutResults ??
        getScriptedResultsUpToDay(day).filter((r) => r.stage !== "group"))
      : liveKnockoutResults
    : [];

  const debugMethod: "opening" | "bracket_analytical" = isDev
    ? day === 0 && debugGroupResults.length === 0
      ? "opening"
      : "bracket_analytical"
    : "opening";

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const updateReserve = () => {
      const rect = pill.getBoundingClientRect();
      setPillReserve(measurePillReserve(pill));
      setPillWidth(rect.width);
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
    setDay(latestSimStartDay);
    setSessionPhase("idle");
    setLiveProbabilityState(null);
    setLiveGroupResults([]);
    setLiveKnockoutResults([]);
    petalVizRef.current?.resetSimulation(latestSimStartDay);
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
        className="relative min-h-0 w-full"
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
          onProbabilityStateUpdate={({ state, groupResults, knockoutResults }) => {
            setLiveProbabilityState(state);
            setLiveGroupResults(groupResults);
            setLiveKnockoutResults(knockoutResults);
          }}
          onActiveMatchesChange={setActiveMatches}
        />
        {isDev ? (
          <>
            <div className="absolute right-4 top-4 z-40">
              <DebugToggleButton open={debugOpen} onToggle={() => setDebugOpen((v) => !v)} />
            </div>
            <ProbabilityDebugPanel
              open={debugOpen}
              onClose={() => setDebugOpen(false)}
              day={day}
              probabilityState={debugProbabilityState}
              groupResults={debugGroupResults}
              knockoutResults={debugKnockoutResults}
              method={debugMethod}
            />
          </>
        ) : null}
      </div>
      {activeMatches.length > 0 ? (
        <div
          className="pointer-events-none fixed left-1/2 z-40 -translate-x-1/2"
          style={{ bottom: pillReserve + 8, width: pillWidth || undefined }}
        >
          <MatchSpotlightBar
            matches={activeMatches}
            teamsById={teamsById}
            holdDurationMs={DEFAULT_PETAL_CONFIG.matchHoldDurationMs}
          />
        </div>
      ) : null}
      <div
        ref={stackRef}
        className="fixed bottom-4 left-1/2 z-50 w-max max-w-[40vw] -translate-x-1/2"
      >
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
    </div>
  );
}
