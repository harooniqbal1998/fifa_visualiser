export type BracketNode = {
  matchId: string;
  homeSource?: BracketNode;
  awaySource?: BracketNode;
};

/**
 * Main knockout tree — FIFA matches 90–104 (R16 through final).
 * R32 fixtures are resolved separately via r32-fixtures.ts.
 *
 * R16: 90=W73vW75, 89=W74vW77, 91=W76vW78, 92=W79vW80,
 *      93=W83vW84, 94=W81vW82, 95=W86vW88, 96=W85vW87
 * QF:  97=W89vW90, 98=W93vW94, 99=W91vW92, 100=W95vW96
 * SF:  101=W97vW98, 102=W99vW100
 * Final: 104=W101vW102
 */
export const KNOCKOUT_TREE: BracketNode = {
  matchId: "fin-1",
  homeSource: {
    matchId: "sf-1",
    homeSource: {
      matchId: "qf-1",
      homeSource: {
        matchId: "r16-2",
        homeSource: { matchId: "r32-2" },
        awaySource: { matchId: "r32-5" },
      },
      awaySource: {
        matchId: "r16-1",
        homeSource: { matchId: "r32-1" },
        awaySource: { matchId: "r32-3" },
      },
    },
    awaySource: {
      matchId: "qf-2",
      homeSource: {
        matchId: "r16-5",
        homeSource: { matchId: "r32-11" },
        awaySource: { matchId: "r32-12" },
      },
      awaySource: {
        matchId: "r16-6",
        homeSource: { matchId: "r32-9" },
        awaySource: { matchId: "r32-10" },
      },
    },
  },
  awaySource: {
    matchId: "sf-2",
    homeSource: {
      matchId: "qf-3",
      homeSource: {
        matchId: "r16-3",
        homeSource: { matchId: "r32-4" },
        awaySource: { matchId: "r32-6" },
      },
      awaySource: {
        matchId: "r16-4",
        homeSource: { matchId: "r32-7" },
        awaySource: { matchId: "r32-8" },
      },
    },
    awaySource: {
      matchId: "qf-4",
      homeSource: {
        matchId: "r16-7",
        homeSource: { matchId: "r32-14" },
        awaySource: { matchId: "r32-16" },
      },
      awaySource: {
        matchId: "r16-8",
        homeSource: { matchId: "r32-13" },
        awaySource: { matchId: "r32-15" },
      },
    },
  },
};

/** Third-place playoff — FIFA match 103: loser sf-1 vs loser sf-2 */
export const THIRD_PLACE_NODE: BracketNode = {
  matchId: "tp-1",
  homeSource: { matchId: "sf-1" },
  awaySource: { matchId: "sf-2" },
};

export const KNOCKOUT_MATCH_IDS: string[] = [];

function collectMatchIds(node: BracketNode): void {
  KNOCKOUT_MATCH_IDS.push(node.matchId);
  if (node.homeSource) collectMatchIds(node.homeSource);
  if (node.awaySource) collectMatchIds(node.awaySource);
}

collectMatchIds(KNOCKOUT_TREE);
