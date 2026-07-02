"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";
import {
  getDayRange,
  getLatestDropdownStartDay,
  getSnapshotByDay,
  getTeams,
  isDropdownStartDay,
} from "@/lib/tournament";
import { SimulationPill } from "@/components/simulation-pill";
import { MatchSpotlightBar } from "@/components/match-spotlight-bar";
import { StarredTeamsSummaryPill } from "@/components/starred-teams-summary-pill";
import { TournamentWinnerSpotlight } from "@/components/tournament-winner-spotlight";
import {
  DEFAULT_PETAL_CONFIG,
  getMatchHoldDurationMs,
} from "@/components/viz/petal/petal-config";
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
import { FifaBackgroundTitle } from "@/components/fifa-background-title";
import { useStarredTeamsStore } from "@/stores/starred-teams-store";
import type { TimelineDayPickerMode } from "@/components/timeline";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const [playFromDay, setPlayFromDay] = useState(min);
  const [sessionPhase, setSessionPhase] = useState<SimulationSessionPhase>("idle");
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [liveProbabilityState, setLiveProbabilityState] = useState<ProbabilityState | null>(
    null,
  );
  const [liveGroupResults, setLiveGroupResults] = useState<SimMatchResult[]>([]);
  const [liveKnockoutResults, setLiveKnockoutResults] = useState<SimMatchResult[]>([]);
  const [liveAdvancingThirdGroups, setLiveAdvancingThirdGroups] = useState<string[] | undefined>(
    undefined,
  );
  const [activeMatches, setActiveMatches] = useState<CollisionEvent[]>([]);
  const [structureOpen, setStructureOpen] = useState(false);
  const starredTeamIds = useStarredTeamsStore((s) => s.starredTeamIds);
  const toggleStar = useStarredTeamsStore((s) => s.toggleStar);
  const unstar = useStarredTeamsStore((s) => s.unstar);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const petalVizRef = useRef<PetalSimulationVisualizationRef>(null);
  const sessionPhaseRef = useRef<SimulationSessionPhase>("idle");

  const setSessionPhaseSync = (phase: SimulationSessionPhase) => {
    sessionPhaseRef.current = phase;
    setSessionPhase(phase);
  };

  const pickerDay = sessionPhase === "completed" ? playFromDay : day;

  const pickerMode: TimelineDayPickerMode =
    sessionPhase === "running"
      ? "inline-animated"
      : sessionPhase === "paused"
        ? "inline-static"
        : "dropdown";

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

  const tournamentStructure = useMemo(() => {
    const groupResults =
      sessionPhase === "idle"
        ? getScriptedResultsUpToDay(day).filter((r) => r.stage === "group")
        : liveGroupResults;
    const knockoutResults =
      sessionPhase === "idle"
        ? getScriptedResultsUpToDay(day).filter((r) => r.stage !== "group")
        : liveKnockoutResults;

    return buildTournamentStructureView(day, groupResults, knockoutResults, {
      eloRatings: structureEloRatings,
      advancingThirdGroups: liveAdvancingThirdGroups,
    });
  }, [day, sessionPhase, liveGroupResults, liveKnockoutResults, structureEloRatings, liveAdvancingThirdGroups]);

  useEffect(() => {
    if (sessionPhase === "running" || sessionPhase === "paused" || sessionPhase === "completed") {
      return;
    }
    if (!isDropdownStartDay(day)) {
      setDay(getLatestDropdownStartDay());
    }
  }, [day, sessionPhase]);

  useEffect(() => {
    for (const id of starredTeamIds) {
      if (tournamentStructure.eliminatedTeamIds.has(id)) {
        unstar(id);
      }
    }
  }, [tournamentStructure.eliminatedTeamIds, starredTeamIds, unstar]);

  const handleTeamClick = useCallback(
    (teamId: string) => {
      toggleStar(teamId);
    },
    [toggleStar],
  );

  const handlePlay = useCallback(async () => {
    setPlayFromDay(day);
    await petalVizRef.current?.startSimulation();
  }, [day]);

  const handlePlayAgain = useCallback(async () => {
    setWinnerId(null);
    setDay(playFromDay);
    await petalVizRef.current?.resetSimulation(playFromDay);
    await petalVizRef.current?.startSimulation();
  }, [playFromDay]);

  const handlePause = useCallback(async () => {
    setSessionPhaseSync("paused");
    await petalVizRef.current?.stopSimulation();
  }, []);

  const handleContinue = useCallback(async () => {
    await petalVizRef.current?.startSimulation();
  }, []);

  const resetToPreTournament = useCallback(() => {
    setSessionPhaseSync("idle");
    setWinnerId(null);
    setLiveProbabilityState(null);
    setLiveGroupResults([]);
    setLiveKnockoutResults([]);
    setLiveAdvancingThirdGroups(undefined);
    setDay(PRE_TOURNAMENT_DAY);
    setPlayFromDay(PRE_TOURNAMENT_DAY);
    petalVizRef.current?.resetSimulation(PRE_TOURNAMENT_DAY);
  }, []);

  const handleGoBackToStart = useCallback(() => {
    resetToPreTournament();
  }, [resetToPreTournament]);

  const handlePickerDayChange = useCallback((newDay: number) => {
    const phase = sessionPhaseRef.current;
    if (phase === "running" || phase === "paused") {
      return;
    }
    if (phase === "completed") {
      setPlayFromDay(newDay);
      return;
    }
    setSessionPhaseSync("idle");
    setLiveProbabilityState(null);
    setLiveGroupResults([]);
    setLiveKnockoutResults([]);
    setLiveAdvancingThirdGroups(undefined);
    setDay(newDay);
    setPlayFromDay(newDay);
    petalVizRef.current?.resetSimulation(newDay);
  }, []);

  const handleSimDayChange = useCallback((newDay: number) => {
    setDay(newDay);
  }, []);

  const handleSimulatingChange = useCallback((simulating: boolean) => {
    if (simulating) {
      setSessionPhaseSync("running");
    }
  }, []);

  const handleSessionComplete = useCallback((completedWinnerId: string) => {
    setWinnerId(completedWinnerId);
    setSessionPhaseSync("completed");
  }, []);

  const handleProbabilityStateUpdate = useCallback(
    ({
      state,
      groupResults,
      knockoutResults,
      advancingThirdGroups,
    }: {
      state: ProbabilityState;
      groupResults: SimMatchResult[];
      knockoutResults: SimMatchResult[];
      advancingThirdGroups?: string[];
    }) => {
      setLiveProbabilityState(state);
      setLiveGroupResults(groupResults);
      setLiveKnockoutResults(knockoutResults);
      setLiveAdvancingThirdGroups(advancingThirdGroups);
    },
    [],
  );

  const handleTournamentStructureClick = useCallback(() => {
    setStructureOpen((open) => !open);
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full max-md:min-h-dvh">
      <FifaBackgroundTitle />
      <div className="relative z-10 flex h-full min-h-0 flex-row gap-4 bg-transparent">
        <div className="relative min-h-0 min-w-0 flex-1 bg-transparent">
          <PetalSimulationVisualization
            ref={petalVizRef}
            teams={teams}
            snapshot={snapshot}
            sessionPhase={sessionPhase}
            onSimulatingChange={handleSimulatingChange}
            onSessionComplete={handleSessionComplete}
            onDayChange={handleSimDayChange}
            onProbabilityStateUpdate={handleProbabilityStateUpdate}
            onActiveMatchesChange={setActiveMatches}
            starredTeamIds={starredTeamIds}
            onTeamClick={handleTeamClick}
          />
        </div>
        <TournamentStructureDrawer
          open={structureOpen}
          onClose={() => setStructureOpen(false)}
          structure={tournamentStructure}
          teamsById={teamsById}
          day={day}
          pickerDay={pickerDay}
          pickerMode={pickerMode}
          onPickerDayChange={handlePickerDayChange}
          activeMatches={activeMatches}
        />
      </div>
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4 ${structureOpen ? "max-md:hidden" : ""}`}
      >
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          {activeMatches.length > 0 ? (
            <MatchSpotlightBar
              matches={activeMatches}
              teamsById={teamsById}
              holdDurationMs={getMatchHoldDurationMs(
                DEFAULT_PETAL_CONFIG,
                activeMatches.some((match) => match.isKnockout),
              )}
            />
          ) : null}
          {sessionPhase === "completed" && winnerId ? (
            <TournamentWinnerSpotlight winnerId={winnerId} teamsById={teamsById} />
          ) : null}
          <div className="pointer-events-auto flex max-w-[90vw] flex-col items-center gap-2">
            <StarredTeamsSummaryPill
              starredTeamIds={starredTeamIds}
              day={day}
              sessionPhase={sessionPhase}
              liveState={liveProbabilityState}
              snapshot={snapshot}
            />
            <div className="w-full max-w-full md:w-max md:max-w-none">
              <SimulationPill
                pickerDay={pickerDay}
                onPickerDayChange={handlePickerDayChange}
                sessionPhase={sessionPhase}
                onPlay={handlePlay}
                onPlayAgain={handlePlayAgain}
                onPause={handlePause}
                onContinue={handleContinue}
                onGoBackToStart={handleGoBackToStart}
                onTournamentStructureClick={handleTournamentStructureClick}
                tournamentStructureOpen={structureOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
