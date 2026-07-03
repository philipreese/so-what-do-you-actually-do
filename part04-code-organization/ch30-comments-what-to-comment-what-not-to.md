# Ch 30 — Comments: What to Comment, What Not To

**Prerequisites:** [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Naming Conventions and When They Matter](ch28-naming-conventions-and-when-they-matter.md), [API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md)

**New vocabulary introduced:** comment rot

**Key takeaways:**
- A comment is a maintenance liability: it has to stay synchronized with code that keeps changing, and unlike the code itself, nothing forces it to.
- The central test is WHY vs. WHAT. A comment restating what the next line already says is pure cost with nothing to show for it. A comment capturing a hidden constraint, a lock-ordering requirement, or a workaround for an external bug preserves knowledge the code has no way to express on its own.
- Comment rot — a comment that no longer matches the code — is worse than no comment at all. It actively misleads a reader who has no way of knowing it's gone stale.
- Implementation comments (for the next maintainer) and API documentation comments (for the next caller) serve different audiences and carry entirely different obligations.
- If the urge to comment comes from a block of code that needs explaining, the right move is almost always extracting the block into a well-named function, not bolting on more prose.

---

Repository-level design rationale — the reasoning behind the big decisions — belongs in Architecture Decision Records, covered in [Part VI, Ch 45](../part06-engineering-process/ch45-architecture-decision-records.md). API documentation as a publishing discipline gets its own treatment in [Part VIII, Ch 64–68](../part08-documentation/). This chapter is narrower: inline code comments specifically, what they're for, when they're worth their maintenance cost, and when they plainly aren't.

---

### Comment the Why, Never the What

**What it is:** The central test for whether an inline comment is justified — whether it records information that cannot be recovered by reading the code itself.

**Why it exists:** Source code already describes its own behavior mechanically. A comment that just translates the next line into English doubles the maintenance burden for zero information gained. Only a comment can explain *why* the code does what it does: the external constraint that forced the choice, the invariant the code leans on but never visibly enforces, the behavior that would blindside even a careful reader who walked in with no prior context.

**Options:**

1. **Capture context** — document a hidden constraint, a lock-ordering requirement, a hardware quirk, a known bug in a third-party API, a non-obvious invariant the implementation relies on.
2. **Restate mechanics** — describe the operations the code already makes visible.
3. **No comment** — let the implementation speak for itself.

**Trade-offs:**

[Strong Recommendation] **Capture context** whenever the information can't be recovered from the code itself. The invisible constraints a comment preserves are precisely the ones a future maintainer will trip over and violate without it. The cost is real — the comment has to be deleted or updated the moment the constraint changes — but it's a cost worth paying.

**Restate mechanics** has no upside at all for a competent reader, and one very concrete downside: it goes wrong the instant the code changes. `// increment index by 1` sitting above `index++` contributes nothing today and won't get updated the day the index step becomes 2.

**No comment** is very often the correct answer. Well-named functions and expressive types say more than prose ever could, and they don't carry the maintenance debt prose does.

**The categories of comments that earn their cost:**
- A hidden constraint from outside the codebase: *why* a specific ordering is required, *why* a sleep is intentional, *why* a branch handles a case that looks impossible
- A workaround for a specific external bug: version, ticket reference, what breaks if removed
- A lock-ordering rule that the type system cannot express
- A non-obvious invariant the surrounding code depends on but doesn't enforce

**Common failure modes:** *The Stale Lie.* An engineer writes a comment carefully explaining exactly what a complex block of code does. Six months later, a bug fix alters the behavior underneath it. The engineer updates the code and never looks at the comment again. The next maintainer reads the comment, trusts it completely, and burns days debugging a reality that flatly contradicts the prose sitting right above it. A stale comment isn't neutral. It's active misdirection wearing the costume of documentation.

**Example:** The Linux kernel enforces this discipline explicitly, in writing. Kernel developers are told not to explain what or how the code operates — full stop. Inline comments are reserved for what can't be deduced from the C alone: memory barrier requirements, processor errata workarounds, hardware timing constraints, lock-ordering rules that exist because of one specific race condition documented somewhere else entirely. The comments explain the physical universe the code has to operate in, not the code.

---

### Treat Every Comment as a Maintenance Liability

**What it is:** A comment is not free. It is a second description of the system that must evolve alongside the first one — the code — with no compiler to check that it has.

**Why it exists:** Software evolves. Comments, left to their own devices, frequently don't. Unlike the implementation, a comment that no longer matches the code triggers no warning, no test failure, no compile error — nothing. It just quietly misleads every future reader unlucky enough to run into it.

**Comment rot** is the name for this failure: a comment that no longer matches the code underneath it. It's strictly worse than having no comment at all. A reader with no comment has to reason from the code directly; a reader with a stale one reasons from a wrong model, and may never even discover the two have diverged.

**When to choose each option:**

[Consensus] Keep comments minimal. Write one only when the benefit clearly outweighs the ongoing cost of maintaining it. The comment that prevents a regression earns its place. The comment that just restates the function name doesn't. Once a comment stops carrying any unique information, deleting it beats updating it — the surviving population of comments should be ones a reader can actually trust.

**Common failure modes:** A production incident drags on for hours longer than it should have, because a comment in the code described caching behavior that got changed two years earlier and nobody touched the comment. Every engineer who reads it assumes it's current. The real behavior is the exact opposite. The misleading comment turns out more dangerous than silence would've been — silence, at least, would've forced everyone to go read the actual code.

---

### Extract Code Before Adding a Comment

**What it is:** When the urge to write a comment comes from a block of code that needs explanation, the correct first question is whether the block should become a well-named function instead.

**Why it exists:** A comment describes behavior in prose that lives entirely outside the executable path. A function name *becomes* the behavior's description at every call site, and the compiler enforces it whether anyone's paying attention or not. As [Ch 28](ch28-naming-conventions-and-when-they-matter.md) established, naming is a native abstraction; commenting never was. When intent can be expressed directly in the structure of the code, that expression outlasts any prose that would've drifted eventually anyway.

**Options:**

1. **Extract to function** — move the block into a function whose name is the description the comment would have carried.
2. **Comment the block** — leave the code inline and add prose above it.

**Trade-offs:**

[Strong Recommendation] **Extract to function** whenever the comment would just explain *what* the block does. The function name kills the comment's maintenance burden entirely — the compiler enforces the name from here on. The block also becomes independently testable as a bonus.

**Comment the block** only when extraction would genuinely hurt performance or conceptual cohesion — a tight mathematical kernel where splitting things across function-call boundaries would either introduce unacceptable overhead or scatter an algorithm across pieces that only make sense read together.

**Common failure modes:** *The Header Comment Monolith.* A 300-line function gets visually carved into sections:

```
// --- FETCH DATA ---
// --- PARSE DATA ---
// --- SAVE DATA ---
```

Each section header is a function that never got built. The comments are doing the organizational work function extraction was designed for — badly, in a way that doesn't compose, doesn't test independently, and will drift from the code sitting right beneath it.

**Example:** In the Clean Code tradition, a comment explaining a block is treated as a code smell pointing straight at a missed extraction. The conditional `if (employee.flags & HOURLY_FLAG && employee.age > 65)` practically demands a comment. Extract it to `if (employee.isEligibleForPension())` instead, and the comment disappears, the intent reads clearly right at the call site, and the eligibility rule now has a name the entire codebase can reference going forward.

---

### Distinguish Implementation Comments from API Documentation

**What it is:** Implementation comments and API documentation comments are written for different audiences and carry different obligations. Treating them as the same category produces documentation that serves neither audience well.

**Why it exists:** A maintainer reading the function body needs to understand *why* some internal decision got made. A caller using a public interface needs to understand *what* the contract actually is — inputs, outputs, side effects, failure modes — without ever reading the implementation at all. Conflate the two and you get docstrings that leak internal details straight to callers, and inline comments carrying contract information that IDE tooling has no way to surface.

**Options:**

1. **Implementation comments** — inline, inside the function body, aimed at the next person who modifies the code.
2. **API documentation comments (docstrings)** — attached to public declarations, parsed by tooling to generate IDE tooltips and documentation sites, aimed at the next person who *calls* the code.

**Trade-offs:**

[Strong Recommendation] **API documentation comments are part of the interface contract**, full stop — not optional commentary somebody could skip. A public function with no docstring forces every caller to go read the implementation just to use it. A docstring that leaks internal implementation details couples callers to decisions that were supposed to stay private — change the internal mechanism, and the public contract changes right along with it, even though nothing externally visible actually moved.

**Common failure modes:** *The Leaky Docstring.* A developer documents a public interface with internal details baked in: `"""Fetches the user by scanning the Redis cache array."""` The cache moves from Redis to Memcached, the docstring is now flatly wrong, and every caller who built a mental model on top of it is holding a broken one. The docstring should have said *what* the function does for the caller — never *how* it happens to do it this week.

**Example:** Python's PEP 257 codifies this distinction structurally, not just by convention. An inline comment using `#` gets discarded by the parser entirely. A docstring using `"""..."""` sitting right below a declaration is not discarded — it becomes the `__doc__` attribute on the function or class object at runtime, reachable by IDE tools, `help()`, and documentation generators alike. Python makes these two categories physically different artifacts because their obligations were never the same to begin with.

---

### Why Smart Engineers Disagree: The Self-Documenting Code Absolutists

A persistent position in software engineering holds that any comment at all is a failure of expressiveness. If the code needs a comment, the argument goes, the names are wrong, the functions are too long, or the abstractions are bad. Some teams turn this into an outright policy: no comments in the repository, ever.

The position is right about what-comments. A comment that restates what the next line does was always avoidable. Eliminate it — not with better commenting, with better code.

The position falls apart against external constraints. A bug in a third-party API doesn't document itself. A workaround for a race condition in a deprecated network switch can't be expressed through clever variable naming, no matter how clever. A memory barrier that has to execute before a specific store, because of a processor erratum written up in some hardware manual, can't be inferred from the surrounding C no matter how carefully you read it. Banning comments in these cases doesn't clean up the code — it erases the system's institutional memory and calls it discipline.

The pragmatic position: write code structurally clear enough that every mechanical comment becomes unnecessary on its own. Save comments for what the compiler genuinely can't see — the external constraints, the invisible invariants, the decisions that would look wrong without context and obviously right with it. That surviving population of comments should stay small, should be trusted without a second thought, and should get pruned the moment the constraint it documents stops applying.
