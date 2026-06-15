"use client";

import { getDayRange } from "@/lib/tournament";

type TimelineProps = {
  day: number;
  onDayChange: (day: number) => void;
};

export function Timeline({ day, onDayChange }: TimelineProps) {
  const { min, max } = getDayRange();

  return (
    <footer className="shrink-0 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        <label htmlFor="tournament-day" className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
          Day {day} of {max}
        </label>
        <input
          id="tournament-day"
          type="range"
          min={min}
          max={max}
          step={1}
          value={day}
          onChange={(event) => onDayChange(Number(event.target.value))}
          aria-label="Tournament day"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={day}
          className="w-full accent-zinc-900 dark:accent-zinc-100"
        />
      </div>
    </footer>
  );
}
