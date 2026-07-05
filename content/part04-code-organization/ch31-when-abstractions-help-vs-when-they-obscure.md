# Ch 31 — When Abstractions Help vs. When They Obscure

*An abstraction with no second implementation in sight hides nothing.*

Every abstraction charges an indirection tax, forcing a reader to jump between an invocation and its execution and spend working memory on every hop. Abstractions for readability and abstractions for flexibility solve different problems and deserve different criteria — a single-implementation wrapper that gives a clumsy API a domain-meaningful name is justified even if the implementation never changes. An interface with exactly one implementation and no credible second one in sight hides nothing at all; it just doubles the type count for zero benefit. Rob Pike's proverb applies directly here: a little copying is often cheaper, in the long run, than a shared abstraction that couples two call sites with independent reasons to change.

**Prerequisites:** [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md) (specifically: the wrong abstraction and the Rule of Three), [Dependency Direction and Inversion](../part02-software-architecture/ch12-dependency-direction-inversion.md), [Abstraction Layers: When to Add One](../part02-software-architecture/ch14-abstraction-layers-when-to-add-one.md)

**New vocabulary introduced:** speculative generality, indirection tax

**Key takeaways:**
- Every abstraction charges an indirection tax: a reader now has to jump between an invocation and its execution, spending working memory on every single hop.
- Abstractions for readability and abstractions for flexibility solve entirely different problems and deserve entirely different criteria. A single-implementation wrapper that hands a clumsy API a domain-meaningful name is justified even if the underlying implementation never changes across its whole lifetime.
- An interface with exactly one implementation and no credible second one in sight hides nothing at all. It just doubles the type count and breaks IDE navigation, for zero architectural benefit in return.
- The Strategy Pattern applied to a choice that's actually fixed at compile time adds the overhead of runtime polymorphism while throwing away the readability a plain switch statement would've given you for free.
- Rob Pike's Go proverb: "A little copying is better than a little dependency." Duplicating five lines of stable concrete code is often cheaper, in the long run, than extracting a shared abstraction that couples two call sites with independent reasons to change.

## For My Wife

> *An abstraction is a name you give something so you don't have to think about how it works. That's only a gift if you actually needed the extra name.*

Think about a universal remote that claims to control your TV, your speakers, and your thermostat with one set of buttons. If you genuinely own all three and switch between them constantly, that's a real convenience — one remote instead of three. But if you only ever own the TV, and the remote still has speaker and thermostat buttons molded into the plastic, you haven't gained anything. You've just made the remote more confusing to pick up, for a flexibility you were never going to use.

That's the whole argument in this chapter, applied to code instead of remotes. Programmers build "abstractions" — general-purpose tools meant to cover several future situations — and every one of them costs something: whoever reads the code later has to stop, figure out which situation they're actually in, and jump to a different piece of code to see what really happens. That jump is worth making when the variation is real. It's dead weight when it's imaginary — built for a future that never shows up, "just in case."

**The chapter's sharpest example is a fictional company's absurdly over-engineered solution to a children's counting game**, one that invents a dozen extra layers and interchangeable parts for a program that only ever needed to do one simple thing. It's funny precisely because everyone recognizes it: the extra machinery isn't protecting anyone from a change that's coming. It's a remote control with eleven unused buttons, and someone still has to find the power switch every single day.

## For My Kids

### The Six-Kid Chore Wheel

Say it's your turn to do the dishes tonight, then your sibling's turn tomorrow, forever — that's the whole system, always has been. A magnet on the fridge that just says "Dish Duty: You" or "Dish Duty: Sam," flipped each night, does the entire job.

Nobody has to remember the rule; they just glance at the fridge.

**Now say instead you'd built an elaborate spinning chore wheel** — six labeled slots for kids you don't have, three chore categories for chores nobody in your house does, a locking pin so nobody spins it out of turn. It's genuinely impressive.

It's also complete overkill for two people alternating one job, and now everyone has to learn how the wheel works before they can figure out something a flipped magnet would've told them instantly.

**Here's the part that's easy to miss: the flipped magnet still counts as "building something."** You didn't just wing it every night — you made a small, clear, permanent system, and it's exactly the right amount of system for two people and one chore that's never getting more complicated.

The wheel wasn't wrong because systems are bad. It was wrong because it was built for six kids and three chores that were never actually going to show up, while the real job — telling two people whose turn it is — got buried under parts nobody needed.

> [!CAR]
> Have you ever built or set up something way fancier than the job actually needed, like the chore wheel? What would the simple version have looked like?

---

[Ch 04](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md) established that the wrong abstraction is worse than none at all. [Ch 14](../part02-software-architecture/ch14-abstraction-layers-when-to-add-one.md) applied that test at the architectural layer. This chapter runs the same test at the smallest possible grain: a single function, a single class, one localized utility. The failure modes here look nothing like the architectural ones — not a misplaced layer, but an interface built for a variation that will never actually happen, a pattern reached for where a plain conditional would've been clearer to everyone.

---

### Abstract for Readability vs. Abstract for Flexibility

**What it is:** The two legitimate motivations for introducing an abstraction — and the reason they must be evaluated differently.

**Why it exists:** Judging a readability abstraction by whether it supports multiple implementations is asking the wrong question entirely. Judging a flexibility abstraction by whether it clarifies local reading is equally off base. Conflate the two and engineers start rejecting wrappers that genuinely improve clarity, while waving through interfaces that serve no real architectural purpose at all.

**The two categories:**

**Flexibility abstractions** hide an implementation choice behind a stable contract so the implementation can actually be swapped — for testing, for multiple runtime behaviors, for future substitution at a real variation point. These earn their indirection by isolating genuine change. Evaluated by: does realistic variation actually exist here, or is this just speculation dressed up as architecture?

**Readability abstractions** translate a noisy, awkward, implementation-heavy call into the domain's own vocabulary instead. A one-line wrapper giving a cluttered third-party API call a meaningful name belongs squarely here. Evaluated by: does this make the calling code read like a requirements statement instead of a library manual?

[Strong Recommendation] A readability abstraction is justified even with exactly one implementation forever, because its whole payoff is local clarity, not future substitutability — and it should never be held to a swappability bar it never set out to clear in the first place.

**Example (readability):** A third-party SDK exposes `ThirdPartySdk.ExecuteWithTransaction(context, opts, callback)`. Wrapping it in `settleInvoice(invoiceId)` puts domain intent at every call site and shields billing logic from the SDK's own calling convention. The wrapper is correct even if `settleInvoice` delegates to that exact one SDK for the rest of its natural life.

**Example (readability, concrete):** A DynamoDB query through `boto3` requires assembling 15 lines of `ExpressionAttributeValues` and `KeyConditionExpression` dictionaries. Drop that in the middle of `approve_loan()` and reading flow is dead on arrival. Wrapping it in `find_customer_by_id(id)` is the right use of abstraction here — not because the database is ever going to change, but because loan approval logic should read like loan approval logic, not like a database driver's manual.

---

### Introduce an Interface Only for Credible Variation

**What it is:** The specific code-level smell of an interface whose sole implementation has existed unchanged since the interface was created, with no credible second implementation on the horizon.

**Why it exists:** The [Dependency Inversion Principle](../part02-software-architecture/ch12-dependency-direction-inversion.md) earns its place when a real variation point exists — a storage backend, a notification channel, a payment gateway — somewhere the code genuinely benefits from separating what gets done from how it gets done. Misapplied down at the function and class level, it produces interfaces that communicate no abstraction, hide no decision, and break IDE "jump to definition" navigation by adding a layer of indirection that leads absolutely nowhere but a single class.

**Options:**

1. **Concrete type** — depend directly on the implementation.
2. **Interface with multiple credible implementations** — abstract behavior behind a stable contract where real variation exists.
3. **Speculative interface** — introduce an interface before any second implementation is realistic.

**Trade-offs:**

[Strong Recommendation] **Concrete types** are correct by default for internal domain logic, data transformations, and utility functions that never cross an I/O boundary. Refactor a concrete type to an interface later, once a second implementation genuinely shows up, and that costs exactly one refactor. Paying the indirection cost speculatively, forever, for a variation that never arrives, costs a great deal more than that.

Interfaces with **multiple credible implementations** earn their place at genuine variation points: a `Repository` interface with a real PostgreSQL implementation and a test in-memory one, an `EmailSender` interface running in production and swapped for a `FakeEmailSender` in tests. The variation is real. The interface earns its existence honestly.

**Speculative generality** is the failure mode here: introducing the interface not because variation exists, but because it might, someday, conceivably turn out to be useful. The indirection tax gets paid immediately. The benefit may just never show up at all.

**Common failure modes:** *The Impl Suffix Anti-Pattern.* A codebase where every interface is paired with exactly one class suffixed `Impl`: `BillingManager` / `BillingManagerImpl`, `UserService` / `UserServiceImpl`, `InvoiceProcessor` / `InvoiceProcessorImpl`. The interface communicates no abstraction whatsoever — it's a carbon copy of the class's own public methods. Jumping to the definition of any method now costs an extra hop through an interface that adds precisely nothing. This is the ritual of abstraction with none of the substance behind it.

**Example:** FizzBuzzEnterpriseEdition is a real, widely cited satirical repository that solves the famously trivial FizzBuzz algorithm by introducing `StringReturner`, `FizzStrategy`, `BuzzStrategyFactory`, and dozens more interfaces and factories on top. Every abstraction exists without hiding a shred of meaningful complexity. The joke lands precisely because the indirection is real and fully navigable — each hop is a genuine file, a genuine class — while serving no purpose whatsoever. It's the clearest demonstration anywhere that indirection without variation is strictly a cost, and never anything else.

---

### Don't Apply Dynamic Patterns to Static Choices

**What it is:** The failure of using runtime polymorphism — the Strategy Pattern, dependency-injected interfaces — to model a behavioral choice that is actually fixed at compile time or startup configuration.

**Why it exists:** The Strategy Pattern earns its place when behavior genuinely has to change during a running process — a different payment processor selected per request, a different serializer selected per content type. Apply it to a choice that gets resolved once at startup and never varies again, and it just buries the actual execution path behind indirection that offers zero runtime flexibility and pure overhead every time someone has to read it.

**Options:**

1. **Dynamic strategy injection** — define an interface, inject a concrete implementation at runtime.
2. **Static branching** — use a `switch` or `if/else` that directly invokes the concrete implementation based on a flag.

**Trade-offs:**

[Legitimate Trade-off] **Dynamic strategy injection** is correct when the algorithm genuinely has to change during a single running process based on user input, request content, or plugin registration. It fully decouples the calling code from the branching logic, and adding a new strategy costs zero changes to the caller.

**Static branching** is correct when the choice stays fixed for the lifetime of the process — bound to an environment variable, set once at startup, compiled straight in. It's linear, readable, and shows every possible execution path in one place at a glance. The cost — violating the Open-Closed Principle on extension — is real, but often perfectly acceptable when the set of strategies is small and isn't going anywhere.

**Common failure modes:** *The Hardcoded Strategy.* An engineer implements the Strategy Pattern for a `TaxCalculator` on the theory that the company might expand to other countries someday. The dependency injection framework is hardcoded to inject `USATaxCalculator` on startup. Three years later, the system still operates in exactly one country. Every engineer who touches the tax calculation code has to fight through an interface and a DI configuration just to find a concrete class that has never once been swapped. The polymorphism is theater. The overhead is permanent.

**Example:** In plenty of Spring Boot Java applications, `@Qualifier` annotations inject a specific implementation of a strategy interface where that implementation is statically bound in configuration and never varies per request, ever. A direct call to the concrete class would've been significantly more readable and every bit as correct. The pattern added indirection. It added zero flexibility in return.

---

### A Little Copying Is Better Than a Little Dependency

**What it is:** The explicit preference, in cases of uncertainty, for duplicating small concrete implementations over extracting a shared abstraction that couples independent call sites.

**Why it exists:** Generalization requires predicting which future changes will end up shared across callers. Those predictions are wrong more often than anyone likes to admit. Two call sites that look identical today frequently have independent reasons to drift apart tomorrow. Extract a shared abstraction anyway and you've coupled them for good: the moment one caller needs a change, the shared abstraction has to accommodate both, and the usual fix is bolting on yet another parameter.

**Options:**

1. **Duplicate the concrete implementation** — allow similar code to evolve independently.
2. **Extract a shared abstraction** — centralize the behavior when the pattern recurs.
3. **Build a configurable framework** — generalize through parameters, callbacks, and extension points.

**Trade-offs:**

[Strong Recommendation] **Duplicate** small, stable code whenever the callers are independent and future evolution is genuinely uncertain. The [Rule of Three](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md) is the right threshold to hold yourself to: duplication in two places is just data; duplication across three genuinely similar cases is a pattern that's earned a name.

**Shared abstractions** are correct once repeated evidence shows the duplicated logic genuinely changes together — that touching it in one place would've meant touching it everywhere. The abstraction should reflect what's actually happened, not what somebody anticipated might happen.

**Configurable frameworks** — functions weighed down with optional parameters, callbacks, and flags, all serving exactly one caller — are almost always the wrong answer. They pay the full complexity cost of generalization while delivering none of the benefit: a heavily parameterized function with a single caller isn't a library. It's a bet that a second caller shows up eventually.

**Common failure modes:** A strict DRY purist spots three similar lines across two call sites and extracts a shared function on the spot. Because the two call sites have slightly different needs, the extracted function picks up a boolean flag: `processData(includeHeader=true)`. One caller later needs a different delimiter, so the flag grows into an enum. A second caller needs a different character encoding, and a third parameter shows up right behind it. The abstraction now satisfies neither caller cleanly, has coupled both of them together, and is more complex than the duplicated code it was supposed to replace.

**Example:** Rob Pike's Go proverb — *"A little copying is better than a little dependency"* — is a recognized, authoritative industry position, not a hall pass for sloppy code. What it specifically means: a five-line concrete block duplicated across two independent places is often cheaper to maintain long-term than a shared abstraction coupling those two places together. When one caller's requirements change, the duplicated code just forks naturally, no drama. The shared abstraction turns into a negotiation instead.

---

### Why Smart Engineers Disagree: DRY Absolutism vs. The Cost of Indirection

The persistent argument about micro-abstractions runs between strict DRY adherents and engineers who treat indirection as a cost that has to justify itself, not a virtue worth chasing on its own.

A strict DRY purist sees duplication and sees a defect, full stop. Any two blocks of code that look similar get extracted, whether or not the callers have independent reasons to diverge, whether or not the resulting abstraction can even be named precisely. The line count drops. The purist calls that progress.

An engineer focused on indirection cost reads the same extraction very differently: two call sites that happen to look alike today just got coupled through a shared abstraction neither of them actually needed. That coupling isn't free. Every future change to either caller now has to negotiate with the other one through the abstraction's interface, and the usual resolution is bolting on one more parameter.

Both sides agree duplication is a maintenance burden. They disagree on how much evidence should be required before paying for a shared abstraction. The right threshold is the Rule of Three, applied honestly: wait for three genuinely similar use cases before extracting anything. Two similar call sites is a coincidence. Three is a pattern worth naming.

The language culture matters here too. Enterprise Java ecosystems built around frameworks like Spring have historically tolerated dense abstraction — DI containers, interface hierarchies, factory classes stacked three deep — because the frameworks reward exactly that. Go's culture pushes deliberately in the other direction: concrete types by default, interfaces introduced late if ever, duplication tolerated without much fuss. Neither is objectively right. They're just different calibrations of the same underlying trade-off.
