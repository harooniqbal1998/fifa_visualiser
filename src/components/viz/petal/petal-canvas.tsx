"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import { createPetalCanvasRuntime } from "@/components/viz/petal/canvas/canvas-runtime";
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

    useImperativeHandle(ref, () => runtimeRef.current.getRefApi(), []);

    useLayoutEffect(() => {
      runtimeRef.current.setCanvasElement(canvasRef.current);
    }, []);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const onResize = () => {
        runtimeRef.current.updateSize(
          container.clientWidth,
          container.clientHeight || Math.max(container.clientWidth * 0.65, 480),
        );
      };

      onResize();
      const observer = new ResizeObserver(onResize);
      observer.observe(container);
      window.addEventListener("resize", onResize);
      return () => {
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

      if (wasFrozen && !freezeLayout) {
        runtimeRef.current.syncLayoutTargets();
      } else if (!isSimulating && !freezeLayout) {
        runtimeRef.current.syncLayoutTargets();
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
