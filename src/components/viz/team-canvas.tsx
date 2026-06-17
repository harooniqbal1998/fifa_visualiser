"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Team } from "@/types";
import type { AnimationParams } from "@/lib/simulation/animation-params";
import type { CollisionEvent } from "@/lib/simulation/types";
import { computeAllPositions, computeTeamAnchor } from "@/components/viz/group-layout";
import { DEFAULT_LAYOUT_CONFIG } from "@/components/viz/layout-config";
import { drawFlagCover, getFlagUrl } from "@/lib/flags";
import {
  computeFixedRenderLayer,
  getVizSizing,
  GROUP_IDS,
} from "@/components/viz/viz-math";

export type TeamCanvasRef = {
  playCollision: (event: CollisionEvent) => Promise<void>;
  eliminateTeams: (teamIds: string[]) => Promise<void>;
  setProbabilities: (probabilities: Record<string, number>) => void;
  relayoutAnchors: (bracketDepths: Record<string, number>) => void;
  resetFromSnapshot: (
    probabilities: Record<string, number>,
    seedKey: string,
    eliminated?: Set<string>,
  ) => void;
};

type TeamCanvasProps = {
  teams: Team[];
  probabilities: Record<string, number>;
  possibleOpponents: Record<string, string[]>;
  bracketDepths: Record<string, number>;
  snapshotDay: number;
  seedKey: string;
  params: AnimationParams;
  isSimulating: boolean;
  eliminated?: Set<string>;
};

type DrawTeam = {
  id: string;
  isoCode: string;
  name: string;
  group: string;
  groupPosition: number;
  x: number;
  y: number;
  r: number;
  renderLayer: number;
};

function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof computeAllPositions>,
) {
  const { canvasCenter, groupRingRadius, groupCenters, groupBounds, spreadX, spreadY, groupRotations } =
    layout;

  ctx.save();

  ctx.strokeStyle = "rgba(161, 161, 170, 0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, groupRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const groupId of GROUP_IDS) {
    const center = groupCenters[groupId];
    const bounds = groupBounds[groupId];
    if (!center || !bounds) continue;

    ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
    ctx.strokeRect(
      bounds.minX,
      bounds.minY,
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
    );

    ctx.fillStyle = "rgba(161, 161, 170, 0.8)";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(113, 113, 122, 0.9)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(groupId, center.x, center.y - 10);

    for (let pos = 1; pos <= 4; pos++) {
      const rotationRad = groupRotations[groupId] ?? 0;
      const anchor = computeTeamAnchor(
        center,
        pos,
        spreadX,
        spreadY,
        rotationRad,
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

  ctx.restore();
}

function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: DrawTeam,
  flags: Map<string, HTMLImageElement>,
) {
  const { x, y, r } = team;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#27272a";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;
  ctx.stroke();

  const flag = flags.get(team.isoCode);
  const innerR = Math.max(r - 2, 4);

  if (flag && flag.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.clip();
    drawFlagCover(ctx, flag, x, y, innerR * 2);
    ctx.restore();
  }

  ctx.restore();
}

export const TeamCanvas = forwardRef<TeamCanvasRef, TeamCanvasProps>(
  function TeamCanvas({ teams, probabilities }, ref) {
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

      const layout = computeAllPositions(
        teams,
        probabilitiesRef.current,
        width,
        height,
        DEFAULT_LAYOUT_CONFIG,
        sizing,
      );

      if (DEFAULT_LAYOUT_CONFIG.showDebug) {
        drawDebugOverlay(ctx, layout);
      }

      const drawTeams: DrawTeam[] = layout.teams.map((node) => {
        const team = teams.find((t) => t.id === node.id)!;
        return {
          id: node.id,
          isoCode: team.isoCode,
          name: team.name,
          group: team.group,
          groupPosition: team.groupPosition,
          x: node.x,
          y: node.y,
          r: node.r,
          renderLayer: computeFixedRenderLayer(team.group, team.groupPosition),
        };
      });

      drawTeams.sort((a, b) => a.renderLayer - b.renderLayer);

      for (const team of drawTeams) {
        drawTeam(ctx, team, flagsRef.current);
      }
    }, [teams]);

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

    useImperativeHandle(
      ref,
      () => ({
        playCollision() {
          return Promise.resolve();
        },
        eliminateTeams() {
          return Promise.resolve();
        },
        setProbabilities(probs: Record<string, number>) {
          probabilitiesRef.current = probs;
          draw();
        },
        relayoutAnchors() {
          draw();
        },
        resetFromSnapshot(probs) {
          probabilitiesRef.current = probs;
          draw();
        },
      }),
      [draw],
    );

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
    );
  },
);
