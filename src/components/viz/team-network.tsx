"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { WinProbabilityChartProps } from "@/components/viz/types";
import { getFlagUrl } from "@/lib/flags";

const MIN_RADIUS = 10;
const MAX_RADIUS = 42;
const MIN_OPACITY = 0.12;
const MAX_OPACITY = 0.75;
const PADDING = 48;

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
};

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function assignNodePositions(
  nodes: Omit<VizNode, "x" | "y" | "r">[],
  width: number,
  height: number,
  day: number,
  maxRadius: number,
): VizNode[] {
  const pad = maxRadius + PADDING;
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

function buildLinks(
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
      });
    }
  }

  return links;
}

function curvedLinkPath(
  source: VizNode,
  target: VizNode,
  width: number,
  height: number,
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  const x1 = source.x + (dx / dist) * source.r;
  const y1 = source.y + (dy / dist) * source.r;
  const x2 = target.x - (dx / dist) * target.r;
  const y2 = target.y - (dy / dist) * target.r;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const curvature = 0.25;
  const cx = clamp(mx - dy * curvature, 0, width);
  const cy = clamp(my + dx * curvature, 0, height);

  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, maxProbability])
        .range([MIN_RADIUS, MAX_RADIUS]);

      const positionedNodes = assignNodePositions(
        baseNodes,
        width,
        height,
        snapshot.day,
        MAX_RADIUS,
      ).map((node) => ({
        ...node,
        r: radiusScale(node.probability),
      }));

      const nodeById = new Map(positionedNodes.map((node) => [node.id, node]));
      const links = buildLinks(snapshot, nodeById);

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
          .append("circle")
          .attr("r", Math.max(node.r - 2, 4));
      });

      const chart = svg.append("g");

      chart
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

      const nodeGroups = chart
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

      nodeGroups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => d.r + 12)
        .attr("fill", "currentColor")
        .attr("font-size", 10)
        .text((d) => `${d.name} · ${d.group}`);
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
