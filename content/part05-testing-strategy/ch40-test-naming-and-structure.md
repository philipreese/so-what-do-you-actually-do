# Ch 40 — Test Naming and Structure

*A test's name should survive refactoring; a method's name doesn't.*

A test name should describe the behavior under test and the condition that triggers it, never the method being invoked, because behavior-oriented names survive refactoring while method-oriented names go stale the instant the method is renamed. Arrange/Act/Assert is the default internal structure for a test body, and the specific vocabulary matters far less than the consistency of keeping each part visually distinct. Each test should verify one coherent behavior; a test stitching together several unrelated behaviors hides every failure after the first and forces the reader to untangle multiple concerns to diagnose one regression. Table-driven tests are the deliberate exception, gathering many examples of the same behavior in one structured table instead of scattering them across one function per case — and a test's name and structure should be optimized for the worst moment it will ever be read: a failing CI log, with no source file open.

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [What Belongs at Each Layer](ch35-what-belongs-at-each-layer.md), [Fixture-Based Testing](ch37-fixture-based-testing.md), [When Not to Test](ch39-when-not-to-test.md), [Naming Conventions and When They Matter](../part04-code-organization/ch28-naming-conventions-and-when-they-matter.md)

**New vocabulary introduced:** behavioral specification naming, Arrange/Act/Assert, table-driven test

**Key takeaways:**
- A test name should describe the behavior under test and the condition that triggers it — "returns X when Y" — never the method being invoked. Behavior-oriented names survive refactoring. Method-oriented names go stale the instant the method gets renamed, and say nothing useful the moment a failure shows up in a CI log.
- Arrange/Act/Assert (or its behavior-driven equivalent, Given/When/Then) is the default internal structure for a test body: build the preconditions, run the operation, check the outcome, each one visually distinct from the others. The vocabulary matters far less than the consistency.
- Each test should verify one coherent behavior. A test stitching together several unrelated behaviors hides every failure after the first one and forces the reader to untangle multiple concerns just to diagnose a single regression.
- Table-driven tests are the deliberate, named exception to one-behavior-per-test: many input/output examples of the *same* behavior belong in one structured table with one execution path, not scattered across one function per case.
- A test's name and structure should be optimized for the moment it gets read under the worst possible conditions: a failing CI log, no source file open anywhere. If the failure alone doesn't explain what broke, the test hasn't finished its job yet.

## For My Wife

Picture two different fire alarm panels. One reads "Smoke detected: Kitchen." The other reads "Zone 14." Both are technically reporting the same event, but only one of them is actually useful in the moment you're reading it — startled, at 2am, with no time to go dig up the blueprint that explains what "Zone 14" even refers to.

This chapter argues that a piece of testing code should be named exactly like the first panel, never the second. A test ought to describe what was supposed to happen and the situation that was supposed to cause it — "rejects an expired login" rather than "test three," or a name that just repeats which internal function got poked. The reasoning is about timing: nobody reads a test's name in a calm, unhurried moment. They read it while a build is failing, a deploy is blocked, and there's no source code open anywhere — just a name sitting in a log. "Zone 14" sends someone hunting through the whole building. A name that states exactly what broke, and under what circumstance, turns a failure straight into an answer, with no detective work required.

The chapter's structural advice follows the same logic: lay out each test in the same three-part order every time — set the scene, do the thing, check what happened — so a reader can tell at a glance which part of the story they're looking at, the same way every incident report follows the same format so nobody has to hunt for the part that matters.

## For My Kids

### Task 7 or Trash Day

Say your family keeps a chore chart, and there are two ways to write down what needs checking. One way: "Task 7." The other way: "Trash bins are out by 7am Tuesday." Both are marking the same actual job. Only one of them tells you anything when it's not checked off.

**"Task 7" is fine right up until it's the one thing that didn't get done.** Now somebody has to dig up the original master list just to remember what Task 7 even was, while the actual trash truck is already coming down the street. "Trash bins are out by 7am Tuesday," left unchecked, tells you immediately and completely what went wrong, when it needed to happen, and what to do about it right now — no extra list required.

**Here's why this matters more than it seems: nobody reads a chore chart in a calm moment.** They read it exactly when something's already gone wrong — the bins are still in the garage and the truck's already at the end of the block. That's the worst possible time to also need to go track down what "Task 7" was supposed to mean.

**The rule is simple: name the thing by what's supposed to happen, not by a number that only makes sense if you already remember the list.** A chart that explains itself the moment something's wrong beats one that requires a second trip just to figure out what broke.

> [!CAR]
> Have you ever forgotten what a note or reminder you wrote earlier was even supposed to mean? What would you write differently next time so future-you doesn't get stuck?

---

A test gets written once and read many times, and most of those readings happen under real pressure — a CI failure blocking a deploy, a production regression mid-investigation, an unfamiliar behavior surfacing halfway through development. In that moment, the test's name and structure get read before its body does, often instead of its body entirely. A test communicating its purpose through its name and its intent through its structure is documentation that outlives whoever wrote it. A test forcing the reader to reconstruct intent from implementation before diagnosis can even start has failed at the one job a test uniquely exists to do: turning a failure into an answer.

---

### Name Tests After Behavior, Not Implementation

**What it is:** The convention of naming a test after the observable behavior it verifies and the condition under which that behavior applies — `returns_null_when_user_id_does_not_exist`, `rejects_expired_session_token` — rather than after the method or class it exercises — `testGetUser`, `testSession`.

**Why it exists:** Implementation changes far more often than behavior does. Methods get renamed, split, reorganized; internal algorithms get replaced outright; the externally observable contract usually rides through all of it unchanged. A test name bound to a method name goes stale the instant that method gets renamed, even when nothing about correctness moved an inch — and worse, when a test named after a method fails in a CI log, the failure says nothing beyond "something's wrong with this method." A name built from behavior and condition answers the two questions a reader actually has the moment a test fails: what was supposed to happen, and under what circumstances did it not.

**Options:**

1. **Behavior-based names** — describe the expected outcome and its triggering condition (`registers_new_user_when_payload_is_valid`, `calculates_sales_tax_for_out_of_state_orders`).
2. **Method-based names** — bind the test identifier to the production method under test (`testGetUser`, `test_RegisterUser_Valid`).
3. **Generic or numbered names** — arbitrary or sequential identifiers (`testOne`, `shouldWork`).

**Trade-offs:**

[Strong Recommendation] **Behavior-based names as the default**, for essentially all core domain logic, API endpoints, and service-layer code. They communicate intent immediately, survive refactoring that leaves behavior unchanged, and turn the failure message itself into a diagnosis — no source inspection required at all. The cost is real but small: behavior-based names run longer and force the author to state precisely what the test is checking, which is itself a genuinely useful forcing function. If a test can't be named in terms of a behavior and a condition, that's often a sign the test's own purpose was never well defined in the first place.

**Method-based names** stay defensible in one narrow case: highly stable, low-level algorithmic primitives or pure mathematical utilities where the method name *is* an unvarying mathematical expression (`BitMap.set()`), with no meaningful behavior/condition distinction to state separately from the operation itself.

**Generic names** have no defensible use anywhere. They communicate nothing on failure and provide zero documentation value at any point across the test's life.

**When to choose:** Default to behavior-based naming everywhere correctness confidence actually matters. Reserve method-based naming for the narrow class of primitives where the method name already fully describes the behavior on its own.

**Common failure modes:**

*The Mystery Failure Block.* A production regression triggers a failure in a test named `testUpdateInvoice3`. The engineer investigating the CI log sees nothing but a stack trace and a name carrying zero behavioral content. Understanding what actually broke means reopening the test file, reconstructing the input payload and database state the original author had in mind, and inferring what invariant the assertions were meant to protect — turning routine regression triage into an archaeology dig.

**Example:** RSpec and Jest formalize behavior-based naming structurally, through nested `describe`/`context`/`it` blocks rather than one long identifier:

```javascript
describe("OrderProcessor", () => {
  context("when the item inventory is exhausted", () => {
    it("moves the line item to the backorder queue", () => {
      // test body
    });
  });
});
```

When this fails, the runner concatenates the nested descriptions into one readable sentence — `OrderProcessor when the item inventory is exhausted moves the line item to the backorder queue` — delivering the exact same diagnostic clarity as a long behavior-based function name, just expressed through structural nesting instead.

---

### Structure Tests with Arrange, Act, Assert

**What it is:** The convention of organizing every test body into three visually distinct sections: constructing the required preconditions (Arrange), executing the operation under test (Act), and verifying the observable outcome (Assert).

**Why it exists:** A reader diagnosing a test asks the same three questions no matter what the test is about: what was the starting state, what happened, and what result was expected. AAA structure lines the code up in that exact order, so a reader scans top to bottom and instantly knows which part is setup, which is the action under scrutiny, which is the check that failed. Without an enforced structure, setup, execution, and verification blur together in whatever order they happened to get written, and the reader has to reconstruct which lines even matter to the behavior actually being tested.

**Options:**

1. **Arrange/Act/Assert (AAA)** — a flat, three-part structure, typically separated by blank lines or comments, with no framework dependency.
2. **Given/When/Then (BDD)** — the same three-part structure expressed through nested framework constructs (`describe`/`context`/`it`, `beforeEach` blocks, Cucumber feature syntax).
3. **Unstructured** — setup, execution, and assertions interleaved in whatever order the test was originally written.

**Trade-offs:**

[Strong Recommendation] **AAA as the default structural baseline**, particularly for backend systems, strongly-typed ecosystems, and any code where a flat top-to-bottom read is the natural way in. It requires no framework support, imposes no runtime cost, and reads identically no matter the language. Its weakness is that it leans entirely on team discipline — nothing enforces the separation beyond convention, and it erodes into interleaved code the moment nobody's paying attention.

**Given/When/Then** structurally enforces the same separation through the test framework's own syntax, and it earns its keep specifically where behavior is multi-layered and cross-functional — front-end applications, customer journey flows, business rule engines with many interacting conditions — because the nesting can mirror the application's actual branching logic (authenticated vs. not, overdrawn vs. not, weekend vs. weekday). The cost is real: deep nesting can obscure state (a reader has to trace across multiple `beforeEach` blocks just to know what exists at the assertion), and heavy closure allocation carries a runtime cost in some frameworks.

**Unstructured tests** have no advantage beyond skipping trivial ceremony in genuinely tiny tests, and they degrade fast as a codebase grows — setup, mutation, and assertion interleave freely, and a reader can't tell preparation from verification without reading closely, every single time.

**When to choose:** Default to flat AAA for backend systems, strongly-typed languages, and algorithmic or adapter code where behavioral variance runs low relative to component stability. Choose Given/When/Then specifically when testing multi-layered, branching behavior — front-end flows, business rule engines, cross-functional customer journeys — where nested context blocks can map straight onto the application's actual decision tree. The vocabulary matters far less than applying it consistently across the whole codebase.

**Common failure modes:**

*The Interleaved Assert Rollercoaster.* An integration test performs an action, asserts a row count, performs a second mutation, asserts an update, calls a third service, and checks a final flag — all interleaved rather than separated out. When the third assertion fails, the test stops on the spot, hiding whether the fourth mutation was even reached and concealing the true state of the system from whoever's investigating the failure. The interleaving destroyed any ability to reason about what had and hadn't actually been verified.

**Example:**

```go
func TestInvoiceCalculation_withPremiumDiscount(t *testing.T) {
    // Arrange
    calculator := NewInvoiceCalculator()
    premiumUser := DomainUser{ID: 42, Tier: TierPremium}
    basePayload := OrderPayload{Total: 100.00}

    // Act
    result, err := calculator.Compute(premiumUser, basePayload)

    // Assert
    if err != nil {
        t.Fatalf("unexpected calculation failure: %v", err)
    }
    if result.FinalTotal != 80.00 {
        t.Errorf("expected 20%% premium discount total of 80.00, got %f", result.FinalTotal)
    }
}
```

The three sections stay visually distinct through comments and blank lines alone — no framework machinery required to make any of it legible.

---

### Test One Behavior at a Time

**What it is:** The principle that each test function should verify a single coherent behavior — accepting multiple assertions when they collectively describe that one behavior, but never combining assertions about genuinely unrelated behaviors in a single test.

**Why it exists:** A failing test should point at exactly one regression, not a mystery grab bag. When a single test asserts several unrelated behaviors — validation, then persistence, then logging, then notification — the first failing assertion halts execution and hides whatever the remaining assertions would've revealed. A reader investigating the failure can't tell from the report alone whether the other behaviors are broken too; they have to rerun, comment out assertions, or step through a debugger just to find out. Splitting unrelated behaviors into separate tests means each failure report is already a complete, unambiguous diagnosis on its own.

**Options:**

1. **One behavior per test** — a test function verifies a single coherent behavior, possibly with multiple assertions that all describe that behavior.
2. **Many unrelated behaviors per test** — a single test function asserts on several independent aspects of a broader operation.
3. **Table-driven or parameterized execution** — a single test function iterates over many input/output examples of the *same* behavior.

**Trade-offs:**

[Strong Recommendation] **One behavior per test.** The cost is more test functions and some duplicated setup between them; the benefit is that every failure is immediately diagnostic, tests can get reordered or run independently with no hidden dependencies, and each test documents exactly one thing a reader can rely on. Large multi-purpose tests cut down duplicated setup but produce poor diagnostics and tangle multiple responsibilities into one single pass/fail signal — a worse trade almost every time.

**When to choose:** A useful test: if removing one assertion would leave the test verifying a completely different behavior, that assertion belongs in its own separate test. If removing an assertion leaves the remaining ones still coherently describing the same single behavior, they belong together.

**Common failure modes:**

A single test asserts that a request passes validation, gets persisted, gets logged, triggers authorization checks, and sends a notification. A failure in the first assertion — validation — stops the remaining four from ever executing. Diagnosing the actual regression means manually re-running the scenario while stripping out the earlier assertions just to see how far execution actually gets — exactly the work the test suite was supposed to spare anyone from doing.

**Example:** A login test can reasonably assert both that authentication succeeds and that a session token gets produced — these are two facets of one behavior, "a valid login establishes a session." The same test shouldn't additionally verify password reset functionality on top of that; that's an unrelated behavior deserving a test of its own.

---

### Use Table-Driven Tests for Repeated Behavior Across Inputs

**What it is:** The pattern of expressing many input/output examples of the *same* behavior as entries in a data table, iterated by a single test function, rather than as separate hand-written test functions per example.

**Why it exists:** When dozens of examples verify identical behavior and differ only in their input data, writing one function per example produces overwhelming duplication — the vast majority of each function is repeated setup and invocation logic, with only the input and expected output actually changing between them. A table-driven test isolates the invariant execution mechanics from the varying data, so adding a new case means adding one row to a table instead of copying an entire function wholesale.

**Options:**

1. **Separate test function per example** — each input/output case gets its own independent, isolated test.
2. **Table-driven test** — a single function iterates over a structured collection of cases, each with its own input, expected output, and descriptive name, executing each as an isolated sub-test.

**Trade-offs:**

[Strong Recommendation] **Table-driven tests specifically when every case exercises the same behavior under different inputs** — this is the idiomatic Go pattern, and it holds up equally well in any language for validators, parsers, and pure mapping functions. It's compact, trivially extended (one new struct entry rather than one new function), and encourages systematically enumerating edge cases, because adding one costs almost nothing. It's deliberately a *named exception* to one-behavior-per-test, not a violation of it: each table entry is still one behavior, just expressed many times over.

**Separate functions per example** remain the right call when different cases genuinely need substantially different setup or assertions, not merely different data — forcing dissimilar cases into one table obscures more than it clarifies.

**When to choose:** Use a table when the only thing varying across cases is the data — same execution path, same assertion shape, every time. Avoid tables when cases genuinely differ in what they set up or what they check; forcing that variation into table rows produces a table that no longer represents one coherent behavior at all.

**Common failure modes:**

*The Anonymous Loop Crash.* An engineer writes a custom loop over test cases without registering each one as an isolated sub-test (Go's `t.Run`, or the equivalent per-case registration in other frameworks). When one case panics — an out-of-bounds index, an unhandled nil — the entire test function aborts on the spot, and the CI report shows only that the function failed, with no indication of which remaining untested cases would've passed or failed. The table's whole purpose — systematic, independent coverage across many cases — gets defeated by the one missing piece of isolation.

**Example:** Go's standard library convention pairs a table of structs with `t.Run` specifically to preserve independent execution and reporting per case:

```go
func TestUrlValidation(t *testing.T) {
    tests := []struct {
        name        string
        inputURL    string
        expectValid bool
    }{
        {"valid secure path", "https://google.com", true},
        {"missing scheme", "google.com", false},
        {"malformed protocol", "ftp://invalid-server", false},
    }

    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            isValid := CustomUrlValidator(tc.inputURL)
            if isValid != tc.expectValid {
                t.Errorf("failed parameter: %s; expected validity %t, got %t", tc.inputURL, tc.expectValid, isValid)
            }
        })
    }
}
```

Each case runs and reports independently through `t.Run`, so a panic or failure in one never masks the outcome of the others — the table's entire value hangs on that isolation actually being there.

---

### Why Smart Engineers Disagree: Flat Files vs. Nested Context Trees

Most experienced engineers agree on the underlying principles this chapter argues for: name tests after behavior, structure them clearly, keep each one focused. The genuine disagreement is about *how* to express that structure at scale — specifically, whether test organization is better served by flat, self-contained functions or by deeply nested context hierarchies.

Engineers who favor flat structure — a cultural default in Go, Rust, and other systems-level communities — argue that nested `describe`/`context`/`it` trees force a reader to reconstruct an implicit execution context by scanning across multiple levels of `beforeEach` and setup blocks before they even know what state exists at a given assertion. They accept some duplicated setup across flat functions as the price of a test file that reads sequentially, top to bottom, as a self-contained document with nothing left implicit.

Engineers who favor nested context trees — a cultural default in the JavaScript, Ruby, and broader BDD-influenced communities — argue that real-world behavior is often genuinely hierarchical: a system behaves one way when authenticated, differently again when an account is overdrawn, differently again on a weekend. Expressing that hierarchy as flat functions means replicating large blocks of near-identical setup across many independent tests, and the moment a shared precondition changes, every one of those duplicated blocks has to be tracked down and updated by hand.

The resolution turns on the actual shape of the behavior being tested, not a universal preference either way. Where behavioral variance is genuinely hierarchical and dense — many interacting conditions, deep branching, cross-functional user journeys — nested context trees map the test structure directly onto the application's real decision tree, and the alternative is unsustainable duplication. Where the underlying risk concentrates in linear data transformations, adapters, or algorithmic calculations, nesting adds abstraction that obscures more than it clarifies, and a flat AAA structure — with table-driven tests absorbing whatever genuine input variation exists — keeps the suite legible. Choose based on the density of behavioral branching relative to the stability of the component under test. Not on which convention happens to feel more familiar.

---

**Position:** Name tests as behavioral specifications, not implementation checks. Structure them consistently with AAA or its BDD equivalent. Keep each test focused on one coherent behavior, using table-driven tests as the explicit, named exception when many examples share that same behavior. The objective was never merely executable tests — it's failures that are understandable the moment they appear, before anyone's read a single line of implementation.
