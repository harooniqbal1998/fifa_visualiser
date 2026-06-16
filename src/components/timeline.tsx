"use client";

import type { MatchStage } from "@/types";
import { getDayRange, getTimelineDays } from "@/lib/tournament";

type TimelineProps = {
  day: number;
  onDayChange: (day: number) => void;
};

export function Timeline({ day, onDayChange }: TimelineProps) {
  const { min, max } = getDayRange();
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
    <footer className="shrink-0 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Day {day} of {max}
        </p>
        <div className="w-full overflow-x-auto px-2 py-2">
          <div className="mx-auto flex w-max items-center justify-center gap-3">
            {timelineDays.map((entry) => {
              const isActive = entry.day === day;
              const stageStyle = stageStyles[entry.stage];
              return (
                <span key={entry.day} className="inline-flex p-1">
                  <button
                    type="button"
                    onClick={() => onDayChange(entry.day)}
                    aria-label={`Matchday ${entry.day}`}
                    aria-current={isActive ? "step" : undefined}
                    className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900 ${stageStyle} ${
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
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Matchdays {min}-{max}
        </p>
      </div>
    </footer>
  );
}
