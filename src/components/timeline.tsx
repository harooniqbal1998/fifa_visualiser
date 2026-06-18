"use client";

import { useLayoutEffect, useRef } from "react";
import type { MatchStage } from "@/types";
import { getTimelineDays } from "@/lib/tournament";

const VISIBLE_DAYS = 5;
const SLOT_PX = 24;
const GAP_PX = 6;
const STEP_PX = SLOT_PX + GAP_PX;
const VIEWPORT_PX = VISIBLE_DAYS * SLOT_PX + (VISIBLE_DAYS - 1) * GAP_PX;
const TRACK_PADDING_PX = (VIEWPORT_PX - SLOT_PX) / 2;
const CIRCLE_PX = 14;

function circleVisuals(distance: number) {
  if (distance === 0) return { scale: 1, blur: 0, opacity: 1 };
  if (distance === 1) return { scale: 0.8, blur: 0.5, opacity: 0.65 };
  return { scale: 0.65, blur: 1.5, opacity: 0.45 };
}

type TimelineProps = {
  day: number;
  onDayChange: (day: number) => void;
  isSimulating?: boolean;
};

export function Timeline({ day, onDayChange, isSimulating = false }: TimelineProps) {
  const timelineDays = getTimelineDays();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIndex = timelineDays.findIndex((entry) => entry.day === day);

  useLayoutEffect(() => {
    if (activeIndex < 0 || !scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: activeIndex * STEP_PX,
      behavior: isSimulating ? "smooth" : "auto",
    });
  }, [activeIndex, isSimulating]);

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
    <div
      className="relative shrink-0 overflow-x-hidden py-1"
      style={{ width: VIEWPORT_PX }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-900"
      />

      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="flex flex-row items-center gap-1.5"
          style={{ paddingInline: TRACK_PADDING_PX }}
        >
          {timelineDays.map((entry, index) => {
            const isActive = entry.day === day;
            const stageStyle = stageStyles[entry.stage];
            const distance =
              activeIndex >= 0 ? Math.abs(index - activeIndex) : 0;
            const { scale, blur, opacity } = circleVisuals(distance);
            return (
              <span
                key={entry.day}
                className="inline-flex w-6 shrink-0 items-center justify-center"
              >
                <button
                  type="button"
                  onClick={() => !isSimulating && onDayChange(entry.day)}
                  disabled={isSimulating}
                  aria-label={`Matchday ${entry.day}`}
                  aria-current={isActive ? "step" : undefined}
                  className={`shrink-0 rounded-full border-2 outline-none transition-[transform,filter,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900 ${stageStyle} ${
                    isActive ? "" : "hover:opacity-80"
                  }`}
                  style={{
                    width: CIRCLE_PX,
                    height: CIRCLE_PX,
                    transform: `scale(${scale})`,
                    filter: blur > 0 ? `blur(${blur}px)` : undefined,
                    opacity,
                  }}
                />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
