import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTimelineDays } from "@/lib/tournament";
import {
  resolveGroupMatchesForDay,
  resolveKnockoutMatchesForDay,
} from "@/lib/simulation/bracket-resolver";
import { buildSimulationBootstrap } from "@/lib/simulation/advancement";
import { runSimulation } from "@/lib/simulation/simulation-engine";
import { DEFAULT_ANIMATION_PARAMS } from "@/lib/simulation/animation-params";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";
import { applyGroupStageCut } from "@/lib/probability";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";

(globalThis as { requestAnimationFrame?: (cb: FrameRequestCallback) => number }).requestAnimationFrame =
  (cb) => setTimeout(() => cb(Date.now()), 0) as unknown as number;

describe("runSimulation from pre-tournament", () => {
  it("plays knockout matches after group stage", async () => {
    const knockoutMatchIds: string[] = [];
    let finalDay = 0;

    await runSimulation(
      { ...DEFAULT_ANIMATION_PARAMS, simulationSeed: 42, dayPauseMs: 0, batchPauseMs: 0 },
      {
        onDayChange: () => {},
        onCollision: async (event) => {
          if (event.isKnockout) knockoutMatchIds.push(event.matchId);
        },
        onMatchResolved: async () => {},
        onEliminations: async () => {},
        onProbabilitiesUpdate: () => {},
        onBracketStateChange: () => {},
        onComplete: (state) => {
          finalDay = state.day;
        },
        shouldAbort: () => false,
      },
      { startDay: 0 },
    );

    assert.ok(knockoutMatchIds.length > 0, "expected knockout matches to be simulated");
    assert.ok(finalDay >= 13, `expected simulation to reach knockout days, got day ${finalDay}`);
  });
});

describe("knockout scheduling after group stage", () => {
  it("resolves R32 matches on day 13 once group stage is complete", () => {
    const bootstrap = buildSimulationBootstrap(0);
    const state = bootstrap.runState;

    for (let day = 1; day <= 11; day++) {
      for (const match of resolveGroupMatchesForDay(day, state.groupResults)) {
        state.groupResults.push({
          matchId: match.matchId,
          stage: match.stage,
          day: match.day,
          home: match.home,
          away: match.away,
          winner: match.home,
        });
      }
    }

    const standings = buildStandingsFromGroupResults(state.groupResults);
    state.advancingThirdGroups = selectAdvancingThirdPlaceGroups(
      standings,
      createSeededRng(42),
    );
    state.probability = applyGroupStageCut(
      state.probability,
      state.groupResults,
      state.results,
      DEFAULT_PROBABILITY_CONFIG,
      state.advancingThirdGroups,
    );

    const day13 = resolveKnockoutMatchesForDay(
      13,
      state.results,
      state.groupResults,
      state.probability.eliminated,
      state.advancingThirdGroups,
    );

    assert.ok(day13.length > 0, "expected R32 matches on day 13");
  });

  it("timeline includes knockout days", () => {
    const days = getTimelineDays();
    assert.ok(days.some((entry) => entry.day >= 13));
  });
});
