import type { ProbabilityState, VizProbabilityFeed } from "@/lib/probability/types";

export function toVizFeed(state: ProbabilityState, day: number): VizProbabilityFeed {
  return {
    probabilities: { ...state.probabilities },
    eliminated: new Set(state.eliminated),
    day,
    lastDeltas: state.lastDeltas.length > 0 ? [...state.lastDeltas] : undefined,
  };
}
