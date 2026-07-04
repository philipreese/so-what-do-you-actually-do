Appendix C — Architecture Patterns Catalog
## 1. System decomposition
**[The Modular Monolith]**
 * **What it is:** A single deployable unit where all business logic, data access, and UI rendering execute within a single process and memory space, utilizing strictly enforced internal module boundaries and information hiding.
 * **Use it when:** Starting 99% of new projects, startups, or new domain boundaries, particularly when transactional data integrity (ACID) is strictly required across entities.
 * **The cost it charges:** Rigid deployment coupling where a change to a single sub-feature necessitates rebuilding and deploying the entire unified system.
 * **Full treatment:** Chapter 10 (Monolith vs. Service Decomposition).
 * **Common misuse:** Allowing internal boundaries to erode into a **[Big Ball of Mud]** (a monolith with zero internal boundaries where everything calls everything), resulting in Deployment Gridlock where a single bad commit by one engineer blocks the entire organization's deployment pipeline.
**[Microservice Decomposition (Service Extraction)]**
 * **What it is:** The physical fracturing of a cohesive application to isolate specific functionality into an independent, network-isolated service boundary.
 * **Use it when:** A single subsystem encounters physical hardware limits that violate SLOs, exhibits an entirely unique scale profile, or when engineering headcount grows beyond 50–100 contributors and creates prohibitive communication blockages.
 * **The cost it charges:** Severe operational taxes including mandatory distributed tracing, centralized logging, orchestrators, and complex CI/CD pipelines, alongside an unavoidable network latency tax for cross-boundary calls.
 * **Full treatment:** Chapter 10 (Monolith vs. Service Decomposition).
 * **Common misuse:** Premature extraction resulting in a **[Distributed Monolith]** where services remain highly coupled by sharing a single external database schema, causing a single table adjustment to force synchronized updates and deployments across multiple independent services.
**[The Strangler Fig Migration Pattern]**
 * **What it is:** An incremental migration shape where a new distributed system is grown around the perimeter of a legacy monolith by intercepting traffic at an API Gateway and iteratively routing specific endpoints to extracted microservices.
 * **Use it when:** Decomposing a production-critical system where a "Big Bang" rewrite poses an unacceptable risk of running out of capital or patience before reaching feature parity.
 * **The cost it charges:** The long-term burden of maintaining two competing architectures simultaneously, duplicating data stores, and writing temporary routing logic.
 * **Full treatment:** Chapter 10 (Monolith vs. Service Decomposition).
 * **Common misuse:** The **[Permanent Strangler]**, where a team extracts simple stateless paths but stalls indefinitely when confronting the tangled core database, leaving the organization trapped paying the operational tax of microservices while still tied to the brittle legacy core.
## 2. Internal code architecture
**[Layered (N-Tier) Architecture]**
 * **What it is:** The horizontal organization of an application codebase into sequential tiers where control flow points downward, typically from Presentation to Business Logic to Data Access.
 * **Use it when:** Building simple CRUD applications, tightly coupled internal pipelines, or rapid prototypes where business rules are trivial and execution directly maps to chronological web request flows.
 * **The cost it charges:** Forces engineers to write redundant, low-value pass-through methods in intermediate layers for simple read operations under strict rules, or risks scattering business rules if relaxed rules bypass intermediate tiers.
 * **Full treatment:** Chapter 11 (Layered, Hexagonal, and Ports-and-Adapters Architecture).
 * **Common misuse:** **[Layer Leakage]**, where infrastructure concepts bleed upward, causing database ORM annotations to pollute core domain entities and SQL exceptions to bubble directly into public API responses, violating information hiding.
**[Hexagonal (Ports-and-Adapters) Architecture]**
 * **What it is:** A structural layout that places pure business logic at the absolute center (the Core), defining abstract interfaces (Ports) for all external interactions, while concrete infrastructure components (Adapters) wrap the perimeter to implement or drive them.
 * **Use it when:** Designing complex business systems whose core rules are highly volatile, long-lived, and must be completely insulated from changes in database vendors, frameworks, or delivery mechanisms.
 * **The cost it charges:** A heavy Indirection Tax that requires maintaining complex dependency injection graphs, duplicate data structures, and explicit interface contracts for every external interaction.
 * **Full treatment:** Chapter 11 (Layered, Hexagonal, and Ports-and-Adapters Architecture).
 * **Common misuse:** An **[Empty Core]**, where engineers pay the heavy boilerplate and indirection costs for a basic data-entry application that contains no actual business logic, destroying scannability for simple form-to-table saves.
## 3. Dependency and boundary patterns
**[The Repository Pattern]**
 * **What it is:** Hiding the data persistence mechanism entirely behind a caller-owned abstract interface defined using domain vocabulary, forcing infrastructure adapters to execute specific queries and map relational data shapes into pure domain objects.
 * **Use it when:** Core domain entities and high-level policies must be protected from database driver volatility and relational algebra churn, enabling fast in-memory unit testing without live datastores.
 * **The cost it charges:** The ongoing cognitive overhead of navigating through abstract interfaces during debugging and the labor of maintaining tedious object-mapping functions between layers.
 * **Full treatment:** Chapter 12 (Dependency Direction and Inversion).
 * **Common misuse:** Speculative future-proofing for hypothetical database vendor swaps ("just in case" migrations that statistically never happen), which introduces useless complexity and blocks developers from utilizing native performance optimizations like specialized database indexes.
**[Dependency Inversion Applied Architecturally]**
 * **What it is:** An architectural mandate requiring source code dependency arrows to point inward toward high-level policy, forcing low-level implementation details at the edges to conform to abstract contracts owned by the core.
 * **Use it when:** Building core business rules, use cases, and software systems expected to outlive specific infrastructure tools and survive multi-year rule evolution.
 * **The cost it charges:** Heavily fractures the codebase across concentric rings, requiring developers to touch files across multiple distinct directory boundaries (controller, use case, interface, repository) for a single feature.
 * **Full treatment:** Chapter 12 (Dependency Direction and Inversion).
 * **Common misuse:** **[Leaky SDKs / Foreign Interfaces]**, where a team relies on a third-party vendor's interface (e.g., cloud client abstractions) that still forces vendor-specific configuration structures or exceptions, leaving contract ownership with the vendor and breaking insulation.
**[The Anti-Corruption Layer (ACL)]**
 * **What it is:** A dedicated, isolated structural translation layer placed at the boundary between an internal domain model and an external or untrusted legacy system to map foreign data payloads into pristine local vocabulary.
 * **Use it when:** Integrating with legacy mainframes, enterprise SaaS platforms, or third-party vendor APIs whose volatile or sub-optimal data models would otherwise bleed into and pollute core application logic.
 * **The cost it charges:** Requires continuous development discipline to maintain translation logic, alongside an execution tax of duplicating objects and allocating extra memory at runtime.
 * **Full treatment:** Chapter 14 (Abstraction Layers: When to Add One).
 * **Common misuse:** **[The Leaky ACL]**, where an interface layer merely adds a passthrough function while continuing to demand external formats (like raw XML strings) or re-throwing vendor exceptions, retaining tight coupling under a false abstraction.
**[Bounded Contexts]**
 * **What it is:** A hardened conceptual and structural perimeter enclosing a specific domain model to guarantee that its internal vocabulary, entities, and validation rules remain completely consistent.
 * **Use it when:** Managing complex enterprise microservice architectures where separate business domains and teams must scale and modify their internal paradigms independently without cross-team lockstep coordination.
 * **The cost it charges:** Mandates the overhead of building and operating explicit translation interfaces or anti-corruption layers whenever data must cross context perimeters.
 * **Full treatment:** Chapter 13 (Coupling and Cohesion at the Architecture Level).
 * **Common misuse:** Forcing a **[Global Canonical Model]** or routing all communication through an Enterprise Service Bus (ESB) that enforces a single enterprise-wide entity schema, reintroducing rigid, system-wide deployment coupling.
## 4. Data ownership and consistency patterns
**[Database-per-Service]**
 * **What it is:** An architectural encapsulation pattern where a service’s underlying datastore, schema, and connection strings are strictly hidden, preventing any external component from reading or writing to it except via designated APIs.
 * **Use it when:** Splitting an application across a network process boundary into independent microservices to guarantee complete team autonomy and schema evolvability.
 * **The cost it charges:** Eliminates the ability to use native database SQL JOINs for cross-domain data, forcing systems to incur latency taxes and handle partial failures via distributed composition layers.
 * **Full treatment:** Chapter 18 (Data Ownership Boundaries).
 * **Common misuse:** The **[Data-Layer Distributed Monolith]**, where an organization provisions separate network microservices but keeps them wired to a shared monolithic database instance, inducing silent schema coupling and semantic column drift.
**[CQRS Projections]**
 * **What it is:** The strict segregation of write models (Commands) from read models (Queries), where downstream components consume asynchronous change data capture or domain events to populate local, read-optimized tables.
 * **Use it when:** Optimizing highly trafficked, read-heavy user interfaces that span cross-domain service boundaries where low read latency is a strict constraint and N+1 network gateway cascades must be eliminated.
 * **The cost it charges:** Enforces an acceptance of eventual consistency, alongside the operational overhead of running event brokers, tracking consumer lags, and handling duplicated storage.
 * **Full treatment:** Chapter 18 (Data Ownership Boundaries).
 * **Common misuse:** Operating with a **[Stale Projection]** during a network partition or consumer crash, causing read-heavy interfaces to serve outdated data that violates current authoritative backend states.
**[The Saga Pattern]**
 * **What it is:** A distributed transaction shape that maintains data consistency across multiple independent service boundaries without locking databases, relying on Choreography or Orchestration to execute sequential local transactions and trigger explicit compensating actions if a step fails.
 * **Use it when:** Managing a multi-step business workflow that spans decoupled asynchronous services where single-database ACID guarantees are physically unavailable.
 * **The cost it charges:** The necessity to manually design, code, and test complementary semantic rollbacks for every phase of the sequence, making tracking and debugging overall state inherently complex.
 * **Full treatment:** Chapter 17 (Synchronous vs. Asynchronous Communication).
 * **Common misuse:** **[The Missing Compensating Action]**, where an engineer fails to implement a rollback path or a mechanism to capture failed compensation attempts, locking the distributed system into a permanently fractured, partially-committed state.
**[Asynchronous Event-Driven Decoupling]**
 * **What it is:** Shifting inter-service communication from synchronous network calls to asynchronous message passing, where an authoritative service writes domain events to an event log (like Kafka) for downstream consumers to process at their own pace.
 * **Use it when:** Eliminating temporal coupling across service perimeters so that individual services can successfully execute writes without requiring all downstream dependencies to be operational and reachable at the exact same millisecond.
 * **The cost it charges:** Forces application layers to handle out-of-order delivery, eventual consistency edge cases, and the infrastructure overhead of managing a centralized messaging fabric.
 * **Full treatment:** Chapter 13 (Coupling and Cohesion at the Architecture Level) / Chapter 17.
 * **Common misuse:** Prematurely adopting deep messaging queues within small development teams, introducing the severe debugging taxes of distributed async logic before organizational headcounts or operational scaling pressures require it.
## 5. API and contract patterns
**[The Sunset Pattern]**
 * **What it is:** A rigid, operationally enforced lifecycle for decommissioning obsolete major API versions by transitioning contracts systematically from Active to Deprecated (issuing programmatic payload warnings), executing temporary simulated brownouts, and concluding with permanent server removal.
 * **Use it when:** Managing SaaS REST APIs, SDKs, or internal microservices where multiple legacy major versions accumulate, creating unsustainable codebase complexity drag and expanding security attack surfaces.
 * **The cost it charges:** Forces uncompensated refactoring labor onto downstream integration consumers, risking platform abandonment if the sunset window is too compressed.
 * **Full treatment:** Chapter 16 (Versioning and Backward Compatibility).
 * **Common misuse:** **[The Silent Deprecation]**, where a team notes deprecation strictly in text documentation without programmatic warnings or brownouts, leading to abrupt outages when servers are turned off while still processing heavy legacy traffic.
**[Explicit Boundary Mapping (Exposed-Surface Discipline)]**
 * **What it is:** An API design pattern that forces strict separation between internal state models and public contracts by utilizing dedicated Data Transfer Objects (DTOs) to expose an intentionally restricted, minimal subset of fields.
 * **Use it when:** Exposing production APIs to distinct consumers where any modification to a field represents a permanent liability that could break static or rigidly typed downstream clients.
 * **The cost it charges:** Requires maintaining extra translation code blocks, custom data validation schemas, and duplicates objects in memory during payload serialization.
 * **Full treatment:** Chapter 15 (API Surface Design: What to Expose, What to Hide).
 * **Common misuse:** **[Internal State Passthrough]**, where an ORM database model is serialized directly to a public JSON response, resulting in a Leaky Database Column where internal metrics leak out, permanently anchoring the database schema to the public API contract.
## 6. Code organization patterns
*(Note: The provided handbook chapters exclude entries for this section; the relevant material on repository package layout resides in Chapter 27.)*
## 7. Concurrency architecture patterns
**[Shared-State Coordination Model]**
 * **What it is:** A concurrency architecture where execution units share a single process memory map and coordinate data access by applying synchronization primitives like locks to explicitly bounded data structures.
 * **Use it when:** Building low-level systems infrastructure, operating system kernels, or custom database storage engine layers where memory allocations are strictly capped and maximizing raw physical hardware throughput is the primary constraint.
 * **The cost it charges:** Introduces severe risks of non-deterministic runtime deadlocks and thread contention bottlenecks that degrade system efficiency if guards are configured incorrectly.
 * **Full treatment:** Chapter 74 (Shared State vs. Message Passing) / Chapter 75.
 * **Common misuse:** Prematurely dividing internal application layers into ultra-fine-grained synchronized blocks or bucket locks before profiling, creating complex, timing-dependent deadlocks that escape integration environments.
**[Message-Passing Coordination Model]**
 * **What it is:** A concurrency model where distinct execution paths communicate and synchronize state exclusively by copying and transmitting data structures across isolated communication channels.
 * **Use it when:** Orchestrating standard business application logic, asynchronous network fleets, or microservice task routing where developer scaling, safety, and operational simplicity outweigh nanosecond micro-benchmarks.
 * **The cost it charges:** Incurs substantial CPU cache line evictions and heap allocation taxes when moving bulky data entities across deep communication pipelines.
 * **Full treatment:** Chapter 74 (Shared State vs. Message Passing).
 * **Common misuse:** Forcing deep message channel routing into ultra-low-latency high-frequency trading engines, where the physical cost of memory allocation breaks strict request latency SLOs.
**[The Actor Model]**
 * **What it is:** An isolated concurrent architecture pattern operating inside specialized virtual runtimes where standalone compute components interact purely via asynchronous messages and delegate all failure containment to external parent supervisor trees.
 * **Use it when:** Operating within native actor frameworks (such as BEAM or Akka) where individual units must fail fast upon encountering a broken invariant, dropping corrupted state completely to be reset by a supervisor.
 * **The cost it charges:** Mandates a complete abandonment of inline defensive try/catch blocks, requiring teams to architect and rely entirely on externalized cascaded crash-recovery trees.
 * **Full treatment:** Chapter 78 (The Actor Model).
 * **Common misuse:** Embedding deeply nested, defensive exception-trapping statements inside an actor’s main message processing loop, locking the thread into a half-mutated, corrupted internal memory state instead of letting it crash cleanly.
## 8. Security architecture patterns
**[Multi-Process Isolated Architecture]**
 * **What it is:** A security and execution pattern that splits concurrent tasks across entirely distinct operating system process boundaries, isolating memory maps completely.
 * **Use it when:** Executing untrusted third-party code plugins, processing independent multi-tenant payloads with rigid security perimeters, or constructing master-worker control lines where a worker crash must never compromise the master engine.
 * **The cost it charges:** Imposes heavy performance and latency penalties driven by mandatory Inter-Process Communication (IPC) serialization across process boundaries.
 * **Full treatment:** Chapter 76 (Async vs. Threads vs. Processes).
 * **Common misuse:** Attempting to host multi-tenant, user-submitted script execution blocks within a shared multithreaded process memory map, allowing a basic memory exploit to breach adjacent tenant namespaces.
 
