import type { RenderLoopCallbacks } from "@/components/viz/petal/canvas/types";

export type RenderLoop = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export function createRenderLoop(callbacks: RenderLoopCallbacks): RenderLoop {
  let rafId: number | null = null;
  let running = false;

  const frame = (timestamp: number) => {
    if (!running) return;
    callbacks.onFrame(timestamp);
    if (running) {
      rafId = requestAnimationFrame(frame);
    }
  };

  return {
    start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning() {
      return running;
    },
  };
}
