import type { Team } from "@/types";
import { teams } from "@/data/teams";
import {
  timelineDays,
  getPlayedMatchesUpToDay,
  isSimStartDay,
  getSimStartDays,
} from "@/data/matches";

export { isSimStartDay, getSimStartDays };
import {
  getDropdownTimelineStartOptions,
  getLatestDropdownStartDay,
  getMaxDropdownStage,
  isDropdownStartDay,
} from "@/lib/tournament-progress";

export { isDropdownStartDay, getLatestDropdownStartDay, getMaxDropdownStage };
import { snapshotsByDay } from "@/data/snapshots";
import { computeGroupStandings } from "@/lib/standings";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";
import type { TimelineStartOption } from "@/lib/tournament-progress";

export type { TimelineStartOption };

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
  return getDropdownTimelineStartOptions();
}
