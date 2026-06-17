import { GROUP_IDS } from "@/components/viz/viz-math";

export type LayoutConfig = {
  groupRingRadiusRatio: number;
  groupStartAngle: number;
  teamSpreadXRatio: number;
  teamSpreadYRatio: number;
  centerYOffsetRatio: number;
  showDebug: boolean;
  groupRotations: Record<string, number>;
};

export function createDefaultGroupRotations(): Record<string, number> {
  const rotations: Record<string, number> = {};
  for (const groupId of GROUP_IDS) {
    rotations[groupId] = 0;
  }
  return rotations;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  groupRingRadiusRatio: 0.37,
  groupStartAngle: -1.19159265358979,
  teamSpreadXRatio: 0.1,
  teamSpreadYRatio: 0.08,
  centerYOffsetRatio: 0,
  showDebug: false,
  groupRotations: createDefaultGroupRotations(),
};

export function getLayoutConfig(): LayoutConfig {
  return DEFAULT_LAYOUT_CONFIG;
}
