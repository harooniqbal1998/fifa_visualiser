import * as d3 from "d3";
import type { Snapshot, Team } from "@/types";
import {
  clampToViewport,
  createDeterministicRandomSource,
  createRadiusScale,
  estimateEffectiveMaxRadius,
  getVizSizing,
  type VizSizing,
} from "@/components/viz/viz-math";

const GROUP_LINK_STRENGTH = 0.95;
const ANCHOR_STRENGTH = 0.22;
const SIMULATION_TICKS = 120;
const MAX_BRACKET_DEPTH = 6;

const GROUPS = "ABCDEFGHIJKL".split("");

type LayoutNode = {
  id: string;
  group: string;
  groupPosition: number;
  probability: number;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  r: number;
  vx?: number;
  vy?: number;
};

type LayoutLink = {
  sourceId: string;
  targetId: string;
  strength: number;
};

type SimulationLink = d3.SimulationLinkDatum<LayoutNode> & {
  strength: number;
};

export type LayoutTeam = {
  id: string;
  x: number;
  y: number;
  r: number;
  probability: number;
};

export type LayoutInput = Pick<
  Snapshot,
  "day" | "probabilities" | "possibleOpponents" | "bracketDepths"
>;

function layoutCenter(
  width: number,
  height: number,
  bottomReserve: number,
): { x: number; y: number } {
  return {
    x: width * 0.5,
    y: (height - bottomReserve) * 0.5,
  };
}

function groupAngle(group: string): number {
  const index = GROUPS.indexOf(group);
  return (index / GROUPS.length) * Math.PI * 2 - Math.PI / 2;
}

function groupPositionOffset(position: number, scale: number): { dx: number; dy: number } {
  const offsets: Record<number, { dx: number; dy: number }> = {
    1: { dx: -16, dy: -12 },
    2: { dx: 16, dy: -12 },
    3: { dx: -16, dy: 12 },
    4: { dx: 16, dy: 12 },
  };
  const base = offsets[position] ?? { dx: 0, dy: 0 };
  return { dx: base.dx * scale, dy: base.dy * scale };
}

function computeAnchor(
  team: Team,
  depth: number,
  width: number,
  height: number,
  bottomReserve: number,
): { x: number; y: number } {
  const center = layoutCenter(width, height, bottomReserve);
  const usable = Math.min(width, height - bottomReserve);
  const outerRadius = usable * 0.44;
  const t = Math.min(depth / MAX_BRACKET_DEPTH, 1);
  const radius = outerRadius * (1 - t);
  const angle = groupAngle(team.group);
  const offsetScale = Math.max(0.35, 1 - t * 0.65);
  const offset = groupPositionOffset(team.groupPosition, offsetScale);

  if (depth >= MAX_BRACKET_DEPTH) {
    return { x: center.x, y: center.y };
  }

  return {
    x: center.x + Math.cos(angle) * radius + offset.dx,
    y: center.y + Math.sin(angle) * radius + offset.dy,
  };
}

function buildGroupLinks(nodes: LayoutNode[]): LayoutLink[] {
  const links: LayoutLink[] = [];
  const nodesByGroup = d3.group(nodes, (node) => node.group);

  for (const groupNodes of nodesByGroup.values()) {
    for (let i = 0; i < groupNodes.length; i++) {
      for (let j = i + 1; j < groupNodes.length; j++) {
        links.push({
          sourceId: groupNodes[i].id,
          targetId: groupNodes[j].id,
          strength: GROUP_LINK_STRENGTH,
        });
      }
    }
  }

  return links;
}

function forceAnchor(strength: number) {
  let nodes: LayoutNode[] = [];

  function force(alpha: number) {
    for (const node of nodes) {
      node.vx = (node.vx ?? 0) + (node.anchorX - node.x) * strength * alpha;
      node.vy = (node.vy ?? 0) + (node.anchorY - node.y) * strength * alpha;
    }
  }

  force.initialize = (initializedNodes: LayoutNode[]) => {
    nodes = initializedNodes;
  };

  return force;
}

export function computeTeamAnchors(
  teams: Team[],
  bracketDepths: Record<string, number>,
  width: number,
  height: number,
  bottomReserve: number,
): Record<string, { x: number; y: number }> {
  const anchors: Record<string, { x: number; y: number }> = {};
  for (const team of teams) {
    const depth = bracketDepths[team.id] ?? 0;
    anchors[team.id] = computeAnchor(team, depth, width, height, bottomReserve);
  }
  return anchors;
}

export function layoutCanvasTeams(
  teams: Team[],
  snapshot: LayoutInput,
  width: number,
  height: number,
  bottomReserve: number,
  sizing: VizSizing = getVizSizing(),
): LayoutTeam[] {
  const maxProbability =
    Math.max(...teams.map((t) => snapshot.probabilities[t.id] ?? 0), 1);
  const effectiveMaxRadius = estimateEffectiveMaxRadius(
    width,
    height,
    teams.length,
    sizing,
  );
  const radiusScale = createRadiusScale(maxProbability, effectiveMaxRadius, sizing);
  const bracketDepths = snapshot.bracketDepths ?? {};

  const nodes: LayoutNode[] = teams.map((team) => {
    const probability = snapshot.probabilities[team.id] ?? 0;
    const r = radiusScale(probability);
    const depth = bracketDepths[team.id] ?? (snapshot.day >= 12 ? 1 : 0);
    const anchor = computeAnchor(team, depth, width, height, bottomReserve);

    return {
      id: team.id,
      group: team.group,
      groupPosition: team.groupPosition,
      probability,
      x: anchor.x,
      y: anchor.y,
      anchorX: anchor.x,
      anchorY: anchor.y,
      r,
    };
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const useGroupLinks = snapshot.day < 12;
  const links = useGroupLinks ? buildGroupLinks(nodes) : [];

  const simulationLinks: SimulationLink[] = links.map((link) => ({
    source: link.sourceId,
    target: link.targetId,
    strength: link.strength,
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .randomSource(createDeterministicRandomSource(`day:${snapshot.day}`))
    .force(
      "link",
      d3
        .forceLink<LayoutNode, SimulationLink>(simulationLinks)
        .id((d) => d.id)
        .strength((link) => link.strength)
        .distance((link) => {
          const sourceNode =
            typeof link.source === "object"
              ? link.source
              : nodeById.get(link.source as string);
          const targetNode =
            typeof link.target === "object"
              ? link.target
              : nodeById.get(link.target as string);
          const sourceRadius = sourceNode?.r ?? sizing.minRadius;
          const targetRadius = targetNode?.r ?? sizing.minRadius;
          return sourceRadius + targetRadius + sizing.nodePadding * 2;
        }),
    )
    .force("charge", d3.forceManyBody().strength(-12))
    .force(
      "collide",
      d3
        .forceCollide<LayoutNode>()
        .radius((d) => d.r + sizing.nodePadding)
        .strength(0.85),
    )
    .force("anchor", forceAnchor(ANCHOR_STRENGTH))
    .stop();

  for (let tick = 0; tick < SIMULATION_TICKS; tick++) {
    simulation.tick();
    for (const node of nodes) {
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
    }
  }

  return nodes.map((node) => ({
    id: node.id,
    x: node.x,
    y: node.y,
    r: node.r,
    probability: node.probability,
  }));
}
