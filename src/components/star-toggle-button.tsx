"use client";

type StarToggleButtonProps = {
  starred: boolean;
  onToggle: () => void;
  blockedTitle?: string;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M12 2.5l2.55 5.17 5.7.83-4.12 4.02.97 5.67L12 15.9l-5.1 2.68.97-5.67-4.12-4.02 5.7-.83L12 2.5z" />
    </svg>
  );
}

export function StarToggleButton({ starred, onToggle, blockedTitle }: StarToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={blockedTitle}
      aria-label={starred ? "Unstar team" : "Star team"}
      aria-pressed={starred}
      className={`shrink-0 rounded p-0.5 transition-colors ${
        starred
          ? "text-average-green hover:text-average-green/80"
          : "text-dark-heather/35 hover:text-dark-heather/60 dark:text-light-gray/35 dark:hover:text-light-gray/60"
      }`}
    >
      <StarIcon filled={starred} />
    </button>
  );
}
