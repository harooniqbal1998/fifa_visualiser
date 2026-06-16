export type AnimationParams = {
  approachDurationMs: number;
  collisionDurationMs: number;
  shrinkDurationMs: number;
  returnDurationMs: number;
  dropDurationMs: number;
  anchorTransitionMs: number;
  dayPauseMs: number;
  batchPauseMs: number;
  loserPenalty: number;
  winnerBoost: number;
  floatSpeed: number;
  repulsionStrength: number;
  timelineDropOffset: number;
  eliminatedGrayOpacity: number;
  simulationSeed: number;
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
  loserPenalty: 0.75,
  winnerBoost: 1.12,
  floatSpeed: 0.3,
  repulsionStrength: 120,
  timelineDropOffset: 12,
  eliminatedGrayOpacity: 0.45,
  simulationSeed: 42,
};

export function createSeededRng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 48271) % 0x7fffffff;
    return state / 0x7fffffff;
  };
}
