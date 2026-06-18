import type { Match, Snapshot } from "@/types";
import { teams } from "@/data/teams";
import { matches } from "@/data/matches";
import { snapshotsByDay } from "@/data/snapshots";
import { computeGroupStandings, type StandingRow } from "@/lib/standings";
import type { SimMatchResult, SimulationRunState } from "@/lib/simulation/types";

export type SimulationBootstrap = {
  runState: SimulationRunState;
  standings: Record<string, StandingRow[]>;
  bracketDepths: Record<string, number>;
  probabilities: Record<string, number>;
  eliminated: Set<string>;
};

export function canStartSimulationFromDay(_day: number): boolean {
  return true;
}

export function simResultToMatch(result: SimMatchResult): Match {
  return {
    id: result.matchId,
    stage: result.stage,
    day: result.day,
    home: result.home,
    away: result.away,
    homeScore: result.winner === result.home ? 2 : 1,
    awayScore: result.winner === result.away ? 2 : 1,
    winner: result.winner,
  };
}

export function getAdvancingTeamIds(groupResults: SimMatchResult[]): Set<string> {
  const groupMatches = groupResults.map(simResultToMatch);
  const standings = computeGroupStandings(groupMatches);
  const advancing = new Set<string>();
  const thirdPlace: { teamId: string; points: number; gd: number }[] = [];

  for (const group of Object.keys(standings).sort()) {
    const table = standings[group];
    advancing.add(table[0].teamId);
    advancing.add(table[1].teamId);
    thirdPlace.push(table[2]);
  }

  thirdPlace
    .sort((a, b) => b.points - a.points || b.gd - a.gd)
    .slice(0, 8)
    .forEach((entry) => advancing.add(entry.teamId));

  return advancing;
}

export function buildStandingsFromGroupResults(
  groupResults: SimMatchResult[],
): Record<string, StandingRow[]> {
  return computeGroupStandings(groupResults.map(simResultToMatch));
}

export function rankingToPrior(rank: number): number {
  return Math.max(0.3, (50 - rank) * 0.35);
}

export function buildInitialProbabilities(): Record<string, number> {
  const raw: Record<string, number> = {};
  let total = 0;

  for (const team of teams) {
    raw[team.id] = rankingToPrior(team.fifaRanking);
    total += raw[team.id];
  }

  const probs: Record<string, number> = {};
  for (const team of teams) {
    probs[team.id] = Number(((raw[team.id] / total) * 100).toFixed(2));
  }
  return probs;
}

export function buildInitialRawWeights(): Record<string, number> {
  return Object.fromEntries(
    teams.map((team) => [team.id, rankingToPrior(team.fifaRanking)]),
  );
}

function matchToSimResult(match: Match): SimMatchResult | null {
  if (!match.winner) return null;
  return {
    matchId: match.id,
    stage: match.stage,
    day: match.day,
    home: match.home,
    away: match.away,
    winner: match.winner,
  };
}

export function getScriptedResultsBeforeDay(startDay: number): SimMatchResult[] {
  return matches
    .filter((match) => match.day < startDay && match.winner)
    .map(matchToSimResult)
    .filter((result): result is SimMatchResult => result !== null);
}

export function getEliminatedBeforeDay(startDay: number): Set<string> {
  const eliminated = new Set<string>();

  if (startDay > 12) {
    const groupResults = getScriptedResultsBeforeDay(startDay).filter(
      (r) => r.stage === "group",
    );
    const advancing = getAdvancingTeamIds(groupResults);
    for (const team of teams) {
      if (!advancing.has(team.id)) {
        eliminated.add(team.id);
      }
    }
  }

  for (const match of matches) {
    if (
      match.day >= startDay ||
      !match.winner ||
      match.stage === "group"
    ) {
      continue;
    }
    const loser = match.winner === match.home ? match.away : match.home;
    eliminated.add(loser);
  }

  return eliminated;
}

export function buildSimulationBootstrap(startDay: number): SimulationBootstrap {
  const scripted = getScriptedResultsBeforeDay(startDay);
  const eliminated = getEliminatedBeforeDay(startDay);
  const groupResults = scripted.filter((r) => r.stage === "group");
  const knockoutResults = scripted.filter((r) => r.stage !== "group");

  const priorDay = Math.max(0, startDay - 1);
  const priorSnapshot = snapshotsByDay[priorDay] ?? snapshotsByDay[0]!;
  const probabilities = { ...priorSnapshot.probabilities };
  const bracketDepths = priorSnapshot.bracketDepths ?? {};

  const rawWeights: Record<string, number> = {};
  for (const team of teams) {
    const prob = probabilities[team.id] ?? 0;
    rawWeights[team.id] = eliminated.has(team.id) || prob === 0 ? 0 : prob;
  }

  const runState: SimulationRunState = {
    day: startDay,
    probabilities: { ...probabilities },
    rawWeights,
    eliminated: new Set(eliminated),
    results: [...knockoutResults],
    groupResults: [...groupResults],
  };

  return {
    runState,
    standings: buildStandingsFromGroupResults(groupResults),
    bracketDepths,
    probabilities,
    eliminated: new Set(eliminated),
  };
}

export function createRunStateFromSnapshot(
  _snapshot: Snapshot,
  startDay: number,
): SimulationRunState {
  return buildSimulationBootstrap(startDay).runState;
}
