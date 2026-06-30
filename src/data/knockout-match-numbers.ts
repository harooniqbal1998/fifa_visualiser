import { R32_FIXTURES_BY_ID } from "@/data/r32-fixtures";

/** FIFA match numbers for knockout stages R16 through final. */
const KNOCKOUT_FIFA_NUMBERS: Record<string, number> = {
  "r16-1": 90,
  "r16-2": 89,
  "r16-3": 91,
  "r16-4": 92,
  "r16-5": 93,
  "r16-6": 94,
  "r16-7": 95,
  "r16-8": 96,
  "qf-1": 97,
  "qf-2": 98,
  "qf-3": 99,
  "qf-4": 100,
  "sf-1": 101,
  "sf-2": 102,
  "fin-1": 104,
};

export function getFifaMatchNumber(matchId: string): number | undefined {
  if (matchId.startsWith("r32-")) {
    return R32_FIXTURES_BY_ID[matchId]?.fifaMatch;
  }
  return KNOCKOUT_FIFA_NUMBERS[matchId];
}

export function formatWinnerFeederLabel(childMatchId: string): string {
  const fifa = getFifaMatchNumber(childMatchId);
  return fifa !== undefined ? `W${fifa}` : `W ${childMatchId}`;
}
