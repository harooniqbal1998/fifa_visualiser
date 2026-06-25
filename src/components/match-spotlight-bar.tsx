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
      className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-light-gray dark:ring-light-gray/30"
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
    <div className="flex items-center justify-center gap-3 text-xs whitespace-nowrap">
      <div
        className={`flex min-w-[4.5rem] items-center justify-end gap-1.5 ${homeWon ? "opacity-100" : "opacity-45"}`}
      >
        <TeamFlag isoCode={homeTeam?.isoCode ?? ""} />
        <span
          className={`font-mono tabular-nums ${homeWon ? "font-semibold text-average-green" : "text-dark-heather/70 dark:text-light-gray/55"}`}
        >
          {Math.round(match.homeElo)}
        </span>
      </div>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-dark-heather/55 dark:text-light-gray/55">
        vs
      </span>
      <div
        className={`flex min-w-[4.5rem] items-center gap-1.5 ${awayWon ? "opacity-100" : "opacity-45"}`}
      >
        <span
          className={`font-mono tabular-nums ${awayWon ? "font-semibold text-average-green" : "text-dark-heather/70 dark:text-light-gray/55"}`}
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
    <div className="max-w-[calc(100vw-2rem)] w-max rounded-xl border border-light-gray/80 bg-background/85 px-3 py-1 shadow-sm backdrop-blur dark:border-light-gray/25 dark:bg-dark-heather/85">
      <div className="relative grid overflow-hidden">
        <div className="invisible col-start-1 row-start-1" aria-hidden>
          <MatchupRow match={currentMatch} teamsById={teamsById} />
        </div>
        <div
          key={currentMatch.matchId}
          className={`col-start-1 row-start-1 transition-all ease-out ${slideClass}`}
          style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        >
          <MatchupRow match={currentMatch} teamsById={teamsById} />
        </div>
      </div>
    </div>
  );
}
