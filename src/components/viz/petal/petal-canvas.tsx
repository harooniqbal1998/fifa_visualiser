"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import { createPetalCanvasRuntime } from "@/components/viz/petal/canvas/canvas-runtime";
import { standingsEqual } from "@/components/viz/petal/canvas/standings-equal";
import type { PetalCanvasRef } from "@/components/viz/petal/canvas/types";
import { getFlagUrl } from "@/lib/flags";

export type { PetalCanvasRef };

type PetalCanvasProps = {
  teams: Team[];
  probabilities: Record<string, number>;
  standings: Record<string, StandingRow[]>;
  bracketDepths: Record<string, number>;
  eliminated?: Set<string>;
  config: PetalLayoutConfig;
  isSimulating?: boolean;
  freezeLayout?: boolean;
  showGuideRings?: boolean;
  showRankBorders?: boolean;
  starredTeamIds?: string[];
  onTeamClick?: (teamId: string) => void;
};

export const PetalCanvas = forwardRef<PetalCanvasRef, PetalCanvasProps>(
  function PetalCanvas(props, ref) {
    const {
      teams,
      probabilities,
      standings,
      bracketDepths,
      eliminated,
      config,
      isSimulating = false,
      freezeLayout = false,
      showGuideRings = true,
      showRankBorders = true,
      starredTeamIds = [],
      onTeamClick,
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runtimeRef = useRef(createPetalCanvasRuntime());
    const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
    const prevStandingsRef = useRef(standings);
    const prevBracketDepthsRef = useRef(bracketDepths);
    const prevProbabilitiesRef = useRef(probabilities);
    const prevConfigRef = useRef(config);
    const prevEliminatedRef = useRef(eliminated);
    const prevShowGuideRingsRef = useRef(showGuideRings);
    const prevShowRankBordersRef = useRef(showRankBorders);
    const prevTeamsRef = useRef(teams);
    const prevStarredTeamIdsRef = useRef(starredTeamIds);
    const starredTeamIdsKeyRef = useRef(starredTeamIds.join("\0"));

    const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }, []);

    const handleCanvasClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onTeamClick) return;
        const coords = getCanvasCoords(event.clientX, event.clientY);
        if (!coords) return;
        const teamId = runtimeRef.current.hitTest(coords.x, coords.y);
        if (teamId) onTeamClick(teamId);
      },
      [getCanvasCoords, onTeamClick],
    );

    const handleCanvasMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCanvasCoords(event.clientX, event.clientY);
        if (!coords) return;
        const teamId = runtimeRef.current.hitTest(coords.x, coords.y);
        setHoveredTeamId(teamId);
      },
      [getCanvasCoords],
    );

    useImperativeHandle(ref, () => runtimeRef.current.getRefApi(), []);

    useLayoutEffect(() => {
      runtimeRef.current.setCanvasElement(canvasRef.current);
    }, []);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let rafId: number | null = null;

      const measureSize = () => ({
        width: container.clientWidth,
        height:
          container.clientHeight || Math.max(container.clientWidth * 0.65, 480),
      });

      const applyResize = () => {
        const { width, height } = measureSize();
        runtimeRef.current.updateSize(width, height);
      };

      const onResize = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          rafId = null;
          applyResize();
        });
      };

      applyResize();
      const observer = new ResizeObserver(onResize);
      observer.observe(container);
      window.addEventListener("resize", onResize);
      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        observer.disconnect();
        window.removeEventListener("resize", onResize);
      };
    }, []);

    useLayoutEffect(() => {
      runtimeRef.current.syncFromProps({
        teams,
        probabilities,
        standings,
        bracketDepths,
        config,
        isSimulating,
        freezeLayout,
        eliminated,
        showGuideRings,
        showRankBorders,
        starredTeamIds,
      });
      runtimeRef.current.resetLayout();
    }, [teams]);

    useLayoutEffect(() => {
      const standingsChanged = !standingsEqual(prevStandingsRef.current, standings);
      const bracketDepthsChanged = prevBracketDepthsRef.current !== bracketDepths;
      const probabilitiesChanged = prevProbabilitiesRef.current !== probabilities;
      const configChanged = prevConfigRef.current !== config;
      const eliminatedChanged = prevEliminatedRef.current !== eliminated;
      const showGuideRingsChanged = prevShowGuideRingsRef.current !== showGuideRings;
      const showRankBordersChanged = prevShowRankBordersRef.current !== showRankBorders;
      const teamsChanged = prevTeamsRef.current !== teams;
      const starredKey = starredTeamIds.join("\0");
      const starredChanged = starredTeamIdsKeyRef.current !== starredKey;

      prevStandingsRef.current = standings;
      prevBracketDepthsRef.current = bracketDepths;
      prevProbabilitiesRef.current = probabilities;
      prevConfigRef.current = config;
      prevEliminatedRef.current = eliminated;
      prevShowGuideRingsRef.current = showGuideRings;
      prevShowRankBordersRef.current = showRankBorders;
      prevTeamsRef.current = teams;
      prevStarredTeamIdsRef.current = starredTeamIds;
      starredTeamIdsKeyRef.current = starredKey;

      runtimeRef.current.syncFromProps({
        teams,
        probabilities,
        standings,
        bracketDepths,
        config,
        isSimulating,
        freezeLayout,
        eliminated,
        showGuideRings,
        showRankBorders,
        starredTeamIds,
      });

      const layoutInputsChanged =
        standingsChanged ||
        bracketDepthsChanged ||
        probabilitiesChanged ||
        configChanged ||
        eliminatedChanged ||
        showGuideRingsChanged ||
        showRankBordersChanged ||
        teamsChanged;

      if (starredChanged) {
        runtimeRef.current.setStarredTeamIds(starredTeamIds);
      }

      if (!isSimulating && !freezeLayout && layoutInputsChanged) {
        runtimeRef.current.resetLayout();
      }
    }, [standings, bracketDepths, config, probabilities, isSimulating, teams, eliminated, freezeLayout, showGuideRings, showRankBorders, starredTeamIds]);

    useEffect(() => {
      const flags = runtimeRef.current.flagsRef.current;
      for (const iso of [...new Set(teams.map((t) => t.isoCode))]) {
        if (flags.has(iso)) continue;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = getFlagUrl(iso);
        img.onload = () => {
          flags.set(iso, img);
          runtimeRef.current.paint();
        };
      }
    }, [teams]);

    useEffect(() => {
      runtimeRef.current.startLoop();
      return () => runtimeRef.current.stopLoop();
    }, []);

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        <canvas
          ref={canvasRef}
          className={`h-full w-full ${onTeamClick ? "pointer-events-auto" : ""} ${hoveredTeamId ? "cursor-pointer" : ""}`}
          aria-label="Tournament team visualization"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredTeamId(null)}
        />
      </div>
    );
  },
);
