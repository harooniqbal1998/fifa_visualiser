import { brandColors, withAlpha } from "@/lib/brand-colors";
import type { PetalLayoutResult } from "@/components/viz/petal/petal-layout";
import { GROUP_IDS } from "@/components/viz/viz-math";

export function drawGuideRings(
  ctx: CanvasRenderingContext2D,
  layout: PetalLayoutResult,
): void {
  const { canvasCenter, groupRingRadius, innerRingRadius, groupCenters } = layout;

  ctx.save();

  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.strokeStyle = withAlpha(brandColors.lightGray, 0.35);
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, groupRingRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = withAlpha(brandColors.lightGray, 0.2);
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, innerRingRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = withAlpha(brandColors.lightGray, 0.35);
  for (const groupId of GROUP_IDS) {
    const center = groupCenters[groupId];
    if (!center) continue;

    ctx.beginPath();
    ctx.moveTo(canvasCenter.x, canvasCenter.y);
    ctx.lineTo(center.x, center.y);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.restore();
}
