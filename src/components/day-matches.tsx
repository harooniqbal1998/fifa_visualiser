"use client";

import type { Match } from "@/types";
import { Flag } from "@/components/flag";
import { getTeamById } from "@/lib/tournament";

type DayMatchesProps = {
  matches: Match[];
  day: number;
};

export function DayMatches({ matches, day }: DayMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
      <h2 className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Day {day} matches
      </h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {matches.map((match) => {
          const home = getTeamById(match.home);
          const away = getTeamById(match.away);
          if (!home || !away) return null;

          const score =
            match.homeScore !== undefined && match.awayScore !== undefined
              ? `${match.homeScore}–${match.awayScore}`
              : "vs";

          return (
            <li key={match.id} className="inline-flex items-center gap-1">
              <Flag isoCode={home.isoCode} size={16} className="rounded-sm" />
              <span>{home.name}</span>
              <span className="text-zinc-400">{score}</span>
              <span>{away.name}</span>
              <Flag isoCode={away.isoCode} size={16} className="rounded-sm" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
