# Chapter 13 — Coupling and Cohesion at the Architecture Level

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md), [Part II, Ch 10 — Monolith vs. Service Decomposition](ch10-monolith-vs-service-decomposition.md), [Ch 12 — Dependency Direction and Inversion](ch12-dependency-direction-inversion.md). Specifically: afferent/efferent coupling, connascence, partial failure, and the distributed monolith anti-pattern.

**New vocabulary introduced:** bounded context, temporal coupling

**Key takeaways:**
- Coupling and cohesion don't change definition at the architecture level, but the stakes do: a coupling mistake between services produces network partitions and coordinated deployments instead of a local compile error, because interfaces are far harder to change once another team depends on them.
- The question this chapter answers is where service boundaries belong. The domain-driven-design answer is the bounded context — the largest scope within which a domain model's terms and rules stay internally consistent. That's architectural cohesion: everything inside shares one model; the interface to the outside is narrow and deliberate.
- The shared database is the canonical architectural-coupling failure. Two services querying the same tables are tightly coupled through the schema no matter how independently they're deployed — a single column change now requires coordinating both.
- Event-driven communication reduces temporal coupling between services, at a real cost: eventual consistency, and debugging that now has to follow an indirect, asynchronous causal chain instead of a stack trace.

## For My Wife

**Chapter 3 covered coupling and cohesion at the level of a single module. This chapter asks what happens when those same ideas apply to entire services talking to each other over a network — and the answer is that the same mistakes cost dramatically more.**

**The central design question is where to draw the boundary between services.** The chapter's answer is the *bounded context* — the zone inside which one model of the business stays internally consistent. "User" in the billing system means someone with a credit card, a billing address, and a tax ID. "User" in the authentication system means someone with a password hash and a second factor. Treating those as the same entity, because they share a name, is exactly how you end up with one enormous `User` object dragging along fields that half the system has no use for, owned by nobody in particular, and changed constantly for reasons every other team has to absorb whether they wanted to or not.

**The shared database is where this goes wrong most visibly.** When two independently deployed services both run queries against the same database tables, they're coupled through the table schema — tightly — regardless of how independent their code looks. The moment one team renames a column, every other service touching that table has to be updated and redeployed at the same moment. That's not independent deployment; that's just a distributed monolith wearing a disguise. The fix is for each service to own its data completely and expose it only through its own API, never through the tables directly.

Services that genuinely need to communicate without being tightly coupled to each other's availability publish events — announcements that something happened — to a shared broker instead of calling each other directly. The publisher doesn't wait for every subscriber to react. The downside is that the system is now *eventually consistent*: a user who changes their password and immediately tries to log in might find the new password not yet recognized, because the relevant service hasn't processed the event yet. That window is usually milliseconds, but it's real, and the 2am page that comes from a business process failing because a projection fell hours behind is a very specific kind of bad night.

## For My Kids

Say Chess Club and Robotics Club are two totally separate clubs — different presidents, different meeting days, different everything. But whoever set up sign-ups years ago put both clubs on the exact same shared spreadsheet, different tabs, because it was sitting right there and seemed efficient.

**That looks like two independent clubs. It isn't.** Robotics decides to reorganize its tab — adds a column for "which robot kit," reorders a few others — and somehow Chess Club's sign-up sheet breaks too, the day before tryouts. Nobody on Chess Club touched a single cell. They didn't need to. Both clubs were quietly leaning on the same underlying sheet the whole time, and Robotics just proved it by moving something.

**The two clubs were never actually separate — they just looked that way from the outside**, right up until one of them changed something and the "unrelated" club took the hit anyway.

The fix isn't complicated: each club gets its own sheet, full stop. If Robotics genuinely needs to know how many Chess members also do Robotics, someone asks the Chess president for that one number directly — instead of reaching into Chess's actual sheet and hoping nothing they touch matters to anyone else.

---

## Bounded Contexts as Architectural Cohesion

**What it is:** A bounded context, borrowed from Eric Evans's *Domain-Driven Design*, is the perimeter inside which one domain model and its vocabulary stay internally consistent. It's high cohesion (Ch 03), just applied at the scope of an entire service or subsystem instead of a single module.

**Why it exists:** Large systems always end up with two incompatible meanings for the same word, whether anyone planned it or not. "User" in a billing context needs a credit card, a billing address, a tax ID. "User" in an authentication context needs a password hash and a second factor. Cram both into one global entity and you haven't unified the domain — you've just hidden the fact that two entirely different models got welded together because they happened to share a name.

**Options:**
1. **Global canonical model** — one enterprise-wide schema for each entity, used identically by every service
2. **Bounded contexts** — each context defines its own model in its own vocabulary, with explicit translation where contexts exchange data

**Trade-offs:**
- *Global canonical model:* no duplication, one shared mental model everyone starts from — and every team is now coupled to the same schema, so a change billing needs forces auth to absorb a schema update it had no stake in whatsoever.
- *Bounded contexts:* maximum team autonomy, since each service only models exactly what it actually needs — and every crossing between contexts now needs translation logic, which somebody has to keep maintaining as both sides keep evolving out from under it.

**When to choose each:**
- *Global canonical model:* foundational primitive types, and nothing else, or a system small enough to still be one deployable with one team behind it.
- *Bounded contexts:* the default the moment there's more than one team, or more than one domain that's genuinely distinct from the others.

**Common failure modes:**
- **The shared-vocabulary illusion:** two services use the word "Order" or "Account," assume that means they're talking about the same thing, and find out otherwise the day one context adds a field that silently breaks an assumption the other context was quietly relying on.
- **The Enterprise Service Bus hub-and-spoke:** every inter-service message gets funneled through one central bus into one massive canonical schema, which becomes the tightest coupling point in the entire system — every service is now coupled to the bus's release schedule, on top of whatever it was actually coupled to before.

**Example:** In an e-commerce system, Shipping and Inventory are separate bounded contexts. They trade a narrow, deliberate event payload — `OrderPlaced` — instead of sharing one sprawling `Order` object dragging along UI rendering fields the warehouse has no earthly use for. **[Consensus: a bounded context, not a database table or a team, is the right unit to draw a service boundary around]**

---

## The Shared Database Anti-Pattern

**What it is:** Two or more independently deployed services reading and writing the same database schema directly, bypassing each other's interfaces entirely.

**Why it exists:** Almost nobody chooses this on purpose. It's what happens when a team extracts a service and doesn't want to design, or wait for, a real data interface yet. It buys short-term convenience and spends the exact autonomy the extraction was supposed to earn in the first place.

**Options:**
1. **Shared schema** — multiple services connect to the same database and query the same tables directly
2. **Strict ownership** — each service exposes its data only through its own API; no other service touches its tables

**Trade-offs:**
- *Shared schema:* trivial cross-service queries — an ordinary SQL join, no network overhead at all — and it destroys deployment independence outright. Change one column and now every service touching that table needs a coordinated, simultaneous release.
- *Strict ownership:* real schema autonomy, real deployment independence — and data integration moves off the database and onto the network instead. A join becomes an API call, an async projection, or a separate analytical store, all of which Ch 18 covers in more depth.

**When to choose each:**
- *Shared schema:* acceptable only inside a deliberate modular monolith (Ch 10), where the deployment unit genuinely is one thing.
- *Strict ownership:* non-negotiable the moment a service gets extracted into its own independently deployed unit.

**Common failure modes:**
- This is exactly how a [distributed monolith](../part01-systems-thinking/ch03-coupling-and-cohesion.md) forms at the data layer: an organization splits one monolith into a dozen services and leaves the original database sitting underneath all of them, unchanged — paying the full latency and operational tax of distribution while keeping every bit of the monolith's deployment coupling intact.
- **Read-your-neighbor's-table:** a service skips another service's API entirely because the data is "right there" in the shared schema, quietly reintroducing the exact coupling the API boundary existed to prevent.

**Example:** Checkout and Inventory both running `UPDATE` statements against the same `products` table will, eventually, corrupt each other's assumptions about what that table even means. A properly cohesive boundary makes Checkout call Inventory's API to reserve stock instead — the schema stays entirely behind Inventory's interface, which is just information hiding (Ch 04) showing up again at the network level. **[Strong Recommendation: database-per-service is a hard prerequisite for extraction, not an optional hardening step]**

---

## Event-Driven Decoupling

**What it is:** Services talking to each other by publishing and consuming events through a broker instead of calling each other synchronously — swapping a direct call for an announcement that something happened, with no expectation anyone's listening in real time.

**Why it exists:** A synchronous call creates **temporal coupling**: caller and callee both have to be up, healthy, and reachable at the exact same instant — the architectural version of the connascence of execution order from [Ch 03](../part01-systems-thinking/ch03-coupling-and-cohesion.md). Block on a downstream call and that downstream service's availability just became your availability too, whether you agreed to that or not. Publish an event instead, and the publisher finishes its own work and answers its own caller without waiting around for every interested party to get around to reacting.

**Options:**
1. **Synchronous request/response** — services call each other directly and block for the result
2. **Asynchronous event choreography** — services publish events to a broker; interested services subscribe and react independently

**Trade-offs:**
- *Synchronous:* immediate consistency, a call chain you can actually debug in a straight line — and a failure anywhere in that chain propagates straight back to the caller (Ch 07), immediately, whether the caller wanted to know about it or not.
- *Asynchronous:* a publisher can tell its own caller "done" even while a downstream subscriber is completely offline — and every subscriber is now eventually consistent instead of immediately consistent, and tracing a bug means following an indirect trail through a broker instead of just reading a stack trace.

**When to choose each:**
- *Synchronous:* queries, and any operation where the caller genuinely cannot take another step without the answer in hand.
- *Asynchronous:* state-changing side effects and cross-domain notifications, wherever the caller doesn't actually need to wait around for every consumer to finish reacting.

**Common failure modes:**
- **Eventual-consistency collapse:** a user changes their password, that change goes out as an event, and they immediately try to log in — and the login fails, because the auth service hasn't consumed the event yet. The system is doing exactly what an eventually-consistent system is supposed to do. It's just not what the user experiences as "done."
- **Event explosion:** every state change spawns its own event with no clear owner of what any of them actually mean, until the event stream is harder to reason about than the synchronous calls it was supposed to replace.

**Example:** When a user registers, the user service doesn't call email, billing, and analytics synchronously one after another. It writes a single `UserRegistered` event to a Kafka topic, and each of those services consumes it at whatever pace suits it, fully decoupled from the user service's uptime. What delivery guarantees a broker like Kafka actually provides, and how to design around them, gets covered in depth in [Ch 17](ch17-sync-vs-async-communication.md).

---

## Why Smart Engineers Disagree: Strict Autonomy vs. Operational Simplicity

The sharpest divide in boundary design runs between engineers optimizing for team autonomy and engineers optimizing for operational simplicity, and it tracks organizational scale almost exactly.

Engineers at large organizations push hard for strict database-per-service isolation and asynchronous decoupling everywhere they can get it. They've watched a shared dependency become the single thing blocking an entire team's roadmap, and they'll happily eat the cost of eventual consistency, distributed tracing, and message brokers as the price of never again waiting on someone else's deploy.

Engineers at smaller organizations argue event-driven microservices are an accidental-complexity trap dressed up as best practice: debugging eventual consistency across a dozen bounded contexts costs more, cognitively, than two teams simply agreeing on a deployment window ever would.

Conway's Law (Ch 08) settles this better than either side's general argument does. At a few hundred engineers, communication overhead is large enough that architectural decoupling, complexity tax and all, pays for itself many times over. At twenty engineers, that exact same tax is pure speculative future-proofing (Ch 05) — there's no coordination cost yet worth solving for. Bounded contexts deserve to harden into actual network partitions once the organization's communication structure has genuinely grown enough to need it, not on the hope that it eventually will.

*Concepts expanded in later chapters: messaging mechanics, ordering, and delivery guarantees (Part II, Ch 17); data ownership and the database-per-service pattern in depth (Part II, Ch 18).*
