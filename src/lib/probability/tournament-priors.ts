import { teams } from "@/data/teams";
import { OPENING_PROBABILITIES } from "@/data/opening-probabilities";
import type { ProbUpdateEvent } from "@/lib/probability/types";

export function buildOpeningProbabilities(): Record<string, number> {
  return { ...OPENING_PROBABILITIES };
}

export function normalizeProbabilities(
  rawWeights: Record<string, number>,
  eliminated: Set<string>,
): Record<string, number> {
  let total = 0;
  for (const [teamId, weight] of Object.entries(rawWeights)) {
    if (eliminated.has(teamId) || weight <= 0) continue;
    total += weight;
  }

  const probs: Record<string, number> = {};
  for (const team of teams) {
    const weight = rawWeights[team.id] ?? 0;
    if (eliminated.has(team.id) || weight <= 0 || total === 0) {
      probs[team.id] = 0;
    } else {
      probs[team.id] = Number(((weight / total) * 100).toFixed(2));
    }
  }
  return probs;
}

export function zeroEliminated(
  probabilities: Record<string, number>,
  eliminated: Set<string>,
): Record<string, number> {
  const weights: Record<string, number> = {};
  for (const team of teams) {
    weights[team.id] = eliminated.has(team.id) ? 0 : (probabilities[team.id] ?? 0);
  }
  return normalizeProbabilities(weights, eliminated);
}

export function computeProbDeltas(
  before: Record<string, number>,
  after: Record<string, number>,
  reason: ProbUpdateEvent["reason"],
): ProbUpdateEvent[] {
  const deltas: ProbUpdateEvent[] = [];
  for (const team of teams) {
    const deltaPct = Number(
      ((after[team.id] ?? 0) - (before[team.id] ?? 0)).toFixed(2),
    );
    if (Math.abs(deltaPct) >= 0.01) {
      deltas.push({ teamId: team.id, deltaPct, reason });
    }
  }
  return deltas;
}
