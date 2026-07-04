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

---

## Part VI, Ch42–Ch49

### Formatting used (for reference)
- **Ch42**: pull-quote opener + 2 bold paragraphs (grocery list / garage-cleanup analogy)
- **Ch43**: 2 plain paragraphs + `[!NOTE]` block (kitchen renovation inspection analogy)
- **Ch44**: 2 plain paragraphs + 1 bold closer (Thanksgiving dinner prep analogy)
- **Ch45**: 2 plain paragraphs + `[!NOTE]` block (doctor's chart / immutable medical record analogy)
- **Ch46**: 2 plain paragraphs + 1 bold closer (planning a trip itinerary analogy)
- **Ch47**: 2 bold paragraphs + 1 plain (friend proofreading an email before you hit send)
- **Ch48**: 2 plain paragraphs + 1 bold closer (credit card debt — leaned into the term's literal financial origin on purpose, since the chapter's whole point is reclaiming the precise financial meaning)
- **Ch49**: 2 plain paragraphs + 1 bold closer (toaster safety rule / Chesterton's fence — deliberately NOT the classic "cut the roast ends" anecdote, wrote a fresh equivalent instead)

### What worked
- For a chapter about a term that's a metaphor already (technical debt), leaning into the literal version of the metaphor (real credit-card debt) works better than inventing an unrelated analogy — the chapter is partly *about* reclaiming what the metaphor originally meant
- When a chapter's own central example is a very famous, oft-cited anecdote (Chesterton's fence's "why do we cut the ends off the roast"), write an original analogy with the same shape rather than reusing the famous one — keeps the section from reading like a cliché
- `[!NOTE]` used twice in this Part (Ch43, Ch45) — still an occasional device, not every chapter

### Next session
- Continue with Part VII, Ch50–Ch63 (largest Part — 14 chapters, consider splitting the push mid-Part if needed)
- Push after Part VII (or in two batches within it if it runs long)

---

## Part VII, Ch50–Ch63 (14 chapters — largest Part)

### Formatting used (for reference)
- **Ch50**: 2 plain paragraphs + 1 bold closer (washing dishes as you go vs. letting them pile up)
- **Ch51**: 2 plain paragraphs + 1 bold closer (caption on the back of an old photograph)
- **Ch52**: 2 plain paragraphs + 1 bold closer (family group text — noise vs. a real negotiated decision)
- **Ch53**: 2 plain paragraphs + 1 bold closer (empty moving boxes after unpacking vs. a labeled storage bin)
- **Ch54**: 2 plain paragraphs + 1 bold closer (private journal vs. shared fridge calendar)
- **Ch55**: 2 plain paragraphs + 1 bold closer (two cars driving separate routes to the same reunion — honest parallel account vs. flattened single timeline)
- **Ch56**: 2 plain paragraphs + 1 bold closer (a building's dedication plaque vs. a knife-scratched mark)
- **Ch57**: 2 plain paragraphs + 1 bold closer (smoke detector vs. full home inspection)
- **Ch58**: 2 plain paragraphs + 1 bold closer (one contaminated blood sample vs. three independent doctor's-visit tests)
- **Ch59**: 2 plain paragraphs + 1 bold closer (fridge leftovers labeled by day vs. by contents; periodic full clean-out)
- **Ch60**: 2 plain paragraphs + 1 bold closer (dinner party dietary-restriction combinatorics)
- **Ch61**: 2 plain paragraphs + 1 bold closer (family chore whiteboard driving automatic allowance payout)
- **Ch62**: 2 plain paragraphs + 1 bold closer (sealed contract carried between desks vs. retyped at each one)
- **Ch63**: 2 plain paragraphs + 1 bold closer (car oil changes vs. a seized engine)

### What worked
- This Part's chapters are mechanically dense (Git/CI plumbing) with less inherent emotional stakes than earlier Parts — leaning on very concrete, everyday systems (dishes, calendars, whiteboards, oil changes) rather than trying to force emotional weight the subject matter doesn't have was the right call
- Noticed a risk of formula fatigue (2 plain + 1 bold closer used for nearly the whole Part) — this was a deliberate trade-off given how procedural/technical this Part's content is, but the NEXT Part should actively vary structure again (pull-quotes, NOTE blocks, no-bold-at-all) rather than let "2 plain + 1 bold" become the new unconscious default
- When two adjacent chapters cover structurally similar ground (Ch54 force-push / Ch55 rebase both hinge on "never rewrite shared history"), pick a fresh concrete image for each rather than reusing one — fridge calendar for Ch54, road-trip cars for Ch55
- Deliberately did NOT reuse Ch48's credit-card-debt analogy for Ch63's "dependency debt" (a direct callback in the source text) — used car maintenance instead, since repeating the exact same image across Parts would feel lazy even though the concept is explicitly the same

### Next session
- Continue with Part VIII, Ch64–Ch68 (5 chapters — documentation)
- IMPORTANT: actively vary structure again — this Part fell into "2 plain + 1 bold closer" almost every chapter; break that pattern deliberately (bring back pull-quotes, [!NOTE] blocks, zero-bold prose, mid-section quotes)
- Push after Part VIII (or VIII+IX together)

---

## Part VIII, Ch64–Ch68

### Formatting used (for reference) — deliberately varied per prior session's note
- **Ch64**: pull-quote opener + 3 plain paragraphs, zero bold (sticky note on a broken stove burner)
- **Ch65**: 2 plain paragraphs + `[!NOTE]` block (utility bill vs. home inspection report)
- **Ch66**: 3 plain paragraphs, zero bold (allergy list taped to the fridge)
- **Ch67**: 2 plain paragraphs + 1 bold closer (IKEA furniture instructions / parts list)
- **Ch68**: 2 plain paragraphs + 1 bold closer (fire escape plan + fire drill)

### What worked
- Successfully broke the "2 plain + 1 bold" monoculture from Part VII — mixed pull-quote, NOTE block, and zero-bold prose back in
- This Part's chapters are naturally about categories/taxonomy (README vs spec vs ADR, what to automate vs audit) — analogies built around "two kinds of X that get confused for each other" (utility bill/inspection report, mechanical vs. judgment steps) mapped cleanly
- Avoided repeating the same domestic domain twice in a row: stove (64), paperwork (65), fridge list (66), furniture (67), fire safety (68) — five different concrete settings, no overlap
- The fire-drill analogy (Ch68) carried real emotional stakes without forcing it — operational runbooks are genuinely a life-safety-adjacent metaphor already, so it wasn't a stretch

### Next session
- Continue with Part IX, Ch69–Ch73 (5 chapters — observability)
- Keep mixing formats chapter to chapter; don't let any single shape run more than 2-3 chapters in a row
- Push after Part IX (or IX+X together)

---

## Part IX, Ch69–Ch73

### Formatting used (for reference)
- **Ch69**: 3 plain paragraphs, zero bold (notes left for a babysitter — actionability test + triage levels)
- **Ch70**: 2 bold paragraphs (household budget: monthly total vs. one receipt vs. the whole shoebox — three signal types + cardinality)
- **Ch71**: 2 plain paragraphs + 1 bold closer (car alarm nobody responds to anymore — alert fatigue + symptom vs. cause)
- **Ch72**: 2 bold paragraphs (package tracking number vs. handoff-by-handoff scan record — trace context + sampling)
- **Ch73**: 2 bold paragraphs (diet cheat-meal budget — spend the error budget + multi-window burn rate)

### What worked
- This Part's chapters are unusually mechanical/quantitative (cardinality, burn rate math, sampling) — picking one clean analogy that can carry BOTH of a chapter's two major decisions (Ch70: signal shape + cardinality; Ch72: trace structure + sampling; Ch73: spend-the-budget + multi-window) kept sections from feeling like two disconnected halves stapled together
- Avoided reusing "allowance/chore chart" (already used in Ch61) for Ch73's budget chapter — used a diet/cheat-meal frame instead, since the concept (a budget meant to be spent) is the same shape but the concrete image needs to differ
- Deliberately did NOT reach for smoke-detector/fire imagery again for Ch71 (already used twice: Ch57, Ch68) — used a car alarm instead, which carries the same "false alarms erode trust" point without repeating an image a third time

### Next session
- Continue with Part X, Ch74–Ch78 (5 chapters — concurrency)
- Push after Part X (or X+XI together)
