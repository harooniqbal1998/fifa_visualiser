"use client";

import {
  DEFAULT_FIFA_TITLE_PARAMS,
  FIFA_TITLE_LINES,
  getLetterColor,
} from "@/lib/fifa-title/constants";
import { getFifaTitleFontFamily } from "@/lib/fifa-title/fonts";

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

function GradientLetter({
  char,
  lineIndex,
  lineCount,
  color,
  gradientSolid,
}: {
  char: string;
  lineIndex: number;
  lineCount: number;
  color: string;
  gradientSolid: number;
}) {
  const gradient = buildUnifiedLetterGradient(color, lineIndex, lineCount, gradientSolid);

  return (
    <span
      className="inline-block"
      style={{
        ...gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
    >
      {char}
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
      className="pointer-events-none fixed inset-0 z-0 flex select-none flex-col items-center justify-center"
      style={{ opacity }}
    >
      <div
        className="flex flex-col items-center leading-none"
        style={{
          fontFamily: getFifaTitleFontFamily(fontId),
          fontSize: `${fontSizeRem}rem`,
          fontWeight,
        }}
      >
        {FIFA_TITLE_LINES.map((line, lineIndex) => (
          <div
            key={line.text}
            className="whitespace-nowrap"
            style={{ letterSpacing: `${kerning}em` }}
          >
            {line.text.split("").map((char, index) => (
              <GradientLetter
                key={`${line.text}-${index}`}
                char={char}
                lineIndex={lineIndex}
                lineCount={lineCount}
                color={getLetterColor(line.kind, index)}
                gradientSolid={gradientSolid}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
