import type { Snapshot } from "@/types";
import { deriveTournamentStateAtDay } from "@/lib/probability/derive-tournament-state";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";
import { getScriptedResultsUpToDay } from "@/lib/simulation/advancement";
import { buildBracketState, getEliminatedFromResults } from "@/lib/simulation/bracket-state";

function captureSnapshot(
  day: number,
  derived: ReturnType<typeof deriveTournamentStateAtDay>,
): Snapshot {
  const { probability, groupResults, knockoutResults } = derived;
  const eliminated = getEliminatedFromResults(day, knockoutResults, groupResults);
  const { possibleOpponents, bracketDepths } = buildBracketState(
    day,
    knockoutResults,
    groupResults,
    eliminated,
  );
  return {
    day,
    probabilities: { ...probability.probabilities },
    possibleOpponents,
    bracketDepths,
    eliminatedTeamIds: [...eliminated],
  };
}

/** One forward pass through the calendar; snapshot at end of each day. */
export function buildSnapshots(): Snapshot[] {
  const config = DEFAULT_PROBABILITY_CONFIG;
  const snapshots: Snapshot[] = [];

  for (let day = 0; day <= 35; day++) {
    const scripted = getScriptedResultsUpToDay(day);
    const derived = deriveTournamentStateAtDay(day, config, scripted);
    snapshots.push(captureSnapshot(day, derived));
  }

  return snapshots;
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("node:fs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("node:path");
  console.log("Building snapshots...");
  const start = Date.now();
  const snapshots = buildSnapshots();
  const output = `import type { Snapshot } from "@/types";

export const snapshots: Snapshot[] = ${JSON.stringify(snapshots, null, 2)} as Snapshot[];

export const snapshotsByDay: Record<number, Snapshot> = Object.fromEntries(
  snapshots.map((snapshot) => [snapshot.day, snapshot]),
);
`;

  const target = path.join(__dirname, "snapshots.ts");
  fs.writeFileSync(target, output, "utf8");
  console.log(`Wrote ${snapshots.length} snapshots in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}
