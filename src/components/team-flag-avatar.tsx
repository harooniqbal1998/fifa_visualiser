"use client";

import { getFlagUrl } from "@/lib/flags";

type TeamFlagAvatarProps = {
  isoCode: string;
  size?: number;
  ringClassName?: string;
};

export function TeamFlagAvatar({
  isoCode,
  size = 16,
  ringClassName = "ring-light-gray dark:ring-light-gray/30",
}: TeamFlagAvatarProps) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full ring-1 ${ringClassName}`}
      style={{ width: size, height: size }}
    >
      <img
        src={getFlagUrl(isoCode)}
        alt=""
        className="block size-full object-cover"
      />
    </span>
  );
}
