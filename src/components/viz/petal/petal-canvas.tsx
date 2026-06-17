"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  computePetalLaneAnchor,
  computePetalPositions,
  type PetalLayoutResult,
} from "@/components/viz/petal/petal-layout";
import { drawFlagCover, getFlagUrl } from "@/lib/flags";
import { computeFixedRenderLayer, getVizSizing, GROUP_IDS } from "@/components/viz/viz-math";

type PetalCanvasProps = {
  teams: Team[];
  probabilities: Record<string, number>;
  standings: Record<string, StandingRow[]>;
  bracketDepths: Record<string, number>;
  config: PetalLayoutConfig;
};

type DrawTeam = {
  id: string;
  isoCode: string;
  x: number;
  y: number;
  r: number;
  renderLayer: number;
  probability: number;
};

function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  layout: PetalLayoutResult,
  config: PetalLayoutConfig,
) {
  const {
    canvasCenter,
    groupRingRadius,
    groupCenters,
    groupAngles,
    leftHub,
    rightHub,
    laneSpread,
    outerSpread,
  } = layout;

  ctx.save();

  ctx.strokeStyle = "rgba(161, 161, 170, 0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, groupRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
  ctx.beginPath();
  ctx.moveTo(canvasCenter.x, 0);
  ctx.lineTo(canvasCenter.x, ctx.canvas.height);
  ctx.stroke();

  for (const hub of [leftHub, rightHub]) {
    ctx.fillStyle = "rgba(234, 179, 8, 0.7)";
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(234, 179, 8, 0.9)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("L", leftHub.x, leftHub.y - 10);
  ctx.fillText("R", rightHub.x, rightHub.y - 10);

  ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, 4, 0, Math.PI * 2);
  ctx.fill();

  for (const groupId of GROUP_IDS) {
    const center = groupCenters[groupId];
    const angle = groupAngles[groupId];
    if (!center || angle === undefined) continue;

    ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
    ctx.beginPath();
    ctx.moveTo(canvasCenter.x, canvasCenter.y);
    ctx.lineTo(center.x, center.y);
    ctx.stroke();

    ctx.fillStyle = "rgba(161, 161, 170, 0.8)";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(113, 113, 122, 0.9)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(groupId, center.x, center.y - 10);

    if (config.showDebug) {
      for (let rank = 1; rank <= 4; rank++) {
        const anchor = computePetalLaneAnchor(
          center,
          angle,
          rank as 1 | 2 | 3 | 4,
          laneSpread,
          outerSpread,
        );
        ctx.strokeStyle = "rgba(161, 161, 170, 0.5)";
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.stroke();

        ctx.fillStyle = "rgba(161, 161, 170, 0.6)";
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: DrawTeam,
  flags: Map<string, HTMLImageElement>,
  eliminatedOpacity: number,
) {
  const { x, y, r, probability } = team;
  const isEliminated = probability <= 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#27272a";
  ctx.globalAlpha = isEliminated ? eliminatedOpacity : 0.9;
  ctx.fill();
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 1;
  ctx.globalAlpha = isEliminated ? eliminatedOpacity : 1;
  ctx.stroke();

  const flag = flags.get(team.isoCode);
  const innerR = Math.max(r - 2, 4);

  if (flag && flag.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = isEliminated ? eliminatedOpacity : 1;
    drawFlagCover(ctx, flag, x, y, innerR * 2);
    ctx.restore();
  }

  ctx.restore();
}

export function PetalCanvas({
  teams,
  probabilities,
  standings,
  bracketDepths,
  config,
}: PetalCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flagsRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const sizeRef = useRef({ width: 800, height: 600 });
  const sizingRef = useRef(getVizSizing());
  const probabilitiesRef = useRef(probabilities);
  probabilitiesRef.current = probabilities;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    const sizing = sizingRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const layout = computePetalPositions(
      teams,
      probabilitiesRef.current,
      standings,
      bracketDepths,
      width,
      height,
      config,
      sizing,
    );

    if (config.showDebug) {
      drawDebugOverlay(ctx, layout, config);
    }

    const drawTeams: DrawTeam[] = layout.teams.map((node) => {
      const team = teams.find((t) => t.id === node.id)!;
      return {
        id: node.id,
        isoCode: team.isoCode,
        x: node.x,
        y: node.y,
        r: node.r,
        renderLayer: computeFixedRenderLayer(team.group, team.groupPosition),
        probability: node.probability,
      };
    });

    drawTeams.sort((a, b) => a.renderLayer - b.renderLayer);

    for (const team of drawTeams) {
      drawTeam(ctx, team, flagsRef.current, 0.45);
    }
  }, [teams, standings, bracketDepths, config]);

  useEffect(() => {
    const uniqueIso = [...new Set(teams.map((t) => t.isoCode))];
    for (const iso of uniqueIso) {
      if (flagsRef.current.has(iso)) continue;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = getFlagUrl(iso);
      img.onload = () => {
        flagsRef.current.set(iso, img);
        draw();
      };
    }
  }, [teams, draw]);

  useEffect(() => {
    draw();
  }, [draw, probabilities]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      sizingRef.current = getVizSizing();
      sizeRef.current = {
        width: container.clientWidth,
        height: container.clientHeight || Math.max(container.clientWidth * 0.65, 480),
      };
      draw();
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="h-full min-h-0 w-full">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
