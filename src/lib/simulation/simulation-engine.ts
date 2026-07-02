import { getTimelineDays } from "@/lib/tournament";
import type { AnimationParams } from "@/lib/simulation/animation-params";
import { createSeededRng } from "@/lib/simulation/animation-params";
import { buildSimulationBootstrap } from "@/lib/simulation/advancement";
import {
  scheduleMatchBatches,
  resolveGroupMatchesForDay,
  resolveKnockoutMatchesForDay,
} from "@/lib/simulation/bracket-resolver";
import { buildBracketState } from "@/lib/simulation/bracket-state";
import {
  applyGroupStageCut,
  applyKnownMatchResult,
  finalizeKnockoutDay,
  recomputeTournamentProbabilities,
  resolveMatchWinnerOnly,
  toVizFeed,
} from "@/lib/probability";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
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
      if (shouldAbort() || Date.now() - start >= ms) {
        resolve();
        return;
      }
      setTimeout(tick, 16);
    };
    setTimeout(tick, 16);
  });
}

function emitProbabilityUpdate(
  state: SimulationRunState,
  callbacks: SimulationCallbacks,
): void {
  const feed = toVizFeed(state.probability, state.day);
  callbacks.onProbabilitiesUpdate(feed.probabilities);
  if (feed.lastDeltas && callbacks.onProbabilityDeltas) {
    callbacks.onProbabilityDeltas(feed.lastDeltas);
  }
  callbacks.onProbabilityStateUpdate?.(state.probability, {
    advancingThirdGroups: state.advancingThirdGroups,
  });
}

export type SimulationOptions = {
  startDay: number;
  stopAfterDay?: number;
  groupStageOnly?: boolean;
  initialState?: SimulationRunState;
  resume?: boolean;
};

export async function runSimulation(
  params: AnimationParams,
  callbacks: SimulationCallbacks,
  options: SimulationOptions,
): Promise<SimulationRunState> {
  const state =
    options.initialState ?? buildSimulationBootstrap(options.startDay).runState;
  const timelineStartDay = options.initialState?.day ?? options.startDay;
  let rngState = options.initialState?.rngState ?? (params.simulationSeed || 1);
  const rng = () => {
    rngState = (rngState * 48271) % 0x7fffffff;
    return rngState / 0x7fffffff;
  };
  const config = params.probabilityConfig;
  const timelineDays = getTimelineDays().filter((entry) => entry.day >= timelineStartDay);

  if (!options.resume) {
    emitProbabilityUpdate(state, callbacks);
    callbacks.onBracketStateChange(
      buildBracketState(
        state.day,
        state.results,
        state.groupResults,
        state.probability.eliminated,
        { advancingThirdGroups: state.advancingThirdGroups },
      ),
    );
  }

  for (const entry of timelineDays) {
    if (callbacks.shouldAbort()) break;

    state.day = entry.day;
    callbacks.onDayChange(entry.day);
    callbacks.onBracketStateChange(
      buildBracketState(
        entry.day,
        state.results,
        state.groupResults,
        state.probability.eliminated,
        { advancingThirdGroups: state.advancingThirdGroups },
      ),
    );
    if (entry.day === 12 && timelineStartDay <= 12 && !state.advancingThirdGroups) {
      const beforeEliminated = new Set(state.probability.eliminated);
      const standings = buildStandingsFromGroupResults(state.groupResults);
      const thirdRng = createSeededRng(params.simulationSeed + 12);
      state.advancingThirdGroups = selectAdvancingThirdPlaceGroups(standings, thirdRng);
      state.probability = applyGroupStageCut(
        state.probability,
        state.groupResults,
        state.results,
        config,
        state.advancingThirdGroups,
      );

      const toEliminate = [...state.probability.eliminated].filter(
        (id) => !beforeEliminated.has(id),
      );

      emitProbabilityUpdate(state, callbacks);
      callbacks.onBracketStateChange(
        buildBracketState(
          entry.day,
          state.results,
          state.groupResults,
          state.probability.eliminated,
          { advancingThirdGroups: state.advancingThirdGroups },
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
            state.probability.eliminated,
            state.advancingThirdGroups,
          );

    const batches = scheduleMatchBatches(entry.day, dayMatches);
    let hadKnockoutOnDay = false;

    for (const batch of batches) {
      if (callbacks.shouldAbort()) break;

      const events: { match: (typeof batch)[number]; event: CollisionEvent }[] = [];

      for (const match of batch) {
        const homeElo = state.probability.eloRatings[match.home] ?? 1500;
        const awayElo = state.probability.eloRatings[match.away] ?? 1500;
        const winnerId = resolveMatchWinnerOnly(state.probability, match, config, rng);
        state.probability = applyKnownMatchResult(
          state.probability,
          match,
          winnerId,
          state.groupResults,
          state.results,
          config,
        );

        const loser = winnerId === match.home ? match.away : match.home;
        const result: SimMatchResult = {
          matchId: match.matchId,
          stage: match.stage,
          day: match.day,
          home: match.home,
          away: match.away,
          winner: winnerId,
        };

        state.results.push(result);
        if (match.stage === "group") {
          state.groupResults.push(result);
        } else {
          hadKnockoutOnDay = true;
        }

        events.push({
          match,
          event: {
            matchId: match.matchId,
            stage: match.stage,
            day: match.day,
            home: match.home,
            away: match.away,
            winner: winnerId,
            loser,
            isKnockout: match.stage !== "group",
            homeElo,
            awayElo,
          },
        });
      }

      const recomputePromise = Promise.resolve().then(() =>
        recomputeTournamentProbabilities(
          state.probability,
          state.groupResults,
          state.results,
          entry.day,
        ),
      );

      await Promise.all([
        ...events.map(({ event }) => callbacks.onCollision(event)),
        recomputePromise,
      ]);

      state.probability = await recomputePromise;
      if (callbacks.shouldAbort()) break;

      for (const { event } of events) {

        emitProbabilityUpdate(state, callbacks);
        callbacks.onBracketStateChange(
          buildBracketState(
            entry.day,
            state.results,
            state.groupResults,
            state.probability.eliminated,
            { advancingThirdGroups: state.advancingThirdGroups },
          ),
        );

        if (callbacks.onMatchResolved) {
          await callbacks.onMatchResolved(event, state.groupResults);
        }
        if (callbacks.shouldAbort()) break;
      }

      if (callbacks.shouldAbort()) break;

      await delay(params.batchPauseMs, callbacks.shouldAbort);
    }

    if (hadKnockoutOnDay && entry.day >= 12 && config.knockoutRecomputeTrigger === "each_knockout_day") {
      state.probability = finalizeKnockoutDay(
        state.probability,
        state.groupResults,
        state.results,
        config,
        entry.day,
      );
      emitProbabilityUpdate(state, callbacks);
    }

    if (options.stopAfterDay !== undefined && entry.day >= options.stopAfterDay) {
      break;
    }
  }

  if (!callbacks.shouldAbort()) {
    callbacks.onComplete(state);
  }

  state.rngState = rngState;
  return state;
}
