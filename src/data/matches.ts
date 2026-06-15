import type { Match, MatchStage } from "@/types";
import { teams } from "./teams";

const GROUP_MATCH_WINNERS: Record<string, string> = {
  // Group A
  "mex-rsa": "mex",
  "kor-den": "den",
  "mex-kor": "mex",
  "rsa-den": "den",
  "mex-den": "den",
  "rsa-kor": "kor",
  // Group B
  "can-qat": "can",
  "sui-ecu": "sui",
  "can-sui": "sui",
  "qat-ecu": "ecu",
  "can-ecu": "ecu",
  "qat-sui": "sui",
  // Group C
  "bra-mar": "bra",
  "hai-sco": "sco",
  "bra-hai": "bra",
  "mar-sco": "mar",
  "bra-sco": "bra",
  "mar-hai": "mar",
  // Group D
  "usa-aus": "usa",
  "par-tur": "tur",
  "usa-par": "usa",
  "aus-tur": "aus",
  "usa-tur": "tur",
  "aus-par": "par",
  // Group E
  "ger-cuw": "ger",
  "civ-pol": "civ",
  "ger-civ": "ger",
  "cuw-pol": "pol",
  "ger-pol": "ger",
  "cuw-civ": "civ",
  // Group F
  "ned-jpn": "ned",
  "tun-ukr": "ukr",
  "ned-tun": "ned",
  "jpn-ukr": "jpn",
  "ned-ukr": "ned",
  "jpn-tun": "jpn",
  // Group G
  "bel-egy": "bel",
  "irn-nzl": "irn",
  "bel-irn": "bel",
  "egy-nzl": "egy",
  "bel-nzl": "bel",
  "egy-irn": "irn",
  // Group H
  "esp-cpv": "esp",
  "ksa-uru": "uru",
  "esp-ksa": "esp",
  "cpv-uru": "uru",
  "esp-uru": "esp",
  "cpv-ksa": "ksa",
  // Group I
  "fra-sen": "fra",
  "nor-bol": "nor",
  "fra-nor": "fra",
  "sen-bol": "sen",
  "fra-bol": "fra",
  "sen-nor": "sen",
  // Group J
  "arg-alg": "arg",
  "aut-jor": "aut",
  "arg-aut": "arg",
  "alg-jor": "alg",
  "arg-jor": "arg",
  "alg-aut": "aut",
  // Group K
  "por-uzb": "por",
  "col-cro": "col",
  "por-col": "por",
  "uzb-cro": "cro",
  "por-cro": "por",
  "uzb-col": "col",
  // Group L
  "eng-gha": "eng",
  "pan-crc": "crc",
  "eng-pan": "eng",
  "gha-crc": "gha",
  "eng-crc": "eng",
  "pan-gha": "pan",
};

function matchKey(home: string, away: string): string {
  return `${home}-${away}`;
}

function getWinner(home: string, away: string): string {
  return GROUP_MATCH_WINNERS[matchKey(home, away)] ?? home;
}

function buildGroupMatches(): Match[] {
  const matches: Match[] = [];
  const groups = [...new Set(teams.map((team) => team.group))].sort();
  const matchdays = [1, 5, 9];

  groups.forEach((group, groupIndex) => {
    const groupTeams = teams
      .filter((team) => team.group === group)
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
        matches.push({
          id: `grp-${group.toLowerCase()}-md${roundIndex + 1}-${matchIndex + 1}`,
          stage: "group",
          day,
          home,
          away,
          winner: getWinner(home, away),
        });
      });
    });
  });

  return matches;
}

type KnockoutFixture = {
  id: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
  winner: string;
};

const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
  // Round of 32 — days 13–16
  { id: "r32-1", stage: "round-of-32", day: 13, home: "mex", away: "alg", winner: "mex" },
  { id: "r32-2", stage: "round-of-32", day: 13, home: "den", away: "aus", winner: "den" },
  { id: "r32-3", stage: "round-of-32", day: 13, home: "sui", away: "kor", winner: "sui" },
  { id: "r32-4", stage: "round-of-32", day: 14, home: "can", away: "ecu", winner: "can" },
  { id: "r32-5", stage: "round-of-32", day: 14, home: "bra", away: "sco", winner: "bra" },
  { id: "r32-6", stage: "round-of-32", day: 14, home: "mar", away: "pol", winner: "mar" },
  { id: "r32-7", stage: "round-of-32", day: 15, home: "usa", away: "nor", winner: "usa" },
  { id: "r32-8", stage: "round-of-32", day: 15, home: "tur", away: "ukr", winner: "tur" },
  { id: "r32-9", stage: "round-of-32", day: 16, home: "ger", away: "irn", winner: "ger" },
  { id: "r32-10", stage: "round-of-32", day: 16, home: "civ", away: "sen", winner: "civ" },
  { id: "r32-11", stage: "round-of-32", day: 16, home: "ned", away: "aut", winner: "ned" },
  { id: "r32-12", stage: "round-of-32", day: 16, home: "jpn", away: "bel", winner: "bel" },
  { id: "r32-13", stage: "round-of-32", day: 16, home: "esp", away: "gha", winner: "esp" },
  { id: "r32-14", stage: "round-of-32", day: 16, home: "uru", away: "col", winner: "uru" },
  { id: "r32-15", stage: "round-of-32", day: 16, home: "fra", away: "cro", winner: "fra" },
  { id: "r32-16", stage: "round-of-32", day: 16, home: "arg", away: "eng", winner: "arg" },
  // Round of 16 — days 21–24
  { id: "r16-1", stage: "round-of-16", day: 21, home: "mex", away: "den", winner: "mex" },
  { id: "r16-2", stage: "round-of-16", day: 21, home: "sui", away: "can", winner: "sui" },
  { id: "r16-3", stage: "round-of-16", day: 22, home: "bra", away: "mar", winner: "bra" },
  { id: "r16-4", stage: "round-of-16", day: 22, home: "usa", away: "tur", winner: "usa" },
  { id: "r16-5", stage: "round-of-16", day: 23, home: "ger", away: "civ", winner: "ger" },
  { id: "r16-6", stage: "round-of-16", day: 23, home: "ned", away: "bel", winner: "ned" },
  { id: "r16-7", stage: "round-of-16", day: 24, home: "esp", away: "uru", winner: "esp" },
  { id: "r16-8", stage: "round-of-16", day: 24, home: "fra", away: "arg", winner: "arg" },
  // Quarter-finals — days 27–28
  { id: "qf-1", stage: "quarter-final", day: 27, home: "mex", away: "sui", winner: "mex" },
  { id: "qf-2", stage: "quarter-final", day: 27, home: "bra", away: "usa", winner: "bra" },
  { id: "qf-3", stage: "quarter-final", day: 28, home: "ger", away: "ned", winner: "ned" },
  { id: "qf-4", stage: "quarter-final", day: 28, home: "esp", away: "arg", winner: "arg" },
  // Semi-finals — days 31–32
  { id: "sf-1", stage: "semi-final", day: 31, home: "mex", away: "bra", winner: "bra" },
  { id: "sf-2", stage: "semi-final", day: 32, home: "ned", away: "arg", winner: "arg" },
  // Third place — day 34
  { id: "tp-1", stage: "third-place", day: 34, home: "mex", away: "ned", winner: "ned" },
  // Final — day 35
  { id: "fin-1", stage: "final", day: 35, home: "bra", away: "arg", winner: "arg" },
];

function buildKnockoutMatches(): Match[] {
  return KNOCKOUT_FIXTURES.map(({ id, stage, day, home, away, winner }) => ({
    id,
    stage,
    day,
    home,
    away,
    winner,
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
