# Site — Astro scaffold

Proof-of-concept for the book's eventual website. Built with [Astro](https://astro.build)
(zero-JS-by-default static output) plus a single React "island" for the one thing that
actually needs client-side interactivity: switching between the Engineer / For My Wife /
For My Kids tracks.

## What's here

- The **Engineer** column reads directly from the real chapter markdown in the parent
  repo (`part01-systems-thinking/ch01-...md`, `ch04-...md`) at build time — it is not a
  copy, so it can't drift out of sync with the source of truth.
- The **Wife/Kids** columns are placeholder copy (`src/data/demoContent.ts`), since those
  editorial passes haven't run against every chapter yet. Once they have, this file goes
  away and gets replaced with real parsing of each chapter's `## For My Wife` / `## For My
  Kids` sections.
- The split-view layout scrolls each column independently on wide screens, and collapses
  to the same content stacked in reading order on narrow ones — one component, one
  responsive rule, not two separate implementations.
- The chosen secondary track (wife/kids/hidden) persists in `localStorage` and is
  reflected in the URL (`?view=kids`), so a specific chapter's kid-friendly version is a
  shareable link on its own.

## Running it

```
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in site/dist/
```

## Known scaffold limitations, not yet solved

- Only Ch 01 and Ch 04 are wired up. Scaling to all 90 chapters + Appendix B needs a real
  content pipeline — most likely an Astro content collection or a small remark plugin
  that splits one chapter's markdown into its Engineer/Wife/Kids sections automatically,
  rather than hand-writing a `.astro` page per chapter the way this scaffold does.
- No site nav/sidebar across all chapters yet — just the two demo links on the homepage.
- No chapter or Part illustrations wired in yet (pending the Gemini-generated image set).
- No search.
