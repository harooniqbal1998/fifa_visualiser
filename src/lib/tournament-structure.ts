import type { MatchStage } from "@/types";
import { PRE_TOURNAMENT_DAY } from "@/lib/match-context-label";
import { matches } from "@/data/matches";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import { formatWinnerFeederLabel, getFifaMatchNumber } from "@/data/knockout-match-numbers";
import {
  R32_FIXTURES_BY_ID,
  type FixtureSlot,
} from "@/data/r32-fixtures";
import { teamsById } from "@/data/teams";
import { createSeededRng } from "@/lib/simulation/animation-params";
import { getEliminatedFromResults } from "@/lib/simulation/bracket-state";
import {
  ALL_KNOCKOUT_NODES,
  getKnockoutMatchMeta,
  resolveNodeParticipants,
} from "@/lib/simulation/bracket-resolver";
import {
  buildStandingsFromGroupResults,
  selectAdvancingThirdPlaceGroups,
  type StandingsTable,
} from "@/lib/simulation/group-advancement";
import { buildBracketSlotProbabilities } from "@/lib/probability/bracket-analytical";
import type { SimMatchResult } from "@/lib/simulation/types";

const BOOTSTRAP_STRUCTURE_SEED = 0;
const TOP_SLOT_CANDIDATES = 3;

export type SlotCandidate = { teamId: string; probability: number };

const STAGE_ORDER: MatchStage[] = [
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "final",
];

const knockoutFixtureOrder = new Map(
  matches.filter((m) => m.stage !== "group").map((m, index) => [m.id, index]),
);

const NODE_BY_ID = new Map(ALL_KNOCKOUT_NODES.map((node) => [node.matchId, node]));

export type BracketParticipant = {
  teamId?: string;
  label: string;
};

export type BracketMatchView = {
  matchId: string;
  stage: MatchStage;
  home: BracketParticipant;
  away: BracketParticipant;
  winnerId?: string;
  homeScore?: number;
  awayScore?: number;
  homeCandidates?: SlotCandidate[];
  awayCandidates?: SlotCandidate[];
};

export type TournamentStructureView = {
  standings: StandingsTable;
  bracketMatches: BracketMatchView[];
  advancingThirdGroups: string[];
  eliminatedTeamIds: Set<string>;
};

export function formatFixtureSlotLabel(slot: FixtureSlot): string {
  if (slot.type === "rank") {
    return `${slot.rank}${slot.group}`;
  }
  return `3rd (${slot.pools.join("/")})`;
}

function participantFromTeamId(teamId: string | undefined): BracketParticipant {
  if (!teamId) {
    return { label: "TBD" };
  }
  const team = teamsById[teamId];
  return {
    teamId,
    label: team?.name ?? teamId,
  };
}

function r32Placeholder(matchId: string, side: "home" | "away"): string {
  const fixture = R32_FIXTURES_BY_ID[matchId];
  if (!fixture) return "TBD";
  const slot = side === "home" ? fixture.home : fixture.away;
  return formatFixtureSlotLabel(slot);
}

function knockoutPlaceholder(matchId: string, side: "home" | "away"): string {
  const node = NODE_BY_ID.get(matchId);
  if (!node) return "TBD";
  const child = side === "home" ? node.homeSource : node.awaySource;
  if (!child) return "TBD";
  return formatWinnerFeederLabel(child.matchId);
}

export function getBracketMatchFeeders(matchId: string): [string, string] | null {
  const node = NODE_BY_ID.get(matchId);
  if (!node?.homeSource || !node.awaySource) return null;
  return [
    formatWinnerFeederLabel(node.homeSource.matchId),
    formatWinnerFeederLabel(node.awaySource.matchId),
  ];
}

export function getBracketMatchFifaNumber(matchId: string): number | undefined {
  return getFifaMatchNumber(matchId);
}

function resolveParticipant(
  teamId: string | undefined,
  matchId: string,
  side: "home" | "away",
): BracketParticipant {
  if (teamId) {
    return participantFromTeamId(teamId);
  }
  if (matchId.startsWith("r32-")) {
    return { label: r32Placeholder(matchId, side) };
  }
  return { label: knockoutPlaceholder(matchId, side) };
}

export function topSlotCandidates(
  map: Record<string, number>,
  eliminated: Set<string>,
): SlotCandidate[] {
  return Object.entries(map)
    .filter(([teamId, probability]) => !eliminated.has(teamId) && probability > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SLOT_CANDIDATES)
    .map(([teamId, probability]) => ({ teamId, probability }));
}

export function formatSlotCandidateTooltip(
  candidates: SlotCandidate[],
  teamsById: Record<string, { name: string }>,
): string {
  return candidates
    .map(({ teamId, probability }) => {
      const name = teamsById[teamId]?.name ?? teamId;
      return `${name} ${(probability * 100).toFixed(1)}%`;
    })
    .join("\n");
}

function shouldAttachSlotCandidates(
  matchId: string,
  day: number,
  matchPlayed: boolean,
  sideHasTeamId: boolean,
): boolean {
  if (day === PRE_TOURNAMENT_DAY) return false;
  if (matchPlayed) return false;
  if (matchId.startsWith("r32-") && day < 12) return true;
  return !sideHasTeamId;
}

export type BuildTournamentStructureOptions = {
  advancingThirdGroups?: string[];
  eloRatings?: Record<string, number>;
};

export function buildTournamentStructureView(
  day: number,
  groupResults: SimMatchResult[],
  knockoutResults: SimMatchResult[],
  options?: BuildTournamentStructureOptions,
): TournamentStructureView {
  const advancingThirdGroupsArg = options?.advancingThirdGroups;
  const eloRatings = options?.eloRatings;
  const standings = buildStandingsFromGroupResults(groupResults);

  const resolvedThirdGroups =
    advancingThirdGroupsArg ??
    (day >= 12 && Object.keys(standings).length > 0
      ? selectAdvancingThirdPlaceGroups(
          standings,
          createSeededRng(BOOTSTRAP_STRUCTURE_SEED),
        )
      : []);

  const slotProbabilities = eloRatings
    ? buildBracketSlotProbabilities(groupResults, knockoutResults, eloRatings).slots
    : null;

  const eliminatedTeamIds = getEliminatedFromResults(
    day,
    knockoutResults,
    groupResults,
    resolvedThirdGroups.length > 0 ? resolvedThirdGroups : undefined,
  );

  const resultByMatchId = new Map(
    knockoutResults.map((result) => [result.matchId, result]),
  );

  const bracketMatches: BracketMatchView[] = ALL_KNOCKOUT_NODES.map((node) => {
    const meta = getKnockoutMatchMeta(node.matchId);
    const stage = meta?.stage ?? "final";

    const { home, away } = resolveNodeParticipants(
      node,
      knockoutResults,
      groupResults,
      resolvedThirdGroups.length > 0 ? resolvedThirdGroups : undefined,
    );

    const result = resultByMatchId.get(node.matchId);
    const matchPlayed = result?.winner !== undefined;
    const slotProbs = slotProbabilities?.[node.matchId];

    const homeParticipant = resolveParticipant(home, node.matchId, "home");
    const awayParticipant = resolveParticipant(away, node.matchId, "away");

    return {
      matchId: node.matchId,
      stage,
      home: homeParticipant,
      away: awayParticipant,
      winnerId: result?.winner,
      homeScore: result?.homeScore,
      awayScore: result?.awayScore,
      homeCandidates:
        shouldAttachSlotCandidates(
          node.matchId,
          day,
          matchPlayed,
          !!homeParticipant.teamId,
        ) && slotProbs
          ? topSlotCandidates(slotProbs.home, eliminatedTeamIds)
          : undefined,
      awayCandidates:
        shouldAttachSlotCandidates(
          node.matchId,
          day,
          matchPlayed,
          !!awayParticipant.teamId,
        ) && slotProbs
          ? topSlotCandidates(slotProbs.away, eliminatedTeamIds)
          : undefined,
    };
  });

  bracketMatches.sort((a, b) => {
    const stageDiff = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    return (
      (knockoutFixtureOrder.get(a.matchId) ?? 0) -
      (knockoutFixtureOrder.get(b.matchId) ?? 0)
    );
  });

  return {
    standings,
    bracketMatches,
    advancingThirdGroups: resolvedThirdGroups,
    eliminatedTeamIds,
  };
}

export { STAGE_ORDER, KNOCKOUT_TREE };
