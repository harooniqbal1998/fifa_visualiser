"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Team } from "@/types";
import { getFlagUrl } from "@/lib/flags";
import {
  formatSlotCandidateTooltip,
  type SlotCandidate,
} from "@/lib/tournament-structure";
import {
  computePopoverPosition,
  type PopoverPosition,
} from "@/lib/popover-position";

type BracketSlotPopoverProps = {
  candidates: SlotCandidate[];
  teamsById: Record<string, Team>;
  children: ReactNode;
};

function TeamFlag({ isoCode }: { isoCode: string }) {
  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      className="h-3 w-3 shrink-0 rounded-full object-cover ring-1 ring-light-gray dark:ring-light-gray/30"
    />
  );
}

export function BracketSlotPopover({
  candidates,
  teamsById,
  children,
}: BracketSlotPopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    setPosition(computePopoverPosition(triggerRect, panelRect));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open, candidates, updatePosition]);

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
    if (!open || canHover) return;

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
  }, [open, canHover]);

  const ariaLabel = formatSlotCandidateTooltip(candidates, teamsById);

  const handlePointerEnter = () => {
    if (canHover) setOpen(true);
  };

  const handlePointerLeave = () => {
    if (canHover) setOpen(false);
  };

  const handleClick = () => {
    if (!canHover) setOpen((prev) => !prev);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!canHover && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const panel =
    open && mounted ? (
      <div
        ref={panelRef}
        role="tooltip"
        className={`fixed z-[100] min-w-max rounded border border-light-gray bg-background px-2 py-1 text-[10px] leading-snug text-dark-heather shadow-md dark:border-light-gray/25 dark:bg-dark-heather dark:text-light-gray ${
          position ? "visible" : "invisible"
        }`}
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: 0, left: 0 }
        }
      >
        {candidates.map((candidate) => {
          const team = teamsById[candidate.teamId];
          return (
            <div
              key={candidate.teamId}
              className="flex items-center gap-1.5 whitespace-nowrap py-0.5"
            >
              <TeamFlag isoCode={team?.isoCode ?? ""} />
              <span>{team?.name ?? candidate.teamId}</span>
              <span className="text-dark-heather/55 dark:text-light-gray/55">
                {(candidate.probability * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        tabIndex={0}
        aria-label={ariaLabel}
        className="inline-flex shrink-0 cursor-default outline-none focus-visible:ring-2 focus-visible:ring-hermes/50"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
      {panel && createPortal(panel, document.body)}
    </>
  );
}
