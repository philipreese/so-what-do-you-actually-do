# CLAUDE.md — Project Instructions for Claude

This file tells Claude how to work in this repository.

---

## What This Project Is

A long-form software engineering handbook — formerly titled *The Systems Engineer's
Handbook*, renamed because "systems engineer" already means something specific and
different in most industries, and this book has never been about that discipline — built
through a three-model editorial process: ChatGPT and Gemini each draft a chapter
independently, and Claude synthesizes the best of both into the final chapter. See 
`prompts/synthesis-guide.md` for the full editorial process.

Each completed chapter is also a candidate for a second, separate editorial pass: a
plain-English "For My Wife" section (and eventually a "For My Kids" section) explaining
the same material to a non-engineer. This is a distinct effort from the ChatGPT/Gemini/
Claude synthesis pipeline above — it works from the already-synthesized chapter, not from
new raw drafts — and is being rolled out incrementally, part by part.

---

## Commit and PR Rules

- Do not add `Co-Authored-By:` attribution lines to commit messages
- Do not add session URLs to commit messages
- Do not add "Generated with Claude Code" or any similar footer to PR descriptions
- Commit messages should describe the work, not the tool that did it

---

## Editorial Guidelines

When receiving raw chapter drafts for synthesis, follow `prompts/synthesis-guide.md`
exactly. That file covers:

- How to locate and read the raw drafts
- What to evaluate in each draft before writing
- Synthesis rules (do not concatenate; cut ruthlessly; take positions)
- Output requirements: final chapter file, ToC update, Part README update, glossary update
- Commit message format for synthesis commits

When generating chapter specifications or prompts, refer to:
- `prompts/chapter-generation.md` — the universal draft generation prompt
- `prompts/part01-chapter-specs.md` — pre-filled special instructions for Part I chapters

---

## File Conventions

| What                           | Where                             |
| ------------------------------ | --------------------------------- |
| Raw ChatGPT drafts             | `raw/chatgpt/`                    |
| Raw Gemini drafts              | `raw/gemini/`                     |
| Synthesized chapters           | `part[N]-[slug]/ch[NN]-[slug].md` |
| Authoritative term definitions | `01-glossary.md`                  |
| Chapter status tracking        | `02-table-of-contents.md`         |

Chapter filenames use lowercase kebab-case: `ch02-complexity-is-the-enemy.md`

---

## What Not to Do

- Do not rewrite or improve raw drafts in place — they are preserved as-is for traceability
- Do not add content to a chapter that its spec's "Do NOT cover" list excludes
- Do not define terms in a chapter that are already in `01-glossary.md` — reference them instead
- Do not create new prompt or spec files for future parts without being asked
