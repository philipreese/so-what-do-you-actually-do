# CLAUDE.md — Project Instructions for Claude

This file tells Claude how to work in this repository.

---

## What This Project Is

A long-form software engineering handbook — formerly titled *The Systems Engineer's
Handbook*, renamed because "systems engineer" already means something specific and
different in most industries, and this book has never been about that discipline. The
book is complete: 90 chapters across 12 parts, plus 4 appendices, each carrying all three
reading tracks (Engineer, "For My Wife," "For My Kids"). The repository is site-centric —
the Astro app in `site/` is how the book is read; the markdown in the part folders is the
source content it builds from, not a deliverable on its own.

Each chapter was built through a three-model editorial process: ChatGPT and Gemini each
drafted a chapter independently, and Claude synthesized the best of both into the final
chapter. After synthesis, three further editorial passes ran across every chapter: a
voice pass, then the "For My Wife" translation, then the "For My Kids" translation. All
four passes (synthesis + 3 editorial passes) are complete for all 90 chapters. The
prompts that drove every stage, the raw drafts, and each pass's calibration notes are
preserved in `archive/` — see `archive/README.md`. If a new part or chapter is ever added,
follow `archive/prompts/synthesis-guide.md` for the same process, adjusting any paths it
references to the current layout (it predates this reorganization).

---

## Commit and PR Rules

- Do not add `Co-Authored-By:` attribution lines to commit messages
- Do not add session URLs to commit messages
- Do not add "Generated with Claude Code" or any similar footer to PR descriptions
- Commit messages should describe the work, not the tool that did it

---

## Editorial Guidelines

This only applies if new chapters are added — all 90 existing chapters are done. Follow
`archive/prompts/synthesis-guide.md` exactly. That file covers:

- How to locate and read the raw drafts
- What to evaluate in each draft before writing
- Synthesis rules (do not concatenate; cut ruthlessly; take positions)
- Output requirements: final chapter file, ToC update, Part intro update, glossary update
- Commit message format for synthesis commits

It references paths (`raw/`, a part's `README.md`) from before this repository was
reorganized to be site-centric — read it for the editorial judgment calls, not the literal
paths, and use the current conventions below instead.

When generating chapter specifications or prompts, refer to:
- `archive/prompts/chapter-generation.md` — the universal draft generation prompt
- `archive/prompts/part01-chapter-specs.md` — an example of pre-filled special instructions for a part's chapters

---

## File Conventions

| What                           | Where                             |
| ------------------------------ | --------------------------------- |
| Part introduction               | `part[N]-[slug]/index.md`         |
| Synthesized chapters           | `part[N]-[slug]/ch[NN]-[slug].md` |
| Authoritative term definitions | `01-glossary.md`                  |
| Full outline of parts/chapters/appendices | `02-table-of-contents.md` |
| Archived raw drafts, prompts, and editorial-pass notes | `archive/` |

Chapter filenames use lowercase kebab-case: `ch02-complexity-is-the-enemy.md`

---

## What Not to Do

- Do not rewrite or improve raw drafts in place — they are preserved as-is for traceability
- Do not add content to a chapter that its spec's "Do NOT cover" list excludes
- Do not define terms in a chapter that are already in `01-glossary.md` — reference them instead
- Do not create new prompt or spec files for future parts without being asked
