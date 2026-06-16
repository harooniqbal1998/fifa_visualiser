import { lookupAnnexC } from "@/data/annex-c-lookup";
import {
  R32_FIXTURES_BY_ID,
  type FixtureSlot,
  type RankSlot,
  type ThirdSlot,
} from "@/data/r32-fixtures";
import { buildStandingsFromGroupResults } from "@/lib/simulation/advancement";
import type { SimMatchResult } from "@/lib/simulation/types";

type StandingsTable = Record<string, { teamId: string; points: number; gd: number }[]>;

export function getAdvancingThirdPlaceGroups(
  standings: StandingsTable,
): string[] {
  const thirdPlace: { group: string; points: number; gd: number }[] = [];

  for (const group of Object.keys(standings).sort()) {
    const table = standings[group];
    if (table[2]) {
      thirdPlace.push({ group, points: table[2].points, gd: table[2].gd });
    }
  }

  return thirdPlace
    .sort((a, b) => b.points - a.points || b.gd - a.gd)
    .slice(0, 8)
    .map((entry) => entry.group);
}

function resolveRankSlot(
  slot: RankSlot,
  standings: StandingsTable,
): string | undefined {
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

export function resolveR32Match(
  matchId: string,
  groupResults: SimMatchResult[],
): { home?: string; away?: string } {
  const fixture = R32_FIXTURES_BY_ID[matchId];
  if (!fixture) return {};

  const standings = buildStandingsFromGroupResults(groupResults);
  const advancingThirdGroups = getAdvancingThirdPlaceGroups(standings);

  return {
    home: resolveFixtureSlot(fixture.home, standings, advancingThirdGroups),
    away: resolveFixtureSlot(fixture.away, standings, advancingThirdGroups),
  };
}
