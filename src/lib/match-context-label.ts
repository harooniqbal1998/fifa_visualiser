import type { MatchStage } from "@/types";
import type { CollisionEvent } from "@/lib/simulation/types";

const KNOCKOUT_LABELS: Record<Exclude<MatchStage, "group">, string> = {
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-final",
  "semi-final": "Semi-final",
  final: "Final",
};

function groupMatchdayFromDay(day: number): number {
  if (day <= 4) return 1;
  if (day <= 8) return 2;
  return 3;
}

function groupMatchdayFromId(matchId: string): number | null {
  const match = matchId.match(/md(\d)/i);
  if (!match) return null;
  return Number(match[1]);
}

export function formatMatchContextLabel(
  event: Pick<CollisionEvent, "stage" | "day" | "matchId">,
): string {
  if (event.stage === "group") {
    const md = groupMatchdayFromId(event.matchId) ?? groupMatchdayFromDay(event.day);
    return `Group stage · MD${md}`;
  }
  return KNOCKOUT_LABELS[event.stage];
}
