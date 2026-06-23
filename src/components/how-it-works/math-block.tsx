"use client";

import katex from "katex";
import { useMemo } from "react";

type MathBlockProps = {
  math: string;
  displayMode?: boolean;
  className?: string;
};

export function MathBlock({
  math,
  displayMode = true,
  className = "",
}: MathBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, displayMode]);

  return (
    <div
      className={`overflow-x-auto text-dark-heather dark:text-light-gray ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
