# Chapter 5 — Designing for Change

**Prerequisites:** [Ch 02 — Complexity Is the Enemy](ch02-complexity-is-the-enemy.md), [Ch 03 — Coupling and Cohesion](ch03-coupling-and-cohesion.md), [Ch 04 — Abstraction and Information Hiding](ch04-abstraction-and-information-hiding.md). Specifically: accidental complexity, afferent coupling, and information hiding as a tool for isolating volatile decisions.

**New vocabulary introduced:** Open/Closed Principle (OCP), axis of variation, future-proofing

**Key takeaways:**
- Most systems fail not because they were badly designed, but because they made the wrong things hard to change. Designing for change is constraint selection: deciding which dimensions of a system are allowed to move and which are explicitly locked.
- Stability and flexibility are not opposites to balance uniformly — they are orthogonal concerns to assign deliberately. The standard shape is a rigid interface over a fluid implementation: freeze the contract, let everything behind it churn.
- The Open/Closed Principle is a useful lens for managing regression risk, not a mandate for indirection everywhere. Applied where change is genuinely additive, it isolates risk. Applied where requirements actually contradict prior rules, it adds abstraction with no benefit.
- Designing for change means identifying specific, known axes of variation and making those cheap. Future-proofing means paying complexity now for unnamed, speculative requirements that may never arrive. The first is a targeted bet; the second is usually a tax with no return.

## For My Wife

**The argument this chapter makes is narrow but important: know which direction your system is actually likely to move, and make that specific movement cheap. Everything else can stay simple.** This sounds obvious and is almost never done. Most engineers either treat everything as equally flexible (adding machinery to handle changes that never arrive) or treat nothing as flexible (and then spend two weeks on a change that should have been an afternoon).

**Future-proofing and designing for change sound like the same thing but aren't.** Future-proofing is buying a house with twelve bedrooms because you might want eleven kids someday. Designing for change is buying a house where the walls that aren't load-bearing are easy to move, because you've thought about how your family is actually likely to grow. One is a bet on a named, probable direction. The other is expensive optionality for an imagined future.

The structural principle the chapter argues for: freeze the contract, let everything behind it churn freely. The part of a system that other parts depend on should stay as stable as possible. The implementation behind that stable interface can be completely rewritten without anyone else needing to know. This is how Git added twenty years of new features on top of the same core data format — the contract didn't move; everything else was free to.

## For My Kids

**At the start of the year, you know one thing for sure about your locker: gym clothes are going to pile up.** Gym meets three times a week, and that stuff has to go somewhere.

So you clear one whole shelf just for it, with an extra hook for a bag if it overflows some week. That's the one part of your locker you actually built to flex.

**What you don't do is build in fourteen speculative compartments** for a trombone you don't play, cleats for a sport you might join in March, and textbooks for an elective you never signed up for.

Most of that space sits empty all year. Every morning you're digging past shelves you never use to reach the two things you actually need.

The kid who guessed right about gym clothes has a locker that keeps working all year, no matter how packed it gets.

The kid who tried to prepare for every hypothetical has a locker jammed with dead space — and still doesn't have room for the binder that actually showed up in November. It rides around loose in the bottom of a backpack all year instead, getting more crumpled every week.

---

## Purpose

A system that can't change is obsolete the moment it ships. A system where everything can change at once is never actually stable — it's just collapsing slowly, one modification at a time, each one a coin flip on which dependent it takes down. This chapter is the deliberate line drawn between the two: what stays fixed, and what gets to evolve cheaply.

This is not future-proofing, and the difference matters. Future-proofing guesses at requirements nobody's named yet and pays the complexity bill today for a benefit that may never show up. Designing for change is the narrower, more disciplined version of that same impulse: name the one axis this system is actually likely to move along, and make that specific movement cheap. Everything else gets to stay simple — even if that means it's harder to change later — because most of "everything else" was never going to need changing at all.

---

## What Should Be Stable vs. What Should Be Flexible

**What it is:** Designing a system is mostly deciding what not to let move. Interfaces, contracts, data shapes — these should hold still. Implementations, algorithms, internal data structures — these should be free to churn constantly. Get the boundary right and the interior can be torn apart and rebuilt without anyone outside ever noticing.

**Why it exists:** Change a core component's contract and every component with high afferent coupling to it (Ch 03) has to change too, all at once, in a coordinated scramble nobody scheduled on purpose. Stabilize the boundary instead, and that same coordination problem shrinks down to a local one: one team rewrites the interior on their own clock, and nobody else needs to be told.

**Options:**
1. **Rigid interface, fluid implementation** — the public contract is frozen; algorithms, data structures, and dependencies behind it can be rewritten entirely
2. **Fluid interface, rigid implementation** — the external contract evolves rapidly to match immediate needs, while the execution engine behind it stays a static monolith
3. **Everything stable / everything flexible** — the two degenerate cases, useful only as a reminder that neither extreme is viable at scale

**Trade-offs:**

| Profile | Protects | Costs |
|---|---|---|
| Rigid interface / fluid implementation | Downstream consumers; ecosystem trust | Locks the system out of changes that genuinely require a new contract shape |
| Fluid interface / rigid implementation | Rapid alignment with immediate caller needs | Breaks every consumer on each change; forces lockstep deployment |
| Everything stable | Predictability | Resistant to evolution the business actually needs |
| Everything flexible | Nothing, durably | Degrades into unpredictability and hidden coupling as nothing can be relied upon |

**When to choose each:**
- *Rigid interface / fluid implementation:* public APIs, operating system abstractions, foundational databases, anything with high afferent coupling.
- *Fluid interface / rigid implementation:* internal data-transformation layers, rapid prototypes, edge components with zero afferent dependents.
- *Fully flexible:* prototypes and experimental systems where the correct shape isn't known yet — this is a starting state, not a destination.

**Common failure modes:**
- **The "God Interface":** someone tries to stabilize a boundary, but the interface never actually captured a stable domain concept in the first place — it's a dumping ground of unrelated methods that has to change weekly anyway, breaking every downstream consumer while still technically wearing the costume of a contract.
- Locking in an API shape before anyone understands the domain, then discovering there's no way to evolve it later without breaking every client who trusted it.
- Over-stabilizing internal logic that never needed to be rigid, which just quietly taxes every ordinary feature request from here on out.

**Example:** The Linux kernel treats the syscall ABI as a rigid interface with almost religious discipline. Linus Torvalds's rule for it isn't diplomatic: "Never break user space." Everything behind that boundary — data structures, the scheduler, memory management — gets rewritten constantly, whole subsystems replaced more than once. And yet a binary compiled for Linux in 1998 will, with very few exceptions, still run today. That stability was never an accident of the kernel moving slowly. It's a deliberate trade that bought the kernel team total freedom to gut everything behind the line, because they never move the line itself. **[Strong Recommendation: when a component has high afferent coupling, stabilize the contract explicitly and treat that decision as a commitment, not a default]**

---

## The Open/Closed Principle — Useful but Incomplete

**What it is:** Software should be open for extension but closed for modification — new behavior arrives as new code, not as an edit to code that was already tested and already trusted. Treat this as a pragmatic lens for regression risk. It is not a law that applies the same way everywhere, whatever the name suggests.

**Why it exists:** Editing heavily tested, production-hardened code is genuinely risky — you're re-rolling the dice on everything that code already proved it could do correctly. Adding new code instead — a plugin, a fresh implementation of an existing interface — keeps the risk of the new feature from ever touching the stability the old ones already earned.

**Options:**
1. **Strict OCP** — behavior is altered exclusively through new classes/modules conforming to existing interfaces (plugins, dependency injection, polymorphism)
2. **Partial OCP** — a stable core with a small number of deliberate, controlled extension points
3. **Pragmatic modification** — directly editing existing code, including its conditional logic, to accommodate new rules

**Trade-offs:**
- *Strict OCP:* never breaks existing test suites and is safe to deploy incrementally, but introduces real indirection cost — following execution flow means jumping through interfaces and factories, and that cost is paid by every future reader, not just the one who built the extension point.
- *Partial OCP:* balances flexibility and simplicity, but only works if the extension points were drawn in the right place — drawing them in the wrong place is itself a form of premature abstraction (Ch 04).
- *Pragmatic modification:* keeps code volume low and the execution path obvious, but risks regressions in shared logic and invalidates the safety the principle was meant to provide.

**When to choose each:**
- *Strict OCP:* frameworks, plugin systems, and infrastructural libraries where the axis of change is strictly additive — a new serializer, a new payment provider, a new SQL dialect.
- *Partial OCP:* most backend services and database-adjacent code, where a stable core needs a small number of well-understood extension points.
- *Pragmatic modification:* core business logic, where new requirements frequently contradict or replace old rules rather than extending them — additive extension is not possible when the new rule and the old rule cannot coexist.

**Common failure modes:**
- **Premature extension hooks:** an engineer builds out a whole plugin architecture and a stack of abstract interfaces for use cases that don't exist yet. When the real requirement finally shows up, the system is too tangled to modify — which is precisely the failure OCP was supposed to prevent, achieved by applying OCP too early.
- An over-engineered plugin system that, years later, still has exactly one plugin.
- Deep inheritance hierarchies nobody can reason about under real change pressure, because OCP got applied by default instead of by decision.

**Example:** PostgreSQL's wire protocol is about as closed for modification as software gets — its binary layout has held stable across decades of major versions, and every driver in the ecosystem is quietly relying on that. The engine underneath it is the opposite story: PostGIS bolts on an entire geospatial type system and indexing strategy without touching a line of PostgreSQL's core source. Closed protocol, open engine — two different boundaries in the same system, stabilized for two entirely different reasons. **[Consensus: apply OCP where the axis of change is additive; abandon it where new requirements genuinely contradict old ones, and modify the code directly]**

---

## Designing for Change vs. Future-Proofing

**What it is:** Designing for change means naming a known, specific axis of variation and making movement along that one axis cheap. Future-proofing means guessing at requirements nobody's named yet and building generality now to absorb whatever might show up. One is grounded in variability you've actually observed or committed to. The other is a bet against the unknown, dressed up as diligence.

**Why it exists:** Business requirements don't drift randomly — an engineer's actual job is predicting *how* a specific, known domain is going to move. Predicting *whether* some entirely unrelated domain is even going to exist yet is just guessing, and a wrong guess here has a specific, ugly cost: the complexity gets paid immediately, in full, and the benefit it was supposedly buying may simply never arrive to collect against it.

**Options:**
1. **Axis-based (targeted) design** — explicit variability points for a named, specific dimension of change
2. **General-purpose design** — broad, abstract interfaces meant to absorb any future requirement
3. **Minimal design** — no anticipation of change at all; pay the refactor cost later if and when change actually arrives

**Trade-offs:**
- *Axis-based design:* reduces change cost for the variation it targets, but provides no benefit for variation it didn't anticipate — and that's an acceptable trade, because most unanticipated variation never happens.
- *General-purpose design:* offers theoretical flexibility for anything, but the accidental complexity is paid immediately and continuously, by every engineer who has to pick their way through generic, parameterized code paths to do ordinary work.
- *Minimal design:* fastest initially, defers all change cost to whenever change actually arrives — which is often cheaper than it looks, because real change rarely matches what speculative generality guessed.

**When to choose each:**
- *Axis-based:* when historical data or an explicit, funded business strategy names the dimension — multiple authentication providers, multiple tax jurisdictions for a company actively expanding internationally.
- *General-purpose:* rare; justified mainly in foundational libraries and platforms meant to be consumed by unknown future callers.
- *Minimal:* early-stage systems and experimental products, where the cost of guessing wrong about the axis exceeds the cost of refactoring later.

**Common failure modes:**
- **The EAV (Entity-Attribute-Value) anti-pattern:** someone "future-proofs" a relational schema into a generic `(entity_id, attribute_name, attribute_value)` table so the team can supposedly "never run a migration again." It wrecks indexing, wrecks query planning, wrecks relational integrity, and the system falls over under read load a normal schema would never have noticed.
- A system engineered to support "multiple database backends" that has run on PostgreSQL exclusively since day one, quietly paying the tax of a repository-pattern indirection layer for a second backend that was never going to show up.
- Missing the axis that actually mattered — treating a storage backend or an auth provider as permanently fixed, right up until it genuinely needs to vary and nobody ever flagged it as a candidate.

**Example:** Linus Torvalds didn't future-proof Git with some generic, extensible database layer built to handle "whatever we might want to store later." He targeted exactly one need: identify and retrieve immutable trees of content, fast. What came out of that — a content-addressable object store of blobs, trees, and commits, hashed by content — has held mathematically stable for two decades. Because that single axis got identified correctly and stabilized hard, entirely new capabilities showed up later — rebasing, sparse checkouts, partial clones — all built cheaply on top, none of them ever requiring so much as a touch to the object model underneath. **[Consensus: if you cannot name the exact requirement an abstraction is for, you cannot justify its complexity cost yet]**

---

## Stable-Core Case Studies

Three systems, three layers, same underlying discipline: find the one thing worth stabilizing, stabilize it correctly, and let everything else move as fast as it needs to.

**Git's content-addressable storage:** stable is object identity, content-hash addressing, the immutability of what's stored, and the basic shape of the commit graph. Flexible is ref management, transfer protocols, and every feature built on top at the UI layer. The complexity that would otherwise be sitting in the core instead lives up in the higher layers — indexing, refs, plumbing commands — which happens to be exactly where it's cheapest to change.

**The Linux syscall ABI:** stable is syscall numbers, their signatures, and the behavioral contract they promise. Flexible is the scheduler, memory management, and every hardware-specific implementation sitting behind them. This stability isn't free — the kernel is dragging decades of legacy behavior it can't remove, and that's a real, ongoing complexity tax. It's a trade made on purpose, in exchange for an ecosystem that can trust the interface without reservation.

**PostgreSQL's wire protocol:** stable is the query/response structure, the authentication handshake, basic session semantics. Flexible is the query planner, the storage engine, the indexing strategy — which is how major performance work has shipped for decades without a single driver needing a rewrite. The failure mode that keeps recurring here is conflating protocol stability with implementation stability: a client leaning on undocumented response behavior can still break across versions, even while the documented contract never moved an inch.

All three pick a contract, freeze it, and set the implementation loose. None of them try to freeze everything. None of them leave everything loose, either.

---

## Why Smart Engineers Disagree

The fight that never really ends in this chapter is about *when* to freeze an interface, and it runs along the same fault line as Ch 04's abstraction-altitude disagreement.

Product engineers optimizing for feature velocity and team autonomy resist freezing anything early. Lock an interface before you understand the domain, they'll tell you, and you've just solidified your own ignorance into architecture — better to let API shapes, payloads, and schemas keep moving until the product itself stops moving.

Platform and systems engineers optimizing for ecosystem scale and reliability push the opposite way, hard. They've seen what happens when an interface shifts: the person who shifted it doesn't pay for it. Every downstream team that trusted it does, dropping whatever they were doing to fix an integration that broke without warning.

Both sides are managing a real risk, and both fail badly at the extreme. Freeze too early and you've locked in a guess as if it were a fact. Freeze too late and you've burned the trust that made anyone willing to depend on you in the first place. What mature systems actually converge on isn't a compromise between the two — it's a sequence: stay fluid while the real use cases are still getting discovered, then deliberately flip the boundary from fluid to rigid once they are, and never look back. Git, Linux, and PostgreSQL all made exactly that flip once, on purpose — none of them treated "stable" as a birthright from day one.

*Concepts expanded in later chapters: API versioning strategies (Part II, Ch 16), branching strategies (Part VII, Ch 50), Architecture Decision Records (Part VI, Ch 45).*
