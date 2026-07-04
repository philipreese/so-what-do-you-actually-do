# Ch 88 — Caching: Layers, Invalidation, Failure Modes

*Storage is the easy part of caching — invalidation is the hard part, and it has a famous name.*

Caching is a spectrum of layers — CPU cache, an in-process application cache, a distributed cache, a CDN edge cache — each trading isolation and control for reach and shared visibility. [Consensus] Storage is the easy part of caching; invalidation, knowing when cached data is no longer trustworthy, is the hard part, as Phil Karlton's aphorism names directly, and "managing distributed cache invalidation is not a pencil-and-paper problem" was never an argument against caching, it was a statement that invalidation deserves an explicit strategy. [Strong Recommendation] Event-driven invalidation triggered mechanically by the write path is more reliable than a manually remembered cache-bust call, which reliably gets forgotten under deadline pressure; TTL expiration is the cheap fallback that requires no write-path discipline at all, at the cost of a bounded staleness window. Cache stampede — a thundering herd of concurrent requests all missing a freshly expired key at once and hitting the backing store simultaneously — is a named, specific failure mode with a standard mitigation: request coalescing or a short-lived regeneration lock.

**Prerequisites:** [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md) (essential vs. accidental complexity, the pencil-and-paper test), [Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md) (CPU cache and the latency hierarchy, referenced not redefined), [Local vs. Global Optimization](../part01-systems-thinking/ch08-local-vs-global-optimization.md), Principle 8 (mechanical enforcement over human discipline), [When to Optimize (and When Not To)](ch85-when-to-optimize.md)

**New vocabulary introduced:** cache stampede

**Key takeaways:**
- Caching is a spectrum of layers — CPU cache (Ch 06's territory, only referenced here), an in-process application cache, a distributed cache like Redis, and a CDN edge cache — each trading isolation and control for reach and shared visibility.
- [Consensus] Storage is the easy part of caching. Invalidation — knowing when cached data is no longer trustworthy — is the hard part, as Phil Karlton's aphorism names directly. This chapter resolves Ch 02's own example of accidental complexity: "managing distributed cache invalidation is not a pencil-and-paper problem" was never an argument against caching, it was a statement that invalidation deserves an explicit strategy.
- [Strong Recommendation] Principle 8 applies directly to invalidation: event-driven invalidation triggered mechanically by the write path is more reliable than a manually remembered cache-bust call, which reliably gets forgotten under deadline pressure. TTL expiration is the cheap fallback that requires no write-path discipline at all, at the cost of a bounded staleness window.
- Population strategy (cache-aside, write-through, write-behind) and invalidation strategy (TTL, explicit, event-driven) are independent decisions — a system can combine any population strategy with any invalidation strategy.
- **Cache stampede** — a thundering herd of concurrent requests all missing a freshly expired key at once and hitting the backing store simultaneously — is a named, specific failure mode with a standard mitigation: request coalescing or a short-lived regeneration lock.

## For My Wife

> *Storing fast copies of data is the easy part. Knowing when those copies are lying to you is the hard part — and it has a famous name.*

**A cache is a faster copy of something stored nearby.** Imagine a convenience store that stocks the five things the neighborhood buys constantly, so you don't have to drive to the warehouse every time. The warehouse is the actual database — authoritative, slow to reach. The convenience store is the cache — fast, but only as good as when it was last stocked.

**Most of the engineering work in caching isn't figuring out what to store. It's figuring out when to throw it out.** Once you've stored a fast copy of something, how do you know when the original changed and your copy is now lying to you? This problem has a famous name: cache invalidation. Phil Karlton — an engineer at Netscape in the 90s — called it one of only two genuinely hard problems in computer science, and that observation has stuck because it's accurate.

**Every approach to invalidation involves a trade-off.** You can set a timer — assume the copy is stale every five minutes and refresh it. Simple, but you spend those five minutes serving wrong answers. Or you can invalidate the copy the moment a write happens. Accurate, but this requires every single piece of code that does a write to know about the cache and remember to clear it — and that is the kind of thing that gets forgotten under deadline pressure.

**The chapter's recommendation is to automate it mechanically.** Watch the database's write stream automatically and fire the cache eviction without relying on any individual developer to remember. Humans under deadline pressure stop remembering things, and a caching bug where wrong data gets served quietly for days is exactly the kind of incident that costs real money or ends up in a public postmortem.

## For My Kids

> *Keeping a quick copy of the answer is the easy part. Knowing the second it stops being true is the hard part.*

Say your team has a group chat, and after every practice somebody pins a message: "Next practice: Tuesday, gym B." From then on, nobody texts the coach to ask where to go — everybody just glances at the pinned message. That's faster for everyone: you're checking a copy sitting right there instead of going straight to the one person who actually knows.

**Keeping that copy around is the easy part. The hard part is knowing the exact moment it stops being true.**

Say practice gets moved to gym A. If the pinned message doesn't change with it, everyone who trusts it walks confidently into the wrong gym — worse than never having pinned anything, because at least then somebody would have asked.

You could make the message expire on its own: good for three days, then everyone's forced back to checking with the coach directly. Safe, but you end up re-asking about things that never changed.

Or you could make it whoever moves practice's job to update the message by hand. **That one quietly breaks**, because it depends on someone remembering to do something extra on exactly the day they're most distracted.

**What actually holds up is connecting the message straight to the schedule**, so it updates itself the instant practice moves. Nobody has to remember, because nobody has to.

Skip that, and the day the schedule changes and nobody updates the chat, your whole team stands in the wrong gym at 4:00, gear on, while practice already started somewhere else.

---

This chapter resolves two forward references made by number — Ch 06 deferred caching layer design here, and Ch 08 deferred caching strategy here — and one made by example: Ch 02 used "managing distributed cache invalidation" as its illustration of accidental complexity, the kind of difficulty that wouldn't exist if the same problem were solved on paper. That was never a reason to avoid caching. It was a flag that invalidation is where caching's real difficulty lives, and this chapter finally gives it the full treatment.

### Decision: Which Layer of the Caching Spectrum to Use

**What it is:** Where duplicated, faster-to-access state physically lives, ranging from inside a single process's memory to a shared network service to a location geographically close to the end user.

**Why it exists:** Every layer trades access speed for reach. Data kept in-process is reachable in nanoseconds but invisible to every other instance of the service. Data pushed to a distributed cache is visible to an entire fleet but costs a network round trip. Data pushed further out, to a CDN edge, sits closest to the user and furthest from the system's ability to control its own freshness.

**Options:**
- **In-process application cache** — data held in the memory of a single running instance.
- **Distributed cache** (e.g., Redis) — an external, shared store reachable by every instance over the network.
- **CDN edge cache** (e.g., Cloudflare, Fastly) — responses cached at points of presence physically close to end users.

CPU cache — L1 through L3 — sits below all three as hardware physics Ch 06 already covered in full; it is not a design choice made at this layer and is not re-derived here.

**Trade-offs:** An in-process cache delivers the lowest possible latency and needs no network dependency, but its data is invisible to every other instance, which produces a low effective hit rate across a scaled fleet, and an unbounded in-process cache competes directly with the application for memory. A distributed cache gives every instance in a fleet the same, globally coherent view of cached state, at the cost of a real network round trip per access and a new single point of failure the whole fleet now shares. A CDN edge cache removes read traffic from origin infrastructure entirely and gets data physically close to the user, at the cost of the least direct control over freshness — a purge issued at the origin takes real, sometimes multi-second, time to propagate to every edge location.

**When to choose each:** [Strong Recommendation] In-process caching only for data that's small, effectively immutable for the life of the process, or explicitly fine to see slightly differently across instances — configuration constants, compiled templates, static lookup tables. Distributed caching as the default for shared, mutable, cross-instance state — session data, rate-limit counters, computed query results a whole fleet needs to agree on. CDN edge caching for public, read-heavy responses where a high read-to-write ratio makes propagation delay an acceptable cost — static assets, product catalog pages, anything that doesn't need to reflect a write within seconds.

**Common failure modes:** *Heap starvation.* A service adds an unbounded in-process cache of database row fragments. Under a traffic spike, the number of distinct keys grows without bound, the runtime's heap expands to hold them, and the garbage collector spends increasing CPU trying to reclaim a working set that never shrinks — driving CPU to saturation and eventually forcing an out-of-memory termination, in a service whose actual bottleneck had nothing to do with the data being cached in the first place.

**Example:** A typical production web stack layers all three deliberately: a CDN in front of static assets and public catalog pages, a Redis cluster holding session state and rate-limit counters shared across the fleet, and small in-process caches limited to per-instance routing configuration — each layer chosen for what it needs to share versus how fast it needs to be.

### Decision: How to Invalidate — TTL, Explicit, or Event-Driven

Phil Karlton's observation — "there are only two hard things in computer science: cache invalidation and naming things" — has survived because it's correct: deciding *when* cached data stops being trustworthy is harder than deciding how to store it.

**What it is:** The mechanism that decides when a cached entry counts as stale and gets removed or refreshed.

**Why it exists:** Serving data that's fast but wrong is frequently worse than serving no cached data at all — a stale account balance, an outdated permission, a stale inventory count are all failures a low-latency response doesn't excuse.

**Options:**
- **TTL-based expiration** — every entry is assigned a time-to-live and expires automatically, with no communication required from the write path.
- **Explicit invalidation on write** — the code path that performs a write is also responsible for invalidating every cache key it affects.
- **Event-driven invalidation** — the write path publishes a change event (via a message bus or database change-data-capture stream), and a separate, automated consumer evicts the affected keys.

**Trade-offs:** TTL expiration requires zero coordination between writers and the cache — a write path can stay completely unaware the cache exists at all — at the cost of a real, bounded window during which stale data gets served regardless of intent. Explicit invalidation eliminates that window for the cases it covers, but it's Principle 8's human-discipline failure mode waiting to happen: it requires every write path, present and future, to remember every key it affects, correctly, forever. Event-driven invalidation gets explicit invalidation's freshness without that dependency on memory — the mechanical trigger is the write itself — at the cost of standing infrastructure (a change-data-capture pipeline or event bus) that can itself fail, stall, or drop an event.

**When to choose each:** [Strong Recommendation] TTL expiration wherever a bounded staleness window is an acceptable business cost — most read-heavy, non-critical data. Event-driven invalidation, not manually-remembered explicit invalidation, wherever freshness genuinely matters and more than one write path can touch the same cached entry — Principle 8 applied directly: mechanical enforcement through the write pipeline beats hoping every future developer remembers a cache-bust call. A short, conservative TTL commonly sticks around even alongside event-driven invalidation, as a defensive backstop against a missed or dropped eviction event rather than the primary freshness mechanism.

**Common failure modes:** *The forgotten write path.* A system relies on every write path explicitly calling a cache-delete after updating a row. A new feature adds a bulk-update batch job that writes directly to the database, and the engineer building it has no idea the cache-invalidation convention exists. Rows touched by the batch job serve stale state indefinitely, because the keys were never given a TTL as a fallback — the only fix is a manual, disruptive full cache flush, which itself creates a burst of load against the now-cold backing store.

**Example:** Media platforms using Fastly commonly pair event-driven "surrogate key" purges — evicting a specific asset within milliseconds of an editorial change — with a short, conservative TTL underneath as a safety net, so that a stall or gap in the eviction pipeline self-heals within seconds rather than persisting indefinitely.

### Decision: Population Strategy — Cache-Aside, Write-Through, or Write-Behind

**What it is:** How data enters the cache in the first place, independent of how it is later invalidated.

**Why it exists:** A read-heavy and a write-heavy workload want different guarantees about how fresh a just-written value has to be versus how much latency a write is allowed to add.

**Options:**
- **Cache-aside** — the application checks the cache first; on a miss, it reads the backing store and populates the cache itself.
- **Write-through** — every write updates the backing store and the cache synchronously, before the write is acknowledged.
- **Write-behind** — a write updates the cache immediately and is acknowledged right away; persistence to the backing store happens asynchronously afterward.

**Trade-offs:** Cache-aside is the simplest to reason about and degrades gracefully — if the cache disappears entirely, the application falls back to the backing store directly — but every cold miss pays full backing-store latency, and a cache-aside population step racing a concurrent write can populate the cache with a value that's already stale the moment it lands. Write-through guarantees the cache never serves data older than the last acknowledged write, at the cost of adding the cache's own write latency to every write, and making every write dependent on the cache's availability. Write-behind delivers the lowest write latency and highest write throughput, since the caller never waits on the backing store at all, at the cost of a real window where an acknowledged write exists only in the cache — a crash or eviction in that window loses the write permanently, and downstream reads other than through the cache operate under eventual, not immediate, consistency.

**When to choose each:** [Strong Recommendation] Cache-aside as the default for read-heavy application data — it's the simplest strategy and the one that fails safest. Write-through where a stale read is a correctness problem, not just a UX one — inventory counts and configuration systems where any downstream consumer seeing an outdated value is a real business failure. Write-behind only where sustained write throughput is the actual bottleneck and the workload can tolerate losing a small, bounded amount of the most recent data — high-frequency telemetry ingestion, non-critical activity counters.

**Common failure modes:** *Write-behind persistence bankruptcy.* A telemetry pipeline buffers incoming writes in a write-behind cache ahead of a database that's meant to receive them asynchronously. The database slows under unrelated load; because the write-behind path has no backpressure back to producers, the pending-write queue inside the cache keeps growing until the cache hits its own memory limit and starts evicting the oldest unflushed entries under its normal eviction policy — silently discarding writes that were already acknowledged as durable.

**Example:** Most database-backed web applications default to cache-aside with Redis sitting in front of the primary datastore; storage engines and OS page caches use write-behind internally, buffering writes and flushing them to physical disk asynchronously, precisely because sustained write throughput is the property they're built to maximize.

### Cache Stampede

**What it is:** A **cache stampede** (also called a thundering herd) occurs when a popular cache entry expires or is invalidated and many concurrent requests miss it at the same instant, all attempting to regenerate it against the backing store simultaneously.

**Why it exists:** Expiration is frequently synchronized across requesters — a single popular key's TTL elapses once, and every concurrent reader of that key discovers the miss at the exact same moment — turning what should be one expensive regeneration into hundreds or thousands of duplicate ones landing on the backing store simultaneously.

**Options:**
- **No coordination** — every request that misses regenerates the value independently.
- **Request coalescing** — the first miss triggers regeneration; concurrent requests for the same key wait on that single in-flight regeneration instead of starting their own.
- **A short-lived regeneration lock** — the first request to miss acquires a lock and repopulates the cache; other requests either wait briefly or serve a slightly stale value until the lock releases.

**Trade-offs:** No coordination is the simplest to implement and is fine when regeneration is cheap, but scales the load on the backing store linearly with the number of concurrent requesters — exactly backwards from what a cache is supposed to do. Both coalescing and locking bound that load to roughly one regeneration per key regardless of concurrent demand, at the cost of the added coordination logic and a brief wait for whichever requests didn't win the race to regenerate.

**When to choose each:** No coordination only when the operation behind a miss is cheap enough that duplicate work genuinely doesn't matter. Request coalescing or a short-lived lock as the default for any expensive or rate-limited backing operation — a database query under real load, an external API call with its own rate limits.

**Common failure modes:** A popular cache key expires during peak traffic; thousands of concurrent requests miss simultaneously and each issues the same expensive database query at once, and the resulting load spike takes down the database the cache existed specifically to protect — a healthy cache and an overloaded backing store, in the same incident.

**Example:** High-traffic services fronted by Redis commonly implement per-key locking or coalescing specifically so that one request repopulates an expired entry while every other concurrent requester waits briefly for that single result instead of independently querying the backing store.

### Why Smart Engineers Disagree

The disagreement isn't about whether caching helps performance — it obviously does. It's about how much consistency risk is acceptable in exchange.

One position treats any staleness as unacceptable: serving an outdated value is a correctness bug, full stop, and the engineering cost of guaranteeing real-time consistency — synchronous write-through, distributed eviction events, sometimes coordination protocols as heavy as a two-phase commit — is worth paying to eliminate it entirely. From this view, a cache that can't guarantee it reflects the backing store at query time shouldn't be trusted as a cache at all.

The opposing position treats the pursuit of real-time cache consistency as the greater risk: binding a cache tier to a datastore through a synchronous, blocking dependency means a cache hiccup can freeze writes entirely, turning a local caching problem into a full outage. This position prefers a loosely coupled cache — short TTLs, lazy cache-aside population — on the reasoning that serving a few seconds of stale data is a far smaller failure than an outage the caching layer itself caused.

The resolution tracks the cost of being wrong, not a general philosophy. A ledger balance, a security authorization scope, or an inventory count backing a guaranteed sale is worth the cost of strict consistency, because stale data there causes irreversible harm. A product listing, a public content page, or a metrics dashboard tolerates a bounded staleness window at no real cost — and for that overwhelming majority of cached data, a short TTL and a cache-aside population strategy is the simpler system that fails the smaller way.

---

Nothing in this chapter concerns which internal data structure a cache implementation uses to decide what to evict — that's a data-structure and algorithm question, and Ch 89 is where it belongs.
