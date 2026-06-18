export type Snapshot = {
  day: number;
  probabilities: {
    [teamId: string]: number;
  };
  possibleOpponents: {
    [teamId: string]: string[];
  };
  bracketDepths?: {
    [teamId: string]: number;
  };
  eliminatedTeamIds?: string[];
};
