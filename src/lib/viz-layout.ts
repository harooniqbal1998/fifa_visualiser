export function measurePillReserve(pillEl: HTMLElement): number {
  const rect = pillEl.getBoundingClientRect();
  const pillOffsetFromBottom = window.innerHeight - rect.bottom;
  return rect.height + 2 * pillOffsetFromBottom;
}
