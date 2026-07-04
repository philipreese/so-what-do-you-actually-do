# Ch 37 — Fixture-Based Testing

*Fixture bloat isn't a maintenance failure; it's structurally inevitable.*

A fixture is the complete set of preconditions a test depends on, and shared mutable fixtures — datasets multiple tests draw from with no isolation — are the primary source of order-dependent test failures. Static fixture files earn their place only for genuinely immutable reference data; factory and scoped fixture functions are the default for entity data because they keep state creation local to whatever test needs it. Fixture bloat, a shared dataset grown until no single engineer understands its full dependency graph, is structurally inevitable in large static fixture systems, and the remedy is not building them for mutable data at all. State reset is a separate decision from state construction: transactional rollback is fast and sufficient for most integration tests, while truncation is required once asynchronous workers or multiple connections commit outside the test thread's own transaction.

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [What Belongs at Each Layer](ch35-what-belongs-at-each-layer.md), [When to Mock vs. Use Real Dependencies](ch36-when-to-mock-vs-use-real-dependencies.md), [Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md)

**New vocabulary introduced:** fixture, state contamination, fixture bloat

**Key takeaways:**
- A fixture is the complete set of preconditions a test depends on: database records, in-memory objects, configuration, environmental state, all of it. Shared mutable fixtures — datasets multiple tests draw from with no isolation between them — are the primary source of order-dependent test failures.
- Static fixture files earn their place only for genuinely immutable reference data. Factory functions and scoped fixture functions are the default for entity data, because they keep state creation local to whatever test actually needs it.
- Fixture bloat — a shared dataset grown through years of incremental additions until no single engineer understands its full dependency graph anymore — is structurally inevitable in large static fixture systems at scale. The remedy isn't building them more carefully. It's not building them for mutable data at all.
- State reset between tests is a separate decision from state construction, and the two get conflated constantly. Transactional rollback is fast and sufficient for most integration tests. Truncation is required when tests involve asynchronous workers or multiple database connections committing outside the test thread's own transaction.
- The data configurations that directly determine whether a test passes or fails belong inline and visible, right where the assertion lives. Infrastructure setup — connections, containers, authentication contexts — is legitimately shared through scoped injection. Conflate the two and both decisions suffer.

## For My Wife

A well-run hotel resets every room completely between guests: fresh sheets, empty minibar, nothing left over from whoever stayed there the night before. That's what a good test is supposed to do too — start from a clean, known room every time, so what happens during the test only ever depends on the test itself, never on whoever "stayed there" before it ran.

This chapter is about what goes wrong when that reset doesn't happen. Some testing setups instead keep one big shared room that every test checks into and nobody fully cleans up afterward — a shared pile of sample data everybody borrows from and occasionally leaves a little worse than they found it. At first that's harmless. Over years, though, dozens of people have stashed things in that room for their own reasons, and nobody remembers anymore whose suitcase is under which bed, or why unplugging one lamp breaks a completely unrelated guest's stay three doors down.

The bugs this produces are uniquely maddening, because they only show up depending on the order tests happen to run in. A test that passes perfectly alone fails only when it runs right after a different, unrelated one — because that other test left something behind in the shared room, and nobody can see the connection from either test by itself. The chapter's answer is to stop sharing the room: give every test its own freshly built, disposable set of data, so nobody inherits a mess they didn't make, and a failing test always points at the test that actually failed — not at whichever stranger happened to check out an hour earlier.

## For My Kids

Say three siblings share one bathroom every school morning, one after another. If each person leaves it exactly as they found it — towel back on the hook, sink wiped, nothing borrowed and not returned — whoever goes next starts from the same clean bathroom every time, no matter who went before them.

**Now say nobody bothers resetting anything.** One morning, sibling two can't find the toothpaste, because sibling one used the last of it and didn't say anything. Another morning, sibling two's routine goes perfectly fine, because sibling one happened to leave everything in order that day. Same kid, same routine — some mornings it works, some mornings it mysteriously doesn't, and the only thing that changed was who went through first.

**That's the maddening part: the problem never shows up when you check it alone.** Sibling two, getting ready by herself on a Saturday with nobody ahead of her, never has an issue. The trouble only appears depending on exactly who went before, leaving exactly what mess — and good luck ever tracing it back to the actual cause.

**The fix isn't "everyone try to be neater."** It's that every morning, every sibling gets the bathroom reset to the exact same starting point — restocked, wiped down, nothing left over from yesterday. Once that's true, whether your morning goes smoothly stops depending on someone else's mess, and starts depending only on you.

---

[Ch 36](ch36-when-to-mock-vs-use-real-dependencies.md) addressed whether dependencies should be real or replaced. This chapter addresses the state those dependencies actually hold: how to set it up, how to keep it from coupling tests to each other behind the scenes, and how to reset it cleanly between runs.

Tests that pass individually but fail in a suite are almost always a fixture problem, not a coincidence. The cause is *state contamination*: one test modified shared state and never restored it, and the next test ran against a world that had been silently altered underneath it. The failure is non-deterministic — it depends entirely on execution order — and invisible in the failing test itself, because the actual defect lives in some other test that ran earlier and left a mess behind.

---

### Decide How to Construct Fixture State

**What it is:** The choice of mechanism for supplying the known state a test depends on — whether that state arrives as static data files loaded before the suite, generated programmatically per test, composed through a fluent builder API, or injected through a framework's lifecycle management system.

**Why it exists:** Tests need coherent object graphs to run against. A test exercising invoice processing needs a customer record, a billing plan, and line items with valid relational associations tying them together. Constructing that graph from scratch inside every test gets verbose fast; sharing it globally creates coupling instead. The fixture construction strategy is simply how teams work through that particular tension.

**Options:**

1. **Static fixtures** — predefined datasets stored in files (YAML, JSON, SQL) loaded once before the suite runs and shared across all tests. The approach popularized by the original Rails fixture system.
2. **Factory functions** — programmatic helpers that instantiate and persist entities with sensible defaults, accepting overrides for the specific attributes the test cares about (`UserFactory.create(role="admin")`). Exemplified by Ruby's factory_bot and Python's factory_boy.
3. **Object builder pattern** — a fluent API for composing complex objects step by step (`NewOrderBuilder().withCustomer(...).withLineItem(price=100).build()`). Used where object construction is hierarchically complex and raw factory calls would obscure the relationship structure.
4. **Scoped fixture functions** — dependency-injected setup functions with explicit lifecycle scope (function, class, module, or session), each scope controlling when the fixture is constructed and torn down. The model pytest employs.

**Trade-offs:**

[Strong Recommendation] **Factory functions or scoped fixture functions as the default for entity data.** Both approaches keep state creation local to whichever test actually needs it. A factory-based test declares exactly which entity attributes it cares about and constructs only that much. A scoped fixture function declares its dependencies by name, with the scope deciding whether the fixture gets rebuilt per-test or shared inside a controlled boundary.

**Static fixtures** earn their place when data is genuinely immutable: a fixed set of ISO country codes, a permission hierarchy the application reads but never writes, a product category tree every test uses identically. Used for mutable entity data instead, they become exactly the source of fixture bloat this chapter warns about.

**Object builders** add real value when hierarchical entity relationships would make factory calls verbose or ambiguous. For simpler entities they just add indirection with nothing to show for it.

**Scoped fixture functions** carry risk when the scope gets misapplied. A session-scoped fixture for a database connection or a container lifecycle makes sense — that infrastructure is genuinely shared and immutable from the tests' point of view. A session-scoped fixture for mutable entity data just recreates the shared-state problem wearing different syntax.

**When to choose:** Use factory functions for entity data whose attributes directly decide the outcome of a test assertion. Use scoped fixture functions for expensive infrastructure initialization — containers, database connections, authentication tokens — legitimately shared across multiple tests. Use static fixtures only for reference data no test ever modifies.

**Common failure modes:**

*The Fixture Bloat Avalanche.* A shared YAML fixture file starts life with three records. Over five years, fifty different engineers add rows covering specific edge cases — a premium user, a suspended account, an international billing address, a deleted organization. The file balloons to two thousand lines of interdependent relational records. No single engineer understands the full dependency graph anymore. A developer renames an attribute in row 12 to fix a production bug, and forty-five tests in completely unrelated modules fail immediately, because they'd implicitly depended on that exact string value through relational associations nobody had ever mapped out. The file can't be safely modified at this point. It can only be appended to, forever.

*The Leaky Session Cache.* An engineer declares a search index fixture at session scope, just to avoid reinitializing it for every test. A test midway through the suite inserts records into the index and fails before its teardown code ever runs. The next test — in a completely different module, with no relation to the first — runs into leftover state its author never knew could even exist. The failure is intermittent: it vanishes when that test runs in isolation and comes right back when the suite runs in a particular order.

**Example:** The Ruby community's migration from static YAML fixtures to factory_bot is the canonical demonstration of fixture bloat at scale. Large Rails applications accumulated fixture files that had become effectively unmaintainable: schema changes meant updating hundreds of fixture rows by hand, and tests coupled to shared state broke unpredictably during perfectly ordinary development. factory_bot fixed it by moving data creation into code, co-locating each test's preconditions with the test itself instead of a distant shared file. Python's pytest fixture system extends the same model further: instead of global data files, fixture functions carry explicit scope declarations that make shared lifetime visible right in the test signature. Django tackles the same coupling with a structural default: the test database resets automatically between every test, making accumulated shared mutable state physically impossible without someone deliberately overriding it.

---

### Reset State Between Tests Explicitly

**What it is:** The decision about how to ensure that state written by one test does not persist into the execution context of the next — the isolation mechanism at the persistence layer.

**Why it exists:** Factory functions control how state gets *created*. They have nothing to say about how it gets *cleared*. An integration test that inserts records into a real database leaves those records sitting there when it finishes. Without an explicit reset strategy, the second test starts with the first test's leftovers still in place. Construction and reset are separate decisions with entirely separate trade-offs, and they deserve to be treated that way.

**Options:**

1. **Transactional rollback** — wrap each test in a database transaction and issue a `ROLLBACK` immediately after the test completes, reversing all writes without touching disk.
2. **Truncation or schema reset** — physically clear all non-reference tables (or drop and recreate the schema) between tests.

**Trade-offs:**

[Strong Recommendation] **Transactional rollback as the default.** Rolling back a transaction that inserted and modified hundreds of rows takes microseconds — no disk I/O, no DDL operations, nothing slow about it. Integration suites built on transactional rollback execute thousands of database-touching assertions without accumulating any meaningful overhead. The mechanism works cleanly for any test whose operations stay inside a single database connection and transaction context.

**Truncation is required** when the test exercises code committing outside the test's own transaction: background workers on separate threads, asynchronous tasks using their own database connections, or code under test that explicitly issues commits of its own. A transactional rollback can't undo a write committed by a different connection — there's no mechanism for it to even see that write happened. Django distinguishes these cases structurally with two test base classes: `TestCase` uses rollback and is fast; `TransactionTestCase` uses truncation, eats the latency cost, and gets reserved for when the scenario genuinely demands it.

**When to choose:** Default to transactional rollback. Switch to truncation only when the scenario under test involves asynchronous workers, multiple database connections, or explicit transaction isolation that requires real commits to happen.

**Common failure modes:**

*The Asynchronous Phantom Leak.* A test triggers an asynchronous task to update a user record. The main test thread finishes its assertions, the transaction rolls back, and the test passes clean. Two seconds later — while the next test is actively mid-run — the background worker finally finishes processing and writes its stale result to the database, corrupting the runtime context of a test that has nothing to do with it. The failure is intermittent, disappears the moment you rerun it in isolation, and is nearly impossible to trace, because the actual cause ran in a different thread during an entirely different test.

**Example:** Django exposes the rollback-versus-truncation choice as a deliberate class hierarchy. `TestCase` wraps each test in a transaction and rolls it back on completion — fast, by default, no configuration required. `TransactionTestCase` issues a full truncation between tests, required whenever the scenario involves Celery tasks, Sidekiq workers, raw SQL commits, or explicit multi-connection transaction isolation. The structural split makes the trade-off visible right there in the code, instead of burying it inside framework configuration where nobody would think to look.

---

### Why Smart Engineers Disagree: Implicit Context vs. Explicit Inline Setup

The persistent disagreement in fixture design runs between brevity and transparency.

Engineers who favor implicit context — scoped fixture injection, shared setup methods, module-level initialization — argue that forcing every test to construct its own state builds walls of boilerplate that bury the actual behavior under test. If twenty tests all need an authenticated admin user with an active subscription, constructing that entity inside every single test body is repetition that actively hurts readability.

Engineers who favor explicit inline setup argue that hiding fixture state behind injected parameters means a failing test can't be understood without navigating off to the configuration file that built the state in the first place. Debugging turns into archaeology. They accept setup code duplication as the price of keeping each test self-contained — the failure should be diagnosable straight from the test body, with no second file to open.

```
# Implicit: data that may govern the assertion is hidden in an injected parameter
def test_billing(premium_org_user):
    assert premium_org_user.can_bill()   # What exactly is premium_org_user?

# Explicit: the data controlling the assertion is visible where the assertion lives
def test_billing():
    org = OrgFactory.create(plan="premium")
    user = UserFactory.create(org=org)
    assert user.can_bill()
```

The practical resolution is separating these concerns by what they actually govern. Infrastructure setup — a database connection, a container, an authentication token — is legitimately shared and belongs behind scoped injection or a shared setup method, since it never changes which branch of logic executes. Entity data — the specific user attributes, the specific order state, the specific pricing configuration — that directly decides whether an assertion passes belongs inline, in the test body, visible to whoever's reading the failure.

Use implicit context for shared infrastructure. Use explicit construction for data that governs outcomes. Whatever failure mode either approach has is really just the failure mode of applying it where the other one belonged instead.
