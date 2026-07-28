import { ACTUAL_ADVANCING_THIRD_GROUPS, ACTUAL_KNOCKOUT_RESULTS } from "@/data/actual-results";
import type { StandingRow } from "@/lib/standings";
import { computeGroupStandings } from "@/lib/standings";
import { simResultToMatch } from "@/lib/simulation/sim-result";
import type { SimMatchResult } from "@/lib/simulation/types";

export type StandingsTable = Record<string, StandingRow[]>;

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

/** Best 8 third-place groups: sort by points, random tiebreak (no GD). */
export function selectAdvancingThirdPlaceGroups(
  standings: StandingsTable,
  rng: () => number,
): string[] {
  const thirdPlace: { group: string; points: number }[] = [];

  for (const group of Object.keys(standings).sort()) {
    const table = standings[group];
    if (table?.[2]) {
      thirdPlace.push({ group, points: table[2].points });
    }
  }

  const byPoints = new Map<number, string[]>();
  for (const entry of thirdPlace) {
    const list = byPoints.get(entry.points) ?? [];
    list.push(entry.group);
    byPoints.set(entry.points, list);
  }

  const sortedPoints = [...byPoints.keys()].sort((a, b) => b - a);
  const ordered: string[] = [];
  for (const pts of sortedPoints) {
    const groups = [...(byPoints.get(pts) ?? [])];
    shuffleInPlace(groups, rng);
    ordered.push(...groups);
  }

  return ordered.slice(0, 8);
}

function historicalThirdsMatchStandings(standings: StandingsTable): boolean {
  if (ACTUAL_ADVANCING_THIRD_GROUPS.length !== 8) return false;

  const r32Teams = new Set<string>();
  for (const [id, result] of Object.entries(ACTUAL_KNOCKOUT_RESULTS)) {
    if (!id.startsWith("r32-")) continue;
    r32Teams.add(result.home);
    r32Teams.add(result.away);
  }
  if (r32Teams.size !== 32) return false;

  for (const group of ACTUAL_ADVANCING_THIRD_GROUPS) {
    const third = standings[group]?.[2]?.teamId;
    if (!third || !r32Teams.has(third)) return false;
  }
  return true;
}

/** Prefer pinned historical thirds when standings match the real tournament. */
export function resolveAdvancingThirdPlaceGroups(
  standings: StandingsTable,
  rng: () => number,
  explicit?: string[],
): string[] {
  if (explicit && explicit.length === 8) return explicit;

  if (historicalThirdsMatchStandings(standings)) {
    return [...ACTUAL_ADVANCING_THIRD_GROUPS];
  }

  return selectAdvancingThirdPlaceGroups(standings, rng);
}

export function getAdvancingTeamIds(
  groupResults: SimMatchResult[],
  rng: () => number,
): Set<string> {
  const standings = buildStandingsFromGroupResults(groupResults);
  const advancingThirdGroups = resolveAdvancingThirdPlaceGroups(standings, rng);
  return getAdvancingTeamIdsFromThirdGroups(standings, advancingThirdGroups);
}

export function getAdvancingTeamIdsFromThirdGroups(
  standings: StandingsTable,
  advancingThirdGroups: string[],
): Set<string> {
  const advancing = new Set<string>();

  for (const group of Object.keys(standings).sort()) {
    const table = standings[group];
    if (!table) continue;
    if (table[0]) advancing.add(table[0].teamId);
    if (table[1]) advancing.add(table[1].teamId);
    if (advancingThirdGroups.includes(group) && table[2]) {
      advancing.add(table[2].teamId);
    }
  }

  return advancing;
}

export function buildStandingsFromGroupResults(
  groupResults: SimMatchResult[],
): StandingsTable {
  return computeGroupStandings(groupResults.map(simResultToMatch));
}
