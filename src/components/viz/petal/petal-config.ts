export type PetalLayoutConfig = {
  groupRingRadiusRatio: number;
  laneSpreadRatio: number;
  outerSpreadRatio: number;
  leftHubXRatio: number;
  rightHubXRatio: number;
  hubYRatio: number;
  depthPullStrength: number;
  groupStartAngle: number;
  centerYOffsetRatio: number;
  showDebug: boolean;
};

export const DEFAULT_PETAL_CONFIG: PetalLayoutConfig = {
  groupRingRadiusRatio: 0.39,
  laneSpreadRatio: 0.055,
  outerSpreadRatio: 0.065,
  leftHubXRatio: 0.38,
  rightHubXRatio: 0.62,
  hubYRatio: 0.5,
  depthPullStrength: 0.8,
  groupStartAngle: -0.792,
  centerYOffsetRatio: 0,
  showDebug: false,
};

/** Persisted in localStorage — knockout convergence only; layout is fixed in defaults. */
export const PETAL_SIMULATION_KEYS = [
  "leftHubXRatio",
  "rightHubXRatio",
  "hubYRatio",
  "depthPullStrength",
  "showDebug",
] as const satisfies readonly (keyof PetalLayoutConfig)[];

export type PetalSimulationKey = (typeof PETAL_SIMULATION_KEYS)[number];

export const PETAL_CONFIG_STORAGE_KEY = "petal-simulation-config";

export function mergePetalConfig(
  overrides: Partial<PetalLayoutConfig>,
): PetalLayoutConfig {
  return { ...DEFAULT_PETAL_CONFIG, ...overrides };
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
