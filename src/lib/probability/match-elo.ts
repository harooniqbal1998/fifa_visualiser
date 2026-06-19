import type { Team } from "@/types";
import type { ProbabilityConfig } from "@/lib/probability/types";

function fifaRankingToElo(rank: number, config: ProbabilityConfig): number {
  return config.eloBase - (rank - 1) * config.eloScale;
}

export function buildInitialEloRatings(
  teams: Team[],
  config: ProbabilityConfig,
): Record<string, number> {
  const ratings: Record<string, number> = {};
  for (const team of teams) {
    ratings[team.id] = fifaRankingToElo(team.fifaRanking, config);
  }
  return ratings;
}

export function expectedHomeWinProb(homeElo: number, awayElo: number): number {
  return 1 / (1 + 10 ** ((awayElo - homeElo) / 400));
}

export function pickMatchWinner(
  homeId: string,
  awayId: string,
  ratings: Record<string, number>,
  rng: () => number,
): string {
  const homeElo = ratings[homeId] ?? 1500;
  const awayElo = ratings[awayId] ?? 1500;
  const homeProb = expectedHomeWinProb(homeElo, awayElo);
  return rng() < homeProb ? homeId : awayId;
}

export function applyEloMatchResult(
  homeId: string,
  awayId: string,
  winnerId: string,
  ratings: Record<string, number>,
  kFactor: number,
): Record<string, number> {
  const next = { ...ratings };
  const homeElo = next[homeId] ?? 1500;
  const awayElo = next[awayId] ?? 1500;
  const homeExpected = expectedHomeWinProb(homeElo, awayElo);
  const awayExpected = 1 - homeExpected;

  if (winnerId === homeId) {
    next[homeId] = homeElo + kFactor * (1 - homeExpected);
    next[awayId] = awayElo + kFactor * (0 - awayExpected);
  } else {
    next[awayId] = awayElo + kFactor * (1 - awayExpected);
    next[homeId] = homeElo + kFactor * (0 - homeExpected);
  }

  return next;
}
