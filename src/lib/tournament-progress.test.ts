import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Match, MatchStage } from "@/types";
import { matches as productionMatches } from "@/data/matches";
import {
  getDropdownTimelineStartOptions,
  getLatestDropdownStartDay,
  getMaxDropdownStage,
  isDropdownStartDay,
  isGroupStageComplete,
  isKnockoutStageComplete,
  isSimStartDayForMatches,
} from "@/lib/tournament-progress";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";

function cloneMatches(): Match[] {
  return productionMatches.map((match) => ({ ...match }));
}

function clearScores(matchList: Match[]): void {
  for (const match of matchList) {
    delete match.homeScore;
    delete match.awayScore;
    delete match.winner;
  }
}

function scoreGroupMatchdays(matchList: Match[], throughDay: number): void {
  for (const match of matchList) {
    if (match.stage === "group" && match.day <= throughDay) {
      match.homeScore = 1;
      match.awayScore = 0;
      match.winner = match.home;
    }
  }
}

function scoreAllGroupMatches(matchList: Match[]): void {
  scoreGroupMatchdays(matchList, 12);
}

function populateKnockoutTeams(matchList: Match[], stage: MatchStage): Match[] {
  return matchList.filter((match) => match.stage === stage);
}

function scoreKnockoutStage(
  matchList: Match[],
  stage: Exclude<MatchStage, "group">,
  options: { complete: boolean; partialCount?: number },
): void {
  const stageMatches = populateKnockoutTeams(matchList, stage);
  stageMatches.forEach((match, index) => {
    match.home = `team-a-${match.id}`;
    match.away = `team-b-${match.id}`;
    const shouldScore =
      options.complete || (options.partialCount !== undefined && index < options.partialCount);
    if (shouldScore) {
      match.homeScore = 1;
      match.awayScore = 0;
      match.winner = match.home;
    }
  });
}

function optionLabels(matchList: Match[]): string[] {
  return getDropdownTimelineStartOptions(matchList).map((option) => option.label);
}

describe("getMaxDropdownStage", () => {
  it("returns group when group stage is incomplete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreGroupMatchdays(matchList, 4);
    assert.equal(getMaxDropdownStage(matchList), "group");
  });

  it("returns round-of-32 when group is complete and no knockout results exist", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    assert.equal(getMaxDropdownStage(matchList), "round-of-32");
  });

  it("returns round-of-16 when R32 is fully complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "round-of-16");
  });

  it("returns quarter-final when R16 is fully complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    scoreKnockoutStage(matchList, "round-of-16", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "quarter-final");
  });

  it("returns semi-final when QF is fully complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    scoreKnockoutStage(matchList, "round-of-16", { complete: true });
    scoreKnockoutStage(matchList, "quarter-final", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "semi-final");
  });

  it("returns final when SF is fully complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    scoreKnockoutStage(matchList, "round-of-16", { complete: true });
    scoreKnockoutStage(matchList, "quarter-final", { complete: true });
    scoreKnockoutStage(matchList, "semi-final", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "final");
  });
});

describe("isKnockoutStageComplete", () => {
  it("ignores knockout matches without teams", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    assert.equal(isKnockoutStageComplete("round-of-32", matchList), false);
  });

  it("is false when stage has partial results", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: false, partialCount: 8 });
    assert.equal(isKnockoutStageComplete("round-of-32", matchList), false);
  });
});

describe("getDropdownTimelineStartOptions", () => {
  it("includes only pre-tournament and matchday 1 when MD1 is incomplete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreGroupMatchdays(matchList, 1);
    const labels = optionLabels(matchList);
    assert.deepEqual(labels, ["Pre-tournament", "Matchday 1"]);
  });

  it("includes round of 32 but not later knockouts when group is complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    const labels = optionLabels(matchList);
    assert.ok(labels.includes("Round of 32"));
    assert.ok(!labels.includes("Round of 16"));
    assert.ok(!labels.includes("Quarter-final"));
    assert.ok(!labels.includes("Semi-final"));
    assert.ok(!labels.includes("Final"));
  });

  it("still shows round of 32 when R32 is partially complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: false, partialCount: 8 });
    const labels = optionLabels(matchList);
    assert.ok(labels.includes("Round of 32"));
    assert.ok(!labels.includes("Round of 16"));
  });

  it("adds round of 16 when R32 is fully complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    const labels = optionLabels(matchList);
    assert.ok(labels.includes("Round of 16"));
    assert.ok(!labels.includes("Quarter-final"));
  });

  it("always includes pre-tournament", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    assert.ok(optionLabels(matchList).includes("Pre-tournament"));
  });

  it("dedupes to one label per stage band", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    const labels = optionLabels(matchList);
    const md1Count = labels.filter((label) => label === "Matchday 1").length;
    const r32Count = labels.filter((label) => label === "Round of 32").length;
    assert.equal(md1Count, 1);
    assert.equal(r32Count, 1);
  });
});

describe("isDropdownStartDay", () => {
  it("always allows pre-tournament", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    assert.equal(isDropdownStartDay(0, matchList), true);
  });

  it("blocks round of 16 when max stage is round-of-32 even if sim start day passes", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    assert.equal(isSimStartDayForMatches(21, matchList), true);
    assert.equal(isDropdownStartDay(21, matchList), false);
  });

  it("allows round of 16 when R32 is complete", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    assert.equal(isDropdownStartDay(21, matchList), true);
  });

  it("aligns play gate with dropdown for blocked future stages", () => {
    const matchList = cloneMatches();
    scoreAllGroupMatches(matchList);
    for (const day of [27, 31, 35]) {
      assert.equal(
        isDropdownStartDay(day, matchList),
        false,
        `expected day ${day} to be blocked`,
      );
    }
  });
});

describe("production match data", () => {
  it("caps dropdown at round of 32 with current results", () => {
    assert.equal(isGroupStageComplete(productionMatches), true);
    assert.equal(getMaxDropdownStage(productionMatches), "round-of-32");
    const labels = optionLabels(productionMatches);
    assert.ok(labels.includes("Round of 32"));
    assert.ok(!labels.includes("Round of 16"));
  });

  it("returns round of 32 with current production results", () => {
    assert.equal(getLatestDropdownStartDay(productionMatches), 13);
    assert.notEqual(getLatestDropdownStartDay(productionMatches), PRE_TOURNAMENT_DAY);
  });
});
