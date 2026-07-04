Appendix A — Decision Frameworks

1. Deciding How Much a Decision Deserves

Reversibility × Blast Radius Matrix

Decides: How much deliberation does this decision deserve before acting?

Inputs it needs: Reversibility, blast radius.

How to apply it: Classify the decision on both axes. Low-blast, easily reversible decisions should be made quickly. High-blast, difficult-to-reverse decisions deserve design review, alternatives, and evidence before committing.

Full treatment: The chapter introducing reversibility and blast radius as the primary decision-sizing axes.

Don't reach for this when: The decision is already constrained by policy, regulation, or safety requirements. Mandatory reviews are not optional because the matrix says the change is small.


Deferral Value Gate

Decides: Should this decision be made now or deliberately postponed?

Inputs it needs: Cost of waiting, cost of committing early, expected information gained by delaying.

How to apply it: Estimate what uncertainty disappears by waiting and what opportunities disappear by delaying. Defer only when expected future information is worth more than the cost of postponement.

Full treatment: The chapter on deciding under uncertainty and the value of delaying irreversible commitments.

Don't reach for this when: Waiting itself closes off viable implementation paths or creates expensive rework.


Problem Classification Ladder

Decides: What kind of problem is this, and therefore what style of reasoning should be used?

Inputs it needs: Stability of requirements, certainty of cause and effect, availability of precedent.

How to apply it: First classify whether the problem is well-understood, exploratory, or genuinely uncertain. Match the solution process to that classification rather than assuming every problem deserves detailed design.

Full treatment: The chapter distinguishing known problems from exploratory and uncertain ones.

Don't reach for this when: The work is already implementing an agreed design rather than discovering one.


2. Reliability and Failure-Mode Trade-offs

Reliability Paradigm Selector

Decides: Should effort go toward preventing failures or recovering from them faster?

Inputs it needs: Failure frequency, recovery cost, prevention cost, availability requirements.

How to apply it: Compare the cost of making failures less likely against the cost of reducing MTTR. Invest where reliability improves more per unit effort.

Full treatment: The chapter contrasting MTBF and MTTR as complementary reliability strategies.

Don't reach for this when: The failure is catastrophic or irreversible. Recovery speed cannot justify accepting unacceptable failures.


Failure Severity Ranking

Decides: Which failures deserve engineering attention first?

Inputs it needs: Detectability, user impact, recovery difficulty, propagation potential.

How to apply it: Rank failures by overall operational danger rather than raw frequency. Address failures that are hardest to detect, recover from, or contain before optimizing nuisance failures.

Full treatment: The chapter classifying failure types by operational risk.

Don't reach for this when: Every identified failure already has identical business impact.


Partition Behavior Decision

Decides: During a network partition, should the system preserve availability or consistency?

Inputs it needs: Data correctness requirements, acceptable stale reads, operational goals.

How to apply it: Identify which guarantees matter for the specific operation. Choose behavior explicitly instead of inheriting defaults from infrastructure.

Full treatment: The chapter covering distributed systems and partition trade-offs.

Don't reach for this when: The system is not distributed across independently failing communication boundaries.


3. Optimization and Bottleneck-Finding

Optimization Gate

Decides: Is performance work justified yet?

Inputs it needs: Measured bottleneck, business objective, expected improvement.

How to apply it: Refuse optimization until a measurable constraint has been identified. Optimize only after demonstrating that removing the bottleneck advances the system's actual goal.

Full treatment: The chapter arguing that optimization is justified engineering only after measurement.

Don't reach for this when: The work addresses correctness, reliability, or security rather than performance.


Constraint Alignment Test

Decides: Will this local optimization improve overall system performance?

Inputs it needs: Current system bottleneck, proposed optimization target.

How to apply it: Verify that the optimization affects the active constraint. If it improves something outside the bottleneck, deprioritize it.

Full treatment: The chapter on bottlenecks and system-wide constraints.

Don't reach for this when: Multiple bottlenecks shift rapidly enough that no stable constraint exists.


Latency vs. Throughput Lens

Decides: Which performance metric should drive this design?

Inputs it needs: User experience requirements, workload characteristics, concurrency profile.

How to apply it: Decide whether success depends on individual request time or total work completed over time. Optimize the primary metric without accidentally degrading it in pursuit of the other.

Full treatment: The chapter distinguishing latency optimization from throughput optimization.

Don't reach for this when: The bottleneck is unrelated to execution performance, such as deployment speed or organizational delay.


4. Process and Organizational Overhead

Value Threshold Test

Decides: Is this process worth its overhead?

Inputs it needs: Cost of the process, frequency of use, expected reduction in risk or mistakes.

How to apply it: Compare recurring operational cost against recurring value. Remove or simplify processes whose benefits consistently fall below their maintenance cost.

Full treatment: The chapter on process overhead and value thresholds.

Don't reach for this when: The process exists primarily to satisfy legal or regulatory obligations.


Decision Catch Checklist

Decides: Should this decision be intercepted by an existing review process?

Inputs it needs: Blast radius, reversibility, ownership boundaries, security implications.

How to apply it: Walk through the checklist and escalate only if one of the triggering conditions is present.

Full treatment: The chapter describing process checkpoints as targeted decision filters rather than universal gates.

Don't reach for this when: The decision has already been through the required review.


Process Decay Audit

Decides: Is this practice still solving the problem that created it?

Inputs it needs: Original purpose, current costs, present-day failure rate.

How to apply it: Ask whether the original failure still exists, whether the process still prevents it, and whether cheaper alternatives now exist.

Full treatment: The chapter on auditing mature engineering processes.

Don't reach for this when: The process has not existed long enough to accumulate meaningful operational history.


5. Concurrency and Correctness Trade-offs

Race Condition Triangle

Decides: Can this code experience a race condition?

Inputs it needs: Shared mutable state, concurrent execution, unsynchronized access.

How to apply it: Verify whether all three conditions exist simultaneously. Remove any one of them to eliminate the race.

Full treatment: The chapter explaining the necessary conditions for race conditions.

Don't reach for this when: The discussion is about distributed consistency rather than concurrent memory access.


Coordination Model Selector

Decides: Should components coordinate through shared state or message passing?

Inputs it needs: Ownership boundaries, latency requirements, failure isolation goals.

How to apply it: Prefer message passing when ownership is naturally separated. Prefer shared memory only when coordination overhead would dominate and ownership is clear.

Full treatment: The chapter comparing shared state and message-passing architectures.

Don't reach for this when: Everything executes sequentially within a single thread.


Lock Scope Decision

Decides: How much work should be protected by a lock?

Inputs it needs: Critical section size, contention level, invariants requiring protection.

How to apply it: Lock only the operations required to preserve invariants while minimizing contention and lock duration.

Full treatment: The chapter on synchronization strategy and lock granularity.

Don't reach for this when: Lock-free or immutable designs eliminate the need for explicit synchronization.


6. Security and Trust Decisions

Threat Walkthrough

Decides: Where are the likely security weaknesses in this design?

Inputs it needs: System boundaries, trust boundaries, assets, data flows.

How to apply it: Walk every boundary systematically, asking the same threat questions at each transition rather than relying on intuition.

Full treatment: The chapter on structured threat modeling.

Don't reach for this when: The architecture itself is still changing too rapidly for meaningful analysis.


Asset Protection Ranking

Decides: Which assets deserve the strongest defensive investment?

Inputs it needs: Asset value, exposure, attacker incentives, compromise consequences.

How to apply it: Rank assets by expected impact of compromise, then allocate defensive effort proportionally.

Full treatment: The chapter on prioritizing security investments.

Don't reach for this when: The question concerns implementation details of a single control rather than overall prioritization.


Defense-in-Depth Layering

Decides: How many independent protections should guard this asset?

Inputs it needs: Asset criticality, attack likelihood, existing controls, failure independence.

How to apply it: Increase independent defensive layers as asset value and exposure increase, avoiding redundant controls that fail together.

Full treatment: The chapter covering defense in depth.

Don't reach for this when: The proposed additional layers duplicate the same failure mode rather than adding independent protection.


7. API and Interface Exposure Decisions

Interface Exposure Filter

Decides: Should this capability become part of the public interface?

Inputs it needs: Stability expectations, abstraction boundary, long-term maintenance cost.

How to apply it: Expose only capabilities that belong in the stable abstraction. Keep implementation details behind the boundary even if exposing them is temporarily convenient.

Full treatment: The chapter on abstraction, information hiding, and public interfaces.

Don't reach for this when: The interface is strictly internal and intentionally short-lived.


Breaking Change Decision Tree

Decides: Is this breaking change truly necessary?

Inputs it needs: Existing consumers, compatibility options, migration cost.

How to apply it: First look for additive changes, adapters, or versioning strategies. Accept a breaking change only after compatibility-preserving alternatives have been eliminated.

Full treatment: The chapter on API evolution and compatibility.

Don't reach for this when: No external consumers exist and compatibility is irrelevant.


Contract Boundary Test

Decides: What obligations belong to this interface, and what belongs behind it?

Inputs it needs: Consumer expectations, ownership boundary, implementation variability.

How to apply it: Separate behavioral guarantees from implementation choices. Commit publicly only to guarantees consumers actually need.

Full treatment: The chapter distinguishing contracts from implementations.

Don't reach for this when: The discussion concerns internal code organization rather than an interface between independently evolving components.
