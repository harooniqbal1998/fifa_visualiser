"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Snapshot, Team } from "@/types";
import type { AnimationParams } from "@/lib/simulation/animation-params";
import type { CollisionEvent } from "@/lib/simulation/types";
import { computeTeamAnchors, layoutCanvasTeams } from "@/components/viz/canvas-layout";
import { drawFlagCover, getFlagUrl } from "@/lib/flags";
import {
  clamp,
  clampToViewport,
  computeApproachTargets,
  createRadiusScale,
  easeInOutCubic,
  estimateEffectiveMaxRadius,
  getVizSizing,
  type VizSizing,
} from "@/components/viz/viz-math";

const MAX_FLOAT_OFFSET = 6;
const APPROACH_SPEED = 2.8;

export type CanvasTeamState = {
  id: string;
  isoCode: string;
  name: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  r: number;
  targetR: number;
  probability: number;
  status: "active" | "colliding" | "shrinking" | "eliminated" | "dropped";
  grayOpacity: number;
  floatAngle: number;
  renderLayer: number;
};

type ActiveTween = {
  teamIds: string[];
  startTime: number;
  duration: number;
  phase: "approach" | "impact" | "shrink" | "return" | "drop";
  resolve: () => void;
  restA?: { x: number; y: number };
  restB?: { x: number; y: number };
  approachTargetA?: { x: number; y: number };
  approachTargetB?: { x: number; y: number };
  meetDistance?: number;
  startRadiusA?: number;
  startRadiusB?: number;
  winnerId?: string;
  loserId?: string;
  returnHome?: { x: number; y: number };
  loserHome?: { x: number; y: number };
  returnStartWinner?: { x: number; y: number };
  returnStartLoser?: { x: number; y: number };
  dropStartY?: number;
  isKnockoutLoser?: boolean;
};

type AnchorTween = {
  teamId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
};

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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function seededAngle(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 360) * (Math.PI / 180);
}

function clampDisplayToHome(node: CanvasTeamState) {
  const dx = node.x - node.homeX;
  const dy = node.y - node.homeY;
  const dist = Math.hypot(dx, dy) || 0.01;
  if (dist > MAX_FLOAT_OFFSET) {
    const scale = MAX_FLOAT_OFFSET / dist;
    node.x = node.homeX + dx * scale;
    node.y = node.homeY + dy * scale;
  }
}

function applyFloat(
  nodes: CanvasTeamState[],
  timestamp: number,
  params: AnimationParams,
  width: number,
  height: number,
  bottomReserve: number,
  sizing: VizSizing,
) {
  const t = timestamp * 0.001 * params.floatSpeed;

  for (const node of nodes) {
    if (node.status !== "active") continue;

    const dx = Math.cos(node.floatAngle + t) * 0.15;
    const dy = Math.sin(node.floatAngle + t * 0.7) * 0.15;
    const clamped = clampToViewport(
      node.homeX + dx,
      node.homeY + dy,
      node.r,
      width,
      height,
      bottomReserve,
      sizing,
    );
    node.x = clamped.x;
    node.y = clamped.y;
    clampDisplayToHome(node);
  }
}

function applyRepulsion(
  nodes: CanvasTeamState[],
  params: AnimationParams,
  width: number,
  height: number,
  bottomReserve: number,
  sizing: VizSizing,
) {
  const active = nodes.filter((n) => n.status === "active");

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const minDist = a.r + b.r + sizing.nodePadding;
      if (dist >= minDist) continue;

      const push = ((minDist - dist) / dist) * (params.repulsionStrength / 10000);
      const px = dx * push;
      const py = dy * push;

      const aClamped = clampToViewport(
        a.x - px,
        a.y - py,
        a.r,
        width,
        height,
        bottomReserve,
        sizing,
      );
      const bClamped = clampToViewport(
        b.x + px,
        b.y + py,
        b.r,
        width,
        height,
        bottomReserve,
        sizing,
      );
      a.x = aClamped.x;
      a.y = aClamped.y;
      b.x = bClamped.x;
      b.y = bClamped.y;
      clampDisplayToHome(a);
      clampDisplayToHome(b);
    }
  }
}

function applySpringToHome(nodes: CanvasTeamState[]) {
  for (const node of nodes) {
    if (node.status !== "active") continue;
    node.x += (node.homeX - node.x) * 0.08;
    node.y += (node.homeY - node.y) * 0.08;
  }
}

function steerToward(
  team: CanvasTeamState,
  target: { x: number; y: number },
  nodes: CanvasTeamState[],
  excludeIds: Set<string>,
  speed: number,
  width: number,
  height: number,
  bottomReserve: number,
  sizing: VizSizing,
) {
  let dx = target.x - team.x;
  let dy = target.y - team.y;
  const dist = Math.hypot(dx, dy) || 0.01;
  if (dist <= speed) {
    team.x = target.x;
    team.y = target.y;
  } else {
    team.x += (dx / dist) * speed;
    team.y += (dy / dist) * speed;
  }

  for (const other of nodes) {
    if (excludeIds.has(other.id) || other.id === team.id) continue;
    if (other.status === "dropped") continue;

    const odx = team.x - other.x;
    const ody = team.y - other.y;
    const odist = Math.hypot(odx, ody) || 0.01;
    const minDist = team.r + other.r + sizing.nodePadding;
    if (odist < minDist) {
      const push = (minDist - odist) / odist;
      team.x += odx * push;
      team.y += ody * push;
    }
  }

  const clamped = clampToViewport(
    team.x,
    team.y,
    team.r,
    width,
    height,
    bottomReserve,
    sizing,
  );
  team.x = clamped.x;
  team.y = clamped.y;
}

function getMovingTeamIds(tweens: ActiveTween[]): Set<string> {
  const ids = new Set<string>();
  for (const tween of tweens) {
    for (const id of tween.teamIds) {
      ids.add(id);
    }
    if (tween.winnerId) ids.add(tween.winnerId);
    if (tween.loserId) ids.add(tween.loserId);
  }
  return ids;
}

function updateAnchorTweens(
  anchorTweens: AnchorTween[],
  now: number,
  nodes: CanvasTeamState[],
): AnchorTween[] {
  const remaining: AnchorTween[] = [];

  for (const tween of anchorTweens) {
    const team = nodes.find((n) => n.id === tween.teamId);
    if (!team || team.status === "dropped" || team.status === "eliminated") {
      continue;
    }

    const elapsed = now - tween.startTime;
    const t = easeInOutCubic(clamp(elapsed / tween.duration, 0, 1));
    const x = lerp(tween.startX, tween.endX, t);
    const y = lerp(tween.startY, tween.endY, t);

    team.x = x;
    team.y = y;
    team.homeX = x;
    team.homeY = y;

    if (elapsed < tween.duration) {
      remaining.push(tween);
    }
  }

  return remaining;
}

function updateTweens(
  tweens: ActiveTween[],
  now: number,
  nodes: CanvasTeamState[],
  params: AnimationParams,
  width: number,
  height: number,
  sizing: VizSizing,
): ActiveTween[] {
  const bottomY = height - params.timelineDropOffset;
  const bottomReserve = params.timelineDropOffset + sizing.minRadius;
  const remaining: ActiveTween[] = [];

  for (const tween of tweens) {
    const elapsed = now - tween.startTime;
    const teamA = nodes.find((n) => n.id === tween.teamIds[0]);
    const teamB = tween.teamIds[1] ? nodes.find((n) => n.id === tween.teamIds[1]) : undefined;

    if (tween.phase === "approach" && teamA && teamB && tween.approachTargetA && tween.approachTargetB) {
      teamA.renderLayer = 10;
      teamB.renderLayer = 10;

      if (tween.startRadiusA !== undefined) teamA.r = tween.startRadiusA;
      if (tween.startRadiusB !== undefined) teamB.r = tween.startRadiusB;

      const excludeIds = getMovingTeamIds(tweens);
      steerToward(
        teamA,
        tween.approachTargetA,
        nodes,
        excludeIds,
        APPROACH_SPEED,
        width,
        height,
        bottomReserve,
        sizing,
      );
      steerToward(
        teamB,
        tween.approachTargetB,
        nodes,
        excludeIds,
        APPROACH_SPEED,
        width,
        height,
        bottomReserve,
        sizing,
      );

      const dx = teamB.x - teamA.x;
      const dy = teamB.y - teamA.y;
      const apart = Math.hypot(dx, dy);
      const meetDist =
        tween.meetDistance ?? teamA.r + teamB.r + sizing.nodePadding;

      if (apart <= meetDist + 0.5 || elapsed >= tween.duration) {
        tween.phase = "impact";
        tween.startTime = now;
        tween.duration = params.collisionDurationMs;
      }
      remaining.push(tween);
      continue;
    }

    if (tween.phase === "impact") {
      if (teamA && tween.startRadiusA !== undefined) teamA.r = tween.startRadiusA;
      if (teamB && tween.startRadiusB !== undefined) teamB.r = tween.startRadiusB;

      if (elapsed >= tween.duration) {
        const loser = nodes.find((n) => n.id === tween.loserId);
        if (loser) {
          loser.status = "shrinking";
          loser.renderLayer = 10;
        }
        tween.phase = "shrink";
        tween.startTime = now;
        tween.duration = params.shrinkDurationMs;
      }
      remaining.push(tween);
      continue;
    }

    if (tween.phase === "shrink") {
      const loser = nodes.find((n) => n.id === tween.loserId);
      const winner = nodes.find((n) => n.id === tween.winnerId);

      if (loser) {
        const t = easeInOutCubic(clamp(elapsed / tween.duration, 0, 1));
        loser.grayOpacity = lerp(0, params.eliminatedGrayOpacity * 0.6, t);
      }

      if (winner) {
        winner.r = lerp(winner.r, winner.targetR, 0.08);
      }

      if (elapsed >= tween.duration) {
        const winner = nodes.find((n) => n.id === tween.winnerId);

        if (tween.isKnockoutLoser && loser) {
          if (winner && tween.returnHome) {
            winner.x = tween.returnHome.x;
            winner.y = tween.returnHome.y;
            winner.homeX = tween.returnHome.x;
            winner.homeY = tween.returnHome.y;
            winner.status = "active";
            winner.renderLayer = 0;
          }
          loser.status = "eliminated";
          loser.renderLayer = 20;
          tween.phase = "drop";
          tween.startTime = now;
          tween.duration = params.dropDurationMs;
          tween.dropStartY = loser.y;
          tween.teamIds = [tween.loserId!];
        } else {
          if (winner) {
            tween.returnStartWinner = { x: winner.x, y: winner.y };
            winner.renderLayer = 10;
          }
          if (loser) {
            tween.returnStartLoser = { x: loser.x, y: loser.y };
            loser.grayOpacity = 0;
            loser.status = "colliding";
            loser.renderLayer = 10;
          }
          tween.phase = "return";
          tween.startTime = now;
          tween.duration = params.returnDurationMs;
        }
      }
      remaining.push(tween);
      continue;
    }

    if (tween.phase === "return") {
      const winner = nodes.find((n) => n.id === tween.winnerId);
      const loser = nodes.find((n) => n.id === tween.loserId);
      const t = easeInOutCubic(clamp(elapsed / tween.duration, 0, 1));

      if (winner && tween.returnHome && tween.returnStartWinner) {
        winner.renderLayer = 10;
        winner.x = lerp(tween.returnStartWinner.x, tween.returnHome.x, t);
        winner.y = lerp(tween.returnStartWinner.y, tween.returnHome.y, t);
      }

      if (loser && tween.loserHome && tween.returnStartLoser) {
        loser.renderLayer = 10;
        loser.x = lerp(tween.returnStartLoser.x, tween.loserHome.x, t);
        loser.y = lerp(tween.returnStartLoser.y, tween.loserHome.y, t);
      }

      if (elapsed >= tween.duration) {
        if (winner && tween.returnHome) {
          winner.status = "active";
          winner.x = tween.returnHome.x;
          winner.y = tween.returnHome.y;
          winner.homeX = tween.returnHome.x;
          winner.homeY = tween.returnHome.y;
          winner.renderLayer = 0;
        }
        if (loser && tween.loserHome) {
          loser.status = "active";
          loser.x = tween.loserHome.x;
          loser.y = tween.loserHome.y;
          loser.homeX = tween.loserHome.x;
          loser.homeY = tween.loserHome.y;
          loser.renderLayer = 0;
        }
        tween.resolve();
        continue;
      }
      remaining.push(tween);
      continue;
    }

    if (tween.phase === "drop") {
      const team = nodes.find((n) => n.id === tween.teamIds[0]);
      if (team) {
        team.renderLayer = 20;
        const startY = tween.dropStartY ?? team.y;
        const t = easeInOutCubic(clamp(elapsed / tween.duration, 0, 1));
        team.y = lerp(startY, bottomY, t);
        team.grayOpacity = lerp(team.grayOpacity, params.eliminatedGrayOpacity, t);
        team.targetR = sizing.minRadius * 0.55;
        team.r = lerp(team.r, team.targetR, t);

        if (elapsed >= tween.duration) {
          team.status = "dropped";
          team.y = bottomY;
          team.homeY = bottomY;
          team.probability = 0;
          tween.resolve();
          continue;
        }
      } else {
        tween.resolve();
        continue;
      }
      remaining.push(tween);
    }
  }

  return remaining;
}

function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: CanvasTeamState,
  flags: Map<string, HTMLImageElement>,
) {
  const { x, y, r, grayOpacity } = team;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#27272a";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.strokeStyle = team.status === "dropped" ? "#52525b" : "#a1a1aa";
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

    const diameter = innerR * 2;
    if (grayOpacity > 0) {
      ctx.globalAlpha = 1 - grayOpacity * 0.5;
      drawFlagCover(ctx, flag, x, y, diameter);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(113, 113, 122, ${grayOpacity})`;
      ctx.fillRect(x - innerR, y - innerR, diameter, diameter);
    } else {
      drawFlagCover(ctx, flag, x, y, diameter);
    }
    ctx.restore();
  }

  ctx.restore();
}

export const TeamCanvas = forwardRef<TeamCanvasRef, TeamCanvasProps>(
  function TeamCanvas(
    {
      teams,
      probabilities,
      possibleOpponents,
      bracketDepths,
      snapshotDay,
      seedKey,
      params,
      isSimulating,
      eliminated,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const teamsRef = useRef<CanvasTeamState[]>([]);
    const flagsRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const tweensRef = useRef<ActiveTween[]>([]);
    const anchorTweensRef = useRef<AnchorTween[]>([]);
    const bracketDepthsRef = useRef(bracketDepths);
    bracketDepthsRef.current = bracketDepths;
    const rafRef = useRef<number>(0);
    const sizeRef = useRef({ width: 800, height: 600 });
    const sizingRef = useRef(getVizSizing());
    const radiusScaleRef = useRef(
      createRadiusScale(100, sizingRef.current.maxRadius, sizingRef.current),
    );
    const paramsRef = useRef(params);
    const layoutKeyRef = useRef("");
    paramsRef.current = params;

    const initTeams = useCallback(
      (
        probs: Record<string, number>,
        layoutKey: string,
        eliminatedSet?: Set<string>,
      ) => {
        const { width, height } = sizeRef.current;
        const sizing = sizingRef.current;
        const bottomReserve = paramsRef.current.timelineDropOffset + sizing.minRadius;

        const snapshot: Pick<
          Snapshot,
          "day" | "probabilities" | "possibleOpponents" | "bracketDepths"
        > = {
          day: snapshotDay,
          probabilities: probs,
          possibleOpponents,
          bracketDepths: bracketDepthsRef.current,
        };

        const positioned = layoutCanvasTeams(
          teams,
          snapshot,
          width,
          height,
          bottomReserve,
          sizing,
        );

        const maxProb = Math.max(...Object.values(probs), 1);
        const effectiveMax = estimateEffectiveMaxRadius(
          width,
          height,
          teams.length,
          sizing,
        );
        radiusScaleRef.current = createRadiusScale(maxProb, effectiveMax, sizing);
        layoutKeyRef.current = layoutKey;

        teamsRef.current = positioned.map((node) => {
          const team = teams.find((t) => t.id === node.id)!;
          const isEliminated = eliminatedSet?.has(node.id) || (probs[node.id] ?? 0) === 0;
          const r = radiusScaleRef.current(node.probability);

          if (isEliminated) {
            return {
              id: node.id,
              isoCode: team.isoCode,
              name: team.name,
              x: node.x,
              y: height - paramsRef.current.timelineDropOffset,
              homeX: node.x,
              homeY: height - paramsRef.current.timelineDropOffset,
              r: sizing.minRadius * 0.55,
              targetR: sizing.minRadius * 0.55,
              probability: 0,
              status: "dropped" as const,
              grayOpacity: paramsRef.current.eliminatedGrayOpacity,
              floatAngle: seededAngle(node.id),
              renderLayer: 20,
            };
          }

          return {
            id: node.id,
            isoCode: team.isoCode,
            name: team.name,
            x: node.x,
            y: node.y,
            homeX: node.x,
            homeY: node.y,
            r,
            targetR: r,
            probability: node.probability,
            status: "active" as const,
            grayOpacity: 0,
            floatAngle: seededAngle(node.id),
            renderLayer: 0,
          };
        });
      },
      [teams, possibleOpponents, snapshotDay, bracketDepths],
    );

    const startAnchorTransition = useCallback(
      (depths: Record<string, number>, durationMs?: number) => {
        const { width, height } = sizeRef.current;
        const sizing = sizingRef.current;
        const bottomReserve = paramsRef.current.timelineDropOffset + sizing.minRadius;
        const anchors = computeTeamAnchors(
          teams,
          depths,
          width,
          height,
          bottomReserve,
        );
        const now = performance.now();
        const duration = durationMs ?? paramsRef.current.anchorTransitionMs;
        const movingIds = getMovingTeamIds(tweensRef.current);
        const next: AnchorTween[] = [];

        for (const team of teamsRef.current) {
          if (team.status === "dropped" || team.status === "eliminated") continue;
          if (movingIds.has(team.id)) continue;

          const target = anchors[team.id];
          if (!target) continue;

          next.push({
            teamId: team.id,
            startX: team.x,
            startY: team.y,
            endX: target.x,
            endY: target.y,
            startTime: now,
            duration,
          });
        }

        anchorTweensRef.current = next;
      },
      [teams],
    );

    useEffect(() => {
      const uniqueIso = [...new Set(teams.map((t) => t.isoCode))];
      for (const iso of uniqueIso) {
        if (flagsRef.current.has(iso)) continue;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = getFlagUrl(iso);
        img.onload = () => {
          flagsRef.current.set(iso, img);
        };
      }
    }, [teams]);

    useEffect(() => {
      if (layoutKeyRef.current === seedKey) {
        const sizing = sizingRef.current;
        const maxProb = Math.max(...Object.values(probabilities), 1);
        const { width, height } = sizeRef.current;
        const effectiveMax = estimateEffectiveMaxRadius(
          width,
          height,
          teams.length,
          sizing,
        );
        radiusScaleRef.current = createRadiusScale(maxProb, effectiveMax, sizing);
        for (const team of teamsRef.current) {
          if (team.status === "dropped" || team.status === "eliminated") continue;
          const prob = probabilities[team.id] ?? team.probability;
          team.probability = prob;
          team.targetR = radiusScaleRef.current(prob);
        }
        if (!isSimulating) {
          startAnchorTransition(bracketDepths);
        }
        return;
      }
      initTeams(probabilities, seedKey, eliminated);
    }, [
      probabilities,
      seedKey,
      isSimulating,
      eliminated,
      initTeams,
      teams.length,
      bracketDepths,
      startAnchorTransition,
    ]);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = sizeRef.current;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, width, height);

      const sorted = [...teamsRef.current].sort(
        (a, b) => a.renderLayer - b.renderLayer || a.y - b.y,
      );

      for (const team of sorted) {
        drawTeam(ctx, team, flagsRef.current);
      }
    }, []);

    const tick = useCallback(
      (timestamp: number) => {
        const { width, height } = sizeRef.current;
        const p = paramsRef.current;
        const sizing = sizingRef.current;
        const bottomReserve = p.timelineDropOffset + sizing.minRadius;

        tweensRef.current = updateTweens(
          tweensRef.current,
          timestamp,
          teamsRef.current,
          p,
          width,
          height,
          sizing,
        );

        anchorTweensRef.current = updateAnchorTweens(
          anchorTweensRef.current,
          timestamp,
          teamsRef.current,
        );

        const movingIds = getMovingTeamIds(tweensRef.current);
        const anchoringIds = new Set(anchorTweensRef.current.map((t) => t.teamId));

        if (tweensRef.current.length === 0 && anchorTweensRef.current.length === 0) {
          applyFloat(teamsRef.current, timestamp, p, width, height, bottomReserve, sizing);
          applyRepulsion(teamsRef.current, p, width, height, bottomReserve, sizing);
          applySpringToHome(teamsRef.current);
        }

        for (const team of teamsRef.current) {
          if (movingIds.has(team.id) || anchoringIds.has(team.id)) continue;
          if (team.status === "active") {
            team.r = lerp(team.r, team.targetR, 0.12);
          }
        }

        draw();
        rafRef.current = requestAnimationFrame(tick);
      },
      [draw, isSimulating],
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateSize = () => {
        sizingRef.current = getVizSizing();
        sizeRef.current = {
          width: container.clientWidth,
          height: container.clientHeight || Math.max(container.clientWidth * 0.65, 480),
        };
        if (!isSimulating) {
          initTeams(probabilities, seedKey, eliminated);
        }
      };

      updateSize();
      const observer = new ResizeObserver(updateSize);
      observer.observe(container);
      window.addEventListener("resize", updateSize);

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSize);
        cancelAnimationFrame(rafRef.current);
      };
    }, [tick, initTeams, probabilities, seedKey, isSimulating, eliminated]);

    useImperativeHandle(
      ref,
      () => ({
        playCollision(event: CollisionEvent) {
          return new Promise((resolve) => {
            const home = teamsRef.current.find((t) => t.id === event.home);
            const away = teamsRef.current.find((t) => t.id === event.away);
            if (!home || !away || home.status === "dropped" || away.status === "dropped") {
              resolve();
              return;
            }

            home.status = "colliding";
            away.status = "colliding";
            home.renderLayer = 10;
            away.renderLayer = 10;

            const sizing = sizingRef.current;
            const restA = { x: home.homeX, y: home.homeY };
            const restB = { x: away.homeX, y: away.homeY };
            home.x = restA.x;
            home.y = restA.y;
            away.x = restB.x;
            away.y = restB.y;

            const startRadiusA = home.r;
            const startRadiusB = away.r;
            const { targetA, targetB, meetDistance } = computeApproachTargets(
              restA.x,
              restA.y,
              startRadiusA,
              restB.x,
              restB.y,
              startRadiusB,
              sizing.nodePadding,
            );

            tweensRef.current.push({
              teamIds: [home.id, away.id],
              startTime: performance.now(),
              duration: paramsRef.current.approachDurationMs,
              phase: "approach",
              restA,
              restB,
              approachTargetA: targetA,
              approachTargetB: targetB,
              meetDistance,
              startRadiusA,
              startRadiusB,
              returnHome: event.winner === home.id ? restA : restB,
              loserHome: event.loser === home.id ? restA : restB,
              winnerId: event.winner,
              loserId: event.loser,
              isKnockoutLoser: event.isKnockout,
              resolve,
            });
          });
        },

        eliminateTeams(teamIds: string[]) {
          return new Promise((resolve) => {
            const p = paramsRef.current;
            const toDrop = teamIds.filter((id) => {
              const team = teamsRef.current.find((t) => t.id === id);
              return team && team.status !== "dropped";
            });

            if (toDrop.length === 0) {
              resolve();
              return;
            }

            let pending = toDrop.length;

            for (const id of toDrop) {
              const team = teamsRef.current.find((t) => t.id === id);
              if (!team) {
                pending--;
                continue;
              }

              team.status = "eliminated";
              team.renderLayer = 20;
              team.probability = 0;
              const sizing = sizingRef.current;
              team.targetR = sizing.minRadius * 0.55;

              tweensRef.current.push({
                teamIds: [id],
                startTime: performance.now(),
                duration: p.dropDurationMs,
                phase: "drop",
                dropStartY: team.y,
                resolve: () => {
                  pending--;
                  if (pending <= 0) resolve();
                },
              });
            }
          });
        },

        setProbabilities(probs: Record<string, number>) {
          const sizing = sizingRef.current;
          const maxProb = Math.max(...Object.values(probs), 1);
          const { width, height } = sizeRef.current;
          const effectiveMax = estimateEffectiveMaxRadius(
            width,
            height,
            teamsRef.current.length,
            sizing,
          );
          radiusScaleRef.current = createRadiusScale(maxProb, effectiveMax, sizing);

          for (const team of teamsRef.current) {
            if (team.status === "dropped" || team.status === "eliminated") continue;
            const prob = probs[team.id] ?? team.probability;
            team.probability = prob;
            team.targetR = radiusScaleRef.current(prob);
          }
        },

        relayoutAnchors(depths: Record<string, number>) {
          startAnchorTransition(depths);
        },

        resetFromSnapshot(probs, layoutKey, eliminatedSet) {
          tweensRef.current = [];
          initTeams(probs, layoutKey, eliminatedSet);
        },
      }),
      [initTeams, startAnchorTransition],
    );

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
    );
  },
);
