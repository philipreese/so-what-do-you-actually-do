# Site — Astro scaffold

Proof-of-concept for the book's eventual website. Built with [Astro](https://astro.build)
(zero-JS-by-default static output) plus a single React "island" for the one thing that
actually needs client-side interactivity: switching between the Engineer / For My Wife /
For My Kids tracks.

## What's here

- The **Engineer** column reads directly from the real chapter markdown in the parent
  repo (`part01-systems-thinking/ch01-...md`, `ch04-...md`) at build time — it is not a
  copy, so it can't drift out of sync with the source of truth.
- `src/lib/parseChapter.ts` parses that markdown into the handbook's actual recurring
  structure — the Prerequisites/New Vocabulary/Key Takeaways header block, each
  Decision/Principle block (What it is / Why it exists / Options / Trade-offs / When to
  choose each / Common failure modes / Example), the `[Consensus]` /
  `[Strong Recommendation]` / `[Legitimate Trade-off]` labels, and nested or standalone
  "Why Smart Engineers Disagree" sections — and gives each its own visual treatment
  (cards, vocab chips, colored badges, a purple disagreement callout) instead of dumping
  the chapter as one undifferentiated block of prose. Trade-off tables get their own
  horizontal scroll region so they don't blow out a narrow column.
- The **Wife/Kids** columns are placeholder copy (`src/data/demoContent.ts`), since those
  editorial passes haven't run against every chapter yet. Once they have, this file goes
  away and gets replaced with real parsing of each chapter's `## For My Wife` / `## For My
  Kids` sections.
- The split-view layout scrolls each column independently on wide screens, and collapses
  to the same content stacked in reading order on narrow ones — one component, one
  responsive rule, not two separate implementations. Internal grids (the meta cards, a
  decision block's two-up lede) use CSS container queries keyed to the pane itself, not
  the viewport, since a pane can be anywhere from full-width to a third of the screen
  depending on how many tracks are open.
- Wife and Kids can both be shown at once — "For My Wife" and "For My Kids" are
  independent toggles, not a three-way radio. Zero, one, or both active tracks render as
  1–3 independently-scrolling columns next to the Engineer column.
- The Kids pane has a mascot slot at its top (`mascotEmoji` / `mascotSrc` props on
  `ChapterTracks`) — currently an emoji placeholder per chapter, swappable for the real
  per-chapter capybara illustration once it exists.
- The chosen track combination persists in `localStorage` and is reflected in the URL
  (`?view=kids`, `?view=wife,kids`), so a specific chapter's kid-friendly version is a
  shareable link on its own.
- `src/pages/parts/part01.astro` is a first example of a **Part intro page** — a longer,
  standalone page per Part with its own banner image slot (currently a placeholder),
  built from that Part's real `README.md` rather than fabricated copy. The other 11 Parts
  aren't wired up yet; this is the template to repeat once real banner art exists.

## Running it

```
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in site/dist/
```

## Known scaffold limitations, not yet solved

- Only Ch 01 and Ch 04 are wired up, and only Part I has an intro page. Scaling to all 90
  chapters + Appendix B + 12 Parts needs a real content pipeline — most likely an Astro
  content collection or a small remark plugin that splits one chapter's markdown into its
  Engineer/Wife/Kids sections automatically, rather than hand-writing a `.astro` page per
  chapter the way this scaffold does.
- No site nav/sidebar across all chapters yet — just the demo links on the homepage.
- No real illustrations wired in yet (chapter mascots, Part banners) — all placeholders
  (emoji / dashed boxes) pending the Gemini-generated image set.
- No per-chapter "tiny intro" above the sections yet — that copy doesn't exist in any
  chapter's markdown yet, so there's nothing to parse. `## Purpose` currently plays that
  role as an ordinary plain section.
- `parseChapter.ts` is regex/heading-based, not a real markdown AST transform. It works
  because every chapter follows `00-style-guide.md` exactly — if a future chapter departs
  from the Prerequisites/Vocabulary/Key-Takeaways header shape or the Decision block's
  bold-label ordering, it'll fall back to a plain section instead of a styled one rather
  than erroring, so mismatches are silent. Worth revisiting once more chapters are wired
  in and it's clear whether the template holds everywhere.
- No search.
