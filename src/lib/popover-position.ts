const GAP = 4;
const VIEWPORT_PADDING = 8;

export type PopoverPosition = {
  top: number;
  left: number;
};

export function computePopoverPosition(
  triggerRect: DOMRect,
  panelRect: DOMRect,
): PopoverPosition {
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING;
  const spaceBelow =
    window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING;
  const placeAbove =
    spaceAbove >= panelRect.height + GAP || spaceAbove >= spaceBelow;

  let top: number;
  if (placeAbove) {
    top = triggerRect.top - panelRect.height - GAP;
  } else {
    top = triggerRect.bottom + GAP;
  }

  let left = triggerRect.left;
  const maxLeft = window.innerWidth - panelRect.width - VIEWPORT_PADDING;
  left = Math.max(VIEWPORT_PADDING, Math.min(left, maxLeft));

  return { top, left };
}
