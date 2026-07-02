"use client";

import type { Team } from "@/types";
import { getFlagUrl } from "@/lib/flags";

type TournamentWinnerSpotlightProps = {
  winnerId: string;
  teamsById: Record<string, Team>;
};

function TeamFlag({ isoCode }: { isoCode: string }) {
  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-light-gray dark:ring-light-gray/30"
    />
  );
}

export function TournamentWinnerSpotlight({
  winnerId,
  teamsById,
}: TournamentWinnerSpotlightProps) {
  const team = teamsById[winnerId];
  if (!team) return null;

  return (
    <div className="max-w-[calc(100vw-2rem)] w-max rounded-xl border border-light-gray/80 bg-background/85 px-4 py-2 shadow-sm backdrop-blur dark:border-light-gray/25 dark:bg-dark-heather/85">
      <div className="mb-1 text-center text-[10px] font-medium uppercase tracking-wide text-dark-heather/55 dark:text-light-gray/55">
        Tournament winner
      </div>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-dark-heather dark:text-light-gray">
        <TeamFlag isoCode={team.isoCode} />
        <span>{team.name}</span>
      </div>
    </div>
  );
}
