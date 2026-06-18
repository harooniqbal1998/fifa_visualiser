import {
  computeTeamOpacity,
  drawConnectors,
  getHighlightedTeamIds,
  isLoser,
  isParticipant,
  isWinner,
} from "@/components/viz/petal/canvas/draw-matches";
import { drawTeams } from "@/components/viz/petal/canvas/draw-teams";
import type { DrawFrameContext } from "@/components/viz/petal/canvas/types";

export function renderFrame(frame: DrawFrameContext) {
  const { ctx, width, height, dpr, config, displayState, matchController, flags, teams } =
    frame;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const activeMatches = matchController.getActiveMatches();
  const backgroundTeams = teams.filter((t) => !t.isParticipant);
  const participantTeams = teams.filter((t) => t.isParticipant);

  drawTeams(ctx, backgroundTeams, flags, config.eliminatedOpacity);
  drawConnectors(ctx, activeMatches, displayState, config);
  drawTeams(ctx, participantTeams, flags, config.eliminatedOpacity);
}

export function buildTeamDrawItems(
  frame: Omit<DrawFrameContext, "teams"> & {
    teamMeta: Map<string, { isoCode: string; renderLayer: number; probability: number }>;
  },
) {
  const activeMatches = frame.matchController.getActiveMatches();
  const highlighted = getHighlightedTeamIds(activeMatches);
  const hasActive = frame.matchController.hasActiveMatches();

  const teams = [...frame.teamMeta.entries()].map(([id, meta]) => {
    const pos = frame.displayState.teams.get(id);
    return {
      id,
      isoCode: meta.isoCode,
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      r: pos?.r ?? 0,
      renderLayer: meta.renderLayer,
      probability: meta.probability,
      opacity: computeTeamOpacity(id, highlighted, hasActive, frame.config.spotlightDimOpacity),
      isParticipant: isParticipant(id, highlighted),
      isWinner: isWinner(id, activeMatches),
      isLoser: isLoser(id, activeMatches),
    };
  });

  return teams;
}
