export type Snapshot = {
  day: number;
  probabilities: {
    [teamId: string]: number;
  };
  possibleOpponents: {
    [teamId: string]: string[];
  };
};
