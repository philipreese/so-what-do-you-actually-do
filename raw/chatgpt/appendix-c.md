Appendix C — Architecture Patterns Catalog

1. System Decomposition

Monolith

What it is: A single deployable application that contains multiple capabilities within one process, sharing memory and typically a single database. Module boundaries exist in code rather than across network calls.

Use it when: One team owns the system, deployment coordination is inexpensive, and most changes naturally span multiple business capabilities.

The cost it charges: Every deployment affects the entire application, scaling is coarse-grained, and poor internal boundaries can accumulate into tight coupling over time.

Full treatment: The chapter introducing monoliths and the trade-offs of service decomposition.

Common misuse: Rejecting a monolith solely because the product is expected to become large someday, before independent deployment or ownership boundaries actually exist.



---

Modular Monolith

What it is: A monolith with explicitly enforced module boundaries, narrow interfaces, and dependency rules that prevent modules from reaching into each other's internals despite sharing one deployment.

Use it when: Independent business capabilities already exist, but independent deployment, scaling, or team ownership do not yet justify distributed services.

The cost it charges: Maintaining module boundaries requires discipline, architectural enforcement, and occasionally writing interfaces that feel unnecessary while everything still runs in one process.

Full treatment: The chapter on modular monoliths and information hiding across internal modules.

Common misuse: Calling any well-organized monolith "modular" without actually enforcing dependency boundaries.



---

Big Ball of Mud (Anti-pattern)

What it is: A system where every component can directly access every other component, ownership is unclear, and dependencies form an effectively unrestricted graph.

Use it when: Never intentionally. This is the recognizable failure shape that modularization exists to prevent.

The cost it charges: Every change has unpredictable ripple effects, onboarding slows dramatically, testing becomes difficult, and architectural reasoning becomes nearly impossible.

Full treatment: The chapter contrasting modular monoliths with uncontrolled growth.

Common misuse: Mistaking temporary delivery speed for evidence that unrestricted coupling is an acceptable long-term architecture.



---

Microservice Decomposition

What it is: A system split into independently deployable services, each owning a specific business capability and communicating through explicit service contracts.

Use it when: Independent deployment, independent scaling, organizational ownership, or differing operational requirements have become persistent constraints.

The cost it charges: Distributed systems complexity: network latency, partial failures, versioning, observability, deployment coordination, and operational overhead.

Full treatment: The chapter on service decomposition and service boundaries.

Common misuse: Splitting services around technical layers or arbitrary size targets instead of stable business capabilities.



---

Strangler Fig Migration

What it is: A migration pattern where new functionality is implemented alongside an existing system, gradually replacing portions until the legacy implementation disappears.

Use it when: Existing software cannot realistically be rewritten all at once, but replacement must proceed incrementally.

The cost it charges: Two systems coexist for an extended period, requiring routing logic, duplicated operational effort, and temporary integration complexity.

Full treatment: The chapter discussing incremental architectural migration.

Common misuse: Beginning a strangler migration without clear ownership boundaries, causing old and new implementations to remain permanently intertwined.



---

2. Internal Code Architecture

Layered Architecture

What it is: Responsibilities are organized into layers with dependencies flowing inward—typically presentation, application, domain, and infrastructure—with each layer communicating only through adjacent layers.

Use it when: Most complexity comes from separating responsibilities rather than supporting multiple infrastructure implementations.

The cost it charges: Requests often traverse multiple layers that contribute little logic, increasing boilerplate and indirection.

Full treatment: The chapter on layered architecture and responsibility separation.

Common misuse: Creating layers that simply pass data through unchanged, producing depth without encapsulation.



---

Hexagonal (Ports-and-Adapters) Architecture

What it is: Core business logic depends only on abstract ports, while infrastructure concerns—databases, messaging, APIs, and user interfaces—connect through adapters implementing those ports.

Use it when: Business logic should remain independent of infrastructure technologies that are expected to change over the system's lifetime.

The cost it charges: Additional abstractions, interface definitions, adapter implementations, and translation code between the core and external systems.

Full treatment: The chapter introducing ports-and-adapters architecture.

Common misuse: Applying ports around infrastructure that has little realistic chance of changing, paying abstraction costs without protecting meaningful volatility.



---

Pass-Through Layer (Degenerate Failure Shape)

What it is: A layer whose methods merely delegate to another layer without adding policy, validation, orchestration, or abstraction.

Use it when: Never intentionally. It represents abstraction that has lost its purpose.

The cost it charges: Extra files, navigation, debugging, testing, and maintenance without reducing coupling or increasing clarity.

Full treatment: The chapter on abstraction costs and architectural layering.

Common misuse: Automatically creating service layers, manager classes, or wrappers because project templates include them.


3. Dependency and Boundary Patterns

Repository Pattern

What it is: A repository presents a collection-like interface for retrieving and persisting domain objects while hiding the mechanics of the underlying storage technology. The rest of the application depends on the repository contract rather than SQL, ORM APIs, or storage details.

Use it when: Business logic should remain independent of persistence details, or multiple persistence implementations must satisfy the same domain-facing interface.

The cost it charges: An additional abstraction layer that must be designed, implemented, tested, and kept aligned with both the domain model and the storage model.

Full treatment: The chapter on persistence abstraction and information hiding.

Common misuse: Wrapping every ORM method one-for-one, producing a repository that merely forwards calls without hiding any meaningful implementation detail.



---

Dependency Inversion (Architectural)

What it is: Stable, higher-level policy defines the interfaces that lower-level implementation depends upon, reversing the natural dependency from business logic toward infrastructure.

Use it when: Infrastructure technologies are expected to change more frequently than the business rules they support.

The cost it charges: Interface design, dependency injection, and additional indirection that make simple call paths less direct.

Full treatment: The chapter on dependency inversion and architectural boundaries.

Common misuse: Creating interfaces for classes that have exactly one implementation and no realistic source of volatility.



---

Anti-Corruption Layer

What it is: A translation boundary that converts another system's models, terminology, and contracts into the application's own bounded context instead of allowing external concepts to spread through the codebase.

Use it when: Integrating with a legacy system, third-party API, or another service whose domain model should not become part of your own.

The cost it charges: Translation code, duplicated models, mapping logic, and another integration component that must evolve as either side changes.

Full treatment: The chapter on service integration and preserving internal models.

Common misuse: Passing third-party DTOs directly through internal layers because writing translators initially feels redundant.



---

Bounded Context

What it is: A boundary within which a domain model has one consistent meaning, vocabulary, and ownership. Communication across contexts occurs through explicit contracts rather than shared internal models.

Use it when: Different business capabilities naturally assign different meanings or responsibilities to the same concepts.

The cost it charges: Translation between contexts, duplicated concepts where appropriate, and coordination when contracts evolve.

Full treatment: The chapter on domain boundaries and service decomposition.

Common misuse: Treating bounded contexts as purely technical module boundaries instead of business-language boundaries.



---

4. Data Ownership and Consistency Patterns

Database per Service

What it is: Each service exclusively owns its own database and exposes data only through its published API or events. Other services never query its tables directly.

Use it when: Independent deployment and ownership are more important than convenient cross-service queries.

The cost it charges: Cross-service joins disappear, duplicate data becomes common, and integration requires APIs or events instead of SQL.

Full treatment: The chapter on service ownership and data boundaries.

Common misuse: Allowing "read-only" direct database access because it seems harmless, eventually creating hidden runtime dependencies between services.



---

CQRS (Command Query Responsibility Segregation)

What it is: Commands that modify state and queries that read state are implemented through separate models, allowing each side to optimize independently.

Use it when: Read and write workloads have substantially different requirements, or independent evolution of read and write models provides measurable benefit.

The cost it charges: Multiple models, synchronization logic, eventual consistency, and significantly higher architectural complexity.

Full treatment: The chapter separating ownership of writes from ownership of reads.

Common misuse: Introducing CQRS into CRUD applications whose reads and writes are already well served by the same model.



---

Saga Pattern

What it is: A long-running business transaction is decomposed into multiple local transactions coordinated through messages and compensating actions instead of a distributed transaction.

Use it when: Business operations span multiple independently owned services that cannot participate in a single ACID transaction.

The cost it charges: Complex orchestration, compensation logic, failure handling, and eventual consistency that developers must explicitly reason about.

Full treatment: The chapter on distributed transactions and cross-service coordination.

Common misuse: Using sagas for operations that could have remained inside a single transactional boundary.



---

Event-Carried State Transfer

What it is: Services publish events containing the data that downstream consumers need, allowing those consumers to maintain local copies without synchronous requests back to the owning service.

Use it when: Read latency, resilience, or service independence matter more than immediate consistency.

The cost it charges: Duplicate data, eventual consistency, event versioning, and synchronization logic.

Full treatment: The chapter on event-driven integration and service autonomy.

Common misuse: Publishing every field "just in case," turning events into uncontrolled snapshots instead of intentional contracts.



---

5. API and Contract Patterns

Exposed-Surface Discipline

What it is: Public contracts expose only the minimum functionality and data necessary for consumers, while implementation details remain private behind the interface.

Use it when: APIs are expected to evolve over time and long-term compatibility matters.

The cost it charges: Deliberate API design, careful review of additions, and occasional friction when consumers request convenient shortcuts.

Full treatment: The chapter on API design and information hiding.

Common misuse: Publishing internal implementation details because they are already available, unintentionally freezing them into permanent contracts.



---

Sunset Pattern

What it is: APIs are retired through an announced deprecation period during which old and new versions coexist, allowing clients to migrate before removal.

Use it when: A published contract must change without breaking existing consumers immediately.

The cost it charges: Supporting multiple versions simultaneously, documenting migration paths, and delaying cleanup until consumers have moved.

Full treatment: The chapter on API versioning and contract evolution.

Common misuse: Declaring endpoints deprecated without publishing a replacement path or a realistic removal timeline.



---

HATEOAS

What it is: API responses include hyperlinks describing available state transitions so clients discover behavior dynamically rather than constructing URLs themselves.

Use it when: Clients genuinely benefit from runtime navigation through a hypermedia-driven API.

The cost it charges: More complex API implementation, larger payloads, and additional client logic that many consumers ultimately ignore.

Full treatment: The chapter evaluating REST constraints and practical API design.

Common misuse: Implementing HATEOAS simply because it appears in REST literature despite clients already having stable, well-defined endpoints.

6. Code Organization Patterns

Package by Feature

What it is: Code is organized around business capabilities, with each feature containing its own controllers, services, domain objects, persistence, tests, and supporting code. Dependencies between features remain explicit and limited.

Use it when: The primary unit of change is a business capability, and teams think and work in terms of features rather than technical layers.

The cost it charges: Similar technical concerns may be implemented in multiple places, and maintaining consistency across features requires deliberate effort.

Full treatment: The chapter on organizing code around the reasons it changes.

Common misuse: Calling folders "features" while allowing unrestricted cross-feature dependencies that recreate one large shared codebase.



---

Package by Layer

What it is: Code is organized by technical responsibility—controllers, services, repositories, models, infrastructure—with each package containing one kind of component used across the application.

Use it when: The application is relatively small, responsibilities are well understood, and the technical architecture is more stable than the business domain.

The cost it charges: Understanding one business capability often requires navigating many different packages, making feature work more scattered as the system grows.

Full treatment: The chapter comparing package-by-layer with package-by-feature.

Common misuse: Continuing to expand a layer-based organization long after features have become largely independent and teams spend most of their time working vertically.



---

God Package (Anti-pattern)

What it is: A package or namespace that accumulates unrelated responsibilities until nearly every part of the application depends on it. It becomes the architectural equivalent of a junk drawer.

Use it when: Never intentionally. It is the recognizable failure shape that both feature-based and layer-based organization are meant to prevent.

The cost it charges: Hidden coupling, poor discoverability, merge conflicts, unclear ownership, and steadily increasing maintenance cost.

Full treatment: The chapter on code organization and modular boundaries.

Common misuse: Creating a generic "Common," "Core," "Utilities," or "Shared" package and allowing every new piece of code to migrate there because no better home is immediately obvious.



---

7. Concurrency Architecture Patterns

Shared-State Concurrency

What it is: Concurrent execution is coordinated through shared memory protected by synchronization primitives such as locks, mutexes, semaphores, or reader-writer locks.

Use it when: Multiple execution contexts genuinely need access to the same mutable state and synchronization costs remain manageable.

The cost it charges: Lock contention, deadlocks, race conditions, memory visibility concerns, and the cognitive overhead of reasoning about interleavings.

Full treatment: The chapter comparing shared-state and message-passing concurrency models.

Common misuse: Sharing mutable state by default instead of first asking whether the state needs to be shared at all.



---

Message Passing

What it is: Independent components communicate exclusively by exchanging messages, with each component maintaining ownership of its own internal state.

Use it when: Independent execution, fault isolation, and reducing shared mutable state are more valuable than minimizing communication overhead.

The cost it charges: Serialization, message latency, queue management, eventual consistency, and more complex communication protocols.

Full treatment: The chapter on message-passing architectures.

Common misuse: Breaking tiny in-process components into asynchronous message exchanges where ordinary function calls would have been simpler and faster.



---

Actor Model

What it is: Computation is organized into actors that own private state, process one message at a time, and communicate only by sending messages to other actors.

Use it when: Large numbers of concurrent, mostly independent activities must be coordinated without shared mutable state.

The cost it charges: Different debugging techniques, asynchronous reasoning throughout the system, and infrastructure for actor scheduling, supervision, and message delivery.

Full treatment: The chapter presenting the actor model as the extreme point of message-passing architectures.

Common misuse: Introducing an actor framework into applications whose concurrency needs are modest enough that conventional threading or async execution is substantially simpler.



---

8. Security Architecture Patterns

Defense in Depth

What it is: Multiple independent security controls protect the same resource so that the failure of one layer does not immediately compromise the system. Authentication, authorization, validation, auditing, encryption, and network controls reinforce one another rather than serving as substitutes.

Use it when: The impact of compromise justifies assuming that individual controls will eventually fail.

The cost it charges: Additional implementation effort, operational complexity, duplicated checks, and more components that require configuration and maintenance.

Full treatment: The chapter on layered security architecture.

Common misuse: Treating one particularly strong security mechanism as sufficient protection while removing complementary controls that address different failure modes.



---

Zero Trust

What it is: Every request crossing a trust boundary is authenticated, authorized, and validated regardless of where it originated. Trust is established continuously through verification rather than inherited from network location.

Use it when: Systems span multiple services, environments, organizations, or networks where implicit trust cannot be safely assumed.

The cost it charges: Additional authentication traffic, identity infrastructure, policy management, and repeated verification at service boundaries.

Full treatment: The chapter on trust boundaries and authentication architecture.

Common misuse: Renaming perimeter security as "Zero Trust" without actually removing implicit trust based on network location or previous authentication.
