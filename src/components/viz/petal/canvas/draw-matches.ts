import { getCanvasPalette } from "@/lib/brand-colors";
import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import type { DisplayState } from "@/components/viz/petal/canvas/display-state";
import type { ActiveMatch } from "@/components/viz/petal/canvas/match-controller";

export function getHighlightedTeamIds(activeMatches: ActiveMatch[]): Set<string> {
  const ids = new Set<string>();
  for (const match of activeMatches) {
    ids.add(match.home);
    ids.add(match.away);
  }
  return ids;
}

export function computeTeamOpacity(
  teamId: string,
  highlighted: Set<string>,
  hasActiveMatches: boolean,
  spotlightDimOpacity: number,
): number {
  if (!hasActiveMatches) return 1;
  return highlighted.has(teamId) ? 1 : spotlightDimOpacity;
}

export function isParticipant(teamId: string, highlighted: Set<string>): boolean {
  return highlighted.has(teamId);
}

export function isWinner(teamId: string, activeMatches: ActiveMatch[]): boolean {
  return activeMatches.some((m) => m.winner === teamId);
}

export function isLoser(teamId: string, activeMatches: ActiveMatch[]): boolean {
  return activeMatches.some((m) => m.loser === teamId);
}

export function drawConnectors(
  ctx: CanvasRenderingContext2D,
  activeMatches: ActiveMatch[],
  displayState: DisplayState,
  config: PetalLayoutConfig,
) {
  if (activeMatches.length === 0) return;

  ctx.save();
  ctx.lineWidth = config.connectorWidth;
  ctx.lineCap = "round";

  const palette = getCanvasPalette();

  for (const match of activeMatches) {
    const home = displayState.teams.get(match.home);
    const away = displayState.teams.get(match.away);
    if (!home || !away) continue;

    ctx.strokeStyle = palette.connector;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(home.x, home.y);
    ctx.lineTo(away.x, away.y);
    ctx.stroke();
  }

  ctx.restore();
}
