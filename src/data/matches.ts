import type { Match, MatchStage } from "@/types";
import { teams } from "./teams";
import { ACTUAL_RESULTS } from "./actual-results";

function matchKey(home: string, away: string): string {
  return `${home}-${away}`;
}

function resultToWinner(
  home: string,
  away: string,
  homeScore: number,
  awayScore: number,
): string | undefined {
  if (homeScore > awayScore) return home;
  if (awayScore > homeScore) return away;
  return undefined;
}

function buildGroupMatches(): Match[] {
  const matches: Match[] = [];
  const groups = [...new Set(teams.map((team) => team.group))].sort();
  const matchdays = [1, 5, 9];

  groups.forEach((group, groupIndex) => {
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

    pairings.forEach((round, roundIndex) => {
      const day = matchdays[roundIndex] + Math.floor(groupIndex / 3);
      round.forEach(([home, away], matchIndex) => {
        const result = ACTUAL_RESULTS[matchKey(home, away)];
        const match: Match = {
          id: `grp-${group.toLowerCase()}-md${roundIndex + 1}-${matchIndex + 1}`,
          stage: "group",
          day,
          home,
          away,
        };
        if (result) {
          match.homeScore = result.homeScore;
          match.awayScore = result.awayScore;
          match.winner = resultToWinner(
            home,
            away,
            result.homeScore,
            result.awayScore,
          );
        }
        matches.push(match);
      });
    });
  });

  return matches;
}

type KnockoutScheduleEntry = {
  id: string;
  stage: MatchStage;
  day: number;
};

const KNOCKOUT_SCHEDULE: KnockoutScheduleEntry[] = [
  { id: "r32-1", stage: "round-of-32", day: 13 },
  { id: "r32-2", stage: "round-of-32", day: 13 },
  { id: "r32-3", stage: "round-of-32", day: 13 },
  { id: "r32-4", stage: "round-of-32", day: 14 },
  { id: "r32-5", stage: "round-of-32", day: 14 },
  { id: "r32-6", stage: "round-of-32", day: 14 },
  { id: "r32-7", stage: "round-of-32", day: 15 },
  { id: "r32-8", stage: "round-of-32", day: 15 },
  { id: "r32-9", stage: "round-of-32", day: 16 },
  { id: "r32-10", stage: "round-of-32", day: 16 },
  { id: "r32-11", stage: "round-of-32", day: 16 },
  { id: "r32-12", stage: "round-of-32", day: 16 },
  { id: "r32-13", stage: "round-of-32", day: 16 },
  { id: "r32-14", stage: "round-of-32", day: 16 },
  { id: "r32-15", stage: "round-of-32", day: 16 },
  { id: "r32-16", stage: "round-of-32", day: 16 },
  { id: "r16-1", stage: "round-of-16", day: 21 },
  { id: "r16-2", stage: "round-of-16", day: 21 },
  { id: "r16-3", stage: "round-of-16", day: 22 },
  { id: "r16-4", stage: "round-of-16", day: 22 },
  { id: "r16-5", stage: "round-of-16", day: 23 },
  { id: "r16-6", stage: "round-of-16", day: 23 },
  { id: "r16-7", stage: "round-of-16", day: 24 },
  { id: "r16-8", stage: "round-of-16", day: 24 },
  { id: "qf-1", stage: "quarter-final", day: 27 },
  { id: "qf-2", stage: "quarter-final", day: 27 },
  { id: "qf-3", stage: "quarter-final", day: 28 },
  { id: "qf-4", stage: "quarter-final", day: 28 },
  { id: "sf-1", stage: "semi-final", day: 31 },
  { id: "sf-2", stage: "semi-final", day: 32 },
  { id: "fin-1", stage: "final", day: 35 },
];

function buildKnockoutMatches(): Match[] {
  return KNOCKOUT_SCHEDULE.map(({ id, stage, day }) => ({
    id,
    stage,
    day,
    home: "",
    away: "",
  }));
}

export const matches: Match[] = [...buildGroupMatches(), ...buildKnockoutMatches()].sort(
  (a, b) => a.day - b.day || a.id.localeCompare(b.id),
);

export const matchesByDay: Record<number, Match[]> = matches.reduce<
  Record<number, Match[]>
>((acc, match) => {
  if (!acc[match.day]) {
    acc[match.day] = [];
  }
  acc[match.day].push(match);
  return acc;
}, {});

const STAGE_PRIORITY: MatchStage[] = [
  "group",
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "final",
];

const stagePriorityMap = STAGE_PRIORITY.reduce<Record<MatchStage, number>>(
  (acc, stage, index) => {
    acc[stage] = index;
    return acc;
  },
  {} as Record<MatchStage, number>,
);

export type TimelineDay = {
  day: number;
  stage: MatchStage;
};

export const timelineDays: TimelineDay[] = Object.keys(matchesByDay)
  .map(Number)
  .sort((a, b) => a - b)
  .map((day) => {
    const stages = [...new Set(matchesByDay[day].map((match) => match.stage))];
    stages.sort((a, b) => stagePriorityMap[a] - stagePriorityMap[b]);
    return {
      day,
      stage: stages[0],
    };
  });

export function hasActualResult(match: Match): boolean {
  return match.homeScore !== undefined && match.awayScore !== undefined;
}

export function isSimStartDay(day: number): boolean {
  if (day === 0) return true;
  return matches
    .filter((match) => match.day < day && match.home !== "" && match.away !== "")
    .every(hasActualResult);
}

export function getSimStartDays(): number[] {
  return timelineDays.map((entry) => entry.day).filter(isSimStartDay);
}

export function getLatestSimStartDay(): number {
  const days = getSimStartDays();
  return days[days.length - 1] ?? 0;
}

export function getPlayedMatchesUpToDay(day: number): Match[] {
  return matches.filter(
    (match) =>
      match.day <= day &&
      match.homeScore !== undefined &&
      match.awayScore !== undefined,
  );
}
