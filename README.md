# So, What Do You Actually Do?
### A Software Engineer's Handbook — With a Chapter for Everyone Else

Every engineer has been asked some version of the title question — at a dinner table, by
a parent, by a partner who has heard the word "microservice" enough times to resent it —
and has given some version of an unsatisfying answer. This book is the long answer. It
works from the premise that "what do you actually do" doesn't have one answer; it has
(at least) three, depending on who's asking and how much context they're willing to sit
through.

**The technical chapter** is the answer for another engineer: the decisions senior
software engineers actually face, why those decisions exist, and the trade-offs between
realistic alternatives — not a tutorial, not tied to any one project, but a career-long
reference organized so you can look up a decision and see the whole landscape before
making it. **"For My Wife"** is the answer given over dinner: the same idea in plain
English, jargon replaced by an analogy that actually holds up, aimed at someone smart and
curious who has never written a line of code and shouldn't have to in order to follow the
real argument. **"For My Kids"** is the answer given on the drive to school: the same idea
again, one size smaller.

All three tracks argue for the same conclusion — that's the point. None of them is a
watered-down version of the "real" chapter for people who couldn't handle it; each is a
genuine translation of the same argument into the vocabulary its reader already has. Read
whichever one matches the conversation you're actually having.

---

## Current State

The book is complete: 90 chapters across 12 parts, plus 4 appendices, and every chapter
carries all three tracks — Engineer, For My Wife, and For My Kids.

This repository is now **site-centric**: the primary way to read the book is the Astro
site in `site/`, which builds each chapter's three tracks into a split-view reading
experience. The markdown in the part folders is the source of truth the site builds
from, not a deliverable on its own.

```
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in site/dist/
```

See `site/README.md` for how the site works.

---

## Structure

| Path                             | Contents                                                     |
| --------------------------------- | ------------------------------------------------------------ |
| `part[N]-[slug]/index.md`         | That part's introduction (the site builds its part page from this) |
| `part[N]-[slug]/ch[NN]-[slug].md` | A chapter: Engineer content plus its "For My Wife" / "For My Kids" sections |
| `appendices/`                     | Decision frameworks, smells catalog, patterns catalog, full glossary |
| `site/`                          | The Astro site that renders all of the above                 |
| `archive/`                       | Raw ChatGPT/Gemini drafts, generation prompts, and editorial-pass notes — preserved for traceability, not part of the current pipeline. See `archive/README.md`. |

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `00-style-guide.md`       | Chapter template, labeling conventions, writing rules    |
| `01-glossary.md`          | Authoritative term definitions, in chapter-completion order |
| `02-table-of-contents.md` | Full outline of every part, chapter, and appendix        |
| `03-design-principles.md` | Core axioms the handbook does not contradict             |

---

## How This Book Was Built

Each chapter went through a three-model editorial process: ChatGPT and Gemini each drafted
a chapter independently, and Claude synthesized the best of both into the final chapter.
After every chapter existed, three further editorial passes ran across all of them: a
voice pass, the "For My Wife" translation, and the "For My Kids" translation.

The raw drafts, the prompts used at every stage, and the calibration notes from each
editorial pass are preserved in `archive/` — see `archive/README.md` for what's there and
why it's no longer live.
