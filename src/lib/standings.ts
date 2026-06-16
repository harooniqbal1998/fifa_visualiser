import type { Match } from "@/types";
import { teams } from "@/data/teams";

export type StandingRow = {
  teamId: string;
  points: number;
  gd: number;
  played: number;
};

export function computeGroupStandings(matchList: Match[]): Record<string, StandingRow[]> {
  const standings: Record<string, StandingRow[]> = {};

  for (const team of teams) {
    if (!standings[team.group]) {
      standings[team.group] = teams
        .filter((entry) => entry.group === team.group)
        .map((entry) => ({ teamId: entry.id, points: 0, gd: 0, played: 0 }));
    }
  }

  for (const match of matchList.filter((entry) => entry.stage === "group")) {
    if (match.homeScore === undefined || match.awayScore === undefined) {
      continue;
    }

    const homeTeam = teams.find((team) => team.id === match.home);
    if (!homeTeam) continue;

    const table = standings[homeTeam.group];
    const home = table.find((row) => row.teamId === match.home);
    const away = table.find((row) => row.teamId === match.away);
    if (!home || !away) continue;

    const { homeScore, awayScore } = match;
    home.played += 1;
    away.played += 1;
    home.gd += homeScore - awayScore;
    away.gd += awayScore - homeScore;

    if (homeScore > awayScore) {
      home.points += 3;
    } else if (awayScore > homeScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  for (const group of Object.keys(standings)) {
    standings[group].sort((a, b) => b.points - a.points || b.gd - a.gd);
  }

  return standings;
}
