# Chapter 12 — Dependency Direction and Inversion

**Prerequisites:** [Part I, Ch 02 — Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md), [Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Ch 04 — Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Part II, Ch 11 — Layered, Hexagonal, and Ports-and-Adapters Architecture](ch11-layered-hexagonal-ports-adapters.md). Specifically: afferent/efferent coupling, essential vs. accidental complexity, and the ports/adapters vocabulary.

**New vocabulary introduced:** Dependency Inversion Principle (DIP), repository pattern

**Key takeaways:**
- A source code dependency is a vector: if Module A imports Module B, change flows from B into A. Chapter 11 named the patterns that control this; this chapter is about the underlying mechanism every one of those patterns depends on — the direction of the dependency arrow itself.
- The Dependency Inversion Principle (DIP) says high-level policy must not depend on low-level detail. Both should depend on an abstraction, and that abstraction must be owned by the high-level (stable) side — not by the infrastructure it's meant to isolate.
- Defining an interface is not the same as inverting a dependency. If the core programs against an interface shaped by the vendor's vocabulary, the dependency still points outward. Inversion requires the stable module to own the interface in its own vocabulary, and the infrastructure to adapt to it.
- The practical test for whether inversion is real: can the dependency be swapped — for a different vendor, or for an in-memory test double — without touching a line of core logic? The value of that test is rarely about ever actually swapping vendors; it's about running thousands of business-rule tests in milliseconds against fakes instead of a live database.

---

## Direct vs. Inverted Dependencies

**What it is:** The structural fork in the road: does a high-level module import a low-level module's concrete implementation directly, or does the high-level module define an interface that the low-level module implements, with something outside both of them doing the wiring?

**Why it exists:** High-level policy — how interest compounds, how an order total gets calculated — barely changes. Low-level detail — how that result gets serialized over a TCP socket into PostgreSQL — changes all the time, for reasons that have nothing to do with the policy. Import the database driver directly into the policy module and you've coupled something stable to something volatile, and the policy is now exposed to churn it never actually caused.

**Options:**
1. **Direct dependency** — business logic imports the concrete infrastructure module directly
2. **Inverted dependency (DIP)** — business logic defines an interface; infrastructure implements it; a third party (a DI container, a `main` function) wires the two together at runtime

**Trade-offs:**
- *Direct dependency:* trivial to write, trivial to trace, barely any code volume — and it welds business logic permanently to one vendor, making isolated unit testing without a live database more or less a fantasy.
- *Inverted dependency:* business logic unit-tests in microseconds against an in-memory fake, and swapping vendors never means touching domain code — for the price of an explicit interface, a wiring mechanism, and mapping code translating between domain shapes and infrastructure shapes.

**When to choose each:**
- *Direct dependency:* shell scripts, throwaway migration tools, and standard-library-level utilities with effectively zero volatility.
- *Inverted dependency:* the default for core business rules, domain entities, and anything that represents the actual value the software exists to deliver.

**Common failure modes:**
- **The transitive ripple:** a deeply embedded direct dependency changes its signature — a JSON parser bumps a major version, say — and because dependencies point downward, every layer above it must change, retest, and redeploy to absorb a change that has nothing to do with the business rule any of those layers actually implements.
- **Framework leakage:** domain logic importing ORM types, HTTP types, or a cloud SDK's types directly, so the domain model is partly written in someone else's vocabulary.

**Example:** Go's `database/sql` package exposes a concrete `*sql.DB`. Passed straight into a `UserService`, that service is now structurally coupled to SQL. Inverted, the `UserService` instead depends on a `UserRepository` interface it defines itself (`FindUser(id string) User`); a `PostgresUserRepository` in the infrastructure layer implements it. Switching `PostgresUserRepository` for an in-memory fake in tests, or for a different database in production, never requires changing `UserService`. That swap — with zero change to the core — is the practical test of whether inversion is real or only cosmetic.

---

## Interface Ownership

**What it is:** Which side of a dependency actually gets to name things — the method names, the data shapes, the error types the interface speaks in.

**Why it exists:** Defining *an* interface was never the whole job. If the core is still programming against an interface shaped by the infrastructure vendor's own vocabulary — its request objects, its exception types — the dependency is still pointing outward, no matter what the diagram claims. Real inversion means the stable side names the interface, on its own terms.

**Options:**
1. **Callee-owned (foreign) interface** — the core programs against an interface defined by the external library or vendor
2. **Caller-owned (local) interface** — the core defines its own interface in pure domain vocabulary; infrastructure writes an adapter that translates into it

**Trade-offs:**
- *Callee-owned:* zero adapter layer to write, vendor SDK objects pass straight through the codebase untouched — and vendor vocabulary, exception types, configuration objects and all, leaks directly into the domain right along with them.
- *Caller-owned:* the domain model stays pure and speaks nothing but the language of the business — and it demands discipline that never lets up: every new feature now touches both the core interface and the adapter's translation logic.

**When to choose each:**
- *Callee-owned:* acceptable only for foundational language primitives and standard interfaces (a language's built-in reader/writer abstractions, a standard HTTP client interface) — things that are themselves stable by design.
- *Caller-owned:* the default for external infrastructure, SaaS vendors, databases, and message queues — anything actually volatile.

**Common failure modes:**
- **The leaky SDK:** a team is confident it abstracted its cloud storage, because it programs against the vendor's `S3Client` interface instead of the concrete class — except that interface still demands vendor-specific request structs and throws vendor-specific exceptions. Ownership never actually left the vendor. The day the team tries to migrate providers, they discover the core domain has to be rewritten anyway, because the vocabulary was AWS's the whole time and nobody noticed.

**Example:** A payroll system doesn't call `stripe.Charge.create()` from its core, ever. It defines its own `PaymentGateway.Process(amount Money) error` interface, in payroll's own vocabulary, and makes the infrastructure layer supply a `StripeAdapter` that implements it — catching Stripe's specific HTTP errors and translating them into error types the domain actually recognizes as its own. **[Strong Recommendation: own the interface on the stable side for anything actually volatile; importing a vendor's interface is not inversion, even when it looks like one]**

---

## The Dependency Rule: Infrastructure at the Edges

**What it is:** Robert C. Martin's framing from *Clean Architecture*: source dependencies always point inward, toward higher-level policy, full stop. Concrete infrastructure — the UI, the database driver, external clients — lives out at the edge. Abstract interfaces live at the core.

**Why it exists:** It's interface ownership, generalized into a rule for the whole system instead of one boundary at a time. The business's core rules barely move; the delivery mechanism and storage technology move constantly. Force every dependency to point inward and a change at the edge — a new web framework, a new database — never even requires the core to be recompiled, let alone rewritten.

**Options:**
1. **Entangled infrastructure** — core logic and infrastructure logic mixed in the same functions or files
2. **Edge-isolated infrastructure** — the system is organized in concentric rings: domain at the center, use cases around it, frameworks and drivers at the outer edge, with every dependency pointing inward

**Trade-offs:**
- *Entangled infrastructure:* quick to write for a single-purpose service, and testing the business rule now means testing the network and database calls it's tangled up with, whether you wanted to or not.
- *Edge-isolated infrastructure:* the delivery mechanism can go from REST to gRPC, or the storage technology can change entirely, without the core noticing — at the cost of one feature now touching more files than the tangled version ever would: the edge adapter, the use case, the domain interface, all three.

**When to choose each:**
- *Entangled:* short-lived scripts, small bounded functions, and prototypes that are genuinely going to be thrown away.
- *Edge-isolated:* anything expected to survive multiple years, outlive the people who wrote it, or absorb real business-rule change over that time.

**Common failure modes:**
- **The untestable core:** a tax-calculation engine embeds direct calls to a third-party currency API right inside its calculation loop. The dependency now points outward, straight at a volatile network service, so the core's own logic can't be tested anymore without that network call succeeding first — and a rate limit or an outage on somebody else's API now fails a test suite that has nothing whatsoever to do with currency conversion.

**Example:** PostgreSQL lives entirely at the edge here. The core defines an `OrderStore` interface and knows nothing about SQL, nothing about row locking. Out at the edge, an `SQLOrderRepository` imports the Postgres driver, builds the query, runs it, and maps the relational result into a plain `Order` domain object before handing it back inward. **[Consensus: source dependencies point toward policy, never away from it]**

---

## Why Smart Engineers Disagree: The "YAGNI" of Swappable Databases

The most common objection to dependency inversion is YAGNI — You Aren't Gonna Need It — and it's not a bad objection on its face.

The pragmatic engineer is correct that the company has never once swapped its primary relational database for a different vendor, and almost certainly never will. Building a repository interface to pretend PostgreSQL is swappable is accidental complexity (Ch 02), paid in full, for a migration that was never coming — and it quietly locks the team out of Postgres-specific features like `JSONB` indexing or `RETURNING` clauses that a direct dependency would let them use without a second thought.

The systems architect's actual case for inversion was never about that migration happening. The real payoff is swapping the database for an in-memory fake *today* — ten thousand business-rule tests running in well under a second instead of against a live database — plus a cognitive firewall that lets an engineer read the core and reason only about domain constraints, never about connection pooling or query semantics leaking up from somewhere below.

Both sides are pricing something real. The pragmatic engineer is right that production vendor swaps are a myth almost everywhere they get cited. The architect is right that the interface still earns its keep — just not for the reason it usually gets defended with. The fix is to stop justifying inversion by a vendor migration that isn't happening and start justifying it by the test isolation and vocabulary purity it buys every single day. That reframe also tells you exactly when to skip it: a module with no real test surface and no vocabulary worth protecting gets nothing out of an interface it will never actually need to satisfy twice.

*Concepts expanded in later chapters: the specific architecture patterns this principle is embedded in — hexagonal and layered (Part II, Ch 11); module and file structure for organizing the resulting interfaces (Part IV, Ch 27).*
