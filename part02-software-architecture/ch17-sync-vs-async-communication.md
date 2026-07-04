# Chapter 17 — Synchronous vs. Asynchronous Communication

**Prerequisites:** [Part I, Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md), [Ch 08 — Local vs. Global Optimization](../part01-systems-thinking/ch08-local-vs-global-optimization.md), [Part II, Ch 13 — Coupling and Cohesion at the Architecture Level](ch13-coupling-cohesion-architecture-level.md). Specifically: partial failure, Little's Law, and temporal coupling.

**New vocabulary introduced:** saga pattern, compensating action

**Key takeaways:**
- The choice between synchronous and asynchronous communication is not primarily about performance — it's about temporal coupling (Ch 13). A synchronous call requires caller and callee to both be healthy at the same instant; an asynchronous one doesn't.
- A synchronous chain fails by propagation: one slow or down dependency exhausts threads and connection pools all the way up the call stack. An asynchronous one fails by divergence: the caller succeeds while the system has not yet converged on the truth.
- Exactly-once delivery across a real network boundary is not achievable — only at-most-once or at-least-once are. Production systems should default to at-least-once and build idempotency into every consumer, not chase the illusion of exactly-once.
- Once a write spans more than one service, there is no database transaction to roll back. The saga pattern coordinates multi-step distributed work with explicit compensating actions instead, and it's measurably harder to reason about than a transaction — adopt it only when the workflow genuinely can't be a single service's job.

## For My Wife

**When one service needs something from another, it has two options: wait, or don't.** Synchronous communication is a phone call — the caller dials, waits on hold, and can't do anything else until the call is resolved. Asynchronous is a text message — it fires off, and the sender moves on immediately, with the recipient responding whenever they're able. The chapter's argument is that the choice between these is mostly about how far a failure can spread, not about how fast things run.

**The failure-propagation difference is concrete.** Service A calls Service B, which calls Service C. C hits a database deadlock and takes ten seconds to respond. B's threads are all stuck waiting on C. A's threads are all stuck waiting on B. Within seconds, a localized problem in C has consumed every available resource in all three services simultaneously. Nothing else A or B are supposed to be doing is getting done. This is what the chapter calls a cascading timeout — the network call version of a traffic jam that starts with one fender bender and backs up twenty miles.

**The asynchronous version of the same system publishes an event when work happens, and each interested party processes it independently.** The publisher announces "an order was placed," marks its own work complete, and returns immediately. The billing service, the inventory service, and the analytics system each pick that event up on their own schedule. If billing is down for an hour, the event waits in the broker until billing comes back — the other services are unaffected, and the user saw a success response. The tradeoff is that the system is now *eventually consistent*, meaning there's a real gap between "the event was published" and "everyone's state reflects it." For most side effects — sending a confirmation email, updating a dashboard — that gap is acceptable. For the step that charges a credit card, it sometimes isn't.

The saga pattern is the answer for when a multi-step transaction has to span services and stay consistent. Unlike a database transaction, there's no automatic rollback: if step three fails, the system has to run explicit "compensating actions" for steps one and two — manually issuing a refund, manually marking an order failed. That's code someone has to write, test, and watch. If the compensating action itself fails and nobody's watching the dead-letter queue, the system gets stuck half-committed, and the only way to find out is a customer calling support.

## For My Kids

Say your phone's about to die and you need a charger, so you call a friend who's already at the hangout spot. **She doesn't have one either, so she puts you on hold and calls a second friend to check — and now you're just standing there, stuck on a call you can't hang up on, because hanging up means losing the whole chain.** The second friend takes a minute digging through her bag. You didn't do anything wrong. Everyone in that chain just has to stay on the line at the same exact moment for it to work at all.

**Now picture the other way: you text the group chat, "anyone have a charger?" and go back to getting ready.** You're not standing by the phone waiting on anyone. Whoever sees it and has one replies whenever they check — five minutes from now, twenty, doesn't matter, because you were never stuck holding still for it.

**The trade is real, though.** The phone call gets you an answer immediately, one way or the other. The group text might sit there unanswered for an hour if nobody happens to look — and you won't find out you're stuck without a charger until you're already at the door at 2%. Waiting live and getting stuck waiting are two different problems. You don't get to dodge both at once.

---

## The Communication Paradigm: Synchronous vs. Asynchronous

**What it is:** Whether a caller sits there blocking, waiting on a downstream answer, or fires off a message and moves on with its life without waiting to hear back.

**Why it exists:** This choice exists to manage temporal coupling and how far a downstream failure can spread — not, whatever the benchmarks in some blog post imply, to optimize throughput.

**Options:**
1. **Synchronous (blocking)** — HTTP, gRPC: the caller sends a request and waits for the response
2. **Asynchronous (non-blocking)** — a message broker (Kafka, RabbitMQ): the caller writes a message and returns immediately

**Trade-offs:**
- *Synchronous:* immediate consistency, and a failure path that's linear and easy to reason about — the caller knows the instant something's wrong. And a downstream slowdown travels straight up the call chain, and enough threads stuck waiting on one slow dependency eats the caller's own capacity right along with it.
- *Asynchronous:* the caller succeeds whether or not the downstream system happens to be online — temporal coupling doesn't get reduced here, it gets deleted. And the system is now eventually consistent, the UI has to poll or get pushed to when work actually finishes, and tracing a bug means following an indirect trail through message queues instead of just reading a stack trace top to bottom.

**When to choose each:**
- *Synchronous:* queries, where the caller genuinely cannot proceed without the answer, and any mutation with a hard regulatory requirement for immediate, transactional confirmation.
- *Asynchronous:* commands, where the caller only needs the intent durably recorded — background processing, fan-out, high-throughput ingestion. This read/write asymmetry is the practical default heuristic: reads tend synchronous, writes tend asynchronous.

**Common failure modes:**
- **The cascading timeout:** Service A calls B, which calls C. C hits a database lock and takes ten seconds to answer. B's threads sit there blocking on C; A's threads sit there blocking on B. Within seconds all three have burned through their connection pools — one localized lock in C just became a platform-wide outage, and synchronous propagation did all the work.

**Example:** An API gateway making a synchronous HTTP call to an auth service needs that auth service alive at that exact instant, no exceptions. An order service publishing an `OrderPlaced` event to Kafka and immediately returning HTTP 200 couldn't care less whether the billing service consuming that event is online right now, this second, or not. **[Consensus: synchronous calls require every dependency in the chain to be healthy simultaneously; asynchronous calls trade that requirement for eventual consistency]**

---

## Message Delivery Semantics

**What it is:** Whatever guarantee a broker actually makes about how many times a message shows up: at most once, at least once, or the one that sounds nicest and doesn't really exist, exactly once.

**Why it exists:** Networks drop packets. Consumers crash halfway through processing something. Somebody has to decide, explicitly, what the system does when it genuinely can't tell whether a message got processed or not.

**Options:**
1. **At-most-once** — delivered once; if the consumer crashes before processing, the message is lost
2. **At-least-once** — redelivered until acknowledged; never silently lost, but can be delivered more than once
3. **Exactly-once** — delivered and processed exactly one time, regardless of failures

**Trade-offs:**
- *At-most-once:* the lowest overhead and the highest throughput you'll get — and a guarantee, not a risk, that you'll lose data during a partition or a consumer redeploy.
- *At-least-once:* nothing gets lost, ever — and duplicates are guaranteed to arrive eventually, which means every consumer now has to handle idempotency itself.
- *Exactly-once:* the easiest mental model to write a consumer against, and it simply isn't achievable across a real, heterogeneous network boundary — approximating it costs the full coordination weight of two-phase commit, for a guarantee that still isn't quite true.

**When to choose each:**
- *At-most-once:* loss-tolerant telemetry and high-frequency metrics, where losing one data point is irrelevant.
- *At-least-once:* the default for essentially all production business commands and domain events.
- *Exactly-once:* never rely on it across a genuine service boundary; it's an illusion that fails the first time a partition occurs.

**Common failure modes:**
- **The non-idempotent retry:** an at-least-once broker delivers "charge credit card." The payment service charges the card, then loses power a moment before it can acknowledge. The broker assumes failure and redelivers to a different node, which charges the card again. The customer gets billed twice — not because anything broke, but because at-least-once delivery did exactly, precisely what it was specified to do.

**Example:** Kafka defaults to at-least-once delivery, and experienced teams don't waste energy fighting that. They accept it and make their consumers idempotent instead — usually a unique idempotency key enforced by a database `UNIQUE` constraint — so a duplicate delivery just gets quietly ignored the moment it shows up. The mechanics of idempotency keys get covered in depth in [Part III, Ch 22].

---

## The Saga Pattern: Distributed Transactions

**What it is:** How you keep a multi-step workflow consistent once it's spread across several independently deployed services — a chain of local transactions plus explicit compensating actions, standing in for the one atomic database transaction you no longer get to have.

**Why it exists:** A monolith gets `BEGIN`/`COMMIT`/`ROLLBACK` handed to it for free by its own database. Split that same workflow across services and there is no longer one transaction to roll back. Step three of five fails, and something now has to go undo steps one and two by hand, on purpose, because nothing's going to do it automatically.

**Options:**
1. **Choreography** — services publish domain events; other services subscribe, do their own local work, and publish their own events, with no central coordinator
2. **Orchestration** — a dedicated orchestrator sends explicit commands to each service in turn, tracks the result, and decides the next step

**Trade-offs:**
- *Choreography:* no central bottleneck, no single point of failure, every team stays autonomous — and the business process itself becomes implicit, scattered across however many services happen to react to however many events, with no single place left to ask "what state is order #123 actually in?"
- *Orchestration:* one observable state machine for the whole transaction, easy to trace, easy to reason about — and the orchestrator turns into a coupling point every workflow change now has to pass through, and a bottleneck for whichever team is stuck owning it.

**When to choose each:**
- *Choreography:* short, two- or three-step flows with few failure states, or reacting to an event that originates outside your own bounded context anyway.
- *Orchestration:* complex, multi-step business processes — order fulfillment, onboarding — where knowing the exact state of an in-flight transaction is an actual operational requirement.

**Common failure modes:**
- **The missing compensating action:** a saga has no automatic rollback, none, ever. An engineer forgets to write the compensating action for one step, or that action fails without landing in a dead-letter queue somebody's actually watching, and the system is stuck permanently half-committed with no path left back to consistency.

**Example:** An orchestrated checkout saga: the orchestrator creates a `Pending` order, tells the payment service to charge the card — succeeds — then tells inventory to reserve the item — fails, out of stock. The transaction can't complete, so the orchestrator runs the compensating actions itself: payment gets told to refund the charge, the order gets marked `Failed`. Nothing rolled back on its own. Every step of that undo was its own explicit command, written by someone, on purpose. **[Strong Recommendation: orchestration for any workflow where "what state is this transaction in right now" is a question the business will actually ask]**

---

## Why Smart Engineers Disagree: The Illusion of Exactly-Once

The sharpest disagreement in asynchronous architecture is whether exactly-once delivery is a legitimate thing to design toward, or a trap with good marketing.

Engineers working inside closed ecosystems — Kafka Streams, Flink — point to transactional producer/consumer APIs that genuinely do guarantee a message gets read, processed, and written to an output topic exactly once, entirely inside that ecosystem. Push that guarantee down into the infrastructure, they argue, and product engineers never have to hand-write idempotency and compensation logic again.

Engineers working across heterogeneous boundaries — most SREs, basically all of them — treat "exactly-once" as a claim that survives right up until it's tested. A closed system really can guarantee exactly-once *internal* state transitions. The instant that system has to send an email, call a payment provider, or write to some external database, the guarantee is gone, because the network only ever offers a choice between losing a message and sending it twice — there's no third option waiting behind door number three.

The pragmatic answer: exactly-once is real, but it's local. It holds inside one closed, transactional system, and it stops holding the moment a message crosses into anything heterogeneous — which is most of what an actual distributed system's surface looks like. Rather than chase a guarantee that only sometimes applies, build every asynchronous consumer idempotent by default, and treat the rare pocket of true internal exactly-once as a bonus feature, never as the foundation the whole architecture is quietly resting on.

*Concepts expanded in later chapters: data ownership and the database-per-service pattern (Part II, Ch 18); idempotency key mechanics in depth (Part III, Ch 22); Kafka operational configuration (Part IX).*
