You're doing an editorial voice pass over So, What Do You Actually Do?, a completed
90-chapter software engineering reference (Ch 01–90, all parts complete) plus Appendix B. Read CLAUDE.md and
00-style-guide.md first — you must not violate anything in either file except where this
prompt explicitly overrides it.

GOAL: The book is currently accurate but dry — every chapter follows the What it is / Why
it exists / Options / Trade-offs / When to choose / Common failure modes / Example template
rigorously, and rigor has crowded out personality. Go through it chapter by chapter and
loosen the prose: dry wit, a wry aside, a sharper turn of phrase where the current one is
flat. Think "a very smart senior engineer telling you this at the bar after a bad on-call
week," not "a committee wrote this."

WHAT TO CHANGE:
- Sentence-level voice: word choice, rhythm, the connective tissue between ideas.
- Openings and closings of sections, where dry humor lands best without touching a claim.
- Examples and failure-mode descriptions can get sharper or funnier without becoming less
  precise — a failure mode is funnier, not less true, when it's told well.

WHAT NOT TO CHANGE:
- Any technical claim, number, trade-off, or recommendation. If you're not sure a joke
  preserves the original meaning exactly, don't make the joke.
- The Decision/Principle template structure (What it is / Why it exists / Options /
  Trade-offs / When to choose each / Common failure modes / Example) — headings and
  structure stay exactly as they are.
- Chapter titles, file names, cross-references, glossary terms, Consensus/Strong
  Recommendation/Legitimate Trade-off labels.
- Do not add jokes to every single paragraph. A chapter that's funny throughout stops
  being funny. Pick your spots — one or two real laughs per chapter beats a constant hum
  of forced levity.
- Do not undermine the book's authority. The humor is confidence, not self-deprecation
  about whether the content is right.

AVOID AI-WRITING TELLS: You are an LLM doing a rewrite, and LLMs have well-known verbal
tics. Hunt for these specifically and cut them — the bar is prose nobody would flag as
"obviously written by an AI." This matters as much as the humor goal above.
- Retire these words/phrases entirely, don't just find synonyms for them: "delve,"
  "dive into," "unpack," "navigate," "landscape," "realm," "tapestry," "testament to,"
  "leverage" (as a verb), "robust," "seamless," "holistic," "paramount," "game-changer,"
  "double-edged sword," "at the end of the day," "in today's [X] world," "it's worth
  noting that," "it's important to note that," "needless to say." Also retire
  "load-bearing" specifically — it's become a recognized AI mannerism and using it here,
  in an AI-assisted book, would be a little too on the nose.
- Kill the "It's not just X, it's Y" construction and its cousins ("This isn't merely
  about X — it's about Y") on sight. It's the single most recognizable LLM sentence shape.
- Don't reach for a rule-of-three every time you need an example list (three failure
  modes, three options, three examples). Vary the count so it reads like the number of
  things that were actually true, not a template being filled in.
- Don't open a paragraph with "In essence," "Ultimately," or "Fundamentally" as a
  throat-clearing transition — only use them when the sentence actually needs the word.
- Don't close a section with a tidy, inspirational-sounding sentence that just restates
  what was already said in loftier language. End on the actual point instead.
- Don't stack hedges ("That said, however, it's also worth considering..."). Say the
  thing once, directly.
- Watch the em-dash rate. This book already leans on em-dashes as house style — one per
  sentence is the existing voice, three in one sentence is a tell. Don't make it worse.
- Self-check before moving to the next section: read it back. If it sounds like something
  a LinkedIn post would say with total sincerity, cut it and say the actual thing instead.
  A real number, a real system, or a real specific failure beats every phrase on this list.

SESSION CONTINUITY: This work spans multiple sessions (one per Part, or every 2-3 Parts).
Judgment calibrated in an earlier session doesn't automatically carry into a new one, so:

- At the very start of the session, check whether `VOICE_PASS_NOTES.md` exists at the repo root.
  If it does, read it before touching any chapter — it holds the concrete calibration
  decisions from prior sessions, and staying consistent with it matters more than your own
  fresh judgment on a case it already settled.
- Before your final commit of the session, update `VOICE_PASS_NOTES.md` with anything a future
  session would need to stay consistent: specific phrases or jokes that worked, specific
  ones that were cut and why, any edge case you had to make a judgment call on. Keep it
  short — bullet points and real before/after snippets, not prose. 15-20 lines is plenty;
  this is a cheat sheet, not a journal.
- If `VOICE_PASS_NOTES.md` doesn't exist yet, create it in your first session with a one-line
  header and start logging from there.
- This file is scaffolding for the duration of this pass only. Once every chapter and
  Appendix B are done, it can be deleted — flag that in your final summary rather than
  deleting it yourself, since that's a call the user should make.

PROCESS:
- Work one Part at a time (Part I through Part XII, then Appendix B), in chapter order.
- After each chapter, read your own diff before moving on — if you can't tell whether a
  joke landed without re-reading it twice, cut it.
- Commit after each Part (not each chapter — that's ~90 commits of noise) with a message
  like: "Voice pass: Part IV (Ch 27-33) — loosen prose, add dry wit"
- Push after every 2-3 Parts so work isn't lost if the session ends.
- If you're not sure whether an edit crosses from "voice" into "changed the technical
  meaning," stop and ask rather than guessing.

Start with Part I so we can calibrate the tone on the foundational chapters before you're
90% through the book. Report back after Part I with a couple of before/after examples
before continuing to Part II.