You're adding a new recurring section to every chapter of So, What Do You Actually Do?
(Ch 01–90, all complete): a "For My Wife" section — a plain-English
summary of the chapter for a smart, curious non-engineer. Read CLAUDE.md and
00-style-guide.md first.

WHAT IT IS: 2-4 short paragraphs (not bullet points) that explain what the chapter is
actually about and why anyone should care, with zero jargon left undefined. If a term
from the chapter is unavoidable (e.g. "API," "cache"), define it inline in one clause,
don't assume it. Use a real analogy from ordinary life wherever the chapter's central
tension has one — coupling and cohesion is roommates and their shared calendar; cache
invalidation is a whiteboard nobody erases; latency vs. throughput is a single fast
checkout lane versus ten slow ones.

TONE: Warm, a little funny, genuinely affectionate — written the way you'd actually
explain your workday to someone you love who has no reason to already care about
distributed systems, but who you want to actually understand it, not just be humored.
Confident, not condescending: never "don't worry if this is confusing," always trust the
reader to follow a good analogy.

WHAT IT MUST DO:
- Stand alone. Someone should be able to read only this section, skip the rest of the
  chapter entirely, and walk away understanding the one real idea the chapter argues for.
- Preserve the chapter's actual argument. If the chapter takes a position (a [Strong
  Recommendation] or [Consensus]), the plain-English version should too — don't flatten a
  real opinion into "it depends."
- End on the chapter's actual stakes: why getting this wrong costs someone something real
  (money, a 2am page, a broken product) — not an abstract "this matters for code quality."

WHAT IT MUST NOT DO:
- Do not use any term the chapter itself had to define in its own glossary entry without
  re-explaining it in plain language on the spot.
- Do not turn into a joke-only bit that skips the actual content — the humor serves the
  explanation, it isn't the point.
- Do not exceed roughly 300 words. If you need more, the chapter's core idea probably
  hasn't been found yet — find the one thing, not everything.

AVOID AI-WRITING TELLS (CASUAL REGISTER): "Warm and funny" is exactly the voice where LLM
writing tics are most obvious, because they're mostly an attempt to fake warmth rather than
earn it. Cut every one of these on sight:
- Fake-empathy openers: "Okay, so here's the thing," "So here's the deal," "Look," used as
  a throat-clear before the actual sentence.
- Manufactured suspense: "But here's where it gets interesting," "Here's the part that
  really matters." If it's actually interesting, just say the interesting thing.
- Tag questions used as a warmth crutch instead of an actual question: "...right?", "make
  sense?", "you know?" These simulate a listener nodding along instead of writing a
  sentence good enough to earn the nod.
- Rhetorical questions as a transition device: "But why does this matter?" — answer the
  question the paragraph already implies instead of performing the act of asking it.
- Forced relatability: "We've all been there," "You know that feeling when—". Earn the
  relatability with a specific, real scenario instead of gesturing at a generic one.
- Filler intensifiers: "honestly," "literally," "basically," "just" — these are trying to
  sound like natural speech but read as padding the moment there are more than one or two
  in a piece this short.
- Analogy-stacking: picking three different comparisons for the same idea instead of
  committing to the one that actually lands. One good analogy, followed through, beats
  three half-developed ones.
- The over-tidy closer: ending on a sentence that just restates the analogy in a slightly
  more sentimental key ("And that's really what it's all about"). End on the actual stakes
  instead — a real cost, a real 2am page, a real dollar figure.
- Cutesy overuse of the "my wife" framing itself — don't manufacture affection by naming
  her in every paragraph. Real warmth comes from the quality of the explanation, not from
  repeating the frame.
- Self-check: read the paragraph out loud as if you were actually saying it to a specific
  person across a table. If it sounds like a voiceover from an explainer video instead of
  a person talking, rewrite it as the sentence you'd actually say.

PLACEMENT: Insert a new "## For My Wife" section immediately after the "Key takeaways"
bullet list and before the first "---" divider that starts the chapter's main technical
body. This puts it first, so a reader can stop there deliberately.

SESSION CONTINUITY: This work spans multiple sessions (one per Part, or every 2-3 Parts).
Judgment calibrated in an earlier session doesn't automatically carry into a new one, so:

- At the very start of the session, check whether `WIFE_SECTION_NOTES.md` exists at the repo root.
  If it does, read it before touching any chapter — it holds the concrete calibration
  decisions from prior sessions, and staying consistent with it matters more than your own
  fresh judgment on a case it already settled.
- Before your final commit of the session, update `WIFE_SECTION_NOTES.md` with anything a future
  session would need to stay consistent: specific phrases or jokes that worked, specific
  ones that were cut and why, any edge case you had to make a judgment call on. Keep it
  short — bullet points and real before/after snippets, not prose. 15-20 lines is plenty;
  this is a cheat sheet, not a journal.
- If `WIFE_SECTION_NOTES.md` doesn't exist yet, create it in your first session with a one-line
  header and start logging from there.
- This file is scaffolding for the duration of this pass only. Once every chapter is done, it can be deleted — flag that in your final summary rather than
  deleting it yourself, since that's a call the user should make.

PROCESS:
- Work one Part at a time, in chapter order, Part I through Part XII.
- After drafting each section, reread it as someone with zero engineering background
  would — if a sentence needs the chapter to make sense, rewrite it.
- Commit after each Part: "Add 'For My Wife' sections: Part III (Ch 19-26)"
- Push after every 2-3 Parts.

Start with Ch 01 and Ch 88 as calibration chapters — one foundational, one deep in the
weeds (caching) — and show me both before continuing through the rest of Part I.