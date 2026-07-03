# Chapter 11 — Layered, Hexagonal, and Ports-and-Adapters Architecture

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Ch 04 — Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Part II, Ch 10 — Monolith vs. Service Decomposition](ch10-monolith-vs-service-decomposition.md). Specifically: afferent/efferent coupling, the distinction between encapsulation and information hiding, and connascence.

**New vocabulary introduced:** hexagonal architecture (ports-and-adapters), layer leakage, Data Transfer Object (DTO)

**Key takeaways:**
- Chapter 10 decided whether to split a system into deployable units. This chapter is about the unit itself: once you have a service, how should the code inside it be organized? The answer in every case is a decision about dependency direction, not file layout.
- Layered architecture lets dependencies flow downward through presentation, business logic, and data access. It's intuitive and fast to build, and it fails predictably: infrastructure concepts leak upward through the layers as the system ages.
- Hexagonal architecture inverts that: business logic sits at the center, defines the interfaces ("ports") it needs, and infrastructure implements them from the outside ("adapters"). This is information hiding (Ch 04) applied at the architectural level — the core never knows it's talking to PostgreSQL or Kafka.
- Hexagonal isolation is not free. It buys fast, infrastructure-free unit tests and the ability to change infrastructure without touching domain logic, at the cost of interface boilerplate and a mapping layer at every boundary. The right choice depends on how much real business logic exists to protect.

---

## Layered (N-Tier) Architecture

**What it is:** Code split into horizontal tiers — presentation, business logic, data access, in the usual order — where each layer is only allowed to depend on the one sitting directly beneath it.

**Why it exists:** It matches, almost exactly, how a request physically moves through the system: a controller catches it, a service handles it, a repository persists it. It's intuitive enough to teach in an afternoon, and it needs no upfront interface design to get started.

**Options:**
1. **Strict layering** — a layer may only call the layer directly below it
2. **Relaxed layering** — higher layers may bypass intermediate layers for convenience (e.g., a controller reading directly from a repository for a simple query)
3. **Layered in name only** — layers exist as a file-organization convention with no enforced dependency rule

**Trade-offs:**
- *Strict layering:* control flow stays predictable and traceable, at the cost of writing pass-through methods in the business layer for reads that had nothing to do — accidental complexity (Ch 02) that adds motion without adding meaning.
- *Relaxed layering:* faster for the simple cases, and every shortcut also skips whatever validation or authorization logic was quietly living in the layer you just bypassed.
- *Name-only layering:* fastest today, and with no rule actually enforcing anything, the layers collapse into a dependency tangle the first time a deadline gets tight — which is to say, immediately.

**When to choose each:**
- *Strict layering:* the default for systems of moderate complexity where the rule can actually be enforced (linting, module boundaries, code review).
- *Relaxed layering:* acceptable for read-only, non-authoritative queries where the bypassed layer truly has nothing to add.
- *Name-only:* prototypes and throwaway systems only.

**Common failure modes:**
- **Layer leakage:** the dependency points downward by design, which means the business layer is structurally exposed to whatever the data layer feels like doing. SQL exceptions surface all the way up in the API layer. ORM annotations creep into domain objects that were never supposed to know a database existed. The information hiding this whole layering scheme was supposed to buy just quietly stops being true.
- **The fat service layer:** nobody enforced where a decision actually belongs, so all the meaningful logic in the system piles into one layer, which slowly becomes the de facto god object nobody planned for.
- Circular dependencies between layers, accumulating one reasonable-looking shortcut at a time.

**Example:** Django's MTV pattern is layered architecture with its sleeves rolled up — the View takes the request, the Model holds persistence and a fair chunk of business logic besides, the Template renders the response. It's optimized for velocity and openly accepts, as a real trade, that business logic and data access stay tangled together. In large Django codebases, that's exactly where the leakage shows up first — logic drifting into whichever of views or models the engineer under deadline pressure happened to have open.

---

## Hexagonal Architecture (Ports-and-Adapters)

**What it is:** Alistair Cockburn's 2005 flip on the layered idea. Business logic — the core — sits in the middle and defines the interfaces ("ports") it needs from the outside world. Infrastructure connects in by implementing those interfaces ("adapters"). Dependencies always point inward, toward the domain, never the other way.

**Why it exists:** Infrastructure changes constantly, and for reasons that have nothing to do with why the business logic changes. Hexagonal architecture exists purely to stop that churn from bleeding into the domain — information hiding (Ch 04), just applied one level up, at the architecture instead of the module.

**Options:**
1. **Driving (primary) adapters** — infrastructure that initiates action into the core: a REST controller, a CLI command, an event listener
2. **Driven (secondary) adapters** — infrastructure the core uses to produce side effects: a PostgreSQL repository, a payment gateway client
3. **Selective hexagonal** — ports only around the boundaries that are actually volatile, direct calls elsewhere

**Trade-offs:**
- *Full hexagonal isolation:* forces the domain to be completely framework-agnostic and lets you unit-test the entire business rule set in milliseconds against in-memory fakes, no database or network anywhere in the loop — at the cost of defining and maintaining an explicit interface for every single external interaction, plus the dependency-injection wiring to hold it all together.
- *Selective hexagonal:* cheaper to start, and only protects the boundaries somebody correctly guessed would turn volatile — a boundary nobody flagged gets to be retrofitted later, under worse conditions, once it turns out to matter after all.
- *Infrastructure-first (no ports):* the cheapest possible start, and the domain is glued to a framework and a database from day one — so migrating either one later means touching business logic directly, not swapping out an adapter.

**When to choose each:**
- *Full hexagonal:* domain logic with real rules that will outlive the current database or delivery framework — payment systems, pricing engines, anything with compounding business rules worth testing in isolation.
- *Selective/none:* simple data-entry services and ephemeral microservices where the database effectively *is* the domain, and there's no meaningful logic to protect from it.

**Common failure modes:**
- **The empty core:** a team builds the full port/adapter ceremony for a service whose entire job is writing JSON payloads to a table. All the indirection, none of the isolation value — a fortress built to guard a room with nothing in it.
- **Leakage through adapters:** an ORM entity gets passed straight through, a vendor-specific error code gets checked in domain code, and just like that, the isolation the ports existed to provide is gone.
- **False independence:** assuming the system can now swap databases or message brokers because adapters technically exist, while the domain's behavioral assumptions are still shaped, quietly and implicitly, by the exact semantics of the original infrastructure.

**Example:** A billing service used to call `StripeClient` straight out of `BillingService`. Restructured into hexagonal form, `BillingService` now calls a `PaymentProcessor` port, and `StripeClient` becomes one adapter implementing it — nothing more. Add or swap a payment provider later and the core never changes; only a new adapter gets written. Spring Boot applications show both ends of this spectrum living in the same ecosystem: most default to a layered setup with services calling repositories directly, while teams sitting on long-lived core domains wire up dependency injection to enforce a strict hexagonal boundary instead. **[Strong Recommendation: invest in ports where infrastructure churn or test cost is real; skip them where the database is the entire application]**

---

## Shared Models vs. Strict Boundary Mapping

**What it is:** Whether one data structure rides unchanged all the way from the database, through business logic, out to the network — or whether every boundary it crosses translates it into a shape of its own.

**Why it exists:** Data has to cross every layer and boundary in the system somehow. Whether it crosses through one shared structure or gets explicitly translated at each stop is exactly what decides how tightly the layers end up coupled to each other's shape.

**Options:**
1. **Shared model** — one class represents the data end-to-end: queried from the database, passed through business logic, serialized directly into the response
2. **Strict boundary mapping** — each boundary owns its own shape (an ORM entity, a domain model, an API Data Transfer Object (DTO)) with explicit mapping between them

**Trade-offs:**
- *Shared model:* no mapping boilerplate, fast to write — and it wires connascence of type and value (Ch 03) straight through the whole system, so renaming a database column instantly, silently changes the JSON the API hands back to callers.
- *Strict boundary mapping:* the API contract is mechanically free of the schema, and either one can change without dragging the other along — for the price of real mapper code and the memory overhead of the same data existing in triplicate at every boundary it crosses.

**When to choose each:**
- *Shared model:* layered architectures with a single, tightly coupled internal consumer, where rapid delivery matters more than contract stability.
- *Strict boundary mapping:* hexagonal architectures, and any service with a published API (Ch 15) — an accidental contract change here cascades to every external consumer.

**Common failure modes:**
- **The god model:** a shared `User` class quietly picks up ORM annotations, JSON serialization tags, GraphQL directives, and core validation logic all at once, until a change meant to add one small UI field somehow breaks the database write path three layers away.

**Example:** In a hexagonal REST API, a request shows up as a `CreateUserRequest` DTO. The driving adapter maps it to a plain `User` domain model and hands it through the port into the core, which does whatever the rules say to do. The core passes that domain model to a driven repository adapter, which maps it once more into a `UserEntity` for the PostgreSQL insert. Three distinct shapes, three explicit mappings, and zero structural coupling anywhere between the database schema and the API contract.

---

## Why Smart Engineers Disagree: Indirection vs. Simplicity

The argument that never quite settles at this layer is between the isolation purists and the pragmatic minimalists, and it comes down to how confidently each side is willing to bet that infrastructure will actually change someday.

The longevity-and-testability crowd treats the framework and the database as hostile, unreliable dependencies by default. They'll pay the tax of ports, adapters, and mapping layers gladly, because what it buys is a domain that unit-tests in milliseconds with no database or container anywhere near the test run, and stays untouched no matter what churns underneath it.

The delivery-speed crowd points out that the database swap hexagonal architecture is guarding against almost never actually happens — mature systems don't casually hop from PostgreSQL to MongoDB — and writing dozens of interfaces to protect against a migration that's never coming is future-proofing (Ch 05) wearing a more respectable name.

Both are right, just under different conditions, and the thing that actually decides it is the essential complexity (Ch 02) of the business logic itself. A data-entry tool whose whole job is moving forms into tables has no domain worth protecting — the database *is* the domain, and any hexagonal structure wrapped around it is pure accidental complexity, full stop. A pricing engine with hundreds of overlapping, compounding rules is the opposite case entirely: test those rules against a live database and the suite turns slow and brittle within a month. The real payoff of hexagonal architecture there was never "we might swap databases someday" — it's running thousands of business-rule tests in sub-millisecond isolation, every day, for as long as the system is alive.

*Concepts expanded in later chapters: dependency inversion as a formal principle (Part II, Ch 12), API surface design at the boundary (Part II, Ch 15), module and file structure within a layer (Part IV, Ch 27).*
