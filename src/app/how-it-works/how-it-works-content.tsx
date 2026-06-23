"use client";

import Link from "next/link";
import "katex/dist/katex.min.css";
import { BubbleScaleDemo } from "@/components/how-it-works/bubble-scale-demo";
import { EloMatchupDemo } from "@/components/how-it-works/elo-matchup-demo";
import { MathBlock } from "@/components/how-it-works/math-block";
import { SectionCard } from "@/components/how-it-works/section-card";

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HowItWorksContent() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <header className="mb-8 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-light-gray px-2.5 text-xs font-medium text-dark-heather hover:bg-light-gray/20 dark:border-light-gray/30 dark:text-light-gray dark:hover:bg-light-gray/10"
        >
          <BackIcon />
          Back
        </Link>
        <h1 className="text-lg font-semibold text-dark-heather dark:text-light-gray">
          How it works
        </h1>
      </header>

      <p className="mb-6 text-sm leading-relaxed text-dark-heather/70 dark:text-light-gray/70">
        This page explains what you are looking at on the main visualisation: how
        bubble sizes relate to win chances, how those chances are calculated, and
        what happens when you press Play.
      </p>

      <div className="flex flex-col gap-4">
        <SectionCard title="What the circles mean">
          <p>
            The visualisation is organised like the tournament itself. Each{" "}
            <strong className="font-medium text-dark-heather dark:text-light-gray">
              group
            </strong>{" "}
            is a petal, and each{" "}
            <strong className="font-medium text-dark-heather dark:text-light-gray">
              team
            </strong>{" "}
            is a bubble inside it.
          </p>
          <p>
            A bigger bubble means a higher chance of winning the whole World Cup. That
            is not simply that a team is &ldquo;better,&rdquo; but that the model
            thinks they are more likely to lift the trophy from here.
          </p>
          <p>
            When you press Play, bubbles animate as matches resolve and everyone&apos;s
            chances shift in real time.
          </p>
          <BubbleScaleDemo />
        </SectionCard>

        <SectionCard title="Choosing a matchday">
          <p>
            The control bar at the bottom of the main page shows where you are in
            the tournament: pre-tournament, group-stage matchdays, or a knockout
            round. Tap the day label to open a picker and jump to any point in the
            calendar.
          </p>
          <p>
            When you are not simulating, changing the day updates the visualisation
            to reflect all real results played up to that point. Win chances and
            bubble sizes adjust to match that snapshot of the tournament.
          </p>
          <p>
            To run a simulation, pick the day you want to start from and press{" "}
            <strong className="font-medium text-dark-heather dark:text-light-gray">
              Play from
            </strong>
            . The model will play out the remaining fixtures from there. You can
            only start from days where the required match results are already in
            place.
          </p>
        </SectionCard>

        <SectionCard title="How we estimate win chances">
          <p>
            After each real result, we ask: given what is still uncertain, what are
            all the plausible ways the tournament could finish? Those paths are
            combined into one win-chance number per team.
          </p>
          <p>
            For individual matches, we use{" "}
            <strong className="font-medium text-dark-heather dark:text-light-gray">
              Elo ratings
            </strong>{" "}
            derived from FIFA ranking. Stronger teams are more likely to win
            head-to-head. Group-stage uncertainty, third-place qualification, and
            the knockout bracket all feed into the final number.
          </p>
          <p>
            These chances are calculated exactly from the model. We are not
            running thousands of random tournaments and counting winners.
          </p>
          <MathBlock
            math="P(\text{team 1 wins}) = \frac{1}{1 + 10^{(R_2 - R_1) / 400}}"
          />
          <EloMatchupDemo />
        </SectionCard>

        <SectionCard title="What Play does">
          <p>
            Play picks one random path through the remaining fixtures, weighted by
            each team&apos;s Elo rating. After every match, ratings update and
            everyone&apos;s win chances are recalculated. That is why bubbles jump
            during a simulation.
          </p>
          <p>
            The randomness is seeded, so starting from the same day always produces
            the same run. You are watching one possible tournament unfold, while
            the numbers on screen always reflect the full range of what could still
            happen.
          </p>
          <ol className="list-inside list-decimal space-y-2 pl-1 text-xs text-dark-heather/70 dark:text-light-gray/70">
            <li>You press Play from a chosen day.</li>
            <li>Each match day, a winner is picked based on Elo.</li>
            <li>Win chances are recalculated for every team.</li>
            <li>Bubbles resize to match the new numbers.</li>
          </ol>
        </SectionCard>

        <SectionCard title="Putting it together">
          <p>
            The bubbles show each team&apos;s chance of winning the World Cup. Those
            chances come from a model that weighs every plausible path through the
            bracket. Play runs one random path through the rest of the tournament
            so you can watch how a single storyline changes the picture.
          </p>
        </SectionCard>
      </div>

      <div className="mt-4">
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-full bg-hermes px-4 text-xs font-medium text-white hover:bg-hermes/90 dark:bg-light-gray dark:text-dark-heather dark:hover:bg-light-gray/80"
        >
          Back to the visualisation
        </Link>
      </div>

      <div className="h-4 shrink-0" aria-hidden />
    </div>
  );
}
