# Appendix A — Decision Frameworks

This appendix is an index, not a chapter. It gathers every named, reusable decision framework the handbook already argues for — a two-axis matrix, a gate, a classification ladder, a taxonomy — into one place, so a reader who half-remembers a framework's shape doesn't have to reread the chapter that built it.

A framework decides something specific. It is not a fact about the world (that's the glossary, Appendix D) and not an observable warning sign (that's Appendix B). Every entry below includes a **don't reach for this when**: the concrete situation where applying the framework at all is the mistake. Treating a decision aid as a mandatory gate regardless of context is its own failure mode — the process-ratchet problem Ch 49 argues against, wearing a framework's clothes instead of a checklist's.

---

## 1. Deciding How Much a Decision Deserves

**Reversibility × Blast Radius Matrix**
*Decides:* How much deliberation, review, and evidence a given decision actually warrants before anyone commits to it.
*Inputs it needs:* Reversibility (the cost to undo the choice later) and blast radius (how much damage a wrong choice does to the broader system or business).
*How to apply it:* Plot the decision on both axes. Low reversibility and high blast radius — a core schema choice, a vendor lock-in — earns heavy deliberation: alternatives, review, evidence before committing. High reversibility and low blast radius — an internal library pick, a retry-count constant — should be decided in minutes by whoever's closest to it.
*Full treatment:* [Ch 09 — Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md).
*Don't reach for this when:* The decision is already constrained by law, contract, or a mandatory security review — the matrix says the change is small, but the obligation to review it isn't optional just because the matrix says so.

**Deferral Value Gate**
*Decides:* Whether to commit to a decision now or deliberately leave it open.
*Inputs it needs:* The cost of waiting, the cost of committing early and being wrong, and how genuinely imminent the missing information actually is.
*How to apply it:* Defer only when the information that would resolve the uncertainty is actually coming soon and the interim cost of not deciding is low — ideally by shipping a small, concrete placeholder that collects real data, not by leaving an open question sitting in a document. If "later" has no date and no owner, that's not deferral, it's an unmade decision wearing deferral's name.
*Full treatment:* [Ch 09 — Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md).
*Don't reach for this when:* Waiting itself forecloses an implementation path, or the team is already building around the undecided question anyway — at that point deferral isn't preserving optionality, it's just unacknowledged commitment.

**Cynefin Domain Classification**
*Decides:* What style of reasoning a given problem actually calls for.
*Inputs it needs:* How clear and predictable the relationship between cause and effect is for this specific problem.
*How to apply it:* Classify the problem into one of four domains — Simple (an established best practice applies directly), Complicated (a defensible right answer exists but requires real analysis to find), Complex (no answer exists yet; run small, safe-to-fail experiments and sense the result), or Chaotic (act immediately to stop the bleeding, analyze afterward). Most real architectural decisions land in Complicated, not Complex — the mistake worth watching for is calling a problem "complex" to justify skipping the analysis it actually needs.
*Full treatment:* [Ch 09 — Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md).
*Don't reach for this when:* The problem is routine and mechanical — reaching for a sense-making framework to avoid doing the arithmetic on a standard capacity or indexing question is a way of dressing up avoidance as rigor.

---

## 2. Reliability and Failure-Mode Trade-offs

**MTBF vs. MTTR Reliability Paradigm**
*Decides:* Whether engineering effort should go toward preventing failures or recovering from them faster.
*Inputs it needs:* How catastrophic a single failure actually is, how expensive prevention is per unit of improvement, and how fast a clean recovery can realistically be.
*How to apply it:* Favor MTBF (prevent failure) when a single failure is genuinely catastrophic or irreversible — formal verification, exhaustive testing, defensive design. Favor MTTR (recover fast) when failures are frequent, individually bounded, and cheap to detect — aggressive timeouts, idempotent operations, supervisors that restart a failed component before anyone notices. Most systems should weight toward MTTR; MTBF is the exception that has to be justified.
*Full treatment:* [Ch 01 — What Engineering Actually Optimizes](../part01-systems-thinking/ch01-what-engineering-optimizes.md), [Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md).
*Don't reach for this when:* The system is genuinely stateful and a "let it crash, restart clean" recovery would corrupt data on the way down — MTTR's assumptions don't hold once a mid-write crash can leave a durable record half-written.

**Failure Severity Ranking**
*Decides:* Which of several possible failure modes is actually the dangerous one to design against first.
*Inputs it needs:* Whether the system stops immediately and visibly, whether it silently propagates a corrupted internal state, or whether it keeps running while returning wrong answers.
*How to apply it:* Rank failures by how quietly they spread, not by how alarming they look. A crash is the safest failure — loud, contained, and diagnosable. A corrupted internal state that keeps running is worse. A system that looks healthy while quietly returning wrong answers is the most dangerous, because nothing about it prompts anyone to look. Design boundary checks that convert the dangerous failure into the safe one — fail fast into a crash rather than limp forward on a broken assumption.
*Full treatment:* [Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md).
*Don't reach for this when:* Every failure mode under discussion genuinely has identical, bounded business impact — the ranking exists to prioritize under scarcity, not to add ceremony to a case where nothing is actually being traded off.

**CAP Partition Trade-off**
*Decides:* When the network partitions, whether a given operation should stay consistent or stay available.
*Inputs it needs:* Whether serving a stale or conflicting answer is tolerable for this specific operation, and what happens downstream if it isn't.
*How to apply it:* Choose consistency (reject writes, return errors) for anything that must never diverge — distributed locks, financial ledgers, leader election. Choose availability (accept writes, reconcile later) for anything where a temporarily stale answer is better than no answer — shopping carts, activity feeds, edge caches. This is a per-operation choice, not a single global setting for the whole system.
*Full treatment:* [Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md).
*Don't reach for this when:* The system isn't actually distributed across an independent failure boundary — there's no partition to have an opinion about.

---

## 3. Optimization and Bottleneck-Finding

**The Optimization Gate**
*Decides:* Whether performance work is justified engineering right now, or still speculative.
*Inputs it needs:* A documented requirement actually being violated (an SLO, a cost budget, a measured UX threshold) and a measured bottleneck — not a hunch — identified as the cause.
*How to apply it:* Refuse to open the gate until both conditions hold. A component that merely profiles as slow in isolation is a local hotspot, not evidence it's the thing limiting the system. Once both conditions are met, optimize the confirmed cause, not whichever piece of code felt slow to whoever looked at it first.
*Full treatment:* [Ch 85 — When to Optimize (and When Not To)](../part12-performance/ch85-when-to-optimize.md).
*Don't reach for this when:* The work in question is a correctness, reliability, or security fix — the gate exists to stop speculative performance tuning, not to block work that was never optional.

**Constraint Alignment Test**
*Decides:* Whether a proposed local optimization will actually move the system's overall result.
*Inputs it needs:* Which component is the current bottleneck, and whether the proposed change touches that component specifically.
*How to apply it:* Identify the single slowest link in the chain first. Only then ask whether the optimization under discussion targets that link. Speeding up a component that isn't the bottleneck can look like progress on a dashboard while changing nothing about the metric anyone actually cares about — the classic version is shaving a fast code path from 10ms to 1ms while it feeds a downstream query that takes 500ms regardless.
*Full treatment:* [Ch 08 — Local vs. Global Optimization](../part01-systems-thinking/ch08-local-vs-global-optimization.md).
*Don't reach for this when:* The bottleneck genuinely moves fast enough, under real traffic, that no single stable constraint exists long enough to target — at that point the fix is architectural, not a single optimization pass.

**Latency vs. Throughput Lens**
*Decides:* Which of two different, sometimes opposed, performance metrics a given design should actually optimize for.
*Inputs it needs:* Whether users experience one request at a time or the system's total output over a window matters more, and what the concurrency profile of the real workload looks like.
*How to apply it:* Decide explicitly which metric the system is actually being judged on before choosing a design — an approach that helps one (batching for throughput) can actively hurt the other (adding latency to any single request). Watch the tail, not just the average: an excellent mean can hide one badly degraded slice of requests.
*Full treatment:* [Ch 87 — Latency vs. Throughput Trade-offs](../part12-performance/ch87-latency-vs-throughput.md).
*Don't reach for this when:* The actual bottleneck is organizational or procedural — deployment cadence, review latency — rather than anything about how the system itself executes work.

**Empirical Data Structure Selection**
*Decides:* Which data structure or algorithm to actually use for a specific piece of code, once more than one candidate is theoretically plausible.
*Inputs it needs:* The real size and shape of the data this code will actually handle in production, not the size it could theoretically grow to.
*How to apply it:* Use asymptotic complexity to narrow the field of reasonable candidates, then measure the finalists against the real workload at its real scale. A structure that wins in Big-O terms at a hypothetical million records can lose to a simpler one on the forty records actually present, because the "simpler" one has better cache locality and no allocation overhead. Theory picks the candidates; measurement picks the winner.
*Full treatment:* [Ch 89 — Data Structure and Algorithm Selection in Practice](../part12-performance/ch89-data-structure-and-algorithm-selection.md).
*Don't reach for this when:* The data genuinely has no realistic upper bound and will keep growing — at true unbounded scale, the asymptotic winner reliably becomes the empirical winner too, and measuring every candidate at every scale is wasted effort.

---

## 4. Process and Organizational Overhead

**Process Value Threshold Test**
*Decides:* Whether a given process step is still worth what it costs.
*Inputs it needs:* The process's recurring cost, how often it actually runs, and the real, current rate of the problem it was built to catch.
*How to apply it:* Compare the accumulated cost of running the process against the harm it's actually still preventing, not the harm that justified adding it originally. A step that once caught a real, frequent problem can keep running at full cost long after the underlying cause was fixed some other way.
*Full treatment:* [Ch 49 — Process Overhead: The Value Threshold](../part06-engineering-process/ch49-process-overhead-the-value-threshold.md).
*Don't reach for this when:* The process exists to satisfy a legal, contractual, or regulatory obligation — its value isn't measured in prevented engineering mistakes, and removing it isn't a call an engineering cost-benefit test gets to make.

**ADR Threshold Test**
*Decides:* Whether a given decision is significant enough to warrant a permanent, written Architecture Decision Record.
*Inputs it needs:* The same reversibility and blast-radius classification used to size any decision.
*How to apply it:* Write an ADR when the decision is genuinely expensive to reverse and would affect a lot of people if it turned out wrong — a database engine choice, a public API freeze, a vendor commitment. Skip it for routine, cheap-to-reverse, locally-scoped choices; recording those isn't diligence, it's the ADR-inflation failure mode that drowns the few records that actually matter.
*Full treatment:* [Ch 09 — Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md).
*Don't reach for this when:* The decision has already been superseded — write a new ADR that explicitly supersedes the old one; don't retroactively edit the original to look right in hindsight.

**Process Decay Audit**
*Decides:* Whether a long-standing rule or process step is still solving the problem that justified adding it.
*Inputs it needs:* The original reason the rule was created, and whether that specific cause still exists today.
*How to apply it:* Ask three questions in order: does the original problem still occur, does this rule still actually prevent it, and has something cheaper made it unnecessary since. Only remove the rule if the answer genuinely closes the loop — investigate before removing, the way Chesterton's fence argues, but don't let "someone once had a reason" become permanent immunity from the question.
*Full treatment:* [Ch 49 — Process Overhead: The Value Threshold](../part06-engineering-process/ch49-process-overhead-the-value-threshold.md).
*Don't reach for this when:* The process hasn't existed long enough to have accumulated any real operating history to audit — there's nothing yet to check the rule against.

**Conway's Law Alignment**
*Decides:* Whether a team's structure should drive toward a single shared codebase or toward independently owned services.
*Inputs it needs:* Team size and communication overhead, how independently different business domains actually need to evolve, and how strict the cross-domain data-consistency requirements are.
*How to apply it:* Favor a single, cohesive codebase while a team is small enough to coordinate cheaply and domains still change together. Favor independent ownership once coordinating a shared codebase and shared deploy pipeline has itself become the bottleneck on shipping — and expect the resulting service boundaries to mirror the team's own communication structure whether anyone designs it that way or not.
*Full treatment:* [Ch 08 — Local vs. Global Optimization](../part01-systems-thinking/ch08-local-vs-global-optimization.md), [Ch 10 — Monolith vs. Service Decomposition](../part02-software-architecture/ch10-monolith-vs-service-decomposition.md).
*Don't reach for this when:* A small team splits into isolated silos purely because it "feels more grown-up" — the resulting service boundary reflects nobody's actual communication structure, it just adds a network hop between people who were going to talk constantly anyway.

---

## 5. Concurrency and Correctness Trade-offs

**Data Race Precondition Check**
*Decides:* Whether a specific piece of concurrent code can actually experience a data race.
*Inputs it needs:* Whether the memory is shared, whether access happens concurrently, and whether at least one accessor writes without synchronization.
*How to apply it:* All three conditions have to hold at once for a race to exist. Removing any single one — making the state private, serializing the access, or synchronizing the write — eliminates the race entirely; you don't need to fix all three.
*Full treatment:* [Ch 74 — Shared State vs. Message Passing](../part10-concurrency/ch74-shared-state-vs-message-passing.md).
*Don't reach for this when:* The actual concern is distributed consistency across separate machines rather than concurrent access to memory within one process — that's a partition and replication problem, not a data race.

**Coordination Model Selector**
*Decides:* Whether concurrent components should coordinate through shared memory or by passing messages.
*Inputs it needs:* How clearly ownership of the relevant state can be drawn, and how much raw throughput the workload genuinely needs versus how much safety and reasoning simplicity are worth.
*How to apply it:* Default to message passing wherever ownership is already naturally separable — it eliminates the entire category of data-race failure by construction, at the cost of copying and a small latency tax. Reserve shared memory for the narrow case where that copying cost is the actual bottleneck and the code is disciplined enough to manage the synchronization correctly, such as low-level infrastructure where every allocation is measured.
*Full treatment:* [Ch 74 — Shared State vs. Message Passing](../part10-concurrency/ch74-shared-state-vs-message-passing.md).
*Don't reach for this when:* Everything in question executes sequentially on a single thread — there's no coordination problem yet to choose a model for.

**Lock Granularity Decision**
*Decides:* How much shared state a single lock should protect.
*Inputs it needs:* Measured lock contention (not a guess) and the invariant the lock actually has to preserve.
*How to apply it:* Default to one coarse lock protecting a clear, whole invariant — it's the easiest to reason about and carries no cross-lock deadlock risk. Split into finer-grained locks only once profiling shows real contention on the coarse lock is the actual bottleneck; splitting preemptively multiplies the number of interleavings to reason about for a problem that was never measured.
*Full treatment:* [Ch 75 — Locks: When to Use Them](../part10-concurrency/ch75-locks-when-to-use-them.md).
*Don't reach for this when:* No contention has actually been measured yet — pre-splitting a lock on a hunch trades a simple, correct design for a complex one on spec.

**Coffman Condition Break**
*Decides:* Which specific mechanism to remove in order to structurally prevent deadlock, rather than merely making it less likely.
*Inputs it needs:* Confirmation that all four Coffman conditions — mutual exclusion, hold-and-wait, no preemption, and circular wait — are actually present in the design under discussion.
*How to apply it:* Deadlock requires all four conditions simultaneously; breaking any single one is sufficient to prevent it. Breaking circular wait by imposing one consistent, global lock-acquisition order is almost always the cheapest option, because it requires giving up none of the other three properties the system may need for other reasons.
*Full treatment:* [Ch 77 — Deadlock, Livelock, and Starvation](../part10-concurrency/ch77-deadlock-livelock-and-starvation.md).
*Don't reach for this when:* The observed symptom is threads that stay active but make no forward progress (livelock) or one participant that never gets a turn (starvation) — those are real, different failures with different fixes, not deadlock wearing a different name.

---

## 6. Security and Trust Decisions

**STRIDE Threat Walkthrough**
*Decides:* Where a system's realistic security weaknesses actually are, before it ships.
*Inputs it needs:* The system's trust boundaries, assets, and data flows, walked one at a time.
*How to apply it:* At every trust boundary, systematically ask the same six questions — Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege — rather than relying on whichever vulnerability category happens to interest the reviewer that day. A structured walkthrough catches the boring, unglamorous gap a gut-feel review reliably misses.
*Full treatment:* [Ch 79 — Threat Modeling](../part11-security/ch79-threat-modeling.md).
*Don't reach for this when:* The architecture is still changing too fast, day to day, for a boundary-by-boundary analysis to stay accurate — model the threats once the shape has actually settled.

**Asset Protection Ranking**
*Decides:* Which assets deserve the strongest, most expensive defensive investment.
*Inputs it needs:* What a given asset is actually worth, how exposed it is, and what a realistic adversary gains from compromising it.
*How to apply it:* Rank assets by the real impact of compromise, then allocate defensive effort proportionally — a signing key and a public documentation page do not deserve identical investment. Protecting everything equally means the assets that actually matter are under-protected relative to their real risk.
*Full treatment:* [Ch 79 — Threat Modeling](../part11-security/ch79-threat-modeling.md).
*Don't reach for this when:* The question at hand is about the correctness of a single control's implementation, not about prioritizing investment across a portfolio of assets.

**Defense-in-Depth Layering**
*Decides:* How many independent security controls a given asset actually warrants.
*Inputs it needs:* The asset's criticality and exposure, and — critically — whether the controls already in place actually fail independently of each other.
*How to apply it:* Scale the number of layers with blast radius and reversibility, the same way any decision's deliberation scales. Verify independence before counting a layer: three checks that all trust the same underlying credential or the same network assumption are one control wearing three costumes, not three separate barriers.
*Full treatment:* [Ch 80 — Defense in Depth](../part11-security/ch80-defense-in-depth.md).
*Don't reach for this when:* The proposed additional layer shares its failure mode with a layer that already exists — adding it buys the appearance of depth without buying any actual redundancy.

---

## 7. API and Interface Exposure Decisions

**Exposed-Surface Filter**
*Decides:* Whether a given capability, field, or endpoint should become part of a stable public interface.
*Inputs it needs:* How stable the underlying implementation actually is, and how expensive it would be to maintain this capability forever once it's exposed.
*How to apply it:* Expose only what the team is genuinely willing to support indefinitely — a field is cheap to add and effectively impossible to safely remove once anyone depends on it. Keep everything else behind the boundary, even when exposing it would be more convenient today.
*Full treatment:* [Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md).
*Don't reach for this when:* The interface in question is strictly internal, short-lived, and every caller can be found and updated in the same change — that's a coordination problem, not an exposure decision.

**Breaking Change Necessity Test**
*Decides:* Whether a proposed breaking change is actually unavoidable.
*Inputs it needs:* The existing consumer base, and whether an additive, backward-compatible alternative genuinely exists.
*How to apply it:* Look for an additive change or a versioned path first — widening a field, adding an optional parameter, running two contract versions side by side. Accept an actual breaking change only once every compatibility-preserving option has been ruled out, and pair it with an explicit sunset window rather than an immediate cutover.
*Full treatment:* [Ch 16 — Versioning and Backward Compatibility](../part02-software-architecture/ch16-versioning-backward-compatibility.md).
*Don't reach for this when:* There are no external consumers at all yet — the compatibility question doesn't exist until someone else depends on the contract.

**Internal vs. External Contract Test**
*Decides:* Whether an interface should be treated as a frozen, external contract or a flexible, internal one.
*Inputs it needs:* Whether every consumer of the interface can realistically be found and updated in the same deployment as a change to it.
*How to apply it:* If both sides of the interface can be changed together, in lockstep, it's internal — evolve it freely. The moment that's no longer true — a separate team, a separate deploy schedule, an external customer — the interface is external in every sense that matters, whether or not it ever touched the public internet, and every observable behavior of it, documented or not, will eventually become something somebody depends on.
*Full treatment:* [Ch 25 — Internal vs. External API Design](../part03-api-design/ch25-internal-vs-external-api-design.md).
*Don't reach for this when:* The interface has exactly one consumer, owned by the same team, deployed at the same time — there's no real boundary yet to classify.
