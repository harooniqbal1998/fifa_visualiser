import type { Match, MatchStage } from "@/types";
import { matches as productionMatches, timelineDays as productionTimelineDays } from "@/data/matches";
import {
  formatTimelineStartLabel,
  PRE_TOURNAMENT_DAY,
  timelineLabelKey,
  timelineLabelToString,
} from "@/lib/match-context-label";

export type TimelineStartOption = {
  day: number;
  label: string;
  stage: MatchStage;
};

export const STAGE_ORDER: MatchStage[] = [
  "group",
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "final",
];

export const KNOCKOUT_STAGES = STAGE_ORDER.slice(1) as Exclude<MatchStage, "group">[];

const stageRankMap = STAGE_ORDER.reduce<Record<MatchStage, number>>(
  (acc, stage, index) => {
    acc[stage] = index;
    return acc;
  },
  {} as Record<MatchStage, number>,
);

export function stageRank(stage: MatchStage): number {
  return stageRankMap[stage];
}

export function hasActualResult(match: Match): boolean {
  return match.homeScore !== undefined && match.awayScore !== undefined;
}

export function isGroupStageComplete(matchList: Match[]): boolean {
  const groupMatches = matchList.filter((match) => match.stage === "group");
  return groupMatches.length > 0 && groupMatches.every(hasActualResult);
}

export function isKnockoutStageComplete(
  stage: Exclude<MatchStage, "group">,
  matchList: Match[],
): boolean {
  const stageMatches = matchList.filter(
    (match) => match.stage === stage && match.home !== "" && match.away !== "",
  );
  if (stageMatches.length === 0) return false;
  return stageMatches.every(hasActualResult);
}

export function getMaxDropdownStage(matchList: Match[] = productionMatches): MatchStage {
  if (!isGroupStageComplete(matchList)) {
    return "group";
  }

  let maxStage: MatchStage = "round-of-32";
  for (let index = 0; index < KNOCKOUT_STAGES.length; index++) {
    const stage = KNOCKOUT_STAGES[index];
    if (isKnockoutStageComplete(stage, matchList)) {
      maxStage =
        index < KNOCKOUT_STAGES.length - 1 ? KNOCKOUT_STAGES[index + 1] : "final";
    }
  }
  return maxStage;
}

export type TimelineDayEntry = {
  day: number;
  stage: MatchStage;
};

export function buildTimelineDays(matchList: Match[]): TimelineDayEntry[] {
  const byDay = matchList.reduce<Record<number, Match[]>>((acc, match) => {
    if (!acc[match.day]) acc[match.day] = [];
    acc[match.day].push(match);
    return acc;
  }, {});

  return Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b)
    .map((day) => {
      const stages = [...new Set(byDay[day].map((match) => match.stage))];
      stages.sort((a, b) => stageRank(a) - stageRank(b));
      return { day, stage: stages[0] };
    });
}

function stageForDay(day: number, matchList: Match[]): MatchStage {
  if (day === PRE_TOURNAMENT_DAY) return "group";
  return buildTimelineDays(matchList).find((entry) => entry.day === day)?.stage ?? "group";
}

export function isSimStartDayForMatches(day: number, matchList: Match[]): boolean {
  if (day === PRE_TOURNAMENT_DAY) return true;
  return matchList
    .filter((match) => match.day < day && match.home !== "" && match.away !== "")
    .every(hasActualResult);
}

export function isDropdownStartDay(
  day: number,
  matchList: Match[] = productionMatches,
): boolean {
  if (day === PRE_TOURNAMENT_DAY) return true;
  if (!isSimStartDayForMatches(day, matchList)) return false;

  const maxStage = getMaxDropdownStage(matchList);
  const dayStage = stageForDay(day, matchList);
  return stageRank(dayStage) <= stageRank(maxStage);
}

export function getDropdownStartDays(matchList: Match[] = productionMatches): number[] {
  const timeline = buildTimelineDays(matchList);
  return timeline.map((entry) => entry.day).filter((day) => isDropdownStartDay(day, matchList));
}

export function getLatestDropdownStartDay(matchList: Match[] = productionMatches): number {
  const options = getDropdownTimelineStartOptions(matchList);
  return options[options.length - 1]?.day ?? PRE_TOURNAMENT_DAY;
}

export function getDropdownTimelineStartOptions(
  matchList: Match[] = productionMatches,
): TimelineStartOption[] {
  const timeline = buildTimelineDays(matchList);
  const seen = new Set<string>();
  const options: TimelineStartOption[] = [
    {
      day: PRE_TOURNAMENT_DAY,
      label: timelineLabelToString({ kind: "pre-tournament" }),
      stage: "group",
    },
  ];
  seen.add("pre-tournament");

  for (const day of getDropdownStartDays(matchList)) {
    const entry = timeline.find((e) => e.day === day);
    if (!entry) continue;

    const labelInfo = formatTimelineStartLabel(day, entry.stage);
    const bandKey = timelineLabelKey(labelInfo);
    if (seen.has(bandKey)) continue;
    seen.add(bandKey);

    options.push({
      day,
      label: timelineLabelToString(labelInfo),
      stage: entry.stage,
    });
  }

  return options;
}

export function getProductionTimelineDays(): TimelineDayEntry[] {
  return productionTimelineDays;
}
