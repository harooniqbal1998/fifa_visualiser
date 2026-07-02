import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getKnockoutChain } from "@/data/tournament-paths";
import {
  getRelevantMatchIds,
  subtreeHasRelevant,
} from "@/lib/starred-teams/team-bracket-path";
import type {
  BracketMatchView,
  TournamentStructureView,
} from "@/lib/tournament-structure";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";

function makeMatch(
  matchId: string,
  overrides: Partial<BracketMatchView> = {},
): BracketMatchView {
  return {
    matchId,
    stage: "round-of-32",
    home: { label: "Home" },
    away: { label: "Away" },
    ...overrides,
  };
}

function makeStructure(bracketMatches: BracketMatchView[]): TournamentStructureView {
  return {
    standings: {},
    bracketMatches,
    advancingThirdGroups: [],
    eliminatedTeamIds: new Set(),
  };
}

describe("getRelevantMatchIds", () => {
  it("returns null for empty starred list", () => {
    assert.equal(getRelevantMatchIds([], makeStructure([])), null);
  });

  it("includes candidate match and ancestors on one bracket half", () => {
    const structure = makeStructure([
      makeMatch("r32-2", {
        stage: "round-of-32",
        homeCandidates: [{ teamId: "ger", probability: 0.6 }],
      }),
      makeMatch("r16-2", { stage: "round-of-16" }),
      makeMatch("qf-1", { stage: "quarter-final" }),
      makeMatch("sf-1", { stage: "semi-final" }),
      makeMatch("fin-1", { stage: "final" }),
    ]);

    const ids = getRelevantMatchIds(["ger"], structure);
    assert.ok(ids);
    assert.ok(ids!.has("r32-2"));
    assert.ok(ids!.has("r16-2"));
    assert.ok(ids!.has("qf-1"));
    assert.ok(ids!.has("sf-1"));
    assert.ok(ids!.has("fin-1"));
    assert.equal(ids!.has("r32-8"), false);
  });

  it("includes confirmed slot ancestors and descendants until elimination", () => {
    const chain = getKnockoutChain("r32-2")!;
    const structure = makeStructure([
      makeMatch(chain.r32, {
        stage: "round-of-32",
        home: { teamId: "ger", label: "Germany" },
        away: { teamId: "opp", label: "Opponent" },
        winnerId: "ger",
      }),
      makeMatch(chain.r16, {
        stage: "round-of-16",
        home: { teamId: "ger", label: "Germany" },
        away: { teamId: "opp2", label: "Opponent" },
        winnerId: "ger",
      }),
      makeMatch(chain.qf, {
        stage: "quarter-final",
        home: { teamId: "ger", label: "Germany" },
        away: { teamId: "opp3", label: "Opponent" },
        winnerId: "opp3",
      }),
      makeMatch(chain.sf, { stage: "semi-final" }),
      makeMatch(chain.final, { stage: "final" }),
    ]);

    const ids = getRelevantMatchIds(["ger"], structure);
    assert.ok(ids);
    assert.ok(ids!.has(chain.r32));
    assert.ok(ids!.has(chain.r16));
    assert.ok(ids!.has(chain.qf));
    assert.equal(ids!.has(chain.sf), false);
    assert.equal(ids!.has(chain.final), false);
  });

  it("unions truncated paths for multiple starred teams on same half", () => {
    const gerChain = getKnockoutChain("r32-2")!;
    const fraChain = getKnockoutChain("r32-11")!;
    const structure = makeStructure([
      makeMatch(gerChain.r32, {
        stage: "round-of-32",
        home: { teamId: "ger", label: "Germany" },
        away: { teamId: "x", label: "X" },
        winnerId: "x",
      }),
      makeMatch(fraChain.r32, {
        stage: "round-of-32",
        home: { teamId: "fra", label: "France" },
        away: { teamId: "y", label: "Y" },
      }),
      makeMatch(gerChain.r16, { stage: "round-of-16" }),
      makeMatch(fraChain.r16, { stage: "round-of-16" }),
      makeMatch(gerChain.qf, { stage: "quarter-final" }),
      makeMatch(fraChain.qf, { stage: "quarter-final" }),
      makeMatch(gerChain.sf, { stage: "semi-final" }),
      makeMatch(fraChain.sf, { stage: "semi-final" }),
      makeMatch("fin-1", { stage: "final" }),
    ]);

    const ids = getRelevantMatchIds(["ger", "fra"], structure);
    assert.ok(ids);
    assert.ok(ids!.has(gerChain.r32));
    assert.ok(ids!.has(fraChain.r32));
    assert.equal(ids!.has(gerChain.r16), false);
    assert.ok(ids!.has(fraChain.r16));
  });

  it("returns null when starred teams span both bracket halves", () => {
    const leftChain = getKnockoutChain("r32-2")!;
    const rightChain = getKnockoutChain("r32-8")!;
    const structure = makeStructure([
      makeMatch(leftChain.r32, {
        stage: "round-of-32",
        home: { teamId: "ger", label: "Germany" },
        away: { teamId: "x", label: "X" },
      }),
      makeMatch(rightChain.r32, {
        stage: "round-of-32",
        home: { teamId: "eng", label: "England" },
        away: { teamId: "y", label: "Y" },
      }),
      makeMatch(leftChain.r16, { stage: "round-of-16" }),
      makeMatch(rightChain.r16, { stage: "round-of-16" }),
      makeMatch(leftChain.qf, { stage: "quarter-final" }),
      makeMatch(rightChain.qf, { stage: "quarter-final" }),
      makeMatch(leftChain.sf, { stage: "semi-final" }),
      makeMatch(rightChain.sf, { stage: "semi-final" }),
      makeMatch("fin-1", { stage: "final" }),
    ]);

    assert.equal(getRelevantMatchIds(["ger", "eng"], structure), null);
  });

  it("returns null when no starred team matches any bracket slot", () => {
    const structure = makeStructure([
      makeMatch("r32-2", {
        home: { teamId: "x", label: "X" },
        away: { teamId: "y", label: "Y" },
      }),
    ]);

    assert.equal(getRelevantMatchIds(["ger"], structure), null);
  });
});

describe("subtreeHasRelevant", () => {
  it("detects relevance in descendant nodes", () => {
    const ids = new Set(["r32-2"]);
    assert.equal(subtreeHasRelevant(KNOCKOUT_TREE, ids), true);
    assert.equal(subtreeHasRelevant(KNOCKOUT_TREE.homeSource!, ids), true);
    assert.equal(subtreeHasRelevant(KNOCKOUT_TREE.awaySource!, ids), false);
  });
});
