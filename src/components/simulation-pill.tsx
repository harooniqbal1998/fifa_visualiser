"use client";

import { forwardRef } from "react";
import { Timeline } from "@/components/timeline";
import type { SimulationSessionPhase } from "@/components/viz/petal/petal-simulation-visualization";

type SimulationPillProps = {
  day: number;
  onDayChange: (day: number) => void;
  sessionPhase: SimulationSessionPhase;
  onPlay: () => void;
  onStop: () => void;
  onRestart: () => void;
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

export const SimulationPill = forwardRef<HTMLDivElement, SimulationPillProps>(
  function SimulationPill(
    { day, onDayChange, sessionPhase, onPlay, onStop, onRestart },
    ref,
  ) {
    const isRunning = sessionPhase === "running";

    return (
      <div
        ref={ref}
        className="flex w-full flex-row items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
      >
        {sessionPhase === "running" ? (
          <button
            type="button"
            title="Stop simulation"
            aria-label="Stop simulation"
            onClick={onStop}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            <StopIcon />
          </button>
        ) : sessionPhase === "completed" ? (
          <button
            type="button"
            title="Restart simulation"
            aria-label="Restart simulation"
            onClick={onRestart}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <RestartIcon />
            Restart
          </button>
        ) : (
          <button
            type="button"
            title="Play simulation from selected day"
            aria-label="Play simulation from selected day"
            onClick={onPlay}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PlayIcon />
            Play
          </button>
        )}

        <Timeline day={day} onDayChange={onDayChange} isSimulating={isRunning} />
      </div>
    );
  },
);
