/**
 * Fetches completed World Cup results from openfootball/worldcup.json.
 *
 * - Group stage → ACTUAL_RESULTS (home-away scores)
 * - Knockout (R32→Final, skip bronze) → ACTUAL_KNOCKOUT_RESULTS + advancing thirds
 *
 * Source: https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json
 * Output: src/data/actual-results.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { lookupAnnexC } from "../src/data/annex-c-lookup";
import type { BracketNode } from "../src/data/knockout-bracket";
import { KNOCKOUT_TREE } from "../src/data/knockout-bracket";
import { R32_FIXTURES } from "../src/data/r32-fixtures";
import { teams } from "../src/data/teams";
import { resolveR32Participants } from "../src/data/tournament-paths";
import { computeGroupStandings, type StandingRow } from "../src/lib/standings";
import type { Match, MatchStage } from "../src/types";

const SOURCE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const OUTPUT_PATH = resolve(__dirname, "../src/data/actual-results.ts");

type OpenFootballMatch = {
  team1?: string;
  team2?: string;
  group?: string;
  round?: string;
  score?: {
    ft?: [number, number];
    et?: [number, number];
    p?: [number, number];
  };
};

type OpenFootballData = {
  matches?: OpenFootballMatch[];
};

type Fixture = { home: string; away: string };

type MatchResult = { homeScore: number; awayScore: number };

type KnockoutResult = {
  home: string;
  away: string;
  winner: string;
  homeScore: number;
  awayScore: number;
};

const OPENFOOTBALL_NAME_TO_TEAM_ID: Record<string, string> = {
  Algeria: "alg",
  Argentina: "arg",
  Australia: "aus",
  Austria: "aut",
  Belgium: "bel",
  "Bosnia & Herzegovina": "bih",
  "Bosnia and Herzegovina": "bih",
  Brazil: "bra",
  Canada: "can",
  "Cape Verde": "cpv",
  Colombia: "col",
  "Congo DR": "cod",
  "DR Congo": "cod",
  Croatia: "cro",
  Curaçao: "cuw",
  Curacao: "cuw",
  "Czech Republic": "cze",
  Czechia: "cze",
  Ecuador: "ecu",
  Egypt: "egy",
  England: "eng",
  France: "fra",
  Germany: "ger",
  Ghana: "gha",
  Haiti: "hai",
  Iran: "irn",
  "IR Iran": "irn",
  Iraq: "irq",
  "Ivory Coast": "civ",
  Japan: "jpn",
  Jordan: "jor",
  Mexico: "mex",
  Morocco: "mar",
  Netherlands: "ned",
  "New Zealand": "nzl",
  Norway: "nor",
  Panama: "pan",
  Paraguay: "par",
  Portugal: "por",
  Qatar: "qat",
  "Saudi Arabia": "ksa",
  Scotland: "sco",
  Senegal: "sen",
  "South Africa": "rsa",
  "South Korea": "kor",
  Spain: "esp",
  Sweden: "swe",
  Switzerland: "sui",
  Tunisia: "tun",
  Turkey: "tur",
  Türkiye: "tur",
  USA: "usa",
  "United States": "usa",
  Uruguay: "uru",
  Uzbekistan: "uzb",
};

const ROUND_TO_STAGE: Record<string, MatchStage | "skip"> = {
  "Round of 32": "round-of-32",
  "Round of 16": "round-of-16",
  "Quarter-final": "quarter-final",
  "Semi-final": "semi-final",
  Final: "final",
  "Match for third place": "skip",
};

function matchKey(home: string, away: string): string {
  return `${home}-${away}`;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

function collectKnockoutNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectKnockoutNodes(node.homeSource, acc);
  if (node.awaySource) collectKnockoutNodes(node.awaySource, acc);
  return acc;
}

const ALL_KNOCKOUT_NODES = collectKnockoutNodes(KNOCKOUT_TREE);

function buildGroupFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  const groups = [...new Set(teams.map((team) => team.group))].sort();

  groups.forEach((group) => {
    const groupTeams = teams
      .filter((team) => team.group === group)
      .sort((a, b) => a.groupPosition - b.groupPosition)
      .map((team) => team.id);
    const [t1, t2, t3, t4] = groupTeams;

    const pairings = [
      [
        [t1, t2],
        [t3, t4],
      ],
      [
        [t1, t3],
        [t2, t4],
      ],
      [
        [t1, t4],
        [t2, t3],
      ],
    ];

    pairings.forEach((round) => {
      round.forEach(([home, away]) => {
        fixtures.push({ home, away });
      });
    });
  });

  return fixtures;
}

function resolveTeamId(name: string): string | undefined {
  const direct = OPENFOOTBALL_NAME_TO_TEAM_ID[name];
  if (direct) return direct;
  return teams.find((t) => t.name === name)?.id;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "fifaworldcup-fetch/1.0" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

function combinations<T>(items: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, k - 1).map((c) => [first!, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function decisiveWinner(
  id1: string,
  id2: string,
  score: NonNullable<OpenFootballMatch["score"]>,
): { winner: string; homeScore: number; awayScore: number } | null {
  const ft = score.ft;
  if (!ft) return null;

  if (score.p) {
    const [p1, p2] = score.p;
    if (p1 === p2) return null;
    const winner = p1 > p2 ? id1 : id2;
    return {
      winner,
      homeScore: winner === id1 ? 1 : 0,
      awayScore: winner === id2 ? 1 : 0,
    };
  }

  if (score.et) {
    const [e1, e2] = score.et;
    if (e1 === e2) return null;
    const winner = e1 > e2 ? id1 : id2;
    return {
      winner,
      homeScore: winner === id1 ? 1 : 0,
      awayScore: winner === id2 ? 1 : 0,
    };
  }

  if (ft[0] === ft[1]) return null;
  const winner = ft[0] > ft[1] ? id1 : id2;
  return {
    winner,
    homeScore: winner === id1 ? 1 : 0,
    awayScore: winner === id2 ? 1 : 0,
  };
}

type OpenFootballKnockout = {
  stage: MatchStage;
  id1: string;
  id2: string;
  winner: string;
};

function parseKnockoutMatches(data: OpenFootballData): OpenFootballKnockout[] {
  const out: OpenFootballKnockout[] = [];
  for (const entry of data.matches ?? []) {
    const stage = entry.round ? ROUND_TO_STAGE[entry.round] : undefined;
    if (!stage || stage === "skip") continue;
    if (!entry.team1 || !entry.team2 || !entry.score) continue;
    const id1 = resolveTeamId(entry.team1);
    const id2 = resolveTeamId(entry.team2);
    if (!id1 || !id2) {
      throw new Error(`Unknown knockout team: ${entry.team1} vs ${entry.team2}`);
    }
    const decided = decisiveWinner(id1, id2, entry.score);
    if (!decided) {
      throw new Error(`Could not decide winner: ${entry.team1} vs ${entry.team2}`);
    }
    out.push({
      stage,
      id1,
      id2,
      winner: decided.winner,
    });
  }
  return out;
}

function buildStandingsFromGroupResults(
  groupResults: Record<string, MatchResult>,
): Record<string, StandingRow[]> {
  const matchList: Match[] = [];
  for (const [key, result] of Object.entries(groupResults)) {
    const [home, away] = key.split("-") as [string, string];
    matchList.push({
      id: key,
      stage: "group",
      day: 1,
      home,
      away,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      winner:
        result.homeScore > result.awayScore
          ? home
          : result.awayScore > result.homeScore
            ? away
            : undefined,
    });
  }
  return computeGroupStandings(matchList);
}

function findAdvancingThirdGroups(
  standings: Record<string, StandingRow[]>,
  r32Open: OpenFootballKnockout[],
): string[] {
  const expectedPairs = new Set(r32Open.map((m) => pairKey(m.id1, m.id2)));
  const allGroups = Object.keys(standings).sort();
  if (allGroups.length !== 12) {
    throw new Error(`Expected 12 groups, got ${allGroups.length}`);
  }

  for (const combo of combinations(allGroups, 8)) {
    if (!lookupAnnexC(combo)) continue;

    const resolvedPairs = new Set<string>();
    let ok = true;
    for (const fixture of R32_FIXTURES) {
      const { home, away } = resolveR32Participants(fixture.id, standings, combo);
      if (!home || !away) {
        ok = false;
        break;
      }
      resolvedPairs.add(pairKey(home, away));
    }
    if (!ok || resolvedPairs.size !== 16) continue;

    let matches = true;
    for (const pair of expectedPairs) {
      if (!resolvedPairs.has(pair)) {
        matches = false;
        break;
      }
    }
    if (matches) return combo;
  }

  throw new Error("Could not pin advancing third-place groups against openfootball R32");
}

function buildKnockoutResults(
  standings: Record<string, StandingRow[]>,
  advancingThirdGroups: string[],
  openMatches: OpenFootballKnockout[],
): Record<string, KnockoutResult> {
  const byPair = new Map<string, OpenFootballKnockout>();
  for (const match of openMatches) {
    byPair.set(pairKey(match.id1, match.id2), match);
  }

  const results: Record<string, KnockoutResult> = {};
  const winnerByMatchId = new Map<string, string>();

  for (const fixture of R32_FIXTURES) {
    const { home, away } = resolveR32Participants(
      fixture.id,
      standings,
      advancingThirdGroups,
    );
    if (!home || !away) {
      throw new Error(`Unresolved R32 ${fixture.id}`);
    }
    const open = byPair.get(pairKey(home, away));
    if (!open) {
      throw new Error(`No openfootball result for R32 ${fixture.id}: ${home} vs ${away}`);
    }
    results[fixture.id] = {
      home,
      away,
      winner: open.winner,
      homeScore: open.winner === home ? 1 : 0,
      awayScore: open.winner === away ? 1 : 0,
    };
    winnerByMatchId.set(fixture.id, open.winner);
  }

  const laterRounds = ALL_KNOCKOUT_NODES.filter(
    (node) => !node.matchId.startsWith("r32-") && node.homeSource && node.awaySource,
  );
  const remaining = [...laterRounds];
  while (remaining.length > 0) {
    const before = remaining.length;
    for (let i = remaining.length - 1; i >= 0; i--) {
      const node = remaining[i]!;
      const home = winnerByMatchId.get(node.homeSource!.matchId);
      const away = winnerByMatchId.get(node.awaySource!.matchId);
      if (!home || !away) continue;

      const open = byPair.get(pairKey(home, away));
      if (!open) {
        throw new Error(`No openfootball result for ${node.matchId}: ${home} vs ${away}`);
      }
      results[node.matchId] = {
        home,
        away,
        winner: open.winner,
        homeScore: open.winner === home ? 1 : 0,
        awayScore: open.winner === away ? 1 : 0,
      };
      winnerByMatchId.set(node.matchId, open.winner);
      remaining.splice(i, 1);
    }
    if (remaining.length === before) {
      const stuck = remaining.map((n) => n.matchId).join(", ");
      throw new Error(`Could not resolve knockout feeders for: ${stuck}`);
    }
  }

  return results;
}

async function main() {
  console.log("Fetching results from openfootball...");
  const data = await fetchJson<OpenFootballData>(SOURCE_URL);

  const fixtures = buildGroupFixtures();
  const fixtureByPair = new Map<string, Fixture>();
  for (const fixture of fixtures) {
    fixtureByPair.set(pairKey(fixture.home, fixture.away), fixture);
  }

  const groupResults: Record<string, MatchResult> = {};
  const unmatched: string[] = [];

  const groupMatches = (data.matches ?? []).filter(
    (m) => m.group?.startsWith("Group ") && m.score?.ft,
  );

  for (const entry of groupMatches) {
    const team1 = entry.team1;
    const team2 = entry.team2;
    const ft = entry.score?.ft;
    if (!team1 || !team2 || !ft) continue;

    const id1 = resolveTeamId(team1);
    const id2 = resolveTeamId(team2);
    if (!id1 || !id2) {
      unmatched.push(`${team1} vs ${team2} (unknown team name)`);
      continue;
    }

    const fixture = fixtureByPair.get(pairKey(id1, id2));
    if (!fixture) {
      unmatched.push(`${team1} vs ${team2} (not in app schedule)`);
      continue;
    }

    const [s1, s2] = ft;
    const key = matchKey(fixture.home, fixture.away);
    const homeScore = fixture.home === id1 ? s1 : s2;
    const awayScore = fixture.home === id1 ? s2 : s1;
    groupResults[key] = { homeScore, awayScore };
  }

  const missing = fixtures
    .filter((f) => !groupResults[matchKey(f.home, f.away)])
    .map((f) => matchKey(f.home, f.away));

  if (missing.length > 0) {
    console.log(`Scheduled group fixtures without results yet (${missing.length}):`);
    missing.forEach((key) => console.log(`  - ${key}`));
  }

  let advancingThirdGroups: string[] = [];
  let knockoutResults: Record<string, KnockoutResult> = {};

  if (missing.length === 0) {
    const standings = buildStandingsFromGroupResults(groupResults);
    const openKnockout = parseKnockoutMatches(data);
    const r32Open = openKnockout.filter((m) => m.stage === "round-of-32");
    if (r32Open.length === 16) {
      advancingThirdGroups = findAdvancingThirdGroups(standings, r32Open);
      console.log(`Pinned advancing thirds: ${[...advancingThirdGroups].sort().join("")}`);
      knockoutResults = buildKnockoutResults(standings, advancingThirdGroups, openKnockout);
      console.log(`Mapped ${Object.keys(knockoutResults).length} knockout results`);
      const final = knockoutResults["fin-1"];
      if (final) {
        console.log(`Final: ${final.home} vs ${final.away}, winner ${final.winner}`);
      }
    } else {
      console.log(
        `Knockout incomplete in source (R32 ${r32Open.length}/16); skipping KO import`,
      );
    }
  }

  const fetchedAt = new Date().toISOString();
  const file = `// Auto-generated by scripts/fetch-results.ts — do not edit manually.
// Source: ${SOURCE_URL}
// Fetched at: ${fetchedAt}

export const ACTUAL_RESULTS_FETCHED_AT = ${JSON.stringify(fetchedAt)};

export const ACTUAL_RESULTS: Record<string, { homeScore: number; awayScore: number }> = ${JSON.stringify(groupResults, null, 2)};

export const ACTUAL_ADVANCING_THIRD_GROUPS: string[] = ${JSON.stringify(advancingThirdGroups, null, 2)};

export type ActualKnockoutResult = {
  home: string;
  away: string;
  winner: string;
  homeScore: number;
  awayScore: number;
};

export const ACTUAL_KNOCKOUT_RESULTS: Record<string, ActualKnockoutResult> = ${JSON.stringify(knockoutResults, null, 2)};
`;

  writeFileSync(OUTPUT_PATH, file, "utf8");
  console.log(
    `Wrote ${Object.keys(groupResults).length} group + ${Object.keys(knockoutResults).length} knockout results to ${OUTPUT_PATH}`,
  );

  if (unmatched.length > 0) {
    console.warn(`Unmatched openfootball entries (${unmatched.length}):`);
    unmatched.forEach((line) => console.warn(`  - ${line}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
