"use client";

import type { MatchStage } from "@/types";
import type { Team } from "@/types";
import { BracketSlotPopover } from "@/components/bracket-slot-popover";
import { TeamFlagAvatar } from "@/components/team-flag-avatar";
import { KNOCKOUT_LABELS } from "@/lib/match-context-label";
import type { CollisionEvent } from "@/lib/simulation/types";
import {
  STAGE_ORDER,
  type BracketMatchView,
  type SlotCandidate,
  type TournamentStructureView,
} from "@/lib/tournament-structure";

type TournamentBracketTreeProps = {
  structure: TournamentStructureView;
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
  pathFilterActive?: boolean;
  starredPathMatchIds?: Set<string>;
  starredTeamIds?: Set<string>;
};

const BRACKET_FLAG_PX = 16;
/** Horizontal offset between stacked flags; must be < BRACKET_FLAG_PX to keep overlap. */
const BRACKET_STACK_STEP_PX = 10;

function TeamFlag({
  isoCode,
  ringClassName = "ring-light-gray dark:ring-light-gray/30",
}: {
  isoCode: string;
  ringClassName?: string;
}) {
  return (
    <TeamFlagAvatar
      isoCode={isoCode}
      size={BRACKET_FLAG_PX}
      ringClassName={ringClassName}
    />
  );
}

function StackedFlagAvatars({
  candidates,
  teamsById,
  starredTeamIds,
}: {
  candidates: SlotCandidate[];
  teamsById: Record<string, Team>;
  starredTeamIds?: Set<string>;
}) {
  if (candidates.length === 0) return null;

  const width =
    BRACKET_FLAG_PX + (candidates.length - 1) * BRACKET_STACK_STEP_PX;

  return (
    <BracketSlotPopover candidates={candidates} teamsById={teamsById}>
      <div
        className="relative shrink-0"
        style={{ width, height: BRACKET_FLAG_PX }}
      >
        {candidates.map((candidate, index) => {
          const team = teamsById[candidate.teamId];
          return (
            <div
              key={candidate.teamId}
              className="absolute top-0"
              style={{
                left: index * BRACKET_STACK_STEP_PX,
                zIndex: candidates.length - index,
              }}
            >
              <TeamFlag
                isoCode={team?.isoCode ?? ""}
                ringClassName="ring-white dark:ring-dark-heather"
              />
            </div>
          );
        })}
      </div>
    </BracketSlotPopover>
  );
}

function BracketTeamRow({
  participant,
  candidates,
  teamsById,
  isWinner,
  isLoser,
  starredTeamIds,
}: {
  participant: BracketMatchView["home"];
  candidates?: SlotCandidate[];
  teamsById: Record<string, Team>;
  isWinner: boolean;
  isLoser: boolean;
  starredTeamIds?: Set<string>;
}) {
  const team = participant.teamId ? teamsById[participant.teamId] : undefined;
  const isPlaceholder = !participant.teamId;
  const showStack = Boolean(candidates && candidates.length > 0);

  return (
    <div
      className={`flex min-h-7 items-center gap-1.5 px-2 py-1 text-[11px] leading-tight ${
        isWinner
          ? "font-semibold text-dark-heather dark:text-light-gray"
          : isLoser
            ? "text-light-gray/60 line-through dark:text-light-gray/45"
            : isPlaceholder
              ? "text-dark-heather/55 dark:text-light-gray/55"
              : "text-dark-heather dark:text-light-gray"
      }`}
    >
      {showStack ? (
        <StackedFlagAvatars
          candidates={candidates!}
          teamsById={teamsById}
          starredTeamIds={starredTeamIds}
        />
      ) : team ? (
        <TeamFlag isoCode={team.isoCode} />
      ) : null}
      {!showStack ? (
        <span className={`min-w-0 truncate ${isPlaceholder ? "italic" : ""}`}>
          {participant.label}
        </span>
      ) : null}
    </div>
  );
}

function BracketMatchCard({
  match,
  teamsById,
  activeMatches,
  pathFilterActive,
  starredPathMatchIds,
  starredTeamIds,
}: {
  match: BracketMatchView;
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
  pathFilterActive?: boolean;
  starredPathMatchIds?: Set<string>;
  starredTeamIds?: Set<string>;
}) {
  const active = activeMatches?.find((m) => m.matchId === match.matchId);
  const winnerId = active?.winner ?? match.winnerId;
  const played = winnerId !== undefined;
  const homeId = active?.home ?? match.home.teamId;
  const awayId = active?.away ?? match.away.teamId;
  const homeWon = played && winnerId === homeId;
  const awayWon = played && winnerId === awayId;
  const dimmed =
    pathFilterActive &&
    starredPathMatchIds &&
    starredPathMatchIds.size > 0 &&
    !starredPathMatchIds.has(match.matchId);

  return (
    <div
      className={`w-full overflow-hidden border border-light-gray transition-opacity dark:border-light-gray/25 ${
        dimmed ? "opacity-30" : "opacity-100"
      }`}
    >
      <BracketTeamRow
        participant={match.home}
        candidates={active ? undefined : match.homeCandidates}
        teamsById={teamsById}
        isWinner={homeWon}
        isLoser={awayWon}
        starredTeamIds={starredTeamIds}
      />
      <div className="border-t border-light-gray dark:border-light-gray/25" />
      <BracketTeamRow
        participant={match.away}
        candidates={active ? undefined : match.awayCandidates}
        teamsById={teamsById}
        isWinner={awayWon}
        isLoser={homeWon}
        starredTeamIds={starredTeamIds}
      />
      {played && match.homeScore !== undefined && match.awayScore !== undefined ? (
        <div className="border-t border-light-gray px-2 py-1 text-center font-mono text-[10px] text-dark-heather/55 dark:border-light-gray/25 dark:text-light-gray/55">
          {match.homeScore}–{match.awayScore}
        </div>
      ) : null}
    </div>
  );
}

function StageColumn({
  stage,
  matches,
  teamsById,
  activeMatches,
  pathFilterActive,
  starredPathMatchIds,
  starredTeamIds,
}: {
  stage: MatchStage;
  matches: BracketMatchView[];
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
  pathFilterActive?: boolean;
  starredPathMatchIds?: Set<string>;
  starredTeamIds?: Set<string>;
}) {
  if (stage === "group") return null;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 text-center text-[10px] font-semibold leading-tight text-dark-heather/55 dark:text-light-gray/55">
        {KNOCKOUT_LABELS[stage]}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-4">
        {matches.map((match) => (
          <BracketMatchCard
            key={match.matchId}
            match={match}
            teamsById={teamsById}
            activeMatches={activeMatches}
            pathFilterActive={pathFilterActive}
            starredPathMatchIds={starredPathMatchIds}
            starredTeamIds={starredTeamIds}
          />
        ))}
      </div>
    </div>
  );
}

export function TournamentBracketTree({
  structure,
  teamsById,
  activeMatches,
  pathFilterActive = false,
  starredPathMatchIds,
  starredTeamIds,
}: TournamentBracketTreeProps) {
  const matchesByStage = STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = structure.bracketMatches.filter((m) => m.stage === stage);
      return acc;
    },
    {} as Record<MatchStage, BracketMatchView[]>,
  );

  return (
    <div className="pb-2">
      <div className="flex w-full items-stretch gap-2 px-1">
        {STAGE_ORDER.map((stage, stageIndex) => {
          const stageMatches = matchesByStage[stage];
          if (!stageMatches?.length) return null;

          return (
            <div key={stage} className="flex min-w-0 flex-1 items-stretch">
              {stageIndex > 0 ? (
                <div
                  className="mr-2 w-px shrink-0 self-stretch border-l border-dashed border-light-gray dark:border-light-gray/30"
                  aria-hidden
                />
              ) : null}
              <StageColumn
                stage={stage}
                matches={stageMatches}
                teamsById={teamsById}
                activeMatches={activeMatches}
                pathFilterActive={pathFilterActive}
                starredPathMatchIds={starredPathMatchIds}
                starredTeamIds={starredTeamIds}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
