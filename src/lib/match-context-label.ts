import type { MatchStage } from "@/types";
import type { CollisionEvent } from "@/lib/simulation/types";

const KNOCKOUT_LABELS: Record<Exclude<MatchStage, "group">, string> = {
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-final",
  "semi-final": "Semi-final",
  final: "Final",
};

export type TimelineLabel =
  | { kind: "pre-tournament" }
  | { kind: "group"; md: 1 | 2 | 3 }
  | { kind: "knockout"; label: string };

export const PRE_TOURNAMENT_DAY = 0;

function groupMatchdayFromDay(day: number): 1 | 2 | 3 {
  if (day <= 4) return 1;
  if (day <= 8) return 2;
  return 3;
}

function groupMatchdayFromId(matchId: string): number | null {
  const match = matchId.match(/md(\d)/i);
  if (!match) return null;
  return Number(match[1]);
}

export function formatTimelineStartLabel(day: number, stage: MatchStage): TimelineLabel {
  if (day === PRE_TOURNAMENT_DAY) {
    return { kind: "pre-tournament" };
  }
  if (stage === "group") {
    return { kind: "group", md: groupMatchdayFromDay(day) };
  }
  return { kind: "knockout", label: KNOCKOUT_LABELS[stage] };
}

export function timelineLabelToString(label: TimelineLabel): string {
  if (label.kind === "pre-tournament") return "Pre-tournament";
  if (label.kind === "group") return `Matchday ${label.md}`;
  return label.label;
}

export function timelineLabelKey(label: TimelineLabel): string {
  if (label.kind === "pre-tournament") return "pre-tournament";
  if (label.kind === "group") return `group-${label.md}`;
  return `knockout-${label.label}`;
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
