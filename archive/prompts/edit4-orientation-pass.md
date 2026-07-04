You're adding two new pieces of front matter across So, What Do You Actually Do?: a
one-sentence **subtitle** and a 3–4 sentence **thesis** for every chapter (Ch 01–90), and
an expanded **Part introduction** (300–700 words) for each of the 12 Part READMEs. Read
CLAUDE.md and 00-style-guide.md first.

This pass exists because the book is a website now, and the site needs a chapter's core
claim available before a reader commits to the full chapter — in search results, in
social previews, on the Table of Contents page, and at the top of the chapter itself,
above the Engineer/Wife/Kids toggle where every reader sees it regardless of which track
they pick.

---

## Part 1: Chapter Subtitle + Thesis

WHAT IT IS:

- **Subtitle** — one sentence, italicized, immediately under the chapter's `#` title.
  Should work as a dek: what shows up under the title in a listing, as the page's meta
  description, in a social share card. Roughly 8–14 words. Concrete, not a restatement of
  the title ("Abstraction" should not get the subtitle "About abstraction").
- **Thesis** — 3–4 sentences, plain paragraph, directly under the subtitle. States what
  the chapter argues, not what it "covers." Every reader — engineer, wife, kid — reads
  this before picking a track, so it must stand on its own without assuming the reader
  has read the Key Takeaways or Purpose section that follows it.

VOICE: Match the chapter's own confidence. If the chapter carries a [Strong
Recommendation] or [Consensus], the thesis should state the position, not hedge it into
"there are trade-offs to consider." Pull the thesis from the chapter's actual Key
Takeaways and section headers — do not write a generic overview that could describe any
chapter in the part.

WHAT IT MUST NOT DO (per the style guide's existing rules — these apply here too):
- Do not open with "This chapter will cover..." or "In this chapter...".
- Do not hedge a position the chapter itself commits to.
- Do not use "simple," "easy," "obvious," or "just."
- Do not repeat the subtitle inside the thesis, or the thesis inside the Purpose section
  that follows later in the chapter — each should say something the others don't.

PLACEMENT (exact — the site parser depends on this shape):

```
# Chapter N — Title

*One-sentence subtitle.*

Thesis paragraph. 3–4 sentences, no internal blank line — the parser treats the first
blank-line-separated block after the subtitle as the whole thesis.

**Prerequisites:** ...
```

The subtitle line and the thesis paragraph must each be a single block with no blank
line inside them, and the thesis must be followed by a blank line directly into
`**Prerequisites:**` — `site/src/lib/parseChapter.ts`'s `extractSubtitleAndThesis` matches
on exactly that shape. If a chapter has no subtitle/thesis yet, the site already degrades
gracefully (no subtitle line rendered, meta description falls back to the site default),
so there's no rush pressure beyond normal pass pacing.

---

## Part 2: Part Introduction

WHAT IT IS: 300–700 words replacing the current one-or-two-sentence blurb at the top of
each Part's `README.md` (right after the `# Part N — Title` heading, before the Chapters
table). Read `02-table-of-contents.md` and skim the part's chapter Key Takeaways before
writing — the intro needs to reference what's actually in the chapters, not gesture at
the part in the abstract.

ITS JOB IS NOT to summarize the chapters one by one — the Chapters table already does
that. Its job is to answer: **why is the reader learning these chapters now, in this
order, in this book?** What does this part assume the reader already has from earlier
parts, and what does it hand off to later parts? Where does a specific concept from one
of this part's chapters get picked back up downstream — name the chapter and part when
you know it, since that's the kind of concrete connective tissue a reader can't get from
the Chapters table alone.

WHAT IT MUST NOT DO:
- Do not repeat the one-line summaries already in the Chapters table verbatim.
- Do not pad to hit the word count with throat-clearing — if the honest answer is closer
  to 300 words than 700, stop at 300.
- Do not open with "In this part, we will..." — same rule as chapters.

PLACEMENT: Replace the existing intro paragraph(s) between the `# Part N — Title` heading
and the `---` that precedes `## Chapters`. Leave everything from `## Chapters` onward
untouched.

---

## Overall Introduction

Out of scope for this per-chapter/per-part pass — the book's overall introduction lives
in the top-level `README.md` opening and the site homepage hero copy (`site/src/pages/index.astro`),
and is a one-time rewrite, not a rolling pass. It's already been done (see the commit
that introduced this prompt file). Don't regenerate it as part of working through Parts
II–XII.

---

## Session Continuity

This work spans multiple sessions (one per Part, or every 2–3 Parts).

- At the start of a session, read `ORIENTATION_PASS_NOTES.md` at the repo root before
  touching any chapter — it holds calibration decisions from prior sessions.
- Before your final commit of a session, update `ORIENTATION_PASS_NOTES.md` with anything
  a future session needs to stay consistent: subtitle phrasing patterns that worked, ones
  that were cut and why, edge cases. Keep it short — a cheat sheet, not a journal.
- This file is scaffolding for this pass only. Once every chapter and part is done, it
  can be deleted — flag that in your final summary rather than deleting it yourself.

## Process

- Work one Part at a time, in chapter order, Part I through Part XII (Part I is already
  done as the calibration set — see below).
- After finishing a Part's chapters, rewrite that Part's README intro in the same
  session, using what you just wrote for its chapters.
- Run `cd site && npm run build` after each Part to confirm the parser still extracts
  every subtitle/thesis cleanly (a malformed block silently degrades to "no subtitle"
  rather than erroring, so check the build output or grep the generated HTML — a missing
  `chapter-subtitle` element on a chapter you just edited means the blank-line shape is
  wrong).
- Commit after each Part: "Add subtitle/thesis and expand intro: Part III (Ch 19–26)"
- Push after every 2–3 Parts.

Part I (Ch 01–09, plus the Part I README) is already done as the calibration set. Start
the next session with Part II.
