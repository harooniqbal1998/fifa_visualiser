export type { Team } from "./team";
export type { Match, MatchStage } from "./match";
export type { Snapshot } from "./snapshot";

import type { Team } from "./team";
import type { Match } from "./match";
import type { Snapshot } from "./snapshot";

export type TournamentData = {
  teams: Team[];
  matches: Match[];
  snapshots: Snapshot[];
};
