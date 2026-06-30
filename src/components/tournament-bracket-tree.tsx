"use client";

import type { BracketNode } from "@/data/knockout-bracket";
import { KNOCKOUT_TREE } from "@/data/knockout-bracket";
import type { Team } from "@/types";
import { BracketSlotPopover } from "@/components/bracket-slot-popover";
import { TeamFlagAvatar } from "@/components/team-flag-avatar";
import type { CollisionEvent } from "@/lib/simulation/types";
import {
  getBracketMatchFeeders,
  getBracketMatchFifaNumber,
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
}: {
  candidates: SlotCandidate[];
  teamsById: Record<string, Team>;
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
}: {
  participant: BracketMatchView["home"];
  candidates?: SlotCandidate[];
  teamsById: Record<string, Team>;
  isWinner: boolean;
  isLoser: boolean;
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
              ? "text-dark-heather/55 italic dark:text-light-gray/55"
              : "text-dark-heather dark:text-light-gray"
      }`}
    >
      {showStack ? (
        <StackedFlagAvatars candidates={candidates!} teamsById={teamsById} />
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
}: {
  match: BracketMatchView;
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
  pathFilterActive?: boolean;
  starredPathMatchIds?: Set<string>;
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
  const fifaNumber = getBracketMatchFifaNumber(match.matchId);
  const feeders = getBracketMatchFeeders(match.matchId);

  return (
    <div
      className={`w-[9.5rem] shrink-0 overflow-hidden border border-light-gray transition-opacity dark:border-light-gray/25 ${
        dimmed ? "opacity-30" : "opacity-100"
      }`}
    >
      {fifaNumber !== undefined ? (
        <div className="border-b border-light-gray bg-light-gray/10 px-2 py-0.5 text-center font-mono text-[9px] text-dark-heather/55 dark:border-light-gray/25 dark:bg-light-gray/5 dark:text-light-gray/55">
          M{fifaNumber}
          {feeders ? ` · ${feeders[0]} v ${feeders[1]}` : null}
        </div>
      ) : null}
      <BracketTeamRow
        participant={match.home}
        candidates={active ? undefined : match.homeCandidates}
        teamsById={teamsById}
        isWinner={homeWon}
        isLoser={awayWon}
      />
      <div className="border-t border-light-gray dark:border-light-gray/25" />
      <BracketTeamRow
        participant={match.away}
        candidates={active ? undefined : match.awayCandidates}
        teamsById={teamsById}
        isWinner={awayWon}
        isLoser={homeWon}
      />
      {played && match.homeScore !== undefined && match.awayScore !== undefined ? (
        <div className="border-t border-light-gray px-2 py-1 text-center font-mono text-[10px] text-dark-heather/55 dark:border-light-gray/25 dark:text-light-gray/55">
          {match.homeScore}–{match.awayScore}
        </div>
      ) : null}
    </div>
  );
}

function ConnectorLines() {
  return (
    <div
      className="relative mx-1 w-4 shrink-0 self-stretch"
      aria-hidden
    >
      <div className="absolute top-1/4 right-0 h-px w-full bg-light-gray dark:bg-light-gray/30" />
      <div className="absolute bottom-1/4 right-0 h-px w-full bg-light-gray dark:bg-light-gray/30" />
      <div className="absolute top-1/4 bottom-1/4 right-0 w-px bg-light-gray dark:bg-light-gray/30" />
      <div className="absolute top-1/2 right-0 h-px w-full bg-light-gray dark:bg-light-gray/30" />
    </div>
  );
}

function BracketSubtree({
  node,
  matchById,
  teamsById,
  activeMatches,
  pathFilterActive,
  starredPathMatchIds,
}: {
  node: BracketNode;
  matchById: Map<string, BracketMatchView>;
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
  pathFilterActive?: boolean;
  starredPathMatchIds?: Set<string>;
}) {
  const match = matchById.get(node.matchId);
  if (!match) return null;

  const hasChildren = node.homeSource && node.awaySource;

  if (!hasChildren) {
    return (
      <BracketMatchCard
        match={match}
        teamsById={teamsById}
        activeMatches={activeMatches}
        pathFilterActive={pathFilterActive}
        starredPathMatchIds={starredPathMatchIds}
      />
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-col justify-around gap-6 py-2">
        <BracketSubtree
          node={node.homeSource!}
          matchById={matchById}
          teamsById={teamsById}
          activeMatches={activeMatches}
          pathFilterActive={pathFilterActive}
          starredPathMatchIds={starredPathMatchIds}
        />
        <BracketSubtree
          node={node.awaySource!}
          matchById={matchById}
          teamsById={teamsById}
          activeMatches={activeMatches}
          pathFilterActive={pathFilterActive}
          starredPathMatchIds={starredPathMatchIds}
        />
      </div>
      <ConnectorLines />
      <BracketMatchCard
        match={match}
        teamsById={teamsById}
        activeMatches={activeMatches}
        pathFilterActive={pathFilterActive}
        starredPathMatchIds={starredPathMatchIds}
      />
    </div>
  );
}

export function TournamentBracketTree({
  structure,
  teamsById,
  activeMatches,
  pathFilterActive = false,
  starredPathMatchIds,
}: TournamentBracketTreeProps) {
  const matchById = new Map(
    structure.bracketMatches.map((match) => [match.matchId, match]),
  );

  return (
    <div className="pb-2">
      <div className="overflow-x-auto pb-2">
        <BracketSubtree
          node={KNOCKOUT_TREE}
          matchById={matchById}
          teamsById={teamsById}
          activeMatches={activeMatches}
          pathFilterActive={pathFilterActive}
          starredPathMatchIds={starredPathMatchIds}
        />
      </div>
    </div>
  );
}
