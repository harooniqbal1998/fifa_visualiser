"use client";

import { useEffect, useMemo, useState } from "react";
import type { Team } from "@/types";
import { getFlagUrl } from "@/lib/flags";
import type { CollisionEvent } from "@/lib/simulation/types";

const MIN_CAROUSEL_MS = 700;
const TRANSITION_MS = 200;

type MatchSpotlightBarProps = {
  matches: CollisionEvent[];
  teamsById: Record<string, Team>;
  holdDurationMs: number;
};

function TeamFlag({ isoCode }: { isoCode: string }) {
  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-600"
    />
  );
}

function MatchupRow({
  match,
  teamsById,
}: {
  match: CollisionEvent;
  teamsById: Record<string, Team>;
}) {
  const homeTeam = teamsById[match.home];
  const awayTeam = teamsById[match.away];
  const homeWon = match.winner === match.home;
  const awayWon = match.winner === match.away;

  return (
    <div className="flex items-center justify-center gap-3 px-2 text-xs whitespace-nowrap">
      <div
        className={`flex min-w-[4.5rem] items-center justify-end gap-1.5 ${homeWon ? "opacity-100" : "opacity-45"}`}
      >
        <TeamFlag isoCode={homeTeam?.isoCode ?? ""} />
        <span
          className={`font-mono tabular-nums ${homeWon ? "font-semibold text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          {Math.round(match.homeElo)}
        </span>
      </div>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        vs
      </span>
      <div
        className={`flex min-w-[4.5rem] items-center gap-1.5 ${awayWon ? "opacity-100" : "opacity-45"}`}
      >
        <span
          className={`font-mono tabular-nums ${awayWon ? "font-semibold text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}
        >
          {Math.round(match.awayElo)}
        </span>
        <TeamFlag isoCode={awayTeam?.isoCode ?? ""} />
      </div>
    </div>
  );
}

export function MatchSpotlightBar({
  matches,
  teamsById,
  holdDurationMs,
}: MatchSpotlightBarProps) {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(true);

  const matchKey = useMemo(
    () => matches.map((m) => m.matchId).join(","),
    [matches],
  );

  const safeIndex =
    matches.length === 0 ? 0 : Math.min(index, matches.length - 1);
  const currentMatch = matches[safeIndex];
  const intervalMs = Math.max(MIN_CAROUSEL_MS, holdDurationMs / matches.length);

  useEffect(() => {
    setIndex(0);
    setExiting(false);
    setEntered(true);
  }, [matchKey]);

  useEffect(() => {
    if (index >= matches.length) {
      setIndex(0);
    }
  }, [index, matches.length]);

  useEffect(() => {
    if (matches.length <= 1) return;

    const id = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % matches.length);
        setExiting(false);
        setEntered(false);
        requestAnimationFrame(() => setEntered(true));
      }, TRANSITION_MS);
    }, intervalMs);

    return () => clearInterval(id);
  }, [matches.length, intervalMs, matchKey]);

  if (!currentMatch) {
    return null;
  }

  const slideClass = exiting
    ? "-translate-y-full opacity-0"
    : entered
      ? "translate-y-0 opacity-100"
      : "translate-y-full opacity-0";

  return (
    <div className="flex w-full flex-col items-center rounded-xl border border-zinc-200/80 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/85">
      <div className="relative h-6 w-full overflow-hidden">
        <div
          key={currentMatch.matchId}
          className={`absolute inset-x-0 top-0 transition-all ease-out ${slideClass}`}
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        >
          <MatchupRow match={currentMatch} teamsById={teamsById} />
        </div>
      </div>
    </div>
  );
}
