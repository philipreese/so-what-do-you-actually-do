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
