# Project memory

Living log of important decisions, rationale, and portfolio notes for the FIFA World Cup win-chance visualiser.

Update this file when we make a choice that affects architecture, data, UX, or how we want to talk about the project publicly.

---

## Project intent

**Goal:** Build a visualiser to study how each team's chances of winning the FIFA World Cup evolve — across the tournament (and potentially across editions).

**Why:** Portfolio piece demonstrating data visualisation, thoughtful UX, and incremental product development. Favour clarity and narrative over feature sprawl.

---

## Decisions

| Date | Decision | Rationale | Portfolio note |
|------|----------|-----------|----------------|
| 2026-06-15 | Stack: Next.js (App Router), TypeScript, Tailwind CSS | Default modern React setup; good for interactive viz + deployment. | Shows familiarity with current React ecosystem. |
| 2026-06-15 | Add `d3` early, use only when needed | Likely core to charts/scales/layout; install now to avoid friction later. | D3 for viz depth; React for app shell — common split. |
| 2026-06-15 | Karpathy guidelines in `.cursor/rules/` | Project-scoped copy of global agent rules for consistent, minimal diffs. | Signals intentional, disciplined build process. |
| 2026-06-15 | This `docs/project-memory.md` file | Capture decisions as we go for portfolio write-ups and retros. | Makes the "why" as visible as the "what". |

---

## Open questions

- **Data source:** Historical results only, live tournament data, or modelled win probabilities (Elo, betting markets, custom model)?
- **Scope:** Single tournament bracket view vs. time-series across rounds vs. multi-edition comparison?
- **D3 integration:** Raw D3 in `useEffect`, or a thin React wrapper pattern?

---

## Portfolio snippets (draft)

_Use these bullets when writing case studies; refine as the project grows._

- Interactive FIFA World Cup win-probability visualiser built incrementally with Next.js and D3.
- Focus on explaining uncertainty and tournament dynamics, not just static standings.
