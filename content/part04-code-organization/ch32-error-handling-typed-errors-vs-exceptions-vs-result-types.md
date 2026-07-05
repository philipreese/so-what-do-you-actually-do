# Ch 32 — Error Handling: Typed Errors vs. Exceptions vs. Result Types

*The cost of a failure path never disappears; it only moves.*

Unchecked exceptions introduce invisible control flow, letting any function call silently exit the stack several frames up with no warning in the signature, while error-as-value makes every failure path visible in the type itself. Neither cost disappears — exceptions impose invisible control flow, error-as-value imposes boilerplate — so the mechanism should be matched to the kind of failure on purpose, not by habit. Operational failures a caller can realistically handle belong in error-as-value; exceptional conditions like violated invariants belong to exceptions or fail-fast termination, where local recovery would be the wrong move. Checked exceptions are a widely acknowledged historical misstep at this point, and don't belong in a new design.

**Prerequisites:** [Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md) (specifically: fail-fast and the crash/corruption/wrong-answer taxonomy), [Error Handling Contracts](../part03-api-design/ch21-error-handling-contracts.md) (the wire-level counterpart to this chapter's in-process mechanisms)

**New vocabulary introduced:** invisible control flow, error-as-value, operational failure, exceptional failure

**Key takeaways:**
- Unchecked exceptions introduce invisible control flow: any function call can silently exit the call stack several frames up, with nothing in the signature warning the caller it was ever a possibility. Error-as-value makes every failure path visible right in the type signature, explicit at each call site with no surprises.
- Neither cost disappears — it just moves. Exceptions impose invisible control flow; error-as-value imposes boilerplate. Trade them on purpose, matching the mechanism to what kind of failure you're actually dealing with.
- Use error-as-value for operational failures — a missing file, a timeout, invalid input — that the immediate caller can realistically be expected to handle.
- Use exceptions or fail-fast termination for exceptional conditions — programming bugs, violated invariants, environmental states with no way back — where trying to recover locally would be the wrong move.
- Checked exceptions are a widely acknowledged historical misstep at this point. Leave them out of new designs entirely.
- Rust's `?` operator proves that explicit propagation and a readable success path were never mutually exclusive — they just needed language support, not some fundamental trade-off everyone assumed was permanent.

## For My Wife

**Every time a piece of code might fail, a programmer has to decide how that failure gets communicated back — and this chapter is about how much that one decision changes what a production emergency actually looks like at two in the morning.** One approach lets any piece of code silently jump backward, sometimes many steps, to wherever somebody bothered to write a "catch this" block. Nothing where you're looking warns you a jump might happen — you find out by reading documentation nobody kept up to date, or by getting paged when it happens somewhere nobody expected. The other approach forces every function that can fail to say so plainly, right at the spot where it's called, so tracing what happens never means wondering whether something invisible is about to interrupt.

**The chapter comes down firmly on one side for anything where reliability actually matters: state the failure up front, every time, even though it means more typing at every call site.** The reasoning is about who reads the code and when. The person writing it writes it once, pleased with how clean the success path looks. The person debugging it later, tracing a crash back through fifteen functions they've never seen before, pays for every silent jump nobody warned them about.

> [!NOTE]
> Not every failure deserves the same response, either. A store being out of milk is routine — you adjust and move on. A fire alarm means you stop and get out, and calmly continuing to shop instead is the actually dangerous move. Code has the same split: a missing file or a wrong password is routine, something the immediate caller should be ready to handle. A program discovering its own internal bookkeeping is impossible is a bug, not a possibility, and should stop cold rather than keep running on a broken assumption — quietly producing wrong answers that look fine right up until someone downstream trusts one.

## For My Kids

### The Friend Who Never Texted Back

Say you ask a friend to grab something for you from the store while she's out. Good version: she texts back either "got it" or "nope, they were sold out" — either way, you know immediately, and you can plan your next move right then.

Bad version: she just doesn't respond. Maybe she's still shopping. Maybe she forgot. Maybe something went wrong.

You don't know, and you won't find out until she happens to show back up, whenever that is.

**The bad version isn't dishonest, exactly — it's just silent in a way that costs you.**

Every minute spent guessing "did it work or not" is a minute you can't spend actually reacting to whichever answer turns out to be true. A clear "no" the second she knows it beats a "maybe" that eventually resolves itself an hour later.

**This is why the boring, explicit answer beats the silent one — even though typing "nope, sold out" takes an extra second she'd rather skip.** Whoever's waiting on the answer needs to know the second something didn't work, not eventually, and not by having to guess from the silence.

> [!CAR]
> Has someone ever left you hanging without an answer when a quick "no" would've saved you from worrying? How did you handle the waiting?

---

[Ch 21](../part03-api-design/ch21-error-handling-contracts.md) covers how failures get serialized and communicated across a network boundary. [Ch 07](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md) established the system-level taxonomy: crash failures, corruption failures, wrong-answer failures. This chapter sits in the layer between them — how failure gets represented and propagated through function calls inside a single codebase, before any of it ever reaches an API boundary at all.

The choice of mechanism isn't cosmetic. It decides whether a caller even knows a failure is possible, whether the compiler can force acknowledgment of it, and whether an engineer reading the code can trace every exit point without going and opening a pile of external dependency files first.

---

### Choose the Error Propagation Paradigm

**What it is:** The foundational mechanism a codebase uses to route failures from the point where they occur to the point where they are handled.

**Why it exists:** Errors arise down in low-level I/O and validation but get resolved way up at the level of high-level policy. The propagation mechanism defines the cognitive and computational path an error takes climbing through those layers — and whether that path stays visible or disappears into the machinery.

**Options:**

1. **Unchecked exceptions** — any function can throw without declaring it in its signature. The call stack unwinds automatically until a matching catch block is found. Python, JavaScript, and Java's `RuntimeException` follow this model.
2. **Checked exceptions** — the compiler requires a function that can throw to either declare the exception in a `throws` clause or handle it locally. Java's original exception hierarchy was built on this model.
3. **Error-as-value** — failure is returned as an ordinary value through the function's standard return channel. The function signature explicitly declares the possibility of failure; the type system tracks whether callers handle it. Go's `(result, error)` return convention and Rust's `Result<T, E>` are its clearest expressions.

**Trade-offs:**

[Strong Recommendation] **Error-as-value** is the correct default for production systems engineering, full stop. Every call site is an explicit admission that the operation can fail. An engineer auditing a production incident or reviewing a diff traces every failure path without ever opening an external file. Each `if err != nil` is attributable in git history and greppable by static analysis on demand. The cost — boilerplate — is real and nobody's pretending otherwise. Go's canonical pattern:

```go
result, err := doSomething()
if err != nil {
    return nil, err
}
```

is the community's single most cited complaint about the language, and the designers heard it and accepted it anyway, on purpose — the explicitness was always the point, not an oversight. Go wasn't even the first to make this bet: C's `errno` and integer return codes were error-as-value with zero enforcement behind them, and the predictable result was developers routinely ignoring return values, including from `close()` and `printf()` of all things. Go and Rust took the lesson from that and bolted on type-system enforcement.

Rust refines the model further still with the `?` operator, which propagates a `Result::Err` to the caller in a single character while keeping the explicit contract fully intact in the function signature:

```rust
fn read_username(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut s = String::new();
    file.read_to_string(&mut s)?;
    Ok(s)
}
```

The failure path stays fully visible in the return type. The boilerplate is simply gone. `?` proves the boilerplate objection to error-as-value was always a language design problem, not some inherent trade-off between explicitness and readability that everyone just had to live with.

[Consensus] **Unchecked exceptions** are acceptable for high-level application code, scripting, and rapid prototyping, anywhere crashing a request handler or script process is a cheap and adequate isolation strategy on its own. They're not appropriate for systems where hidden failure paths carry real operational risk.

[Strong Recommendation] **Checked exceptions** should stay out of new designs entirely. Java's checked exception experiment was motivated by the right instinct — preventing ignored failures through compiler enforcement — but it produced cascading signature pollution and one specific anti-pattern (the catch-and-ignore block, covered just below). Major Java frameworks, Spring included, bypassed checked exceptions entirely by wrapping internal failures in unchecked `RuntimeException`. No major language designed after Java has adopted checked exceptions as its primary mechanism. The industry absorbed the lesson and moved on.

**When to choose each:** Use error-as-value for any system where failure paths need to be auditable, where callers are expected to respond to failures specifically, or where reliability is an explicit design constraint rather than a hope. Use unchecked exceptions in scripting, prototyping, or application layers where a crashed process is an acceptable outcome. Avoid checked exceptions in greenfield work, period.

**Common failure modes:**

*The Ghost Crash.* In a Node.js service, an engineer calls a third-party library's data transformation function. Nothing in the signature or the documentation hints that this function can throw a socket error under load. In production, an unexpected network state triggers exactly that, and the exception propagates past every single request handler straight into the process's uncaught exception handler, taking down the entire server instance. Every upstream caller fails at once. The failure wasn't even unrecoverable — the connection could easily have been retried — but not one caller along the stack ever knew that possibility existed.

*The Catch-and-Ignore Block.* Java's checked exception mechanism forces a caller to either declare or handle every checked exception, no exceptions of its own. Faced with a `throws IOException` on a function that realistically can't fail in context — or just in a hurry — a developer writes:

```java
try {
    readConfig();
} catch (IOException e) {
    // TODO: handle this
}
```

The compiler is satisfied. When `readConfig()` actually fails in production, the exception vanishes without a trace. The compiler's requirement got met. No understanding got gained anywhere along the way.

**Example:** C established error-as-value first. Go institutionalized it with a first-class `error` return type and a genuine cultural convention around it. Rust formalized it further with `Result<T, E>` and removed the syntax objection entirely with `?`. Each one is the same underlying philosophy, just with progressively better tooling wrapped around the verbosity cost.

---

### Match the Mechanism to the Nature of the Failure

**What it is:** The distinction between failures that are expected parts of correct execution and failures that indicate the program is in a state it cannot safely continue from.

**Why it exists:** Treat every failure as exceptional — throwing for a missing file, a validation error, a timeout — and you force callers to handle exception semantics for outcomes they were already perfectly prepared to manage through ordinary control flow. Treat every failure as operational instead — catching a null-dereference or out-of-memory error and returning it as a value — and you're continuing execution in a state the program was never designed to survive.

**Options:**

1. **Return operational failures as values** — file not found, timeout, invalid input — expected anomalies during correct execution that the immediate caller is realistically expected to handle.
2. **Reserve exceptions and panics for exceptional conditions** — out-of-memory, null dereference in code that asserted non-null, an array access beyond its bounds — unrecoverable violations of invariants that indicate a programming bug or environmental collapse.
3. **Uniform recovery** — catch all failures, including invariant violations, inside a top-level handler to keep the process alive.

**Trade-offs:**

[Consensus] **Return operational failures as values** and **reserve exceptions and panics for exceptional conditions.** Go encodes this distinction directly: `error` for operational failures, `panic` for invariant violations. Rust encodes the same split as `Result<T, E>` for expected failure and `panic!` for the unrecoverable kind. The two categories genuinely deserve different mechanisms.

**Uniform recovery** — a top-level `catch (Exception e)` or `recover()` swallowing everything indiscriminately — is exactly the wrong-answer failure described back in [Ch 07](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md): the system keeps running on corrupted state, producing wrong results with no visible sign anything's amiss. That's strictly worse than a crash would have been.

**When to choose each:** If the immediate caller can realistically be expected to respond to the failure — retry it, substitute a default, surface an error to the user — return it as a value. If the failure means the program's own code has a bug, or the runtime environment has collapsed past any hope of recovery, terminate through a panic or exception and let the external orchestrator — Kubernetes, systemd, a supervisor process — restart from a clean slate.

**Common failure modes:**

*The Undefined State Zombie.* A service wraps its entire HTTP request handler in a `try { ... } catch (err) { res.status(500).send() }`. A request triggers a `TypeError: Cannot read property 'balance' of undefined` deep inside the payment state manager — a straightforward programming bug. The catch block intercepts it, stops the crash, and keeps the process limping along. The bug has left payment state in an undefined condition regardless. Every subsequent unrelated request now operates on that corrupted state, quietly producing wrong account balances. The service is alive and wrong at the same time — the worst failure mode in the entire [Ch 07](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md) taxonomy: silent, self-reinforcing, and masked behind the appearance of good health.

**Example:** An array index out-of-bounds access signals a programming error — the code assumed something about its own state that wasn't true. Failing to open a user-selected file because it doesn't exist is a routine operational event the file-opening call was built to report in the first place. These two failures are categorically different, and they deserve categorically different handling. It's the type of failure that governs the mechanism here, never the severity of its consequences.

---

### Accept Language Boilerplate or Use Language Features — Don't Build Frameworks

**What it is:** The decision about how to reduce the syntactic cost of error-as-value propagation.

**Why it exists:** The boilerplate cost of explicit error forwarding is real, it's repetitive, and it tempts engineers to build custom machinery just to abstract it away. The result almost always ends up worse than the original verbosity ever was.

**Options:**

1. **Accept the language idiom** — write explicit error-forwarding at each call site.
2. **Use language-native propagation syntax** — Rust's `?` operator; language-idiomatic patterns where available.
3. **Build a custom propagation framework** — centralized error channels, bespoke result monads, higher-order error-threading utilities.

**Trade-offs:**

[Strong Recommendation] **Accept the language idiom** whenever it's the established standard. Go's repeated `if err != nil` is a conscious, deliberate call made by Go's own designers, fully aware of exactly the complaint everyone raises about it. Eliminate it through a custom abstraction and you trade a small readability cost for a much larger auditability one — an engineer unfamiliar with the custom machinery can't read a single line of code that uses it without first learning the abstraction from scratch.

**Language-native propagation syntax** is the right upgrade path whenever the language happens to offer one. Rust's `?` gets this right because it keeps the explicit contract intact (`Result<T, E>` in the return type) while stripping out the forwarding ceremony entirely. The failure stays visible. Only the syntax got shorter. Where the language doesn't offer this — and Go, as of this writing, doesn't — the right answer is accepting the idiom, not inventing a substitute for it.

**Custom frameworks** are the wrong answer, consistently. A bespoke `Result` monad, a `Must(value, err)` helper, a higher-order function threading errors through callbacks — all of these introduce a layer an engineer has to learn before they can read a single line of code using it. The original boilerplate, at least, was the language standard everyone already knew.

**When to choose each:** Use the language idiom as the default, every time. Adopt language-native syntax the moment the language actually provides it. Never build a custom error-propagation framework unless the team is writing infrastructure consumed by thousands of engineers who'll all get trained on the abstraction anyway — at which point the abstraction has effectively become the language, and it should be held to that same standard.

**Common failure modes:**

*The DIY Panic Wrapper.* A team, frustrated with Go's verbosity, introduces a `Must(value, error)` helper that panics on any non-nil error, wiping out all `if err != nil` forwarding at once. Call sites get cleaner overnight. Six months later, a routine operational failure — a timeout during a non-critical metadata lookup — crashes the entire service, because `Must` got applied to a function the original author assumed could never fail in production. The helper conflated operational and exceptional failures in its very design, and the bill came due at runtime.

**Example:** Spring's shift from checked exceptions to unchecked `RuntimeException` was never a retreat toward ignoring errors — it was a recognition that the checked exception mechanism was simply the wrong carrier for the principle of explicit failure acknowledgment. The principle survived. The mechanism changed. Rust's `?` operator teaches the identical lesson applied to error-as-value: the principle — explicit failure baked into the type signature — survived intact; the boilerplate — manual `match` on `Result` — is what changed.

---

### Why Smart Engineers Disagree: The Author vs. the Maintainer

The argument about error-handling paradigms is, at bottom, an argument about who the code is actually being optimized for.

Engineers who favor exceptions argue that code reads best when the success path dominates the visual structure. Interleave error-checking conditionals with domain logic and the reader has to context-switch on every line, making the primary algorithm harder to hold in your head. From this angle, exceptions do exactly the right thing: the main logic flows linearly, the exceptional paths get handled somewhere else entirely, and the happy path reads like the requirements document it's supposed to implement.

Engineers who favor error-as-value argue that failure paths were never incidental noise to begin with — they're core program logic. In systems engineering, the error-handling code frequently makes up the majority of the codebase: resource cleanup, partial failure recovery, retry decisions, user-facing error messages. Bury those paths behind invisible control flow and a reader can't verify correctness without knowing, off the top of their head, which of the dozens of function calls in any given block might silently bail out several frames up.

The practical synthesis: implicit exceptions favor the author, who's writing the happy path once. Explicit values favor the maintainer, who's auditing a production incident under pressure or reviewing a diff for safety before it merges. The author writes the code exactly one time. The maintainer reads it over and over, usually at the worst possible moment.

The direction of language design has been moving toward explicit values for a while now. Go chose verbosity on purpose. Rust proved the boilerplate objection was a solvable language problem all along, not a law of nature. The industry's retreat from checked exceptions was never a retreat back to unchecked ones — it was the recognition that the type system, not the exception mechanism, is the right place to make failures visible in the first place. The argument between exception-first and value-first paradigms will keep going as long as exception-based languages stay dominant, but the architecture of new systems increasingly reflects the value-first answer regardless of how the argument turns out.
