"use client";

import { useState } from "react";
import {
  getDayRange,
  getSnapshotByDay,
  getTeams,
} from "@/lib/tournament";
import { Timeline } from "@/components/timeline";
import { Visualization } from "@/components/visualization";

export function TournamentView() {
  const { min, max } = getDayRange();
  const teams = getTeams();
  const [day, setDay] = useState(min);
  const snapshot = getSnapshotByDay(day) ?? getSnapshotByDay(min)!;

  return (
    <>
      <Visualization snapshot={snapshot} teams={teams} />
      <Timeline day={day} onDayChange={setDay} />
    </>
  );
}
