import type { PetalLayoutResult } from "@/components/viz/petal/petal-layout";

export type TeamDisplayEntry = {
  x: number;
  y: number;
  r: number;
  targetX: number;
  targetY: number;
  targetR: number;
};

export type DisplayState = {
  teams: Map<string, TeamDisplayEntry>;
  transitionDurationMs: number;
  lastTimestamp: number | null;
};

export function createDisplayState(transitionDurationMs: number): DisplayState {
  return {
    teams: new Map(),
    transitionDurationMs,
    lastTimestamp: null,
  };
}

export function resetDisplayFromLayout(
  state: DisplayState,
  layout: PetalLayoutResult,
): void {
  state.teams.clear();
  for (const node of layout.teams) {
    state.teams.set(node.id, {
      x: node.x,
      y: node.y,
      r: node.r,
      targetX: node.x,
      targetY: node.y,
      targetR: node.r,
    });
  }
  state.lastTimestamp = null;
}

export function setTargetsFromLayout(
  state: DisplayState,
  layout: PetalLayoutResult,
): void {
  for (const node of layout.teams) {
    const entry = state.teams.get(node.id);
    if (entry) {
      entry.targetX = node.x;
      entry.targetY = node.y;
      entry.targetR = node.r;
    } else {
      state.teams.set(node.id, {
        x: node.x,
        y: node.y,
        r: node.r,
        targetX: node.x,
        targetY: node.y,
        targetR: node.r,
      });
    }
  }
}

export function setDropTargets(
  state: DisplayState,
  positions: Map<string, { x: number; y: number }>,
): void {
  for (const [id, pos] of positions) {
    const entry = state.teams.get(id);
    if (entry) {
      entry.targetX = pos.x;
      entry.targetY = pos.y;
    } else {
      state.teams.set(id, {
        x: pos.x,
        y: pos.y,
        r: 0,
        targetX: pos.x,
        targetY: pos.y,
        targetR: 0,
      });
    }
  }
}

export function setRadiusTargets(
  state: DisplayState,
  radii: Record<string, number>,
): void {
  for (const [id, r] of Object.entries(radii)) {
    const entry = state.teams.get(id);
    if (entry) {
      entry.targetR = r;
    }
  }
}

function easeToward(current: number, target: number, t: number): number {
  if (Math.abs(target - current) < 0.01) return target;
  return current + (target - current) * Math.min(t, 1);
}

export function tickDisplayState(state: DisplayState, timestamp: number): void {
  if (state.lastTimestamp === null) {
    state.lastTimestamp = timestamp;
    return;
  }

  const dt = timestamp - state.lastTimestamp;
  state.lastTimestamp = timestamp;
  const t = state.transitionDurationMs > 0 ? dt / state.transitionDurationMs : 1;

  for (const entry of state.teams.values()) {
    entry.x = easeToward(entry.x, entry.targetX, t);
    entry.y = easeToward(entry.y, entry.targetY, t);
    entry.r = easeToward(entry.r, entry.targetR, t);
  }
}

export function isDisplaySettled(state: DisplayState, epsilon = 0.5): boolean {
  for (const entry of state.teams.values()) {
    if (
      Math.abs(entry.x - entry.targetX) > epsilon ||
      Math.abs(entry.y - entry.targetY) > epsilon ||
      Math.abs(entry.r - entry.targetR) > epsilon
    ) {
      return false;
    }
  }
  return true;
}

export function waitUntilSettled(
  state: DisplayState,
  getTimestamp: () => number = () => performance.now(),
): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      tickDisplayState(state, getTimestamp());
      if (isDisplaySettled(state)) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}
