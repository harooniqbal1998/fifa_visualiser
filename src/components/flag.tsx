import { getFlagUrl } from "@/lib/flags";

type FlagProps = {
  isoCode: string;
  size?: number;
  className?: string;
};

export function Flag({ isoCode, size = 16, className = "" }: FlagProps) {
  const height = Math.round(size * 0.75);

  return (
    <img
      src={getFlagUrl(isoCode)}
      alt=""
      width={size}
      height={height}
      referrerPolicy="no-referrer"
      decoding="async"
      className={`inline-block shrink-0 object-cover ${className}`.trim()}
      style={{ aspectRatio: "4 / 3" }}
    />
  );
}
