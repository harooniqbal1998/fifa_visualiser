"use client";

import { useMemo, useState } from "react";
import { teams } from "@/data/teams";
import { getFlagUrl } from "@/lib/flags";
import {
  buildInitialEloRatings,
  expectedHomeWinProb,
} from "@/lib/probability/match-elo";
import { DEFAULT_PROBABILITY_CONFIG } from "@/lib/probability/types";
import { MathBlock } from "@/components/how-it-works/math-block";

const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
const ratings = buildInitialEloRatings(teams, DEFAULT_PROBABILITY_CONFIG);

function TeamFlag({ isoCode }: { isoCode: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className="h-4 w-4 shrink-0 rounded-full object-cover"
    />
  );
}

function TeamSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (teamId: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-dark-heather dark:text-light-gray"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-light-gray bg-background px-2 py-1.5 text-xs text-dark-heather dark:border-light-gray/25 dark:bg-dark-heather dark:text-light-gray"
      >
        {sortedTeams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function katexTeamName(name: string): string {
  return name.replace(/\\/g, "\\\\").replace(/[{}]/g, "");
}

export function EloMatchupDemo() {
  const [team1Id, setTeam1Id] = useState("bra");
  const [team2Id, setTeam2Id] = useState("arg");

  const team1 = teams.find((t) => t.id === team1Id) ?? sortedTeams[0];
  const team2 = teams.find((t) => t.id === team2Id) ?? sortedTeams[1];
  const team1Elo = ratings[team1.id] ?? 1500;
  const team2Elo = ratings[team2.id] ?? 1500;
  const team1Prob = expectedHomeWinProb(team1Elo, team2Elo);
  const team2Prob = 1 - team1Prob;

  const formulaMath = useMemo(
    () =>
      `P(\\text{${katexTeamName(team1.name)} wins}) = \\frac{1}{1 + 10^{(${team2Elo.toFixed(0)} - ${team1Elo.toFixed(0)}) / 400}} = ${(team1Prob * 100).toFixed(1)}\\%`,
    [team1.name, team1Elo, team1Prob, team2Elo],
  );

  return (
    <div className="border-t border-light-gray pt-4 dark:border-light-gray/25">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <TeamSelect id="team-1" label="Team 1" value={team1Id} onChange={setTeam1Id} />
        <TeamSelect id="team-2" label="Team 2" value={team2Id} onChange={setTeam2Id} />
      </div>

      <div className="mb-4 flex items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamFlag isoCode={team1.isoCode} />
          <span className="truncate font-medium text-dark-heather dark:text-light-gray">
            {team1.name}
          </span>
          <span className="shrink-0 text-dark-heather/55 dark:text-light-gray/55">
            Elo {team1Elo.toFixed(0)}
          </span>
        </div>
        <span className="shrink-0 text-dark-heather/40 dark:text-light-gray/40">vs</span>
        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <span className="shrink-0 text-dark-heather/55 dark:text-light-gray/55">
            Elo {team2Elo.toFixed(0)}
          </span>
          <span className="truncate font-medium text-dark-heather dark:text-light-gray">
            {team2.name}
          </span>
          <TeamFlag isoCode={team2.isoCode} />
        </div>
      </div>

      <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-light-gray/30 dark:bg-light-gray/10">
        <div
          className="bg-average-green transition-[width] duration-200"
          style={{ width: `${team1Prob * 100}%` }}
        />
        <div
          className="bg-hermes transition-[width] duration-200 dark:bg-light-gray/60"
          style={{ width: `${team2Prob * 100}%` }}
        />
      </div>
      <div className="mb-4 flex justify-between text-xs tabular-nums text-dark-heather/70 dark:text-light-gray/70">
        <span>
          {(team1Prob * 100).toFixed(1)}% {team1.name}
        </span>
        <span>
          {(team2Prob * 100).toFixed(1)}% {team2.name}
        </span>
      </div>

      <MathBlock math={formulaMath} className="text-center text-sm" />
    </div>
  );
}
