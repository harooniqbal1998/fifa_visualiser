import type { Team } from "@/types";
import type { LayoutConfig } from "@/components/viz/layout-config";
import {
  createRadiusScale,
  estimateEffectiveMaxRadius,
  getVizSizing,
  GROUP_IDS,
  type GroupBounds,
  type VizSizing,
} from "@/components/viz/viz-math";

const DIAMOND_OFFSETS: Record<number, { dx: number; dy: number }> = {
  1: { dx: 0, dy: -1 },
  2: { dx: -1, dy: 0 },
  3: { dx: 1, dy: 0 },
  4: { dx: 0, dy: 1 },
};

export type GroupCenter = { x: number; y: number };

export type TeamPosition = {
  id: string;
  x: number;
  y: number;
  r: number;
  probability: number;
  group: string;
  groupPosition: number;
};

export type LayoutResult = {
  teams: TeamPosition[];
  groupCenters: Record<string, GroupCenter>;
  groupBounds: Record<string, GroupBounds>;
  groupRotations: Record<string, number>;
  groupRingRadius: number;
  canvasCenter: GroupCenter;
  usableRadius: number;
  spreadX: number;
  spreadY: number;
};

export function computeCanvasCenter(
  width: number,
  height: number,
  config: LayoutConfig,
): GroupCenter {
  const usable = Math.min(width, height);
  return {
    x: width * 0.5,
    y: height * 0.5 + usable * config.centerYOffsetRatio,
  };
}

export function computeGroupCenter(
  groupIndex: number,
  totalGroups: number,
  canvasCenter: GroupCenter,
  ringRadius: number,
  config: LayoutConfig,
): GroupCenter {
  const angle =
    config.groupStartAngle + (groupIndex / totalGroups) * Math.PI * 2;
  return {
    x: canvasCenter.x + Math.cos(angle) * ringRadius,
    y: canvasCenter.y + Math.sin(angle) * ringRadius,
  };
}

export function computeTeamAnchor(
  groupCenter: GroupCenter,
  groupPosition: number,
  spreadX: number,
  spreadY: number,
  rotationRad = 0,
): GroupCenter {
  const { dx, dy } = DIAMOND_OFFSETS[groupPosition] ?? { dx: 0, dy: 0 };
  const localX = dx * spreadX;
  const localY = dy * spreadY;
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  return {
    x: groupCenter.x + localX * cos - localY * sin,
    y: groupCenter.y + localX * sin + localY * cos,
  };
}

export function computeGroupBounds(
  groupCenter: GroupCenter,
  spreadX: number,
  spreadY: number,
  rotationRad: number,
  maxTeamRadius: number,
  sizing: VizSizing = getVizSizing(),
): GroupBounds {
  const margin = maxTeamRadius + sizing.nodePadding;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let pos = 1; pos <= 4; pos++) {
    const anchor = computeTeamAnchor(
      groupCenter,
      pos,
      spreadX,
      spreadY,
      rotationRad,
    );
    minX = Math.min(minX, anchor.x);
    minY = Math.min(minY, anchor.y);
    maxX = Math.max(maxX, anchor.x);
    maxY = Math.max(maxY, anchor.y);
  }

  return {
    minX: minX - margin,
    minY: minY - margin,
    maxX: maxX + margin,
    maxY: maxY + margin,
  };
}

export function computeAllPositions(
  teams: Team[],
  probabilities: Record<string, number>,
  width: number,
  height: number,
  config: LayoutConfig,
  sizing: VizSizing = getVizSizing(),
): LayoutResult {
  const usableRadius = Math.min(width, height);
  const canvasCenter = computeCanvasCenter(width, height, config);
  const groupRingRadius = usableRadius * config.groupRingRadiusRatio;
  const spreadX = usableRadius * config.teamSpreadXRatio;
  const spreadY = usableRadius * config.teamSpreadYRatio;
  const totalGroups = GROUP_IDS.length;

  const maxProbability = Math.max(
    ...teams.map((t) => probabilities[t.id] ?? 0),
    1,
  );
  const effectiveMaxRadius = estimateEffectiveMaxRadius(
    width,
    height,
    teams.length,
    sizing,
  );
  const radiusScale = createRadiusScale(maxProbability, effectiveMaxRadius, sizing);

  const groupCenters: Record<string, GroupCenter> = {};
  const groupBounds: Record<string, GroupBounds> = {};
  const groupRotations: Record<string, number> = {};

  for (let i = 0; i < GROUP_IDS.length; i++) {
    const groupId = GROUP_IDS[i]!;
    const rotationRad = config.groupRotations[groupId] ?? 0;
    groupRotations[groupId] = rotationRad;
    const center = computeGroupCenter(
      i,
      totalGroups,
      canvasCenter,
      groupRingRadius,
      config,
    );
    groupCenters[groupId] = center;
    groupBounds[groupId] = computeGroupBounds(
      center,
      spreadX,
      spreadY,
      rotationRad,
      effectiveMaxRadius,
      sizing,
    );
  }

  const positionedTeams: TeamPosition[] = teams.map((team) => {
    const groupCenter = groupCenters[team.group] ?? canvasCenter;
    const rotationRad = groupRotations[team.group] ?? 0;
    const anchor = computeTeamAnchor(
      groupCenter,
      team.groupPosition,
      spreadX,
      spreadY,
      rotationRad,
    );
    const probability = probabilities[team.id] ?? 0;

    return {
      id: team.id,
      x: anchor.x,
      y: anchor.y,
      r: radiusScale(probability),
      probability,
      group: team.group,
      groupPosition: team.groupPosition,
    };
  });

  return {
    teams: positionedTeams,
    groupCenters,
    groupBounds,
    groupRotations,
    groupRingRadius,
    canvasCenter,
    usableRadius,
    spreadX,
    spreadY,
  };
}
