import type { Snapshot } from "@/types";
import { teams } from "./teams";
import { matches } from "./matches";

const SEED_PRIORS: Record<string, number> = {
  arg: 14.5,
  fra: 13.0,
  bra: 12.5,
  eng: 10.0,
  esp: 9.5,
  ger: 8.5,
  por: 7.0,
  ned: 6.5,
  bel: 5.0,
  uru: 4.5,
  col: 4.0,
  usa: 3.5,
  mex: 3.0,
  cro: 2.8,
  sui: 2.5,
  den: 2.3,
  jpn: 2.2,
  kor: 2.0,
  mar: 1.8,
  sen: 1.7,
  aut: 1.6,
  tur: 1.5,
  irn: 1.4,
  pol: 1.3,
  sco: 1.2,
  ecu: 1.1,
  ukr: 1.0,
  nor: 0.9,
  alg: 0.8,
  aus: 0.8,
  gha: 0.7,
  crc: 0.6,
  par: 0.6,
  tun: 0.5,
  egy: 0.5,
  civ: 0.5,
  bol: 0.4,
  jor: 0.4,
  uzb: 0.4,
  pan: 0.3,
  cuw: 0.3,
  nzl: 0.3,
  ksa: 0.3,
  cpv: 0.3,
  hai: 0.3,
  qat: 0.3,
  rsa: 0.3,
};

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

function getGroupStandings() {
  const standings: Record<string, { teamId: string; points: number; gd: number }[]> = {};

  for (const team of teams) {
    if (!standings[team.group]) {
      standings[team.group] = teams
        .filter((entry) => entry.group === team.group)
        .map((entry) => ({ teamId: entry.id, points: 0, gd: 0 }));
    }
  }

  for (const match of matches.filter((entry) => entry.stage === "group" && entry.winner)) {
    const homeTeam = teams.find((team) => team.id === match.home);
    if (!homeTeam) continue;

    const table = standings[homeTeam.group];
    const home = table.find((row) => row.teamId === match.home);
    const away = table.find((row) => row.teamId === match.away);
    if (!home || !away) continue;

    if (match.winner === match.home) {
      home.points += 3;
      home.gd += 1;
      away.gd -= 1;
    } else {
      away.points += 3;
      away.gd += 1;
      home.gd -= 1;
    }
  }

  for (const group of Object.keys(standings)) {
    standings[group].sort((a, b) => b.points - a.points || b.gd - a.gd);
  }

  return standings;
}

function getAdvancingTeams(): Set<string> {
  const standings = getGroupStandings();
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
    const advancing = getAdvancingTeams();
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

    return teams
      .filter(
        (entry) =>
          entry.group === team.group &&
          entry.id !== teamId &&
          !eliminated.has(entry.id),
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
