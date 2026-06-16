"use client";

import type { ReactNode } from "react";

type CollapsibleSectionProps = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
};

export function CollapsibleSection({
  summary,
  children,
  defaultOpen = true,
  className = "",
  contentClassName = "",
}: CollapsibleSectionProps) {
  return (
    <details open={defaultOpen} className={`group ${className}`.trim()}>
      <summary className="list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{summary}</div>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}

