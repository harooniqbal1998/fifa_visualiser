import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTimelineDays } from "@/lib/tournament";
import {
  resolveGroupMatchesForDay,
  resolveKnockoutMatchesForDay,
} from "@/lib/simulation/bracket-resolver";
import { buildSimulationBootstrap } from "@/lib/simulation/advancement";
import { runSimulation } from "@/lib/simulation/simulation-engine";
import type { SimulationRunState } from "@/lib/simulation/types";
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

const FINAL_DAY = 35;
const SIM_SEED = 42;

async function runSimToCompletion(startDay: number, seed = SIM_SEED) {
  let completed = false;
  let finalState: SimulationRunState | null = null;
  const knockoutMatchIds: string[] = [];

  const state = await runSimulation(
    {
      ...DEFAULT_ANIMATION_PARAMS,
      simulationSeed: seed,
      dayPauseMs: 0,
      batchPauseMs: 0,
    },
    {
      onDayChange: () => {},
      onCollision: async (event) => {
        if (event.isKnockout) knockoutMatchIds.push(event.matchId);
      },
      onMatchResolved: async () => {},
      onEliminations: async () => {},
      onProbabilitiesUpdate: () => {},
      onBracketStateChange: () => {},
      onComplete: (runState) => {
        completed = true;
        finalState = runState;
      },
      shouldAbort: () => false,
    },
    { startDay },
  );

  return { state, completed, finalState, knockoutMatchIds };
}

describe("runSimulation from pre-tournament", () => {
  it("plays knockout matches after group stage", async () => {
    const { knockoutMatchIds, finalState } = await runSimToCompletion(0);

    assert.ok(knockoutMatchIds.length > 0, "expected knockout matches to be simulated");
    assert.ok(finalState, "expected onComplete to fire");
    assert.equal(finalState!.day, FINAL_DAY);
  });
});

describe("runSimulation completes to final from multiple start days", () => {
  for (const startDay of [0, 9, 12, 13] as const) {
    it(`reaches day ${FINAL_DAY} from day ${startDay}`, async () => {
      const { completed, finalState, knockoutMatchIds } = await runSimToCompletion(startDay);

      assert.equal(completed, true, "expected onComplete to be called");
      assert.ok(finalState, "expected final state");
      assert.equal(finalState!.day, FINAL_DAY);

      const finalMatch = finalState!.results.find((result) => result.stage === "final");
      assert.ok(finalMatch, "expected a final match result");
      assert.ok(finalMatch!.winner, "expected a tournament winner");

      if (startDay >= 13) {
        assert.ok(knockoutMatchIds.length > 0, "expected knockout matches from R32 onward");
      }
    });
  }

  it("fires day-12 cut when starting from last group day", async () => {
    let eliminationsFired = false;
    await runSimulation(
      {
        ...DEFAULT_ANIMATION_PARAMS,
        simulationSeed: SIM_SEED,
        dayPauseMs: 0,
        batchPauseMs: 0,
      },
      {
        onDayChange: () => {},
        onCollision: async () => {},
        onMatchResolved: async () => {},
        onEliminations: async () => {
          eliminationsFired = true;
        },
        onProbabilitiesUpdate: () => {},
        onBracketStateChange: () => {},
        onComplete: () => {},
        shouldAbort: () => false,
      },
      { startDay: 12 },
    );
    assert.equal(eliminationsFired, true);
  });

  it("resume from mid-tournament still reaches the final", async () => {
    const bootstrap = buildSimulationBootstrap(9);
    let completed = false;
    let finalDay = 0;

    await runSimulation(
      {
        ...DEFAULT_ANIMATION_PARAMS,
        simulationSeed: SIM_SEED,
        dayPauseMs: 0,
        batchPauseMs: 0,
      },
      {
        onDayChange: () => {},
        onCollision: async () => {},
        onMatchResolved: async () => {},
        onEliminations: async () => {},
        onProbabilitiesUpdate: () => {},
        onBracketStateChange: () => {},
        onComplete: (state) => {
          completed = true;
          finalDay = state.day;
        },
        shouldAbort: () => false,
      },
      {
        startDay: 9,
        initialState: bootstrap.runState,
        resume: true,
      },
    );

    assert.equal(completed, true);
    assert.equal(finalDay, FINAL_DAY);
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
