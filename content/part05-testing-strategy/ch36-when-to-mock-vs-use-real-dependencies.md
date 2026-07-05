# Ch 36 — When to Mock vs. Use Real Dependencies

*Mocks verify interactions; fakes and real objects verify state.*

The test double taxonomy — dummy, stub, spy, mock, fake — has precise, distinct meanings, and using "mock" as a catch-all conflates four different techniques and blurs what a test is actually telling you. Mocks verify interactions, that collaborators got called correctly; fakes and real objects verify state, that the system produced the right output, and these aren't interchangeable forms of confidence. The classicist school reaches for real collaborators wherever it can and produces tests that survive internal refactoring; the mockist school replaces every collaborator with a mock and ties the suite to implementation structure instead of behavior. Real or near-real dependencies should be preferred wherever the cost is acceptable, replacing a dependency only when it's genuinely outside your control, non-deterministic, or prohibitively expensive to run.

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [What Belongs at Each Layer](ch35-what-belongs-at-each-layer.md), [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Layered, Hexagonal, and Ports-and-Adapters Architecture](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md)

**New vocabulary introduced:** test double, dummy, stub, spy, mock, fake, refactoring fragility, state verification, interaction verification

**Key takeaways:**
- The test double taxonomy — dummy, stub, spy, mock, fake — has precise meanings defined by Fowler's "Mocks Aren't Stubs" (2004). Using "mock" as a catch-all conflates four genuinely different techniques and blurs exactly what a test is supposed to be telling you.
- Mocks verify interactions: that collaborators got called in the right order with the right arguments. Fakes and real objects verify state: that the system produced the correct output. These aren't interchangeable forms of confidence, whatever the naming convention implies.
- The classicist (Detroit) school reaches for real collaborators wherever it can; the mockist (London) school replaces every collaborator with a mock. The classicist approach produces tests that survive internal refactoring. The mockist approach ties the suite to implementation structure instead of behavior.
- Prefer real or near-real dependencies wherever the cost is acceptable. Replace a dependency only when it's genuinely outside your control, introduces non-determinism you can't remove, or is prohibitively expensive to run.
- Refactoring fragility — a suite that breaks during valid internal restructuring because it specified implementation rather than behavior — is the dominant cost of over-mocking, and it's a cost that compounds.

## For My Wife

Imagine two ways of checking whether a food delivery went well. One watches the driver's entire route on GPS and flags anything that deviates from the exact turns originally planned. The other just checks: did the food arrive at the right address, still warm, on time? The first sounds thorough, but it fails the moment the driver finds a smarter shortcut around traffic — even though the delivery itself was flawless. It was never actually checking whether the delivery worked. It was checking whether the driver followed a specific script.

That's the whole distinction this chapter argues over. One style of test watches exactly which internal steps a piece of code takes, in what order, with what inputs — the same way the GPS-route checker does. Another style just checks the actual outcome: is the final answer correct, did the right thing get saved. The chapter's position is that outcome-checking should be the default, because a program's internal steps are allowed to change — get reorganized, sped up, simplified — as long as what comes out the other end is still right. A test that locks in the exact route breaks every time an engineer improves how the work gets done, even when nothing about the actual result changed at all.

*The real cost shows up months later, when a team stops trusting its own tests to mean anything, and starts leaving working code alone rather than face the false alarm every small improvement sets off.*

## For My Kids

### The Shortcut That Got Marked Wrong

Say you turn in a math worksheet, and there are two ways a teacher could grade it. One way: check whether your final answer is correct. The other way: check whether you solved it using the exact steps taught in class, in the exact order, even if your answer came out right.

**Most of the time, checking the final answer is obviously the right call.** If you found a shortcut to get to 42 and 42 is genuinely correct, marking you wrong for not doing it "the way it was taught" is punishing you for something that was never actually broken.

**Grading the process instead of the answer creates a strange problem: it breaks the moment you get smarter.** Find a faster, cleaner way to solve the same problem, and a teacher grading strictly on steps marks you down for improving — even though the thing that actually matters, the answer, never stopped being right.

**There's one place checking the process genuinely is the point:** when the assignment is specifically "practice long division," the steps *are* the actual assignment, not just a means to an answer. That's the rare exception, not the rule.

**Grade the process as if it were the whole point too often, and something predictable happens:** kids stop trying better methods, because a better method just gets marked wrong for not looking like the old one.

> [!CAR]
> Have you ever found a faster way to solve something and gotten dinged for not doing it the "right" way? Should the answer be all that counts, or does the method matter too?

---

[Ch 35](ch35-what-belongs-at-each-layer.md) established which layer should test a given piece of code. This chapter answers the question that lives inside a layer: when a unit test needs a collaborator, should that collaborator be real, or replaced with something else entirely?

This question comes with a taxonomy, two opposing philosophical traditions, and a practical position. The taxonomy has to come first, because the two traditions keep describing different objects under the exact same name.

---

### The Test Double Taxonomy

Martin Fowler's 2004 essay *"Mocks Aren't Stubs"* formalized five categories of test substitute, collectively known as **test doubles**. Engineering teams that lump all five under "mock" accumulate real communication failures over time: "mock the repository" could reasonably mean four distinct techniques with four different implications for what the test actually checks.

**Dummy** — An object passed into a method signature purely to satisfy the compiler, never actually invoked. A dummy configuration struct handed to a constructor that ignores it on the path under test.

**Stub** — A component returning predetermined responses to specific calls. It supplies data the code under test needs and tracks nothing about how or whether it was called — the test asserts nothing about the stub itself, directly.

**Spy** — A stub with a memory: it records its own interactions — how many times a method got called, with what arguments — for inspection afterward. The test examines what the spy captured once execution wraps up.

**Mock** — A substitute pre-programmed with behavioral expectations before execution even starts. If the code under test fails to call the right methods in the right order with the right arguments, the mock fails the test on the spot. Mocks verify interactions, never outputs.

**Fake** — A working implementation running on a simplified backing mechanism unfit for production: an in-memory repository storing records in a hash map, a local SMTP server recording messages in memory instead of sending them. A fake implements the same interface as the production dependency and does genuine work — it just takes shortcuts a deployed system never could.

The division that actually matters operationally is between doubles verifying **state** (the system produced the correct output — stubs, fakes, real collaborators) and doubles verifying **interactions** (the system called its collaborators correctly — mocks, and occasionally spies). Choosing between those two approaches is the central decision this entire chapter is about.

---

### Verify Behavior, Not Interactions

**What it is:** The choice between tests that assert what the system *produces* (state verification) and tests that assert what the system *calls* (interaction verification).

**Why it exists:** A test built on real collaborators, fakes, or stubs verifies that assembled code produces the correct observable outcome — the right value came back, the right record got written, the right message got generated. A test built on mocks verifies that the code called specific methods in a specific sequence, and nothing more. These are different questions with different answers. Behavior can stay correct while the implementation structure changes underneath it; interaction specifications can pass clean while the behavior itself breaks. An engineer who changes an internal call sequence purely for performance and causes a hundred mock-based tests to fail hasn't broken the software at all — the software works exactly the same. The tests just won't say so.

**Options:**

1. **State verification** — test with real collaborators, in-memory fakes, or stubs; assert the final output or persisted state.
2. **Interaction verification** — test with mocks that declare what methods must be called; assert those expectations were met.

**Trade-offs:**

[Strong Recommendation] **State verification as the default.** Tests verifying observable behavior survive internal restructuring without complaint: split a method, merge two helpers, replace sequential calls with a batched equivalent, and a state-verifying test stays unaffected as long as the output is still correct. The behavior was never a side note in the specification. The behavior *was* the specification.

**Interaction verification earns its place for outbound side effects** — behavior producing no direct return value a test could inspect: dispatching an asynchronous notification, publishing an event to a message broker, writing to an audit log. There's no output to assert against here; the call itself is the entire behavior. A spy capturing the outgoing notification payload, or a mock asserting a publish method fired exactly once, is the right tool for exactly this narrow situation and nowhere else.

**When to choose:** Default to state verification, every time. Reach for interaction verification only when the side effect itself is the behavior under test and no observable state change exists anywhere to assert against instead.

**Common failure modes:**

*The Brittle Expectation Lock.* A billing engine test uses a mock expecting `fetchDiscountRate()` to be called exactly twice with specific account IDs. A later optimization combines both calls into one batched lookup. The final invoice total comes out identical. The mock framework fails the test anyway, because it was verifying internal call structure, not behavior. Fixing the test means rewriting it to accommodate a performance change that altered nothing anyone could actually observe.

**Example:** A billing engine test verifies an invoice total using a *stub* returning a fixed discount rate whenever queried. The test hands the stub a fixed `PremiumCustomer` value and checks the computed total. If the engine later starts caching discount lookups internally, the test doesn't even notice — it never specified how many times the stub would get called, only what the engine was supposed to produce. To also verify a success notification goes out, the same test injects a *spy* recording the outgoing email payload, and inspects what the spy captured once execution finishes. State verification handles the computation. The spy handles the side effect. Each tool does exactly the job it was built for, nothing more.

---

### Classicist or Mockist Testing Strategy

**What it is:** Two schools of thought about what "unit" in unit testing means, and therefore how extensively test doubles should replace collaborators.

**Why it exists:** The *classicist* school (associated with Kent Beck and the Detroit tradition) defines a unit as a cohesive piece of behavior, full stop. Tests exercise real collaborators freely as long as those collaborators stay in memory with no I/O attached. Test doubles get reserved for external systems, non-deterministic resources, and infrastructure — nothing else. The *mockist* school (associated with the London tradition) defines a unit as a single class isolated from every collaborator it has. Every dependency gets replaced with a mock, and the test asserts on call patterns and argument structures instead of outcomes.

**Options:**

1. **Classicist (Detroit) strategy** — use real collaborators for all components within the system boundary; replace only external systems, non-deterministic resources, and infrastructure.
2. **Mockist (London) strategy** — replace all collaborators with mocks regardless of whether they are internal or external; isolate the single class or file under test completely.

**Trade-offs:**

[Strong Recommendation] **Classicist strategy as the default.** The dominant cost of the mockist approach is *refactoring fragility*: a test suite built on interaction specifications turns into a rigid transcript of the code's current internal structure, nothing more. Every refactor — extracting a helper method, reorganizing collaborators, combining calls — invalidates expectations describing zero actual behavioral change. Engineers who discover their test suite punishes refactoring simply stop refactoring, and the accidental complexity tests were supposed to help control piles up unchecked instead.

The classicist approach carries a different cost: when a shared collaborator has a bug, every test exercising it transitively fails too. But that failure pattern is diagnosable and visible — a cluster of related failures points straight at a problem in a shared component. The mockist failure mode — tests passing while production breaks, because collaborators were replaced with assumptions instead of reality — is the far more dangerous direction to fail in.

**Mockist techniques earn genuine value** for components whose primary job is coordination: a workflow orchestrator, a message dispatcher, an inter-service gateway. When the sequence and target of calls *is* the behavior — not a side effect of it — interaction verification is exactly the right call.

**When to choose:** Default to classicist. Apply mockist techniques selectively, for high-level coordinators whose correctness is defined by *how* they route collaborators rather than by any value they compute.

**Common failure modes:**

*The Green Mirage.* A team achieves high coverage by mocking every collaborator. Tests run in seconds and pass reliably in CI, every time. In production, the application crashes on first contact: the mocks were configured to return values the real dependencies could never actually produce. Because every collaborator got replaced, the tests verified the assumptions baked into the mocks — never the actual behavior of the system itself. The green signal was measuring compliance with the team's own assumptions, not reality.

**Example:** A user registration service calls a password hasher, a database repository, and a notification publisher. A mockist test replaces all three with mocks and asserts `hash()`, then `save()`, then `notify()` fired in that exact order. A classicist test uses the real password hasher (fast, deterministic, in-memory), an in-memory repository fake implementing the same interface, and a notification spy. It asserts that a validly hashed record actually got committed to the state store, and that one notification got captured. If the engineer later extracts the hashing step into a standalone service, the classicist test needs zero changes — the behavior is identical. The mockist test fails anyway, purely because the call sequence changed.

---

### Prefer Real or Near-Real Dependencies

**What it is:** The decision about whether a dependency should be replaced at all — and when a real or near-real instance should be used instead of any substitute.

**Why it exists:** Every test double bakes in an assumption about how the production dependency behaves. Those assumptions drift silently over time. The production system changes. The mock doesn't. Tests keep passing right up until the failure lands in deployment instead. Preferring real dependencies wherever possible isn't a purist stance — it's just admitting a substitute without the production dependency's actual behavior isn't verifying that dependency at all.

**Options:**

1. **Real dependency** — the production implementation, run in a container or in-process where applicable.
2. **In-memory fake** — the same interface with a simplified backing mechanism: a map-backed repository, a local SMTP implementation.
3. **Stub or mock** — canned responses or pre-programmed interaction expectations.

**Trade-offs:**

[Strong Recommendation] **Prefer real or near-real dependencies wherever the operational cost is acceptable.** The historical case for mocking infrastructure — spawning a database is slow, fragile, environment-dependent — has been largely undercut by container tooling at this point. Testcontainers (Java, Go, Python, .NET, and others all have it) spins up a production-identical PostgreSQL, Redis, or Kafka instance in seconds within the test run and tears it down when it's done. "Too expensive to run for real" has moved a lot further down the cost curve than it used to sit.

**In-memory fakes earn their place** at the unit layer, where domain logic exercises repository behavior at high speed with zero I/O overhead. A fake has to genuinely implement the same interface and behavioral contract as the real adapter — a fake isn't a mock with simpler internals bolted on. It's a working implementation running on a lighter backing store, nothing less.

**Stubs and mocks are the right tool** specifically when the dependency is:
- **External to your control** — a third-party payment processor, an external SaaS API, a licensed service you can't provision locally, full stop.
- **Irreducibly non-deterministic** — the system clock, a random number generator, network latency, hardware sensors.
- **Prohibitively expensive or unreachable** — a legacy mainframe, a heavily rate-limited external enterprise system, a licensed data provider.

Outside those three categories, "the dependency is annoying to set up" isn't a good enough reason to mock it. Annoying setup is a signal to invest in Testcontainers or a shared test fixture — not license to substitute the dependency with a pile of assumptions instead.

**When to choose:** If the dependency belongs to your system, starts up within a few seconds, and runs deterministically, just use it — directly, or in a container. If it's external, non-deterministic, or genuinely impractical to run, replace it with the least artificial substitute you can get away with: a fake before a stub, a stub before a mock.

**Common failure modes:**

*Dialect Drift.* A team tests its PostgreSQL repository against an in-memory SQLite substitute, because SQLite is lighter and needs no daemon running. An engineer writes a reporting query using PostgreSQL window functions. SQLite accepts the query without a word of complaint — it doesn't implement those functions, but it fails silently rather than raising a syntax error inside the test harness. Tests pass. Production crashes with a fatal SQL exception the very next deploy. The integration test had been validating the stub's silence the whole time, never the database's actual execution.

**Example:** An order fulfillment system runs a two-tier strategy. Domain logic gets tested with an in-memory repository fake storing records in a thread-safe map — millisecond execution, thousands of business-rule variations a second. The persistence adapter layer gets tested against a real, ephemeral PostgreSQL instance via Testcontainers: every INSERT, index constraint, foreign key rule, and migration script runs against the actual engine, no exceptions. No mock ever touches the database layer. The in-memory fake serves the unit layer. The real container serves the integration layer. Each replacement exists because it removes a genuine obstacle — never because a mocking framework happened to make replacement easy.

---

### Why Smart Engineers Disagree: Design Tool or Safety Net?

The foundational disagreement here is about what a test suite is even *for*.

The mockist argument holds that a test suite is a design tool first and foremost. When every collaborator has to be explicitly mocked, the mock configuration surface becomes a live coupling measurement: a class needing eight mocks to initialize has eight dependencies, and that number is itself a feedback signal worth paying attention to. Mocks force interface clarity upfront, since you can't mock a dependency you haven't already made explicit. In this view, classicist testing quietly masks poor design — a cohesion-poor, tightly coupled module can pass every one of its tests as long as the global output happens to come out right, and the design problem sails through unnoticed.

The classicist argument holds that a test suite is a safety net, plain and simple. A safety net that fails every time an engineer restructures code — even when the behavior is completely unchanged — teaches engineers to avoid restructuring altogether. The result: the exact tool meant to enable refactoring ends up actively discouraging it. A test that specified interactions but never outcomes was never verifying correctness in the first place. It was recording one particular execution path and calling that a test.

The practical resolution is architectural. Hexagonal architecture from [Ch 11](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md) makes port interfaces explicit by construction — the design-feedback benefit the mockist school chases through mocks arrives for free, structurally, from the architecture itself, with none of the refactoring cost attached. Domain logic in the core carries no hidden dependencies, because the structure enforces isolation on its own. When the architecture already surfaces coupling in plain sight, mocks aren't needed to expose what's already visible.
