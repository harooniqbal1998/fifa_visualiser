"use client";

import type { MatchStage } from "@/types";
import { getDayRange, getTimelineDays } from "@/lib/tournament";

type TimelineProps = {
  day: number;
  onDayChange: (day: number) => void;
  isSimulating?: boolean;
};

export function Timeline({ day, onDayChange, isSimulating = false }: TimelineProps) {
  const { max } = getDayRange();
  const timelineDays = getTimelineDays();

  const stageStyles: Record<MatchStage, string> = {
    group: "border-sky-500 bg-sky-500/20",
    "round-of-32": "border-violet-500 bg-violet-500/20",
    "round-of-16": "border-fuchsia-500 bg-fuchsia-500/20",
    "quarter-final": "border-amber-500 bg-amber-500/20",
    "semi-final": "border-orange-500 bg-orange-500/20",
    "third-place": "border-emerald-500 bg-emerald-500/20",
    final: "border-rose-500 bg-rose-500/20",
  };

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-2 text-center">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Day {day} of {max}
      </p>
      <div className="flex flex-col items-center gap-2">
        {timelineDays.map((entry) => {
          const isActive = entry.day === day;
          const stageStyle = stageStyles[entry.stage];
          return (
            <span key={entry.day} className="inline-flex p-1">
              <button
                type="button"
                onClick={() => !isSimulating && onDayChange(entry.day)}
                disabled={isSimulating}
                aria-label={`Matchday ${entry.day}`}
                aria-current={isActive ? "step" : undefined}
                className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900 ${stageStyle} ${
                  isActive
                    ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-zinc-100 dark:ring-offset-zinc-900"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
