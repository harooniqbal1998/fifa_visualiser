import { teams } from "@/data/teams";
import type { GroupOutcome } from "@/lib/probability/group-finish-distribution";

/** Points distribution for a group's 3rd-place finisher. */
export type ThirdPlaceMarginal = Map<number, number>;

export function buildThirdPlaceMarginals(
  groupOutcomesByGroup: Record<string, GroupOutcome[]>,
): Record<string, ThirdPlaceMarginal> {
  const marginals: Record<string, ThirdPlaceMarginal> = {};

  for (const groupId of Object.keys(groupOutcomesByGroup).sort()) {
    const marginal: ThirdPlaceMarginal = new Map();
    for (const outcome of groupOutcomesByGroup[groupId] ?? []) {
      marginal.set(
        outcome.thirdPoints,
        (marginal.get(outcome.thirdPoints) ?? 0) + outcome.prob,
      );
    }
    marginals[groupId] = marginal;
  }

  return marginals;
}

/**
 * P(group G's 3rd-place team advances) given G has `points` at the 8-group cutoff.
 * Other groups' 3rd-place points are independent marginals; ties on points split slots equally.
 */
export function probAdvanceWithPoints(
  groupId: string,
  points: number,
  marginals: Record<string, ThirdPlaceMarginal>,
  cache?: Map<string, number>,
): number {
  const cacheKey = `${groupId}:${points}`;
  if (cache) {
    const hit = cache.get(cacheKey);
    if (hit !== undefined) return hit;
  }

  const result = probAdvanceWithPointsCore(groupId, points, marginals);
  cache?.set(cacheKey, result);
  return result;
}

function probAdvanceWithPointsCore(
  groupId: string,
  points: number,
  marginals: Record<string, ThirdPlaceMarginal>,
): number {
  const otherGroups = Object.keys(marginals)
    .filter((g) => g !== groupId)
    .sort();

  type State = { better: number; tied: number; prob: number };
  let states: State[] = [{ better: 0, tied: 1, prob: 1 }];

  for (const g of otherGroups) {
    const marginal = marginals[g]!;
    const next: State[] = [];

    for (const state of states) {
      for (const [pts, p] of marginal.entries()) {
        if (p <= 0) continue;
        if (pts > points) {
          next.push({ better: state.better + 1, tied: state.tied, prob: state.prob * p });
        } else if (pts === points) {
          next.push({ better: state.better, tied: state.tied + 1, prob: state.prob * p });
        } else {
          next.push({ better: state.better, tied: state.tied, prob: state.prob * p });
        }
      }
    }

    const merged = new Map<string, State>();
    for (const state of next) {
      const key = `${state.better}:${state.tied}`;
      const existing = merged.get(key);
      if (existing) {
        existing.prob += state.prob;
      } else {
        merged.set(key, { ...state });
      }
    }

    states = [...merged.values()].filter((state) => state.prob > 1e-15);
  }

  let advanceProb = 0;
  for (const { better, tied, prob } of states) {
    if (prob <= 0) continue;
    if (better >= 8) continue;
    if (better + tied <= 8) {
      advanceProb += prob;
    } else {
      advanceProb += prob * ((8 - better) / tied);
    }
  }

  return advanceProb;
}

/** P(each group's 3rd-place team advances to R32). */
export function computeThirdPlaceAdvanceProbs(
  groupOutcomesByGroup: Record<string, GroupOutcome[]>,
  marginals: Record<string, ThirdPlaceMarginal>,
): Record<string, number> {
  const cache = new Map<string, number>();
  const groupAdvProb: Record<string, number> = {};

  for (const groupId of Object.keys(groupOutcomesByGroup).sort()) {
    let p = 0;
    for (const outcome of groupOutcomesByGroup[groupId] ?? []) {
      p +=
        outcome.prob *
        probAdvanceWithPoints(groupId, outcome.thirdPoints, marginals, cache);
    }
    groupAdvProb[groupId] = p;
  }

  return groupAdvProb;
}

/** P(team T advances as 3rd-place from their group). */
export function computeTeamThirdAdvanceProbs(
  groupOutcomesByGroup: Record<string, GroupOutcome[]>,
  marginals: Record<string, ThirdPlaceMarginal>,
): Record<string, number> {
  const cache = new Map<string, number>();
  const teamProb: Record<string, number> = {};
  for (const team of teams) {
    teamProb[team.id] = 0;
  }

  for (const groupId of Object.keys(groupOutcomesByGroup).sort()) {
    for (const outcome of groupOutcomesByGroup[groupId] ?? []) {
      const adv = probAdvanceWithPoints(
        groupId,
        outcome.thirdPoints,
        marginals,
        cache,
      );
      teamProb[outcome.thirdTeamId] =
        (teamProb[outcome.thirdTeamId] ?? 0) + outcome.prob * adv;
    }
  }

  return teamProb;
}

const ALL_GROUPS = [...new Set(teams.map((t) => t.group))].sort();

/** Independence approximation: P(this exact set of 8 third-place groups advances). */
export function probAdvancingThirdGroupSet(
  advancingGroups: string[],
  groupAdvProb: Record<string, number>,
): number {
  const set = new Set(advancingGroups);
  let p = 1;
  for (const g of ALL_GROUPS) {
    const gp = groupAdvProb[g] ?? 0;
    p *= set.has(g) ? gp : 1 - gp;
  }
  return p;
}
