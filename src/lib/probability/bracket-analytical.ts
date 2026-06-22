import { lookupAnnexC, ANNEX_C_TABLE } from "@/data/annex-c-lookup";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { matches } from "@/data/matches";
import {
  R32_FIXTURES_BY_ID,
  type RankSlot,
  type ThirdSlot,
} from "@/data/r32-fixtures";
import { teams } from "@/data/teams";
import {
  computeFinishDistributions,
  computeGroupOutcomesByGroup,
  type FinishDistribution,
} from "@/lib/probability/group-finish-distribution";
import { expectedHomeWinProb } from "@/lib/probability/match-elo";
import { normalizeProbabilities } from "@/lib/probability/tournament-priors";
import {
  buildThirdPlaceMarginals,
  computeTeamThirdAdvanceProbs,
  computeThirdPlaceAdvanceProbs,
  probAdvanceWithPoints,
  probAdvancingThirdGroupSet,
} from "@/lib/probability/third-place-analytical";
import { countUnplayedGroupMatches } from "@/lib/probability/unplayed-group-matches";
import type { SimMatchResult } from "@/lib/simulation/types";

export type AnalyticalStats = {
  method: "analytical";
  unplayedGroupMatches: number;
};

export type FinishRankDistribution = Record<
  string,
  { first: number; second: number; third: number; eliminated: number }
>;

export type AnalyticalResult = {
  probabilities: Record<string, number>;
  stats: AnalyticalStats;
  finishRankDistribution: FinishRankDistribution;
};

type TeamProbMap = Record<string, number>;

function emptyTeamMap(): TeamProbMap {
  const m: TeamProbMap = {};
  for (const team of teams) {
    m[team.id] = 0;
  }
  return m;
}

function beatProb(teamA: string, teamB: string, elo: Record<string, number>): number {
  return expectedHomeWinProb(elo[teamA] ?? 1500, elo[teamB] ?? 1500);
}

function resolveRankSlotOccupancy(
  slot: RankSlot,
  finishDist: FinishDistribution,
): TeamProbMap {
  const occ = emptyTeamMap();
  for (const team of teams) {
    if (team.group !== slot.group) continue;
    const rankKey = slot.rank === 1 ? "first" : "second";
    occ[team.id] = finishDist[team.id]?.[rankKey] ?? 0;
  }
  return occ;
}

function buildThirdPlaceSlotWeights(
  groupOutcomesByGroup: ReturnType<typeof computeGroupOutcomesByGroup>,
  marginals: ReturnType<typeof buildThirdPlaceMarginals>,
  groupAdvProb: Record<string, number>,
): Record<string, TeamProbMap> {
  const cache = new Map<string, number>();
  const weights: Record<string, TeamProbMap> = {};

  for (const groupId of Object.keys(groupOutcomesByGroup)) {
    weights[groupId] = emptyTeamMap();
    const gAdv = groupAdvProb[groupId] ?? 0;
    if (gAdv <= 0) continue;

    for (const outcome of groupOutcomesByGroup[groupId] ?? []) {
      const adv = probAdvanceWithPoints(
        groupId,
        outcome.thirdPoints,
        marginals,
        cache,
      );
      const p = (outcome.prob * adv) / gAdv;
      if (p <= 0) continue;
      weights[groupId]![outcome.thirdTeamId] =
        (weights[groupId]![outcome.thirdTeamId] ?? 0) + p;
    }
  }

  return weights;
}

function buildR32SlotOccupancies(
  finishDist: FinishDistribution,
  groupOutcomesByGroup: ReturnType<typeof computeGroupOutcomesByGroup>,
  marginals: ReturnType<typeof buildThirdPlaceMarginals>,
  groupAdvProb: Record<string, number>,
): { home: Record<string, TeamProbMap>; away: Record<string, TeamProbMap> } {
  const home: Record<string, TeamProbMap> = {};
  const away: Record<string, TeamProbMap> = {};

  for (const fixtureId of Object.keys(R32_FIXTURES_BY_ID)) {
    home[fixtureId] = emptyTeamMap();
    away[fixtureId] = emptyTeamMap();
  }

  for (const fixtureId of Object.keys(R32_FIXTURES_BY_ID)) {
    const fixture = R32_FIXTURES_BY_ID[fixtureId]!;
    if (fixture.home.type === "rank") {
      const occ = resolveRankSlotOccupancy(fixture.home, finishDist);
      for (const [tid, p] of Object.entries(occ)) {
        home[fixtureId]![tid] = (home[fixtureId]![tid] ?? 0) + p;
      }
    }
    if (fixture.away.type === "rank") {
      const occ = resolveRankSlotOccupancy(fixture.away, finishDist);
      for (const [tid, p] of Object.entries(occ)) {
        away[fixtureId]![tid] = (away[fixtureId]![tid] ?? 0) + p;
      }
    }
  }

  const thirdWeights = buildThirdPlaceSlotWeights(
    groupOutcomesByGroup,
    marginals,
    groupAdvProb,
  );

  const assignThird = (
    slot: ThirdSlot,
    target: TeamProbMap,
    annexRow: Record<string, string>,
    comboProb: number,
  ) => {
    const assignedGroup = annexRow[slot.winnerGroup];
    if (!assignedGroup || !slot.pools.includes(assignedGroup)) return;

    const groupWeights = thirdWeights[assignedGroup];
    if (!groupWeights) return;

    for (const [teamId, weight] of Object.entries(groupWeights)) {
      const p = comboProb * weight;
      if (p <= 0) continue;
      target[teamId] = (target[teamId] ?? 0) + p;
    }
  };

  for (const row of ANNEX_C_TABLE) {
    const key = row[0]!;
    const advancingGroups = key.split("");
    const comboProb = probAdvancingThirdGroupSet(advancingGroups, groupAdvProb);
    if (comboProb <= 0) continue;

    const annexRow = lookupAnnexC(advancingGroups);
    if (!annexRow) continue;

    for (const fixtureId of Object.keys(R32_FIXTURES_BY_ID)) {
      const fixture = R32_FIXTURES_BY_ID[fixtureId]!;
      if (fixture.home.type === "third") {
        assignThird(fixture.home, home[fixtureId]!, annexRow, comboProb);
      }
      if (fixture.away.type === "third") {
        assignThird(fixture.away, away[fixtureId]!, annexRow, comboProb);
      }
    }
  }

  return { home, away };
}

function computeWinProbs(
  slotHome: TeamProbMap,
  slotAway: TeamProbMap,
  elo: Record<string, number>,
): TeamProbMap {
  const win = emptyTeamMap();

  for (const team of teams) {
    let p = 0;
    const t = team.id;
    for (const other of teams) {
      if (other.id === t) continue;
      const o = other.id;
      p += (slotHome[t] ?? 0) * (slotAway[o] ?? 0) * beatProb(t, o, elo);
      p += (slotAway[t] ?? 0) * (slotHome[o] ?? 0) * (1 - beatProb(o, t, elo));
    }
    win[t] = p;
  }

  return win;
}

function collectKnockoutNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectKnockoutNodes(node.homeSource, acc);
  if (node.awaySource) collectKnockoutNodes(node.awaySource, acc);
  return acc;
}

const ALL_NODES = collectKnockoutNodes(KNOCKOUT_TREE);
const NODE_BY_ID = new Map(ALL_NODES.map((n) => [n.matchId, n]));

const KNOCKOUT_MATCH_IDS = matches
  .filter((m) => m.stage !== "group")
  .sort((a, b) => a.day - b.day || a.id.localeCompare(b.id))
  .map((m) => m.id);

function getKnownWinner(results: SimMatchResult[], matchId: string): string | undefined {
  return results.find((r) => r.matchId === matchId)?.winner;
}

function buildFinishRankDistribution(
  finishDist: FinishDistribution,
  teamThirdAdvance: Record<string, number>,
): FinishRankDistribution {
  const out: FinishRankDistribution = {};
  for (const team of teams) {
    const fd = finishDist[team.id] ?? { first: 0, second: 0, third: 0, fourth: 0 };
    out[team.id] = {
      first: Number((fd.first * 100).toFixed(2)),
      second: Number((fd.second * 100).toFixed(2)),
      third: Number(((teamThirdAdvance[team.id] ?? 0) * 100).toFixed(2)),
      eliminated: Number(
        ((fd.fourth + fd.third - (teamThirdAdvance[team.id] ?? 0)) * 100).toFixed(2),
      ),
    };
  }
  return out;
}

export type BracketSlotProbabilities = Record<
  string,
  { home: Record<string, number>; away: Record<string, number> }
>;

export function buildBracketSlotProbabilities(
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  eloRatings: Record<string, number>,
): {
  slots: BracketSlotProbabilities;
  winnerReach: Record<string, TeamProbMap>;
  finishDist: FinishDistribution;
  teamThirdAdvance: Record<string, number>;
} {
  const groupOutcomesByGroup = computeGroupOutcomesByGroup(groupResults, eloRatings);
  const finishDist = computeFinishDistributions(groupOutcomesByGroup);
  const marginals = buildThirdPlaceMarginals(groupOutcomesByGroup);
  const groupAdvProb = computeThirdPlaceAdvanceProbs(groupOutcomesByGroup, marginals);
  const teamThirdAdvance = computeTeamThirdAdvanceProbs(groupOutcomesByGroup, marginals);

  const r32Slots = buildR32SlotOccupancies(
    finishDist,
    groupOutcomesByGroup,
    marginals,
    groupAdvProb,
  );
  const slots: BracketSlotProbabilities = {};
  const winnerReach: Record<string, TeamProbMap> = {};

  for (const matchId of KNOCKOUT_MATCH_IDS) {
    const node = NODE_BY_ID.get(matchId);
    if (!node) continue;

    let slotHome = emptyTeamMap();
    let slotAway = emptyTeamMap();

    if (matchId.startsWith("r32-")) {
      slotHome = { ...r32Slots.home[matchId] };
      slotAway = { ...r32Slots.away[matchId] };
    } else {
      const homeChild = node.homeSource?.matchId;
      const awayChild = node.awaySource?.matchId;
      if (homeChild && winnerReach[homeChild]) {
        slotHome = { ...winnerReach[homeChild] };
      }
      if (awayChild && winnerReach[awayChild]) {
        slotAway = { ...winnerReach[awayChild] };
      }
    }

    slots[matchId] = { home: slotHome, away: slotAway };

    const knownWinner = getKnownWinner(knockoutResults, matchId);
    if (knownWinner) {
      const advance = emptyTeamMap();
      advance[knownWinner] = (slotHome[knownWinner] ?? 0) + (slotAway[knownWinner] ?? 0);
      winnerReach[matchId] = advance;
    } else {
      winnerReach[matchId] = computeWinProbs(slotHome, slotAway, eloRatings);
    }
  }

  return { slots, winnerReach, finishDist, teamThirdAdvance };
}

export function recomputeFromBracketAnalytical(
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  eliminated: Set<string>,
  eloRatings: Record<string, number>,
): AnalyticalResult {
  const { winnerReach, finishDist, teamThirdAdvance } = buildBracketSlotProbabilities(
    groupResults,
    knockoutResults,
    eloRatings,
  );

  const rawWeights = winnerReach["fin-1"] ?? emptyTeamMap();
  const probabilities = normalizeProbabilities(rawWeights, eliminated);

  return {
    probabilities,
    stats: {
      method: "analytical",
      unplayedGroupMatches: countUnplayedGroupMatches(groupResults),
    },
    finishRankDistribution: buildFinishRankDistribution(finishDist, teamThirdAdvance),
  };
}
