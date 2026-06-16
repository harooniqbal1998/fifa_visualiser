import type { MatchStage } from "@/types";

export type SimMatchResult = {
  matchId: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
  winner: string;
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
};

export type EliminationEvent = {
  teamIds: string[];
};

export type SimulationCallbacks = {
  onDayChange: (day: number) => void;
  onCollision: (event: CollisionEvent) => Promise<void>;
  onEliminations: (event: EliminationEvent) => Promise<void>;
  onProbabilitiesUpdate: (probabilities: Record<string, number>) => void;
  onBracketStateChange: (state: {
    possibleOpponents: Record<string, string[]>;
    bracketDepths: Record<string, number>;
  }) => void;
  onComplete: () => void;
  shouldAbort: () => boolean;
};

export type SimulationRunState = {
  day: number;
  probabilities: Record<string, number>;
  rawWeights: Record<string, number>;
  eliminated: Set<string>;
  results: SimMatchResult[];
  groupResults: SimMatchResult[];
};
