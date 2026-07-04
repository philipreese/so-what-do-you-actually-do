# Ch 76 — Async vs. Threads vs. Processes

*The right execution model is decided by what the program is waiting for, not by which one is fastest.*

Coordination and execution — what actually runs the work — are separate questions that combine freely, and confusing them turns a coordination disagreement into a "threads vs. async" argument nobody can win. Concurrency is a property of a program's structure, making progress on more than one unit of work in overlapping time; parallelism is a property of execution, more than one unit actually running at the same physical instant — a program can be one, both, or neither. [Strong Recommendation] The selection test is never which model is fastest, it's what the program is actually waiting for: CPU-bound work needs true parallelism to go faster, while I/O-bound work needs concurrency without needing more cores, and async is often strictly cheaper for it. Using threads for I/O-bound work pays overhead that buys nothing back, but using async for CPU-bound work is the worse failure, since one long computation stalls every other task sharing its event loop, not just the one that caused it.

**Prerequisites:** [What Engineering Actually Optimizes](../part01-systems-thinking/ch01-what-engineering-optimizes.md), [Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md) (latency hierarchy, context-switch cost), [Shared State vs. Message Passing](ch74-shared-state-vs-message-passing.md), [Locks: When to Use Them](ch75-locks-when-to-use-them.md)

**New vocabulary introduced:** concurrency, parallelism, CPU-bound work, I/O-bound work

**Key takeaways:**
- Ch 74 and Ch 75 answered how concurrent units coordinate. This chapter answers a separate question: what actually runs the work. The two axes combine freely — an async runtime can still need locks around shared state, and threads can communicate exclusively through channels — and confusing them turns a coordination disagreement into a "threads vs. async" argument nobody can actually win.
- **Concurrency** is a property of a program's structure — making progress on more than one unit of work in overlapping time — and requires no particular hardware. **Parallelism** is a property of execution — more than one unit of work actually running at the same physical instant — and requires multiple cores. A program can be one, both, or neither.
- [Strong Recommendation] The selection test is never "which model is fastest" — it's "what is the program actually waiting for." CPU-bound work needs true parallelism (threads or processes across cores) to go faster; I/O-bound work needs concurrency without needing more cores at all, and async is often strictly cheaper for it.
- Using threads for I/O-bound work pays context-switch and memory overhead that buys nothing back. Using async for CPU-bound work is the worse failure: one long computation blocks the single event loop and stalls every other concurrent task sharing it, not just the one that caused it.
- Real runtimes make this trade-off visible rather than quietly resolving it for you: Python's GIL means OS threads don't buy CPU parallelism at all; Node.js commits fully to a single-threaded event loop for I/O-bound work; Go's goroutines are a deliberate M:N hybrid, scheduled by the runtime onto a small pool of OS threads, blurring the thread/async line by design.

## For My Wife

**A restaurant kitchen needs actual chefs — expensive, trained, and there's only room for so many at the stove — because cooking is genuinely hard, ongoing work that has to happen somewhere. A dining room, on the other hand, runs on a single host who checks in on twenty tables at once, moving from one to the next as each actually needs something, instead of assigning one full-time staff member to stand beside every table just in case.** Those are two completely different jobs, and hiring the wrong kind of person for either one is expensive in its own way. Put a trained chef at a table just to wait for guests to decide what they want, and the most expensive resource in the building is doing nothing. Ask the single host to personally cook a complicated dish at one table, and every other table in their section goes unattended until it's done — one host can't be in two places, and now twenty tables are waiting on one plate.

This chapter argues computer programs face the exact same choice, and the question that actually decides it isn't "which is faster" in the abstract — it's "is this task genuinely busy the whole time, or is it mostly just waiting for something else to finish?" Real, ongoing computation needs the equivalent of a chef: dedicated capacity actually doing the work. Waiting on something slow — a customer deciding, a network response arriving — needs the equivalent of a host: someone cheap and nimble who can juggle many waits at once without being tied down by any single one of them.

**The costly mistake runs in both directions, but one is much worse: hiring extra hosts to cook is fine, if wasteful. Asking the one host to cook is how an entire dining room stops getting served.**

## For My Kids

Two totally different jobs get lumped into one group project. Someone has to actually sit down and write the five-page report from scratch, start to finish — that's real, continuous work; there's no shortcut, they just have to keep at it.

Someone else has to round up supplies: text five different classmates, wait for each one to write back, then move on while waiting. That job isn't busy the whole time. It's mostly waiting on other people's replies, one after another, and a single person can juggle all five texts loosely without needing five separate messengers.

Confuse the two jobs and you get trouble. Put your best writer on chasing texts, and now they're checking their phone every ninety seconds instead of writing — five separate replies fracturing the one long, focused task the report actually needed.

**Worse: hand the report-writer job to someone who's also supposed to be juggling those five texts, and the report gets zero attention until every single reply is in.** One slow classmate now holds up the entire project — not because writing five pages is hard, but because texting was never something that needed anyone's full, undivided attention in the first place.

---

Chapters 74 and 75 established how concurrent units coordinate access to shared data — through synchronization or through messages. This chapter asks a different, independent question: what actually executes the work. A team arguing over "threads versus async" while the real disagreement is about lock granularity is solving the wrong problem, and vice versa; the two decisions combine freely, and this chapter concerns only the execution vehicle.

### Decision: Choose the Execution Vehicle — Process, Thread, or Async Task

**What it is:** Which physical or runtime-managed unit actually carries out concurrent work: an OS process, an OS thread, or an async task scheduled cooperatively by a runtime.

**Why it exists:** Waiting for network or disk I/O costs orders of magnitude more time than executing a CPU instruction (Ch 06's latency hierarchy). A vehicle built to hold that wait — a full OS thread, with its own stack and kernel scheduling overhead — is expensive to spin up by the thousands just to sit idle. A vehicle built to avoid holding the wait at all — an async task multiplexed onto a small number of threads — is cheap per unit but buys no parallelism on its own. Processes add a further, orthogonal property: a genuinely separate address space, at a further cost in creation time and communication overhead.

**Options:**
- **OS process** — the operating system's unit of resource ownership: its own virtual address space, file descriptors, and security context. Communicates with other processes only through explicit IPC (pipes, sockets, shared memory).
- **OS thread** — an execution context within a process, sharing its address space with every other thread in that process, scheduled preemptively by the kernel.
- **Async task / coroutine** — a lightweight, runtime-managed unit that cooperatively yields control back to an event loop at an explicit suspension point (typically a non-blocking I/O call) instead of being preemptively interrupted.

**Trade-offs:**

| | Process | Thread | Async task |
|---|---|---|---|
| Isolation | Full — separate address space | None — shares process memory | None — shares process memory |
| Creation / per-unit cost | Highest | Moderate (megabytes of stack, kernel-scheduled) | Lowest (kilobytes, user-space scheduled) |
| Scheduling | Preemptive (kernel) | Preemptive (kernel) | Cooperative (runtime) |
| True CPU parallelism | Yes, across cores | Yes, across cores | No, unless backed by an explicit thread pool |
| Failure containment | A crash stays inside the process | A fatal error in one thread can take down the whole process | Same as thread — shares the host process's fate |

**When to choose each:** [Strong Recommendation] A process when fault isolation or a hard security boundary matters more than communication cost — components that should fail independently, or that run untrusted or third-party code. A thread when CPU-bound work must scale across cores and the cost of sharing memory (Ch 75's locking discipline) is acceptable. An async task when the workload is dominated by waiting on I/O and the goal is holding many concurrent operations cheaply, not computing faster.

**Common failure modes:** Thread exhaustion under I/O saturation — a reverse proxy built thread-per-request spawns thousands of OS threads under a burst of slow client connections, and the kernel spends its cycles context-switching between mostly-idle threads instead of moving data, throughput collapsing right when it's needed most. Cascading shared-process collapse — one edge-case request triggers a fatal, unmanaged error inside a single thread of a multithreaded server, and the kernel tears down the entire process, taking every other, unrelated client connection down with it.

**Example:** PostgreSQL forks a fresh backend process per client connection specifically so a fault triggered by one client's query terminates only that one backend, leaving the rest of the cluster untouched — a direct trade of per-connection overhead for blast-radius containment. Node.js commits to the opposite end for a different reason: a single-threaded event loop handling thousands of concurrent network connections on a fraction of the memory a thread-per-connection model would need, because the workload it targets is overwhelmingly I/O-bound to begin with.

### Decision: Match the Execution Model to the Workload's Actual Bottleneck

**What it is:** Whether the dominant limiting resource in a given workload is the processor itself (CPU-bound) or time spent waiting on an external resource such as network or disk (I/O-bound) — and choosing the execution vehicle accordingly.

**Why it exists:** CPU-bound and I/O-bound workloads fail differently when handed the wrong vehicle. Adding concurrency to CPU-bound work without adding execution cores cannot make it faster — the processor is already saturated, and more scheduling only adds overhead on top of a problem that was never about scheduling. Adding OS threads to I/O-bound work adds memory and context-switch cost without reducing the time spent waiting, since the threads spend nearly all their existence blocked rather than computing anything at all.

**Options:** Threads or processes for CPU-bound work, since only they provide true parallelism across cores. Async execution for I/O-bound work, since it holds many concurrent waits cheaply without needing more cores. Hybrid designs for workloads that are genuinely both — an async front end managing network connections while handing CPU-heavy work off to a thread or process pool.

**Trade-offs:** Threads or processes on CPU-bound work convert available cores directly into throughput, but bring no benefit — only overhead — to a workload that's mostly waiting around. Async on I/O-bound work holds enormous numbers of concurrent operations cheaply, but provides no computational speedup and fails badly the moment a CPU-heavy operation runs on it directly. Hybrid designs match each part of the system to its actual bottleneck, at the cost of running two different concurrency models side by side.

**When to choose each:** Threads or processes when computation genuinely dominates — cryptographic operations, image or video processing, numerical simulation. Async when waiting genuinely dominates — a gateway or proxy juggling thousands of mostly-idle connections. Hybrid whenever a system has both kinds of work in different places, which in practice is the common case, not the exception.

**Common failure modes:** Using threads for I/O-bound work pays unnecessary context-switch and memory cost for no gain — wasteful, but bounded and survivable. Using async for CPU-bound work is the worse failure by construction: a single long-running computation — even something as ordinary as a cryptographic signature check on one request — occupies the one event-loop thread directly, and every other concurrent task queued behind it stalls completely until that computation finishes. One slow request just became an outage for every unrelated one sharing the loop.

**Example:** Python's reference implementation ships a Global Interpreter Lock that restricts bytecode execution to one core at a time regardless of how many OS threads a program spawns — threads remain useful there for overlapping I/O, but CPU-bound Python work needs separate processes to get real parallelism at all. Go takes a third path: goroutines are lightweight, cooperatively-scheduled-looking tasks that the Go runtime itself maps onto a small pool of OS threads (an M:N scheduler), so a goroutine that blocks on I/O yields without blocking the underlying thread, while CPU-bound goroutines can still run genuinely in parallel once enough OS threads are available — deliberately blurring the line this chapter otherwise draws between async and threads.

### Why Smart Engineers Disagree on Hybrid (M:N) Runtimes

The disagreement here isn't CPU-bound-vs-I/O-bound — that test isn't seriously contested. It's whether a runtime should hide the process/thread/async distinction entirely behind a scheduler, the way Go's goroutines do.

One position treats Go's M:N model as the right synthesis: forcing engineers to manually choose between explicit `async`/`await` syntax and raw OS threads is unnecessary cognitive overhead. The Go runtime intercepts a blocking call, parks the goroutine, and keeps the underlying OS thread busy with other work — giving engineers the low overhead of async concurrency with the linear, blocking-style code of threads, without asking them to track which model they're even in.

The opposing position — closer to Rust's, C++'s, or Node.js's explicit models — treats a hidden scheduler as its own accidental complexity. It bakes a permanent, non-trivial runtime into every binary, which rules it out for embedded targets or lightweight FFI plugins, and when an M:N scheduler's performance degrades, debugging it means understanding the scheduler's own internal heuristics instead of just the program's code — the execution vehicle stopped being visible in the syntax the moment the runtime took over choosing it for you.

Neither side disputes the underlying CPU-bound/I/O-bound test; they disagree about whether making the execution vehicle implicit is worth the opacity it introduces the moment something goes wrong. A hybrid runtime optimizes for uniform code and low per-task overhead across a large, varied codebase; an explicit model optimizes for a cost that's always visible directly in the code, at the price of engineers having to choose it correctly themselves.
