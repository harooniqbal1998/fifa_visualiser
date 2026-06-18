export type PetalLayoutConfig = {
  groupRingRadiusRatio: number;
  spreadRadRatio: number;
  spreadTanRatio: number;
  pullPctKnockoutEntry: number;
  pullPctR32: number;
  pullPctR16: number;
  pullPctQF: number;
  pullPctSF: number;
  knockoutMinRadiusRatio: number;
  groupStartAngle: number;
  centerYOffsetRatio: number;
  matchHoldDurationMs: number;
  rankTransitionDurationMs: number;
  rankBorderFadeMs: number;
  spotlightDimOpacity: number;
  connectorWidth: number;
  eliminatedOpacity: number;
  bottomStripPaddingRatio: number;
  dropDurationMs: number;
};

export const DEFAULT_PETAL_CONFIG: PetalLayoutConfig = {
  groupRingRadiusRatio: 0.39,
  spreadRadRatio: 0.065,
  spreadTanRatio: 0.055,
  pullPctKnockoutEntry: 5,
  pullPctR32: 8,
  pullPctR16: 12,
  pullPctQF: 20,
  pullPctSF: 55,
  knockoutMinRadiusRatio: 0.08,
  groupStartAngle: -0.792,
  centerYOffsetRatio: 0,
  matchHoldDurationMs: 1200,
  rankTransitionDurationMs: 200,
  rankBorderFadeMs: 80,
  spotlightDimOpacity: 0.25,
  connectorWidth: 2,
  eliminatedOpacity: 0.45,
  bottomStripPaddingRatio: 0.04,
  dropDurationMs: 900,
};

export function mergePetalConfig(
  overrides: Partial<PetalLayoutConfig>,
): PetalLayoutConfig {
  return { ...DEFAULT_PETAL_CONFIG, ...overrides };
}

export function getCumulativePullPct(
  depth: number,
  config: PetalLayoutConfig,
): number {
  if (depth <= 0) return 0;
  const increments = [
    config.pullPctKnockoutEntry,
    config.pullPctR32,
    config.pullPctR16,
    config.pullPctQF,
    config.pullPctSF,
  ];
  const steps = Math.min(depth, increments.length);
  const sum = increments.slice(0, steps).reduce((a, b) => a + b, 0);
  return Math.min(Math.max(sum, 0), 100);
}
