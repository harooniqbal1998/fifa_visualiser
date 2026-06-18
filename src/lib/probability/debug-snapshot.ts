import { teams, teamsById } from "@/data/teams";
import {
  getKnockoutChain,
  getR32EntryForTeam,
  canTeamsMeetBeforeFinal,
  type GroupFinish,
} from "@/data/tournament-paths";
import type { AnalyticalStats } from "@/lib/probability/bracket-analytical";
import type { ProbabilityState, ProbUpdateEvent } from "@/lib/probability/types";
import { countUnplayedGroupMatches } from "@/lib/probability/unplayed-group-matches";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
} from "@/lib/simulation/group-advancement";
import type { SimMatchResult } from "@/lib/simulation/types";
import { createSeededRng } from "@/lib/simulation/animation-params";

export type DebugSnapshotContext = {
  day: number;
  groupResults: SimMatchResult[];
  knockoutResults: SimMatchResult[];
  method: "opening" | "bracket_analytical";
};

export type TeamDebugRow = {
  id: string;
  name: string;
  probability: number;
  delta: number;
  elo: number;
  eliminated: boolean;
};

export type PathInspector = {
  teamId: string;
  group: string;
  r32MatchId: string | null;
  bracketHalf: string | null;
  chain: { r32: string; r16: string; qf: string; sf: string; final: string } | null;
  finishDistribution: { first: number; second: number; third: number; eliminated: number } | null;
  finalOnlyOpponents: string[];
};

export type ProbabilityDebugSnapshot = {
  day: number;
  method: "opening" | "bracket_analytical";
  probSum: number;
  analyticalStats: AnalyticalStats | null;
  topTeams: TeamDebugRow[];
  lastDeltas: ProbUpdateEvent[];
  groupStandings: Record<string, { teamId: string; points: number; gd: number }[]>;
  resultsCounts: {
    knownGroup: number;
    knownKnockout: number;
    unplayedGroup: number;
  };
  pathInspector: PathInspector | null;
};

export function buildDebugSnapshot(
  state: ProbabilityState,
  context: DebugSnapshotContext,
  focusTeamId?: string,
): ProbabilityDebugSnapshot {
  const standings = buildStandingsFromGroupResults(context.groupResults);
  const rng = createSeededRng(42 + context.day);
  const advancingThirdGroups = selectAdvancingThirdPlaceGroups(standings, rng);

  const probSum = Number(
    teams
      .filter((t) => !state.eliminated.has(t.id))
      .reduce((sum, t) => sum + (state.probabilities[t.id] ?? 0), 0)
      .toFixed(2),
  );

  const deltasByTeam = new Map<string, number>();
  for (const d of state.lastDeltas) {
    deltasByTeam.set(d.teamId, (deltasByTeam.get(d.teamId) ?? 0) + d.deltaPct);
  }

  const topTeams: TeamDebugRow[] = teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      probability: state.probabilities[team.id] ?? 0,
      delta: deltasByTeam.get(team.id) ?? 0,
      elo: state.eloRatings[team.id] ?? 1500,
      eliminated: state.eliminated.has(team.id),
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 12);

  const focusId = focusTeamId ?? topTeams[0]?.id ?? "esp";
  const focusTeam = teamsById[focusId];
  let pathInspector: PathInspector | null = null;

  if (focusTeam) {
    const table = standings[focusTeam.group];
    const rank = table?.findIndex((r) => r.teamId === focusId);
    const finishRank = rank !== undefined && rank >= 0 ? ((rank + 1) as GroupFinish) : null;
    const entry =
      finishRank && finishRank <= 3
        ? getR32EntryForTeam(focusTeam.group, finishRank as 1 | 2 | 3, advancingThirdGroups)
        : null;
    const chain = entry ? getKnockoutChain(entry.r32MatchId) : null;

    const finalOnlyOpponents: string[] = [];
    if (finishRank && finishRank <= 3) {
      for (const other of teams) {
        if (other.id === focusId) continue;
        const otherTable = standings[other.group];
        const otherRankIdx = otherTable?.findIndex((r) => r.teamId === other.id);
        const otherFinish =
          otherRankIdx !== undefined && otherRankIdx >= 0
            ? ((otherRankIdx + 1) as GroupFinish)
            : null;
        if (
          otherFinish &&
          otherFinish <= 3 &&
          !canTeamsMeetBeforeFinal(
            focusTeam.group,
            finishRank as GroupFinish,
            other.group,
            otherFinish,
            advancingThirdGroups,
          )
        ) {
          finalOnlyOpponents.push(other.name);
        }
      }
    }

    const finishDist = state.finishRankDistribution?.[focusId] ?? null;

    pathInspector = {
      teamId: focusId,
      group: focusTeam.group,
      r32MatchId: entry?.r32MatchId ?? null,
      bracketHalf: entry?.bracketHalf ?? null,
      chain,
      finishDistribution: finishDist,
      finalOnlyOpponents: finalOnlyOpponents.slice(0, 8),
    };
  }

  const groupStandingsFormatted: ProbabilityDebugSnapshot["groupStandings"] = {};
  for (const [group, table] of Object.entries(standings)) {
    groupStandingsFormatted[group] = table.map((r) => ({
      teamId: r.teamId,
      points: r.points,
      gd: r.gd,
    }));
  }

  return {
    day: context.day,
    method: context.method,
    probSum,
    analyticalStats: state.lastAnalyticalStats ?? null,
    topTeams,
    lastDeltas: state.lastDeltas,
    groupStandings: groupStandingsFormatted,
    resultsCounts: {
      knownGroup: context.groupResults.length,
      knownKnockout: context.knockoutResults.length,
      unplayedGroup: countUnplayedGroupMatches(context.groupResults),
    },
    pathInspector,
  };
}
