import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  getTeamBracketHalf,
  type BracketHalf,
} from "@/components/viz/petal/petal-routes";
import {
  createRadiusScale,
  estimateEffectiveMaxRadius,
  getVizSizing,
  GROUP_IDS,
  type VizSizing,
} from "@/components/viz/viz-math";
import { getAdvancingThirdPlaceGroups } from "@/lib/simulation/r32-resolver";

export type PetalPoint = { x: number; y: number };

export type PetalTeamPosition = {
  id: string;
  x: number;
  y: number;
  r: number;
  probability: number;
  group: string;
  standingRank: 1 | 2 | 3 | 4;
  bracketHalf: BracketHalf | null;
  bracketDepth: number;
};

export type PetalLayoutResult = {
  teams: PetalTeamPosition[];
  canvasCenter: PetalPoint;
  leftHub: PetalPoint;
  rightHub: PetalPoint;
  groupCenters: Record<string, PetalPoint>;
  groupAngles: Record<string, number>;
  groupRingRadius: number;
  spreadRad: number;
  spreadTan: number;
  usableRadius: number;
};

function getStandingRank(
  teamId: string,
  group: string,
  standings: Record<string, StandingRow[]>,
): 1 | 2 | 3 | 4 {
  const table = standings[group];
  if (!table) return 4;
  const index = table.findIndex((row) => row.teamId === teamId);
  if (index < 0) return 4;
  return (index + 1) as 1 | 2 | 3 | 4;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function computeCanvasCenter(
  width: number,
  height: number,
  config: PetalLayoutConfig,
): PetalPoint {
  const usable = Math.min(width, height);
  return {
    x: width * 0.5,
    y: height * 0.5 + usable * config.centerYOffsetRatio,
  };
}

function computeGroupAngle(groupIndex: number, config: PetalLayoutConfig): number {
  return config.groupStartAngle + (groupIndex / GROUP_IDS.length) * Math.PI * 2;
}

function computeGroupCenter(
  groupIndex: number,
  canvasCenter: PetalPoint,
  ringRadius: number,
  config: PetalLayoutConfig,
): PetalPoint {
  const angle = computeGroupAngle(groupIndex, config);
  return {
    x: canvasCenter.x + Math.cos(angle) * ringRadius,
    y: canvasCenter.y + Math.sin(angle) * ringRadius,
  };
}

/**
 * Center-oriented diamond per group wedge:
 * - 1st: radial inward toward canvas center
 * - 2nd / 3rd: tangential wings
 * - 4th: radial outward away from canvas center
 */
export function computeDiamondAnchor(
  groupCenter: PetalPoint,
  angle: number,
  standingRank: 1 | 2 | 3 | 4,
  spreadRad: number,
  spreadTan: number,
): PetalPoint {
  const radialX = Math.cos(angle);
  const radialY = Math.sin(angle);
  const tangentialX = -Math.sin(angle);
  const tangentialY = Math.cos(angle);

  if (standingRank === 1) {
    return {
      x: groupCenter.x - radialX * spreadRad,
      y: groupCenter.y - radialY * spreadRad,
    };
  }
  if (standingRank === 2) {
    return {
      x: groupCenter.x + tangentialX * spreadTan,
      y: groupCenter.y + tangentialY * spreadTan,
    };
  }
  if (standingRank === 3) {
    return {
      x: groupCenter.x - tangentialX * spreadTan,
      y: groupCenter.y - tangentialY * spreadTan,
    };
  }
  return {
    x: groupCenter.x + radialX * spreadRad,
    y: groupCenter.y + radialY * spreadRad,
  };
}

function computeKnockoutPosition(
  groupStagePos: PetalPoint,
  bracketHalf: BracketHalf | null,
  bracketDepth: number,
  canvasCenter: PetalPoint,
  leftHub: PetalPoint,
  rightHub: PetalPoint,
  depthPullStrength: number,
): PetalPoint {
  if (bracketDepth <= 0 || bracketHalf === null) {
    return groupStagePos;
  }

  const hub = bracketHalf === "left" ? leftHub : rightHub;
  const maxDepth = 6;
  const rawT = Math.min(bracketDepth / maxDepth, 1);
  const t = Math.min(rawT * depthPullStrength, 1);

  if (bracketDepth >= maxDepth) {
    return {
      x: lerp(groupStagePos.x, canvasCenter.x, t),
      y: lerp(groupStagePos.y, canvasCenter.y, t),
    };
  }

  const hubT = bracketDepth / (maxDepth - 1);
  const pullT = Math.min(hubT * depthPullStrength, 1);
  const viaHub = {
    x: lerp(groupStagePos.x, hub.x, pullT),
    y: lerp(groupStagePos.y, hub.y, pullT),
  };

  if (bracketDepth >= maxDepth - 1) {
    const finalT = (bracketDepth - (maxDepth - 1)) * depthPullStrength;
    return {
      x: lerp(viaHub.x, canvasCenter.x, Math.min(finalT, 1)),
      y: lerp(viaHub.y, canvasCenter.y, Math.min(finalT, 1)),
    };
  }

  return viaHub;
}

export function computePetalPositions(
  teams: Team[],
  probabilities: Record<string, number>,
  standings: Record<string, StandingRow[]>,
  bracketDepths: Record<string, number>,
  width: number,
  height: number,
  config: PetalLayoutConfig,
  sizing: VizSizing = getVizSizing(),
): PetalLayoutResult {
  const usableRadius = Math.min(width, height);
  const canvasCenter = computeCanvasCenter(width, height, config);
  const groupRingRadius = usableRadius * config.groupRingRadiusRatio;
  const spreadRad = usableRadius * config.spreadRadRatio;
  const spreadTan = usableRadius * config.spreadTanRatio;

  const leftHub: PetalPoint = {
    x: width * config.leftHubXRatio,
    y: height * config.hubYRatio,
  };
  const rightHub: PetalPoint = {
    x: width * config.rightHubXRatio,
    y: height * config.hubYRatio,
  };

  const advancingThirdGroups = getAdvancingThirdPlaceGroups(standings);

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

  const groupCenters: Record<string, PetalPoint> = {};
  const groupAngles: Record<string, number> = {};

  for (let i = 0; i < GROUP_IDS.length; i++) {
    const groupId = GROUP_IDS[i]!;
    groupAngles[groupId] = computeGroupAngle(i, config);
    groupCenters[groupId] = computeGroupCenter(
      i,
      canvasCenter,
      groupRingRadius,
      config,
    );
  }

  const positionedTeams: PetalTeamPosition[] = teams.map((team) => {
    const standingRank = getStandingRank(team.id, team.group, standings);
    const bracketHalf = getTeamBracketHalf(
      team.group,
      standingRank,
      advancingThirdGroups,
    );
    const bracketDepth = bracketDepths[team.id] ?? 0;
    const groupCenter = groupCenters[team.group] ?? canvasCenter;
    const angle = groupAngles[team.group] ?? 0;

    const groupStagePos = computeDiamondAnchor(
      groupCenter,
      angle,
      standingRank,
      spreadRad,
      spreadTan,
    );

    const { x, y } = computeKnockoutPosition(
      groupStagePos,
      bracketHalf,
      bracketDepth,
      canvasCenter,
      leftHub,
      rightHub,
      config.depthPullStrength,
    );

    return {
      id: team.id,
      x,
      y,
      r: radiusScale(probabilities[team.id] ?? 0),
      probability: probabilities[team.id] ?? 0,
      group: team.group,
      standingRank,
      bracketHalf,
      bracketDepth,
    };
  });

  return {
    teams: positionedTeams,
    canvasCenter,
    leftHub,
    rightHub,
    groupCenters,
    groupAngles,
    groupRingRadius,
    spreadRad,
    spreadTan,
    usableRadius,
  };
}

export function computePetalLaneAnchor(
  groupCenter: PetalPoint,
  angle: number,
  standingRank: 1 | 2 | 3 | 4,
  spreadRad: number,
  spreadTan: number,
): PetalPoint {
  return computeDiamondAnchor(
    groupCenter,
    angle,
    standingRank,
    spreadRad,
    spreadTan,
  );
}
