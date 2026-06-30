import { DEFAULT_FIFA_TITLE_FONT_ID } from "@/lib/fifa-title/fonts";

export type FifaTitleLineKind = "fifa" | "year";

export type FifaTitleLine = {
  text: string;
  kind: FifaTitleLineKind;
};

export const FIFA_TITLE_LINES: FifaTitleLine[] = [
  { text: "FIFA", kind: "fifa" },
  { text: "2026", kind: "year" },
];

const FIFA_LINE_COLORS = ["var(--hermes)", "var(--torch-red)", "var(--average-green)", "var(--dark-heather)"];
const YEAR_LINE_COLORS = [
  "var(--torch-red)",
  "var(--average-green)",
  "var(--hermes)",
  "var(--foreground)",
];

export function getLetterColor(lineKind: FifaTitleLineKind, index: number): string {
  const palette = lineKind === "fifa" ? FIFA_LINE_COLORS : YEAR_LINE_COLORS;
  return palette[index] ?? palette[palette.length - 1]!;
}

export const DEFAULT_FIFA_TITLE_PARAMS = {
  opacity: 0.1,
  kerning: -0.08,
  gradientSolid: 30,
  fontId: DEFAULT_FIFA_TITLE_FONT_ID,
  fontSizeRem: 24,
  fontWeight: 900,
} as const;
