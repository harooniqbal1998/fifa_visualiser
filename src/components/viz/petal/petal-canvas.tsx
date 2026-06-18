"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runtimeRef = useRef(createPetalCanvasRuntime());

    useImperativeHandle(ref, () => runtimeRef.current.getRefApi(), []);

    useEffect(() => {
      runtimeRef.current.setCanvasElement(canvasRef.current);
    }, []);

    useEffect(() => {
      runtimeRef.current.syncFromProps({
        teams,
        probabilities,
        standings,
        bracketDepths,
        config,
        isSimulating,
        eliminated,
      });
      runtimeRef.current.resetLayout();
    }, [teams]);

    useEffect(() => {
      runtimeRef.current.syncFromProps({
        teams,
        probabilities,
        standings,
        bracketDepths,
        config,
        isSimulating,
        eliminated,
      });
      if (!isSimulating) {
        runtimeRef.current.syncLayoutTargets();
      }
    }, [standings, bracketDepths, config, probabilities, isSimulating, teams, eliminated]);

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

    useEffect(() => {
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

    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
    );
  },
);
