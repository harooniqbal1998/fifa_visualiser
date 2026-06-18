import type { RenderLoopCallbacks } from "@/components/viz/petal/canvas/types";

export type RenderLoop = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export function createRenderLoop(callbacks: RenderLoopCallbacks): RenderLoop {
  let rafId: number | null = null;

  const frame = (timestamp: number) => {
    callbacks.onFrame(timestamp);
    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning() {
      return rafId !== null;
    },
  };
}
