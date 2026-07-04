# Ch 77 — Deadlock, Livelock, and Starvation

**Prerequisites:** [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md) (state space explosion), [Shared State vs. Message Passing](ch74-shared-state-vs-message-passing.md), [Locks: When to Use Them](ch75-locks-when-to-use-them.md) (lock granularity), [Async vs. Threads vs. Processes](ch76-async-vs-threads-vs-processes.md)

**New vocabulary introduced:** deadlock, livelock, starvation, Coffman conditions

**Key takeaways:**
- Deadlock, livelock, and starvation are precisely distinct — not interchangeable words for "concurrency is broken." Deadlock is a permanent, total standstill; livelock is continuous activity with no forward progress at all; starvation is one correct participant perpetually denied its turn while everyone else proceeds normally.
- [Strong Recommendation] All four Coffman conditions — mutual exclusion, hold-and-wait, no preemption, circular wait — have to hold simultaneously for deadlock to occur. Break any single one and it can't happen, and enforcing a single, consistent global lock-acquisition order is the cheapest, most common technique, because it only requires giving up circular wait, not the other three.
- Prevention and detection-and-recovery are different strategies for different contexts: structural lock ordering fits a codebase the engineering team fully controls; runtime cycle detection (a wait-for graph, a chosen "victim" transaction) fits a system like a database, where access patterns are dictated by arbitrary, dynamically generated queries that can't be pre-ordered.
- Livelock gets broken by randomizing retry timing, not by retrying faster — symmetric, deterministic backoff is exactly what locks participants into a lockstep collision loop in the first place.
- These failures are the direct, concrete instance of Ch 02's state space explosion: the combinatorial number of possible interleavings between concurrent operations is why they're non-deterministic, timing-dependent, and can vanish the moment a debugger or a stray log line changes the timing that exposed them.

## For My Wife

Picture two people carrying a couch through a house, one on each end, each one stuck in a different doorway. Neither will set their end down and back up, because each is sure the other should yield first — so they just stand there, frozen, each one holding onto exactly what's stopping the other person from moving. That's a dead stop. Nothing changes until somebody deliberately intervenes.

Now picture two people meeting in a narrow hallway, both stepping left to let the other pass, realizing they're still blocked, both stepping right at the exact same moment, still blocked, and repeating that little side-to-side dance for an embarrassingly long time. Nobody's frozen — there's constant motion — but neither has actually gotten anywhere. That's a different problem: not a standstill, but motion with no progress, because both people keep making the identical move at the identical moment.

And picture a four-way stop where one especially polite driver keeps waving everyone else through, while three other drivers who never return the courtesy just keep taking their turns one after another. The polite driver isn't stuck or frozen or dancing back and forth — they're just never getting a turn, while everyone else moves along fine.

**This chapter argues software runs into all three of these exact problems, and the fixes match the couch, the hallway, and the stop sign.** The couch gets solved by agreeing on a fixed rule in advance — always set down the end closer to the front door first. The hallway gets solved by making the next move random instead of automatic, so two people's timing stops syncing up by accident. And the stop sign gets solved by a rule that stops rewarding whoever's least polite, so the one considerate driver eventually, guaranteed, gets a turn.

## For My Kids

> [!NOTE]
> The cafeteria line produces all three of this chapter's actual problems, back to back, most days.

By the drink station, two kids meet face-to-face with full trays, in a spot too narrow for both. Neither will step back first — stepping back means losing your spot in line — so they just stand there. Frozen. Nobody moves until a teacher tells one of them to back up.

Down at the tray return, two kids do the classic "you go" shuffle: both lean left at the same instant, still blocked, both lean right at the same instant, still blocked. Constant motion, actual movement of arms and trays — and neither one has gone anywhere in ten seconds.

And at the ketchup pump, one kid keeps waving everyone else ahead, being nice about it every single time. Three other kids never once return the favor. They're not frozen and they're not stuck dancing — they're just never getting a turn, while lunch period quietly runs out.

Three totally different problems, three totally different fixes. The doorway gets solved with an actual rule: whoever's closer to the register keeps going, full stop. The shuffle gets solved by making the next move random instead of automatic, so the timing stops matching up. And the ketchup pump gets solved by a rule that stops letting the same three kids cut every time — so the one being nice about it, eventually, guaranteed, gets a turn before the bell rings.

---

Ch 75 established locks as the primary tool for making shared state safe, and Ch 76 split the execution unit off from that coordination question entirely. This chapter asks what happens when the coordination those chapters covered goes wrong — not from incorrect logic, but from the sheer number of ways independently executing operations can interleave. This is Ch 02's state space explosion made concrete: every additional concurrent execution path multiplies the number of possible orderings, and only a vanishingly small fraction of them need to be wrong for a failure to eventually show up in production, no matter how cleanly the same code ran the previous million times. That same combinatorics is why this chapter stops at explaining the failure modes and doesn't expand into a concurrent-testing methodology — no part of this handbook owns that as a dedicated topic, and exhaustively enumerating interleavings was never a teachable testing strategy to begin with.

Three distinct failures share this root cause. **Deadlock** is a set of execution units each waiting indefinitely for a resource held by another member of the same set — a cycle, nobody able to proceed, nobody willing to let go of what they already hold. **Livelock** looks like the opposite problem: everyone stays active, continuously changing state and responding to each other, and none of it amounts to useful work. **Starvation** is narrower still — one correct, ready-to-proceed unit gets perpetually passed over by a scheduling or lock-acquisition policy that favors everyone else, while the rest of the system hums along normally. All three are failures of progress, not of logic; the code involved can be entirely correct in isolation and still produce one of these three.

### Decision: Prevent Deadlock Through Lock Ordering, or Detect and Recover From It

**What it is:** Whether to eliminate deadlock structurally, by enforcing a single global order in which locks are acquired, or to permit flexible, dynamic lock acquisition and rely on a runtime mechanism to detect a cycle and break it after the fact.

**Why it exists:** Deadlock needs all four Coffman conditions to hold at once: mutual exclusion (a resource can't be shared), hold-and-wait (a unit holds one resource while requesting another), no preemption (a resource can't be forcibly taken back), and circular wait (a cycle of units each waiting on the next). Break any single one of the four and deadlock can't occur — but mutual exclusion, hold-and-wait, and no-preemption are usually properties the system needs to keep for reasons that have nothing to do with deadlock. Circular wait is the one condition you can eliminate for free: if every execution path acquires locks in the same global order, a cycle can never form, because no path can legally acquire a lower-ordered lock after it's already holding a higher-ordered one.

**Options:**
- **Global lock ordering** — every lock in the system is assigned a consistent acquisition order; any path that might hold two locks at once must acquire them in that order, with no exceptions.
- **Runtime cycle detection and recovery** — locks are acquired dynamically in whatever order the workload demands, while a background mechanism tracks a wait-for graph of which unit is waiting on which resource and breaks any cycle it finds.

**Trade-offs:** Global lock ordering costs nothing at runtime and eliminates the most common cause of deadlock outright, at the price of an ongoing, codebase-wide discipline: every new lock has to land in the right spot in the hierarchy, and one acquisition made out of order silently breaks the guarantee for everyone else. Runtime detection drops that upfront discipline requirement entirely — engineers acquire resources in whatever order the dynamic workload actually needs — but it requires a real tracking mechanism, degrades throughput under heavy contention as the cycle check runs, and still has to do something once a cycle turns up: a chosen transaction gets aborted and rolled back, and the caller has to treat that outcome as a normal part of operation, not an exception.

**When to choose each:** [Strong Recommendation] Global lock ordering as the default wherever the engineering team fully controls the codebase — kernels, application frameworks, in-process data structures — because it prevents the defect before a single line ever executes. Runtime detection specifically where lock-acquisition order can't be predicted at all, because it's dictated by arbitrary, dynamically generated requests — a relational database running whatever transactions its callers throw at it is the clearest case, not an exception to prevention but a context where prevention was never on the table.

**Common failure modes:** An undocumented convention — "always lock the metadata table before the inventory table" — holds right up until an emergency hotfix, written under incident pressure, updates inventory and then logs metadata, grabbing the two locks in the opposite order. The violation sits latent until the next real traffic surge interleaves the hotfix's code path with the original one, and the system deadlocks permanently — nothing left to do but a manual restart.

**Example:** The dining philosophers problem is the canonical illustration: five philosophers each need both adjacent forks to eat, and if every one of them picks up their left fork at the same moment, all five wait forever for a fork their neighbor already holds — a pure circular wait, resolved entirely by a rule as simple as "always pick up the lower-numbered fork first." PostgreSQL and MySQL's InnoDB take the opposite, detection-based approach for exactly the reason above: transactions lock rows in whatever order their SQL demands, the engine watches the resulting wait-for graph, and when a cycle shows up it aborts one transaction as the "victim," releases its locks, and lets everyone else proceed — accepting that deadlocks will happen in exchange for never requiring a global lock order across arbitrary user queries.

### Decision: Break Livelock by Randomizing Retries, Not Retrying Faster

**What it is:** Whether concurrent units that fail to acquire a resource retry immediately, on a fixed schedule, or after a randomized delay before trying again.

**Why it exists:** Livelock is what well-intentioned conflict-avoidance logic produces by accident. If every participant responds to a collision the same deterministic way — back off immediately, retry immediately — then participants whose timing happens to sync up collide, back off, and retry in lockstep forever. The system is doing real work in the narrow sense that CPU cycles are spent and state keeps changing; none of it is useful, because every participant is making the identical decision at the identical moment, every single time.

**Options:** Deterministic, fixed-interval or immediate retry the instant a conflict is detected; or randomized backoff — often exponential — that adds jitter so competing participants no longer share the same timing.

**Trade-offs:** Deterministic retry minimizes latency when contention is genuinely rare — it grabs a freed resource the instant it's available, no added complexity required. But under synchronized contention it can collapse into perfect lockstep collision, burning all available CPU on retries that never once succeed. Randomized backoff breaks that symmetry and guarantees eventual progress even under sustained contention, at the cost of real, deliberately-introduced latency jitter on individual attempts.

**When to choose each:** Deterministic retry only inside tightly serialized, single-threaded or cooperative contexts, where a true multi-party symmetric collision structurally can't happen. Randomized backoff as the default everywhere real contention between independent participants is possible at all — optimistic-concurrency retries (Ch 75), distributed lock acquisition, and network-level retries alike.

**Common failure modes:** A lock-free ring buffer has several worker threads contend for the same head pointer; when a compare-and-swap fails, each thread immediately retries. Under load, several threads fall into an identical cadence, colliding and retrying in perfect synchrony — CPU usage pins at 100% while actual throughput drops to exactly zero.

**Example:** Ethernet's CSMA/CD solved exactly this problem at the physical layer, decades before it ever became a software concern: when two network interfaces collide transmitting on a shared wire, each picks a randomized delay drawn from a range that doubles with every successive collision (truncated binary exponential backoff), so the two nodes' timing pulls apart instead of staying locked together — and one of them finally claims the wire.

### Decision: Choose Fair or Unfair Lock-Acquisition Scheduling

**What it is:** Whether a lock hands ownership strictly to whichever waiter arrived first (fair, FIFO), or lets a thread that's already running on a core seize a lock the instant it's released, ahead of threads that have been waiting longer (unfair, barge-in).

**Why it exists:** Starvation is what an acquisition policy produces when it's under no obligation to be fair. A scheduler or lock implementation that always favors whichever requester is already running wins on raw throughput, because waking a sleeping thread costs real time — a real instance of Ch 06's mechanical sympathy, since the CPU core sits idle during that wake-up window regardless of who gets it next. Nothing in that policy, though, guarantees the waiting thread ever actually gets a turn.

**Options:** Fair (FIFO) scheduling, which queues waiters and always hands the lock to the oldest one; or unfair (barge-in) scheduling, which lets an already-running thread grab a freshly released lock ahead of the queue.

**Trade-offs:** Fair scheduling guarantees every waiter eventual progress and bounds tail latency, at the cost of idling a CPU core during every wake-up handoff and lower peak throughput overall. Unfair scheduling maximizes throughput by keeping hot threads running and skipping that handoff cost entirely, at the cost of a real risk that a cold, sleeping thread gets bypassed indefinitely under sustained contention.

**When to choose each:** Unfair scheduling by default for general-purpose, throughput-oriented locks — which describes most of them. Fair scheduling, or a hybrid, specifically where bounded worst-case latency matters more than average throughput, or where one specific waiter is sitting on an invariant the rest of the system is waiting to have flushed.

**Common failure modes:** A custom read-write lock lets new readers keep joining as long as the lock is held in shared mode. Under a sustained flood of read traffic, a background writer waiting to update configuration never gets admitted — the read-side traffic never actually lets up long enough to hand it the lock — and the service keeps serving stale data until somebody restarts it.

**Example:** Go's `sync.Mutex` runs unfair by default for throughput, but tracks how long the longest waiter has been blocked; once that exceeds roughly one millisecond, the mutex flips into an explicit "starvation mode," barring new arrivals from barging in and passing ownership straight down the wait queue, then reverting to unfair mode once the queue clears. Fairness here is a graduated safety valve triggered only once starvation becomes measurable — not a permanent policy chosen up front and paid for on every single acquisition.

### Why Smart Engineers Disagree on Static Enforcement vs. Runtime Mitigation

The disagreement generalizes past deadlock specifically into a question about where correctness should be guaranteed: at compile time, or at runtime.

One position treats any code that can compile with a latent circular-wait possibility as a structural failure, full stop. It favors languages and tools — an affine type system, a formal static model checker — that mathematically rule out a cycle before a binary is ever produced, accepting a real upfront cognitive cost in exchange for never seeing a non-deterministic deadlock in production again.

The opposing position, common among engineers building databases and distributed transaction engines, treats that rigidity as unrealistic the moment a system's access patterns are dictated by arbitrary, runtime-generated requests it has no control over. Forcing a global static order onto queries nobody wrote in advance would collapse the engine into a serial bottleneck; better to accept that a bounded number of localized aborts and retries is just the normal operating cost of real parallelism at that scale.

The resolution tracks whose hands are actually on the access pattern. If a system's lock-acquisition paths are written entirely by the team that owns it, static ordering is nearly free and the safer default. If the access pattern is generated by arbitrary external input at runtime — exactly the database case — no static analysis can order what hasn't been written yet, and runtime detection is the only strategy actually on offer. Ch 78's actor model sidesteps this entire dispute for a different reason: with no shared memory between actors in the first place, there is no lock to order and no cycle to detect — a structural elimination of the whole category this chapter catalogs, not a resolution of the debate inside it.
