/** 4×4 Bayer matrix (0–15). Values < 8 become punched-out dots in the halftone overlay. */
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

const BAYER_THRESHOLD = 12;
/** Larger cells = coarser, more readable halftone at background scale. */
const BAYER_CELL_PX = 5;
const BAYER_TILE_PX = BAYER_CELL_PX * 4;

function buildBayerHoleOverlaySvg(): string {
  const rects = BAYER_4X4.flatMap((row, y) =>
    row.map((threshold, x) => {
      if (threshold >= BAYER_THRESHOLD) return "";
      return `<rect x="${x * BAYER_CELL_PX}" y="${y * BAYER_CELL_PX}" width="${BAYER_CELL_PX}" height="${BAYER_CELL_PX}" fill="black"/>`;
    }),
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BAYER_TILE_PX}" height="${BAYER_TILE_PX}">${rects}</svg>`;
}

export const FIFA_TITLE_DITHER_OVERLAY = `url("data:image/svg+xml,${encodeURIComponent(buildBayerHoleOverlaySvg())}")`;

export const FIFA_TITLE_DITHER_TILE_SIZE = `${BAYER_TILE_PX}px ${BAYER_TILE_PX}px`;

/** Total time for the dither overlay to fade out (before per-letter stagger). */
export const FIFA_TITLE_DITHER_OUT_MS = 1800;
export const FIFA_TITLE_DITHER_STAGGER_MS = 55;
