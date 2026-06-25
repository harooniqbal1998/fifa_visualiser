import type { TeamDrawItem } from "@/components/viz/petal/canvas/types";

export function hitTestTeam(
  canvasX: number,
  canvasY: number,
  teams: TeamDrawItem[],
): string | null {
  const sorted = [...teams].sort((a, b) => b.renderLayer - a.renderLayer);

  for (const team of sorted) {
    const dx = canvasX - team.x;
    const dy = canvasY - team.y;
    if (dx * dx + dy * dy <= team.r * team.r) {
      return team.id;
    }
  }

  return null;
}
