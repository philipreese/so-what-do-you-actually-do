# Chapter 15 — API Surface Design: What to Expose, What to Hide

*Every exposed field is a permanent commitment, not a convenience.*

Information hiding applied at the network boundary means every field, parameter, and operation an API exposes is cheap to add and exponentially expensive to remove once a consumer depends on it. The surface should be designed around what you're willing to maintain forever, not around what data happens to be available. Progressive disclosure keeps the common path simple while making advanced capability available but not mandatory, so most consumers never have to learn the parameters only a few actually need. Internal and external APIs carry different stability obligations, because internal consumers can be migrated on a schedule you control and external ones cannot be coordinated with at all.

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Ch 04 — Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Part II, Ch 13 — Coupling and Cohesion at the Architecture Level](ch13-coupling-cohesion-architecture-level.md), [Ch 14 — Abstraction Layers: When to Add One](ch14-abstraction-layers-when-to-add-one.md). Specifically: information hiding, afferent coupling, and connascence of value.

**New vocabulary introduced:** progressive disclosure

**Key takeaways:**
- Information hiding (Ch 04) applied at the network boundary: every field, parameter, and operation an API exposes is a permanent commitment, cheap to add and exponentially expensive to remove once a consumer depends on it. Design the surface by deciding what you're willing to maintain forever, not by what data happens to be available.
- Minimal surface area means hiding internal state by default and exposing only what a consumer's actual use case requires — never a field because the ORM happened to generate it.
- Progressive disclosure keeps the common path simple while making advanced capability available but not mandatory, so the 90% of consumers who need the basics aren't forced to understand the parameters the 10% need.
- Internal and external APIs carry different stability obligations because their consumers carry different coordination costs: internal consumers can be migrated on a schedule you control; external consumers cannot be coordinated with at all.

## For My Wife

**An API (an "application programming interface") is a contract — the list of things one piece of software promises to provide to other software that depends on it.** The chapter's central argument is that a field added to an API is extremely cheap to add and essentially impossible to safely remove, because by the time you want to remove it, someone somewhere is relying on it. The strategy this recommends is: expose only what you're genuinely willing to maintain forever, and hide everything else.

**The POSIX file API is the example that makes this concrete.** The interface your operating system exposes for reading and writing files has stayed stable for fifty years across every operating system that mattered. The reason isn't that hard drives haven't changed — they've changed enormously, from spinning disks to SSDs to distributed storage. It's that the API exposes almost nothing: open a file, read bytes, write bytes, close. Because so little is exposed, the implementation underneath has been replaced, reimplemented, and optimized countless times without breaking a single program that used the interface. The less surface area, the longer it lasts.

**The practical failure this prevents:** an ORM (a tool that maps database rows to objects in code) auto-generates an API field called `deleted_at` — an internal timestamp used for soft-deleting records. Nobody intended to make that a public field. But it gets serialized into the response, some third-party client starts filtering on whether it's present, and now the soft-delete implementation is locked. You can't change how deletion works without breaking an integration that was never supposed to know deletion was implemented that way.

The chapter also draws a sharp line between APIs used only inside your organization and APIs used by people outside it. For an internal API, when you need to break something, you can find every consumer, tell them, and redeploy everything together. For an external API, you have no idea who's using it or how. A bank that maintains developer APIs can't call every fintech startup to coordinate a field change — those consumers have to just keep working, unchanged, indefinitely. Getting that distinction wrong is how a "routine cleanup" becomes a simultaneous production outage at a hundred companies you've never spoken to.

## For My Kids

Say a friend comes over to do homework and asks for the WiFi password. **You give them the guest network — not the real one that also runs the smart lock and the thermostat.** They get exactly what today's situation needs: internet, nothing else. That's the whole skill: hand out precisely enough, not whatever happens to be lying around.

**Say instead you'd handed over the real password, because it was easier and you weren't thinking about it.** No big deal in the moment. But that password doesn't stay contained — it's saved on their phone now, their phone auto-connects every time they're near your house, and they've probably shared it with a couple of people you don't even remember agreeing to.

**Then, a year later, your family wants to change it** — maybe for a real reason, maybe just spring cleaning. Suddenly it's not simple. Half your grade has that password memorized. Changing it means everyone who ever visited has to be tracked down and told, and some of them are going to be annoyed about it, and a few you'll never even reach.

Giving out the guest password up front cost you nothing. Giving out the real one cost you a year of being stuck maintaining a decision you made without thinking twice about it.

---

## The Principle of Minimal Surface Area

**What it is:** Hide everything internal by default, and expose only the specific fields a consumer needs to satisfy some actual, named use case — not one field more.

**Why it exists:** An API surface is afferent coupling (Ch 03), just wearing a network costume. Expose a field and, eventually, somebody depends on it — including fields that only exist because an ORM happened to generate them, not because a single person ever decided they should be public.

**Options:**
1. **Internal state passthrough** — the API serializes and returns the internal domain model or database entity directly
2. **Explicit boundary mapping** — the API returns a dedicated Data Transfer Object (DTO) containing a deliberately reduced subset of the internal data

**Trade-offs:**
- *Passthrough:* fast to write, zero mapping boilerplate — and it destroys information hiding on contact, coupling every consumer directly to whatever the provider's internal persistence strategy happens to be this week.
- *Boundary mapping:* the database gets refactored freely without the API contract ever noticing, for the price of a translation layer and duplicate data shapes somebody has to keep in sync by hand.

**When to choose each:**
- *Passthrough:* tightly coupled internal scripts or prototypes, where the same developer is deploying both sides of the call at once.
- *Boundary mapping:* the default for any production API with even one consumer outside that developer's direct control.

**Common failure modes:**
- **The leaky database column:** an internal `deleted_at` timestamp, added purely for auditing, leaks straight into the public response because the API does passthrough. A third-party client starts quietly filtering on whether the field is present, and now the soft-delete strategy is a permanent dependency for an external integration that was never supposed to know it existed.

**Example:** The POSIX file descriptor API — `open`, `read`, `write`, `close` — is a masterclass in minimal surface area, and it's held stable for fifty years for exactly one reason: it exposes almost nothing. The consumer sees plain byte arrays. Filesystems, block storage, hardware interrupts — all of it stays buried underneath, permanently. **[Consensus: a field is exposed because a consumer needs it, never because it exists internally]**

---

## Progressive Disclosure

**What it is:** Keep the default request as simple as it can possibly be, and put advanced capability behind optional parameters or expansion mechanisms instead of stuffing it into every response whether anyone asked for it or not.

**Why it exists:** Most consumers only ever touch a small slice of what an API can actually do. Force every one of them to learn the entire surface — including parameters that exist purely for the 10% of power users — and you've handed everyone cognitive overload and a fresh set of integration bugs, for no benefit to most of them.

**Options:**
1. **The god resource** — a single endpoint accepting many parameters, always returning a large, deeply nested payload with every related entity included
2. **Progressive disclosure** — a minimal default response, with related data available via explicit expansion (`?expand=`) or distinct sub-routes

**Trade-offs:**
- *God resource:* fewer round-trips, and bandwidth spent on data almost nobody actually uses, with a surface that's genuinely hard to document or even hold in your head.
- *Progressive disclosure:* the default stays fast and the docs stay legible — and a client that does need the expanded data either makes extra calls or has to learn a bit of expansion syntax first.

**When to choose each:**
- *God resource:* bulk or asynchronous data-extraction pipelines, where the point is raw transfer, not a human reading through an integration guide.
- *Progressive disclosure:* the default for any public REST API or SDK, no exceptions worth naming.

**Common failure modes:**
- **Configuration bankruptcy:** an endpoint quietly accumulates a dozen-plus optional boolean flags over the years — `include_history`, `skip_validation`, `dry_run` — all interacting in ways nobody documented and nobody can fully predict, until the endpoint can no longer be tested with any confidence at all.

**Example:** Stripe's `Charge` object returns a flat, minimal response by default — its `customer` field is nothing but a string ID. A client that needs the full customer record doesn't hit a different endpoint. It just appends `?expand[]=customer`, and Stripe layers the nested object in only when asked. **[Strong Recommendation: make the common case the cheap case, and put everything else behind an explicit ask]**

---

## Internal vs. External API Boundaries

**What it is:** How aggressively an API is allowed to evolve, and that depends entirely on whether its consumers are coordinated internal teams or uncoordinated strangers on the other side of the internet.

**Why it exists:** An API is a contract, and contracts behave differently depending on who signed them. Two teams in the same organization can renegotiate a contract and redeploy both sides together, same afternoon if it has to happen. A contract with an unknown third party can't be renegotiated at all — it can only be extended, or it can be broken, and there's no door number three.

**Options:**
1. **Aggressive evolution** — fields are deprecated and payloads changed; consumers are expected to update in step
2. **Strict immutability** — nothing is ever removed or behaviorally altered; every change is additive

**Trade-offs:**
- *Aggressive evolution:* the codebase stays clean, no legacy adapter layers accumulating in the corner — and it demands real-time, synchronous coordination with every downstream caller, which only works because every one of those callers is actually known to you.
- *Strict immutability:* integrations written years ago just keep working, untouched, building the kind of trust that takes years to earn — while the provider quietly absorbs every bit of the resulting accidental complexity, stacking up legacy translation layers with no end date in sight.

**When to choose each:**
- *Aggressive evolution:* internal service-to-service APIs, where every caller is visible and sits on a deploy schedule you actually control.
- *Strict immutability:* public SaaS APIs, mobile app backends where you can't force anyone to update their app, and third-party enterprise integrations you'll never get on a call with.

**Common failure modes:**
- **The unannounced deprecation:** a team treats a public API like it's an internal one and drops a "rarely used" field to simplify a database migration. Every third-party integration leaning on that field breaks simultaneously, with no warning and nowhere to migrate to.

**Example:** GraphQL, built at Facebook, solved an internal problem — letting a consumer ask for exactly the fields it needs instead of over-fetching everything. Expose that same flexibility as an *external* API and it turns into a liability: the provider now has to support an effectively unbounded universe of query shapes, and tuning execution plans or rate-limiting against strangers gets far harder than it ever was against a fixed internal contract.

---

## Why Smart Engineers Disagree: Consumer-Driven vs. Provider-Driven Surfaces

The most polarizing question in API design is simple to state: should the consumer or the provider get to decide the shape of the data coming back?

Engineers optimizing for frontend velocity push for consumer-driven flexibility — usually GraphQL. A rigid REST surface means every new UI field costs a backend ticket and a release cycle. A flexible graph lets the frontend just ask for what it needs, today, without waiting on anyone else's sprint.

Engineers optimizing for backend stability and performance push for provider-driven control instead — usually REST or gRPC with a fixed shape. A database can't efficiently answer arbitrary, deeply nested queries on demand, and consumer-driven surfaces have a habit of sliding into N+1 query disasters and unpredictable load, because the backend gave up the one thing that let it tune execution paths: knowing the request shape in advance.

This is the Theory of Constraints (Ch 08), just relocated to API design. If the real bottleneck is UI iteration speed, consumer-driven flexibility is the right call. If the real bottleneck is database load or data-access control, provider-driven rigidity is the right call. Handing flexibility to the consumer always means the provider absorbs the complexity that flexibility costs somewhere — the actual decision here was never "flexible or rigid," it's which side of that boundary can afford to pay for it.

*Concepts expanded in later chapters: versioning strategies for evolving an API over time (Part II, Ch 16); the REST vs. RPC vs. event-driven transport choice (Part III, Ch 19); authentication and authorization at the boundary (Part III, Ch 24).*
