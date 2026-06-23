import type { PetalLayoutResult } from "@/components/viz/petal/petal-layout";

export type StandingRank = 1 | 2 | 3 | 4;

export type TeamDisplayEntry = {
  x: number;
  y: number;
  r: number;
  targetX: number;
  targetY: number;
  targetR: number;
  startX: number;
  startY: number;
  startR: number;
  standingRank: StandingRank;
  targetStandingRank: StandingRank;
  rankBorderOpacity: number;
  rankBorderOpacityStart: number;
  rankBorderOpacityTarget: number;
};

export type DisplayState = {
  teams: Map<string, TeamDisplayEntry>;
  droppedTeamIds: Set<string>;
  transitionDurationMs: number;
  transitionStartedAt: number | null;
  lastTimestamp: number | null;
  rankBorderFadeStartedAt: number | null;
  rankBorderFadeDurationMs: number;
  rankBorderFadeTeamIds: Set<string> | null;
};

export function createDisplayState(transitionDurationMs: number): DisplayState {
  return {
    teams: new Map(),
    droppedTeamIds: new Set(),
    transitionDurationMs,
    transitionStartedAt: null,
    lastTimestamp: null,
    rankBorderFadeStartedAt: null,
    rankBorderFadeDurationMs: 0,
    rankBorderFadeTeamIds: null,
  };
}

function createEntry(
  x: number,
  y: number,
  r: number,
  standingRank: StandingRank = 4,
): TeamDisplayEntry {
  return {
    x,
    y,
    r,
    targetX: x,
    targetY: y,
    targetR: r,
    startX: x,
    startY: y,
    startR: r,
    standingRank,
    targetStandingRank: standingRank,
    rankBorderOpacity: 1,
    rankBorderOpacityStart: 1,
    rankBorderOpacityTarget: 1,
  };
}

function lerp(start: number, target: number, progress: number): number {
  return start + (target - start) * progress;
}

function markTransitionStart(state: DisplayState, entry: TeamDisplayEntry): void {
  entry.startX = entry.x;
  entry.startY = entry.y;
  entry.startR = entry.r;
}

function beginPositionTransition(state: DisplayState): void {
  state.transitionStartedAt = null;
}

function hasPositionTargetsChanged(
  entry: TeamDisplayEntry,
  x: number,
  y: number,
  r: number,
): boolean {
  return entry.targetX !== x || entry.targetY !== y || entry.targetR !== r;
}

export function resetDisplayFromLayout(
  state: DisplayState,
  layout: PetalLayoutResult,
): void {
  state.teams.clear();
  state.droppedTeamIds.clear();
  for (const node of layout.teams) {
    state.teams.set(
      node.id,
      createEntry(node.x, node.y, node.r, node.standingRank),
    );
  }
  state.transitionStartedAt = null;
  state.lastTimestamp = null;
  state.rankBorderFadeStartedAt = null;
  state.rankBorderFadeDurationMs = 0;
  state.rankBorderFadeTeamIds = null;
}

export function markTeamsDropped(
  state: DisplayState,
  teamIds: Iterable<string>,
): void {
  for (const id of teamIds) {
    const entry = state.teams.get(id);
    if (!entry) continue;
    state.droppedTeamIds.add(id);
    entry.x = entry.targetX;
    entry.y = entry.targetY;
    entry.r = entry.targetR;
    entry.startX = entry.x;
    entry.startY = entry.y;
    entry.startR = entry.r;
  }
}

export function clearDroppedTeams(state: DisplayState): void {
  state.droppedTeamIds.clear();
}

export type SetTargetsOptions = {
  deferTransition?: boolean;
  syncStandingRanks?: boolean;
  borderTeamIds?: Iterable<string>;
  /** When set, only these teams receive new layout targets (avoids global radius rescale jitter). */
  positionOnlyTeamIds?: Iterable<string>;
};

function shouldSyncStandingRankNow(
  teamId: string,
  options: SetTargetsOptions,
): boolean {
  if (options.syncStandingRanks) return true;
  if (!options.deferTransition || !options.borderTeamIds) return false;
  const borderIds = new Set(options.borderTeamIds);
  return !borderIds.has(teamId);
}

export function setTargetsFromLayout(
  state: DisplayState,
  layout: PetalLayoutResult,
  options: SetTargetsOptions = {},
): void {
  const { deferTransition = false, syncStandingRanks = false } = options;
  const positionOnlyIds = options.positionOnlyTeamIds
    ? new Set(options.positionOnlyTeamIds)
    : null;
  let shouldBeginTransition = false;

  for (const node of layout.teams) {
    if (positionOnlyIds && !positionOnlyIds.has(node.id)) {
      continue;
    }

    const entry = state.teams.get(node.id);
    if (entry) {
      if (state.droppedTeamIds.has(node.id)) {
        entry.targetR = node.r;
        entry.r = node.r;
        entry.targetStandingRank = node.standingRank;
        if (shouldSyncStandingRankNow(node.id, options)) {
          entry.standingRank = node.standingRank;
          entry.rankBorderOpacity = 1;
          entry.rankBorderOpacityStart = 1;
          entry.rankBorderOpacityTarget = 1;
        }
        continue;
      }

      if (deferTransition && positionOnlyIds?.has(node.id)) {
        entry.targetX = node.x;
        entry.targetY = node.y;
        entry.targetStandingRank = node.standingRank;
        if (shouldSyncStandingRankNow(node.id, options)) {
          entry.standingRank = node.standingRank;
          entry.rankBorderOpacity = 1;
          entry.rankBorderOpacityStart = 1;
          entry.rankBorderOpacityTarget = 1;
        }
        continue;
      }

      const targetsChanged = hasPositionTargetsChanged(entry, node.x, node.y, node.r);
      const xyChanged = entry.targetX !== node.x || entry.targetY !== node.y;
      entry.targetX = node.x;
      entry.targetY = node.y;
      entry.targetR = node.r;
      entry.targetStandingRank = node.standingRank;
      if (shouldSyncStandingRankNow(node.id, options)) {
        entry.standingRank = node.standingRank;
        entry.rankBorderOpacity = 1;
        entry.rankBorderOpacityStart = 1;
        entry.rankBorderOpacityTarget = 1;
      }
      if (deferTransition && !xyChanged && entry.r !== node.r) {
        entry.r = node.r;
        entry.startR = node.r;
      } else if (deferTransition && xyChanged && entry.r !== node.r) {
        // Snap radius during rank shuffle — only animate x/y to avoid jitter.
        entry.r = node.r;
        entry.startR = node.r;
      }
      if (targetsChanged && !deferTransition) {
        markTransitionStart(state, entry);
        shouldBeginTransition = true;
      }
    } else {
      state.teams.set(
        node.id,
        createEntry(node.x, node.y, node.r, node.standingRank),
      );
    }
  }

  if (shouldBeginTransition) {
    beginPositionTransition(state);
  }
}

export function startPositionTransitions(
  state: DisplayState,
  teamIds?: Iterable<string>,
): void {
  const ids = teamIds ? new Set(teamIds) : null;
  let shouldBeginTransition = false;

  for (const [id, entry] of state.teams.entries()) {
    if (state.droppedTeamIds.has(id)) continue;
    if (ids && !ids.has(id)) continue;

    const xyUnsettled =
      Math.abs(entry.x - entry.targetX) > 0.5 ||
      Math.abs(entry.y - entry.targetY) > 0.5;

    if (xyUnsettled) {
      markTransitionStart(state, entry);
      entry.startR = entry.r;
      entry.targetR = entry.r;
      shouldBeginTransition = true;
    }
  }

  if (shouldBeginTransition) {
    beginPositionTransition(state);
  }
}

export function applyTargetStandingRanks(
  state: DisplayState,
  teamIds?: Iterable<string>,
): void {
  const ids = teamIds ? new Set(teamIds) : null;
  for (const [id, entry] of state.teams.entries()) {
    if (ids && !ids.has(id)) continue;
    entry.standingRank = entry.targetStandingRank;
  }
}

export function setDropTargetsYOnly(
  state: DisplayState,
  teamIds: string[],
  bottomY: number,
  width: number,
  sizing: { padding: number },
): void {
  let shouldBeginTransition = false;

  for (const id of teamIds) {
    const entry = state.teams.get(id);
    if (!entry) continue;
    const xMin = sizing.padding + entry.r;
    const xMax = width - sizing.padding - entry.r;
    const clampedX = Math.max(xMin, Math.min(xMax, entry.x));
    entry.x = clampedX;
    entry.targetX = clampedX;
    if (entry.targetY !== bottomY) {
      entry.targetY = bottomY;
      markTransitionStart(state, entry);
      shouldBeginTransition = true;
    }
  }

  if (shouldBeginTransition) {
    beginPositionTransition(state);
  }
}

export function setRadiusTargets(
  state: DisplayState,
  radii: Record<string, number>,
): void {
  let shouldBeginTransition = false;

  for (const [id, r] of Object.entries(radii)) {
    const entry = state.teams.get(id);
    if (entry && entry.targetR !== r) {
      entry.targetR = r;
      markTransitionStart(state, entry);
      shouldBeginTransition = true;
    }
  }

  if (shouldBeginTransition) {
    beginPositionTransition(state);
  }
}

function tickRankBorderFade(state: DisplayState, timestamp: number): void {
  if (state.rankBorderFadeStartedAt === null || state.rankBorderFadeDurationMs <= 0) {
    return;
  }

  const elapsed = timestamp - state.rankBorderFadeStartedAt;
  const progress = Math.min(1, elapsed / state.rankBorderFadeDurationMs);

  for (const id of state.rankBorderFadeTeamIds ?? []) {
    const entry = state.teams.get(id);
    if (!entry) continue;
    entry.rankBorderOpacity = lerp(
      entry.rankBorderOpacityStart,
      entry.rankBorderOpacityTarget,
      progress,
    );
  }

  if (progress >= 1) {
    state.rankBorderFadeStartedAt = null;
    state.rankBorderFadeDurationMs = 0;
    state.rankBorderFadeTeamIds = null;
  }
}

export function getPositionTransitionProgress(
  state: DisplayState,
  timestamp: number,
  epsilon = 0.5,
): number {
  let hasActiveTransitions = false;

  for (const [id, entry] of state.teams.entries()) {
    if (state.droppedTeamIds.has(id)) continue;

    if (
      Math.abs(entry.x - entry.targetX) > epsilon ||
      Math.abs(entry.y - entry.targetY) > epsilon ||
      Math.abs(entry.r - entry.targetR) > epsilon
    ) {
      hasActiveTransitions = true;
      break;
    }
  }

  if (!hasActiveTransitions) return 1;
  if (state.transitionStartedAt === null) return 0;

  const elapsed = timestamp - state.transitionStartedAt;
  return state.transitionDurationMs > 0
    ? Math.min(1, elapsed / state.transitionDurationMs)
    : 1;
}

export function tickDisplayState(state: DisplayState, timestamp: number): void {
  state.lastTimestamp = timestamp;
  tickRankBorderFade(state, timestamp);

  const epsilon = 0.5;
  let hasActiveTransitions = false;

  for (const [id, entry] of state.teams.entries()) {
    if (state.droppedTeamIds.has(id)) continue;

    const unsettled =
      Math.abs(entry.x - entry.targetX) > epsilon ||
      Math.abs(entry.y - entry.targetY) > epsilon ||
      Math.abs(entry.r - entry.targetR) > epsilon;

    if (!unsettled) continue;
    hasActiveTransitions = true;
  }

  if (!hasActiveTransitions) {
    state.transitionStartedAt = null;
    return;
  }

  if (state.transitionStartedAt === null) {
    state.transitionStartedAt = timestamp;
  }

  const elapsed = timestamp - state.transitionStartedAt;
  const progress =
    state.transitionDurationMs > 0
      ? Math.min(1, elapsed / state.transitionDurationMs)
      : 1;

  for (const [id, entry] of state.teams.entries()) {
    if (state.droppedTeamIds.has(id)) continue;

    const unsettled =
      Math.abs(entry.x - entry.targetX) > epsilon ||
      Math.abs(entry.y - entry.targetY) > epsilon ||
      Math.abs(entry.r - entry.targetR) > epsilon;

    if (!unsettled) continue;

    entry.x = lerp(entry.startX, entry.targetX, progress);
    entry.y = lerp(entry.startY, entry.targetY, progress);
    entry.r = lerp(entry.startR, entry.targetR, progress);
  }

  if (progress >= 1) {
    state.transitionStartedAt = null;
  }
}

function hasUnsettledTargets(
  state: DisplayState,
  epsilon = 0.5,
  teamIds?: Set<string> | null,
): boolean {
  for (const [id, entry] of state.teams.entries()) {
    if (state.droppedTeamIds.has(id)) continue;
    if (teamIds && !teamIds.has(id)) continue;

    if (
      Math.abs(entry.x - entry.targetX) > epsilon ||
      Math.abs(entry.y - entry.targetY) > epsilon ||
      Math.abs(entry.r - entry.targetR) > epsilon
    ) {
      return true;
    }
  }
  return false;
}

function isRankBorderFadeComplete(state: DisplayState): boolean {
  return state.rankBorderFadeStartedAt === null;
}

export function isDisplaySettled(
  state: DisplayState,
  epsilon = 0.5,
  teamIds?: Set<string> | null,
): boolean {
  return !hasUnsettledTargets(state, epsilon, teamIds) && isRankBorderFadeComplete(state);
}

export function animateRankBorderOpacity(
  state: DisplayState,
  target: number,
  durationMs: number,
  teamIds: Iterable<string>,
  getTimestamp: () => number = () => performance.now(),
): Promise<void> {
  const ids = [...teamIds];
  if (ids.length === 0) {
    return Promise.resolve();
  }

  state.rankBorderFadeTeamIds = new Set(ids);
  for (const id of ids) {
    const entry = state.teams.get(id);
    if (!entry) continue;
    entry.rankBorderOpacityStart = entry.rankBorderOpacity;
    entry.rankBorderOpacityTarget = target;
  }
  state.rankBorderFadeStartedAt = getTimestamp();
  state.rankBorderFadeDurationMs = durationMs;

  return new Promise((resolve) => {
    const check = () => {
      if (isRankBorderFadeComplete(state)) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

export function waitUntilSettled(
  state: DisplayState,
  getTimestamp: () => number = () => performance.now(),
  teamIds?: Iterable<string>,
): Promise<void> {
  const ids = teamIds ? new Set(teamIds) : null;

  return new Promise((resolve) => {
    const check = () => {
      if (isDisplaySettled(state, 0.5, ids)) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}
