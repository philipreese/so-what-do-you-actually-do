# Chapter 10 — Monolith vs. Service Decomposition

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Ch 06 — Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md), [Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md), [Ch 08 — Local vs. Global Optimization](../part01-systems-thinking/ch08-local-vs-global-optimization.md). Specifically: the latency hierarchy, partial failure, the distributed monolith anti-pattern, and Conway's Law.

**New vocabulary introduced:** modular monolith, big ball of mud, strangler fig pattern

**Key takeaways:**
- Decomposition is not inherently good. It is a trade of local simplicity for the ability to scale, deploy, and fail independently — and that trade costs real latency, real operational overhead, and real coordination effort. Most systems should start, and many should stay, as a monolith.
- Extraction is justified by a specific, named constraint — a component with a genuinely different scaling profile, a genuinely different failure domain, or an organization that has outgrown single-codebase coordination — not by the belief that microservices are the mature end state.
- The distributed monolith — services that are deployed independently but still coupled through synchronous chains and shared schemas — is the dominant failure mode of decomposition. It carries the operational cost of distribution with none of the autonomy benefit.
- When extraction is justified, do it incrementally, with the strangler fig pattern, against live traffic. Big-bang rewrites of production-critical systems fail more often than they succeed.

## For My Wife

**Every piece of software that runs a real product started as one program.** At some point teams started splitting those programs into smaller, independent pieces — each one deployable on its own, each one talking to the others over the network. The industry eventually branded this "microservices," and for a few years it became the default aspiration: if your architecture wasn't a constellation of small services, it was assumed you hadn't grown up yet.

**This chapter argues that aspiration is backwards.** A single deployable program — a *monolith*, though that word unfairly sounds like a slur — is genuinely simpler to build, test, deploy, and debug. The internal calls never cross a network, so they can't fail the way network calls can. The database can enforce consistency across the whole application in one transaction. Stack Overflow and Shopify both serve billions of requests this way on purpose. The argument isn't that monoliths are fine for small companies until you can afford better — it's that they stay the right choice until a specific, named constraint actually forces a split.

**The constraint that justifies splitting is real but specific:** one piece of the application needs to scale or fail completely independently from the rest — an image-processing pipeline that needs GPU servers while the rest of the app runs on ordinary ones, or a checkout flow that needs to survive even when the recommendation engine is down. The other valid reason is organizational: a team large enough that sharing one codebase and one deployment pipeline has become the actual bottleneck on shipping. Neither of those is "we read an article."

The failure mode the chapter spends most time on is what happens when you split the code into separate services but keep them sharing the same database, or keep them calling each other in long synchronous chains. You've paid every cost of a distributed system — extra operational complexity, network latency, independent deployments to coordinate — without getting any of the benefit, because the services are still coupled where it counts. Every major Netflix and eBay microservice migration went through exactly this failure first. The cure is as painful as it sounds: give each service its own database and stop letting services call each other synchronously for everything. Do that migration wrong, in one big bang instead of incrementally, and you've bet the product on a rewrite that historically fails to finish before the business runs out of patience.

## For My Kids

Say your group project is due Friday. The simplest way to do it is everyone working together at one kitchen table, same afternoon. Someone's slide doesn't match someone else's? You catch it in five seconds, because you're all sitting right there.

**Splitting up only makes sense for a real reason.** Maybe one person has to be at the library because the sources you need are only in the reference section there. That's a genuine reason to work apart — not "professional teams work separately, so we should too."

**Here's where it actually goes wrong.** Your group decides to split up because it feels more grown-up, everyone heads home to work solo — but you're still texting every ten minutes trying to make sure your parts line up, and waiting on replies before you can move forward, and one person being slow still holds up everyone else exactly like before.

You didn't get any of the freedom splitting up was supposed to buy. You just traded "figure it out instantly, face to face" for "wait around for a text back" — while still being just as stuck on each other as you always were. That's worse than never splitting up at all, and it's the version most groups accidentally land in.

---

## Start as a Monolith

**What it is:** A monolith runs its core components inside one deployable unit, sharing a runtime and, usually, one data boundary. A **modular monolith** enforces real internal module boundaries and information hiding (Ch 04) within that single unit. A **big ball of mud** enforces none of that, and every component is free to reach into every other one whenever it's convenient.

**Why it exists:** A monolith cuts coordination overhead to nearly nothing, makes network failure modes for internal calls simply not exist, and lets the compiler and the database do consistency-checking for free. It's the lowest-complexity architecture on offer — not a starter home everyone's supposed to move out of eventually.

**Options:**
1. **Big ball of mud** — no internal boundaries; everything calls everything
2. **Modular monolith** — single deployable unit, strictly enforced internal module boundaries
3. **Service decomposition** — independently deployable units communicating over a network

**Trade-offs:**

| Architecture | Buys | Costs |
|---|---|---|
| Big ball of mud | Maximum initial velocity | Degenerates into unpredictable regressions as any change can touch anything |
| Modular monolith | Fast development, simple deployment, linear stack traces, native ACID transactions across entities | Deployment coupling — every change ships the whole system together |
| Service decomposition | Independent scaling, deployment, and failure domains | Network latency tax (Ch 06) on every cross-boundary call, partial failure (Ch 07), real operational overhead |

**When to choose each:**
- *Modular monolith:* the default starting point for almost every new system, and the right steady state for anything where transactional integrity across entities matters and load stays roughly uniform.
- *Big ball of mud:* never on purpose. It's simply what a modular monolith turns into the moment nobody's enforcing the module boundaries anymore.
- *Service decomposition:* only after a specific, named constraint makes the monolith cost more than the coordination overhead of splitting it up.

**Common failure modes:**
- **Deployment gridlock:** one bad commit from one team blocks the release pipeline for the whole organization, and everyone else sits around waiting on a fix to a module they've never so much as opened — the predictable price of deployment coupling in a monolith that's outgrown the team size it was built for.
- Treating decomposition like a maturity ladder everyone's supposed to climb, splitting services as the default next step instead of the answer to a constraint anyone's actually observed.

**Example:** Stack Overflow served billions of monthly requests on a deliberately monolithic architecture, leaning hard on mechanical sympathy (Ch 06) — in-memory caching, single-process execution — to squeeze enormous load out of a small server footprint, specifically to dodge the network latency tax. Shopify makes the identical bet at a much bigger scale: its core commerce engine is a modular monolith, kept unified on purpose to protect transactional integrity and operational simplicity, with services pulled out only where a specific constraint actually demands it. **[Strong Recommendation: default to a modular monolith; treat service decomposition as something you earn, not something you start with]**

---

## Decomposition by Constraint

**What it is:** Deliberately pulling one piece of functionality out of the monolith into its own independently deployed, networked service — a straight trade of latency and operational tax for something the monolith couldn't give you.

**Why it exists:** A monolith makes every component scale, deploy, and fail as one unit, and that's efficient right up until one component's needs pull far enough away from the pack that treating everything uniformly starts costing more than splitting it up would.

**Options:**
1. **Decomposition by scale profile** — extracting a component whose resource demands (compute, memory, I/O) differ fundamentally from the rest of the system
2. **Decomposition by failure domain** — extracting a critical path so it can survive the collapse of a less reliable subsystem
3. **Decomposition by organizational boundary** — extracting a service to give a team deployment autonomy, per Conway's Law (Ch 08)

**Trade-offs:**
- *Scale profile / failure domain:* fixes a constraint you can actually measure, and can genuinely improve system-level reliability or cost — but every caller now has to reason about partial failure and distributed state where it never had to before.
- *Organizational boundary:* lets one team ship ten times a day with zero cross-team coordination — and hands the global system a network boundary it never needed on technical grounds, one that still has to be paid for in latency and failure handling regardless of why it exists.

**When to choose each:**
- A subsystem has a measurably different scaling profile from the rest of the system — for example, a GPU-bound image-processing pipeline sitting behind an otherwise ordinary CRUD application.
- A subsystem has a different reliability requirement than its neighbors — for example, checkout needs to survive the recommendation engine being down.
- The engineering organization has grown large enough that a single shared codebase and deploy pipeline is the actual bottleneck on shipping, not the architecture.

**Common failure modes:**
- **The distributed monolith** (Ch 03) shows up here more than anywhere else: services get split, but they're still sharing a database schema or calling each other synchronously in long chains, so a schema change or an outage still needs every service coordinated at once, same as before. All the operational cost of distribution, none of the autonomy it was supposed to buy.
- **Premature extraction:** splitting a service off a load imbalance that exists only in a slide deck, not in production, and paying the distribution tax for a constraint that hasn't shown up yet and might never.
- **Resume-driven decomposition:** adopting services because that's what the industry is doing this year, not because any constraint of your own actually demands it.

**Example:** Several of Netflix's and eBay's early microservice migrations produced exactly this distributed-monolith failure at first: separate deployables on paper, chained together through synchronous calls tightly enough that a slowdown anywhere turned into a slowdown everywhere. Both only stabilized once they introduced asynchronous boundaries (Ch 17) and made each service own its own data (Ch 18). Amazon and Netflix get cited constantly as the case *for* decomposition, but the constraint that actually justified it there was organizational, not technical: thousands of engineers could no longer ship through one repository and one deploy pipeline, and that's a very different problem than "our service is slow." **[Consensus: extraction without an independent failure domain and independent data ownership reproduces monolithic coupling at network latency]**

---

## The Strangler Fig Pattern: Safe Extraction

**What it is:** An incremental migration pattern, named by Martin Fowler after the way a strangler fig actually grows around a host tree: a new service grows up around the edge of the existing monolith, intercepting and handling one specific slice of traffic, until the equivalent functionality can be deleted from the monolith for good.

**Why it exists:** A "big bang" rewrite — stop shipping features, rebuild everything as services, cut over — is a bet that the new architecture reaches parity before the business runs out of patience or budget to keep paying for a rewrite with nothing to show for it yet. Most big-bang rewrites of anything production-critical don't make it to that finish line.

**Options:**
1. **Big bang rewrite** — halt the monolith, build the replacement architecture from scratch, cut over
2. **Strangler fig pattern** — route a thin, increasing slice of live traffic to the new service via an edge gateway while the monolith keeps handling the rest

**Trade-offs:**
- *Big bang rewrite:* on paper, gives you a clean architecture with no legacy baggage. In practice, it's a high-variance gamble that rarely comes out the other side looking anything like the plan.
- *Strangler fig:* low risk, validated incrementally against real production traffic the whole way — at the cost of running two architectures side by side for an extended stretch, duplicating some data, and maintaining routing logic that's temporary right up until someone finally deletes it, months later than planned.

**When to choose each:**
- *Strangler fig:* the default for decomposing anything already serving live production traffic.
- *Big bang rewrite:* only when the legacy system is genuinely unmaintainable, legally radioactive, or being retired outright rather than replaced piece by piece.

**Common failure modes:**
- **The permanent strangler:** the team peels off the easy, stateless pieces first — notification sending, document generation — and stalls the moment it hits the tangled core wrapped around the primary database. Now the organization is paying the full operational tax of running new services while still carrying the full weight of the legacy monolith underneath it. Worst of both worlds, indefinitely.

**Example:** Extracting a billing service looks like this: stand up the new service, point the edge gateway at 1% of `/checkout` traffic while the other 99% still hits the monolith, watch the error rate, ramp up gradually to 100%, then delete the old billing code path for good. The monolith and the new service are both live and both correct the entire time — there's no single cutover moment where the system is either down or simply wrong.

---

## Why Smart Engineers Disagree

This isn't really a fight about whether monoliths or microservices are "better" — it's about where the extraction threshold ought to sit, and it tracks how each side weighs getting boundaries wrong against paying the distribution tax too early.

The Amazon-and-Netflix camp argues decomposing late is the expensive mistake: pulling services out of a monolith that's already calcified is exponentially harder than building decoupled from the start, so pay the distributed-systems tax upfront and skip the painful migration later. This view tends to belong to engineers who've personally watched an organization slam into the coordination ceiling a monolith puts on a large team.

The monolith-first camp points out that decomposing before anyone actually understands the domain boundaries just guarantees those boundaries get drawn wrong — and a wrongly decomposed system is a distributed monolith, all the cost of distribution and none of the upside. This view tends to belong to engineers who've lived through the other failure: a service split made on a guess, followed years later by a "macro-refactor" quietly stitching everything back into one deployable once the guess turned out wrong.

Both sides are reasoning correctly about a real risk — they just disagree about which one is more expensive to hit *first*. What most production systems actually converge on: the monolith was never a stage to graduate out of, it's the mechanism by which the real domain boundaries get discovered under actual traffic. Decomposition turns into engineering instead of a guess only once those boundaries are proven, which is exactly why Shopify and Stack Overflow keep deferring it, and why Amazon and Netflix only pulled the trigger once organizational scale handed them an unambiguous, named constraint.

*Concepts expanded in later chapters: internal structural patterns within a service (Part II, Ch 11), the dependency inversion mechanics behind swappable infrastructure (Part II, Ch 12), API versioning across service boundaries (Part II, Ch 16), data ownership patterns (Part II, Ch 18), synchronous vs. asynchronous communication mechanics (Part II, Ch 17).*
