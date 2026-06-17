import * as d3 from "d3";

export const MIN_RADIUS_REM = 0.75;
export const MAX_RADIUS_REM = 3.0;
export const MIN_EFFECTIVE_MAX_RADIUS_REM = 1.1;
export const PADDING_REM = 3;
export const NODE_PADDING_REM = 0.5;
/** Absolute px floors so circles stay legible on small screens. */
export const MIN_RADIUS_PX_FLOOR = 12;
export const NODE_PADDING_PX_FLOOR = 6;

/** Fraction of usable layout radius reserved as empty arena at group center. */
export const GROUP_ARENA_GAP_RATIO = 0.06;
/** Fraction of usable layout radius from center to corner team slots. */
export const GROUP_CORNER_SPREAD_RATIO = 0.11;
/** Extra padding around corner teams for group bounding box. */
export const GROUP_BBOX_PADDING_RATIO = 0.02;

export const GROUP_IDS = "ABCDEFGHIJKL";

export type GroupBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type CircleNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  status?: string;
  group?: string;
};

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

export function computeGroupLayoutScale(usable: number): {
  arenaGap: number;
  cornerSpread: number;
  bboxPadding: number;
} {
  return {
    arenaGap: usable * GROUP_ARENA_GAP_RATIO,
    cornerSpread: usable * GROUP_CORNER_SPREAD_RATIO,
    bboxPadding: usable * GROUP_BBOX_PADDING_RATIO,
  };
}

export function computeGroupCenter(
  group: string,
  depth: number,
  width: number,
  height: number,
  bottomReserve: number,
): { x: number; y: number } {
  const center = {
    x: width * 0.5,
    y: (height - bottomReserve) * 0.5,
  };
  const usable = Math.min(width, height - bottomReserve);
  const outerRadius = usable * 0.44;
  const maxDepth = 6;
  const t = Math.min(depth / maxDepth, 1);
  const radius = outerRadius * (1 - t);
  const groupIndex = GROUP_IDS.indexOf(group);
  const angle = (groupIndex / GROUP_IDS.length) * Math.PI * 2 - Math.PI / 2;

  if (depth >= maxDepth) {
    return center;
  }

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}

export function computeGroupTeamAnchor(
  groupCenter: { x: number; y: number },
  groupPosition: number,
  scale: { arenaGap: number; cornerSpread: number },
): { x: number; y: number } {
  const cornerOffsets: Record<number, { sx: number; sy: number }> = {
    1: { sx: -1, sy: -1 },
    2: { sx: 1, sy: -1 },
    3: { sx: -1, sy: 1 },
    4: { sx: 1, sy: 1 },
  };
  const { sx, sy } = cornerOffsets[groupPosition] ?? { sx: 0, sy: 0 };
  const dist = scale.arenaGap + scale.cornerSpread;
  return {
    x: groupCenter.x + sx * dist,
    y: groupCenter.y + sy * dist,
  };
}

export function computeGroupBounds(
  groupCenter: { x: number; y: number },
  scale: { arenaGap: number; cornerSpread: number; bboxPadding: number },
  maxTeamRadius: number,
  sizing: VizSizing = getVizSizing(),
): GroupBounds {
  const dist = scale.arenaGap + scale.cornerSpread;
  const margin = maxTeamRadius + sizing.nodePadding + scale.bboxPadding;
  return {
    minX: groupCenter.x - dist - margin,
    minY: groupCenter.y - dist - margin,
    maxX: groupCenter.x + dist + margin,
    maxY: groupCenter.y + dist + margin,
  };
}

export function getGroupArenaCenter(
  groupId: string,
  groupCenters: Record<string, { x: number; y: number }>,
): { x: number; y: number } | undefined {
  return groupCenters[groupId];
}

export function computeArenaApproachTargets(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
  arenaCenter: { x: number; y: number },
  nodePadding: number,
): {
  targetA: { x: number; y: number };
  targetB: { x: number; y: number };
  meetDistance: number;
} {
  const meetDistance = ar + br + nodePadding;
  const halfSep = meetDistance / 2;

  let nx = bx - ax;
  let ny = by - ay;
  const homeDist = Math.hypot(nx, ny);
  if (homeDist < 0.01) {
    nx = arenaCenter.x - ax;
    ny = arenaCenter.y - ay;
  }
  const axisDist = Math.hypot(nx, ny) || 0.01;
  nx /= axisDist;
  ny /= axisDist;

  return {
    targetA: {
      x: arenaCenter.x - nx * halfSep,
      y: arenaCenter.y - ny * halfSep,
    },
    targetB: {
      x: arenaCenter.x + nx * halfSep,
      y: arenaCenter.y + ny * halfSep,
    },
    meetDistance,
  };
}

export function clampToGroupBounds(
  x: number,
  y: number,
  r: number,
  bounds: GroupBounds,
): { x: number; y: number } {
  const xMin = bounds.minX + r;
  const xMax = bounds.maxX - r;
  const yMin = bounds.minY + r;
  const yMax = bounds.maxY - r;
  return {
    x: clamp(x, Math.min(xMin, xMax), Math.max(xMin, xMax)),
    y: clamp(y, Math.min(yMin, yMax), Math.max(yMin, yMax)),
  };
}

export type ResolveCircleOverlapsOptions = {
  nodePadding: number;
  skipPairs?: Set<string>;
  groupBounds?: Map<string, GroupBounds>;
  width?: number;
  height?: number;
  bottomReserve?: number;
  sizing?: VizSizing;
  iterations?: number;
};

function pairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function resolveCircleOverlaps(
  nodes: CircleNode[],
  options: ResolveCircleOverlapsOptions,
): void {
  const iterations = options.iterations ?? 1;
  for (let pass = 0; pass < iterations; pass++) {
    resolveCircleOverlapsPass(nodes, options);
  }
}

function resolveCircleOverlapsPass(
  nodes: CircleNode[],
  options: ResolveCircleOverlapsOptions,
): void {
  const {
    nodePadding,
    skipPairs = new Set(),
    groupBounds,
    width,
    height,
    bottomReserve = 0,
    sizing = getVizSizing(),
  } = options;

  const active = nodes.filter(
    (n) => n.status !== "dropped" && n.status !== "eliminated",
  );

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (skipPairs.has(pairKey(a.id, b.id))) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const minDist = a.r + b.r + nodePadding;
      if (dist >= minDist) continue;

      const push = (minDist - dist) / dist / 2;
      const px = dx * push;
      const py = dy * push;
      a.x -= px;
      a.y -= py;
      b.x += px;
      b.y += py;
    }
  }

  if (width !== undefined && height !== undefined) {
    for (const node of active) {
      const clamped = clampToViewport(
        node.x,
        node.y,
        node.r,
        width,
        height,
        bottomReserve,
        sizing,
      );
      node.x = clamped.x;
      node.y = clamped.y;

      if (groupBounds && node.group) {
        const bounds = groupBounds.get(node.group);
        if (bounds) {
          const inBounds = clampToGroupBounds(node.x, node.y, node.r, bounds);
          node.x = inBounds.x;
          node.y = inBounds.y;
        }
      }
    }
  }
}

export function computeFixedRenderLayer(group: string, groupPosition: number): number {
  const groupIndex = GROUP_IDS.indexOf(group);
  return (groupIndex >= 0 ? groupIndex : 0) * 10 + groupPosition;
}
