import type { Team } from "@/types";
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

export function getTeams(): Team[] {
  return teams;
}

export function getSnapshotByDay(day: number) {
  return snapshotsByDay[day];
}

export function getDayRange(): { min: number; max: number } {
  const min = timelineDays[0]?.day ?? 0;
  const max = timelineDays[timelineDays.length - 1]?.day ?? min;
  return { min, max };
}

export function getTimelineDays() {
  return timelineDays;
}

export function getGroupStandings(day: number) {
  return computeGroupStandings(getPlayedMatchesUpToDay(day));
}
