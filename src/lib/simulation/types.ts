import type { MatchStage } from "@/types";

export type SimMatchResult = {
  matchId: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
  winner?: string;
  homeScore?: number;
  awayScore?: number;
};

export type CollisionEvent = {
  matchId: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
  winner: string;
  loser: string;
  isKnockout: boolean;
  homeElo: number;
  awayElo: number;
};

export type EliminationEvent = {
  teamIds: string[];
};

export type SimulationCallbacks = {
  onDayChange: (day: number) => void;
  onCollision: (event: CollisionEvent) => Promise<void>;
  onMatchResolved?: (
    event: CollisionEvent,
    groupResults: SimMatchResult[],
  ) => Promise<void>;
  onEliminations: (event: EliminationEvent) => Promise<void>;
  onProbabilitiesUpdate: (probabilities: Record<string, number>) => void;
  onProbabilityDeltas?: (deltas: import("@/lib/probability/types").ProbUpdateEvent[]) => void;
  onProbabilityStateUpdate?: (
    state: import("@/lib/probability/types").ProbabilityState,
    meta?: { advancingThirdGroups?: string[] },
  ) => void;
  onBracketStateChange: (state: {
    possibleOpponents: Record<string, string[]>;
    bracketDepths: Record<string, number>;
  }) => void;
  onComplete: (finalState: SimulationRunState) => void;
  shouldAbort: () => boolean;
};

export type SimulationRunState = {
  day: number;
  probability: import("@/lib/probability/types").ProbabilityState;
  results: SimMatchResult[];
  groupResults: SimMatchResult[];
  /** Locked at day-12 cut; must match R32 bracket resolution. */
  advancingThirdGroups?: string[];
  /** LCG cursor for deterministic resume after pause. */
  rngState?: number;
};
