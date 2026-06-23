"use client";

import { useMemo, useState } from "react";
import { brandColors } from "@/lib/brand-colors";
import { createRadiusScale, getVizSizing } from "@/components/viz/viz-math";

const MAX_PROB_PCT = 25;
const DEMO_SIZE = 200;

export function BubbleScaleDemo() {
  const [probPct, setProbPct] = useState(8);

  const radius = useMemo(() => {
    const sizing = getVizSizing();
    const scale = createRadiusScale(MAX_PROB_PCT, sizing.maxRadius, sizing);
    return scale(probPct);
  }, [probPct]);

  const center = DEMO_SIZE / 2;

  return (
    <div className="border-t border-light-gray pt-4 dark:border-light-gray/25">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label
          htmlFor="bubble-prob-slider"
          className="text-xs font-medium text-dark-heather dark:text-light-gray"
        >
          Win chance
        </label>
        <span className="text-xs tabular-nums text-dark-heather/70 dark:text-light-gray/70">
          {probPct.toFixed(1)}%
        </span>
      </div>
      <input
        id="bubble-prob-slider"
        type="range"
        min={0}
        max={MAX_PROB_PCT}
        step={0.1}
        value={probPct}
        onChange={(e) => setProbPct(Number(e.target.value))}
        className="mb-4 w-full accent-hermes"
      />
      <div className="flex justify-center">
        <svg
          width={DEMO_SIZE}
          height={DEMO_SIZE}
          viewBox={`0 0 ${DEMO_SIZE} ${DEMO_SIZE}`}
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={brandColors.averageGreen}
            fillOpacity={0.35}
            stroke={brandColors.averageGreen}
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <p className="mt-3 text-xs text-dark-heather/55 dark:text-light-gray/55">
        Circle area grows with the square root of probability, so small differences
        in win chance can look subtle until chances get higher.
      </p>
    </div>
  );
}
