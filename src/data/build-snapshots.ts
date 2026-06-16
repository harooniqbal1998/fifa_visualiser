import type { Snapshot } from "@/types";
import { teams } from "./teams";
import { matches } from "./matches";
import { computeGroupStandings } from "@/lib/standings";

function rankingToPrior(rank: number): number {
  return Math.max(0.3, (50 - rank) * 0.35);
}

const SEED_PRIORS: Record<string, number> = Object.fromEntries(
  teams.map((team) => [team.id, rankingToPrior(team.fifaRanking)]),
);

type BracketNode = {
  matchId: string;
  home?: string;
  away?: string;
  winner?: string;
  homeSource?: BracketNode;
  awaySource?: BracketNode;
};

const KNOCKOUT_TREE: BracketNode = {
  matchId: "fin-1",
  homeSource: {
    matchId: "sf-1",
    homeSource: {
      matchId: "qf-1",
      homeSource: { matchId: "r16-1", homeSource: { matchId: "r32-1" }, awaySource: { matchId: "r32-2" } },
      awaySource: { matchId: "r16-2", homeSource: { matchId: "r32-3" }, awaySource: { matchId: "r32-4" } },
    },
    awaySource: {
      matchId: "qf-2",
      homeSource: { matchId: "r16-3", homeSource: { matchId: "r32-5" }, awaySource: { matchId: "r32-6" } },
      awaySource: { matchId: "r16-4", homeSource: { matchId: "r32-7" }, awaySource: { matchId: "r32-8" } },
    },
  },
  awaySource: {
    matchId: "sf-2",
    homeSource: {
      matchId: "qf-3",
      homeSource: { matchId: "r16-5", homeSource: { matchId: "r32-9" }, awaySource: { matchId: "r32-10" } },
      awaySource: { matchId: "r16-6", homeSource: { matchId: "r32-11" }, awaySource: { matchId: "r32-12" } },
    },
    awaySource: {
      matchId: "qf-4",
      homeSource: { matchId: "r16-7", homeSource: { matchId: "r32-13" }, awaySource: { matchId: "r32-14" } },
      awaySource: { matchId: "r16-8", homeSource: { matchId: "r32-15" }, awaySource: { matchId: "r32-16" } },
    },
  },
};

function getMatchById(id: string) {
  return matches.find((match) => match.id === id);
}

function collectPossibleTeams(node: BracketNode, day: number): string[] {
  const match = getMatchById(node.matchId);
  if (!match) return [];

  if (match.day <= day && match.winner) {
    return [match.winner];
  }

  if (node.homeSource && node.awaySource) {
    return [
      ...collectPossibleTeams(node.homeSource, day),
      ...collectPossibleTeams(node.awaySource, day),
    ];
  }

  if (match.home && match.away) {
    return [match.home, match.away];
  }

  return [];
}

function getGroupStandingsAsOfDay(day: number) {
  const played = matches.filter(
    (match) =>
      match.stage === "group" &&
      match.day <= day &&
      match.homeScore !== undefined &&
      match.awayScore !== undefined,
  );
  return computeGroupStandings(played);
}

function getAdvancingTeams(day: number): Set<string> {
  const standings = getGroupStandingsAsOfDay(day);
  const advancing = new Set<string>();
  const thirdPlace: { teamId: string; points: number; gd: number }[] = [];

  for (const group of Object.keys(standings).sort()) {
    const table = standings[group];
    advancing.add(table[0].teamId);
    advancing.add(table[1].teamId);
    thirdPlace.push(table[2]);
  }

  thirdPlace
    .sort((a, b) => b.points - a.points || b.gd - a.gd)
    .slice(0, 8)
    .forEach((entry) => advancing.add(entry.teamId));

  return advancing;
}

function getEliminatedAsOfDay(day: number): Set<string> {
  const eliminated = new Set<string>();

  if (day >= 12) {
    const advancing = getAdvancingTeams(day);
    for (const team of teams) {
      if (!advancing.has(team.id)) {
        eliminated.add(team.id);
      }
    }
  }

  for (const match of matches) {
    if (match.day > day || !match.winner || match.stage === "group") {
      continue;
    }
    const loser = match.winner === match.home ? match.away : match.home;
    eliminated.add(loser);
  }

  return eliminated;
}

function teamWonOnDay(teamId: string, day: number): boolean {
  return matches.some(
    (match) => match.day === day && match.winner === teamId,
  );
}

function buildProbabilities(day: number, eliminated: Set<string>): Record<string, number> {
  const finalMatch = matches.find((match) => match.stage === "final");
  if (finalMatch && day >= finalMatch.day && finalMatch.winner) {
    const probs: Record<string, number> = {};
    for (const team of teams) {
      probs[team.id] = team.id === finalMatch.winner ? 100 : 0;
    }
    return probs;
  }

  const raw: Record<string, number> = {};
  let total = 0;

  for (const team of teams) {
    if (eliminated.has(team.id)) {
      raw[team.id] = 0;
      continue;
    }

    const base = SEED_PRIORS[team.id] ?? 1;
    const boost = teamWonOnDay(team.id, day) ? 1.12 : 1;
    raw[team.id] = base * boost;
    total += raw[team.id];
  }

  const probs: Record<string, number> = {};
  for (const team of teams) {
    probs[team.id] =
      raw[team.id] === 0 ? 0 : Number(((raw[team.id] / total) * 100).toFixed(2));
  }

  return probs;
}

function getPossibleOpponents(teamId: string, day: number, eliminated: Set<string>): string[] {
  if (eliminated.has(teamId)) {
    return [];
  }

  if (day < 12) {
    const team = teams.find((entry) => entry.id === teamId);
    if (!team) return [];

    const playedOpponents = new Set<string>();
    for (const match of matches) {
      if (
        match.stage !== "group" ||
        match.day > day ||
        match.homeScore === undefined
      ) {
        continue;
      }
      if (match.home === teamId) playedOpponents.add(match.away);
      if (match.away === teamId) playedOpponents.add(match.home);
    }

    return teams
      .filter(
        (entry) =>
          entry.group === team.group &&
          entry.id !== teamId &&
          !eliminated.has(entry.id) &&
          !playedOpponents.has(entry.id),
      )
      .map((entry) => entry.id);
  }

  const opponents = new Set<string>();

  function walk(node: BracketNode) {
    const match = getMatchById(node.matchId);
    if (!match) return;

    const branchTeams = collectPossibleTeams(node, day);
    if (branchTeams.includes(teamId)) {
      for (const candidate of branchTeams) {
        if (candidate !== teamId && !eliminated.has(candidate)) {
          opponents.add(candidate);
        }
      }
      return;
    }

    if (node.homeSource) walk(node.homeSource);
    if (node.awaySource) walk(node.awaySource);
  }

  walk(KNOCKOUT_TREE);

  const resolvedFinalists = collectPossibleTeams(KNOCKOUT_TREE, day);
  if (resolvedFinalists.length === 2 && resolvedFinalists.includes(teamId)) {
    const otherFinalist = resolvedFinalists.find((id) => id !== teamId);
    return otherFinalist ? [otherFinalist] : [];
  }

  return [...opponents].sort();
}

export function buildSnapshots(): Snapshot[] {
  const snapshots: Snapshot[] = [];

  for (let day = 0; day <= 35; day++) {
    const eliminated = getEliminatedAsOfDay(day);
    const probabilities = buildProbabilities(day, eliminated);
    const possibleOpponents: Record<string, string[]> = {};

    for (const team of teams) {
      possibleOpponents[team.id] = getPossibleOpponents(team.id, day, eliminated);
    }

    snapshots.push({ day, probabilities, possibleOpponents });
  }

  return snapshots;
}

if (require.main === module) {
  const fs = require("node:fs");
  const path = require("node:path");
  const snapshots = buildSnapshots();

  const output = `import type { Snapshot } from "@/types";

export const snapshots: Snapshot[] = ${JSON.stringify(snapshots, null, 2)} as Snapshot[];

export const snapshotsByDay: Record<number, Snapshot> = Object.fromEntries(
  snapshots.map((snapshot) => [snapshot.day, snapshot]),
);
`;

  const target = path.join(__dirname, "snapshots.ts");
  fs.writeFileSync(target, output, "utf8");
  console.log(`Wrote ${snapshots.length} snapshots to ${target}`);
}
