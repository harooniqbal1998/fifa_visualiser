import * as d3 from "d3";

export const MIN_RADIUS_REM = 0.75;
export const MAX_RADIUS_REM = 3.0;
export const MIN_EFFECTIVE_MAX_RADIUS_REM = 1.1;
export const PADDING_REM = 3;
export const NODE_PADDING_REM = 0.5;
/** Absolute px floors so circles stay legible on small screens. */
export const MIN_RADIUS_PX_FLOOR = 12;
export const NODE_PADDING_PX_FLOOR = 6;

export const GROUP_IDS = "ABCDEFGHIJKL";

export type VizSizing = {
  minRadius: number;
  maxRadius: number;
  minEffectiveMaxRadius: number;
  padding: number;
  nodePadding: number;
};

const DEFAULT_REM_PX = 16;

export function getRootRemPx(): number {
  if (typeof window === "undefined") return DEFAULT_REM_PX;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || DEFAULT_REM_PX;
}

export function remToPx(rem: number, remPx = getRootRemPx()): number {
  return rem * remPx;
}

export function getVizSizing(): VizSizing {
  const remPx = getRootRemPx();
  const minRadius = Math.max(remToPx(MIN_RADIUS_REM, remPx), MIN_RADIUS_PX_FLOOR);
  const maxRadius = remToPx(MAX_RADIUS_REM, remPx);
  const minEffectiveMaxRadius = Math.max(
    remToPx(MIN_EFFECTIVE_MAX_RADIUS_REM, remPx),
    minRadius + 4,
  );
  return {
    minRadius,
    maxRadius,
    minEffectiveMaxRadius,
    padding: remToPx(PADDING_REM, remPx),
    nodePadding: Math.max(remToPx(NODE_PADDING_REM, remPx), NODE_PADDING_PX_FLOOR),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function estimateEffectiveMaxRadius(
  width: number,
  height: number,
  nodeCount: number,
  sizing: VizSizing = getVizSizing(),
): number {
  if (nodeCount <= 0) return sizing.maxRadius;
  const availableArea = Math.max(width * height, 1) * 0.5;
  const perNodeArea = availableArea / nodeCount;
  const maxRadiusFromArea = Math.sqrt(perNodeArea / Math.PI) - sizing.nodePadding;
  return clamp(maxRadiusFromArea, sizing.minEffectiveMaxRadius, sizing.maxRadius);
}

export function createRadiusScale(
  maxProbability: number,
  effectiveMaxRadius: number,
  sizing: VizSizing = getVizSizing(),
): d3.ScalePower<number, number, never> {
  return d3
    .scaleSqrt()
    .domain([0, maxProbability || 1])
    .range([sizing.minRadius, effectiveMaxRadius]);
}

export function computeFixedRenderLayer(group: string, groupPosition: number): number {
  const groupIndex = GROUP_IDS.indexOf(group);
  return (groupIndex >= 0 ? groupIndex : 0) * 10 + groupPosition;
}
