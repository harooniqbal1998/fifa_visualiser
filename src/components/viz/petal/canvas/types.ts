import type { CollisionEvent } from "@/lib/simulation/types";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import type { PetalLayoutResult } from "@/components/viz/petal/petal-layout";
import type { MatchController } from "@/components/viz/petal/canvas/match-controller";
import type { DisplayState } from "@/components/viz/petal/canvas/display-state";

export type PetalCanvasRef = {
  playMatch: (event: CollisionEvent) => Promise<void>;
  animateRankTransition: () => Promise<void>;
  setProbabilities: (probabilities: Record<string, number>) => void;
  setLayoutTargets: (layout: PetalLayoutResult) => void;
  resetDisplay: (layout: PetalLayoutResult) => void;
  stop: () => void;
};

export type TeamDrawItem = {
  id: string;
  isoCode: string;
  x: number;
  y: number;
  r: number;
  renderLayer: number;
  probability: number;
  opacity: number;
  isParticipant: boolean;
  isWinner: boolean;
  isLoser: boolean;
};

export type DrawFrameContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  config: PetalLayoutConfig;
  layout: PetalLayoutResult | null;
  displayState: DisplayState;
  matchController: MatchController;
  flags: Map<string, HTMLImageElement>;
  teams: TeamDrawItem[];
};

export type RenderLoopCallbacks = {
  onFrame: (timestamp: number) => void;
};
