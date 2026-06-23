import type { MutableRefObject } from "react";
import type { Team } from "@/types";
import type { StandingRow } from "@/lib/standings";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  computeEliminatedBottomY,
  computePetalPositions,
  interpolateLayout,
  type PetalLayoutResult,
} from "@/components/viz/petal/petal-layout";
import {
  animateRankBorderOpacity,
  applyTargetStandingRanks,
  clearDroppedTeams,
  createDisplayState,
  getPositionTransitionProgress,
  markTeamsDropped,
  resetDisplayFromLayout,
  setDropTargetsYOnly,
  setRadiusTargets,
  setTargetsFromLayout,
  startPositionTransitions,
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
    freezeLayout: boolean;
    eliminated?: Set<string>;
    showGuideRings?: boolean;
    showRankBorders?: boolean;
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
  const layoutStartRef: MutableRefObject<PetalLayoutResult | null> = { current: null };
  const configRef: MutableRefObject<PetalLayoutConfig> = {
    current: {} as PetalLayoutConfig,
  };
  const teamsRef: MutableRefObject<Team[]> = { current: [] };
  const probabilitiesRef: MutableRefObject<Record<string, number>> = { current: {} };
  const standingsRef: MutableRefObject<Record<string, StandingRow[]>> = { current: {} };
  const bracketDepthsRef: MutableRefObject<Record<string, number>> = { current: {} };
  const isSimulatingRef: MutableRefObject<boolean> = { current: false };
  const freezeLayoutRef: MutableRefObject<boolean> = { current: false };
  const eliminatedRef: MutableRefObject<Set<string>> = { current: new Set() };
  const showGuideRingsRef: MutableRefObject<boolean> = { current: true };
  const showRankBordersRef: MutableRefObject<boolean> = { current: true };

  const displayStateRef = { current: createDisplayState(200) };
  const matchControllerRef = {
    current: createMatchController({
      getHoldDurationMs: () => configRef.current.matchHoldDurationMs,
    }),
  };

  const recomputeLayout = () => {
    const { width, height } = sizeRef.current;
    return computePetalPositions(
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
  };

  const commitLayoutTransition = (newLayout: PetalLayoutResult) => {
    const state = displayStateRef.current;
    const currentTarget = layoutRef.current;
    const currentStart = layoutStartRef.current;
    const timestamp = state.lastTimestamp ?? performance.now();

    let startLayout: PetalLayoutResult;
    if (currentTarget && currentStart) {
      const progress = getPositionTransitionProgress(state, timestamp);
      startLayout =
        progress < 1
          ? interpolateLayout(currentStart, currentTarget, progress)
          : currentTarget;
    } else if (currentTarget) {
      startLayout = currentTarget;
    } else {
      startLayout = newLayout;
    }

    layoutStartRef.current = startLayout;
    layoutRef.current = newLayout;
    return newLayout;
  };

  const getVisualLayout = (): PetalLayoutResult | null => {
    const target = layoutRef.current;
    const start = layoutStartRef.current;
    if (!target) return null;
    if (!start) return target;

    const timestamp = displayStateRef.current.lastTimestamp ?? performance.now();
    const progress = getPositionTransitionProgress(displayStateRef.current, timestamp);
    if (progress >= 1) return target;

    return interpolateLayout(start, target, progress);
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
      eliminated: eliminatedRef.current,
    });

    renderFrame({
      ctx,
      width,
      height,
      dpr,
      config: configRef.current,
      layout: getVisualLayout() ?? layoutRef.current,
      displayState: displayStateRef.current,
      matchController: matchControllerRef.current,
      flags: flagsRef.current,
      teams: drawTeams,
      eliminated: eliminatedRef.current,
      showGuideRings: showGuideRingsRef.current,
      showRankBorders: showRankBordersRef.current,
    });
  };

  const loop = createRenderLoop({
    onFrame(timestamp) {
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
      freezeLayoutRef.current = props.freezeLayout;
      displayStateRef.current.transitionDurationMs = props.config.rankTransitionDurationMs;
      if (!props.isSimulating && props.eliminated) {
        eliminatedRef.current = new Set(props.eliminated);
      }
      if (props.showGuideRings !== undefined) {
        showGuideRingsRef.current = props.showGuideRings;
      }
      if (props.showRankBorders !== undefined) {
        showRankBordersRef.current = props.showRankBorders;
      }
    },

    updateSize(width, height) {
      sizingRef.current = getVizSizing();
      sizeRef.current = { width, height };
      if (!freezeLayoutRef.current) {
        const layout = commitLayoutTransition(recomputeLayout());
        setTargetsFromLayout(displayStateRef.current, layout, { syncStandingRanks: true });
      }
      paint();
    },

    resetLayout() {
      const layout = commitLayoutTransition(recomputeLayout());
      layoutStartRef.current = layout;
      resetDisplayFromLayout(displayStateRef.current, layout);
      paint();
    },

    syncLayoutTargets() {
      const layout = commitLayoutTransition(recomputeLayout());
      setTargetsFromLayout(displayStateRef.current, layout, { syncStandingRanks: true });
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

        async animateRankTransition(
          borderTeamIds: string[] = [],
          positionTeamIds?: string[],
        ) {
          const config = configRef.current;
          displayStateRef.current.transitionDurationMs = config.rankTransitionDurationMs;

          if (borderTeamIds.length > 0 && showRankBordersRef.current) {
            await animateRankBorderOpacity(
              displayStateRef.current,
              0,
              config.rankBorderFadeMs,
              borderTeamIds,
            );
          }

          startPositionTransitions(displayStateRef.current, positionTeamIds);
          await waitUntilSettled(displayStateRef.current, undefined, positionTeamIds);

          applyTargetStandingRanks(displayStateRef.current, borderTeamIds);
          if (borderTeamIds.length > 0 && showRankBordersRef.current) {
            await animateRankBorderOpacity(
              displayStateRef.current,
              1,
              config.rankBorderFadeMs,
              borderTeamIds,
            );
          }
        },

        async eliminateTeams(teamIds) {
          for (const id of teamIds) {
            eliminatedRef.current.add(id);
          }

          const { width, height } = sizeRef.current;
          const bottomY = computeEliminatedBottomY(
            height,
            configRef.current,
            sizingRef.current,
          );

          const savedDuration = displayStateRef.current.transitionDurationMs;
          displayStateRef.current.transitionDurationMs = configRef.current.dropDurationMs;
          setDropTargetsYOnly(
            displayStateRef.current,
            teamIds,
            bottomY,
            width,
            sizingRef.current,
          );
          await waitUntilSettled(displayStateRef.current);
          displayStateRef.current.transitionDurationMs = savedDuration;
          markTeamsDropped(displayStateRef.current, teamIds);
        },

        setProbabilities(probs) {
          probabilitiesRef.current = probs;
        },

        markTeamsDropped(teamIds) {
          markTeamsDropped(displayStateRef.current, teamIds);
        },

        setLayoutTargets(layout, borderTeamIds?: string[], positionOnlyTeamIds?: string[]) {
          commitLayoutTransition(layout);
          setTargetsFromLayout(displayStateRef.current, layout, {
            deferTransition: true,
            borderTeamIds,
            positionOnlyTeamIds,
          });
        },

        syncRadiusTargetsFromLayout(layout) {
          commitLayoutTransition(layout);
          const radii = Object.fromEntries(layout.teams.map((n) => [n.id, n.r]));
          setRadiusTargets(displayStateRef.current, radii);
        },

        resetDisplay(layout) {
          layoutStartRef.current = layout;
          layoutRef.current = layout;
          resetDisplayFromLayout(displayStateRef.current, layout);
          paint();
        },

        setEliminated(eliminated) {
          eliminatedRef.current = new Set(eliminated);
        },

        clearEliminated() {
          eliminatedRef.current = new Set();
          clearDroppedTeams(displayStateRef.current);
        },

        stop() {
          matchControllerRef.current.clear();
        },
      };
    },
  };
}
