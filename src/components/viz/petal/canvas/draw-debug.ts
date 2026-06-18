import type { PetalLayoutConfig } from "@/components/viz/petal/petal-config";
import {
  computePetalLaneAnchor,
  type PetalLayoutResult,
} from "@/components/viz/petal/petal-layout";
import { GROUP_IDS } from "@/components/viz/viz-math";

export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  layout: PetalLayoutResult,
  config: PetalLayoutConfig,
) {
  const {
    canvasCenter,
    groupRingRadius,
    groupCenters,
    groupAngles,
    leftHub,
    rightHub,
    spreadRad,
    spreadTan,
  } = layout;

  ctx.save();

  ctx.strokeStyle = "rgba(161, 161, 170, 0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, groupRingRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(59, 130, 246, 0.25)";
  ctx.beginPath();
  ctx.moveTo(canvasCenter.x, 0);
  ctx.lineTo(canvasCenter.x, ctx.canvas.height);
  ctx.stroke();

  for (const hub of [leftHub, rightHub]) {
    ctx.fillStyle = "rgba(234, 179, 8, 0.7)";
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(234, 179, 8, 0.9)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("L", leftHub.x, leftHub.y - 10);
  ctx.fillText("R", rightHub.x, rightHub.y - 10);

  ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
  ctx.beginPath();
  ctx.arc(canvasCenter.x, canvasCenter.y, 4, 0, Math.PI * 2);
  ctx.fill();

  for (const groupId of GROUP_IDS) {
    const center = groupCenters[groupId];
    const angle = groupAngles[groupId];
    if (!center || angle === undefined) continue;

    ctx.strokeStyle = "rgba(113, 113, 122, 0.25)";
    ctx.beginPath();
    ctx.moveTo(canvasCenter.x, canvasCenter.y);
    ctx.lineTo(center.x, center.y);
    ctx.stroke();

    ctx.fillStyle = "rgba(161, 161, 170, 0.8)";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(113, 113, 122, 0.9)";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(groupId, center.x, center.y - 10);

    if (config.showDebug) {
      for (let rank = 1; rank <= 4; rank++) {
        const anchor = computePetalLaneAnchor(
          center,
          angle,
          rank as 1 | 2 | 3 | 4,
          spreadRad,
          spreadTan,
        );
        ctx.strokeStyle = "rgba(161, 161, 170, 0.5)";
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(anchor.x, anchor.y);
        ctx.stroke();

        ctx.fillStyle = "rgba(161, 161, 170, 0.6)";
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
