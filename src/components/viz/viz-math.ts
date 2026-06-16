import * as d3 from "d3";

export const MIN_RADIUS_REM = 0.75;
export const MAX_RADIUS_REM = 3.0;
export const MIN_EFFECTIVE_MAX_RADIUS_REM = 1.1;
export const PADDING_REM = 3;
export const NODE_PADDING_REM = 0.5;
/** Absolute px floors so circles stay legible on small screens. */
export const MIN_RADIUS_PX_FLOOR = 12;
export const NODE_PADDING_PX_FLOOR = 6;

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

export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export function createDeterministicRandomSource(seed: string): () => number {
  let state = Math.floor(seededRandom(seed) * 0x7fffffff) || 1;
  return () => {
    state = (state * 48271) % 0x7fffffff;
    return state / 0x7fffffff;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

export function assignSeededPositions<T extends { id: string }>(
  items: T[],
  width: number,
  height: number,
  seedKey: string,
  maxRadius: number,
  sizing: VizSizing = getVizSizing(),
): (T & { x: number; y: number })[] {
  const pad = maxRadius + sizing.padding;
  const xRange = Math.max(width - pad * 2, 1);
  const yRange = Math.max(height - pad * 2, 1);

  return items.map((item) => ({
    ...item,
    x: pad + seededRandom(`${item.id}:${seedKey}:x`) * xRange,
    y: pad + seededRandom(`${item.id}:${seedKey}:y`) * yRange,
  }));
}

export function clampToViewport(
  x: number,
  y: number,
  r: number,
  width: number,
  height: number,
  bottomReserve = 0,
  sizing: VizSizing = getVizSizing(),
): { x: number; y: number } {
  const xMin = sizing.padding + r;
  const xMax = Math.max(width - sizing.padding - r, xMin);
  const yMin = sizing.padding + r;
  const yMax = Math.max(height - sizing.padding - r - bottomReserve, yMin);
  return {
    x: clamp(x, xMin, xMax),
    y: clamp(y, yMin, yMax),
  };
}

export function computeApproachTargets(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
  nodePadding: number,
): {
  targetA: { x: number; y: number };
  targetB: { x: number; y: number };
  meetDistance: number;
} {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy) || 0.01;
  const nx = dx / dist;
  const ny = dy / dist;
  const meetDistance = ar + br + nodePadding;
  const halfSep = meetDistance / 2;
  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;
  return {
    targetA: { x: midX - nx * halfSep, y: midY - ny * halfSep },
    targetB: { x: midX + nx * halfSep, y: midY + ny * halfSep },
    meetDistance,
  };
}
