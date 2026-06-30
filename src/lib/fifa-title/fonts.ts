export type FifaTitleFontId = "future-bold" | "montserrat-black" | "proxima-nova";

export type FifaTitleFontOption = {
  id: FifaTitleFontId;
  label: string;
  cssVariable: string;
  defaultWeight: number;
  fallback: string;
};

export const FIFA_TITLE_FONTS: FifaTitleFontOption[] = [
  {
    id: "future-bold",
    label: "Future Bold",
    cssVariable: "var(--font-fifa-future-bold)",
    defaultWeight: 700,
    fallback: '"Futura", "Future", sans-serif',
  },
  {
    id: "montserrat-black",
    label: "Montserrat Black",
    cssVariable: "var(--font-fifa-montserrat)",
    defaultWeight: 900,
    fallback: '"Montserrat", sans-serif',
  },
  {
    id: "proxima-nova",
    label: "Proxima Nova",
    cssVariable: "var(--font-fifa-proxima-nova)",
    defaultWeight: 800,
    fallback: '"Proxima Nova", "ProximaNova", sans-serif',
  },
];

export const DEFAULT_FIFA_TITLE_FONT_ID: FifaTitleFontId = "montserrat-black";

export function getFifaTitleFontCssVariable(fontId: FifaTitleFontId): string {
  return FIFA_TITLE_FONTS.find((f) => f.id === fontId)?.cssVariable ?? FIFA_TITLE_FONTS[0]!.cssVariable;
}

export function getFifaTitleFontFamily(fontId: FifaTitleFontId): string {
  const font = FIFA_TITLE_FONTS.find((f) => f.id === fontId) ?? FIFA_TITLE_FONTS[0]!;
  return `${font.cssVariable}, ${font.fallback}`;
}

export function getFifaTitleFontDefaultWeight(fontId: FifaTitleFontId): number {
  return FIFA_TITLE_FONTS.find((f) => f.id === fontId)?.defaultWeight ?? 900;
}

export function isFifaTitleFontId(value: string): value is FifaTitleFontId {
  return FIFA_TITLE_FONTS.some((f) => f.id === value);
}
