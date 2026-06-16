/**
 * Official FIFA World Cup 2026 Round of 32 fixtures (matches 73–88).
 * Internal IDs r32-1 … r32-16 map to FIFA match numbers 73 … 88 in order.
 */

export type RankSlot = {
  type: "rank";
  group: string;
  rank: 1 | 2;
};

export type ThirdSlot = {
  type: "third";
  /** Candidate groups whose 3rd-place team may fill this slot (Annex C picks one). */
  pools: string[];
  /** Which group-winner slot this pairs with (for Annex C column lookup). */
  winnerGroup: "A" | "B" | "D" | "E" | "G" | "I" | "K" | "L";
};

export type FixtureSlot = RankSlot | ThirdSlot;

export type R32Fixture = {
  id: string;
  fifaMatch: number;
  home: FixtureSlot;
  away: FixtureSlot;
};

export const R32_FIXTURES: R32Fixture[] = [
  { id: "r32-1", fifaMatch: 73, home: { type: "rank", group: "A", rank: 2 }, away: { type: "rank", group: "B", rank: 2 } },
  { id: "r32-2", fifaMatch: 74, home: { type: "rank", group: "E", rank: 1 }, away: { type: "third", pools: ["A", "B", "C", "D", "F"], winnerGroup: "E" } },
  { id: "r32-3", fifaMatch: 75, home: { type: "rank", group: "F", rank: 1 }, away: { type: "rank", group: "C", rank: 2 } },
  { id: "r32-4", fifaMatch: 76, home: { type: "rank", group: "C", rank: 1 }, away: { type: "rank", group: "F", rank: 2 } },
  { id: "r32-5", fifaMatch: 77, home: { type: "rank", group: "I", rank: 1 }, away: { type: "third", pools: ["C", "D", "F", "G", "H"], winnerGroup: "I" } },
  { id: "r32-6", fifaMatch: 78, home: { type: "rank", group: "E", rank: 2 }, away: { type: "rank", group: "I", rank: 2 } },
  { id: "r32-7", fifaMatch: 79, home: { type: "rank", group: "A", rank: 1 }, away: { type: "third", pools: ["C", "E", "F", "H", "I"], winnerGroup: "A" } },
  { id: "r32-8", fifaMatch: 80, home: { type: "rank", group: "L", rank: 1 }, away: { type: "third", pools: ["E", "H", "I", "J", "K"], winnerGroup: "L" } },
  { id: "r32-9", fifaMatch: 81, home: { type: "rank", group: "D", rank: 1 }, away: { type: "third", pools: ["B", "E", "F", "I", "J"], winnerGroup: "D" } },
  { id: "r32-10", fifaMatch: 82, home: { type: "rank", group: "G", rank: 1 }, away: { type: "third", pools: ["A", "E", "H", "I", "J"], winnerGroup: "G" } },
  { id: "r32-11", fifaMatch: 83, home: { type: "rank", group: "K", rank: 2 }, away: { type: "rank", group: "L", rank: 2 } },
  { id: "r32-12", fifaMatch: 84, home: { type: "rank", group: "H", rank: 1 }, away: { type: "rank", group: "J", rank: 2 } },
  { id: "r32-13", fifaMatch: 85, home: { type: "rank", group: "B", rank: 1 }, away: { type: "third", pools: ["E", "F", "G", "I", "J"], winnerGroup: "B" } },
  { id: "r32-14", fifaMatch: 86, home: { type: "rank", group: "J", rank: 1 }, away: { type: "rank", group: "H", rank: 2 } },
  { id: "r32-15", fifaMatch: 87, home: { type: "rank", group: "K", rank: 1 }, away: { type: "third", pools: ["D", "E", "I", "J", "L"], winnerGroup: "K" } },
  { id: "r32-16", fifaMatch: 88, home: { type: "rank", group: "D", rank: 2 }, away: { type: "rank", group: "G", rank: 2 } },
];

export const R32_FIXTURES_BY_ID: Record<string, R32Fixture> = Object.fromEntries(
  R32_FIXTURES.map((f) => [f.id, f]),
);
