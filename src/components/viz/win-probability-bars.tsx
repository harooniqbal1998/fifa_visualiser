"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { WinProbabilityChartProps } from "@/components/viz/types";

const TOP_N = 16;
const MARGIN = { top: 8, right: 48, bottom: 8, left: 120 };

type ChartRow = {
  id: string;
  name: string;
  group: string;
  probability: number;
};

function prepareChartData({ snapshot, teams }: WinProbabilityChartProps): ChartRow[] {
  return teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      group: team.group,
      probability: snapshot.probabilities[team.id] ?? 0,
    }))
    .filter((row) => row.probability > 0)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, TOP_N);
}

export function WinProbabilityBars({ snapshot, teams }: WinProbabilityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = svgRef.current;
    if (!container || !svgElement) return;

    const data = prepareChartData({ snapshot, teams });

    function render() {
      if (!container || !svgElement) return;

      const width = container.clientWidth;
      const height = Math.max(data.length * 28 + MARGIN.top + MARGIN.bottom, 120);
      const innerWidth = width - MARGIN.left - MARGIN.right;
      const innerHeight = height - MARGIN.top - MARGIN.bottom;

      const svg = d3.select(svgElement);
      svg.selectAll("*").remove();
      svg.attr("width", width).attr("height", height);

      const chart = svg
        .append("g")
        .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.probability) ?? 1])
        .range([0, innerWidth])
        .nice();

      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.name))
        .range([0, innerHeight])
        .padding(0.2);

      chart
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d) => y(d.name) ?? 0)
        .attr("width", (d) => x(d.probability))
        .attr("height", y.bandwidth())
        .attr("fill", "#52525b")
        .attr("rx", 2);

      chart
        .selectAll("text.label")
        .data(data)
        .join("text")
        .attr("class", "label")
        .attr("x", -8)
        .attr("y", (d) => (y(d.name) ?? 0) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .attr("font-size", 12)
        .text((d) => d.name);

      chart
        .selectAll("text.value")
        .data(data)
        .join("text")
        .attr("class", "value")
        .attr("x", (d) => x(d.probability) + 6)
        .attr("y", (d) => (y(d.name) ?? 0) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "currentColor")
        .attr("font-size", 11)
        .text((d) => `${d.probability.toFixed(1)}%`);
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
          Win probability (top {TOP_N})
        </p>
      </header>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto">
        <svg ref={svgRef} role="img" aria-label={`Win probability chart for day ${snapshot.day}`} />
      </div>
    </div>
  );
}
