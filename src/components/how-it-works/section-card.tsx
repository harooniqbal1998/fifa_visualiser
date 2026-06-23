import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-lg border border-light-gray px-4 py-3 dark:border-light-gray/25">
      <h2 className="mb-3 text-sm font-semibold text-dark-heather dark:text-light-gray">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-dark-heather/80 dark:text-light-gray/80">
        {children}
      </div>
    </section>
  );
}
