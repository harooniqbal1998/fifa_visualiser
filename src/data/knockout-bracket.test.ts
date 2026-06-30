import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { R32_FIXTURES } from "@/data/r32-fixtures";
import { getKnockoutChain } from "@/data/tournament-paths";
import { resolveKnockoutMatchesForDay } from "@/lib/simulation/bracket-resolver";
import type { SimMatchResult } from "@/lib/simulation/types";

function getChildSources(node: BracketNode): [string | undefined, string | undefined] {
  return [node.homeSource?.matchId, node.awaySource?.matchId];
}

function collectTreeNodes(node: BracketNode, acc: BracketNode[] = []): BracketNode[] {
  acc.push(node);
  if (node.homeSource) collectTreeNodes(node.homeSource, acc);
  if (node.awaySource) collectTreeNodes(node.awaySource, acc);
  return acc;
}

const NODE_BY_ID = new Map(
  collectTreeNodes(KNOCKOUT_TREE).map((node) => [node.matchId, node]),
);

/** FIFA official R16–Final pairings (match numbers). */
const FIFA_PAIRINGS: Record<string, [number, number]> = {
  "r16-1": [73, 75],
  "r16-2": [74, 77],
  "r16-3": [76, 78],
  "r16-4": [79, 80],
  "r16-5": [83, 84],
  "r16-6": [81, 82],
  "r16-7": [86, 88],
  "r16-8": [85, 87],
  "qf-1": [89, 90],
  "qf-2": [93, 94],
  "qf-3": [91, 92],
  "qf-4": [95, 96],
  "sf-1": [97, 98],
  "sf-2": [99, 100],
  "fin-1": [101, 102],
};

function r32IdFromFifa(fifaMatch: number): string {
  const fixture = R32_FIXTURES.find((f) => f.fifaMatch === fifaMatch);
  assert.ok(fixture, `missing r32 fixture for FIFA M${fifaMatch}`);
  return fixture.id;
}

function knockoutIdFromFifa(fifaMatch: number): string {
  const entry = Object.entries(FIFA_PAIRINGS).find(([id]) => {
    if (id.startsWith("r32-")) return false;
    const node = NODE_BY_ID.get(id);
    if (!node) return false;
    const [homeChild, awayChild] = getChildSources(node);
    if (!homeChild || !awayChild) return false;
    const homeFifa =
      FIFA_PAIRINGS[id]?.[0] ??
      R32_FIXTURES.find((f) => f.id === homeChild)?.fifaMatch;
    return homeFifa === fifaMatch;
  });
  // Map by known internal IDs
  const byFifa: Record<number, string> = {
    89: "r16-2",
    90: "r16-1",
    91: "r16-3",
    92: "r16-4",
    93: "r16-5",
    94: "r16-6",
    95: "r16-7",
    96: "r16-8",
    97: "qf-1",
    98: "qf-2",
    99: "qf-3",
    100: "qf-4",
    101: "sf-1",
    102: "sf-2",
    104: "fin-1",
  };
  return byFifa[fifaMatch] ?? entry?.[0] ?? "";
}

describe("KNOCKOUT_TREE FIFA spec", () => {
  for (const [nodeId, [homeFifa, awayFifa]] of Object.entries(FIFA_PAIRINGS)) {
    it(`${nodeId} feeds from M${homeFifa} vs M${awayFifa}`, () => {
      const node = NODE_BY_ID.get(nodeId);
      assert.ok(node, `missing node ${nodeId}`);
      const [homeChild, awayChild] = getChildSources(node);
      assert.ok(homeChild && awayChild);

      if (nodeId.startsWith("r16-")) {
        assert.equal(homeChild, r32IdFromFifa(homeFifa));
        assert.equal(awayChild, r32IdFromFifa(awayFifa));
      } else {
        assert.equal(homeChild, knockoutIdFromFifa(homeFifa));
        assert.equal(awayChild, knockoutIdFromFifa(awayFifa));
      }
    });
  }
});

describe("R32 knockout chains", () => {
  for (const fixture of R32_FIXTURES) {
    it(`${fixture.id} (M${fixture.fifaMatch}) has a complete chain to final`, () => {
      const chain = getKnockoutChain(fixture.id);
      assert.ok(chain, `missing chain for ${fixture.id}`);
      assert.equal(chain.r32, fixture.id);
      assert.match(chain.r16, /^r16-/);
      assert.match(chain.qf, /^qf-/);
      assert.match(chain.sf, /^sf-/);
      assert.equal(chain.final, "fin-1");
    });
  }
});

describe("SA/Canada → M90 scenario", () => {
  const knockoutResults: SimMatchResult[] = [
    {
      matchId: "r32-1",
      stage: "round-of-32",
      day: 13,
      home: "rsa",
      away: "can",
      winner: "rsa",
    },
    {
      matchId: "r32-2",
      stage: "round-of-32",
      day: 13,
      home: "ger",
      away: "qat",
      winner: "ger",
    },
    {
      matchId: "r32-3",
      stage: "round-of-32",
      day: 13,
      home: "ned",
      away: "mar",
      winner: "ned",
    },
    {
      matchId: "r32-5",
      stage: "round-of-32",
      day: 14,
      home: "fra",
      away: "qat",
      winner: "fra",
    },
  ];

  it("r16-1 pairs W73 (rsa) vs W75 (ned), not Germany", () => {
    const day21 = resolveKnockoutMatchesForDay(
      21,
      knockoutResults,
      [],
      new Set(),
    );
    const r16_1 = day21.find((m) => m.matchId === "r16-1");
    assert.ok(r16_1, "expected r16-1 on day 21");
    assert.equal(r16_1.home, "rsa");
    assert.equal(r16_1.away, "ned");
    assert.notEqual(r16_1.away, "ger");
    assert.notEqual(r16_1.home, "ger");
  });

  it("r16-2 pairs W74 (ger) vs W77 on separate path", () => {
    const day21 = resolveKnockoutMatchesForDay(
      21,
      knockoutResults,
      [],
      new Set(),
    );
    const r16_2 = day21.find((m) => m.matchId === "r16-2");
    assert.ok(r16_2, "expected r16-2 on day 21");
    assert.equal(r16_2.home, "ger");
    assert.equal(r16_2.away, "fra");
  });
});
