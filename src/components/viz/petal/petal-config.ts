export type PetalLayoutConfig = {
  groupRingRadiusRatio: number;
  spreadRadRatio: number;
  spreadTanRatio: number;
  leftHubXRatio: number;
  rightHubXRatio: number;
  hubYRatio: number;
  depthPullStrength: number;
  groupStartAngle: number;
  centerYOffsetRatio: number;
  showDebug: boolean;
  matchHoldDurationMs: number;
  rankTransitionDurationMs: number;
  spotlightDimOpacity: number;
  connectorWidth: number;
  eliminatedOpacity: number;
  autoAdvanceDay: boolean;
  bottomStripPaddingRatio: number;
  dropDurationMs: number;
  /** @deprecated use spreadTanRatio */
  laneSpreadRatio?: number;
  /** @deprecated use spreadRadRatio */
  outerSpreadRatio?: number;
};

export const DEFAULT_PETAL_CONFIG: PetalLayoutConfig = {
  groupRingRadiusRatio: 0.39,
  spreadRadRatio: 0.065,
  spreadTanRatio: 0.055,
  leftHubXRatio: 0.38,
  rightHubXRatio: 0.62,
  hubYRatio: 0.5,
  depthPullStrength: 0.8,
  groupStartAngle: -0.792,
  centerYOffsetRatio: 0,
  showDebug: false,
  matchHoldDurationMs: 1500,
  rankTransitionDurationMs: 800,
  spotlightDimOpacity: 0.25,
  connectorWidth: 2,
  eliminatedOpacity: 0.45,
  autoAdvanceDay: false,
  bottomStripPaddingRatio: 0.04,
  dropDurationMs: 900,
};

export const PETAL_SIMULATION_KEYS = [
  "groupRingRadiusRatio",
  "spreadRadRatio",
  "spreadTanRatio",
  "leftHubXRatio",
  "rightHubXRatio",
  "hubYRatio",
  "depthPullStrength",
  "showDebug",
  "matchHoldDurationMs",
  "rankTransitionDurationMs",
  "spotlightDimOpacity",
  "connectorWidth",
  "eliminatedOpacity",
  "autoAdvanceDay",
  "bottomStripPaddingRatio",
  "dropDurationMs",
] as const satisfies readonly (keyof PetalLayoutConfig)[];

export type PetalSimulationKey = (typeof PETAL_SIMULATION_KEYS)[number];

export const PETAL_CONFIG_STORAGE_KEY = "petal-simulation-config";

export function mergePetalConfig(
  overrides: Partial<PetalLayoutConfig>,
): PetalLayoutConfig {
  const merged = { ...DEFAULT_PETAL_CONFIG, ...overrides };
  if (overrides.laneSpreadRatio !== undefined && overrides.spreadTanRatio === undefined) {
    merged.spreadTanRatio = overrides.laneSpreadRatio;
  }
  if (overrides.outerSpreadRatio !== undefined && overrides.spreadRadRatio === undefined) {
    merged.spreadRadRatio = overrides.outerSpreadRatio;
  }
  return merged;
}

export function loadPetalConfigFromStorage(): Partial<PetalLayoutConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PETAL_CONFIG_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PetalLayoutConfig>;
    const simulationOnly: Partial<PetalLayoutConfig> = {};
    for (const key of PETAL_SIMULATION_KEYS) {
      if (parsed[key] !== undefined) {
        (simulationOnly as Record<string, unknown>)[key] = parsed[key];
      }
    }
    return simulationOnly;
  } catch {
    return {};
  }
}

export function savePetalConfigToStorage(config: PetalLayoutConfig): void {
  if (typeof window === "undefined") return;
  const simulationOnly: Partial<PetalLayoutConfig> = {};
  for (const key of PETAL_SIMULATION_KEYS) {
    (simulationOnly as Record<string, unknown>)[key] = config[key];
  }
  localStorage.setItem(PETAL_CONFIG_STORAGE_KEY, JSON.stringify(simulationOnly));
}
