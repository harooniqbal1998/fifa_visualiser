import { drawFlagCover } from "@/lib/flags";
import { brandColors, getCanvasPalette, withAlpha } from "@/lib/brand-colors";
import type { StandingRank } from "@/components/viz/petal/canvas/display-state";
import type { TeamDrawItem } from "@/components/viz/petal/canvas/types";

const RANK_BORDER_COLORS: Record<1 | 2 | 3, string> = {
  1: brandColors.averageGreen,
  2: brandColors.lightGray,
  3: brandColors.hermes,
};

function getStrokeStyle(team: TeamDrawItem): { color: string; width: number } {
  if (team.isWinner) return { color: brandColors.averageGreen, width: 3 };
  if (team.isLoser) return { color: brandColors.torchRed, width: 3 };
  if (team.isParticipant) return { color: brandColors.hermes, width: 2.5 };
  return { color: brandColors.lightGray, width: 1 };
}

function getRankBorderColor(standingRank: StandingRank): string | null {
  if (standingRank === 1 || standingRank === 2 || standingRank === 3) {
    return RANK_BORDER_COLORS[standingRank];
  }
  return null;
}

function drawRankBorder(
  ctx: CanvasRenderingContext2D,
  team: TeamDrawItem,
  baseAlpha: number,
  isEliminated: boolean,
  eliminatedOpacity: number,
  showRankBorders: boolean,
) {
  if (team.isStarred || !showRankBorders || team.rankBorderOpacity <= 0 || isEliminated) {
    return;
  }

  const color = getRankBorderColor(team.standingRank);
  if (!color) return;

  ctx.beginPath();
  ctx.arc(team.x, team.y, team.r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = isEliminated
    ? eliminatedOpacity * team.rankBorderOpacity
    : baseAlpha * team.rankBorderOpacity;
  ctx.stroke();
}

export function drawStarredRing(
  ctx: CanvasRenderingContext2D,
  team: TeamDrawItem,
  rotationRad: number,
) {
  if (!team.isStarred || team.isParticipant) return;

  const { x, y, r } = team;
  const ringRadius = r + 10;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationRad);
  ctx.translate(-x, -y);

  // Dark underlay so dashes read on both light page bg and dark bubbles.
  ctx.beginPath();
  ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(brandColors.darkHeather, 0.55);
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(brandColors.hermes, 0.95);
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

export function drawStarredRings(
  ctx: CanvasRenderingContext2D,
  teams: TeamDrawItem[],
  starRotationRad: number,
) {
  const starred = teams.filter((t) => t.isStarred && !t.isParticipant);
  starred.sort((a, b) => a.renderLayer - b.renderLayer);
  for (const team of starred) {
    drawStarredRing(ctx, team, starRotationRad);
  }
}

export function drawTeam(
  ctx: CanvasRenderingContext2D,
  team: TeamDrawItem,
  flags: Map<string, HTMLImageElement>,
  eliminatedOpacity: number,
  showRankBorders: boolean,
  starRotationRad = 0,
) {
  const { x, y, r, opacity, isWinner, isParticipant } = team;
  const isEliminated = team.isEliminated && !isParticipant;

  ctx.save();

  let baseAlpha = isEliminated ? eliminatedOpacity : opacity;
  if (isWinner) baseAlpha = 1;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = getCanvasPalette().placeholderFill;
  ctx.globalAlpha = isEliminated ? eliminatedOpacity : baseAlpha * 0.95;
  ctx.fill();

  const showDefaultStroke = !team.isStarred || isParticipant || isWinner || team.isLoser;
  if (showDefaultStroke) {
    const stroke = getStrokeStyle(team);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.globalAlpha = isEliminated ? eliminatedOpacity : baseAlpha;
    ctx.stroke();
  }

  drawRankBorder(ctx, team, baseAlpha, isEliminated, eliminatedOpacity, showRankBorders);

  if (isParticipant) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = isWinner
      ? withAlpha(brandColors.averageGreen, 0.55)
      : team.isLoser
        ? withAlpha(brandColors.torchRed, 0.45)
        : withAlpha(brandColors.hermes, 0.4);
    ctx.lineWidth = 2;
    ctx.globalAlpha = baseAlpha;
    ctx.stroke();
  }

  const flag = flags.get(team.isoCode);
  const innerR = Math.max(r - 2, 4);

  if (flag && flag.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = isEliminated ? eliminatedOpacity : baseAlpha;
    drawFlagCover(ctx, flag, x, y, innerR * 2);
    ctx.restore();
  }

  ctx.restore();
}

export function drawTeams(
  ctx: CanvasRenderingContext2D,
  teams: TeamDrawItem[],
  flags: Map<string, HTMLImageElement>,
  eliminatedOpacity: number,
  showRankBorders: boolean,
  starRotationRad = 0,
) {
  const sorted = [...teams].sort((a, b) => a.renderLayer - b.renderLayer);
  for (const team of sorted) {
    drawTeam(ctx, team, flags, eliminatedOpacity, showRankBorders, starRotationRad);
  }
}
