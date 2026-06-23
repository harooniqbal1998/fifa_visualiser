import type { Metadata } from "next";
import { HowItWorksContent } from "@/app/how-it-works/how-it-works-content";

export const metadata: Metadata = {
  title: "How it works | FIFA World Cup Win Chance",
  description:
    "Learn how the World Cup win-chance visualisation works: bubble sizing, Elo-based probabilities, and what Play does.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-dvh w-full bg-background dark:bg-dark-heather">
      <HowItWorksContent />
    </div>
  );
}
