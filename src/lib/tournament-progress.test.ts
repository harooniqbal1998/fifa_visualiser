import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Match, MatchStage } from "@/types";
import { matches as productionMatches } from "@/data/matches";
import {
  getDropdownTimelineStartOptions,
  getLatestDropdownStartDay,
  getMaxDropdownStage,
  hasSimulationWorkFromDay,
  isDropdownStartDay,
  isGroupStageComplete,
  isKnockoutStageComplete,
  isSimStartDayForMatches,
} from "@/lib/tournament-progress";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";
import { getScriptedResultsBeforeDay } from "@/lib/simulation/advancement";
import { getIdleSnapshotForStartDay } from "@/lib/tournament";

function cloneMatches(): Match[] {
  return productionMatches.map((match) => ({ ...match }));
}

function clearScores(matchList: Match[]): void {
  for (const match of matchList) {
    delete match.homeScore;
    delete match.awayScore;
    delete match.winner;
    if (match.stage !== "group") {
      match.home = "";
      match.away = "";
    }
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
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    assert.equal(getMaxDropdownStage(matchList), "round-of-32");
  });

  it("returns round-of-16 when R32 is fully complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "round-of-16");
  });

  it("returns quarter-final when R16 is fully complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    scoreKnockoutStage(matchList, "round-of-16", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "quarter-final");
  });

  it("returns semi-final when QF is fully complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    scoreKnockoutStage(matchList, "round-of-16", { complete: true });
    scoreKnockoutStage(matchList, "quarter-final", { complete: true });
    assert.equal(getMaxDropdownStage(matchList), "semi-final");
  });

  it("returns final when SF is fully complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
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
    clearScores(matchList);
    for (const match of matchList) {
      if (match.stage !== "group") {
        match.home = "";
        match.away = "";
      }
    }
    scoreAllGroupMatches(matchList);
    assert.equal(isKnockoutStageComplete("round-of-32", matchList), false);
  });

  it("is false when stage has partial results", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: false, partialCount: 8 });
    assert.equal(isKnockoutStageComplete("round-of-32", matchList), false);
  });
});

describe("getDropdownTimelineStartOptions", () => {
  it("includes pre-tournament and Matchday 1 when only MD1 is scored", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreGroupMatchdays(matchList, 1);
    assert.deepEqual(optionLabels(matchList), ["Pre-tournament", "Matchday 1"]);
  });

  it("includes round of 32 but not later knockouts when group is complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
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
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: false, partialCount: 8 });
    const labels = optionLabels(matchList);
    assert.ok(labels.includes("Round of 32"));
    assert.ok(!labels.includes("Round of 16"));
  });

  it("adds round of 16 when R32 is fully complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
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

  it("dedupes to one option per round band", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    const labels = optionLabels(matchList);
    assert.equal(labels.filter((label) => label === "Matchday 1").length, 1);
    assert.equal(labels.filter((label) => label === "Round of 32").length, 1);
    assert.ok(labels.every((label) => !label.includes("Day")));
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
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    assert.equal(isSimStartDayForMatches(21, matchList), true);
    assert.equal(isDropdownStartDay(21, matchList), false);
  });

  it("allows round of 16 when R32 is complete", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
    scoreAllGroupMatches(matchList);
    scoreKnockoutStage(matchList, "round-of-32", { complete: true });
    assert.equal(isDropdownStartDay(21, matchList), true);
  });

  it("aligns play gate with dropdown for blocked future stages", () => {
    const matchList = cloneMatches();
    clearScores(matchList);
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
  it("exposes one option per round through Final with exact Option copy", () => {
    assert.equal(isGroupStageComplete(productionMatches), true);
    assert.equal(getMaxDropdownStage(productionMatches), "final");
    assert.deepEqual(optionLabels(productionMatches), [
      "Pre-tournament",
      "Matchday 1",
      "Matchday 2",
      "Matchday 3",
      "Round of 32",
      "Round of 16",
      "Quarter-final",
      "Semi-final",
      "Final",
    ]);
  });

  it("defaults latest dropdown day to the final start day", () => {
    assert.equal(getLatestDropdownStartDay(productionMatches), 35);
    assert.notEqual(getLatestDropdownStartDay(productionMatches), PRE_TOURNAMENT_DAY);
  });

  it("allows Play from Final even when the Final is historically scored", () => {
    assert.equal(hasSimulationWorkFromDay(35, productionMatches), true);
  });
});

describe("start-of-round idle data", () => {
  it("excludes Final result when viewing Final start", () => {
    const beforeFinal = getScriptedResultsBeforeDay(35);
    assert.ok(!beforeFinal.some((result) => result.matchId === "fin-1"));
    assert.ok(beforeFinal.some((result) => result.matchId === "sf-1"));
    assert.ok(beforeFinal.some((result) => result.matchId === "sf-2"));
  });

  it("idle Final snapshot keeps start day 35 but not champion-only state", () => {
    const idle = getIdleSnapshotForStartDay(35);
    assert.equal(idle.day, 35);
    assert.ok((idle.probabilities.esp ?? 0) < 100);
    assert.ok((idle.probabilities.arg ?? 0) > 0);
  });
});
