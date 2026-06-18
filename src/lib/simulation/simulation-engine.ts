import { getTimelineDays } from "@/lib/tournament";
import type { AnimationParams } from "@/lib/simulation/animation-params";
import { createSeededRng } from "@/lib/simulation/animation-params";
import {
  buildInitialProbabilities,
  buildInitialRawWeights,
  buildSimulationBootstrap,
  getAdvancingTeamIds,
} from "@/lib/simulation/advancement";
import {
  scheduleMatchBatches,
  resolveGroupMatchesForDay,
  resolveKnockoutMatchesForDay,
} from "@/lib/simulation/bracket-resolver";
import { buildBracketState } from "@/lib/simulation/bracket-state";
import type {
  CollisionEvent,
  SimulationCallbacks,
  SimulationRunState,
  SimMatchResult,
} from "@/lib/simulation/types";

function delay(ms: number, shouldAbort: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (shouldAbort()) {
        resolve();
        return;
      }
      if (Date.now() - start >= ms) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function normalizeProbabilities(
  rawWeights: Record<string, number>,
  eliminated: Set<string>,
): Record<string, number> {
  let total = 0;
  for (const [teamId, weight] of Object.entries(rawWeights)) {
    if (eliminated.has(teamId) || weight <= 0) continue;
    total += weight;
  }

  const probs: Record<string, number> = {};
  for (const teamId of Object.keys(rawWeights)) {
    if (eliminated.has(teamId) || rawWeights[teamId] <= 0 || total === 0) {
      probs[teamId] = 0;
    } else {
      probs[teamId] = Number(((rawWeights[teamId] / total) * 100).toFixed(2));
    }
  }
  return probs;
}

function pickWinner(
  home: string,
  away: string,
  probabilities: Record<string, number>,
  rng: () => number,
): string {
  const homeProb = probabilities[home] ?? 0;
  const awayProb = probabilities[away] ?? 0;
  const total = homeProb + awayProb;
  if (total <= 0) return rng() < 0.5 ? home : away;
  return rng() < homeProb / total ? home : away;
}

function applyMatchOutcome(
  state: SimulationRunState,
  winner: string,
  loser: string,
  params: AnimationParams,
): void {
  state.rawWeights[winner] = (state.rawWeights[winner] ?? 1) * params.winnerBoost;
  state.rawWeights[loser] = (state.rawWeights[loser] ?? 1) * params.loserPenalty;
  state.probabilities = normalizeProbabilities(state.rawWeights, state.eliminated);
}

export function createInitialRunState(): SimulationRunState {
  return {
    day: 0,
    probabilities: buildInitialProbabilities(),
    rawWeights: buildInitialRawWeights(),
    eliminated: new Set(),
    results: [],
    groupResults: [],
  };
}

export type SimulationOptions = {
  startDay: number;
  stopAfterDay?: number;
  groupStageOnly?: boolean;
};

export async function runSimulation(
  params: AnimationParams,
  callbacks: SimulationCallbacks,
  options: SimulationOptions,
): Promise<SimulationRunState> {
  const state = buildSimulationBootstrap(options.startDay).runState;
  const rng = createSeededRng(params.simulationSeed);
  const timelineDays = getTimelineDays().filter((entry) => entry.day >= options.startDay);

  callbacks.onProbabilitiesUpdate({ ...state.probabilities });
  callbacks.onBracketStateChange(
    buildBracketState(
      state.day,
      state.results,
      state.groupResults,
      state.eliminated,
    ),
  );

  for (const entry of timelineDays) {
    if (callbacks.shouldAbort()) break;

    state.day = entry.day;
    callbacks.onDayChange(entry.day);
    callbacks.onBracketStateChange(
      buildBracketState(
        entry.day,
        state.results,
        state.groupResults,
        state.eliminated,
      ),
    );
    await delay(params.dayPauseMs, callbacks.shouldAbort);
    if (callbacks.shouldAbort()) break;

    if (entry.day === 12 && options.startDay <= 12) {
      const advancing = getAdvancingTeamIds(state.groupResults);
      const toEliminate: string[] = [];

      for (const teamId of Object.keys(state.rawWeights)) {
        if (!advancing.has(teamId) && !state.eliminated.has(teamId)) {
          state.eliminated.add(teamId);
          state.rawWeights[teamId] = 0;
          toEliminate.push(teamId);
        }
      }

      state.probabilities = normalizeProbabilities(state.rawWeights, state.eliminated);
      callbacks.onProbabilitiesUpdate({ ...state.probabilities });
      callbacks.onBracketStateChange(
        buildBracketState(
          entry.day,
          state.results,
          state.groupResults,
          state.eliminated,
        ),
      );

      if (toEliminate.length > 0) {
        await callbacks.onEliminations({ teamIds: toEliminate });
      }
      if (callbacks.shouldAbort()) break;
    }

    const dayMatches = options.groupStageOnly
      ? entry.day < 12
        ? resolveGroupMatchesForDay(entry.day, state.groupResults)
        : []
      : entry.day < 12
        ? resolveGroupMatchesForDay(entry.day, state.groupResults)
        : resolveKnockoutMatchesForDay(
            entry.day,
            state.results,
            state.groupResults,
            state.eliminated,
          );

    const batches = scheduleMatchBatches(entry.day, dayMatches);

    for (const batch of batches) {
      if (callbacks.shouldAbort()) break;

      const events = batch.map((match) => {
        const winner = pickWinner(match.home, match.away, state.probabilities, rng);
        const loser = winner === match.home ? match.away : match.home;
        return {
          match,
          event: {
            matchId: match.matchId,
            stage: match.stage,
            day: match.day,
            home: match.home,
            away: match.away,
            winner,
            loser,
            isKnockout: match.stage !== "group",
          } satisfies CollisionEvent,
        };
      });

      await Promise.all(events.map(({ event }) => callbacks.onCollision(event)));

      for (const { match, event } of events) {
        const result: SimMatchResult = {
          matchId: match.matchId,
          stage: match.stage,
          day: match.day,
          home: match.home,
          away: match.away,
          winner: event.winner,
        };

        state.results.push(result);
        if (match.stage === "group") {
          state.groupResults.push(result);
        }

        applyMatchOutcome(state, event.winner, event.loser, params);

        if (event.isKnockout) {
          state.eliminated.add(event.loser);
          state.rawWeights[event.loser] = 0;
          state.probabilities = normalizeProbabilities(state.rawWeights, state.eliminated);
        } else {
          state.probabilities = normalizeProbabilities(state.rawWeights, state.eliminated);
        }

        callbacks.onProbabilitiesUpdate({ ...state.probabilities });
        callbacks.onBracketStateChange(
          buildBracketState(
            entry.day,
            state.results,
            state.groupResults,
            state.eliminated,
          ),
        );

        if (callbacks.onMatchResolved) {
          await callbacks.onMatchResolved(event, state.groupResults);
        }
      }

      await delay(params.batchPauseMs, callbacks.shouldAbort);
    }

    if (options.stopAfterDay !== undefined && entry.day >= options.stopAfterDay) {
      break;
    }
  }

  if (!callbacks.shouldAbort()) {
    callbacks.onComplete(state);
  }

  return state;
}
