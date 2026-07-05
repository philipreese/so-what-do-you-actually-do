# Ch 38 — Property-Based Testing

*PBT strips out the confirmation bias behind example-based tests.*

Property-based testing states a universal claim that must hold for all valid inputs and lets the framework hunt for counterexamples on its own, supplementing example-based testing rather than replacing it. The inputs a human picks for example-based tests reflect what the engineer already expects to work, and PBT strips out that confirmation bias by generating inputs no one would have thought to write by hand. Shrinking, the framework's automatic reduction of a failing input to the smallest case that still fails, is what makes PBT practical, since a failure on fifty thousand characters is undebuggable and a failure on two isn't. PBT pays off strongly when correctness can be stated as a universal structural property, and poorly on business logic riddled with human-defined exceptions, where stating the invariant is harder than writing the examples would have been.

**Prerequisites:** [The Testing Pyramid](ch34-the-testing-pyramid.md), [What Belongs at Each Layer](ch35-what-belongs-at-each-layer.md), [Fixture-Based Testing](ch37-fixture-based-testing.md), [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md)

**New vocabulary introduced:** property-based testing, behavioral invariant, shrinking, round-trip invariance

**Key takeaways:**
- Property-based testing states a universal claim that has to hold for all valid inputs and lets the framework go hunt for counterexamples on its own. It supplements example-based testing. It doesn't replace it.
- The inputs a human picks for example-based tests reflect what the engineer already expects to work. PBT strips out that confirmation bias by generating inputs the engineer would never have thought to write by hand.
- Shrinking — the framework automatically reducing a failing input down to the smallest case that still fails — is what makes PBT practical at all. A failure on a 50,000-character document is undebuggable. A failure on two characters isn't.
- PBT pays off strongly when correctness can be stated as a universal structural property: round-trip invariants (`encode/decode`), algebraic laws (commutativity, idempotency), data structure invariants (sorted output contains every input element). It pays off poorly on business logic riddled with human-defined exceptions, on UI behavior, or on any domain where stating the invariant is harder than just writing the examples would've been.
- Partial properties still catch bugs example-based tests miss entirely. A property doesn't need to be mathematically complete to earn its place in the suite.

## For My Wife

**Most of the time, testing code means thinking up a handful of situations you expect to cause trouble and checking that the code handles them.** The obvious blind spot is that you can only test for the trouble you already thought of — the weird accented name, the empty list, the negative number nobody typed on purpose tend to slip right through, precisely because nobody imagined trying them.

This chapter describes a different approach: instead of picking specific examples, you write down a rule that has to be true no matter what — "translating a sentence to French and back always gives you the same sentence you started with" — and hand a machine the job of trying to break that rule, throwing thousands of inputs at it nobody would have thought to type by hand.

**The genuinely clever part is what happens once it finds a failure.** A stress test that reports "your code broke somewhere in this 40,000-character document" is nearly useless — nobody can comb through 40,000 characters hunting for the one problem. So the tool doesn't hand back the whole mess. It keeps simplifying the failing case, throwing away everything that isn't necessary to still trigger the bug, until it's found the smallest input that breaks the rule — sometimes down to a single character. That's the difference between "something in here is wrong" and "this exact character is wrong," and it's the entire reason this approach is usable at all, instead of just clever in theory.

## For My Kids

### The Paper Airplane Rule

Say you invent a way to fold any piece of paper into an airplane, and you want to prove that unfolding it afterward always gives you back a flat, undamaged sheet — no rips, no matter what paper you used.

**The normal way to test this is grabbing a few sheets lying around and trying it on those.** That tells you it works on those specific sheets. It says nothing about the giant poster paper in the art closet, the flimsy tissue paper from a gift bag, or the thick cardstock from an old project — the ones you never thought to grab, because you weren't thinking about them.

**A better way: state the rule out loud — "any paper, folded this way, unfolds back to flat and undamaged" — then actually go try it on a huge pile of paper you'd never normally bother testing:** thin, thick, tiny, huge, oddly shaped. Somewhere in that pile, the tissue paper rips on fold four. That's a real discovery your usual few sheets would never have shown you.

**Here's the part that makes it actually useful.** Once you find the tissue paper fails, you don't stop there — you keep testing smaller and smaller scraps of that exact paper until you find the tiniest piece that still rips on fold four. "It broke somewhere in this huge stack" is useless. "A two-inch scrap rips exactly on the fourth fold" tells you precisely where the real problem is.

> [!CAR]
> If you had to test a rule like "this always works" on something you built, what's the strangest version of it you'd want to try, and what do you think would break first?

---

Example-based tests verify specific scenarios: `sort([3,1,2])` returns `[1,2,3]`; `encode("abc")` produces `"YWJj"`. Each test covers exactly one input. An engineer writing examples is implicitly selecting inputs they already expect to work — edge cases they've thought of, representative values from the domain they know well. The inputs they haven't thought of are precisely the ones the code is most likely to fail on.

Property-based testing turns this around entirely. Instead of specifying particular inputs and expected outputs, it specifies a *behavioral invariant* — a statement that has to hold for all valid inputs — and hands input selection off to the framework. The framework generates hundreds or thousands of inputs on its own, hunting for anything that violates the invariant. When it finds one, it doesn't dump a massive random payload on you. It reduces the failure down to the smallest input that still breaks the property.

This technique was formalized by John Hughes and Koen Claessen in QuickCheck (Haskell, 1999), which established the core model everyone still uses: random input generation paired with automatic shrinking. Its most influential production demonstration came out of Ericsson, where QuickCheck found defects in Erlang protocol implementations that years of manual example-based testing had somehow missed. The framework generated sequences of network events — packet reordering, disconnections, buffer overruns — no human would ever have assembled by hand, and turned up race conditions and lockups that only surfaced under unusual-but-entirely-real combinations of conditions.

---

### Apply PBT to Code Where Invariants Can Be Stated

**What it is:** The decision to test a component by specifying properties that must hold for all valid inputs, rather than or in addition to specifying expected outputs for particular inputs.

**Why it exists:** Engineers carry confirmation bias into every set of test inputs they choose. They pick values that match their own mental model of how the code works — the ones they already expect to produce correct results. That works fine for documenting known scenarios. It fails completely at discovering what happens on inputs the engineer never considered in the first place: null bytes buried in strings, empty collections, Unicode sequences that trip up string length calculations, floating-point boundary values. PBT hands input generation to the framework instead, which has no model of what the code "should" do and couldn't care less about anyone's expectations.

**Options:**

1. **Example-based tests only** — enumerate specific inputs and verify specific expected outputs.
2. **Properties only** — define invariants over generated inputs; forgo documented examples.
3. **Both** — use example-based tests to document important scenarios and communicate expected behavior; use properties to explore the input space those examples leave uncovered.

**Trade-offs:**

[Strong Recommendation] **Both together.** Example-based tests serve a documentation function properties simply don't: they record the specific cases engineers actually care about, communicate intent to future readers, and anchor verification in concrete expected behavior. Properties serve a coverage function examples can't: they probe regions of the input space no engineer would ever have thought to explore on their own.

Three categories of code where properties deliver high returns:

- **Round-trip invariants** — any transformation with an inverse: `decode(encode(x)) == x`, `deserialize(serialize(x)) == x`, `decompress(compress(x)) == x`. Every serializer, codec, encryption wrapper, and protocol adapter has this exact structure. A single round-trip property exercises more of the implementation than dozens of hand-assembled example payloads ever could.
- **Algebraic laws** — structural mathematical properties: commutativity (`f(a, b) == f(b, a)`), associativity, idempotency (`f(f(x)) == f(x)`). Sorting functions, caching layers, normalization routines, and set operations typically satisfy algebraic laws that translate directly into properties.
- **Data structure invariants** — constraints that should hold no matter the input: a sort output contains exactly the same elements as its input; a balanced tree stays balanced after any sequence of insertions; a heap satisfies heap ordering after any modification.

**Property-based testing pays off poorly** when no meaningful invariant can be stated independently of specific examples:

- Business logic riddled with arbitrary human-defined exceptions: payroll tax calculations with jurisdiction-specific exemptions, promotional discount rules, regulatory compliance edge cases.
- UI behavior, where correctness hinges on visual layout and human interpretation, not a formula.
- Complex stateful workflows, where what counts as "correct" depends as much on the specific sequence of prior events as on the current inputs.

The practical test for whether PBT belongs somewhere: can you state what correctness means without referencing one specific input? If yes, a property can express it cleanly. If the only way to describe correctness is enumerating cases one by one, example-based tests are the right tool for the job.

**When to choose:** Default to both — examples for documentation, properties for input space coverage. Apply properties specifically to parsers, serializers, compressors, encoders, mathematical utilities, and data structure implementations — the algorithmic corners where the input space is too large to enumerate and correctness is structurally well-defined.

**Common failure modes:**

*The Vacuous Assert Mirage.* An engineer applies PBT to a markdown parser but writes the invariant as `assert result is not None`. The framework generates ten thousand random documents. All of them pass — the parser never throws an unhandled exception, which is the entire thing the property was measuring. The test hands back false confidence: it never verifies that the parsed structure matches the semantic content of any input at all. The invariant was too weak to catch any parsing error whatsoever. The tests are green. The parser might be completely broken underneath.

*The Tautological Spec.* An engineer writes a property for a discount calculation engine. Unable to state the invariant without duplicating the business logic itself, they copy the conditional branching structure straight out of the production code and into the assertion block. The framework generates hundreds of inputs and passes on every single one. When a bug later slips into the production logic, the copied assertion reproduces the identical bug right alongside it — the test confirms the wrong answer is internally consistent. The property is circular. It verifies nothing at all.

**Example:** A sorting function satisfies four structural invariants regardless of input: the output is ordered (each element is ≤ the next), the output length equals the input length, the output contains exactly the same elements as the input as a multiset, and sorting an already-sorted input changes nothing. These four properties together verify more behavior than a hundred handwritten arrays ever would, catching entire categories of bug — dropped elements, corrupted duplicates, off-by-one boundary errors — that example tests routinely miss. Hypothesis (Python) and fast-check (JavaScript/TypeScript) implement the same model for modern stacks; both ship generators for standard types and shrink failures automatically.

---

### Use Frameworks That Shrink Counterexamples

**What it is:** The framework capability that converts a randomly discovered failing input into the smallest input that still fails — making randomly generated defects practically diagnosable.

**Why it exists:** A framework that finds a failure has found a failing input — not necessarily a useful one. Generate a 50,000-element list and discover the sort function produces bad output, and the developer receives a massive payload of noise with zero indication of which element or combination actually triggered it. Shrinking fixes this by repeatedly trying to remove or simplify pieces of the failing input, keeping any simplification that still reproduces the failure. What's left is the smallest case that demonstrates the defect, and nothing more.

**Options:**

1. **Frameworks with shrinking** — after finding a failure, the framework reduces it to a minimal counterexample before reporting.
2. **Frameworks without shrinking** — the raw generated failure is reported without reduction.

**Trade-offs:**

[Strong Recommendation] **Always use frameworks with shrinking.** Shrinking isn't a nice-to-have — it's the mechanism that makes PBT practical at the unit test layer at all. Without it, failures in large input domains produce debugging payloads that need manual minimization before the actual defect even becomes visible, often eating more time than fixing the bug would have. With shrinking, the minimal counterexample usually reveals the defect on the spot.

Hypothesis extends shrinking with a persistent failure database: once a counterexample is found and minimized, Hypothesis saves the minimal failing input to a local, version-controlled cache. On subsequent runs, it replays previously discovered failures first, before generating anything new. A failure found in CI doesn't vanish when the process exits — it survives as a permanent regression case, checked on every run from then on.

**When to choose:** Prefer established PBT frameworks over rolling your own random generator, specifically because their shrinking implementations have been refined over years of real use. QuickCheck pioneered the model. Hypothesis, fast-check, and GoCheck each implement variants suited to their own ecosystems.

**Common failure modes:**

The most common consequence of a framework with weak shrinking is premature abandonment. An engineer hits a failure on a 5,000-character random input, can't isolate which part of the payload caused it within a reasonable debugging budget, marks the test flaky, and disables it. The test was never flaky. It had found a real defect. The missing shrinking step just made that failure unactionable inside normal working constraints.

**Example:** A parser hits a failure on a randomly generated document of 8,000 tokens. The shrinking algorithm repeatedly strips tokens and retries, halving the input again and again until the property still fails on nothing but `"("`. The minimal counterexample points straight at an unclosed-parenthesis handling bug. The original 8,000-token failure pointed at nothing useful at all. The two-character minimal case points at the exact issue. Hypothesis documents this reduction right in its output, showing the discovered failure and the minimal reproducer side by side.

---

### Why Smart Engineers Disagree: Completeness vs. Pragmatic Coverage

The disagreement in property-based testing comes down to whether partial properties actually have value.

The formal specification view holds that a weak invariant is worse than no invariant at all. A property that only verifies a sorted output has the same length as its input — never that it contains the same elements — lets a function replacing every element with zero pass without complaint. An incomplete invariant, by this view, hands you false confidence and nothing else. It demands comprehensive properties or none.

The pragmatic view holds that partial properties catch bugs no example-based test would ever find, whether or not they catch every bug there is. An invariant asserting a parser never crashes on arbitrary Unicode input is a genuinely useful bug-finding tool even if it says nothing about the semantic correctness of the output. Several overlapping partial properties — round-trip correctness, crash-freedom, length preservation — together deliver coverage that's both broad and cheap to write.

Both observations hold up. A vacuous property that always passes is useless. A partial property catching a category of defect example tests miss is genuinely valuable. The practical resolution isn't demanding formal completeness — it's demanding every property be strong enough to fail on at least some real class of defect, and combining multiple partial properties when no single one covers enough ground alone.

The productive question was never "can I write a complete specification?" It's "can I state something that has to be true for all valid inputs and would actually fail if the code were wrong?" When the answer's yes, that property belongs in the suite right alongside the examples. When the answer's no — when writing the property means duplicating the production logic, or no structural invariant exists at all — example-based tests are simply the better investment.
