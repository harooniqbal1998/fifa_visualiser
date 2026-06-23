import type { MatchStage, Team } from "@/types";
import { teams } from "@/data/teams";
import {
  timelineDays,
  getPlayedMatchesUpToDay,
  isSimStartDay,
  getSimStartDays,
  getLatestSimStartDay,
} from "@/data/matches";

export { isSimStartDay, getSimStartDays, getLatestSimStartDay };
import { snapshotsByDay } from "@/data/snapshots";
import { computeGroupStandings } from "@/lib/standings";
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

export function getTeams(): Team[] {
  return teams;
}

export function getSnapshotByDay(day: number) {
  return snapshotsByDay[day];
}

export { PRE_TOURNAMENT_DAY };

export function getDayRange(): { min: number; max: number } {
  const max = timelineDays[timelineDays.length - 1]?.day ?? PRE_TOURNAMENT_DAY;
  return { min: PRE_TOURNAMENT_DAY, max };
}

export function getTimelineDays() {
  return timelineDays;
}

export function getGroupStandings(day: number) {
  return computeGroupStandings(getPlayedMatchesUpToDay(day));
}

export function getTimelineStartOptions(): TimelineStartOption[] {
  const seen = new Set<string>();
  const options: TimelineStartOption[] = [
    {
      day: PRE_TOURNAMENT_DAY,
      label: timelineLabelToString({ kind: "pre-tournament" }),
      stage: "group",
    },
  ];
  seen.add("pre-tournament");

  for (const day of getSimStartDays()) {
    const entry = timelineDays.find((e) => e.day === day);
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
