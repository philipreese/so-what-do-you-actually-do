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
real argument. **"For My Kids"** (rolling out incrementally) is the answer given on the
drive to school: the same idea again, one size smaller.

All three tracks argue for the same conclusion — that's the point. None of them is a
watered-down version of the "real" chapter for people who couldn't handle it; each is a
genuine translation of the same argument into the vocabulary its reader already has. Read
whichever one matches the conversation you're actually having.

---

## How This Book Is Built

Each chapter is produced through a three-model editorial process:

1. **ChatGPT** writes a draft → committed to `raw/chatgpt/`
2. **Gemini** writes a draft → committed to `raw/gemini/`
3. **Claude** synthesizes the best of both → committed to the final chapter file in the appropriate part folder

Raw drafts are preserved so the editorial reasoning can be traced and revisited.

---

## Structure

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `00-style-guide.md`       | Chapter template, labeling conventions, writing rules    |
| `01-glossary.md`          | Authoritative term definitions (grows with each chapter) |
| `02-table-of-contents.md` | Full outline with chapter status                         |
| `03-design-principles.md` | Core axioms the handbook does not contradict             |

| Folder                          | Contents                                                |
| ------------------------------- | ------------------------------------------------------- |
| `raw/chatgpt/`                  | Raw ChatGPT drafts, one file per chapter                |
| `raw/gemini/`                   | Raw Gemini drafts, one file per chapter                 |
| `part01-systems-thinking/`      | Final synthesized chapters                              |
| `part02-software-architecture/` | Final synthesized chapters                              |
| `part03-api-design/`            | …                                                       |
| `part04-code-organization/`     | …                                                       |
| `part05-testing-strategy/`      | …                                                       |
| `part06-engineering-process/`   | …                                                       |
| `part07-git-and-delivery/`      | …                                                       |
| `part08-documentation/`         | …                                                       |
| `part09-observability/`         | …                                                       |
| `part10-concurrency/`           | …                                                       |
| `part11-security/`              | …                                                       |
| `part12-performance/`           | …                                                       |
| `appendices/`                   | Decision frameworks, smells catalog, patterns, glossary |

---

## Chapter Status Key

| Status       | Meaning                             |
| ------------ | ----------------------------------- |
| `[Stub]`     | Chapter listed, no drafts yet       |
| `[Draft]`    | Raw drafts exist, synthesis pending |
| `[Complete]` | Final synthesized chapter committed |

See `02-table-of-contents.md` for the current status of every chapter.

**Note:** The "For My Wife" and "For My Kids" sections are a separate editorial pass on
top of the completed technical chapters, and are being added incrementally — they are not
yet present in every chapter.