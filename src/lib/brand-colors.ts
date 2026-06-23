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
