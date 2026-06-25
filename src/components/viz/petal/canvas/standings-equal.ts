import type { StandingRow } from "@/lib/standings";

export function standingsEqual(
  a: Record<string, StandingRow[]>,
  b: Record<string, StandingRow[]>,
): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;

  for (const key of keysA) {
    const rowsA = a[key];
    const rowsB = b[key];
    if (!rowsB || rowsA.length !== rowsB.length) return false;
    for (let i = 0; i < rowsA.length; i++) {
      const rowA = rowsA[i]!;
      const rowB = rowsB[i]!;
      if (
        rowA.teamId !== rowB.teamId ||
        rowA.points !== rowB.points ||
        rowA.gd !== rowB.gd ||
        rowA.played !== rowB.played
      ) {
        return false;
      }
    }
  }

  return true;
}
