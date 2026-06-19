import { lookupAnnexC } from "@/data/annex-c-lookup";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import {
  R32_FIXTURES,
  R32_FIXTURES_BY_ID,
  type FixtureSlot,
  type RankSlot,
  type ThirdSlot,
} from "@/data/r32-fixtures";
import type { StandingsTable } from "@/lib/simulation/group-advancement";

export type BracketHalf = "left" | "right";
export type GroupFinish = 1 | 2 | 3;

export type R32EntrySlot = {
  r32MatchId: string;
  side: "home" | "away";
  opponentSlot: FixtureSlot;
  bracketHalf: BracketHalf;
};

export type KnockoutChain = {
  r32: string;
  r16: string;
  qf: string;
  sf: string;
  final: string;
};

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

export function getBracketHalf(r32MatchId: string): BracketHalf {
  if (LEFT_R32.has(r32MatchId)) return "left";
  if (RIGHT_R32.has(r32MatchId)) return "right";
  return "left";
}

/** Maps group finish rank 1/2 to R32 entry slot. */
export const GROUP_FINISH_TO_R32: Record<string, Partial<Record<1 | 2, R32EntrySlot>>> = {};

for (const fixture of R32_FIXTURES) {
  const half = getBracketHalf(fixture.id);
  if (fixture.home.type === "rank") {
    const slot = fixture.home;
    if (!GROUP_FINISH_TO_R32[slot.group]) {
      GROUP_FINISH_TO_R32[slot.group] = {};
    }
    GROUP_FINISH_TO_R32[slot.group]![slot.rank] = {
      r32MatchId: fixture.id,
      side: "home",
      opponentSlot: fixture.away,
      bracketHalf: half,
    };
  }
  if (fixture.away.type === "rank") {
    const slot = fixture.away;
    if (!GROUP_FINISH_TO_R32[slot.group]) {
      GROUP_FINISH_TO_R32[slot.group] = {};
    }
    GROUP_FINISH_TO_R32[slot.group]![slot.rank] = {
      r32MatchId: fixture.id,
      side: "away",
      opponentSlot: fixture.home,
      bracketHalf: half,
    };
  }
}

const KNOCKOUT_CHAIN_CACHE = new Map<string, KnockoutChain>();

function extractChain(path: string[]): KnockoutChain | null {
  const r32 = path.find((id) => id.startsWith("r32-"));
  const r16 = path.find((id) => id.startsWith("r16-"));
  const qf = path.find((id) => id.startsWith("qf-"));
  const sf = path.find((id) => id.startsWith("sf-"));
  const finalMatch = path.find((id) => id === "fin-1");
  if (!r32 || !r16 || !qf || !sf || !finalMatch) return null;
  return { r32, r16, qf, sf, final: finalMatch };
}

function buildR32Chains(node: BracketNode, path: string[] = []): void {
  const current = [...path, node.matchId];
  if (node.matchId.startsWith("r32-")) {
    const chain = extractChain(current);
    if (chain) KNOCKOUT_CHAIN_CACHE.set(node.matchId, chain);
    return;
  }
  if (node.homeSource) buildR32Chains(node.homeSource, current);
  if (node.awaySource) buildR32Chains(node.awaySource, current);
}

buildR32Chains(KNOCKOUT_TREE);

export function getKnockoutChain(r32MatchId: string): KnockoutChain | null {
  return KNOCKOUT_CHAIN_CACHE.get(r32MatchId) ?? null;
}

export function getRankHalf(group: string, rank: 1 | 2): BracketHalf {
  return GROUP_FINISH_TO_R32[group]?.[rank]?.bracketHalf ?? "left";
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
      return getBracketHalf(fixture.id);
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

function resolveRankSlot(slot: RankSlot, standings: StandingsTable): string | undefined {
  const table = standings[slot.group];
  if (!table) return undefined;
  return table[slot.rank - 1]?.teamId;
}

function resolveThirdSlot(
  slot: ThirdSlot,
  standings: StandingsTable,
  advancingThirdGroups: string[],
): string | undefined {
  const annexRow = lookupAnnexC(advancingThirdGroups);
  if (!annexRow) return undefined;

  const assignedGroup = annexRow[slot.winnerGroup];
  if (!assignedGroup || !slot.pools.includes(assignedGroup)) return undefined;

  const table = standings[assignedGroup];
  if (!table) return undefined;
  return table[2]?.teamId;
}

function resolveFixtureSlot(
  slot: FixtureSlot,
  standings: StandingsTable,
  advancingThirdGroups: string[],
): string | undefined {
  if (slot.type === "rank") {
    return resolveRankSlot(slot, standings);
  }
  return resolveThirdSlot(slot, standings, advancingThirdGroups);
}

export function resolveR32Participants(
  matchId: string,
  standings: StandingsTable,
  advancingThirdGroups: string[],
): { home?: string; away?: string } {
  const fixture = R32_FIXTURES_BY_ID[matchId];
  if (!fixture) return {};

  return {
    home: resolveFixtureSlot(fixture.home, standings, advancingThirdGroups),
    away: resolveFixtureSlot(fixture.away, standings, advancingThirdGroups),
  };
}

export function getR32EntryForTeam(
  group: string,
  finishRank: GroupFinish,
  advancingThirdGroups: string[],
): R32EntrySlot | null {
  if (finishRank === 1 || finishRank === 2) {
    return GROUP_FINISH_TO_R32[group]?.[finishRank] ?? null;
  }
  if (finishRank !== 3 || !advancingThirdGroups.includes(group)) return null;

  const annexRow = lookupAnnexC(advancingThirdGroups);
  if (!annexRow) return null;

  for (const fixture of R32_FIXTURES) {
    for (const [side, slot] of [
      ["home", fixture.home],
      ["away", fixture.away],
    ] as const) {
      if (slot.type !== "third") continue;
      const assignedGroup = annexRow[slot.winnerGroup];
      if (assignedGroup !== group || !slot.pools.includes(group)) continue;
      const opponentSlot = side === "home" ? fixture.away : fixture.home;
      return {
        r32MatchId: fixture.id,
        side,
        opponentSlot,
        bracketHalf: getBracketHalf(fixture.id),
      };
    }
  }

  return null;
}

export function canTeamsMeetBeforeFinal(
  groupA: string,
  rankA: GroupFinish,
  groupB: string,
  rankB: GroupFinish,
  advancingThirdGroups: string[],
): boolean {
  const entryA = getR32EntryForTeam(groupA, rankA, advancingThirdGroups);
  const entryB = getR32EntryForTeam(groupB, rankB, advancingThirdGroups);
  if (!entryA || !entryB) return false;
  return entryA.bracketHalf === entryB.bracketHalf;
}
