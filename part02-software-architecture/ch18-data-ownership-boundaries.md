# Chapter 18 — Data Ownership Boundaries

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Part II, Ch 10 — Monolith vs. Service Decomposition](ch10-monolith-vs-service-decomposition.md), [Ch 13 — Coupling and Cohesion at the Architecture Level](ch13-coupling-cohesion-architecture-level.md), [Ch 17 — Synchronous vs. Asynchronous Communication](ch17-sync-vs-async-communication.md). Specifically: connascence of schema and value, the distributed monolith anti-pattern, and temporal coupling.

**New vocabulary introduced:** database-per-service pattern, CQRS (Command Query Responsibility Segregation)

**Key takeaways:**
- In a decomposed system, boundaries are defined by who controls the data, not by where the code lives. Every piece of mutable data needs exactly one authoritative owner; everyone else gets a read-only view through that owner's API, never direct access to its storage.
- The shared database is the central failure mode of this chapter, as it is of Ch 13: two services querying the same tables are coupled by schema regardless of how independently they're deployed, and that coupling shows up as a data-layer distributed monolith.
- When multiple services have a legitimate interest in the same entity, ownership goes to whichever service controls its lifecycle — creation, valid state transitions, deletion — not to whichever service uses it most.
- Database-per-service breaks the trivial SQL join. CQRS is the mechanism for getting a fast, cross-domain read back without giving any other service write access to data it doesn't own: the owner emits events, and downstream services build their own local, eventually consistent projections.

## For My Wife

**In a system split into separate services, the real boundary isn't where the code lives — it's who controls the data.** This chapter's position is unequivocal: every piece of mutable data needs exactly one service that owns it, and everyone else has to ask that service through its public interface. No side doors. No other service connecting directly to its database tables.

**The shared database is the canonical way this goes wrong.** An organization splits into fifteen services in the name of independence, then leaves all fifteen of them pointing at the same PostgreSQL database. One team changes a column name. Three other services break simultaneously because they were running queries against a table they were never supposed to touch. The services were deployed independently; the data was never independent at all. All the operational complexity of a distributed system, and the deployment coupling of a monolith, at the same time.

**The tiebreaker for "who owns what" is lifecycle.** When multiple services all have a legitimate interest in the same entity — the auth service, the billing service, and the profile service all care about a "User" — ownership goes to whichever service controls creation, valid state transitions, and deletion. The others hold a reference (a user ID) and ask the owner's API when they need more. Letting multiple services freely mutate the same entity is how you end up with a user's email updated in one database but not another, password reset emails going to the new address while marketing emails keep going to the old one.

The cost of strict data ownership is that the cheap SQL join across tables is gone. A page that used to answer with `SELECT orders.*, users.name FROM orders JOIN users` now has to either make multiple API calls in real time — which creates latency and temporal coupling — or maintain a local read-optimized projection, built from events the owner publishes. That projection will occasionally be stale. The chapter is clear-eyed about this: that's the price of the boundary, and the boundary is worth it, because the alternative is a schema that can't be changed without coordinating a dozen deployments simultaneously and hoping nobody missed the memo.

---

## State Isolation: The Database-per-Service Pattern

**What it is:** Each service's persistence layer — schema, connection string, storage engine, all of it — is reachable by exactly one service. Nobody else connects to it directly. Everything else goes through the owner's API, no shortcuts.

**Why it exists:** To close off the most direct road to architectural coupling there is: the shared database. Two services querying the same tables are coupled by connascence of schema (Ch 03) no matter how independently they claim to be deployed — change a column's type in one and the other breaks immediately, deployment pipelines be damned.

**Options:**
1. **Shared database schema** — multiple services connect to the same database and query the same tables directly
2. **Database-per-service** — each service owns its datastore exclusively; everything else goes through its API

**Trade-offs:**
- *Shared schema:* cross-domain data is one trivial, fast SQL join — and deployment autonomy is gone, because neither service actually understands the other's query patterns, so renaming one column now needs a coordinated cross-team release just to be safe.
- *Database-per-service:* deployment isolation and schema autonomy are simply guaranteed — the owner could swap PostgreSQL for MongoDB tomorrow without telling a soul — and a cross-domain query that used to be a join is now an API call or an async projection, with all the latency and partial-failure cost that comes attached.

**When to choose each:**
- *Shared schema:* only inside a deliberate modular monolith (Ch 10), where the whole thing deploys as one unit anyway.
- *Database-per-service:* the hard prerequisite the moment a real process boundary exists.

**Common failure modes:**
- **The data-layer distributed monolith:** an organization splits into fifteen microservices chasing velocity, and leaves every single one of them plugged into the same legacy PostgreSQL database. Table semantics drift as different teams overload the same columns for different purposes nobody documents, and the shared database becomes a fragile central bottleneck — every operational cost microservices are known for, and none of the autonomy they were supposed to buy.

**Example:** In a properly decoupled architecture, the billing service owns the `invoices` table, completely. If support needs a user's invoice history, it doesn't run `SELECT * FROM invoices` — it calls `GET /billing/users/{id}/invoices`, same as anyone else would have to. Billing is the absolute gatekeeper of its own data, no side doors. **[Strong Recommendation: database-per-service is a hard prerequisite for extraction, not a hardening step to get to eventually]**

---

## Lifecycle-Based Ownership

**What it is:** The tiebreaker rule for the fight that always eventually happens when more than one service has a legitimate claim on the same entity — a "User," an "Order," a "Product."

**Why it exists:** Ownership is almost never obvious for an entity that several domains genuinely care about. Authentication, profile, and billing all need data about a "User," and without an explicit rule saying who's actually in charge, more than one of them starts validating and mutating the same entity, and their assumptions quietly drift apart until nobody's model matches anybody else's.

**Options:**
1. **Multiple writers** — any service that needs the entity can mutate it directly
2. **Lifecycle authority** — one service, the one that controls creation, valid state transitions, and deletion, is the sole owner; everyone else holds a read-only reference

**Trade-offs:**
- *Multiple writers:* any team can build features touching the entity without waiting on another team's API roadmap — and validation rules duplicate and drift apart quietly, until one service happily accepts a state the other considers flatly invalid.
- *Lifecycle authority:* one source of truth, one place business rules actually get enforced — and every other service now has to ask the owner for a change instead of just reaching in and making it themselves.

**When to choose each:**
- *Lifecycle authority:* the default, without exception, for any entity crossing a service boundary.
- *Multiple writers:* never, for a core domain entity shared across services — it isn't a real option, it's the failure mode this section exists to name.

**Common failure modes:**
- **The split-brain entity:** the auth service updates a user's email in its own database, and the marketing service keeps a separate `users` table nobody ever notified. Password resets now go to the new address. Promotional email keeps going to the old one. The entity's state has fractured across the architecture, and there's no single copy of it left that's simply correct.

**Example:** In an order management system, the cart service creates a cart, but the moment checkout completes, the order service becomes the sole lifecycle authority over the `Order`. The fulfillment service is the one that physically ships the package, and it still doesn't own the order entity — it holds the `order_id` as a reference and sends an `UpdateOrderStatus` command back to the order service to actually change the state that counts. **[Consensus: ownership follows lifecycle control, not usage frequency]**

---

## Cross-Boundary Queries: CQRS and Projections

**What it is:** Command Query Responsibility Segregation splits the model used to write data from the model used to read it. Applied across service boundaries, it's how you build a fast, local, read-optimized view of data that some other service, not you, actually owns.

**Why it exists:** Database-per-service costs you the SQL join, and there's no getting around it. A page that combines data from a user service, an order service, and a catalog service can't make three synchronous calls in real time without gambling with the latency SLO — an N+1 fan-out across service boundaries costs vastly more than the same fan-out ever would inside one database.

**Options:**
1. **Synchronous API composition** — a gateway calls each owning service in real time and joins the responses in memory
2. **Asynchronous CQRS projections** — the owner publishes domain events; downstream services consume them and build their own local, read-optimized tables

**Trade-offs:**
- *API composition:* conceptually simple, always immediately consistent — and it creates real temporal coupling, since the query fails the second any one upstream service goes down, and the latency tax stacks up with every additional service thrown into the composition.
- *CQRS projections:* fast local reads with zero temporal coupling — query the downstream service even while the owner is completely offline — and the projection is now eventually consistent, lagging the source of truth by however long the event pipeline takes, plus real, ongoing operational weight from running a broker and event-handling infrastructure just to make this work.

**When to choose each:**
- *API composition:* low-volume internal dashboards or anywhere immediate consistency is a hard regulatory requirement.
- *CQRS projections:* high-traffic, read-heavy, cross-domain interfaces where latency and availability matter more than read freshness.

**Common failure modes:**
- **The stale projection:** the event broker partitions, or the consumer just crashes, and a search service stops receiving `ProductUpdated` events. Its index falls hours behind the authoritative catalog, and customers keep buying items the product service already knows are out of stock — the projection isn't lying, exactly. It's just telling you something that used to be true.

**Example:** A product service owns its catalog as an immutable event log — `ProductCreated`, `PriceChanged`. A search service never lays a finger on the product service's database. It subscribes to that event stream instead and builds its own Elasticsearch index from it. The search service owns its projection. The product service, unambiguously, owns the data.

---

## Why Smart Engineers Disagree: Data Ownership vs. Analytical Velocity

The most persistent conflict over data ownership isn't really between two architectural camps — it's between software engineers and data engineers, and they're optimizing for genuinely different workloads that just happen to want the same data.

Software engineers, focused on transactional correctness, defend database-per-service without an inch of compromise: it's the only thing standing between the live product and schema chaos, and a shared database is the worst anti-pattern on the entire menu, full stop.

Data engineers and analysts, focused on analytical queries, look at that exact same boundary and see an organizational disaster. A question as ordinary as "which products are most popular with enterprise users" now needs brittle ETL pipelines dragging data back out of a dozen APIs, instead of one SQL join across two tables the way it would have been a decade ago.

Both are correct about the workload sitting in front of them, and the fix was never to weaken the operational boundary — it's to stop asking one system to answer both questions. Operational databases keep strict database-per-service isolation to protect the live application, full stop, no exceptions. Those same services emit change-data-capture or domain events into a centralized data warehouse instead, which becomes one shared, read-only projection built specifically for analytical work. The operational boundary stays exactly as strict as it needs to be. The analytical question gets a system of its own to live in, instead of a join that would have put production uptime on the line just to answer it.
