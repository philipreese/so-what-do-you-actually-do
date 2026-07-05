# Part X — Concurrency and Parallelism

## For My Wife

A warehouse packing team has two completely separate questions running at once, and it's easy to mistake one for the other. How many people are actually packing boxes right now is one question — that's about how much gets done. Whether all of them are reaching into one shared bin of tape, or each has their own roll, is a totally different question — that's about who's allowed to touch what, at the same time, without a collision. You can add more packers and still have the tape-bin problem. You can fix the tape-bin problem and still not be packing any faster.

**Everything in this part assumes the cost literacy Part I built** and turns it toward a single confusion: treating "how much is happening at once" and "who's allowed to touch what at once" as if they were one question instead of two. They're not. A team can be doing plenty at the same time and still grind to a halt over one shared roll of tape, and a team that's carefully avoided ever colliding over the tape can still be embarrassingly slow if only one person's actually packing.

**Untangling those two questions is most of what this part teaches** — because most of what goes wrong in a busy system comes from quietly answering one of them while believing you'd answered both.

## For My Kids

At a bake sale table, two different things are happening, and they're easy to confuse.

How many kids are actually wrapping cookies right now is one question. More hands, more cookies wrapped — that part's simple.

**Whether everyone's dipping into the same one bowl of frosting at the same time is a completely different question.** You can have five kids wrapping and still have chaos if they're all grabbing for the one frosting bowl at once. One kid could work totally alone and never have that problem at all, frosting bowl all to themselves.

Adding more kids to the table doesn't fix the frosting-bowl problem. And fixing the frosting-bowl problem — giving everyone their own little cup — doesn't automatically mean more cookies get wrapped either.

**They're two separate problems wearing one name**, and most of the mess at a bake sale table comes from mixing them up.

---

Everything in this Part assumes the cost-model literacy Part I built, especially Ch 06's latency hierarchy and MVCC-vs-pessimistic-locking framing, and Principle 8's preference for mechanical enforcement over human discipline, which shows up repeatedly here as the actual argument for one design over another. Where earlier parts dealt with a single process's internal structure, Part X is about what changes the instant more than one thing can run at once — and it insists, starting from Ch 74, that this is at least two separate decisions wearing one name: how concurrent units coordinate, and what actually executes them. Conflating those two questions is called out as the most common mistake in the whole domain, and the Part's chapter order is built to keep them apart.

Ch 74 and Ch 75 stay entirely on the coordination axis — shared state versus message passing, then locks as the specific discipline shared state demands — before Ch 76 deliberately switches to the orthogonal execution axis (threads, async, processes), making explicit that an async runtime can still need locks and that threads can communicate exclusively through channels. Ch 77 then catalogs what goes wrong on the coordination axis at scale: deadlock, livelock, and starvation are given precise, non-interchangeable definitions rather than lumped together as "concurrency bugs," and the chapter frames them as concrete instances of Ch 02's state space explosion. Ch 78 closes the Part with the actor model as the synthesis of everything before it — not a new mitigation for data races and deadlocks, but a structural argument that isolating state per actor makes both categories impossible by construction, the same mechanical-over-discipline move Rust's borrow checker made for memory safety.

This Part hands off directly to Part XII: lock contention only becomes worth fixing once profiling (Ch 86) has actually identified it as the bottleneck, and a mailbox's Little's Law-governed backpressure is the same throughput math Part I introduced and Part XII will apply with real measurement tools. A reader leaving Part X should be able to name, for any concurrent design, which axis a given decision belongs to, and should distrust any argument that treats "threads vs. async" as a referendum on how a program should coordinate its shared state.
