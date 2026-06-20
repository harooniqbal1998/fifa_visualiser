import type { ProbabilityConfig } from "@/lib/probability/types";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";

export type AnimationParams = {
  approachDurationMs: number;
  collisionDurationMs: number;
  shrinkDurationMs: number;
  returnDurationMs: number;
  dropDurationMs: number;
  anchorTransitionMs: number;
  dayPauseMs: number;
  batchPauseMs: number;
  floatSpeed: number;
  repulsionStrength: number;
  timelineDropOffset: number;
  eliminatedGrayOpacity: number;
  simulationSeed: number;
  probabilityConfig: ProbabilityConfig;
};

export const DEFAULT_ANIMATION_PARAMS: AnimationParams = {
  approachDurationMs: 2000,
  collisionDurationMs: 350,
  shrinkDurationMs: 1200,
  returnDurationMs: 1800,
  dropDurationMs: 900,
  anchorTransitionMs: 1200,
  dayPauseMs: 600,
  batchPauseMs: 300,
  floatSpeed: 0.3,
  repulsionStrength: 120,
  timelineDropOffset: 12,
  eliminatedGrayOpacity: 0.45,
  simulationSeed: 42,
  probabilityConfig: DEFAULT_PROBABILITY_CONFIG,
};

export function createSimulationSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]! || 1;
}

export function createSeededRng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 48271) % 0x7fffffff;
    return state / 0x7fffffff;
  };
}
