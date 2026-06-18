import type { MutableRefObject } from "react";
import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  computeEliminatedStripPositions,
  computePetalPositions,
  type PetalLayoutResult,
} from "@/components/viz/petal/petal-layout";
import {
  createDisplayState,
  resetDisplayFromLayout,
  setDropTargets,
  setRadiusTargets,
  setTargetsFromLayout,
  tickDisplayState,
  waitUntilSettled,
} from "@/components/viz/petal/canvas/display-state";
import { buildTeamDrawItems, renderFrame } from "@/components/viz/petal/canvas/frame-renderer";
import { createMatchController } from "@/components/viz/petal/canvas/match-controller";
import { createRenderLoop } from "@/components/viz/petal/canvas/render-loop";
import type { PetalCanvasRef } from "@/components/viz/petal/canvas/types";
import { computeFixedRenderLayer, getVizSizing } from "@/components/viz/viz-math";

export type PetalCanvasRuntime = {
  flagsRef: MutableRefObject<Map<string, HTMLImageElement>>;
  sizeRef: MutableRefObject<{ width: number; height: number }>;
  setCanvasElement: (canvas: HTMLCanvasElement | null) => void;
  setTeams: (teams: Team[]) => void;
  setConfig: (config: PetalLayoutConfig) => void;
  setIsSimulating: (v: boolean) => void;
  syncFromProps: (props: {
    teams: Team[];
    probabilities: Record<string, number>;
    standings: Record<string, StandingRow[]>;
    bracketDepths: Record<string, number>;
    config: PetalLayoutConfig;
    isSimulating: boolean;
    eliminated?: Set<string>;
  }) => void;
  updateSize: (width: number, height: number) => void;
  resetLayout: () => void;
  syncLayoutTargets: () => void;
  paint: () => void;
  getRefApi: () => PetalCanvasRef;
  startLoop: () => void;
  stopLoop: () => void;
};

export function createPetalCanvasRuntime(): PetalCanvasRuntime {
  let canvasEl: HTMLCanvasElement | null = null;
  const flagsRef: MutableRefObject<Map<string, HTMLImageElement>> = {
    current: new Map(),
  };
  const sizeRef: MutableRefObject<{ width: number; height: number }> = {
    current: { width: 800, height: 600 },
  };
  const sizingRef = { current: getVizSizing() };
  const layoutRef: MutableRefObject<PetalLayoutResult | null> = { current: null };
  const configRef: MutableRefObject<PetalLayoutConfig> = {
    current: {} as PetalLayoutConfig,
  };
  const teamsRef: MutableRefObject<Team[]> = { current: [] };
  const probabilitiesRef: MutableRefObject<Record<string, number>> = { current: {} };
  const standingsRef: MutableRefObject<Record<string, StandingRow[]>> = { current: {} };
  const bracketDepthsRef: MutableRefObject<Record<string, number>> = { current: {} };
  const isSimulatingRef: MutableRefObject<boolean> = { current: false };
  const eliminatedRef: MutableRefObject<Set<string>> = { current: new Set() };

  const displayStateRef = { current: createDisplayState(800) };
  const matchControllerRef = {
    current: createMatchController({
      getHoldDurationMs: () => configRef.current.matchHoldDurationMs,
    }),
  };

  const recomputeLayout = () => {
    const { width, height } = sizeRef.current;
    layoutRef.current = computePetalPositions(
      teamsRef.current,
      probabilitiesRef.current,
      standingsRef.current,
      bracketDepthsRef.current,
      width,
      height,
      configRef.current,
      sizingRef.current,
      eliminatedRef.current,
    );
    return layoutRef.current;
  };

  const paint = () => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = width * dpr;
    canvasEl.height = height * dpr;
    canvasEl.style.width = `${width}px`;
    canvasEl.style.height = `${height}px`;

    const teamMeta = new Map(
      teamsRef.current.map((t) => [
        t.id,
        {
          isoCode: t.isoCode,
          renderLayer: computeFixedRenderLayer(t.group, t.groupPosition),
          probability: probabilitiesRef.current[t.id] ?? 0,
        },
      ]),
    );

    const drawTeams = buildTeamDrawItems({
      ctx,
      width,
      height,
      dpr,
      config: configRef.current,
      layout: layoutRef.current,
      displayState: displayStateRef.current,
      matchController: matchControllerRef.current,
      flags: flagsRef.current,
      teamMeta,
    });

    renderFrame({
      ctx,
      width,
      height,
      dpr,
      config: configRef.current,
      layout: layoutRef.current,
      displayState: displayStateRef.current,
      matchController: matchControllerRef.current,
      flags: flagsRef.current,
      teams: drawTeams,
    });
  };

  const loop = createRenderLoop({
    onFrame(timestamp) {
      displayStateRef.current.transitionDurationMs =
        configRef.current.rankTransitionDurationMs;
      tickDisplayState(displayStateRef.current, timestamp);
      paint();
    },
  });

  return {
    flagsRef,
    sizeRef,

    setCanvasElement(canvas) {
      canvasEl = canvas;
    },

    setTeams(teams) {
      teamsRef.current = teams;
    },

    setConfig(config) {
      configRef.current = config;
      displayStateRef.current.transitionDurationMs = config.rankTransitionDurationMs;
    },

    setIsSimulating(v) {
      isSimulatingRef.current = v;
    },

    syncFromProps(props) {
      teamsRef.current = props.teams;
      probabilitiesRef.current = props.probabilities;
      standingsRef.current = props.standings;
      bracketDepthsRef.current = props.bracketDepths;
      configRef.current = props.config;
      isSimulatingRef.current = props.isSimulating;
      displayStateRef.current.transitionDurationMs = props.config.rankTransitionDurationMs;
      if (!props.isSimulating && props.eliminated) {
        eliminatedRef.current = new Set(props.eliminated);
      }
    },

    updateSize(width, height) {
      sizingRef.current = getVizSizing();
      sizeRef.current = { width, height };
      const layout = recomputeLayout();
      setTargetsFromLayout(displayStateRef.current, layout);
    },

    resetLayout() {
      const layout = recomputeLayout();
      resetDisplayFromLayout(displayStateRef.current, layout);
      paint();
    },

    syncLayoutTargets() {
      const layout = recomputeLayout();
      setTargetsFromLayout(displayStateRef.current, layout);
      const radii = Object.fromEntries(layout.teams.map((n) => [n.id, n.r]));
      setRadiusTargets(displayStateRef.current, radii);
    },

    paint,

    startLoop() {
      loop.start();
    },

    stopLoop() {
      loop.stop();
    },

    getRefApi(): PetalCanvasRef {
      return {
        playMatch(event) {
          return matchControllerRef.current.playMatch(event);
        },

        animateRankTransition() {
          displayStateRef.current.transitionDurationMs =
            configRef.current.rankTransitionDurationMs;
          return waitUntilSettled(displayStateRef.current);
        },

        async eliminateTeams(teamIds) {
          for (const id of teamIds) {
            eliminatedRef.current.add(id);
          }

          const { width, height } = sizeRef.current;
          const stripPositions = computeEliminatedStripPositions(
            [...eliminatedRef.current],
            width,
            height,
            configRef.current,
            sizingRef.current,
          );

          const savedDuration = displayStateRef.current.transitionDurationMs;
          displayStateRef.current.transitionDurationMs = configRef.current.dropDurationMs;
          setDropTargets(displayStateRef.current, stripPositions);
          await waitUntilSettled(displayStateRef.current);
          displayStateRef.current.transitionDurationMs = savedDuration;
        },

        setProbabilities(probs) {
          probabilitiesRef.current = probs;
          const layout = recomputeLayout();
          const radii = Object.fromEntries(layout.teams.map((n) => [n.id, n.r]));
          setRadiusTargets(displayStateRef.current, radii);
        },

        setLayoutTargets(layout) {
          layoutRef.current = layout;
          setTargetsFromLayout(displayStateRef.current, layout);
        },

        resetDisplay(layout) {
          layoutRef.current = layout;
          resetDisplayFromLayout(displayStateRef.current, layout);
          paint();
        },

        setEliminated(eliminated) {
          eliminatedRef.current = new Set(eliminated);
        },

        clearEliminated() {
          eliminatedRef.current = new Set();
        },

        stop() {
          matchControllerRef.current.clear();
        },
      };
    },
  };
}
