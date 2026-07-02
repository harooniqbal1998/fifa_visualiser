"use client";

import type { CSSProperties } from "react";
import {
  DEFAULT_FIFA_TITLE_PARAMS,
  FIFA_TITLE_LINES,
  getLetterColor,
} from "@/lib/fifa-title/constants";
import {
  FIFA_TITLE_DITHER_OUT_MS,
  FIFA_TITLE_DITHER_OVERLAY,
  FIFA_TITLE_DITHER_STAGGER_MS,
  FIFA_TITLE_DITHER_TILE_SIZE,
} from "@/lib/fifa-title/dither-pattern";
import { getFifaTitleFontFamily } from "@/lib/fifa-title/fonts";

const clipText = {
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

function buildUnifiedLetterGradient(
  color: string,
  lineIndex: number,
  lineCount: number,
  gradientSolid: number,
) {
  const solidStop = gradientSolid / 2;
  const backgroundImage = `linear-gradient(to bottom, ${color} 0%, ${color} ${solidStop}%, var(--background) 50%, ${color} ${100 - solidStop}%, ${color} 100%)`;

  return {
    backgroundImage,
    backgroundSize: `100% ${lineCount}em`,
    backgroundPosition: `0 -${lineIndex}em`,
  };
}

function DitheredGradientLetter({
  char,
  lineIndex,
  lineCount,
  color,
  gradientSolid,
  letterIndex,
}: {
  char: string;
  lineIndex: number;
  lineCount: number;
  color: string;
  gradientSolid: number;
  letterIndex: number;
}) {
  const gradient = buildUnifiedLetterGradient(color, lineIndex, lineCount, gradientSolid);

  return (
    <span
      className="fifa-title-letter relative inline-block"
      style={{ "--letter-index": letterIndex } as CSSProperties}
    >
      <span
        className="block"
        style={{
          ...gradient,
          ...clipText,
        }}
      >
        {char}
      </span>
      <span
        aria-hidden
        className="fifa-title-letter-dither absolute inset-0 block"
        style={{
          backgroundImage: FIFA_TITLE_DITHER_OVERLAY,
          backgroundSize: FIFA_TITLE_DITHER_TILE_SIZE,
          backgroundRepeat: "repeat",
          mixBlendMode: "multiply",
          ...clipText,
        }}
      >
        {char}
      </span>
    </span>
  );
}

export function FifaBackgroundTitle() {
  const { opacity, kerning, gradientSolid, fontId, fontSizeRem, fontWeight } =
    DEFAULT_FIFA_TITLE_PARAMS;
  const lineCount = FIFA_TITLE_LINES.length;

  return (
    <div
      aria-hidden
      className="fifa-title-root pointer-events-none fixed inset-0 z-0 flex select-none flex-col items-center justify-center"
      style={{ opacity }}
    >
      <div
        className="fifa-title-inner flex flex-col items-center leading-none"
        style={{
          fontFamily: getFifaTitleFontFamily(fontId),
          fontSize: `${fontSizeRem}rem`,
          fontWeight,
          "--dither-out-duration": `${FIFA_TITLE_DITHER_OUT_MS}ms`,
          "--dither-stagger": `${FIFA_TITLE_DITHER_STAGGER_MS}ms`,
        } as CSSProperties}
      >
        {FIFA_TITLE_LINES.map((line, lineIndex) => (
          <div
            key={line.text}
            className="whitespace-nowrap"
            style={{ letterSpacing: `${kerning}em` }}
          >
            {line.text.split("").map((char, index) => {
              const letterIndex =
                FIFA_TITLE_LINES.slice(0, lineIndex).reduce((sum, l) => sum + l.text.length, 0) +
                index;
              return (
                <DitheredGradientLetter
                  key={`${line.text}-${index}`}
                  char={char}
                  lineIndex={lineIndex}
                  lineCount={lineCount}
                  color={getLetterColor(line.kind, index)}
                  gradientSolid={gradientSolid}
                  letterIndex={letterIndex}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
