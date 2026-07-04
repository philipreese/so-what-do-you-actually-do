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

---

## Part II, Ch10–Ch18

### Formatting used (for reference)
- **Ch10**: 3 bold paragraphs + 1 plain closing paragraph (4 paragraphs, complex multi-decision chapter)
- **Ch11**: pull-quote opener + 3 bold paragraphs + 1 plain closing paragraph (hexagonal needed the extra paragraph for honest costs)
- **Ch12**: 2 bold paragraphs + 1 plain paragraph + `[!NOTE]` block at end (NOTE used for the interface-ownership distinction, which bites people)
- **Ch13**: 1 bold paragraph (chapter ref) + 2 bold paragraphs + 1 plain closing paragraph (no opener quote — starts on the cross-chapter framing)
- **Ch14**: 2 bold paragraphs + 1 plain paragraph (middleman framing kept tight, OSI example committed to)
- **Ch15**: 3 bold paragraphs + 1 plain closing paragraph (no opener quote — field-commitment point lands better without one)
- **Ch16**: pull-quote opener + 2 bold paragraphs + 2 plain paragraphs (versioning + sunset both needed space)
- **Ch17**: 3 bold paragraphs + 1 plain closing paragraph (phone/text analogy, committed to one image throughout)
- **Ch18**: 3 bold paragraphs + 1 plain closing paragraph (SQL join example in closing paragraph earns its place)

### What worked
- Phone call / text message analogy for sync vs. async (Ch17) — concrete enough to follow, doesn't overstay its welcome
- Opening with the chapter's position directly (Ch18: "unequivocal") rather than "the chapter argues…" phrasing — more confident
- Using a specific broken-flow example (Ch17: credit card charge, cascading timeout) instead of abstract failure description
- `[!NOTE]` for the "defining an interface ≠ inverting a dependency" distinction in Ch12 — right register for "here's the gotcha everyone misses"
- Pull-quote opener used in Ch11 and Ch16 — skipped for chapters where the position lands better as a direct opening paragraph
- Ch10 opens with the industry aspiration (microservices hype) as a foil before the chapter's actual position — good contrast, not a throat-clear

### What was cut / avoided
- Did not use the "bounded context" DDD framing in the Ch13 wife section without immediately unpacking it as "zone where one model of the business stays internally consistent"
- Avoided explaining CQRS by name in Ch18's wife section — described the mechanism instead
- Did not stack analogies in Ch17 — committed to phone/text, not phone/text/walkie-talkie

### Next session
- Continue with Part III, Ch19–Ch27
- Push after Part III (or after Part II + III together if III is short)

---

## Part IV, Ch27–Ch33 / Part V, Ch34–Ch41

### Explicit correction mid-session
- User flagged that sections were starting to converge on one shape (bold-topic-sentence paragraphs every time). Corrected by deliberately alternating: some chapters now use no bold at all (pure flowing prose), some use a mid-section pull-quote instead of an opener, some end on an italicized closing line instead of a bold one. Check the actual chapter files for the current mix before assuming a pattern — don't default to "2-3 bold paragraphs" as the safe choice.

### Formatting used (for reference)
- **Ch27**: 3 bold paragraphs, no opener (filing cabinet / junk drawer analogies)
- **Ch28**: 3 bold paragraphs, no opener (sticky-note-as-promise / red binder analogy)
- **Ch29**: 3 bold paragraphs (packing boxes for a move analogy)
- **Ch30**: 3 bold paragraphs (sticky note on the fridge / paint-fumes window note analogy — deliberately different concrete image from Ch28 despite both being about notes/labels)
- **Ch31**: pull-quote opener + 3 plain paragraphs, only 1 bold topic sentence (universal remote analogy)
- **Ch32**: 2 bold paragraphs + `[!NOTE]` block (exceptions-as-invisible-jump / fire-alarm-vs-out-of-milk analogy)
- **Ch33**: 3 plain paragraphs, zero bold (childproof cap / medicine bottle analogy)
- **Ch34**: 2 plain paragraphs + mid-section italic pull-quote + 1 plain closer (book editing stages: spellcheck/editor/beta reader analogy)
- **Ch35**: 2 bold paragraphs + 1 plain closer (tasting the sauce vs. sealed casserole analogy)
- **Ch36**: 3 plain paragraphs + italicized closing line (GPS route vs. delivery outcome analogy)
- **Ch37**: 3 plain paragraphs, zero bold (hotel room reset between guests analogy)
- **Ch38**: 2 bold paragraphs (spelling-bee-style stress test / earthquake-vs-single-note shrinking analogy)
- **Ch39**: 2 plain paragraphs + 1 bold closer (warranty-card-hoarding analogy)
- **Ch40**: 3 plain paragraphs, zero bold (fire alarm panel: "Zone 14" vs. "Smoke detected: Kitchen")
- **Ch41**: 2 bold paragraphs + 1 plain closer (class attendance vs. learning / pop quiz sabotage = mutation testing)

### What worked
- Deliberately varying bold-density chapter to chapter reads much more human than a uniform template — do this on purpose, don't let it happen by accident
- Reusing a *theme* (notes/labels going stale) across two adjacent chapters (Ch28 naming, Ch30 comments) is fine as long as the concrete image differs (red binder vs. fridge sticky note) — avoid reusing the literal same image twice in a row
- Analogies drawn from ordinary domestic life (fire alarms, hotel rooms, warranty cards, packing boxes, fridges) land better than workplace-generic ones
- Ending on a concrete real cost (a wrong customer balance, a debugging afternoon, a team that stops refactoring, false confidence in production) rather than restating the analogy

### Next session
- Continue with Part VI, Ch42–Ch49
- Push after Part VI or VI+VII together
