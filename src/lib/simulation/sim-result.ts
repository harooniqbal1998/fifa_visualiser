import type { Match } from "@/types";
import type { SimMatchResult } from "@/lib/simulation/types";

export function simResultToMatch(result: SimMatchResult): Match {
  if (result.homeScore !== undefined && result.awayScore !== undefined) {
    return {
      id: result.matchId,
      stage: result.stage,
      day: result.day,
      home: result.home,
      away: result.away,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      winner: result.winner,
    };
  }
  return {
    id: result.matchId,
    stage: result.stage,
    day: result.day,
    home: result.home,
    away: result.away,
    homeScore: result.winner === result.home ? 2 : 1,
    awayScore: result.winner === result.away ? 2 : 1,
    winner: result.winner,
  };
}
