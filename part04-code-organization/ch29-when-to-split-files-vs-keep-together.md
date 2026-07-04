# Ch 29 — When to Split Files vs. Keep Together

*Split on falling cohesion, never on rising line count.*

A file is a unit of comprehension, not a unit of syntax — the question was never how many declarations fit inside it, but whether they actually belong together. The signal to split is a reader thinking "this part is about something else"; the signal to keep together is the pieces losing their meaning the moment they're apart. A thousand-line parser implementing one algorithm can be easier to read than a two-hundred-line file mixing unrelated concerns, because cohesion, not length, is what determines readability. Test and asset co-location follow the same reasoning: keep with the source whatever gets understood and changed alongside it.

**Prerequisites:** [Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md) (specifically: the Rule of Three), [File and Module Structure](ch27-file-and-module-structure.md)

**New vocabulary introduced:** None beyond concepts established in prior chapters. This chapter applies [cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md) and the [Rule of Three](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md) at the smallest practical grain.

**Key takeaways:**
- A file is a unit of comprehension, not a unit of syntax. The question was never how many declarations fit inside it — it's whether they actually belong together.
- Split on falling cohesion, not rising line count. A thousand-line parser implementing one algorithm can be easier to read than a two-hundred-line file that mixes authentication, logging, and business rules with no relation to each other.
- The signal to split is a reader naturally thinking "this part is about something else." The signal to keep together is the pieces losing their meaning the moment they're apart.
- A state machine with its transitions scattered across six files is harder to understand than one sitting in a single cohesive file — even a genuinely long one.
- Test and asset co-location follows the exact same cohesion reasoning: keep with the source whatever gets understood and changed alongside it.

## For My Wife

**Picture packing boxes for a move.** You could give every single object its own box — one for the lamp, one for each book — which makes any one item trivial to find later but leaves you hauling forty boxes out of one small room. Or you could pack by room instead: everything from the kitchen goes in together, however many boxes that ends up taking. This chapter's answer to when a programmer should split code into a new file follows the same logic, and the verdict is that boxes should be organized by what actually belongs together, not by how heavy the box has gotten. A box that's entirely kitchen items is fine no matter its size. A box holding kitchen stuff, bathroom stuff, and whatever was in the garage is a problem — not because it's heavy, but because opening it later means digging through unrelated things to find anything.

**The real signal to split isn't length — it's whether the box has stopped being about one thing.** A long piece of code that's genuinely doing one job, like a parser working through one grammar, is often easier to follow than a short file secretly juggling three unrelated jobs at once, because the long one is still telling one coherent story start to finish.

**The same logic covers when not to split something that only makes sense as a whole.** A board game's rules work because the rule for how a piece moves sits right next to the rule for what happens when it lands somewhere. Spread those across three separate pamphlets and nothing got simpler — someone just has to flip between three books to understand a single move.

## For My Kids

Say you're sorting a huge tub of Legos. You don't decide what goes in which bin by how many pieces fit — you decide by which build the pieces actually belong to.

An 800-piece castle set can all live in one big bin together, no problem, because every piece is part of the same one thing.

But a random leftover pile — ten pieces from a spaceship, six from a race car, four from something you don't even remember building — shouldn't get dumped into one bin just because ten-plus-six-plus-four is a small, tidy number.

**The size was never the actual question.** A giant bin that's entirely one castle is easy, because you already know what you're looking at the second you open it.

A small bin holding five unrelated leftovers is the annoying one, because opening it means digging through pieces that have nothing to do with each other, trying to remember which ones you even still need.

**The real signal to split things apart is "this piece is about something else,"** not "this bin got kind of full."

And the real signal to leave things together is the opposite: pieces that only make sense as part of the same build, no matter how many of them there are.

Sort by size instead of by build, and you'll spend more time next spring untangling five unrelated projects than you ever would have spent just building the castle.

---

[Ch 27](ch27-file-and-module-structure.md) settled package- and module-level organization. This chapter takes that boundary as given and asks a finer-grained question: within a module, should this concept get its own file, or live alongside the code it's closely related to? Whether splitting a file introduces a new abstraction boundary worth paying for is a separate question, covered in [Ch 31](ch31-when-abstractions-help-vs-when-they-obscure.md).

---

### One Entity Per File or One Concept Per File?

**What it is:** The baseline convention for how source code is distributed across files — whether a file is an exact index of individual types, or a container for one cohesive concept that may span several closely related types and functions.

**Why it exists:** Files exist purely to help humans find their way around a codebase. The convention just decides what the file system ends up indexing — individual named entities, or whole ideas.

**Options:**

1. **One class per file** — each type, struct, or interface gets its own dedicated file, named after the entity it contains.
2. **One concept per file** — a file contains whatever declarations are needed to understand one cohesive idea: the primary type, its small supporting types, helper functions, and internal constants.

**Trade-offs:**

**One class per file** makes finding any specific entity trivial through file-tree navigation alone — you know exactly which file to open. The cost is reading flow. A small helper type that only ever gets consumed by one parent class has no identity of its own, but isolating it into its own file still forces the reader to open a second file just to understand one operation. Java's enforcement of this convention — one public class per file, no exceptions — produces directories cluttered with `UserActionFactory.java`, `UserActionBuilder.java`, `UserActionBuilderFactory.java`: dozens of files for what was a simple workflow, and a real navigation tax on logic that was never that deep to begin with.

[Strong Recommendation] **One concept per file** is the dominant convention in Go, Python, and JavaScript/TypeScript, and it earns that position. It preserves reading flow: a developer follows the entire lifecycle of a domain concept by scrolling, not tab-switching between five windows. An interface, the struct implementing it, and the small helper types it leans on all share one file, naturally. The risk is the god file — the one real failure mode of this approach, where the "concept" boundary softens over time and unrelated logic just keeps piling in.

**When to choose each:** Follow the idiomatic convention for the language. Java enforces one public class per file at the language level; respect it. In Go, Python, and JavaScript, prefer conceptual co-location for small, tightly related declarations that have no distinct identity outside their immediate context. Large public types with independent public APIs earn their own files in any language.

**Common failure modes:** Mechanically minting a new file for every enum, exception, helper type, or small interface that comes along. A feature that should take ten minutes to understand now demands opening fifteen files first. The organizational rule has driven up navigation cost and clarified exactly nothing. The opposite failure shows up just as often: unrelated types keep accumulating indefinitely, purely because "well, they're already in the same file."

---

### Split on Falling Cohesion, Not Rising Line Count

**What it is:** The signal that a file should be split is that it contains multiple independent concerns — not that it exceeds an arbitrary line threshold.

**Why it exists:** Length by itself rarely makes code hard to follow. Unrelated ideas jammed together do. A thousand-line parser implementing one cohesive algorithm is easier to read than a two-hundred-line file mixing authentication, logging, configuration, and business rules. What makes the second one hard isn't the size — it's that no single organizing idea is holding any of it together.

**Options:**

1. **Responsibility-driven splitting** — split when a file visibly contains multiple concerns with low cohesion between them.
2. **Threshold-based splitting** — split when the file crosses a line count or declaration count limit.
3. **Keep together** — maintain cohesive code in one file regardless of growth.

**Trade-offs:**

[Strong Recommendation] **Responsibility-driven splitting** reflects what actually makes files hard to maintain, instead of a proxy for it. The Rule of Three applies here exactly the way it applies to abstraction: wait until multiple independent responsibilities have genuinely emerged before paying the organizational overhead of a new file. Split too early and you're betting on an evolution that often never shows up, leaving behind a graveyard of ten-line files that don't carry enough context to stand on their own.

**Threshold-based splitting** is easy to automate and easy to enforce in code review, which explains why it's tempting. It's still wrong. It treats line count as a stand-in for cohesion, and the stand-in fails in both directions at once: a long cohesive file gets chopped up for no reason, while a short incoherent one sails right through the check.

**When to split:** When touching one responsibility in the file consistently means ignoring everything else in it. When a reader has to reach for text search just to jump between two related functions separated by hundreds of lines of unrelated code. When the file holds pieces that visibly change at different rates for entirely different reasons.

**When to keep together:** When the code shares one single axis of variation. When splitting would force a reader to chase execution across multiple files just to understand one operation.

**Common failure modes:** A growing file crosses 500 lines. Instead of finding the actual conceptual boundary, a developer carves it into `billing_part1.py`, `billing_part2.py`, and `billing_helpers.py`. The original cohesion problem hasn't gone anywhere — the navigation problem just got worse on top of it. The split communicated nothing about what actually changed.

**Example:** An `auth_middleware.go` file that intercepts an HTTP request, validates a JWT, and returns a `401 Unauthorized` should stay in one file — those three steps are one cohesive operation, start to finish. If that same file starts accumulating a custom base64 decoding algorithm and an RSA key-rotation cron job, those belong in `jwt_decoder.go` and `key_rotation.go` instead. They're independent axes of variation: different reasons to change, different timelines, different requirements driving each one.

---

### Keep Tightly Coupled Pieces Together

**What it is:** Some code loses meaning when separated. Small mutually dependent types, finite state machines, and tightly coordinated internal logic are often harder to understand distributed across files than collected in one.

**Why it exists:** Navigation isn't free. Every additional file is one more place a reader has to go searching. When two pieces of code are almost always read together — because understanding one demands knowing the other — pulling them apart adds indirection and buys nothing back in clarity.

**Signals that pieces belong together:**
- Understanding a state transition requires reading the state definition, the event types, and the transition logic simultaneously
- A small type has no meaningful identity outside the one file that uses it
- Splitting would require importing from sibling files within the same module rather than from the module interface

**Common failure modes:** An engineer enforces a 100-line file limit with total dogma. A cohesive 300-line state machine gets shattered across six files. Understanding one single transition now means opening six tabs and tracing imports back and forth between them. The fragmented state machine ends up with higher afferent and efferent coupling at the file level than the original monolith ever had — the exact opposite of what the split was supposed to buy.

**Example:** Many parser implementations keep token definitions, parser state, and transition logic in one file, because the three concepts are genuinely inseparable during maintenance. Reading a grammar rule means seeing the token type, the parser state it shows up in, and the transition it triggers, all at once. Spread those across files and the reader has to reconstruct in their head what the file structure used to just show them.

---

### Test and Asset Co-Location

The same cohesion reasoning governing source file organization applies just as well to tests and related assets. A test file exists to verify the contract of one source file; a stylesheet or template exists to define the visual behavior of one component. Where they live is the same question as where closely related source types live — no different question, same answer.

Two conventions exist:

1. **Adjacent co-location** — the test and source live in the same directory: `billing.go` and `billing_test.go`, `Button.tsx` and `Button.test.tsx`.
2. **Parallel tree** — a separate root directory mirrors the source structure: `src/billing/service.java` and `test/billing/ServiceTest.java`.

Modern frontend frameworks have largely converged on adjacent co-location as a deliberate, cohesion-first choice. A React component folder holding `Button.tsx`, `Button.css`, and `Button.test.tsx` keeps the entire concept of a button in one place. The older layered convention — all components in `components/`, all styles in `styles/`, all tests in `tests/` — is package-by-layer wearing a different outfit: organized by artifact type rather than by whatever actually changes together.

The primary failure mode of parallel trees is the orphaned test: a developer refactors `src/`, renames a batch of files, and forgets to make the same structural changes in `test/`. The tests drift out of sync with the code they're supposed to verify, and nobody notices the mismatch until a test is actually needed and isn't there.

Testing strategy itself is covered in Part V. The placement question here is a cohesion question, not a test-design question, and the answer stays the same either way: keep together whatever gets understood and changed together.

---

### Why Smart Engineers Disagree: Scrolling vs. Tab-Switching

The file granularity debate usually gets framed as a preference argument. It isn't. It's a disagreement about which cognitive tax actually scales worse.

Engineers who prefer small files argue that any file over 200 lines is already a smell — small files enforce the Single Responsibility Principle, and scrolling, to them, is the visible symptom of an overgrown monolith. Engineers who prefer larger files argue that tab-switching is what actually shatters context. Every time a developer opens a new file just to find a helper function's definition, they risk losing the thread of the operation they were tracing in the first place.

Both taxes are real. They just don't scale the same way. The cost of scrolling through a cohesive file is roughly linear — more content, more scrolling, nothing exotic. The cost of tab-switching is closer to exponential: every new file is a context switch that risks a cache miss in the developer's working memory, and the execution path has to be rebuilt from scratch after every single switch.

The deciding factor was never the raw line count. It's the density of cohesion. A 1,500-line file implementing one cohesive protocol parser looks worse on paper than it reads in practice, and it's still easier to understand than ten 150-line files would be. If scrolling through a file feels like rummaging through a junk drawer — if the next section is always about something completely different — the file lacks cohesion and deserves to be split. If scrolling feels like following one continuous narrative, the file is doing its job correctly, whatever its length happens to be.
