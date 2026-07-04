# Orientation Pass Notes (subtitle + thesis + Part intros)

Scratchpad for `prompts/edit4-orientation-pass.md`. Delete once all 12 Parts are done —
flag it, don't delete it unilaterally.

## Format that must hold (parser-enforced)

`site/src/lib/parseChapter.ts`'s `extractSubtitleAndThesis` regex requires exactly:
`# Title\n\n*Subtitle.*\n\nThesis paragraph.\n\n**Prerequisites:**`. No blank line inside
the subtitle or thesis block. If the subtitle/thesis don't show up on the built page,
this shape is almost always the reason — check for a stray blank line or a missing blank
line before `**Prerequisites:**`.

## Subtitle calibration (Ch 01–09)

- Length lands at 8–14 words. Shorter ("Trading memory for speed"-style) reads better
  than longer — cut adjectives before cutting the claim.
- Avoid restating the title as a sentence. "Coupling and Cohesion" → *"Two independent
  axes, not opposite ends of the same one"* (states the chapter's actual claim about the
  topic, doesn't just rename it).
- An em dash inside the subtitle works fine and reads naturally (Ch 07, Ch 08) — don't
  force everything into one clause if the chapter's claim is a contrast.

## Thesis calibration (Ch 01–09)

- 3 sentences was enough for most; only reached for 4 when the chapter genuinely has two
  separate moves (e.g. Ch 07: failure-mode ranking + CAP reframing are both load-bearing
  claims, not one).
- Pull straight from Key Takeaways — the strongest sentence in a chapter's takeaways list
  usually IS the thesis's opening sentence with light rewording. Don't write a fresh
  generic summary from scratch; that's how you end up with something that could describe
  any chapter in the part.
- Keep named concepts from the chapter (Little's Law, connascence, mechanical sympathy)
  in the thesis rather than paraphrasing them into vaguer language — a reader deciding
  whether to read the chapter benefits from seeing the actual vocabulary they'll learn.
- Don't restate the subtitle's exact claim in the thesis's first sentence — the subtitle
  is the hook, the thesis is the argument; some overlap in topic is fine, verbatim repeat
  isn't.

## Part intro calibration (Part I)

- 300–700 words means ~4–6 paragraphs. Part I's came in at ~500 words across an opening
  frame (why this part exists structurally), a per-chapter throughline paragraph (one
  sentence per chapter, connected causally, not listed), and a closing paragraph pointing
  forward to where the concepts get reused downstream.
- Naming specific downstream chapters by number and title (e.g. "Chapter 6's latency
  hierarchy comes back in performance") is what makes this feel different from the
  Chapters table — do this at least once per intro, more if the part has a lot of forward
  references.
- Part I is a special case (no prerequisites, it's the entry point) — its intro leans on
  "why read this before anything else" rather than "why now, given what came before,"
  which won't apply to Parts II–XII the same way. Expect those intros to spend more of
  the opening paragraph on what the part assumes from earlier parts.

## STATUS: ALL 90 CHAPTERS AND ALL 12 PART INTROS DONE

Parts I–VII were completed in earlier sessions. Parts VIII–XII (Ch 64–90, plus their five
Part intros) were completed in this session. `npm run build` + grepping every
`dist/chapters/chNN/index.html` for `chapter-subtitle`/`chapter-thesis` confirmed all 90
chapters parse cleanly; all 12 Part `index.md` intros land between 370–510 words.

This pass is complete. This notes file and `archive/prompts/edit4-orientation-pass.md` are
now scaffolding with no more work to guide — flag them for deletion to whoever reviews
this, don't delete them as part of this session.

## Calibration notes from Parts VIII–XII

- For a Part with a clear internal escalation (Part IX: log → signal taxonomy → alert →
  budget; Part XII: gate → method → three applications → closing synthesis), say so
  explicitly in the intro rather than just listing chapters in order — the reader benefits
  from knowing *why* the order is that order, not just that it is.
- When a chapter's Key Takeaways already contain a `[Strong Recommendation]`, `[Consensus]`,
  or `[Legitimate Trade-off]` tag, keep that tag in the thesis sentence built from it. It's
  a direct, load-bearing signal from the source material about how hedged the claim should
  be, and dropping it in the thesis silently changes the confidence level the chapter is
  actually asserting.
- Chapters that close out a Part (or the book) benefit from a thesis sentence that
  explicitly returns to what the Part/book opened with, not just what the chapter itself
  argues — Ch 90's thesis loops back to Ch 01's cost-of-change claim, and its Part intro
  does the same at greater length. This lands better than treating the last chapter as
  just another entry in the list.
- Cross-part callbacks read stronger when they're concrete artifacts (a named example, a
  reused vocabulary term, a numbered chapter) rather than a vague "this builds on earlier
  ideas." Part XI's intro naming the 2018 Equifax breach's chapter and the OIDC-trusted-
  publishing tie back to Part VII are the kind of thing that makes an intro feel like it
  was written by someone who read the actual chapters.
