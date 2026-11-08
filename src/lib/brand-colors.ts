/** Keep in sync with globals.css :root palette. */
export const brandColors = {
  averageGreen: "#3CAC3B",
  hermes: "#2A398D",
  torchRed: "#E61D25",
  lightGray: "#D1D4D1",
  darkHeather: "#474A4A",
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type CanvasPalette = {
  guideRing: string;
  guideRingInner: string;
  connector: string;
  placeholderFill: string;
};

export function getCanvasPalette(): CanvasPalette {
  const lineToken = brandColors.darkHeather;
  return {
    guideRing: withAlpha(lineToken, 0.5),
    guideRingInner: withAlpha(lineToken, 0.35),
    connector: withAlpha(lineToken, 0.55),
    placeholderFill: brandColors.darkHeather,
  };
}
