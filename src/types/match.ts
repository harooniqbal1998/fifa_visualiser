export type MatchStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type Match = {
  id: string;
  stage: MatchStage;
  day: number;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  winner?: string;
};
