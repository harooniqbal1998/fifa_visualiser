"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { WinProbabilityChartProps } from "@/components/viz/types";
import { getFlagUrl } from "@/lib/flags";
import {
  clamp,
  createDeterministicRandomSource,
  createRadiusScale,
  estimateEffectiveMaxRadius,
  getVizSizing,
  seededRandom,
} from "@/components/viz/viz-math";

const MIN_OPACITY = 0.12;
const MAX_OPACITY = 0.75;
const GROUP_LINK_STRENGTH = 0.95;
const SNAPSHOT_LINK_STRENGTH = 0.22;
const GROUP_LINK_OPACITY = 0.26;
const SIMULATION_TICKS = 320;

export type VizNode = {
  id: string;
  name: string;
  group: string;
  isoCode: string;
  probability: number;
  x: number;
  y: number;
  r: number;
};

export type VizLink = {
  sourceId: string;
  targetId: string;
  opacity: number;
  strength: number;
};

type SimulationLink = d3.SimulationLinkDatum<VizNode> & {
  strength: number;
};

function assignNodePositions(
  nodes: Omit<VizNode, "x" | "y" | "r">[],
  width: number,
  height: number,
  day: number,
  maxRadius: number,
): VizNode[] {
  const { padding } = getVizSizing();
  const pad = maxRadius + padding;
  const xRange = Math.max(width - pad * 2, 1);
  const yRange = Math.max(height - pad * 2, 1);

  return nodes.map((node) => ({
    ...node,
    x: pad + seededRandom(`${node.id}:${day}:x`) * xRange,
    y: pad + seededRandom(`${node.id}:${day}:y`) * yRange,
    r: 0,
  }));
}

function buildNodes({ snapshot, teams }: WinProbabilityChartProps): Omit<VizNode, "x" | "y" | "r">[] {
  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    group: team.group,
    isoCode: team.isoCode,
    probability: snapshot.probabilities[team.id] ?? 0,
  }));
}

function buildSnapshotLinks(
  snapshot: WinProbabilityChartProps["snapshot"],
  nodeById: Map<string, VizNode>,
): VizLink[] {
  const links: VizLink[] = [];
  const seen = new Set<string>();

  for (const [teamId, opponents] of Object.entries(snapshot.possibleOpponents)) {
    const source = nodeById.get(teamId);
    if (!source || opponents.length === 0) continue;

    const perOpponentWeight = source.probability / opponents.length;

    for (const opponentId of opponents) {
      const target = nodeById.get(opponentId);
      if (!target) continue;

      const edgeKey = [teamId, opponentId].sort().join("::");
      if (seen.has(edgeKey)) continue;
      seen.add(edgeKey);

      const targetOpponents = snapshot.possibleOpponents[opponentId] ?? [];
      const reverseWeight =
        targetOpponents.length > 0 ? target.probability / targetOpponents.length : 0;
      const opacityWeight = Math.max(perOpponentWeight, reverseWeight);

      links.push({
        sourceId: teamId,
        targetId: opponentId,
        opacity: opacityWeight,
        strength: SNAPSHOT_LINK_STRENGTH,
      });
    }
  }

  return links;
}

function buildGroupLinks(nodes: VizNode[]): VizLink[] {
  const links: VizLink[] = [];
  const nodesByGroup = d3.group(nodes, (node) => node.group);

  for (const groupNodes of nodesByGroup.values()) {
    for (let i = 0; i < groupNodes.length; i++) {
      for (let j = i + 1; j < groupNodes.length; j++) {
        links.push({
          sourceId: groupNodes[i].id,
          targetId: groupNodes[j].id,
          opacity: GROUP_LINK_OPACITY,
          strength: GROUP_LINK_STRENGTH,
        });
      }
    }
  }

  return links;
}

function mergeLinks(links: VizLink[]): VizLink[] {
  const merged = new Map<string, VizLink>();

  for (const link of links) {
    const key = [link.sourceId, link.targetId].sort().join("::");
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, link);
      continue;
    }

    existing.opacity = Math.max(existing.opacity, link.opacity);
    existing.strength = Math.max(existing.strength, link.strength);
  }

  return [...merged.values()];
}

function curvedLinkPath(
  source: VizNode,
  target: VizNode,
  width: number,
  height: number,
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Start/end at node centers so links originate inside the country circles.
  const x1 = source.x;
  const y1 = source.y;
  const x2 = target.x;
  const y2 = target.y;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const curvature = 0.25;
  const cx = clamp(mx - dy * curvature, 0, width);
  const cy = clamp(my + dx * curvature, 0, height);

  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

function clampNodeToViewport(node: VizNode, width: number, height: number) {
  const { padding } = getVizSizing();
  const xMin = padding + node.r;
  const xMax = Math.max(width - padding - node.r, xMin);
  const yMin = padding + node.r;
  const yMax = Math.max(height - padding - node.r, yMin);
  node.x = clamp(node.x, xMin, xMax);
  node.y = clamp(node.y, yMin, yMax);
}

function verifyNoOverlaps(nodes: VizNode[]) {
  const { nodePadding } = getVizSizing();
  let overlaps = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const first = nodes[i];
      const second = nodes[j];
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = first.r + second.r + nodePadding;
      if (distance < minDistance) {
        overlaps++;
      }
    }
  }

  if (process.env.NODE_ENV !== "production" && overlaps > 0) {
    console.warn(`TeamNetwork overlap check: ${overlaps} overlaps detected`);
  }
}

export function TeamNetwork({ snapshot, teams }: WinProbabilityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = svgRef.current;
    if (!container || !svgElement) return;

    function render() {
      if (!container || !svgElement) return;

      const width = container.clientWidth;
      const height = container.clientHeight || Math.max(width * 0.65, 480);

      const baseNodes = buildNodes({ snapshot, teams });
      const maxProbability = d3.max(baseNodes, (d) => d.probability) ?? 1;
      const effectiveMaxRadius = estimateEffectiveMaxRadius(width, height, baseNodes.length);
      const radiusScale = createRadiusScale(maxProbability, effectiveMaxRadius);
      const { minRadius, nodePadding } = getVizSizing();

      const positionedNodes = assignNodePositions(
        baseNodes,
        width,
        height,
        snapshot.day,
        effectiveMaxRadius,
      ).map((node) => ({
        ...node,
        r: radiusScale(node.probability),
      }));

      const nodeById = new Map(positionedNodes.map((node) => [node.id, node]));
      const links = mergeLinks([
        ...buildGroupLinks(positionedNodes),
        ...buildSnapshotLinks(snapshot, nodeById),
      ]);

      const simulationLinks: SimulationLink[] = links.map((link) => ({
        source: link.sourceId,
        target: link.targetId,
        strength: link.strength,
      }));

      const simulation = d3
        .forceSimulation(positionedNodes)
        .randomSource(createDeterministicRandomSource(`day:${snapshot.day}`))
        .force(
          "link",
          d3
            .forceLink<VizNode, SimulationLink>(simulationLinks)
            .id((d) => d.id)
            .strength((link) => link.strength)
            .distance((link) => {
              const sourceNode =
                typeof link.source === "object"
                  ? link.source
                  : typeof link.source === "string"
                    ? nodeById.get(link.source)
                    : undefined;
              const targetNode =
                typeof link.target === "object"
                  ? link.target
                  : typeof link.target === "string"
                    ? nodeById.get(link.target)
                    : undefined;
              const sourceRadius = sourceNode?.r ?? minRadius;
              const targetRadius = targetNode?.r ?? minRadius;
              const baseDistance = sourceRadius + targetRadius + nodePadding * 2.5;
              return link.strength >= GROUP_LINK_STRENGTH * 0.7 ? baseDistance * 0.95 : baseDistance * 1.35;
            }),
        )
        .force("charge", d3.forceManyBody().strength(-20))
        .force(
          "collide",
          d3
            .forceCollide<VizNode>()
            .radius((d) => d.r + nodePadding)
            .strength(1),
        )
        .force("x", d3.forceX(width / 2).strength(0.03))
        .force("y", d3.forceY(height / 2).strength(0.03))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .stop();

      for (let tick = 0; tick < SIMULATION_TICKS; tick++) {
        simulation.tick();
        positionedNodes.forEach((node) => clampNodeToViewport(node, width, height));
      }
      simulation.stop();
      verifyNoOverlaps(positionedNodes);

      const opacityScale = d3
        .scaleLinear()
        .domain([0, maxProbability])
        .range([MIN_OPACITY, MAX_OPACITY])
        .clamp(true);

      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const clipId = `team-network-clip-${snapshot.day}`;
      const defs = svg.append("defs");
      defs
        .append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      positionedNodes.forEach((node) => {
        defs
          .append("clipPath")
          .attr("id", `flag-clip-${node.id}-${snapshot.day}`)
          .attr("clipPathUnits", "objectBoundingBox")
          .append("circle")
          .attr("cx", 0.5)
          .attr("cy", 0.5)
          .attr("r", 0.5);
      });

      const chart = svg.append("g");
      const linksLayer = chart.append("g").attr("class", "links");
      const nodesLayer = chart.append("g").attr("class", "nodes");

      linksLayer
        .append("g")
        .attr("clip-path", `url(#${clipId})`)
        .selectAll("path.link")
        .data(links)
        .join("path")
        .attr("class", "link")
        .attr("d", (link) => {
          const source = nodeById.get(link.sourceId);
          const target = nodeById.get(link.targetId);
          if (!source || !target) return "";
          return curvedLinkPath(source, target, width, height);
        })
        .attr("fill", "none")
        .attr("stroke", "#71717a")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", (link) => opacityScale(link.opacity));

      const nodeGroups = nodesLayer
        .selectAll("g.node")
        .data(positionedNodes)
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      nodeGroups
        .append("circle")
        .attr("r", (d) => d.r)
        .attr("fill", "#27272a")
        .attr("fill-opacity", 0.9)
        .attr("stroke", "#a1a1aa")
        .attr("stroke-width", 1);

      nodeGroups
        .append("image")
        .attr("href", (d) => getFlagUrl(d.isoCode))
        .attr("x", (d) => -(d.r - 2))
        .attr("y", (d) => -(d.r - 2))
        .attr("width", (d) => (d.r - 2) * 2)
        .attr("height", (d) => (d.r - 2) * 2)
        .attr("clip-path", (d) => `url(#flag-clip-${d.id}-${snapshot.day})`)
        .attr("preserveAspectRatio", "xMidYMid slice");

    }

    render();

    const resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [snapshot, teams]);

  return (
    <div className="flex h-full min-h-0 flex-col px-6 py-4 text-zinc-900 dark:text-zinc-100">
      <header className="mb-4 shrink-0">
        <h2 className="text-sm font-medium">Day {snapshot.day}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Team win probability and likely next opponents
        </p>
      </header>
      <div ref={containerRef} className="min-h-0 flex-1">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Team network visualization for day ${snapshot.day}`}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
