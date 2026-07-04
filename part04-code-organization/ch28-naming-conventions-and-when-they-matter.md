# Ch 28 — Naming Conventions and When They Matter

**Prerequisites:** [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Coupling and Cohesion at the Architecture Level](../part02-software-architecture/ch13-coupling-cohesion-architecture-level.md) (specifically: ubiquitous language and bounded context vocabulary), [File and Module Structure](ch27-file-and-module-structure.md)

**New vocabulary introduced:** ubiquitous language, Hungarian notation, semantic predicate naming

**Key takeaways:**
- Naming is the cheapest form of information hiding there is: a good name communicates intent for free, with no extra indirection, no extra layer, no runtime cost whatsoever.
- Names should come from the problem domain before they come from the implementation — matching the ubiquitous language the business already speaks, not the one the codebase invented.
- Hungarian notation earned its keep in untyped C environments; in any modern statically or gradually typed language it just duplicates what the compiler already knows, and then lies the moment a type changes.
- Predicate prefixes (`is`, `has`, `can`) are one of the rare naming conventions that carry genuine disambiguating value — they tell a boolean apart from an object without encoding a single byte of memory layout.
- `camelCase` vs. `snake_case` is a style choice, not a correctness choice. It only matters for consistency, and consistency belongs to a linter, not a Slack thread.

## For My Wife

**Every name is a small promise about what something is, and the mistake this chapter tracks down is making that promise about how a thing happens to work right now instead of what it actually means.** Call a shared binder "the red one" and the name is accurate right up until someone switches to a blue one — at which point every note that says "check the red binder" is quietly lying. Call it "the invoices binder" instead, and it can change color, shelf, even format, forever, without the name ever needing to catch up. Code has the identical trap: name something after the database it's stored in today, or the slow way it currently searches for a match, and the moment that mechanism changes — a different database, a faster search — every place that name shows up is now describing something that no longer exists.

**Older programming languages made this worse by baking the data type directly into the name** — a variable literally called `strName`, so a programmer with no other way to check could tell at a glance that it held text. Modern tools show you the type automatically, the same way your phone's contacts already know a number is a phone number without you spelling that into the contact's name. Keeping the old habit anyway just adds one more thing that can quietly go stale and start lying.

**Nobody gets an alert when a name goes stale — it just sits there, technically wrong, until it costs something.** A variable called `intAge`, built to hold a whole number, gets quietly upgraded somewhere down the line to hold a decimal instead. The name never gets updated to match. A new engineer reads `intAge`, reasonably assumes whole numbers are safe, and writes math that chops off the decimal — and the resulting error doesn't announce itself, it just shows up wrong three steps downstream, in a number somebody eventually has to explain to a customer.

## For My Kids

Say your family has one car, and everyone just calls it "the blue car." Works great — until it gets a new paint job after some body work, and now "the blue car" is red. Anyone who still says "grab the blue car keys" is describing something that plain doesn't exist anymore, and a new babysitter hearing that for the first time would go looking for a car that isn't in the driveway.

**"Mom's car" never has this problem.** It doesn't care what color the car is, whether it got repainted, or even if it got swapped for a different car next year. The name was never about the paint — it was about whose car it is, and that part doesn't change just because the outside does.

**Nobody gets a warning when a name like "the blue car" goes stale.** It just quietly keeps getting said long after it stopped being true, and the first person who actually gets tripped up is whoever trusted it literally — standing in the driveway looking for a car that isn't there, while everyone else already knows what "blue car" really means and forgot that a stranger wouldn't.

---

Naming is the smallest unit of design there is. Before a reader ever understands an implementation, they run into the identifiers first — and a good name does enough work that reading the implementation afterward feels like confirmation, not discovery. This chapter separates the naming decisions that actually carry architectural weight from the ones that are pure style. The two get treated as equally important far more often than they deserve to be.

Comments as an alternative communication mechanism are covered in [Ch 30](ch30-comments-what-to-comment-what-not-to.md). Abstraction design — when a name attached to a new function is worth the added layer — is covered in [Ch 31](ch31-when-abstractions-help-vs-when-they-obscure.md).

---

### Name by Intent, Not Implementation

**What it is:** An identifier should describe what a thing *means*, not how it happens to be built.

**Why it exists:** Code gets read far more often than it gets written. A name that mirrors the implementation forces every single reader to reverse-engineer the business intent by hand. A name drawn from the domain instead matches the vocabulary the business already uses — the same ubiquitous language that defines a [bounded context](../part02-software-architecture/ch13-coupling-cohesion-architecture-level.md). Share vocabulary between code and domain, and engineers and domain experts get to talk about the same thing without a translator in the room.

**Options:**

1. **Domain-oriented names** — identifiers drawn from the problem space: `Order`, `Invoice`, `RetryPolicy`, `findEligibleCustomers()`.
2. **Implementation-oriented names** — identifiers describing mechanisms: `DataProcessor`, `Manager`, `Handler`, `iterateCustomerRecords()`, `fetchFromPostgres()`.
3. **Stale names** — identifiers that once described the implementation accurately and now don't: an `XmlParser` that now parses JSON, a `loadCache()` method that makes a remote network call.

**Trade-offs:**

[Consensus] **Domain-oriented names** hold up better over time because the business concept outlives whatever implementation happens to be in fashion this quarter. Switch from a list to a hash set, from PostgreSQL to Cassandra, from an HTTP call to a message queue — none of it changes what `activeUsers` means to a reader. The only cost is that the name demands understanding the domain, which the engineer was going to have to do anyway.

**Implementation-oriented names** are easy to invent and accurate on day one, but they weld the reader's mental model to whatever mechanism happens to exist right now. Change the mechanism and the name turns into a liability overnight. Classes named `Manager`, `Handler`, `Processor`, or `Engine` impose almost no semantic constraint at all, and reliably accumulate unrelated responsibilities precisely because the name never pushes back on anything.

**Stale names** are the degenerate case: the implementation moved on, the name stayed put, and every reader who trusts it gets quietly lied to.

**When to choose each:** Use domain vocabulary for anything representing a business concept. Reserve implementation-oriented names for the narrow infrastructure layer where the technical role genuinely is the domain — a `postgresDriver` variable inside a database connection pool, where the implementation itself is the point.

**Common failure modes:** An engineer names a variable `customerListArray`. Six months later the type changes to a `HashSet` to enforce uniqueness. Because the data structure got baked into the name, every single reference now needs renaming — a change that should've stayed local turns into a sprawling, risky pull request touching half the codebase. That's the refactoring ripple: the name coupled every call site to exactly the implementation detail it was supposed to be hiding.

**Example:** The Extreme Programming and Clean Code traditions built their whole naming philosophy around this. `findEligibleCustomers()` hides the search mechanism entirely; `iterateCustomerRecords()` gives away that a linear scan is happening underneath. The moment that scan becomes an index lookup, the second name is simply wrong. The first name doesn't even notice the change happened.

---

### Don't Encode Type Information in Names

**What it is:** The decision of whether to prefix or suffix an identifier with metadata about its type or memory layout.

**Why it exists:** Hungarian notation was born in the C-era Windows API (`lpszName` for "long pointer to a null-terminated string"), back when compilers offered zero type visibility and editors had never heard of autocomplete. Baking the type straight into the name was the only way a developer could tell, at a glance, what a given memory address actually held. That constraint hasn't existed in any modern language for decades.

**Options:**

1. **Systems Hungarian notation** — prefix the mechanical data type: `strName`, `iCount`, `pBuffer`, `lpData`, `IUserService` for an interface.
2. **Type-agnostic names** — rely entirely on the type system: `name`, `count`, `buffer`, `userService`.

**Trade-offs:**

[Consensus] In any modern statically or gradually typed language — Go, Rust, Java, C#, TypeScript, Kotlin, Swift — the compiler is already tracking the type for you. Putting it in the name too just duplicates information the toolchain already surfaces more reliably. And when the type changes, the name doesn't follow along on its own: `intAge` quietly becomes a float, `strName` becomes a rich object, `pUser` becomes a plain value. The name is now flatly lying. This is the liar variable — a convention that started out merely redundant and degraded, over time, into actively misleading.

Systems Hungarian solved a problem modern languages already solved at the language level. Carrying it forward at this point is just cargo-culting.

**Common failure modes:** A loosely typed codebase adopts Hungarian notation. An `intAge` field later gets updated to hold a floating-point value. Nobody renames it, because the cost feels high and the wrong name isn't breaking anything yet — not visibly, anyway. A new engineer reads `intAge`, assumes integer arithmetic is safe, and introduces a truncation bug that takes a while to surface.

**Example:** The Windows API prefixes (`lp`, `str`, `int`, `dw`) were genuinely necessary when that API was designed. C offered no way to inspect a type without reading the declaration, and early editors offered no help at all. That same notation in a Rust or TypeScript codebase today surfaces nothing the compiler doesn't already show you — and it costs accuracy every single time a type changes underneath it.

---

### Use Predicate Prefixes for Boolean Identifiers

**What it is:** The convention of prefixing boolean variables and boolean-returning functions with `is`, `has`, `can`, or `should`.

**Why it exists:** This is one of the rare naming conventions that actually carries disambiguating value instead of pure style. A boolean and an object can end up sharing the same domain name — `permission` could be a boolean flag or it could be a whole `Permission` object. The prefix kills the ambiguity without encoding a single detail of memory layout.

**Options:**

1. **Semantic predicate naming** — `isActive`, `hasPermission`, `canRetry`, `shouldPersist`.
2. **Type-agnostic naming** — `active`, `permission`, `retry`, `persist`.

**Trade-offs:**

[Strong Recommendation] Use predicate prefixes for booleans. They deliver on exactly what Hungarian notation promised and never actually gave you: semantic state, not memory layout. `isActive` tells the reader flat out that this is a binary condition, not an enum, not an object masquerading as one. And the prefix survives refactors — the boolean meaning stays put even when the underlying representation changes underneath it.

The difference between `if (ready)` and `if (isReady)` isn't stylistic hairsplitting. The second version tells the reader, unambiguously, that this is a boolean condition being tested — not an object being leaned on for its truthiness. In languages where objects are truthy by default, that distinction is the only thing standing between a correct read and a misread.

**Common failure modes:** Boolean variables named `enabled`, `permission`, or `valid` leave the reader guessing whether they're testing a flag or checking an object for truthiness. Buried in conditional logic, an ambiguous name demands context the reader has to go dig up, instead of just reading the line and moving on.

---

### Match Name Length to Scope

**What it is:** Identifier length should scale with how much context the surrounding code already provides.

**Why it exists:** A name's whole job is distinguishing one thing from everything else the reader might have in mind at that moment. Inside a three-line loop, almost nothing needs distinguishing. Across an entire package, a name has to carry real weight. A 30-character name jammed into a tight mathematical loop is visual noise burying the actual algorithm; a single-letter variable sitting at package scope is a collision that just hasn't happened yet.

**Options:**

1. **Scope-proportional naming** — short names (`i`, `err`, `db`) in small local scopes; longer descriptive names at broader visibility.
2. **Uniform verbosity** — fully descriptive identifiers everywhere regardless of scope.
3. **Aggressive abbreviation** — short names everywhere regardless of scope.

**Trade-offs:**

[Strong Recommendation] **Scope-proportional naming** is the right call. How much descriptive text a name needs to carry runs inversely to how obvious the meaning already is from context. `i` inside a three-line loop is perfectly clear. `i` as a package-level variable is a small disaster waiting to be discovered.

**Uniform verbosity** clutters up tight algorithmic code for no benefit. A loop variable named `currentArrayIndex` forces the reader to parse a full noun phrase on every single iteration instead of just following the arithmetic.

**Aggressive abbreviation** at broad scope produces the global abbreviation failure: one developer names a package-level variable `c` for `Client`. A second developer comes along and adds a `Cache`. Now the short name is ambiguous, and somebody has to go rename something that used to work fine.

**Common failure modes:** A developer picks one rule and applies it everywhere, no exceptions. Either every local variable becomes `currentIterationIndex` and every loop reads like it was drafted by a lawyer, or every exported function gets reduced to a cryptic two-letter abbreviation nobody can parse on sight. Both failures come from the same root mistake: treating scope as if it doesn't matter.

**Example:** Idiomatic Go uses `err` for local error checks, `i` for loop counters, `db` for a local database handle — deliberately short, because the scope is tight and the context is obvious to anyone reading it. At package scope, exported types and functions get fully descriptive names instead. This is a considered convention, not laziness; Go's own documentation spells out the reasoning. Java codebases typically lean toward verbosity even at local scope, which is a large part of why Java developers lean so heavily on IDE autocompletion just to write an ordinary loop. Neither approach is wrong. They're optimizing for different assumptions about how much context a reader is already carrying around in their head.

---

### Prefer a Better Name Over an Explanatory Comment

**What it is:** When a block of code requires a comment to explain what it does, the first question is whether extracting it into a well-named function eliminates the need for the comment entirely.

**Why it exists:** A comment describes behavior from the sidelines. A function name *becomes* the behavior's description, right there at every call site. A reader calling `recalculateCreditLimit()` doesn't need a comment telling them what's about to happen — the name already said it. Adding a comment on top is redundant, and redundant documentation rots the moment nobody's watching.

This connection is the starting point for a longer treatment in [Ch 30](ch30-comments-what-to-comment-what-not-to.md), which covers the full distinction between comments that explain *what* and comments that explain *why*.

**Common failure modes:** A long function accumulates inline section headers:

```
// Validate input
// Build request
// Retry failed operations
// Persist result
```

Each heading describes a logical operation that should have been a named function all along. The comments are the tell that the naming work never got done — and they'll drift the instant the code changes, where a function name would've been refactored right alongside it, automatically, with no extra effort from anybody.

---

### Why Smart Engineers Disagree: Style vs. Substance

The persistent engineering debates about naming are almost never actually about substance. `camelCase` vs. `snake_case`, `PascalCase` for types vs. interfaces — these are pure style calls. None of it carries correctness value, prevents a single bug, or hides any information whatsoever. The human brain adapts to any consistent formatting within a matter of days, and then never thinks about it again.

The only real failure mode hiding in casing choices is *inconsistency*. A codebase that arbitrarily mixes `camelCase` and `snake_case` forces every developer to memorize the convention on a per-function basis, adding cognitive load that never needed to exist in the first place. The right response is to pick the idiomatic convention for the language, enforce it with a linter starting day one, and close the debate permanently. The linter doesn't care which one you picked. It cares that you picked one.

The real disagreement among experienced engineers is about calibration: how much information should a name actually carry? One camp prefers long, fully explicit identifiers everywhere, on the theory that explicitness cuts down the chance of misreading. Another prefers concise names whenever the surrounding context already supplies what's missing, on the theory that excess length just buries the structure underneath it. Both camps want the exact same thing — code that's easy to read — and disagree only on how much of that job belongs to the name itself versus how much the reader's own context window is already carrying for free.
