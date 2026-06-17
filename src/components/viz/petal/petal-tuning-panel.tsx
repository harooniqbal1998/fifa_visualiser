"use client";

import { useCallback } from "react";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  DEFAULT_PETAL_CONFIG,
  savePetalConfigToStorage,
} from "@/components/viz/petal/petal-config";

type PetalTuningPanelProps = {
  config: PetalLayoutConfig;
  onChange: (config: PetalLayoutConfig) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

type SliderDef = {
  key: keyof PetalLayoutConfig;
  label: string;
  min: number;
  max: number;
  step: number;
};

const SIMULATION_SLIDERS: SliderDef[] = [
  { key: "leftHubXRatio", label: "Left hub X", min: 0.2, max: 0.49, step: 0.01 },
  { key: "rightHubXRatio", label: "Right hub X", min: 0.51, max: 0.8, step: 0.01 },
  { key: "hubYRatio", label: "Hub Y", min: 0.3, max: 0.7, step: 0.01 },
  { key: "depthPullStrength", label: "Depth pull", min: 0.2, max: 1.5, step: 0.05 },
];

export function PetalTuningPanel({
  config,
  onChange,
  collapsed,
  onCollapsedChange,
}: PetalTuningPanelProps) {
  const update = useCallback(
    (patch: Partial<PetalLayoutConfig>) => {
      const next = { ...config, ...patch };
      onChange(next);
      savePetalConfigToStorage(next);
    },
    [config, onChange],
  );

  const handleReset = () => {
    const next = {
      ...config,
      leftHubXRatio: DEFAULT_PETAL_CONFIG.leftHubXRatio,
      rightHubXRatio: DEFAULT_PETAL_CONFIG.rightHubXRatio,
      hubYRatio: DEFAULT_PETAL_CONFIG.hubYRatio,
      depthPullStrength: DEFAULT_PETAL_CONFIG.depthPullStrength,
    };
    onChange(next);
    savePetalConfigToStorage(next);
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 w-64 rounded-lg border border-zinc-300 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-600 dark:bg-zinc-900/95">
      <button
        type="button"
        onClick={() => onCollapsedChange(!collapsed)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-800 dark:text-zinc-100"
      >
        <span>Petal simulation</span>
        <span className="text-zinc-400">{collapsed ? "+" : "−"}</span>
      </button>

      {!collapsed && (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto border-t border-zinc-200 px-3 py-3 dark:border-zinc-700">
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={config.showDebug}
              onChange={(e) => update({ showDebug: e.target.checked })}
              className="rounded"
            />
            Show debug overlay
          </label>

          {SIMULATION_SLIDERS.map(({ key, label, min, max, step }) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>{label}</span>
                <span className="font-mono tabular-nums">
                  {(config[key] as number).toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={config[key] as number}
                onChange={(e) =>
                  update({ [key]: parseFloat(e.target.value) } as Partial<PetalLayoutConfig>)
                }
                className="w-full"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Reset simulation defaults
          </button>
        </div>
      )}
    </div>
  );
}
