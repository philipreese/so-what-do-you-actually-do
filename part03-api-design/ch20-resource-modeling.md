# Chapter 20 — Resource Modeling

**Prerequisites:** [Part II, Ch 04 — Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Part III, Ch 19 — REST vs. RPC vs. Event-Driven](ch19-rest-vs-rpc-vs-event-driven.md). Specifically: information hiding, minimal surface area, progressive disclosure, and REST's resource-oriented ontology.

**New vocabulary introduced:** the action problem

**Key takeaways:**
- Ch 19 settled on exposing resources. This chapter is about what a resource actually is in your domain: a stable, externally meaningful noun with identity and state — not a database table, not an ORM model, and definitely not a controller method wearing a URL as a disguise.
- Model resources around the language the consumer already speaks, not the layout the provider happens to store things in. A resource that's just the database schema in a trench coat couples every client to internal refactors they were never supposed to notice.
- Nest URIs shallowly — one level deep is the practical default, and going further costs more than it looks like. Every extra level of hierarchy encodes a traversal dependency, not just a relationship, and it's the traversal dependency that eventually breaks something.
- Real systems have operations that refuse to map onto CRUD. The sub-resource action endpoint (`POST /orders/{id}/cancel`) is the durable answer: the resource stays the noun, and a complex state transition gets an explicit, unambiguous trigger — a generic command endpoint just turns REST back into RPC with extra steps bolted on.

## For My Wife

> *Model the resource the consumer needs, then build the translation layer to produce it — never the reverse.*

**"Resource modeling" is the question of what a software API pretends the world looks like.** A bank has all sorts of internal data — account tables, transaction logs, fee schedules spread across a dozen database tables — but when you ask for your balance, you don't want all of that. You want one clean answer: your balance. A well-designed API presents that clean answer as its own self-contained "thing," even if assembling it requires querying fifteen tables behind the scenes. The alternative — just reflecting the internal database structure directly out to the world — means every time an engineer reorganizes how data is stored, everyone using the API breaks.

**The chapter also settles a recurring architectural argument: what do you do when a real business action doesn't fit neatly into the basic "create, read, update, delete" categories?** Canceling an order is the canonical example. You could model it as a data update (`change status to "canceled"`), but that hides what's actually happening — it triggers refunds, notifies warehouses, cancels shipping. The better answer is to give it an explicit endpoint of its own (`POST /orders/123/cancel`), so the intent is unmistakable, not buried inside a field value someone has to diff against the previous state to notice changed.

The chapter takes a firm position: build a translation layer between your database and your API surface, not because it's theoretically cleaner, but because the alternative quietly makes your internal refactors into your customers' problem. Skip the translation layer once and your API contract is now forever entangled with your storage schema — and storage schemas are supposed to be an implementation detail nobody outside your team ever has to think about.

---

## Domain Nouns, Not Schema Projections

**What it is:** Defining URIs and resource payloads around business concepts the consumer understands, deliberately hiding the provider's internal database schema rather than reflecting it.

**Why it exists:** A resource that's a serialized database table couples the API contract directly to the provider's storage engine. Normalize a table and the contract snaps — and the consumer was never even supposed to know that table existed to begin with.

**Options:**
1. **Schema-driven resources** — URIs map 1:1 onto internal tables (`/users`, `/user_roles`, `/user_preferences` as separate endpoints)
2. **Domain-driven resources** — URIs map onto aggregated business concepts (a single `/accounts` resource, internally assembled from several normalized tables)

**Trade-offs:**
- *Schema-driven:* fastest thing you'll ever ship — an ORM entity serializes straight to JSON, zero mapping code — but it torches information hiding on the spot, forcing the consumer to learn your relational structure and usually to make several round trips just to reassemble one business entity.
- *Domain-driven:* the external contract stops caring what happens to internal storage, so the database gets refactored without a single client noticing — for the price of a real translation layer (DTOs, Ch 11) and runtime aggregation overhead somebody has to maintain.

**When to choose each:**
- *Domain-driven:* the default for any external, public-facing API or cross-service contract.
- *Schema-driven:* acceptable only for rapid internal tooling where the consumer and the database are owned by the exact same team.

**Common failure modes:**
- **The normalization leak:** an engineer normalizes `shipping_address` out of the `orders` table, purely for storage hygiene. Because the API was schema-driven, `/orders` quietly stops returning the address, and every client that expected it breaks at once — a tidy storage optimization turned into an uncoordinated breaking change nobody signed up for.
- Exposing raw table names as resources (`/user_table`, `/order_rows`), so the resource shape reshuffles itself every time the schema does.

**Example:** Stripe's `Charge` object is a single, cohesive domain noun through and through. Fetch one and you get one clean JSON entity back, even though building it internally means querying legacy banking gateways, fraud models, and a dozen heavily sharded tables behind the scenes. The client never learns any of that exists, and doesn't need to. **[Strong Recommendation: model the resource the consumer needs, then build the translation layer to produce it — never the reverse]**

---

## Hierarchical Nesting Limits

**What it is:** The constraint applied to URI depth when one resource logically belongs to another (an item within an order within a user).

**Why it exists:** A resource's identity ought to stand on its own two feet. Every level of nesting beyond what scoping actually requires chains that resource's identity to one specific path through its parents — a structural dependency wearing the disguise of a URL convention.

**Options:**
1. **Deep nesting** — the URI reflects the full ownership chain (`/users/{user_id}/orders/{order_id}/items/{item_id}`)
2. **Shallow nesting (≈1–2 levels)** — nesting is used only for collection scoping; individual resources get flat, globally unique identifiers (`/users/{user_id}/orders` to list, but `/orders/{order_id}` and `/items/{item_id}` to fetch directly)

**Trade-offs:**
- *Deep nesting:* the URL tells you the entire context at a glance — but it's brittle glass. The instant an item is allowed to belong to more than one order, the URL structure has no way to say so, because it never occurred to anyone it might need to.
- *Shallow nesting:* routing gets maximally flexible and every resource gets a stable identifier that outlives whatever the business logic above it does next — but it demands globally unique IDs instead of parent-scoped composite keys, and shoves authorization out of the URL path and squarely into the business tier, where somebody now has to handle it on purpose.

**When to choose each:**
- *Shallow nesting:* the default. Stop nesting after one level.
- *Deep nesting:* only when a child resource is mathematically incapable of existing without its parent and relies on a sequential ID scoped to that parent (`/orders/123/lines/1`).

**Common failure modes:**
- **The traversal trap:** a client receives an alert carrying an `item_id`, nothing more. Because the API enforces deep nesting, it can't just go fetch the item — it has to brute-force search every parent `/orders` endpoint first, purely to reconstruct a URL it should've been able to build in one line.
- URLs that mirror an ORM join path instead of a relationship the consumer actually asked for (`/orgs/{id}/teams/{id}/members/{id}/permissions`), where every level the client didn't already have in hand has to be discovered first, one round trip at a time.

**Example:** GitHub nests exactly one level deep because an issue really is scoped to a repository: `/repos/{owner}/{repo}/issues`. It stops right there — fetching a specific comment doesn't require walking through the issue number first. The moment an entity earns its own global identity, GitHub reaches it directly instead of dragging it deeper into the tree.

---

## The Action Problem

**What it is:** The recurring case where a real business operation — canceling an order, refunding a payment, publishing a draft — doesn't map cleanly onto `PUT` (full replace) or `PATCH` (partial update).

**Why it exists:** HTTP verbs are plumbing; business processes are domain-specific and don't care about plumbing. Cram a multi-step state transition into a generic CRUD verb and you hide the actual business intent from the request itself — and that's exactly the spot where a dangerous side effect goes missing.

**Options:**
1. **Generic state patching** — the client mutates a status field directly (`PATCH /orders/123 {"status": "canceled"}`)
2. **Sub-resource action endpoint** — the provider exposes an explicit verb on the resource (`POST /orders/123/cancel`)
3. **Shapeless command endpoint** — the provider abandons resource routing entirely (`POST /cancelOrder`)
4. **Separate action resource** — the action itself becomes a resource with its own lifecycle (`POST /refunds {"charge_id": "ch_1"}`), reserved for actions complex enough to deserve one

**Trade-offs:**
- *Generic state patching:* the architecturally "purest" flavor of REST you can write, right up until the server has to diff the incoming payload against current state just to guess what the client actually meant — guess wrong, and a side effect like an actual refund can silently just never fire.
- *Sub-resource action:* the resource stays the noun and the command becomes explicit and unambiguous — for the price of a non-noun path segment that will offend a strict REST purist on sight.
- *Shapeless command endpoint:* maximum clarity for that one operation, and a quiet demotion of the whole API into RPC with extra steps bolted on, losing every bit of the predictability and cacheability the resource model existed to provide.

**When to choose each:**
- *Sub-resource action:* the default for state-machine transitions and any mutation that triggers a real side effect.
- *Generic state patching:* literal data-entry updates only — changing a display name, not canceling an order.
- *Separate action resource:* when the action itself has a lifecycle worth tracking independently (a `Refund`, a `Dispute`).

**Common failure modes:**
- **The implicit side effect:** a client sends `PATCH /invoices/1 {"status": "paid"}` just to update a UI. The database write succeeds fine, but because the intent behind it was never actually expressed, the integration that charges the payment gateway never fires at all. The invoice says paid. The money was never collected. Nobody notices until reconciliation.
- Generic `/doSomething`-style endpoints piling up over time as whatever engineer was in a hurry took the path of least resistance for something that didn't fit cleanly anywhere else.

**Example:** Stripe's `PaymentIntent` models a transaction's lifecycle as an honest state machine. You don't `PATCH` a payment through its own security checks — you call `POST /v1/payment_intents/{id}/capture` or `.../cancel`. The resource stays the noun, the transitions are explicit sub-resource verbs, and POST gets to play its natural role here as the verb of last resort for anything that won't fit `GET`/`PUT`/`PATCH`/`DELETE`. **[Consensus: sub-resource action endpoints over generic command endpoints, the moment a mutation has a real side effect attached to it]**

---

## Resource Relationships: Embedding vs. Referencing

**What it is:** Whether a resource includes the full data of a related resource directly in its payload (embedding) or only a reference to it that requires a follow-up request (referencing).

**Why it exists:** This is a straight trade between network round-trips and payload size — and a less obvious one between developer convenience and whether your cache can be trusted at all.

**Options:**
1. **Referencing** — the parent includes only an ID or URI of the related resource (`"user_id": "usr_123"`)
2. **Embedding** — the parent serializes the full related object directly into its own payload
3. **Hybrid / expansion** — referencing by default, with embedding available on request through a progressive-disclosure parameter (Ch 15) like `?expand=user`

**Trade-offs:**
- *Referencing:* payloads stay lean and cache boundaries stay clean — the referenced resource changes and the parent's cached copy is still perfectly valid — but the client eats extra round-trips (the N+1 problem) just to assemble the full picture it actually wanted.
- *Embedding:* one round-trip, everything included, which genuinely feels better on the client side — but payloads bloat with data half the callers never asked for, and cache invalidation turns into a lost cause, since a change anywhere in the embedded graph drags the parent down with it.

**When to choose each:**
- *Referencing:* the default for cross-domain entities and any public API.
- *Embedding:* only for a child resource that's structurally bounded by its parent with no standalone lifecycle (line items inside an invoice).
- *Hybrid:* most production APIs in practice — reference by default, let the client opt into the round-trip cost it actually wants.

**Common failure modes:**
- **The accidental god object:** an engineer embeds relations by default to make the UI's job easier. Fetching a `Comment` embeds its `Author`, which embeds the author's `Company`, which embeds the company's `BillingHistory`. A request for a ten-word comment now generates a multi-megabyte payload and exhausts the database connection pool — a pure side effect of how far the embedding was allowed to cascade before anyone drew a line.

**Example:** GitHub leans on referencing specifically to protect its own infrastructure: fetching a pull request returns flat IDs and explicit hypermedia links (`"commits_url": "https://api.github.com/..."`), and the client has to deliberately walk the link rather than getting handed an unbounded object graph it never asked for.

---

## Why Smart Engineers Disagree: Purity vs. Pragmatism in Action Verbs

The most persistent fight in resource modeling is the action problem, and underneath it is a disagreement about what REST's noun constraint was ever actually for.

REST purists argue everything can and must be a noun, no exceptions. Canceling an order should never be `POST /orders/123/cancel` — it should be `POST /cancellations {"order_id": 123}`, minting a `Cancellation` as its own independent, trackable resource. That preserves the strict noun/verb uniformity REST promises, and it's not nothing: the cancellation now has an identity, a history, something queryable later.

Pragmatic engineers call this architectural gymnastics. A cancellation is an action, not an entity, and forcing it to play dress-up as one buys a confusing developer experience: the client now has to manage the lifecycle of an object that exists purely to satisfy someone's modeling rule, not because the business ever thought of "a cancellation" as a thing with its own identity.

The deciding question isn't who's more correct about REST theory — it's whether the resource is stable and meaningful enough on its own to actually earn noun status. A `Refund` genuinely has its own lifecycle — issued, reversed, disputed — and earns the separate-resource treatment fair and square. A plain order cancellation usually doesn't, and manufacturing a noun for it anyway is accidental complexity (Ch 02) bought at full price for theoretical purity, not for anything the consumer ever needed. Optimize the boundary for the human reading the API. Uniformity with no practical payoff isn't a virtue, it's a tax.

*Concepts expanded in later chapters: error response structure for these endpoints (Part III, Ch 21), idempotency guarantees for state-mutating actions (Part III, Ch 22), pagination of resource collections (Part III, Ch 23).*
