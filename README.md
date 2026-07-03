# So, What Do You Actually Do?
### A Software Engineer's Handbook — With a Chapter for Everyone Else

A comprehensive engineering reference covering the decisions senior software engineers
face, why those decisions exist, and the trade-offs between realistic alternatives. This
is not a tutorial or a project-specific document — it's a career-long reference organized
so you can look up any decision and understand the full landscape before choosing.

Every chapter also carries a second voice: a plain-English **"For My Wife"** summary (and,
eventually, a **"For My Kids"** version) that explains the same idea to someone who has
never written a line of code — because half the reason this book exists is finally having
a good answer to the question in the title.

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