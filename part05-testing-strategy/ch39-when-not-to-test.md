# Ch 39 — When Not to Test

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [What Belongs at Each Layer](ch35-what-belongs-at-each-layer.md), [When to Mock vs. Use Real Dependencies](ch36-when-to-mock-vs-use-real-dependencies.md), [Fixture-Based Testing](ch37-fixture-based-testing.md)

**New vocabulary introduced:** trust boundary, implementation coupling, negative ROI test

**Key takeaways:**
- Every test carries a lifetime cost: it has to be written, understood, maintained, debugged, and re-run, over and over. A test suite is an engineering system with its own complexity budget — not a free good that only ever accumulates value as it grows.
- Trivial delegation — a getter, a setter, a one-line pass-through with no conditional logic — buys no meaningful confidence relative to its upkeep. If the test is longer or more complex than the code it verifies, the risk almost certainly doesn't live in that code.
- Application tests should stop at the *trust boundary*: the line separating your business logic from frameworks, ORMs, and language runtimes vendors have already tested far more extensively than any one application team ever could. Testing that a framework does what its own suite already verifies duplicates effort for zero marginal confidence gained.
- Tests should bind to public behavior, never private implementation. A test that fails when a private helper gets renamed or an internal loop gets restructured — while the code's externally observable behavior stays exactly the same — has *implementation coupling*, and it punishes precisely the refactoring a healthy test suite is supposed to protect.
- Hard-to-test code and not-worth-testing code are different diagnoses demanding opposite responses. Hard-to-test code signals a design problem — fix the design, don't skip the test. Not-worth-testing code is easy to test and verifies nothing of value — skip the test, don't write it out of sheer habit.
- Deleting a negative-ROI test is a legitimate engineering call, not a lapse in discipline. A smaller suite that runs fast and gets trusted delivers more real value than a bloated one that's slow and quietly ignored.

## For My Wife

Imagine keeping a detailed, permanently maintained file on literally everything you own — a folder for the refrigerator, a folder for the two-dollar pen, a folder for a paperclip. Filing something away costs time up front, and it costs time again forever after, every time the drawer gets reorganized, every time someone else has to be told what's in a folder and why it's there. For the paperclip, none of that was ever going to pay for itself. Nothing about a paperclip needs tracking, and if one bends, you notice with your own eyes and just grab another.

This chapter argues that programmers do the exact same thing with tests, and it's just as wasteful. Writing a test isn't a one-time act of diligence — it's a promise to keep reading it, updating it, and debugging it for as long as the code exists. That promise is worth making for the refrigerator: the thing that's actually complicated, actually likely to fail in a way nobody would notice on their own, actually worth the folder. It's not worth making for the paperclip, or for a part the manufacturer already tested exhaustively before it ever reached the house — reopening the warranty on something the factory has already verified a thousand times over doesn't make anything safer. It just adds one more folder somebody has to keep straight.

**And the chapter's least comfortable, most useful point is that throwing out an old file isn't sloppiness — sometimes it's exactly right.** A drawer stuffed with decades of warranty cards for things nobody owns anymore isn't more careful than an empty one. It's just harder to search, and the one card that actually matters is buried somewhere in the middle of it.

## For My Kids

Say you're packing for an overnight school trip, and you could, if you wanted, double-check literally everything: is your pencil still a pencil, does your backpack's zipper still zip, is your water bottle still shaped like a bottle. None of that needs checking. A zipper either works or it very obviously doesn't, and you'll notice the second you touch it — no checklist required.

**What actually deserves your attention is the stuff that's easy to get wrong and hard to notice until it's too late:** did you pack the permission slip, is your medication actually in the bag or still sitting on the counter, did you grab the charger and not just the cable. Those are worth a real, careful check, because getting them wrong isn't obvious until you're already on the bus.

**Checking the zipper "just to be safe" isn't extra carefulness — it's wasted time that could've gone toward the stuff that actually matters.** Same goes for double-checking something someone else already verified: if the store already tested that your new backpack's straps hold weight before it reached the shelf, you don't need to personally stress-test the stitching. You need to check the one thing that's actually yours to get right: what you decided to put inside it.

**The skill isn't checking more. It's checking the right things** — the ones actually easy to get wrong, not the ones that basically check themselves.

---

Every other chapter in this Part argues for testing something. This one argues the opposite case: some code shouldn't be tested at all, some tests should never get written, and some tests already sitting in the suite deserve to be deleted. The failure mode here is a suite whose maintenance burden outweighs the confidence it actually delivers — a cost that piles up quietly, one low-value test at a time, until the entire system slows to a crawl.

A test isn't free the moment it merges. It's a standing commitment: somebody will read it to figure out what it verifies, somebody will debug it when it fails, and somebody will update it every time the surrounding code changes, whether or not that change was even a regression. The question worth asking about a candidate test was never "could this fail?" It's "does verifying it here produce more confidence than it costs to keep alive?"

---

### Don't Test Trivial Delegation or Someone Else's Framework

**What it is:** The decision to withhold tests from code with no meaningful branching logic — getters, setters, one-line pass-throughs, simple constructors — and from code whose actual behavior belongs to a framework, ORM, or language runtime rather than to the application.

**Why it exists:** Testing effort ought to concentrate where failure is actually plausible and actually consequential. A getter returning a value its own setter assigned has no decision-making logic left to verify — the only thing that could break it is a defect in the language runtime itself, a problem application tests were never equipped to catch and one framework vendors have already tested far more thoroughly than any single application team ever will. The same logic applies to dependency injection wiring, ORM-generated SQL, and routing configuration: this is the framework's documented behavior, verified by the framework's own suite long before it ever reached you. An application test asserting that Spring injects a constructor dependency, or that an ORM produces the exact SQL its own docs promise, is re-testing the vendor. It has nothing to do with the application.

**Options:**

1. **Test everything uniformly** — every method, every class, every framework interaction gets a dedicated test, regardless of whether it contains meaningful logic.
2. **Test only meaningful behavior** — restrict tests to code containing conditional logic, data transformation, or business rules; leave trivial delegation and framework wiring uncovered, relying on higher-level tests or the framework's own guarantees.

**Trade-offs:**

[Strong Recommendation] **Test only meaningful behavior.** Testing everything uniformly requires no judgment at all, and that's exactly the problem — it produces large, noisy suites where thousands of tests exist purely to confirm field assignment while the genuine business logic gets comparatively less scrutiny per line. Restricting tests to meaningful behavior requires distinguishing trivial code from consequential code — a judgment call with plenty of genuine borderline cases — but it concentrates maintenance effort exactly where it actually pays off.

**When to choose:** If removing a piece of code would obviously break behavior some user or caller depends on, it's probably worth testing directly. If removing it just eliminates a pass-through with no decisions of its own, a higher-level test exercising that code path incidentally usually provides plenty of coverage already. For framework interactions, test the code you actually wrote — how your application behaves once a dependency's been injected, what your repository stores and retrieves — not whether the framework's injection or ORM mechanism works as documented. That's the vendor's job.

**Common failure modes:**

*The Tautological Framework Mirror.* An engineer writes a unit test for a plain data object: instantiate it, call `setName("test")`, assert `getName()` returns `"test"`. The only way this test can ever fail is a catastrophic defect in the language's own memory or string handling — a failure mode the test was never positioned to catch, and one that would take down every other test in the suite simultaneously if it ever happened. The test eats maintenance effort and hands back zero verification value in return.

**Example:** An engineer adds a test asserting an ORM generates an exact `SELECT` statement with specific column ordering. The ORM library gets upgraded and reorders columns internally for a performance optimization — a change with zero effect on application correctness — and the test fails across dozens of modules at once. Days get spent repairing tests that were verifying the vendor's implementation detail, not the application's actual behavior. Testing that the application correctly stores and retrieves data through the repository interface would've caught the same class of real regression without ever coupling to the ORM's internal SQL generation.

---

### Test Public Behavior, Not Private Implementation

**What it is:** The discipline of binding test assertions exclusively to the externally observable behavior a component exposes to its callers, rather than to its private methods, internal call sequences, or intermediate state.

**Why it exists:** Implementation changes far more often than public behavior does. A component's private helpers get split, merged, renamed, and reshuffled constantly during ordinary maintenance and optimization, while its contract with callers stays stable for long stretches at a time. A test suite inspecting private state has fallen into *implementation coupling*: it no longer describes what the software has to do, only how it currently happens to do it. That coupling turns the test suite into a constraint on refactoring instead of a safety net for it. The one thing a test suite is actually supposed to buy — the freedom to change internal structure without fear — is exactly what implementation-coupled tests destroy.

**Options:**

1. **Public-behavior testing** — supply inputs at the module's public boundary and assert only on its observable outputs or state changes.
2. **Private-implementation testing** — use reflection, package-private access, or interaction mocking to assert on internal call sequences, private helper behavior, or intermediate variables.

**Trade-offs:**

[Strong Recommendation] **Public-behavior testing as the default.** It survives internal restructuring without a scratch: splitting a method, merging two helpers, swapping a loop for a different algorithm — none of it should touch the test, because none of it changes what the component promises to its callers. The cost is that a failure buried deep inside a large component might take some tracing back from the public assertion to the actual faulty internal path.

**Private-implementation testing** has one narrow legitimate use: isolated, highly non-linear algorithmic engines — a custom tree-balancing routine, a low-level buffer management scheme — where the internal state transition genuinely *is* the essential complexity under test, not an incidental detail of how some simpler goal got achieved.

**When to choose:** If a test needs rewriting every time an internal helper gets renamed or an internal sequence gets reordered — even though the code's externally observable behavior hasn't budged an inch — that test is bound to the wrong layer, and it should be rewritten against the public interface or deleted outright.

**Common failure modes:**

*The Mock Setup Monolith.* A team tests a service's internal collaboration sequence by mocking every private collaborator and declaring the exact order and arguments each one must receive. The resulting test carries forty lines of mock configuration and one lonely line of actual assertion. When an engineer later swaps a sequential internal loop for an equivalent, faster concurrent implementation — with the external API and its results completely unchanged — the mock's ordering expectations fail on the spot. The failure has nothing to do with correctness. It's purely a record of exactly how the internals used to work, and nothing more.

**Example:** A payment processing component's public method `ProcessPayments(batch)` keeps its signature and output unchanged while its internals get rewritten from a sequential loop into a concurrent map-reduce structure. Every production transaction keeps processing correctly. A test suite written against the public interface — supplying a batch, asserting on the resulting payment records — passes without a single modification. A test suite that had been spying on the internal loop's private call sequence fails immediately, not because anything's actually broken, but because it had frozen the old implementation in place as an unstated part of its own specification.

---

### Distinguish Hard-to-Test from Not-Worth-Testing

**What it is:** The judgment separating two categories of code that both resist straightforward test-writing but demand opposite responses: code that is difficult to test because its design is poor, and code that is easy to test but yields no meaningful confidence when tested.

**Why it exists:** These two situations produce a nearly identical surface symptom — engineers hesitating to write the test — but the correct response inverts completely between them. Code needing fifteen mocks, deeply nested configuration, or global state initialization just to exercise one logic path is showing a design symptom: mixed concerns, missing abstraction boundaries, too much coupling to infrastructure. The correct response is architectural — refactor to isolate the business logic, the way the hexagonal seams from [Ch 11](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md) describe — not skipping the test, and not tolerating the elaborate one either. Code that's trivially easy to test but has no conditional logic of its own — a one-line pass-through, a framework-managed accessor — is showing an entirely different symptom: the test would be simple to write, sure, but it verifies nothing beyond basic language mechanics. Treat both situations the same way and effort lands exactly where it does the least good: elaborate test scaffolding gets built to work around bad architecture instead of fixing it, while trivial methods rack up exhaustive coverage simply because writing it required no thought at all.

**Options:**

1. **Refactor difficult code** — when a piece of business logic is hard to test because it entangles domain rules with infrastructure, restructure it so the logic can be isolated and tested cleanly.
2. **Write the complicated test anyway** — accept the elaborate mock setup or deep configuration as a permanent cost of testing entangled code.
3. **Skip tests on trivial code** — when the code has no meaningful branching logic to verify, decide the test is not worth writing at all.

**Trade-offs:**

[Strong Recommendation] **Refactor when code is hard to test; skip when code is not worth testing — and never confuse the two.** Writing a complicated test around entangled code buys immediate verification at the price of freezing the poor design in place: the mock setup becomes a permanent workaround the next engineer inherits, rather than a temporary accommodation anyone intended to fix. Skipping a test on genuinely trivial code costs nothing except the discipline to actually tell the difference.

**When to choose:** If business logic needs extensive setup because it mixes domain rules with databases, networking, or configuration, treat the difficulty as a design signal and refactor until the logic can be tested independently. If a delegating method or trivial accessor has no branching logic of its own, don't write a test simply because writing one would be easy.

**Common failure modes:**

Teams that mix up these two situations end up investing effort in inverse proportion to value: complex mock-laden tests become permanent scaffolding wrapped around architecture nobody has time to actually fix, while trivial methods accumulate exhaustive coverage precisely because testing them required no judgment whatsoever.

**Example:** A pricing engine tightly coupled to raw SQL queries is hard to test — every price calculation demands standing up database state just to exercise a rule that has nothing to do with persistence. The correct response is extracting the pricing logic behind a port so it can be unit-tested with plain values, not accepting an integration-heavy test suite as the permanent cost of verifying pricing rules forever. A simple forwarding method handing a request straight to a repository, with no logic of its own, rarely deserves a dedicated test no matter how easy one would be to write.

---

### Recognize and Remove Tests with Negative ROI

**What it is:** The ongoing practice of evaluating existing tests against their actual maintenance cost and deleting the ones whose upkeep exceeds the confidence they provide — treating deletion as a legitimate engineering decision rather than an admission of failure.

**Why it exists:** A test suite isn't static — it accrues cost across the entire life of the system it verifies. Confidence and maintenance burden don't scale at the same rate, and past a certain point additional tests mostly generate work rather than catch regressions. A suite taking forty-five minutes to run because it's stuffed with tests for trivial code or brittle implementation details is actively harmful: it slows down exactly the feedback loop testing was supposed to speed up, and teams under that kind of pressure eventually stop running the suite locally, or start waving failures through administratively, destroying the suite's value as a trusted signal no matter how many tests it technically contains.

**Options:**

1. **Preserve every historical test indefinitely** — treat test removal as permitted only when the feature itself is deleted.
2. **Periodically evaluate and remove low-value tests** — treat each test's continued presence in the suite as something that must keep justifying itself.

**Trade-offs:**

[Strong Recommendation] **Periodic removal of tests with negative ROI.** Preserving every historical test guarantees nothing gets accidentally lost, but it also dooms the suite to slow down monotonically over the life of the project, since low-value tests never leave once they've been added. Evaluating tests continually takes real judgment, and occasionally means removing a test that once had value but no longer earns its keep — a genuinely uncomfortable call, but one with a real payoff: faster feedback, a smaller maintenance surface, and a suite developers actually trust and actually run.

**When to choose:** Ask three questions of any candidate test: Does it catch realistic regressions? Does it survive reasonable refactoring? Would anyone even notice if it vanished? If the honest answer to all three is no, that test is a deletion candidate regardless of how long it's been sitting in the repository.

**Common failure modes:**

Mock-heavy suites routinely reach a point where most of each test file is mock configuration and only a few lines are the actual behavioral assertion. Tests like this verify a specific interaction sequence rather than software correctness, and they manage to be both expensive to maintain and weak at catching real defects at the same time — passing even when production behavior is broken, because the mocked collaborators were configured to return values the real dependencies never would in a hundred years.

**Example:** During an infrastructure migration, a team discovers three hundred integration tests verifying that database connection pools reconnect correctly after transient network drops. The tests lean on brittle local threading simulations and fail non-deterministically on a meaningful chunk of CI runs, forcing repeated pipeline restarts. Because connection retry logic has since been handed off entirely to a well-verified standard client library, an engineer deletes all three hundred tests in one pass. Build time drops sharply, flakiness disappears, and no production regression follows any of it — the tests had been burning enormous maintenance effort verifying behavior the application didn't even implement itself anymore.

---

### Why Smart Engineers Disagree

The debate over how much to test got especially loud during the 2014 "TDD is dead" discussion, publicly kicked off by David Heinemeier Hansson. The core criticism was never that testing lacks value — it's that certain widespread testing practices — pervasive mocking, exhaustive unit coverage regardless of risk, designs shaped primarily around testability rather than clarity — produce suites that are brittle and expensive with nothing to show for it in confidence gained. Proponents of strict test-driven development shot back that these are failures of practice, not of testing itself: a poorly disciplined team produces a poor suite under any methodology whatsoever, and the answer is better testing judgment, not less testing.

Both positions describe real failure modes. Suites absolutely can become maintenance burdens that outweigh their value. Systems with too little testing absolutely accumulate undetected regressions. Neither extreme — test everything unconditionally, or treat testing as fundamentally suspect — survives contact with a large, long-lived codebase for very long.

The Go community offers a concrete data point here: many Go projects favor a modest number of straightforward integration tests over exhaustive unit tests for every exported function, reflecting a cultural preference for testing meaningful behavior at the layer where it's naturally verified, rather than maximizing raw test count as a stand-in for rigor. This isn't an argument against unit testing broadly. It's evidence that a mature engineering culture can choose deliberately where to test — and deliberately where not to — without quality collapsing as a result.

The position this handbook takes: don't measure a test suite by how many tests it contains. Measure it by the confidence it provides relative to what it costs to keep alive. Concentrate tests on meaningful behavior and genuine risk. Refactor code that's hard to test because its design is poor. Don't write tests verifying trivial delegation, someone else's framework, or private implementation details that have nothing to do with the software's actual contract. And recognize that deleting a test that no longer earns its place is exactly as legitimate an engineering decision as writing a new one — a smaller suite that's trusted and run continuously beats a larger one that's slow and quietly ignored, every time.
