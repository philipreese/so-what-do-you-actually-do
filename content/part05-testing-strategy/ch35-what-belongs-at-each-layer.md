# Ch 35 — What Belongs at Each Layer

*Difficulty writing a unit test is a design signal, not a testing problem.*

Unit tests belong wherever behavior is purely computational, and if bolting on a database or network call contributes nothing to verifying that behavior, the call doesn't belong in the test. Integration tests belong at architectural boundaries and need real or near-real infrastructure, since an in-memory substitute that doesn't speak the production engine's exact dialect will pass every test and still let production fail. End-to-end tests belong at complete user journeys — a critical handful, never a comprehensive catalog. Difficulty writing a unit test is a design signal, not a testing problem: code that's hard to isolate is code mixing concerns that should have been separated in the first place.

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Layered, Hexagonal, and Ports-and-Adapters Architecture](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md), [When to Split Files vs. Keep Together](../part04-code-organization/ch29-when-to-split-files-vs-keep-together.md)

**New vocabulary introduced:** architectural seam, testability diagnostic

**Key takeaways:**
- Unit tests belong wherever behavior is purely computational: pure functions, domain logic, validation, data transformations, state machines. If bolting on a database or network call contributes nothing to verifying the behavior, it doesn't belong there.
- Integration tests belong at architectural boundaries: database queries, ORM mappings, HTTP adapters, message serializers. Test these against real or near-real infrastructure — an in-memory substitute that doesn't speak the production engine's exact dialect will pass every test and still let production fail.
- End-to-end tests belong at complete user journeys: the paths where the assembled behavior of every component together is the actual thing being validated. A critical handful, never a comprehensive catalog.
- Difficulty writing a unit test is a design signal, not a testing problem. Code that's hard to isolate is code mixing concerns that should've been separated in the first place.
- Test co-location — tests living right next to the code they verify — is the natural expression of package-by-feature organization. It heads off the structural drift a parallel test tree accumulates over time, quietly and reliably.

## For My Wife

**This chapter picks up where the last one left off: given three tiers of tests, which one actually tests which piece of code?** Good cooks taste as they go — the sauce before it's poured, the seasoning before the dish is assembled — because tasting a component on its own tells you immediately whether that specific piece is right. A recipe that seals everything into one casserole from the start, no tasting until it comes out of the oven, means that if the finished dish is off, you're stuck guessing: too much salt in the sauce, undercooked at the base, wrong ratio somewhere. You find out something is wrong. You don't find out what.

**The chapter's real point is that this isn't a testing choice at all — it's a design choice wearing a testing costume.** A recipe built so you *can* taste the sauce on its own, before it touches anything else, is simply a better-organized recipe: the parts are separable because someone thought about the parts separately in the first place. Code works the same way. If you can't check whether one calculation is correct without first wiring up a database, a network connection, and half the rest of the application, that's not a fact about testing — it's a fact about the code. It welded pieces together that should have stayed apart, and now proving any one part works means firing up the whole kitchen every time.

The fix is the same one earlier chapters already argued for: keep the actual thinking — the calculations, the decisions, the rules — separate from the plumbing that carries data in and out. Once that separation exists, the easy tests fall out for free, and a change to how data gets stored stops being able to break a rule that never had anything to do with storage to begin with.

## For My Kids

Say you want to check whether your bike's brakes actually work. If they're built right, you just grab the brake lever and watch it grip the wheel — you don't need the tires pumped, the seat adjusted, or the chain oiled first. The brakes are their own thing, so testing them is its own separate, ten-second job.

**Now say your bike got slapped together so that squeezing the brake lever also makes the seat wobble and tugs on the pedals.** You can't check just the brakes anymore — testing them means dealing with the whole bike at once, every time. That's not because brakes are secretly hard to test. It's because whoever built the bike tangled them into everything else instead of keeping them their own separate part.

**The annoying part isn't a testing problem — it's a building problem wearing a testing costume.** When something's hard to check on its own, that's the bike telling you it was put together wrong, not a sign you need a fancier way to test it.

**The fix is rebuilding it so the brakes connect cleanly to just the wheel, nothing else.** Once that's true, checking the brakes takes ten seconds, doesn't touch the seat or the pedals, and works the same way whether the rest of the bike is finished or still sitting in pieces on the garage floor.

---

[Ch 34](ch34-the-testing-pyramid.md) established that different tests answer different questions at different costs. This chapter answers the practical question that follows from it: for any given piece of code, which layer should actually be testing it?

This is as much a design question as it is a testing one. Whatever layer naturally fits a piece of code reveals what kind of responsibility that code is really carrying. If figuring out the right layer is genuinely hard, the design is usually the real problem — the code is tangling together responsibilities that belong at different levels of the architecture and were never supposed to meet.

---

### Unit-Test Pure Behavior

**What it is:** The constraint that unit tests cover behavior whose correctness depends only on inputs, logic, and outputs — with no external I/O, no clock, no filesystem, no network, no database.

**Why it exists:** Pure behavior is deterministic — the same inputs always produce the same outputs, no matter the environment, the system time, or the local file layout. That *determinism* is exactly what makes unit tests cheap and precise. They run in milliseconds, behave identically on every machine, and when they fail they point straight at the broken code path. Bolt on unnecessary infrastructure and you've traded away that precision for absolutely nothing in return.

**Options:**

1. **Pure-domain isolation** — test business logic using only in-memory inputs and outputs, with no framework, network, or persistence dependencies.
2. **Framework-entangled isolation** — test business logic inside framework-provided test contexts that manage object lifetimes, configuration, or persistence.

**Trade-offs:**

[Strong Recommendation] **Pure-domain isolation** for all core business logic. A pricing engine, a discount calculator, a state machine, a validation rule, a data transformer — all of these exist independently of how their inputs arrive or where their outputs end up going. Testing them with no infrastructure isn't a limitation. It's the natural expression of what they actually are. A domain module tested this way survives framework upgrades, database migrations, and infrastructure overhauls without a single test line ever needing to change.

**Framework-entangled isolation** speeds up early development by letting validation rules live directly inside framework models. The bill arrives at scale: every test now bootstraps the entire framework, turning a millisecond assertion into a multi-second setup ritual. The unit base of the pyramid becomes too slow to run continuously, which was the entire point of having a unit base in the first place.

**When to choose:** Unit tests for any behavior whose correctness depends purely on computation. If the test would pass or fail identically whether or not a database happened to be sitting there, the database shouldn't be sitting there.

**Common failure modes:**

*The Hidden I/O Leak.* An engineer writes a unit test for a validation function. The function quietly reads a configuration file to check a locale setting, or calls a library that queries the system timezone. The test passes locally. In a CI container missing that configuration, or sitting in a different timezone, it fails. The test was never actually isolated. The I/O dependency was just invisible until it wasn't.

**Example:** In a hexagonal architecture, an international billing engine computes compounded regional VAT straight from raw domain values. Its unit tests pass floats and custom domain types directly into the computation and check the result. The test file imports no SQL, no HTTP, no framework context whatsoever. The test suite for a genuinely complex tax calculation engine runs thousands of cases in under a second precisely because it contains nothing that doesn't belong there.

---

### Integration-Test Boundaries

**What it is:** The decision to test the interaction between a component and the external system it communicates with — verifying that the communication itself is correct, not just that the component's internal logic is correct.

**Why it exists:** Two independently correct components can still fail the moment they interact. A repository can contain perfectly valid SQL that maps columns wrong. An HTTP client can serialize requests flawlessly by its own logic and still violate the target service's contract. An ORM mapping can look fine right up until a migration renames a column. Unit tests can't catch any of this, because the failure lives at the boundary, not inside either component. The *architectural seam* — the interface where one component touches another — is exactly what the integration layer exists to test.

**Options:**

1. **Real infrastructure integration** — test adapters against actual instances of the dependency: a real PostgreSQL database, a real Redis cache, a real Kafka broker, spun up in a container.
2. **In-memory emulation** — test adapters against a lightweight substitute that approximates the real dependency, such as an embedded H2 database in place of PostgreSQL.

**Trade-offs:**

[Strong Recommendation] **Real infrastructure integration** for all production database adapters, message brokers, and any operation leaning on vendor-specific behavior. The specific reason in-memory emulation fails is *dialect divergence*: SQL that runs perfectly clean against an H2 in-memory engine can use syntax or locking behavior that PostgreSQL rejects outright. The in-memory substitute swallows the invalid query without a word of complaint. Production crashes. The integration test that was supposed to catch exactly this failure handed back false confidence instead. Testcontainers (Java, Go, Python, and others) has moved the whole cost threshold: spinning up a real PostgreSQL instance in a Docker container during CI is cheap enough now that the substitute rarely wins the trade for most teams anymore.

**In-memory emulation** is acceptable when the data access model is genuinely simple — standard key-value operations, basic collection semantics — simple enough that no dialect divergence exists in practice. That's a narrower category than it looks at first glance.

**When to choose:** Whenever an adapter's correctness depends on communicating with another component, test that communication against a real or near-real instance. The boundary is the thing being verified — a substitute that doesn't share the boundary's actual behavior isn't verifying anything, no matter how confident the green checkmark looks.

**Common failure modes:**

*The Mocked Database Illusion.* A team tests its database adapter layer by mocking out the database client entirely. Tests run fast and pass cleanly in CI. In production, the application crashes with SQL syntax exceptions — a column got renamed in a migration script, and the mock accepted the stale column name without objecting to any of it. The test passed because the mock was told exactly what to return. It verified nothing about the actual database, ever.

**Example:** A billing module's database adapter writes financial records through a port interface. Its integration tests spin up a production-identical PostgreSQL instance through Testcontainers, run the real INSERT query, read the persisted state back directly, and confirm relational constraints and foreign keys are actually being enforced. The test skips mocks entirely, because the adapter's correctness is defined by what the database genuinely does with its queries — nothing less.

---

### End-to-End Test Complete User Journeys

**What it is:** The small, curated set of tests that exercise the entire assembled application — from the external interface through all services and infrastructure — to validate the behaviors that only emerge when everything is deployed and running together.

**Why it exists:** Some failures stay invisible until every component is assembled together: a misconfigured environment variable, a broken API gateway route, a CDN caching rule intercepting authenticated requests, a deployment that put the right components together in the wrong order. Unit and integration tests can't catch any of this, because neither one ever assembles the full system. A small E2E layer exists purely to provide a macro-level smoke check over the complete operational topology.

**Options:**

1. **Critical journey guardrails** — a small, high-value set of E2E scripts covering the paths that define the system's core capability.
2. **Comprehensive boundary regression** — E2E tests that attempt to cover every feature, variation, and edge case at the full-stack level.

**Trade-offs:**

[Strong Recommendation] **Critical journey guardrails only.** E2E tests cover the journeys where the assembled behavior is itself the thing being validated. Everything else belongs lower in the pyramid, no exceptions. The consequence of comprehensive boundary regression is the ice cream cone all over again: an unmaintainable, slow, flaky suite that eventually becomes too unreliable to trust with anything.

**When to choose:** End-to-end tests for complete user journeys crossing multiple architectural boundaries, where the assembled system has to succeed as a whole: user registration, checkout, authentication, payment processing, document upload. Not for individual business rules, discount calculations, input validations, or error messages — those belong at the unit or integration layer regardless of the fact that a user eventually bumps into them through the UI.

**Common failure modes:**

*The Brittle DOM Selector Blockade.* An engineer writes an E2E test verifying that an error message appears when an invalid coupon code gets entered. A designer later moves the error component into a side modal and updates a CSS class name purely for layout reasons. The underlying validation logic, API, and database are all unchanged and correct. The E2E test fails anyway, because its DOM selector no longer matches the element. A critical deployment sits blocked for hours while someone tracks down and fixes a locator string. The test was testing the wrong thing at the wrong layer the whole time.

**Example:** A distributed e-commerce platform restricts its E2E suite to exactly three scripts: `verifyUserCanRegister()`, `verifyUserCanSearchAndCart()`, and `verifyUserCanCompleteCheckout()`. Each one asserts only a broad success state — reaching the `/receipt` route, receiving a confirmation email. Every edge case — expired coupons, invalid quantities, decimal rounding — gets pushed down to unit tests in the domain layer instead. The E2E suite stays small, fast, and trustworthy precisely because it never tried to be comprehensive in the first place.

---

### Let Testability Reveal Design Quality

**What it is:** The principle that difficulty writing a unit test is a *testability diagnostic* — a signal about the design of the code, not a signal about the difficulty of testing.

**Why it exists:** Well-designed code keeps computation separate from infrastructure interaction. Business logic depending directly on databases, network calls, the system clock, or a UI framework can't be isolated for unit testing, because there's nothing left to isolate it from. The test is hard to write not because testing itself is hard but because the responsibilities were tangled together to begin with. The test is exposing coupling the design never should have had.

**Options:**

1. **Accept the coupling** — push the test up to a higher layer that includes the infrastructure.
2. **Refactor toward explicit boundaries** — separate computation from infrastructure so the business logic can be tested without it.
3. **Skip the test** — accept that this code is untestable at the unit layer.

**Trade-offs:**

[Strong Recommendation] **Refactor toward explicit boundaries** whenever business logic and infrastructure are entangled. Pushing the test to a higher layer just postpones the design problem — it never solves it. The business logic stays coupled to infrastructure, and it'll be harder to change, harder to reuse, harder to reason about for as long as that coupling persists. Code with explicit dependencies, clear interfaces, and isolated domain logic becomes easy to test as a natural side effect — and that ease is the signal the design is correct, not merely that the tests happened to be convenient.

**When to choose:** If writing a unit test requires standing up a database connection, starting an HTTP server, reading a configuration file, or constructing a large chunk of the application graph just to get going, reconsider the design before reconsidering the test layer.

**Example:** Hexagonal architecture from [Ch 11](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md) provides the structural answer here: domain logic lives in a core with zero knowledge of infrastructure; adapters live at the perimeter and implement whatever ports the domain defines. The domain gets unit-tested without infrastructure. The adapters get integration-tested against real infrastructure. The architecture decides the testing layers on its own — engineers don't have to reinvent that decision case by case.

---

### Organize Tests Alongside the Code They Verify

**What it is:** The organizational decision about whether test files live next to the production code they test (co-location) or in a separate parallel directory hierarchy that mirrors the production structure.

**Why it exists:** Tests are supposed to evolve alongside the code they verify. Whether they actually do comes down to physical proximity. Co-location makes tests discoverable, and makes it obvious the moment a code change might demand a test change too. A parallel tree instead forces engineers to maintain a mirrored structure that drifts every time the production structure changes and nobody remembers to update the other side.

**Options:**

1. **Co-location** — test files live in the same directory as the implementation, named by convention (`user.go` and `user_test.go`, `orders.py` and `test_orders.py`, `Cart.tsx` and `Cart.test.tsx`).
2. **Parallel test tree** — all test files live in a separate top-level directory tree that mirrors production (`src/orders/` matched by `tests/orders/`).

**Trade-offs:**

[Strong Recommendation] **Co-location as the default.** Tests living right next to their implementation are much harder to orphan. Move, rename, or delete a feature module and the co-located tests move with it — or their absence becomes immediately visible in the very same directory. Co-location also reinforces package-by-feature organization ([Ch 27](../part04-code-organization/ch27-file-and-module-structure.md)): the test for an order module is part of the order module, not some separate artifact that happens to reference it from a distance.

**Parallel test trees** make sense when the language ecosystem or framework has made them the strongly conventional choice already (pytest's default discovery model, for one). When that's true, consistency with the ecosystem matters more than an abstract preference for co-location — follow the convention everyone else follows, not the principle in isolation.

**Common failure modes:**

*The Ghost Module Regression.* A team on a parallel test tree refactors production code, moving and renaming a module. The corresponding test directory sits in a completely separate branch of the file tree and goes unnoticed during the refactor. The orphaned tests keep compiling against stale import paths for weeks before anyone bothers investigating why they reference a module that doesn't exist anymore.

**Example:** Go's toolchain endorses co-location structurally: `_test.go` files get discovered in the same directory as the code they test, automatically. Go adds a further refinement on top — a test file can declare `package shipping` to reach unexported identifiers, or `package shipping_test` to test only the public API as a black-box consumer — all without ever leaving the directory. The test type controls access level. Location stays fixed. Pytest's parallel tree model works perfectly well when applied consistently; the actual failure mode is inconsistency, never the approach itself.

---

### Why Smart Engineers Disagree: Public Surface vs. Internal Testing

The persistent debate about unit testing was never whether different code belongs at different layers — almost everyone already agrees on that part. The disagreement is over whether unit tests should interact only with a component's public API, or reach into its internal, unexported logic directly.

Engineers pushing strict public-surface testing argue unit tests have to treat a module as a black box, full stop. Refactor an internal algorithm — split a private method, rename an internal class, restructure the execution path — while preserving external behavior, and no test should break. A test referencing private implementation details couples the suite to the code's current shape instead of its behavior. Refactoring turns dangerous: perfectly valid structural improvements with zero change to observable behavior still snap tests left and right.

Engineers favoring internal testing counter that critical algorithmic logic often lives in private helpers, and testing only the public surface means testing through significant indirection. A complex parsing routine buried three levels deep behind a public method is easier to verify directly, with targeted inputs, than through the entire public interface. The setup complexity required just to exercise it through the public API can become its own maintenance burden.

The practical resolution is architectural. If the internal logic is genuinely complex and meaningful on its own, it belongs in its own module with its own public API — and the testing question resolves itself without further debate. If it doesn't warrant a module of its own, it's probably not complex enough to need direct testing beyond what the public surface already exercises. Code that's hard to test through its public API is usually either too coupled internally or too coarsely defined externally. Both are design signals. Neither is a testing problem.
