# WIFE_SECTION_NOTES.md — Calibration Cheat Sheet

This file holds concrete decisions from prior sessions so future sessions stay consistent.
Delete after all 90 chapters are done (flag to user first).

---

## Ch01 and Ch88 (calibration)

### What worked
- Concrete analogy that lands in one clause, then follows through rather than switching analogies mid-paragraph
- Ending on a real cost rather than "this matters for code quality" — a dollar amount, a 2am page, a broken thing
- Naming specific chapter positions (Strong Recommendation / Consensus) without using those labels verbatim in the wife section
- Opening directly on the subject without a throat-clear

### What was cut
- "Okay so the thing is..." openers — cut every time
- Tag questions ("...right?" / "make sense?") — cut every time
- "Basically" / "literally" / "honestly" as filler — cut every time
- Fake-relatability openers ("We've all been there") — cut every time
- Over-tidy closers that restate the analogy ("and that's really what engineering is about") — cut every time

### Edge cases and decisions
- Jargon that can't be avoided: define it inline in one clause, first use only. Do not re-explain in subsequent paragraphs.
  - Example: "a cache (a faster copy of data stored nearby)"
  - Example: "MTTR (how fast you get back up)" — only if the chapter's real argument depends on the distinction
- "For My Wife" framing: do not name her in every paragraph. Warmth comes from the quality of the explanation.
- The section must stand alone — if a sentence requires having read the chapter body, rewrite it.
- Word count target: 200–280 words. If a draft hits 300+, the core idea hasn't been found yet.

### Formatting pattern (vary chapter to chapter — not uniform)
- Bold first sentence of each paragraph as topic sentence / skim path — use most chapters
- Italic blockquote pull at the top — use roughly half the chapters, not all
- Mid-section pull-quote for a particularly sharp line — use occasionally when a phrase is worth isolating
- `> [!NOTE]` block — use occasionally for a "this is the thing that actually bites people" aside
- Paragraph count: 2–4, varies by chapter complexity — do not default to 4 every time
- Short chapters get shorter sections; complex multi-decision chapters can run to 4 paragraphs
- Do NOT make every chapter identical in length or structure — organic variation is the goal

---

## Part I, Ch02–Ch09

### Formatting used (for reference)
- **Ch02**: 2 bold paragraphs + mid-section italic pull-quote + 1 plain closing paragraph
- **Ch03**: pull-quote opener + 3 bold paragraphs
- **Ch04**: 2 bold paragraphs + 1 plain paragraph + `[!NOTE]` block at end
- **Ch05**: 2 bold paragraphs + 1 plain paragraph (shortest — chapter argument is tight)
- **Ch06**: 2 bold paragraphs + 1 plain closing paragraph
- **Ch07**: pull-quote opener + 3 bold paragraphs
- **Ch08**: 2 bold paragraphs + 1 plain paragraph (Conway's Law tangent at end, no bold needed)
- **Ch09**: pull-quote opener + 2 bold paragraphs + 1 plain closing paragraph

### What worked
- Mid-section pull-quotes (Ch02: *"Systems don't usually fail because the problem was too hard"*) — good for chapters where one sentence is the real point
- `[!NOTE]` block works well for "here's the specific gotcha" (Ch04: wrong abstraction costs more than no abstraction)
- Chapters with a tight single argument (Ch05, Ch08) ran shorter — 3 paragraphs, no opener quote — and felt right for their length
- Concrete analogies that commit to one image: filing cabinet (Ch03 cohesion), highway construction zone (Ch08 bottleneck), house with movable walls (Ch05 change vs. future-proofing)

### What was cut / avoided
- Did not open every chapter with a pull-quote — roughly half have one, half open directly on bold text
- Did not force 4 paragraphs on every chapter — several are 3
- Avoided re-explaining prerequisite concepts (Ch07 mentions CAP theorem inline without re-teaching it)

### Next session
- Continue with Part II, Ch10–Ch18
- Push after Part II or III per the process instructions
