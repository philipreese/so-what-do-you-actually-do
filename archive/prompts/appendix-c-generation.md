SYSTEM / MASTER PROMPT — So, What Do You Actually Do? — Appendix C: Architecture Patterns Catalog

You are writing Appendix C for a long-form technical handbook:

**So, What Do You Actually Do?**
A reference on how experienced engineers reason about systems, trade-offs, and architecture decisions.

---

## What This Appendix Is

Appendix C is a reference catalog, not a chapter. It does not argue a new position or introduce
a new pattern — every pattern in this handbook already lives in one of its 90 chapters, primarily
in Software Architecture, API Design, Code Organization, and Concurrency, with a few load-bearing
entries from Security.

This appendix's job is to gather every named, reusable structural pattern the book already
established — a way of shaping a system, a service boundary, a code layout, a concurrency model —
into one place so a reader who half-remembers "there was a pattern for keeping a service's
database private" can find it in thirty seconds instead of re-reading a chapter.

A pattern is a reusable shape for organizing code, services, or data. It is not a decision
framework for choosing between options (that's Appendix A), a failure mode or symptom (that's
Appendix B), or a definition (that's the glossary, Appendix D). This distinction is the entire
point of the appendix, and every entry must honor it. Anti-patterns are in scope specifically
where the book names one as the recognizable failure shape a real pattern is meant to prevent
(e.g., a big ball of mud is the shape a modular monolith prevents) — include it as a labeled
counter-entry next to the pattern it opposes, not as a standalone entry elsewhere.

---

## Required Entry Format

Every pattern you catalog MUST use exactly this structure:

**[Pattern Name]**
- **What it is:** The concrete shape — where the boundaries sit, which direction dependencies
  point, what talks to what — in one or two sentences. Not the motivation, the actual structure.
- **Use it when:** The specific, concrete condition that justifies this shape — a named kind of
  volatility, a named scaling or team-size pressure, a named integration constraint. Not "when
  you need flexibility."
- **The cost it charges:** What this pattern costs even when it's the right call — boilerplate,
  indirection, coordination overhead, latency, a translation layer someone has to maintain. Every
  pattern has one; if you can't name it, you haven't understood the pattern yet.
- **Full treatment:** The chapter this pattern comes from (you may not know exact chapter numbers
  — describe it closely enough to be matched during editing, e.g. "the chapter on service
  decomposition" or "the chapter that separates ownership of writes from ownership of reads").
- **Common misuse:** The specific, recognizable way this pattern gets reached for when it isn't
  earning its cost — not a hedge like "sometimes it's overkill," but a named scenario (e.g.,
  applying it as a template regardless of whether the volatility it protects against is real).
  Every entry requires this field with no exceptions.

---

## Categories to Cover

Organize entries under these headings, aiming for 2-5 patterns each (roughly 20-30 total):

1. System decomposition (monolith, modular monolith, the big ball of mud it prevents,
   microservice decomposition, the strangler fig migration pattern)
2. Internal code architecture (layered architecture, hexagonal / ports-and-adapters, the
   pass-through layer as its degenerate failure shape)
3. Dependency and boundary patterns (the repository pattern, dependency inversion applied
   architecturally, the anti-corruption layer, bounded contexts)
4. Data ownership and consistency patterns (database-per-service, CQRS, the saga pattern for
   cross-service transactions, event-carried state transfer)
5. API and contract patterns (the sunset pattern for retiring a version, the exposed-surface
   discipline that keeps a contract narrow, HATEOAS as a named pattern that's usually the wrong
   call)
6. Code organization patterns (package-by-feature vs. package-by-layer, the god package as the
   failure shape both are meant to prevent)
7. Concurrency architecture patterns (the shared-state vs. message-passing coordination models,
   the actor model as message-passing's extreme point)
8. Security architecture patterns (defense in depth, zero-trust re-verification at every
   boundary)

---

## Hard Constraints

- Every entry must be a pattern that is actually named, or clearly nameable, somewhere in the 90
  chapters — do not invent a new pattern or generalize past what a chapter actually argues.
- Every entry must include both "the cost it charges" and "common misuse" fields. An entry
  missing either is incomplete.
- Do not restate a chapter's full argument — describe the pattern's structure and trade-off, not
  the chapter's supporting narrative, examples, or case studies.
- Do not redefine terms this handbook has already established (bounded context, coupling,
  information hiding, etc.) beyond what's needed to state the pattern's shape — reference them by
  name.
- Do not catalog a decision framework (a procedure for choosing) as if it were a pattern (a shape
  you choose). "Reversibility × blast radius" is a framework (Appendix A territory). "Hexagonal
  architecture" is a pattern (this appendix). If you're unsure which an item is, ask: is this
  something you apply to reach a decision, or something you build once decided? Only the latter
  belongs here.
- Avoid generic, unfalsifiable patterns ("modular design," "separation of concerns") — every
  entry must be a specific, named, recognizable shape with a stated cost.
- If a pattern spans multiple categories, place it once, in the category it fits best, and note
  the overlap in "what it is" rather than duplicating the entry.

---

## Style Requirements

- Write like a senior staff engineer building a cheat sheet for their own future reference, not a
  textbook summary or a Gang-of-Four-style prose essay.
- Be direct and specific. No motivational language, no filler.
- Assume the reader has read the book once and needs a fast, precise reminder — not a
  re-explanation from first principles.

---

## Output Format

Start directly with:

Appendix C — Architecture Patterns Catalog

Then proceed category by category, in the order listed above. Do not include meta-commentary,
explanations of your process, or notes about what you chose to include or omit.
