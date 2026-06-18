/** Canvas area height below a fixed bottom pill control. */
export function computeVizCanvasHeight(
  viewHeight: number,
  pillHeight: number,
  pillOffsetFromBottom: number,
): number {
  return Math.max(0, viewHeight - pillHeight - 2 * pillOffsetFromBottom);
}

export function measurePillReserve(pillEl: HTMLElement): number {
  const rect = pillEl.getBoundingClientRect();
  const pillOffsetFromBottom = window.innerHeight - rect.bottom;
  return rect.height + 2 * pillOffsetFromBottom;
}
