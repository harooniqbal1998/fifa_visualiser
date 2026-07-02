import { snapshotsByDay } from "@/data/snapshots";
import type { ProbabilityState } from "@/lib/probability/types";
import type { SimulationSessionPhase } from "@/components/viz/petal/petal-simulation-visualization";
import type { Snapshot } from "@/types";

export type TeamProbSummary = {
  teamId: string;
  winPct: number;
  deltaPct: number;
};

export function getSnapshotDayDelta(teamId: string, day: number): number {
  if (day <= 0) return 0;
  const current = snapshotsByDay[day]?.probabilities[teamId] ?? 0;
  const previous = snapshotsByDay[day - 1]?.probabilities[teamId] ?? 0;
  return Number((current - previous).toFixed(2));
}

export function getLiveDelta(teamId: string, liveState: ProbabilityState | null): number {
  if (!liveState) return 0;
  const event = liveState.lastDeltas.find((d) => d.teamId === teamId);
  return event?.deltaPct ?? 0;
}

export function getStarredTeamSummaries({
  starredIds,
  day,
  sessionPhase,
  liveState,
  snapshot,
}: {
  starredIds: string[];
  day: number;
  sessionPhase: SimulationSessionPhase;
  liveState: ProbabilityState | null;
  snapshot: Snapshot;
}): TeamProbSummary[] {
  const isRunning = sessionPhase === "running";
  const useLiveProbabilities =
    sessionPhase === "running" ||
    sessionPhase === "paused" ||
    sessionPhase === "completed";

  return starredIds.map((teamId) => {
    const winPct = useLiveProbabilities
      ? (liveState?.probabilities[teamId] ?? snapshot.probabilities[teamId] ?? 0)
      : (snapshot.probabilities[teamId] ?? 0);

    const deltaPct = useLiveProbabilities
      ? getLiveDelta(teamId, liveState)
      : getSnapshotDayDelta(teamId, day);

    return {
      teamId,
      winPct: Number(winPct.toFixed(1)),
      deltaPct,
    };
  });
}
