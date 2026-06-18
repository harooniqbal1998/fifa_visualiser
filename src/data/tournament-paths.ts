import { lookupAnnexC } from "@/data/annex-c-lookup";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE, THIRD_PLACE_NODE } from "@/data/knockout-bracket";
import { matches } from "@/data/matches";
import {
  R32_FIXTURES,
  R32_FIXTURES_BY_ID,
  type FixtureSlot,
  type RankSlot,
  type ThirdSlot,
} from "@/data/r32-fixtures";
import { pickMatchWinner } from "@/lib/probability/match-elo";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
  type StandingsTable,
} from "@/lib/simulation/group-advancement";
import type { SimMatchResult } from "@/lib/simulation/types";
import type { MatchStage } from "@/types";

export type { BracketNode } from "@/data/knockout-bracket";
export { KNOCKOUT_TREE, THIRD_PLACE_NODE } from "@/data/knockout-bracket";
export { R32_FIXTURES, R32_FIXTURES_BY_ID } from "@/data/r32-fixtures";
export type { FixtureSlot, RankSlot, ThirdSlot, R32Fixture } from "@/data/r32-fixtures";

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

export function resolveR32MatchFromResults(
  matchId: string,
  groupResults: SimMatchResult[],
  rng: () => number,
): { home?: string; away?: string } {
  const standings = buildStandingsFromGroupResults(groupResults);
  const advancingThirdGroups = selectAdvancingThirdPlaceGroups(standings, rng);
  return resolveR32Participants(matchId, standings, advancingThirdGroups);
}

type OrderedKnockoutMatch = {
  node: BracketNode;
  matchId: string;
  stage: MatchStage;
  day: number;
};

const knockoutMetaById = new Map(
  matches
    .filter((m) => m.stage !== "group")
    .map((m) => [m.id, { stage: m.stage as MatchStage, day: m.day }]),
);

function collectKnockoutNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectKnockoutNodes(node.homeSource, acc);
  if (node.awaySource) collectKnockoutNodes(node.awaySource, acc);
  return acc;
}

const ALL_KNOCKOUT_NODES = collectKnockoutNodes(KNOCKOUT_TREE);

function getKnockoutMatchesInOrder(): OrderedKnockoutMatch[] {
  const ordered: OrderedKnockoutMatch[] = [];

  for (const node of ALL_KNOCKOUT_NODES) {
    const meta = knockoutMetaById.get(node.matchId);
    if (!meta) continue;
    ordered.push({ node, matchId: node.matchId, stage: meta.stage, day: meta.day });
  }

  const tpMeta = knockoutMetaById.get("tp-1");
  if (tpMeta) {
    ordered.push({
      node: THIRD_PLACE_NODE,
      matchId: "tp-1",
      stage: tpMeta.stage,
      day: tpMeta.day,
    });
  }

  return ordered.sort((a, b) => a.day - b.day || a.matchId.localeCompare(b.matchId));
}

const KNOCKOUT_ORDER = getKnockoutMatchesInOrder();

function getWinner(results: SimMatchResult[], matchId: string): string | undefined {
  return results.find((r) => r.matchId === matchId)?.winner;
}

function getLoser(results: SimMatchResult[], matchId: string): string | undefined {
  const result = results.find((r) => r.matchId === matchId);
  if (!result?.winner) return undefined;
  return result.winner === result.home ? result.away : result.home;
}

function resolveNodeParticipants(
  node: BracketNode,
  results: SimMatchResult[],
  groupResults: SimMatchResult[],
  rng: () => number,
): { home?: string; away?: string } {
  if (node.matchId.startsWith("r32-")) {
    return resolveR32MatchFromResults(node.matchId, groupResults, rng);
  }

  const home = node.homeSource ? getWinner(results, node.homeSource.matchId) : undefined;
  const away = node.awaySource ? getWinner(results, node.awaySource.matchId) : undefined;
  return { home, away };
}

export function walkKnockoutPath(
  groupResults: SimMatchResult[],
  knownKnockoutResults: SimMatchResult[],
  eloRatings: Record<string, number>,
  eliminated: Set<string>,
  rng: () => number,
): string | undefined {
  const results = [...knownKnockoutResults];

  for (const entry of KNOCKOUT_ORDER) {
    if (results.some((r) => r.matchId === entry.matchId)) continue;

    let home: string | undefined;
    let away: string | undefined;

    if (entry.matchId === "tp-1") {
      home = getLoser(results, "sf-1");
      away = getLoser(results, "sf-2");
    } else {
      ({ home, away } = resolveNodeParticipants(entry.node, results, groupResults, rng));
    }

    if (!home || !away) continue;
    if (eliminated.has(home) || eliminated.has(away)) continue;

    const winner = pickMatchWinner(home, away, eloRatings, rng);
    results.push({
      matchId: entry.matchId,
      stage: entry.stage,
      day: entry.day,
      home,
      away,
      winner,
    });
  }

  return getWinner(results, "fin-1");
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
