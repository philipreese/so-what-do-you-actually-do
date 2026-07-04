You're adding a new recurring section to every chapter of So, What Do You Actually Do?
(Ch 01–90, all complete): a "For My Kids" section — a version of the
chapter's core idea for a smart middle schooler (roughly ages 11-14).
Read CLAUDE.md and 00-style-guide.md first. If a "For My Wife"
section already exists in the chapter, read it too — the two should agree on which single
idea from the chapter is the one worth keeping, even though they're pitched differently.

WHAT IT IS: 150-250 words, written the way a genuinely good teacher explains something
they love to a class that hasn't decided yet whether to be interested. Pick ONE concrete,
worked-through analogy from something a middle schooler actually has direct experience
with — group projects, chores, video games, sports team positions, group chats, a school
locker, a group project where one person didn't do their part — and follow it all the way
through rather than switching metaphors halfway.

Unlike the "For My Wife" section, do not use any technical term at all, even defined
inline. Find the plain-language version of the concept instead. If the chapter's idea
genuinely cannot survive translation without a term, that's a sign you haven't found the
right analogy yet — keep looking before you reach for the jargon.

TONE: Like a favorite teacher or a cool older sibling, not a children's book and not a
lecture. Middle schoolers can handle real ideas and real consequences — don't write down
to them. Confident and a little playful, never cutesy, never moralizing.

WHAT IT MUST DO:
- Land on the same real position the chapter takes. A [Strong Recommendation] in the
  chapter should still read as an actual opinion here, not "well, it depends," just
  explained through the analogy instead of through jargon.
- End on a stake a middle schooler would actually recognize as bad — not "this causes
  technical debt," but the analogy's version of a bad outcome (the group project falls
  apart, the whole team gets blamed for one person's part, the game lags for everyone
  because one player hogs the connection).

WHAT IT MUST NOT DO:
- Do not tack on an unrelated moral at the end ("...and that's why teamwork matters!").
  The lesson is the engineering idea, not a generic virtue.
- Do not use exclamation points as a substitute for the sentence actually being
  interesting. One, maybe two per section, and only where a real person would use one out
  loud.
- Do not exceed 250 words. If the analogy needs more room than that, it's the wrong
  analogy — find a smaller one.

AVOID AI-WRITING TELLS (KIDS' CONTENT REGISTER): Content aimed at kids has its own set of
LLM tells, mostly from performing enthusiasm instead of earning it. Cut these on sight:

- Hype-man openers: "You won't believe this!", "Get ready for something cool!"
- "Have you ever...?" as a reflexive opener — use it once across the whole book if at all,
  not as the default way to start a section.
- Reflexively reaching for video games or social media as the analogy because it's the
  "kid" topic, instead of whichever analogy actually fits best (sometimes it's a chore
  chart, sometimes it's a relay race — don't default to screens out of habit).
- Baby-talk vocabulary or sentence length that undersells a 12-year-old's actual reading
  level — this is not a picture book.
- Outdated or try-hard slang. If you're not confident a real middle schooler currently
  says it, don't use it.
- The cutesy rhetorical close: "Pretty neat, right?", "Cool, huh?" End on the stake
  instead of fishing for agreement.
- Redundant restating: saying the same sentence twice, once "for the grown-ups" and once
  "in kid words." Write it once, at the right level, the first time.
- Self-check: read it back and ask whether an actual smart 12-year-old would keep reading
  past the first sentence, or roll their eyes and put it down. If in doubt, cut the enthusiasm
  and make the actual idea more concrete instead.

PLACEMENT: Insert a new "## For My Kids" section immediately after "## For My Wife" if
that section already exists in the chapter, or immediately after the "Key takeaways"
bullet list if it doesn't — either way, before the first "---" divider that starts the
chapter's main technical body.

SESSION CONTINUITY: This work spans multiple sessions (one per Part, or every 2-3 Parts).
Judgment calibrated in an earlier session doesn't automatically carry into a new one, so:

- At the very start of the session, check whether `KIDS_SECTION_NOTES.md` exists at the repo root.
  If it does, read it before touching any chapter — it holds the concrete calibration
  decisions from prior sessions, and staying consistent with it matters more than your own
  fresh judgment on a case it already settled.
- Before your final commit of the session, update `KIDS_SECTION_NOTES.md` with anything a future
  session would need to stay consistent: specific phrases or jokes that worked, specific
  ones that were cut and why, any edge case you had to make a judgment call on. Keep it
  short — bullet points and real before/after snippets, not prose. 15-20 lines is plenty;
  this is a cheat sheet, not a journal.
- If `KIDS_SECTION_NOTES.md` doesn't exist yet, create it in your first session with a one-line
  header and start logging from there.
- This file is scaffolding for the duration of this pass only. Once every chapter is done, it can be deleted — flag that in your final summary rather than
  deleting it yourself, since that's a call the user should make.

PROCESS:
- Work one Part at a time, in chapter order, Part I through Part XII.
- Commit after each Part: "Add 'For My Kids' sections: Part II (Ch 10-18)"
- Push after every 2-3 Parts.

Start with Ch 01 and Ch 88 as calibration chapters
— same two used for the "For My Wife" pass, so you can compare both side by side — before
continuing through the rest of Part I.