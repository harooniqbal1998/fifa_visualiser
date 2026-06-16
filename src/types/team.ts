export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export type Team = {
  id: string;
  name: string;
  group: string;
  isoCode: string;
  fifaRanking: number;
  groupPosition: 1 | 2 | 3 | 4;
  pot: 1 | 2 | 3 | 4;
  confederation: Confederation;
  isHost?: boolean;
};
