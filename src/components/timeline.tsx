"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { MatchStage } from "@/types";
import {
  formatTimelineStartLabel,
  PRE_TOURNAMENT_DAY,
  timelineLabelKey,
  timelineLabelToString,
  type TimelineLabel,
} from "@/lib/match-context-label";
import { computePopoverPosition, type PopoverPosition } from "@/lib/popover-position";
import {
  getMaxDropdownStage,
  getSimStartDays,
  getTimelineDays,
  getTimelineStartOptions,
} from "@/lib/tournament";

const CIRCLE_PX = 14;
const SCROLL_MS = 200;

const stageStyles: Record<MatchStage, string> = {
  group: "border-hermes bg-hermes/20",
  "round-of-32": "border-average-green bg-average-green/20",
  "round-of-16": "border-hermes/70 bg-hermes/15",
  "quarter-final": "border-average-green/70 bg-average-green/15",
  "semi-final": "border-torch-red/70 bg-torch-red/15",
  final: "border-torch-red bg-torch-red/20",
};

const onPrimaryStageStyles: Record<MatchStage, string> = {
  group: "border-white/80 bg-white/25",
  "round-of-32": "border-white/80 bg-white/20",
  "round-of-16": "border-white/70 bg-white/20",
  "quarter-final": "border-white/70 bg-white/15",
  "semi-final": "border-white/70 bg-white/15",
  final: "border-white/90 bg-white/25",
};

function getStageForDay(day: number): MatchStage {
  return getTimelineDays().find((entry) => entry.day === day)?.stage ?? "group";
}

function VerticalTicker({
  value,
  animate,
}: {
  value: string;
  animate: boolean;
}) {
  const prevValueRef = useRef(value);
  const [prevValue, setPrevValue] = useState(value);
  const [scrolling, setScrolling] = useState(false);

  useLayoutEffect(() => {
    if (value === prevValueRef.current) return;
    setPrevValue(prevValueRef.current);
    setScrolling(true);
    prevValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!scrolling) return;
    const timer = window.setTimeout(() => setScrolling(false), SCROLL_MS);
    return () => window.clearTimeout(timer);
  }, [scrolling]);

  const translateY = scrolling && animate ? "-100%" : "0%";

  return (
    <span className="relative inline-flex h-[1.125rem] items-center overflow-hidden">
      <span
        className="block transition-transform ease-out"
        style={{
          transform: `translateY(${translateY})`,
          transitionDuration: `${SCROLL_MS}ms`,
        }}
      >
        {scrolling && animate ? (
          <>
            <span className="block">{prevValue}</span>
            <span className="block">{value}</span>
          </>
        ) : (
          <span className="block">{value}</span>
        )}
      </span>
    </span>
  );
}

function GroupLabel({ label, animate }: { label: TimelineLabel; animate: boolean }) {
  if (label.kind !== "group") return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap leading-none">
      <span>Matchday</span>
      <VerticalTicker value={String(label.md)} animate={animate} />
    </span>
  );
}

function KnockoutLabel({ label, animate }: { label: TimelineLabel; animate: boolean }) {
  if (label.kind !== "knockout") return null;
  return <VerticalTicker value={label.label} animate={animate} />;
}

function PreTournamentLabel({ label, animate }: { label: TimelineLabel; animate: boolean }) {
  if (label.kind !== "pre-tournament") return null;
  return <VerticalTicker value="Pre-tournament" animate={animate} />;
}

function getCircleStyle(
  day: number,
  stage: MatchStage,
  variant: "default" | "onPrimary" = "default",
): string {
  if (day === PRE_TOURNAMENT_DAY) {
    return variant === "onPrimary"
      ? "border-white/60 bg-white/15"
      : "border-light-gray bg-light-gray/20 dark:border-light-gray/40 dark:bg-light-gray/15";
  }
  return variant === "onPrimary" ? onPrimaryStageStyles[stage] : stageStyles[stage];
}

function TimelineStageCircle({
  day,
  stage,
  className = "",
  variant = "default",
}: {
  day: number;
  stage: MatchStage;
  className?: string;
  variant?: "default" | "onPrimary";
}) {
  return (
    <span
      aria-hidden
      className={`box-border shrink-0 rounded-full border-2 ${getCircleStyle(day, stage, variant)} ${className}`}
      style={{ width: CIRCLE_PX, height: CIRCLE_PX }}
    />
  );
}

type TimelineInlineDisplayProps = {
  day: number;
  animate?: boolean;
  circleVariant?: "default" | "onPrimary";
};

export function TimelineInlineDisplay({
  day,
  animate = false,
  circleVariant = "default",
}: TimelineInlineDisplayProps) {
  const stage = getStageForDay(day);
  const label = formatTimelineStartLabel(day, stage);
  const truncate = circleVariant === "onPrimary";

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 leading-none ${truncate ? "" : "whitespace-nowrap"}`}
      aria-live={animate ? "polite" : undefined}
    >
      <TimelineStageCircle day={day} stage={stage} variant={circleVariant} />
      <span className={truncate ? "min-w-0 truncate" : undefined}>
        {label.kind === "pre-tournament" ? (
          <PreTournamentLabel label={label} animate={animate} />
        ) : label.kind === "group" ? (
          <GroupLabel label={label} animate={animate} />
        ) : (
          <KnockoutLabel label={label} animate={animate} />
        )}
      </span>
    </span>
  );
}

export type TimelineDayPickerMode = "dropdown" | "inline-animated" | "inline-static";

type TimelineDayPickerProps = {
  day: number;
  onDayChange: (day: number) => void;
  mode?: TimelineDayPickerMode;
  /** @deprecated Use `mode="inline-animated"` instead. */
  isSimulating?: boolean;
  triggerClassName?: string;
  circleVariant?: "default" | "onPrimary";
  /** Lower z-index sibling; pointer events in its bounds are forwarded to it. */
  delegateTargetRef?: RefObject<HTMLButtonElement | null>;
};

function pointerIsOverElement(
  clientX: number,
  clientY: number,
  element: HTMLElement | null,
): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

const TRIGGER_BASE_CLASS =
  "relative z-10 inline-flex h-7 shrink-0 cursor-pointer items-center text-xs font-medium leading-none text-inherit outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-default disabled:opacity-70 dark:hover:bg-black/10 dark:focus-visible:ring-hermes/50";

export function TimelineDayPicker({
  day,
  onDayChange,
  mode,
  isSimulating = false,
  triggerClassName = "rounded-full px-1.5",
  circleVariant = "default",
  delegateTargetRef,
}: TimelineDayPickerProps) {
  const resolvedMode: TimelineDayPickerMode =
    mode ?? (isSimulating ? "inline-animated" : "dropdown");
  const isDropdown = resolvedMode === "dropdown";
  const animateDay = resolvedMode === "inline-animated";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const simStartKey = `${getMaxDropdownStage()},0,${getSimStartDays().join(",")}`;
  const options = useMemo(
    () => getTimelineStartOptions(),
    [simStartKey],
  );
  const stage = getStageForDay(day);
  const currentLabel = timelineLabelToString(formatTimelineStartLabel(day, stage));
  const ariaLabel = `Start from ${currentLabel}. Choose matchday or round.`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const next = computePopoverPosition(
      trigger.getBoundingClientRect(),
      panel.getBoundingClientRect(),
    );
    setPosition((prev) =>
      prev?.top === next.top && prev?.left === next.left ? prev : next,
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) setPosition(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((option) => {
      const optionLabel = formatTimelineStartLabel(option.day, option.stage);
      const current = formatTimelineStartLabel(day, stage);
      return timelineLabelKey(optionLabel) === timelineLabelKey(current);
    });
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, day, stage, options]);

  const handleSelect = (selectedDay: number) => {
    onDayChange(selectedDay);
    setOpen(false);
  };

  const shouldDelegateToSibling = useCallback(
    (clientX: number, clientY: number) => {
      const delegate = delegateTargetRef?.current;
      if (!delegate || delegate.disabled) return false;
      return pointerIsOverElement(clientX, clientY, delegate);
    },
    [delegateTargetRef],
  );

  const handleTriggerPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!shouldDelegateToSibling(event.clientX, event.clientY)) return;
    event.preventDefault();
    event.stopPropagation();
    delegateTargetRef?.current?.click();
  };

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isDropdown) return;
    if (shouldDelegateToSibling(event.clientX, event.clientY)) return;
    setOpen((prev) => !prev);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!isDropdown) return;

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = options[highlightIndex];
        if (option) handleSelect(option.day);
      } else {
        setOpen(true);
      }
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    }
  };

  const panel =
    open && mounted ? (
      <div
        ref={panelRef}
        role="listbox"
        aria-label="Start from"
        className={`fixed z-[100] min-w-[10rem] rounded-lg border border-light-gray bg-background py-1 shadow-lg dark:border-light-gray/25 dark:bg-dark-heather ${
          position ? "visible" : "invisible"
        }`}
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: 0, left: 0 }
        }
      >
        {options.map((option, index) => (
          <button
            key={option.day}
            type="button"
            role="option"
            aria-selected={timelineLabelKey(
              formatTimelineStartLabel(option.day, option.stage),
            ) === timelineLabelKey(formatTimelineStartLabel(day, stage))}
            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs leading-none whitespace-nowrap ${
              index === highlightIndex
                ? "bg-light-gray/30 text-dark-heather dark:bg-light-gray/15 dark:text-light-gray"
                : "text-dark-heather hover:bg-light-gray/20 dark:text-light-gray dark:hover:bg-light-gray/10"
            }`}
            onMouseEnter={() => setHighlightIndex(index)}
            onClick={() => handleSelect(option.day)}
          >
            <TimelineStageCircle day={option.day} stage={option.stage} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={!isDropdown}
        onPointerDown={handleTriggerPointerDown}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={`${TRIGGER_BASE_CLASS} ${triggerClassName}`}
      >
        <TimelineInlineDisplay day={day} animate={animateDay} circleVariant={circleVariant} />
      </button>
      {panel && createPortal(panel, document.body)}
    </>
  );
}
