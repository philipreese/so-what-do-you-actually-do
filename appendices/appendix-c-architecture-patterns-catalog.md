# Appendix C — Architecture Patterns Catalog

This appendix is an index, not a chapter. It gathers every named, reusable structural pattern the handbook already argues for — a way of shaping a system, a service boundary, a code layout, a concurrency model — into one place, so a reader who half-remembers "there was a pattern for keeping a service's database private" doesn't have to reread the chapter that built it.

A pattern is a shape you build, once a decision is already made — it is not a procedure for making that decision (that's Appendix A) and not a warning sign that something's already gone wrong (that's Appendix B). Every entry below states both **the cost it charges**, because every pattern here costs something even when it's the right call, and a **common misuse**, because the fastest way to misapply a pattern is to reach for it as a template regardless of whether the volatility it protects against is actually real.

---

## 1. System Decomposition

**Monolith**
*What it is:* A single deployable application containing multiple capabilities in one process, typically sharing one database, with module boundaries drawn in code rather than across a network.
*Use it when:* One team owns the system, deployment coordination is cheap, and most changes naturally span more than one capability at once.
*The cost it charges:* Every deployment touches the whole application, scaling is coarse-grained, and internal boundaries can erode into tight coupling if nothing enforces them.
*Full treatment:* [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Common misuse:* Rejecting a monolith on the assumption the product will "need" microservices eventually, before any real independent-deployment or independent-scaling pressure actually exists.

**Modular Monolith**
*What it is:* A monolith with explicitly enforced module boundaries and narrow interfaces between them, so a single deployment still prevents any module from reaching directly into another's internals.
*Use it when:* Distinct business capabilities already exist, but independent deployment, independent scaling, or separate team ownership don't yet justify the cost of separate services.
*The cost it charges:* Real discipline — designing and maintaining boundaries and interfaces that would be invisible if everything could just call everything else directly.
*Full treatment:* [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Common misuse:* Calling any reasonably tidy monolith "modular" without any compiler- or build-enforced rule actually stopping a module from reaching into another's internals — the boundary has to be mechanically enforced, not just agreed upon.

**Big Ball of Mud** *(anti-pattern)*
*What it is:* A system where any component can call any other, ownership is unclear, and the dependency graph has no real structure left to reason about.
*Use it when:* Never intentionally — this is the recognizable failure shape a modular monolith exists to prevent.
*The cost it charges:* Every change carries unpredictable ripple effects, onboarding slows to a crawl, and testing anything in isolation becomes close to impossible.
*Full treatment:* [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Common misuse:* Mistaking short-term delivery speed under unrestricted coupling for evidence that the coupling is actually fine long-term.

**Microservice Decomposition**
*What it is:* A system split into independently deployable services, each owning one business capability and communicating only through explicit contracts.
*Use it when:* Independent deployment, independent scaling, or organizational ownership have become real, persistent constraints — not aspirations.
*The cost it charges:* The full weight of distributed-systems complexity: network latency, partial failure, cross-service versioning, and operational overhead that a single process never had to pay.
*Full treatment:* [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Common misuse:* Splitting services apart but leaving them pointed at the same shared database — a **distributed monolith**, which pays every operational cost of microservices while keeping every coupling cost of a monolith.

**Strangler Fig Migration**
*What it is:* An incremental migration where new functionality grows around the edge of an existing system, intercepting a growing share of live traffic until the legacy implementation can be removed entirely.
*Use it when:* A production-critical system can't realistically be rewritten in one pass, but replacement still has to proceed.
*The cost it charges:* Two systems coexisting for an extended period, with routing logic, duplicated data, and real ongoing integration overhead between them.
*Full treatment:* [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Common misuse:* A permanent strangler — the easy, stateless paths get migrated, then the migration stalls indefinitely against the one tangled piece nobody wants to touch, leaving the organization paying for both architectures forever.

---

## 2. Internal Code Architecture

**Layered Architecture**
*What it is:* Code organized into horizontal layers — commonly presentation, business logic, and data access — where each layer only calls the one directly below it.
*Use it when:* Most of the system's complexity comes from separating responsibilities, not from insulating business logic against a genuinely volatile infrastructure choice.
*The cost it charges:* Infrastructure details tend to leak upward through the layers over time, because the layer below doesn't know or care what the layer above wants to stay ignorant of.
*Full treatment:* [Ch 11 — Layered, Hexagonal, and Ports-and-Adapters Architecture](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md).
*Common misuse:* **Layer leakage** — a database exception or an ORM annotation surfacing all the way up to the API layer, defeating the entire reason the layering existed.

**Hexagonal Architecture (Ports-and-Adapters)**
*What it is:* Business logic sits at the center and defines the interfaces ("ports") it needs; infrastructure connects to the core by implementing those interfaces ("adapters"), so every dependency points inward.
*Use it when:* Core business rules are genuinely long-lived and need to stay insulated from infrastructure choices — the database, the framework, the delivery mechanism — that are expected to change.
*The cost it charges:* Explicit translation layers between the database shape and the domain model, and wiring code to connect the pieces — real boilerplate that a simpler layering wouldn't need.
*Full treatment:* [Ch 11 — Layered, Hexagonal, and Ports-and-Adapters Architecture](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md).
*Common misuse:* Applying it to a service whose whole job is moving form submissions into a table — an empty core, paying the full indirection cost of a boundary with no real business logic behind it to protect.

**Pass-Through Layer** *(degenerate failure shape)*
*What it is:* A layer whose method bodies just forward the call unchanged, transforming nothing and hiding no decision.
*Use it when:* Never intentionally — it's abstraction that stopped doing its job.
*The cost it charges:* Extra files, longer stack traces, and more places to navigate through during debugging, in exchange for nothing.
*Full treatment:* [Ch 14 — Abstraction Layers: When to Add One](../part02-software-architecture/ch14-abstraction-layers-when-to-add-one.md).
*Common misuse:* Adding a service layer or a manager class by default because a project template includes one, not because any real volatility needed protecting.

---

## 3. Dependency and Boundary Patterns

**Repository Pattern**
*What it is:* A collection-like interface, owned by the domain, for retrieving and persisting domain objects — hiding the specific database or ORM behind domain vocabulary like `findUserById`.
*Use it when:* Business logic should stay independent of persistence details, or the code needs to run its tests against a fast, in-memory fake instead of a live database.
*The cost it charges:* An extra abstraction layer to design, implement, and keep aligned with both the domain model and the actual storage shape underneath it.
*Full treatment:* [Ch 12 — Dependency Direction and Inversion](../part02-software-architecture/ch12-dependency-direction-inversion.md).
*Common misuse:* Wrapping every ORM method one-for-one — a repository that forwards calls unchanged hides no decision and is a pass-through layer wearing a different name.

**Dependency Inversion (Architectural)**
*What it is:* High-level, stable code defines the interfaces it needs, in its own vocabulary; low-level, volatile infrastructure is written to satisfy those interfaces from the outside, reversing the natural direction of the dependency.
*Use it when:* Infrastructure — a vendor SDK, a specific database — is genuinely more likely to change than the business rules that depend on it.
*The cost it charges:* Interface design and dependency wiring that make a simple call path a little less direct to trace.
*Full treatment:* [Ch 12 — Dependency Direction and Inversion](../part02-software-architecture/ch12-dependency-direction-inversion.md).
*Common misuse:* Defining an interface whose method names, types, and error codes are all copied straight from the vendor's own SDK — the vendor still owns the vocabulary, so the dependency was never actually inverted, just relabeled.

**Anti-Corruption Layer**
*What it is:* A translation boundary placed between an internal domain model and an external or legacy system, converting the outside system's shape into the domain's own vocabulary before it ever reaches the core.
*Use it when:* Integrating with a legacy system or third-party API whose model and vocabulary are incompatible with the internal domain's own.
*The cost it charges:* Ongoing translation code and mapping logic that has to be maintained as either side changes.
*Full treatment:* [Ch 14 — Abstraction Layers: When to Add One](../part02-software-architecture/ch14-abstraction-layers-when-to-add-one.md).
*Common misuse:* A leaky anti-corruption layer — one that still hands back the external system's raw formats or re-throws its native exceptions, so the "translation" is a pass-through and the foreign model leaks into the core anyway.

**Bounded Context**
*What it is:* A boundary within which one domain model's terms and rules stay internally consistent — the same word can mean something different in a different bounded context, on purpose.
*Use it when:* Different business capabilities genuinely assign different meanings to what looks like the same concept — "User" in billing is not "User" in authentication.
*The cost it charges:* Explicit translation whenever information has to cross from one context into another, plus real coordination whenever that cross-context contract changes.
*Full treatment:* [Ch 13 — Coupling and Cohesion at the Architecture Level](../part02-software-architecture/ch13-coupling-cohesion-architecture-level.md).
*Common misuse:* Treating bounded contexts as arbitrary technical module lines instead of actual business-language boundaries, or routing everything through one shared canonical model that quietly re-couples every context to every other one.

---

## 4. Data Ownership and Consistency Patterns

**Database-per-Service**
*What it is:* Each service's datastore is reachable only by that service; every other service accesses its data exclusively through its published API or events, never its tables directly.
*Use it when:* Services are meant to be independently deployable, and independent ownership matters more than the convenience of a cross-service SQL join.
*The cost it charges:* Cross-service joins disappear entirely — a page that used to run one query now needs multiple API calls or a locally maintained, occasionally stale projection.
*Full treatment:* [Ch 18 — Data Ownership Boundaries](../part02-software-architecture/ch18-data-ownership-boundaries.md).
*Common misuse:* Splitting services on the deployment side while leaving them all pointed at the same underlying database — the schema stays a single point of coupling no matter how independent the service code looks.

**CQRS (Command Query Responsibility Segregation)**
*What it is:* Separate models for writing data (commands) and reading it (queries), commonly used to build a fast, local, read-optimized projection of data another service actually owns.
*Use it when:* Read and write workloads have genuinely different shapes or scaling needs, and cross-service reads need to avoid a real-time fan-out of calls back to the owner.
*The cost it charges:* Multiple models to keep in sync, real synchronization logic, and eventual consistency the rest of the system has to be built to tolerate.
*Full treatment:* [Ch 18 — Data Ownership Boundaries](../part02-software-architecture/ch18-data-ownership-boundaries.md).
*Common misuse:* Introducing CQRS into an ordinary CRUD application whose reads and writes were already well served by exactly the same model.

**Saga Pattern**
*What it is:* A multi-step business transaction spanning several services, coordinated through a sequence of local transactions and explicit compensating actions, instead of one atomic database transaction.
*Use it when:* A workflow genuinely spans services that can't share a single ACID transaction.
*The cost it charges:* Someone has to write, test, and actively monitor the compensating action for every step — there's no automatic rollback the way a database transaction gives you for free.
*Full treatment:* [Ch 17 — Synchronous vs. Asynchronous Communication](../part02-software-architecture/ch17-sync-vs-async-communication.md).
*Common misuse:* The missing compensating action — a step fails, nothing reverses steps one and two, and the system sits half-committed with nobody watching the dead-letter queue to notice.

**Event-Carried State Transfer**
*What it is:* An event payload carries the full state of the resource at the moment of the event, rather than just an identifier — letting consumers act without calling back to the publisher.
*Use it when:* Consumers need to act on data without a synchronous round trip, and a short eventual-consistency window is acceptable for what they're doing with it.
*The cost it charges:* Duplicated data across services, event schema versioning, and the real risk of a consumer acting on a fat event that's already stale relative to a newer mutation.
*Full treatment:* [Ch 19 — REST vs. RPC vs. Event-Driven](../part03-api-design/ch19-rest-vs-rpc-vs-event-driven.md).
*Common misuse:* Publishing every field on the resource "just in case," turning an intentional, versioned contract into an uncontrolled dump of internal state.

---

## 5. API and Contract Patterns

**Exposed-Surface Discipline**
*What it is:* A public API surface that exposes only what it's genuinely willing to support forever, keeping every implementation detail behind the boundary.
*Use it when:* The API is expected to evolve and long-term compatibility actually matters to someone.
*The cost it charges:* Deliberate design and real friction — saying no to a convenient shortcut a consumer would like, because exposing it now means maintaining it indefinitely.
*Full treatment:* [Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md).
*Common misuse:* Serializing an internal database model straight into a public response because it was already sitting right there — an internal implementation detail becomes a permanent, frozen part of the contract the moment one consumer starts relying on it.

**Sunset Pattern**
*What it is:* A structured, time-bound lifecycle for retiring an API version — active, then deprecated, then sunset, then removed — communicated through escalating, programmatic signals rather than documentation alone.
*Use it when:* A published contract has to change in a way that breaks existing consumers, and they can't all be updated in the same deployment.
*The cost it charges:* Running and supporting more than one version simultaneously for the length of the migration window, plus the work of actually telling consumers it's happening.
*Full treatment:* [Ch 16 — Versioning and Backward Compatibility](../part02-software-architecture/ch16-versioning-backward-compatibility.md).
*Common misuse:* A silent deprecation — noting the change in a changelog nobody reads and turning the old version off on schedule anyway, which produces the exact outage the sunset pattern exists to prevent.

**HATEOAS**
*What it is:* API responses embed the links describing every action currently available, so a client discovers behavior at runtime instead of hardcoding URL structure up front.
*Use it when:* Clients genuinely navigate the API dynamically and benefit from that discovery at runtime — in practice, a narrow case.
*The cost it charges:* Bloated payloads, more complex server-side implementation, and client-side navigation logic most consumers end up ignoring anyway.
*Full treatment:* [Ch 19 — REST vs. RPC vs. Event-Driven](../part03-api-design/ch19-rest-vs-rpc-vs-event-driven.md).
*Common misuse:* Implementing it because REST literature says to, on an API whose clients already have stable, well-documented endpoints and were never going to navigate dynamically in the first place — the industry's practical answer here is to skip it.

---

## 6. Code Organization Patterns

**Package by Feature**
*What it is:* Directories named after business capabilities, each holding everything — controller, service, persistence — that capability needs, rather than grouping by technical role.
*Use it when:* The unit of change is a business capability, and most work happens vertically within one feature rather than across a technical layer.
*The cost it charges:* The same small technical concern can end up implemented slightly differently in more than one feature, and keeping that consistent takes deliberate effort.
*Full treatment:* [Ch 27 — File and Module Structure](../part04-code-organization/ch27-file-and-module-structure.md).
*Common misuse:* Naming the folders "features" while leaving unrestricted cross-feature imports in place — the structure looks right without actually enforcing the boundary it implies.

**Package by Layer**
*What it is:* Directories named after technical role — controllers, services, repositories — with each package holding one kind of component used across the whole application.
*Use it when:* The technical role genuinely is the domain, such as in a framework or platform library, where the type of component is what actually varies.
*The cost it charges:* Understanding or changing one business capability means navigating several different packages instead of one, and that scattering gets worse as the system grows.
*Full treatment:* [Ch 27 — File and Module Structure](../part04-code-organization/ch27-file-and-module-structure.md).
*Common misuse:* Keeping a layer-based layout long after the team has started working almost entirely vertically, one feature at a time.

**God Package** *(anti-pattern)*
*What it is:* A package — typically named `common`, `shared`, or `utils` — that accumulates unrelated code because nobody could agree where it actually belonged.
*Use it when:* Never intentionally — it's the recognizable failure shape both package-by-feature and package-by-layer are meant to prevent.
*The cost it charges:* Hidden coupling, near-zero discoverability, and a package that everything imports and nothing actually owns.
*Full treatment:* [Ch 27 — File and Module Structure](../part04-code-organization/ch27-file-and-module-structure.md).
*Common misuse:* Creating a generic catch-all package "just for now" and letting every piece of code with no obvious home migrate there by default, for years.

---

## 7. Concurrency Architecture Patterns

**Shared-State Concurrency**
*What it is:* Concurrent units of execution read and write the same memory, with correctness depending entirely on synchronizing every access to it.
*Use it when:* Multiple execution contexts genuinely need direct access to the same mutable state and the synchronization cost stays manageable — commonly low-level infrastructure where raw throughput is the actual constraint.
*The cost it charges:* Lock contention, the real risk of deadlock, and a growing number of interleavings a reader has to hold in their head to reason about correctness.
*Full treatment:* [Ch 74 — Shared State vs. Message Passing](../part10-concurrency/ch74-shared-state-vs-message-passing.md).
*Common misuse:* Sharing mutable state by default because it's the cheap option, without first asking whether the state actually needed to be shared at all.

**Message-Passing Concurrency**
*What it is:* Each concurrent unit exclusively owns its own state and communicates only by sending copies of data through a channel, mailbox, or queue — eliminating shared memory, and data races with it, by construction.
*Use it when:* Fault isolation and safety are worth more than the overhead of copying data between independent components.
*The cost it charges:* Serialization and copying cost, message latency, and a queue that has to be watched the same way any other queue does — it can grow unbounded if nobody's minding the arrival rate.
*Full treatment:* [Ch 74 — Shared State vs. Message Passing](../part10-concurrency/ch74-shared-state-vs-message-passing.md).
*Common misuse:* Breaking a tiny, in-process interaction into an asynchronous message exchange where an ordinary function call would have been simpler, faster, and no less safe.

**Actor Model**
*What it is:* Computation organized into actors, each owning private state no other actor can touch, communicating only through asynchronous messages delivered to its own mailbox, processing exactly one message at a time.
*Use it when:* Large numbers of mostly-independent concurrent activities need to be coordinated without any shared mutable state at all — the extreme point of the message-passing spectrum.
*The cost it charges:* A different debugging model, asynchronous reasoning throughout the system, and real infrastructure for scheduling, supervision, and message delivery.
*Full treatment:* [Ch 78 — The Actor Model](../part10-concurrency/ch78-the-actor-model.md).
*Common misuse:* Wrapping an actor's message-processing loop in defensive try/catch blocks that swallow the error and keep going — the entire point of the model is to let a broken actor crash cleanly and restart from a known-good state, not nurse it through a corrupted one.

---

## 8. Security Architecture Patterns

**Defense in Depth**
*What it is:* Multiple independent security controls protect the same asset, layered so that one control's failure exposes the next layer rather than the asset itself.
*Use it when:* The value of what's being protected justifies assuming that any single control eventually fails or gets bypassed.
*The cost it charges:* Real implementation and operational effort — more components to configure, monitor, and keep working correctly together.
*Full treatment:* [Ch 80 — Defense in Depth](../part11-security/ch80-defense-in-depth.md).
*Common misuse:* Three checks that all rely on the same underlying credential or the same trust assumption — one control wearing three costumes, not three independent barriers, and it fails all at once the moment that one shared assumption breaks.

**Zero-Trust Architecture**
*What it is:* Every request crossing a service boundary is re-verified for identity and authorization, regardless of where it originated — trust is never inherited just because a request came from inside the perimeter.
*Use it when:* A system spans multiple services where one compromised or careless internal caller shouldn't automatically be trusted by everything downstream of it.
*The cost it charges:* Repeated authentication and authorization checks at every hop, and identity infrastructure that has to be built and kept consistent across every service.
*Full treatment:* [Ch 24 — Authentication and Authorization Boundaries](../part03-api-design/ch24-authentication-authorization-boundaries.md) (introduces it), [Ch 80 — Defense in Depth](../part11-security/ch80-defense-in-depth.md) (generalizes it past a single service boundary to every layer).
*Common misuse:* Relabeling ordinary perimeter security as "zero trust" without actually removing the implicit trust a service still extends to any caller already inside the network — the confused-deputy problem this pattern exists to close.
