"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
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
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runtimeRef = useRef(createPetalCanvasRuntime());
    const prevFreezeLayoutRef = useRef(freezeLayout);
    const prevStandingsRef = useRef(standings);
    const prevBracketDepthsRef = useRef(bracketDepths);
    const prevProbabilitiesRef = useRef(probabilities);
    const prevConfigRef = useRef(config);
    const prevEliminatedRef = useRef(eliminated);
    const prevShowGuideRingsRef = useRef(showGuideRings);
    const prevShowRankBordersRef = useRef(showRankBorders);
    const prevTeamsRef = useRef(teams);

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
      });
      runtimeRef.current.resetLayout();
    }, [teams]);

    useLayoutEffect(() => {
      const wasFrozen = prevFreezeLayoutRef.current;
      const standingsChanged = !standingsEqual(prevStandingsRef.current, standings);
      const bracketDepthsChanged = prevBracketDepthsRef.current !== bracketDepths;
      const probabilitiesChanged = prevProbabilitiesRef.current !== probabilities;
      const configChanged = prevConfigRef.current !== config;
      const eliminatedChanged = prevEliminatedRef.current !== eliminated;
      const showGuideRingsChanged = prevShowGuideRingsRef.current !== showGuideRings;
      const showRankBordersChanged = prevShowRankBordersRef.current !== showRankBorders;
      const teamsChanged = prevTeamsRef.current !== teams;

      prevStandingsRef.current = standings;
      prevBracketDepthsRef.current = bracketDepths;
      prevProbabilitiesRef.current = probabilities;
      prevConfigRef.current = config;
      prevEliminatedRef.current = eliminated;
      prevShowGuideRingsRef.current = showGuideRings;
      prevShowRankBordersRef.current = showRankBorders;
      prevTeamsRef.current = teams;

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

      if (wasFrozen && !freezeLayout) {
        runtimeRef.current.syncLayoutTargets();
      } else if (!isSimulating && !freezeLayout && layoutInputsChanged) {
        runtimeRef.current.resetLayout();
      }

      prevFreezeLayoutRef.current = freezeLayout;
    }, [standings, bracketDepths, config, probabilities, isSimulating, teams, eliminated, freezeLayout, showGuideRings, showRankBorders]);

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
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
    );
  },
);
