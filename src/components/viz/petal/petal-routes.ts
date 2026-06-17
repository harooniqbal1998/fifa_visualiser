import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { lookupAnnexC } from "@/data/annex-c-lookup";
import { R32_FIXTURES, type RankSlot } from "@/data/r32-fixtures";

export type BracketHalf = "left" | "right";

const LEFT_SF_ROOT = KNOCKOUT_TREE.homeSource!;
const RIGHT_SF_ROOT = KNOCKOUT_TREE.awaySource!;

function collectR32MatchIds(node: BracketNode, acc: Set<string>): void {
  if (node.matchId.startsWith("r32-")) {
    acc.add(node.matchId);
  }
  if (node.homeSource) collectR32MatchIds(node.homeSource, acc);
  if (node.awaySource) collectR32MatchIds(node.awaySource, acc);
}

const LEFT_R32 = new Set<string>();
const RIGHT_R32 = new Set<string>();
collectR32MatchIds(LEFT_SF_ROOT, LEFT_R32);
collectR32MatchIds(RIGHT_SF_ROOT, RIGHT_R32);

function getMatchHalf(matchId: string): BracketHalf {
  if (LEFT_R32.has(matchId)) return "left";
  if (RIGHT_R32.has(matchId)) return "right";
  return "left";
}

const RANK_HALF: Record<string, Record<1 | 2, BracketHalf>> = {};

for (const fixture of R32_FIXTURES) {
  for (const slot of [fixture.home, fixture.away]) {
    if (slot.type !== "rank") continue;
    const rankSlot = slot as RankSlot;
    if (!RANK_HALF[rankSlot.group]) {
      RANK_HALF[rankSlot.group] = {} as Record<1 | 2, BracketHalf>;
    }
    RANK_HALF[rankSlot.group]![rankSlot.rank] = getMatchHalf(fixture.id);
  }
}

export function getRankHalf(group: string, rank: 1 | 2): BracketHalf {
  return RANK_HALF[group]?.[rank] ?? "left";
}

export function getThirdPlaceHalf(
  group: string,
  advancingThirdGroups: string[],
): BracketHalf | null {
  if (advancingThirdGroups.length < 8) return null;
  if (!advancingThirdGroups.includes(group)) return null;

  const annexRow = lookupAnnexC(advancingThirdGroups);
  if (!annexRow) return null;

  let winnerGroupKey: string | undefined;
  for (const [key, assignedGroup] of Object.entries(annexRow)) {
    if (assignedGroup === group) {
      winnerGroupKey = key;
      break;
    }
  }
  if (!winnerGroupKey) return null;

  for (const fixture of R32_FIXTURES) {
    for (const slot of [fixture.home, fixture.away]) {
      if (slot.type !== "third") continue;
      if (slot.winnerGroup !== winnerGroupKey) continue;
      if (!slot.pools.includes(group)) continue;
      return getMatchHalf(fixture.id);
    }
  }

  return null;
}

export function getTeamBracketHalf(
  group: string,
  standingRank: 1 | 2 | 3 | 4,
  advancingThirdGroups: string[],
): BracketHalf | null {
  if (standingRank === 1) return getRankHalf(group, 1);
  if (standingRank === 2) return getRankHalf(group, 2);
  if (standingRank === 3) return getThirdPlaceHalf(group, advancingThirdGroups);
  return null;
}
