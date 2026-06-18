import type { CollisionEvent } from "@/lib/simulation/types";

export type ActiveMatch = CollisionEvent;

export type MatchControllerDeps = {
  getHoldDurationMs: () => number;
  setTimeoutFn?: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeoutFn?: (id: ReturnType<typeof setTimeout>) => void;
};

export type MatchController = {
  getActiveMatches: () => ActiveMatch[];
  hasActiveMatches: () => boolean;
  playMatch: (event: CollisionEvent) => Promise<void>;
  clear: () => void;
};

export function createMatchController(deps: MatchControllerDeps): MatchController {
  const activeMatches: ActiveMatch[] = [];
  const pendingResolvers = new Map<string, () => void>();
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout;
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout;
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function resolveMatch(matchId: string) {
    const idx = activeMatches.findIndex((m) => m.matchId === matchId);
    if (idx >= 0) activeMatches.splice(idx, 1);
    const resolve = pendingResolvers.get(matchId);
    if (resolve) {
      pendingResolvers.delete(matchId);
      resolve();
    }
    const timer = timers.get(matchId);
    if (timer) {
      clearTimeoutFn(timer);
      timers.delete(matchId);
    }
  }

  return {
    getActiveMatches() {
      return [...activeMatches];
    },

    hasActiveMatches() {
      return activeMatches.length > 0;
    },

    playMatch(event: CollisionEvent): Promise<void> {
      return new Promise((resolve) => {
        activeMatches.push(event);
        pendingResolvers.set(event.matchId, resolve);
        const timer = setTimeoutFn(() => resolveMatch(event.matchId), deps.getHoldDurationMs());
        timers.set(event.matchId, timer);
      });
    },

    clear() {
      for (const matchId of [...pendingResolvers.keys()]) {
        resolveMatch(matchId);
      }
      activeMatches.length = 0;
    },
  };
}
