"use client";

import { forwardRef } from "react";
import { TimelineDayPicker } from "@/components/timeline";
import type { SimulationSessionPhase } from "@/components/viz/petal/petal-simulation-visualization";
import { isSimStartDay } from "@/lib/tournament";

type SimulationPillProps = {
  day: number;
  onDayChange: (day: number) => void;
  sessionPhase: SimulationSessionPhase;
  onPlay: () => void;
  onStop: () => void;
  onRestart: () => void;
  onTournamentStructureClick?: () => void;
  tournamentStructureOpen?: boolean;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11.04-6.86a1 1 0 0 0 0-1.74L9.5 4.27A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BracketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
      <path d="M4 6h4v4H4zM16 6h4v4h-4zM4 14h4v4H4zM16 14h4v4h-4z" strokeLinejoin="round" />
      <path d="M8 8h3M13 8h3M8 16h3M13 16h3" strokeLinecap="round" />
    </svg>
  );
}

export const SimulationPill = forwardRef<HTMLDivElement, SimulationPillProps>(
  function SimulationPill(
    {
      day,
      onDayChange,
      sessionPhase,
      onPlay,
      onStop,
      onRestart,
      onTournamentStructureClick,
      tournamentStructureOpen,
    },
    ref,
  ) {
    const isRunning = sessionPhase === "running";
    const isCompleted = sessionPhase === "completed";
    const canPlay = sessionPhase !== "idle" || isSimStartDay(day);
    const playTitle = canPlay
      ? "Play simulation from selected day"
      : "Complete match results required before this day";

    return (
      <div
        ref={ref}
        className="flex w-full flex-row items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
      >
        {isRunning ? (
          <>
            <button
              type="button"
              title="Stop simulation"
              aria-label="Stop simulation"
              onClick={onStop}
              className="relative z-0 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <StopIcon />
            </button>
            <TimelineDayPicker
              day={day}
              onDayChange={onDayChange}
              isSimulating
            />
          </>
        ) : (
          <div className="relative flex h-7 shrink-0 items-center rounded-full bg-zinc-900 pr-1 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <button
              type="button"
              title={isCompleted ? "Restart simulation" : playTitle}
              aria-label={isCompleted ? "Restart simulation" : playTitle}
              onClick={isCompleted ? onRestart : onPlay}
              disabled={!isCompleted && !canPlay}
              className="relative z-0 flex h-7 shrink-0 items-center gap-1.5 rounded-l-full pl-2.5 text-xs font-medium hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-200"
            >
              {isCompleted ? <RestartIcon /> : <PlayIcon />}
              {isCompleted ? "Restart from" : "Play from"}
            </button>
            <TimelineDayPicker day={day} onDayChange={onDayChange} />
          </div>
        )}

        {onTournamentStructureClick ? (
          <button
            type="button"
            title="Tournament structure"
            aria-label="Tournament structure"
            aria-expanded={tournamentStructureOpen}
            onClick={onTournamentStructureClick}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
              tournamentStructureOpen
                ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                : "border-zinc-300 dark:border-zinc-600"
            }`}
          >
            <BracketIcon />
          </button>
        ) : null}
      </div>
    );
  },
);
