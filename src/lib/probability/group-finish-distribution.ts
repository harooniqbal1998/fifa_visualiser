import { matches } from "@/data/matches";
import { teams } from "@/data/teams";
import { computeGroupStandings, type StandingRow } from "@/lib/standings";
import { expectedHomeWinProb } from "@/lib/probability/match-elo";
import { simResultToMatch } from "@/lib/simulation/sim-result";
import type { SimMatchResult } from "@/lib/simulation/types";
import type { Match } from "@/types";

export type FinishRankKey = "first" | "second" | "third" | "fourth";

export type FinishDistribution = Record<string, Record<FinishRankKey, number>>;

export type GroupOutcome = {
  prob: number;
  standings: StandingRow[];
  thirdTeamId: string;
  thirdPoints: number;
  thirdGd: number;
};

type UnplayedMatch = {
  matchId: string;
  home: string;
  away: string;
  homeWinProb: number;
};

function getUnplayedGroupMatchesForGroup(
  groupId: string,
  groupResults: SimMatchResult[],
  eloRatings: Record<string, number>,
): UnplayedMatch[] {
  const playedIds = new Set(groupResults.map((r) => r.matchId));
  const groupTeamIds = new Set(
    teams.filter((t) => t.group === groupId).map((t) => t.id),
  );

  return matches
    .filter(
      (m) =>
        m.stage === "group" &&
        !playedIds.has(m.id) &&
        groupTeamIds.has(m.home) &&
        groupTeamIds.has(m.away),
    )
    .map((m) => {
      const homeElo = eloRatings[m.home] ?? 1500;
      const awayElo = eloRatings[m.away] ?? 1500;
      return {
        matchId: m.id,
        home: m.home,
        away: m.away,
        homeWinProb: expectedHomeWinProb(homeElo, awayElo),
      };
    });
}

function enumerateGroupOutcomes(
  groupId: string,
  groupResults: SimMatchResult[],
  eloRatings: Record<string, number>,
): GroupOutcome[] {
  const knownMatches = groupResults
    .filter((r) => teams.find((t) => t.id === r.home)?.group === groupId)
    .map(simResultToMatch);

  const unplayed = getUnplayedGroupMatchesForGroup(groupId, groupResults, eloRatings);

  const outcomes: GroupOutcome[] = [];

  function recurse(index: number, synthetic: Match[]) {
    if (index >= unplayed.length) {
      const allMatches = [...knownMatches, ...synthetic];
      const standings = computeGroupStandings(allMatches)[groupId];
      if (!standings || standings.length < 4) return;

      const ranks: Record<string, FinishRankKey> = {};
      standings.forEach((row, i) => {
        const key: FinishRankKey[] = ["first", "second", "third", "fourth"];
        ranks[row.teamId] = key[i]!;
      });

      outcomes.push({
        prob: 1,
        standings,
        thirdTeamId: standings[2]!.teamId,
        thirdPoints: standings[2]!.points,
        thirdGd: standings[2]!.gd,
      });
      return;
    }

    const match = unplayed[index]!;
    const awayWinProb = 1 - match.homeWinProb;

    for (const [winner, prob] of [
      [match.home, match.homeWinProb],
      [match.away, awayWinProb],
    ] as const) {
      const homeScore = winner === match.home ? 2 : 1;
      const awayScore = winner === match.away ? 2 : 1;
      const before = outcomes.length;
      recurse(index + 1, [
        ...synthetic,
        {
          id: match.matchId,
          stage: "group",
          day: 0,
          home: match.home,
          away: match.away,
          homeScore,
          awayScore,
          winner,
        },
      ]);
      for (let i = before; i < outcomes.length; i++) {
        outcomes[i]!.prob *= prob;
      }
    }
  }

  recurse(0, []);

  if (outcomes.length === 0 && knownMatches.length > 0) {
    const standings = computeGroupStandings(knownMatches)[groupId];
    if (standings && standings.length >= 3) {
      outcomes.push({
        prob: 1,
        standings,
        thirdTeamId: standings[2]!.teamId,
        thirdPoints: standings[2]!.points,
        thirdGd: standings[2]!.gd,
      });
    }
  }

  return outcomes;
}

export function computeGroupOutcomesByGroup(
  groupResults: SimMatchResult[],
  eloRatings: Record<string, number>,
): Record<string, GroupOutcome[]> {
  const groupIds = [...new Set(teams.map((t) => t.group))].sort();
  const byGroup: Record<string, GroupOutcome[]> = {};

  for (const groupId of groupIds) {
    byGroup[groupId] = enumerateGroupOutcomes(groupId, groupResults, eloRatings);
  }

  return byGroup;
}

export function computeFinishDistributions(
  groupOutcomesByGroup: Record<string, GroupOutcome[]>,
): FinishDistribution {
  const dist: FinishDistribution = {};
  for (const team of teams) {
    dist[team.id] = { first: 0, second: 0, third: 0, fourth: 0 };
  }

  for (const outcomes of Object.values(groupOutcomesByGroup)) {
    for (const outcome of outcomes) {
      outcome.standings.forEach((row, index) => {
        const key: FinishRankKey[] = ["first", "second", "third", "fourth"];
        const rankKey = key[index];
        if (rankKey) {
          dist[row.teamId]![rankKey] += outcome.prob;
        }
      });
    }
  }

  return dist;
}
