"use client";

import { useMemo, useState } from "react";
import { teamsById } from "@/data/teams";
import {
  buildDebugSnapshot,
  type ProbabilityDebugSnapshot,
} from "@/lib/probability/debug-snapshot";
import type { ProbabilityState } from "@/lib/probability/types";
import type { SimMatchResult } from "@/lib/simulation/types";
import { getFlagUrl } from "@/lib/flags";

type ProbabilityDebugPanelProps = {
  open: boolean;
  onClose: () => void;
  day: number;
  probabilityState: ProbabilityState | null;
  groupResults: SimMatchResult[];
  knockoutResults: SimMatchResult[];
  method: "opening" | "bracket_analytical";
};

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

function DebugContent({ snapshot, focusTeamId, onFocusTeam }: {
  snapshot: ProbabilityDebugSnapshot;
  focusTeamId: string;
  onFocusTeam: (id: string) => void;
}) {
  const pi = snapshot.pathInspector;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-3 text-sm">
      <div className="space-y-1 border-b border-zinc-200 pb-2 dark:border-zinc-700">
        <Row label="Day" value={snapshot.day} />
        <Row label="Method" value={snapshot.method} />
        <Row label="Prob sum" value={`${snapshot.probSum}%`} />
        {snapshot.analyticalStats && (
          <>
            <Row label="Method" value={snapshot.analyticalStats.method} />
            <Row label="Unplayed group" value={snapshot.analyticalStats.unplayedGroupMatches} />
          </>
        )}
        <Row label="Known group results" value={snapshot.resultsCounts.knownGroup} />
        <Row label="Known KO results" value={snapshot.resultsCounts.knownKnockout} />
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Top teams</p>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="pb-1">Team</th>
              <th className="pb-1 text-right">%</th>
              <th className="pb-1 text-right">Δ</th>
              <th className="pb-1 text-right">Elo</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.topTeams.map((row) => (
              <tr
                key={row.id}
                className={`cursor-pointer ${row.id === focusTeamId ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
                onClick={() => onFocusTeam(row.id)}
              >
                <td className="py-0.5">
                  <span className="mr-1">{teamsById[row.id]?.name ?? row.id}</span>
                  {row.eliminated && (
                    <span className="text-zinc-400">out</span>
                  )}
                </td>
                <td className="py-0.5 text-right font-mono">{row.probability.toFixed(1)}</td>
                <td className="py-0.5 text-right font-mono">
                  {row.delta >= 0 ? "+" : ""}
                  {row.delta.toFixed(1)}
                </td>
                <td className="py-0.5 text-right font-mono">{Math.round(row.elo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pi && (
        <div className="space-y-1 border-t border-zinc-200 pt-2 dark:border-zinc-700">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Path inspector</p>
          <Row label="Team" value={teamsById[pi.teamId]?.name ?? pi.teamId} />
          <Row label="Group" value={pi.group} />
          <Row label="R32 slot" value={pi.r32MatchId ?? "—"} />
          <Row label="Bracket half" value={pi.bracketHalf ?? "—"} />
          {pi.chain && (
            <Row
              label="Chain"
              value={`${pi.chain.r32} → ${pi.chain.r16} → ${pi.chain.qf} → ${pi.chain.sf} → ${pi.chain.final}`}
            />
          )}
          {pi.finishDistribution && (
            <>
              <Row label="% finish 1st" value={`${pi.finishDistribution.first}%`} />
              <Row label="% finish 2nd" value={`${pi.finishDistribution.second}%`} />
              <Row label="% advance 3rd" value={`${pi.finishDistribution.third}%`} />
              <Row label="% eliminated" value={`${pi.finishDistribution.eliminated}%`} />
            </>
          )}
          {pi.finalOnlyOpponents.length > 0 && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Final-only: {pi.finalOnlyOpponents.join(", ")}
            </div>
          )}
        </div>
      )}

      {snapshot.lastDeltas.length > 0 && (
        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-700">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Last deltas (top 5)
          </p>
          <ul className="space-y-0.5 text-xs font-mono">
            {snapshot.lastDeltas
              .filter((d) => Math.abs(d.deltaPct) >= 0.01)
              .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
              .slice(0, 5)
              .map((d) => (
                <li key={`${d.teamId}-${d.reason}`}>
                  {teamsById[d.teamId]?.name ?? d.teamId}: {d.deltaPct >= 0 ? "+" : ""}
                  {d.deltaPct.toFixed(2)} ({d.reason})
                </li>
              ))}
          </ul>
        </div>
      )}

      {pi && snapshot.groupStandings[pi.group] && (
        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-700">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Group {pi.group}
          </p>
          <ul className="space-y-0.5 text-xs">
            {snapshot.groupStandings[pi.group]!.map((row, i) => (
              <li key={row.teamId} className="flex items-center gap-2">
                <img
                  src={getFlagUrl(teamsById[row.teamId]?.isoCode ?? "")}
                  alt=""
                  className="h-3 w-4 object-cover"
                />
                <span>{teamsById[row.teamId]?.name ?? row.teamId}</span>
                <span className="ml-auto font-mono text-zinc-500">
                  {row.points}pts ({row.gd >= 0 ? "+" : ""}
                  {row.gd})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProbabilityDebugPanel({
  open,
  onClose,
  day,
  probabilityState,
  groupResults,
  knockoutResults,
  method,
}: ProbabilityDebugPanelProps) {
  const [focusTeamId, setFocusTeamId] = useState("esp");

  const snapshot = useMemo(() => {
    if (!probabilityState) return null;
    return buildDebugSnapshot(
      probabilityState,
      { day, groupResults, knockoutResults, method },
      focusTeamId,
    );
  }, [probabilityState, day, groupResults, knockoutResults, method, focusTeamId]);

  if (!open || !snapshot) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 flex max-h-[min(70vh,520px)] w-80 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <span className="text-sm font-medium">Probability debug</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Close
        </button>
      </div>
      <DebugContent
        snapshot={snapshot}
        focusTeamId={focusTeamId}
        onFocusTeam={setFocusTeamId}
      />
    </div>
  );
}

export function DebugToggleButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-colors ${
        open
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-300 bg-white/90 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-300"
      }`}
    >
      Debug
    </button>
  );
}
