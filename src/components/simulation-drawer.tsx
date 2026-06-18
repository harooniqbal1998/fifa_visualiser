"use client";

import { Timeline } from "@/components/timeline";
import { canStartSimulationFromDay } from "@/lib/simulation/advancement";

type SimulationDrawerProps = {
  day: number;
  onDayChange: (day: number) => void;
  isSimulating: boolean;
  onPlay: () => void;
  onStop: () => void;
};

export function SimulationDrawer({
  day,
  onDayChange,
  isSimulating,
  onPlay,
  onStop,
}: SimulationDrawerProps) {
  const canPlay = canStartSimulationFromDay(day);

  return (
    <aside className="flex w-56 shrink-0 flex-col border-l border-zinc-200 dark:border-zinc-800">
      <div className="shrink-0 space-y-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        {!isSimulating ? (
          <button
            type="button"
            disabled={!canPlay}
            title={
              !canPlay
                ? "Simulation unavailable for this day"
                : "Play simulation from selected day"
            }
            onClick={onPlay}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-600"
          >
            Play simulation
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Stop
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Timeline day={day} onDayChange={onDayChange} isSimulating={isSimulating} />
      </div>
    </aside>
  );
}
