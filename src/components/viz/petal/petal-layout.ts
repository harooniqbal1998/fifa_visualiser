import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import { getCumulativePullPct } from "@/components/viz/petal/petal-config";
import {
  getTeamBracketHalf,
  type BracketHalf,
} from "@/data/tournament-paths";
import {
  createRadiusScale,
  estimateEffectiveMaxRadius,
  getVizSizing,
  GROUP_IDS,
  type VizSizing,
} from "@/components/viz/viz-math";
import { selectAdvancingThirdPlaceGroups } from "@/lib/simulation/group-advancement";
import { createSeededRng } from "@/lib/simulation/animation-params";

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
  groupCenters: Record<string, PetalPoint>;
  groupAngles: Record<string, number>;
  groupRingRadius: number;
  innerRingRadius: number;
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

const CHAMPION_BRACKET_DEPTH = 6;

function pullTowardRadius(
  pos: PetalPoint,
  center: PetalPoint,
  targetRadius: number,
): PetalPoint {
  const dx = pos.x - center.x;
  const dy = pos.y - center.y;
  const currentRadius = Math.hypot(dx, dy);
  if (currentRadius < 1e-6) {
    return { x: center.x, y: center.y };
  }
  const scale = targetRadius / currentRadius;
  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function computeKnockoutPosition(
  groupStagePos: PetalPoint,
  bracketDepth: number,
  canvasCenter: PetalPoint,
  usableRadius: number,
  config: PetalLayoutConfig,
): PetalPoint {
  if (bracketDepth <= 0) {
    return groupStagePos;
  }

  if (bracketDepth >= CHAMPION_BRACKET_DEPTH) {
    return canvasCenter;
  }

  const dx = groupStagePos.x - canvasCenter.x;
  const dy = groupStagePos.y - canvasCenter.y;
  const groupStageRadius = Math.hypot(dx, dy);
  const minRadius = usableRadius * config.knockoutMinRadiusRatio;
  const cumulativePct = getCumulativePullPct(bracketDepth, config);
  const targetRadius = lerp(groupStageRadius, minRadius, cumulativePct / 100);
  return pullTowardRadius(groupStagePos, canvasCenter, targetRadius);
}

function clampTeamX(
  x: number,
  width: number,
  r: number,
  sizing: VizSizing,
): number {
  const xMin = sizing.padding + r;
  const xMax = width - sizing.padding - r;
  return Math.max(xMin, Math.min(xMax, x));
}

export function computeEliminatedBottomY(
  height: number,
  config: PetalLayoutConfig,
  sizing: VizSizing = getVizSizing(),
): number {
  const r = sizing.minRadius;
  const bottomPadding = height * config.bottomStripPaddingRatio;
  return height - bottomPadding - r;
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
  eliminated: Set<string> = new Set(),
): PetalLayoutResult {
  const usableRadius = Math.min(width, height);
  const canvasCenter = computeCanvasCenter(width, height, config);
  const groupRingRadius = usableRadius * config.groupRingRadiusRatio;
  const innerRingRadius = usableRadius * config.knockoutMinRadiusRatio;
  const spreadRad = usableRadius * config.spreadRadRatio;
  const spreadTan = usableRadius * config.spreadTanRatio;

  const advancingThirdGroups = selectAdvancingThirdPlaceGroups(
    standings,
    createSeededRng(42),
  );

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
      bracketDepth,
      canvasCenter,
      usableRadius,
      config,
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

  if (eliminated.size > 0) {
    const bottomY = computeEliminatedBottomY(height, config, sizing);
    for (const team of positionedTeams) {
      if (eliminated.has(team.id)) {
        team.x = clampTeamX(team.x, width, team.r, sizing);
        team.y = bottomY;
      }
    }
  }

  return {
    teams: positionedTeams,
    canvasCenter,
    groupCenters,
    groupAngles,
    groupRingRadius,
    innerRingRadius,
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
