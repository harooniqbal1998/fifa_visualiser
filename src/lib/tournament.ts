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
  hasSimulationWorkFromDay,
  isDropdownStartDay,
} from "@/lib/tournament-progress";

export { isDropdownStartDay, getLatestDropdownStartDay, getMaxDropdownStage, hasSimulationWorkFromDay };
import { snapshotsByDay } from "@/data/snapshots";
import { computeGroupStandings } from "@/lib/standings";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";
import type { TimelineStartOption } from "@/lib/tournament-progress";
import type { Snapshot } from "@/types";

export type { TimelineStartOption };

export function getTeams(): Team[] {
  return teams;
}

export function getSnapshotByDay(day: number) {
  return snapshotsByDay[day];
}

/**
 * Idle snapshot for a round-start day: probs/eliminations from before that day,
 * but `day` kept as the selected start day so Play bootstraps correctly.
 */
export function getIdleSnapshotForStartDay(startDay: number): Snapshot {
  const dataDay = startDay > PRE_TOURNAMENT_DAY ? startDay - 1 : PRE_TOURNAMENT_DAY;
  const base =
    getSnapshotByDay(dataDay) ??
    getSnapshotByDay(PRE_TOURNAMENT_DAY) ??
    ({
      day: PRE_TOURNAMENT_DAY,
      probabilities: {},
      possibleOpponents: {},
    } satisfies Snapshot);
  return { ...base, day: startDay };
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
