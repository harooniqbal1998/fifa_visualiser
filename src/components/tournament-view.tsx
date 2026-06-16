"use client";

import { useState } from "react";
import {
  getDayRange,
  getMatchesForDay,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { Timeline } from "@/components/timeline";
import { Visualization } from "@/components/visualization";
import { GroupsPanel } from "@/components/groups-panel";
import { NextOpponents } from "@/components/next-opponents";
import { DayMatches } from "@/components/day-matches";

export function TournamentView() {
  const { min } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;
  const dayMatches = getMatchesForDay(day);

  return (
    <>
      <Visualization snapshot={snapshot} teams={teams} />
      <DayMatches matches={dayMatches} day={day} />
      <NextOpponents snapshot={snapshot} teams={teams} day={day} />
      <GroupsPanel teams={teams} snapshot={snapshot} day={day} />
      <Timeline day={day} onDayChange={setDay} />
    </>
  );
}
