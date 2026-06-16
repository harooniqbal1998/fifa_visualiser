"use client";

import type { Snapshot, Team } from "@/types";
import { Flag } from "@/components/flag";
import { CollapsibleSection } from "@/components/collapsible-section";
import { getTeamById } from "@/lib/tournament";

type NextOpponentsProps = {
  snapshot: Snapshot;
  teams: Team[];
  day: number;
};

export function NextOpponents({ snapshot, teams, day }: NextOpponentsProps) {
  const leader = [...teams]
    .map((team) => ({
      team,
      probability: snapshot.probabilities[team.id] ?? 0,
    }))
    .filter((entry) => entry.probability > 0)
    .sort((a, b) => b.probability - a.probability)[0];

  const dayMatches = snapshot.possibleOpponents;

  if (!leader) return null;

  const opponents = dayMatches[leader.team.id] ?? [];

  return (
    <CollapsibleSection
      className="border-t border-zinc-200 dark:border-zinc-800"
      contentClassName="px-6 pb-4"
      summary={
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium">Likely next opponents</h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              for{" "}
              <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <Flag isoCode={leader.team.isoCode} size={16} className="rounded-sm" />
                {leader.team.name}
              </span>{" "}
              ({leader.probability.toFixed(1)}% win chance)
            </span>
          </div>
        </div>
      }
    >
      {opponents.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No remaining group-stage opponents on day {day}.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {opponents.map((opponentId) => {
            const opponent = getTeamById(opponentId);
            if (!opponent) return null;
            return (
              <li
                key={opponentId}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              >
                <Flag isoCode={opponent.isoCode} size={16} className="rounded-sm" />
                {opponent.name}
                <span className="text-zinc-400">· {opponent.group}</span>
              </li>
            );
          })}
        </ul>
      )}
    </CollapsibleSection>
  );
}
