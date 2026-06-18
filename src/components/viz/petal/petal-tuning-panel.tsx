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

const LAYOUT_SLIDERS: SliderDef[] = [
  { key: "groupRingRadiusRatio", label: "Group ring radius", min: 0.25, max: 0.55, step: 0.01 },
  { key: "spreadRadRatio", label: "Spread radial (1st/4th)", min: 0.02, max: 0.12, step: 0.005 },
  { key: "spreadTanRatio", label: "Spread tangential (2nd/3rd)", min: 0.02, max: 0.12, step: 0.005 },
];

const KNOCKOUT_SLIDERS: SliderDef[] = [
  { key: "leftHubXRatio", label: "Left hub X", min: 0.2, max: 0.49, step: 0.01 },
  { key: "rightHubXRatio", label: "Right hub X", min: 0.51, max: 0.8, step: 0.01 },
  { key: "hubYRatio", label: "Hub Y", min: 0.3, max: 0.7, step: 0.01 },
  { key: "depthPullStrength", label: "Depth pull", min: 0.2, max: 1.5, step: 0.05 },
];

const MATCH_SLIDERS: SliderDef[] = [
  { key: "matchHoldDurationMs", label: "Match hold (ms)", min: 300, max: 4000, step: 100 },
  { key: "rankTransitionDurationMs", label: "Rank glide (ms)", min: 200, max: 3000, step: 100 },
  { key: "spotlightDimOpacity", label: "Spotlight dim", min: 0.05, max: 0.8, step: 0.05 },
  { key: "connectorWidth", label: "Connector width", min: 1, max: 6, step: 0.5 },
  { key: "eliminatedOpacity", label: "Eliminated opacity", min: 0.1, max: 0.8, step: 0.05 },
];

function SliderRow({
  def,
  value,
  onChange,
}: {
  def: SliderDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>{def.label}</span>
        <span className="font-mono tabular-nums">{value.toFixed(def.step < 1 ? 3 : 0)}</span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

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
    onChange({ ...config, ...DEFAULT_PETAL_CONFIG });
    savePetalConfigToStorage({ ...config, ...DEFAULT_PETAL_CONFIG });
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 w-64 rounded-lg border border-zinc-300 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-600 dark:bg-zinc-900/95">
      <button
        type="button"
        onClick={() => onCollapsedChange(!collapsed)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-800 dark:text-zinc-100"
      >
        <span>Petal dev tuning</span>
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

          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={config.autoAdvanceDay}
              onChange={(e) => update({ autoAdvanceDay: e.target.checked })}
              className="rounded"
            />
            Auto-advance day after sim
          </label>

          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Layout</p>
          {LAYOUT_SLIDERS.map((def) => (
            <SliderRow
              key={def.key}
              def={def}
              value={config[def.key] as number}
              onChange={(v) => update({ [def.key]: v } as Partial<PetalLayoutConfig>)}
            />
          ))}

          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Match viz</p>
          {MATCH_SLIDERS.map((def) => (
            <SliderRow
              key={def.key}
              def={def}
              value={config[def.key] as number}
              onChange={(v) => update({ [def.key]: v } as Partial<PetalLayoutConfig>)}
            />
          ))}

          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Knockout scrub</p>
          {KNOCKOUT_SLIDERS.map((def) => (
            <SliderRow
              key={def.key}
              def={def}
              value={config[def.key] as number}
              onChange={(v) => update({ [def.key]: v } as Partial<PetalLayoutConfig>)}
            />
          ))}

          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Reset defaults
          </button>
        </div>
      )}
    </div>
  );
}
