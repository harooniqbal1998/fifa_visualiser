import type { Snapshot } from "@/types";
import { teams } from "./teams";
import { matches } from "./matches";
import { rankingToPrior } from "@/lib/simulation/advancement";
import {
  buildBracketState,
  getEliminatedFromResults,
} from "@/lib/simulation/bracket-state";
import type { SimMatchResult } from "@/lib/simulation/types";

const SEED_PRIORS: Record<string, number> = Object.fromEntries(
  teams.map((team) => [team.id, rankingToPrior(team.fifaRanking)]),
);

function getScriptedResultsUpToDay(day: number): SimMatchResult[] {
  return matches
    .filter((match) => match.day <= day && match.winner)
    .map((match) => ({
      matchId: match.id,
      stage: match.stage,
      day: match.day,
      home: match.home,
      away: match.away,
      winner: match.winner!,
    }));
}

function teamWonOnDay(teamId: string, day: number): boolean {
  return matches.some((match) => match.day === day && match.winner === teamId);
}

function buildProbabilities(day: number, eliminated: Set<string>): Record<string, number> {
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

export function buildSnapshots(): Snapshot[] {
  const snapshots: Snapshot[] = [];

  for (let day = 0; day <= 35; day++) {
    const allResults = getScriptedResultsUpToDay(day);
    const groupResults = allResults.filter((r) => r.stage === "group");
    const knockoutResults = allResults.filter((r) => r.stage !== "group");
    const eliminated = getEliminatedFromResults(day, knockoutResults, groupResults);
    const probabilities = buildProbabilities(day, eliminated);
    const { possibleOpponents, bracketDepths } = buildBracketState(
      day,
      knockoutResults,
      groupResults,
      eliminated,
    );

    snapshots.push({ day, probabilities, possibleOpponents, bracketDepths });
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
