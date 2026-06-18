import type { MatchStage } from "@/types";
import type { SimMatchResult } from "@/lib/simulation/types";
import type {
  AnalyticalStats,
  FinishRankDistribution,
} from "@/lib/probability/bracket-analytical";

export type KnockoutRecomputeTrigger = "each_match" | "each_knockout_day";

export type ProbabilityConfig = {
  eloKFactor: number;
  eloBase: number;
  eloScale: number;
  knockoutRecomputeTrigger: KnockoutRecomputeTrigger;
};

export type ProbabilityState = {
  eloRatings: Record<string, number>;
  probabilities: Record<string, number>;
  eliminated: Set<string>;
  lastDeltas: ProbUpdateEvent[];
  lastAnalyticalStats?: AnalyticalStats;
  finishRankDistribution?: FinishRankDistribution;
};

export type ProbUpdateEvent = {
  teamId: string;
  deltaPct: number;
  reason: "bracket_analytical" | "elimination";
  opponentId?: string;
  stage?: MatchStage;
};

export type VizProbabilityFeed = {
  probabilities: Record<string, number>;
  eliminated: Set<string>;
  day: number;
  lastDeltas?: ProbUpdateEvent[];
};

export type MatchInput = {
  matchId: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
};

export const DEFAULT_PROBABILITY_CONFIG: ProbabilityConfig = {
  eloKFactor: 32,
  eloBase: 2100,
  eloScale: 12,
  knockoutRecomputeTrigger: "each_match",
};
