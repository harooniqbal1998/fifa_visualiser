"use client";

import { Timeline } from "@/components/timeline";

type SimulationDrawerProps = {
  day: number;
  onDayChange: (day: number) => void;
  isSimulating: boolean;
  onStop: () => void;
};

export function SimulationDrawer({
  day,
  onDayChange,
  isSimulating,
  onStop,
}: SimulationDrawerProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-l border-zinc-200 dark:border-zinc-800">
      <div className="shrink-0 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        {!isSimulating ? (
          <button
            type="button"
            disabled
            title="Positioning pass — simulation coming next"
            className="w-full cursor-not-allowed rounded-md bg-zinc-400 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-600"
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
