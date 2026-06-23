"use client";

import type { MatchStage } from "@/types";
import type { Team } from "@/types";
import { BracketSlotPopover } from "@/components/bracket-slot-popover";
import { getFlagUrl } from "@/lib/flags";
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
};

function TeamFlag({ isoCode, className = "h-3.5 w-3.5" }: { isoCode: string; className?: string }) {
  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className={`shrink-0 rounded-full object-cover ring-1 ring-light-gray dark:ring-light-gray/30 ${className}`}
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

  const width = 14 + (candidates.length - 1) * 5;

  return (
    <BracketSlotPopover candidates={candidates} teamsById={teamsById}>
      <div className="relative shrink-0" style={{ width, height: 14 }}>
        {candidates.map((candidate, index) => {
          const team = teamsById[candidate.teamId];
          return (
            <div
              key={candidate.teamId}
              className="absolute top-0"
              style={{ left: index * 5, zIndex: candidates.length - index }}
            >
              <TeamFlag
                isoCode={team?.isoCode ?? ""}
                className="h-3.5 w-3.5 ring-white dark:ring-dark-heather"
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
      className={`flex min-h-[1.25rem] items-center gap-1 px-1.5 py-0.5 text-[10px] leading-tight ${
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
}: {
  match: BracketMatchView;
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
}) {
  const active = activeMatches?.find((m) => m.matchId === match.matchId);
  const winnerId = active?.winner ?? match.winnerId;
  const played = winnerId !== undefined;
  const homeId = active?.home ?? match.home.teamId;
  const awayId = active?.away ?? match.away.teamId;
  const homeWon = played && winnerId === homeId;
  const awayWon = played && winnerId === awayId;

  return (
    <div className="w-full overflow-hidden border border-light-gray dark:border-light-gray/25">
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
        <div className="border-t border-light-gray px-1.5 py-0.5 text-center font-mono text-[9px] text-dark-heather/55 dark:border-light-gray/25 dark:text-light-gray/55">
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
}: {
  stage: MatchStage;
  matches: BracketMatchView[];
  teamsById: Record<string, Team>;
  activeMatches?: CollisionEvent[];
}) {
  if (stage === "group") return null;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 text-center text-[9px] font-semibold leading-tight text-dark-heather/55 dark:text-light-gray/55">
        {KNOCKOUT_LABELS[stage]}
      </div>
      <div className="flex flex-1 flex-col justify-around gap-3">
        {matches.map((match) => (
          <BracketMatchCard
            key={match.matchId}
            match={match}
            teamsById={teamsById}
            activeMatches={activeMatches}
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
