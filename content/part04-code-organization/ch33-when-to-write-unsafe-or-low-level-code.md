# Ch 33 — When to Write Unsafe or Low-Level Code

*Unsafe code moves correctness from the compiler to the engineer.*

Unsafe code transfers correctness responsibility straight from the compiler to the engineer, and that transfer carries a permanent maintenance cost that has to be purchased with demonstrated need, not a hunch. Legitimate reasons stay narrow: a measured, profiled bottleneck where a safe abstraction's overhead is the proven cause, an unavoidable FFI boundary, or a foundational component everyone else gets to use safely. Unsafe code has to be wrapped immediately by a safe public API, concentrating the unavoidable unsafety into one small, auditable core while the rest of the system stays safe. Every unsafe block depends on invariants the compiler can no longer verify, so they have to be documented explicitly — they've become part of the code's correctness contract whether or not anyone wrote that down.

**Prerequisites:** [Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md) (the hardware reasoning that justifies unsafe code when it is justified), [FFI and Native Binding Design](../part03-api-design/ch26-ffi-and-native-binding-design.md) (the boundary-wrapper discipline this chapter reuses at the single-language level)

**New vocabulary introduced:** undefined behavior, safety escape hatch

**Key takeaways:**
- Unsafe code transfers correctness responsibility straight from the compiler to the engineer. That transfer carries a permanent maintenance cost, and it has to be purchased with demonstrated need, not a hunch.
- Legitimate reasons to write unsafe code stay narrow: a measured, profiled performance bottleneck where the safe abstraction's overhead is the proven cause; the FFI boundary (covered in [Ch 26](../part03-api-design/ch26-ffi-and-native-binding-design.md)), where contact with unsafe code can't be avoided; implementing a foundational component that everyone else gets to use safely.
- Unsafe code has to be wrapped immediately by a safe public API. The thin-binding, thick-wrapper structure from [Ch 26](../part03-api-design/ch26-ffi-and-native-binding-design.md) applies directly here: concentrate the unavoidable unsafety into one small, auditable core, and let the rest of the system stay safe.
- Every unsafe block depends on invariants the compiler can no longer verify on its own. Document them explicitly — they've just become part of the code's correctness contract, whether anyone wrote that down or not.
- Unsafe code deserves more review, more testing, and narrower ownership than ordinary application code gets. The less the compiler verifies, the more engineering discipline has to pick up the slack.

## For My Wife

Most programming languages come with a childproof cap already screwed on — built-in checks that stop a piece of code from reaching past the end of a list or touching memory nothing ever gave it permission to touch. That cap is friction on purpose, and for almost all code, leaving it on is simply correct: it rules out an entire category of mistake automatically, forever, at essentially no cost.

This chapter is about the narrow, legitimate reasons to twist that cap off anyway. Not "it's annoying" — a pharmacist measuring an exact dose sometimes has to remove a safety cap to do the job at all, and a factory line filling ten thousand bottles a day genuinely can't afford the friction on every single one. The equivalent cases in code are just as narrow: you've actually measured, with real numbers, that the safety check itself is what's slowing things down — not guessed, measured — or you're building the one component everyone else is going to rely on, and somebody has to write the careful version so the rest of the team gets the safe one for free.

And the rule for removing the cap is non-negotiable: put it back on immediately, and write down exactly why it was safe to take off in the first place. A bottle left uncapped on a shelf, with no label saying what's inside or why, is a hazard to whoever picks it up next — someone who wasn't in the room for the original decision and has no way of knowing whether it's still safe to touch. That's the whole discipline this chapter asks for. Skip it, and the shortcut that saved one engineer an afternoon becomes the outage that costs the company a very bad night.

## For My Kids

Say your family keeps the good sharp chef's knife locked away, and you're allowed the safe, dull one for basically everything — it cuts fine, and nobody's getting hurt reaching for it.

**Once in a while, a real recipe actually needs the sharp knife** — paper-thin garlic that the dull one just mushes instead of slicing. That's a real, specific reason, not "the dull one's kind of annoying today." You get the sharp knife out, for that one task, for as long as that task takes.

**The part that actually matters is what happens right after.** You don't leave the sharp knife sitting on the counter because you might need it again in twenty minutes. You wash it, put it straight back where it locks up, and if your little brother's going to be in the kitchen later, you say something: "I used the sharp knife for the garlic, it's put away now." Skip that last part, and the real danger isn't the slicing — it's a six-year-old finding a knife on the counter that isn't supposed to be there, with nobody around who remembers leaving it out.

**The dull knife stays the right choice almost every single time.** The sharp one earns its one use only because the job genuinely needed it, and it earns being trusted again only because it went straight back to being locked up the second the job was done.

---

Most software should be written entirely within its language's safety guarantees. Memory safety, type safety, bounds checking, managed runtimes — these exist because they wipe out entire classes of defects, not as obstacles standing in a programmer's way but as structural guarantees the compiler enforces on their behalf, for free. This chapter is about the narrow set of circumstances where stepping outside those guarantees is actually justified, and the discipline that decision demands.

Rust's `unsafe` keyword is the clearest model available anywhere: an `unsafe` block suspends the compiler's memory safety verification for exactly that block and nothing else, leaving the rest of the file fully checked. That's a deliberate design choice — a bounded, auditable escape hatch, not a global setting anyone could flip. C and C++ take the inverse approach entirely: unsafe by default, everywhere, with the programmer bearing continuous responsibility for all of it. Most managed languages — Java, Python, C#, Go — sit at safe-by-default and offer only limited mechanisms to step outside it when the need genuinely arises.

---

### Justify Unsafe Code with Measurement, Not Anticipation

**What it is:** The requirement that performance-motivated unsafe code be preceded by profiling evidence that identifies the safe abstraction's overhead as the actual bottleneck.

**Why it exists:** Safe abstractions carry a real physical cost. Array bounds checks emit actual CPU instructions. Garbage collectors introduce pause time and overhead. Managed type systems constrain memory layout. All of that is real — but it's frequently not the dominant cost anywhere in a given system. Assume it is anyway, bypass it on that assumption alone, and you've introduced undefined behavior in exchange for a speedup a profiler would have told you, up front, was never actually on the table.

**Options:**

1. **Safe implementation by default** — accept the language's guarantees and the performance they imply.
2. **Compiler-assisted optimization** — rely on the optimizer to prove invariants and eliminate safety checks through loop unrolling, vectorization, and constant propagation.
3. **Explicit unsafe escape after profiling** — bypass safety checks manually after measurement confirms they are the primary bottleneck under production conditions.
4. **Speculative unsafe optimization** — bypass safety checks based on assumption rather than evidence.

**Trade-offs:**

[Strong Recommendation] **Safe implementation by default** is correct for everything except the narrow cases described in "When to choose each option" below. The compiler's guarantees aren't expensive on most code paths — they're background infrastructure you'd otherwise have to build yourself.

**Compiler-assisted optimization** is worth trying before reaching for any unsafe escape at all: modern compilers can often prove an index is always in bounds and drop the check entirely on their own. This approach is fragile — a perfectly benign refactor can silently make the optimizer stop applying it — but it keeps safety guarantees intact and deserves to be tried first, every time.

**Explicit unsafe escape after profiling** is the correct path once measurement identifies the safe abstraction's overhead as the proven bottleneck, not a suspected one. The profiling requirement isn't a formality to check off — it's what determines whether the unsafe code buys anything real at all.

**Speculative unsafe optimization** — reaching for unsafe code before profiling has confirmed the bottleneck — is always wrong, no exceptions. It permanently raises maintenance cost and introduces undefined behavior risk in exchange for a performance gain that was assumed, never measured.

**When to choose each option:** Choose an explicit unsafe escape when profiling under production conditions shows the safety mechanism itself — not I/O, not algorithmic complexity, not serialization, not network latency — is the primary bottleneck. The three legitimate triggers: a measured performance bottleneck attributable to one specific safe abstraction; the FFI boundary ([Ch 26](../part03-api-design/ch26-ffi-and-native-binding-design.md)), where contact with native code can't be avoided; and building a foundational component that exposes a safe interface to every caller — somebody has to write the one well-tested unsafe core a standard collection or allocator sits on.

**Common failure modes:**

*The Speculative Optimization Vector.* An engineer eyes an ingestion loop and decides the bounds check on each array index is "too slow." Without ever capturing a baseline profile, they swap the safe index operation for an unchecked pointer offset. The unsafe path delivers a statistically insignificant speedup, because the loop was I/O bound the whole time, not CPU bound. The bounds check was never the bottleneck. The unsafe code has now introduced a live buffer overflow: a future caller with an unexpected input size gets memory corruption instead of a bounds error they could've recovered from cleanly.

**Example:** High-throughput serialization engines like SIMD-json and custom binary protocol parsers routinely lean on unsafe memory access, and for good reason. At 50 GB/s ingestion rates, bounds-checking every single byte of an incoming network stream can eat a measurable slice of the available CPU budget. The justification holds up in those systems — but it followed profiling, not preceded it. The engineer identified the specific instruction sequence the bounds checks were emitting, confirmed it was dominating cycle counts, and only then reached for the unsafe equivalent.

---

### Minimize the Unsafe Surface and Wrap It Immediately

**What it is:** The structural rule that unsafe code must be confined to the smallest possible region and immediately enclosed by a safe public interface that prevents unsafe invariants from leaking to callers.

**Why it exists:** Unsafety spreads. Expose a raw pointer, an unverified memory layout assumption, or an unchecked index through a public interface, and every caller now has to reason about low-level correctness whether they signed up for it or not. The undefined behavior blast radius — how much memory corruption one single bug can cause — grows with every extra line of code operating on unverified data. Wrap unsafe code behind a safe boundary and that blast radius stays contained to one auditable core.

**Options:**

1. **Scattered inline unsafety** — place unsafe operations directly inside application-layer functions wherever they are needed.
2. **Hermetic safe packaging** — confine all unsafe operations to a dedicated, narrowly scoped module or type, exposing only safe, idiomatic methods to consumers.

**Trade-offs:**

[Strong Recommendation] **Hermetic safe packaging** is the only acceptable structure for unsafe code, full stop. It's the same thin-binding, thick-wrapper architecture established for FFI boundaries in [Ch 26](../part03-api-design/ch26-ffi-and-native-binding-design.md), just applied inside a single language this time. The unsafe implementation lives in one place. The safe API wraps it. Every other part of the codebase calls the safe API and nothing else. An engineer auditing the unsafe code knows exactly where to look, and a bug in that region can't propagate past the boundary, because the boundary refuses callers any access to the raw internals.

[Consensus] **Scattered inline unsafety** isn't a trade-off with a legitimate side to it — it's an anti-pattern, plainly. Spreading unsafe operations through application-layer functions turns the entire codebase into an audit target. Memory corruption bugs become impossible to localize, because the corrupted operation could trace back to any of dozens of scattered sites.

**Common failure modes:**

*The Leaky Pointer Contract.* A C# module uses an `unsafe` block to pin a managed array, extracts its raw memory address, and returns that pointer directly to an application-layer service just to dodge a copy. The service stores the pointer. Later, the originating function exits, the pinning lapses, and the garbage collector reclaims and reallocates the underlying memory without asking anyone. The application-layer service is now holding a dangling pointer. The next read returns whatever happens to be sitting in memory. The corruption surfaces as corrupted fields in a completely unrelated data structure, far from the original unsafe code, hours after the actual fault occurred.

**Example:** Rust's `Vec<T>` is the clearest demonstration anywhere that hermetic safe packaging actually works. Its implementation runs on raw pointers, manual reallocation, unsafe memory management, all of it. Its public interface — `push`, `pop`, `len`, `iter` — is entirely safe regardless. A caller uses `Vec` freely without ever writing a single `unsafe` block themselves, because every bit of unsafe reasoning stays contained in one well-tested, carefully reviewed core. The standard library isn't a special case here. It's the template everyone else should be copying.

---

### Document Every Invariant the Compiler Can No Longer Verify

**What it is:** The requirement to record explicitly, adjacent to each unsafe block, the exact conditions that make the operation safe — the invariants the compiler would have verified automatically and no longer can.

**Why it exists:** Inside safe code, the compiler is the final word on memory and type correctness. The moment an unsafe block switches part of that verification off, the engineer has taken over the compiler's job personally. Without a written explanation of why the operation is safe, whoever modifies adjacent code next has no way of knowing which assumptions have to survive and which changes would quietly violate them. Invariant documentation isn't a courtesy here — it's part of the code's actual correctness proof.

**Options:**

1. **Explicit invariant attestation** — document the precise memory, layout, and ownership conditions that must hold for the unsafe operation to be correct, directly above the unsafe block.
2. **Implicit technical trust** — rely on the original engineer's competence and on code review to preserve invariants over time.
3. **Safe enforcement at the boundary** — validate inputs and state through ordinary safe code before entering the unsafe region, mechanically preventing invalid entry where possible.

**Trade-offs:**

[Strong Recommendation] **Explicit invariant attestation** is required for every unsafe block, no exceptions. An engineer writing unsafe code should be able to finish the sentence: "This operation is safe because..." — clearly, specifically, in writing. If they can't finish that sentence, the code isn't ready to ship.

**Implicit technical trust** degrades in a completely predictable way. The original engineer is never the last person who touches adjacent code. Within months, somebody who never wrote the unsafe block refactors a calling function and unknowingly violates the exact memory layout assumption that made the unsafe operation correct in the first place. The resulting bug shows up far from the original change, under specific conditions, and only intermittently.

**Safe enforcement at the boundary** — validating inputs before entering an unsafe region — complements invariant documentation. It doesn't replace it. Not every invariant can be checked mechanically: a pointer's continued validity, an alignment guarantee inherited from an upstream allocator, an assumption that nothing's modifying this concurrently. Those still need documentation even when partial validation at the boundary is already in place.

**Common failure modes:**

*The Untested Padding Assumption.* An engineer writes a high-speed parsing routine using unsafe memory casts, assuming input buffers always come padded to 16-byte boundaries — "because that's how the upstream service works right now." No invariant comment documents this precondition anywhere. Two years later, a new upstream client sends a 7-byte buffer. The unsafe routine performs an out-of-bounds read, hits an unmapped memory page, and crashes the process with a segmentation fault. The precondition was real and it was necessary. It was just invisible.

**Example:** Idiomatic Rust community practice mandates a `// SAFETY:` comment above every `unsafe` block, spelling out the exact reasons the operation can't violate memory hygiene:

```rust
// SAFETY: The caller guarantees that `index` is less than the allocated
// capacity. This precondition is verified by the public `get_unchecked`
// wrapper, which panics on out-of-bounds access in debug builds and
// performs a boundary check at the safe API layer (line 42).
unsafe {
    return *self.ptr.add(index);
}
```

The comment isn't stylistic convention. It's a human proof of correctness standing in for the compiler's automated verification. It hands reviewers a precise checklist, and it tells every future engineer exactly which assumptions have to survive any refactor of the surrounding code.

---

### Hold Unsafe Code to a Higher Engineering Standard

**What it is:** The explicit elevation of review, testing, documentation, and ownership requirements for any code that bypasses a language's safety guarantees.

**Why it exists:** Bugs in unsafe code carry consequences safe-code bugs simply don't. An out-of-bounds read in safe code produces a recoverable exception or panic — bounded, detectable, contained. An out-of-bounds read in unsafe code produces undefined behavior instead: corrupted memory, wrong values silently written into unrelated data structures, exploitable security holes. The consequences can surface far from the original fault, under specific conditions, long after the bug was ever introduced. Ordinary engineering process was never calibrated for failures shaped like that.

**Options:**

1. **Ordinary standards** — apply the same review and testing processes to unsafe code as to any other code.
2. **Elevated standards** — apply stricter review processes, broader test coverage, mandatory fuzzing, and narrower ownership to unsafe code specifically.

**Trade-offs:**

[Strong Recommendation] **Elevated standards** for all unsafe code, without exception. Unsafe implementations should get: mandatory expert code review above the standard reviewer threshold; fuzz testing aimed squarely at the safe API boundary and the invariant conditions documented in the safety comments; narrower ownership, with only a limited set of engineers authorized to touch the unsafe core; and change management that demands documenting exactly what invariant evidence justifies any given modification. The extra process overhead is simply the price of stepping outside the compiler's verification. When the compiler stops checking, engineering process has to pick up the difference.

**Common failure modes:** Unsafe code creeps through a repository one small addition at a time — "this is just a helper function," "this is obviously safe," "we'll clean this up later." Reviewers see enough unsafe blocks pass by that they stop treating each one as exceptional. The explicit `unsafe` keyword, which was supposed to grab attention, fades into background noise instead. The blast radius of any single bug, once contained to one auditable module, now spans the entire codebase. Rust's explicit safety block only works as a flag if the team actually still treats it as one.

**Example:** The Linux kernel treats its unsafe-by-nature C code with processes safe-language codebases rarely bother applying: mandatory co-maintainer review, architecture-level mailing list discussion before touching core subsystems, and lock-ordering documentation maintained with the same rigor as the code itself. The elevated process exists precisely because a bug in kernel memory management is catastrophic, and the compiler offers no automatic safety net to catch it.

---

### Why Smart Engineers Disagree: Language Purity vs. Pragmatic Hardware Access

The genuine tension in unsafe code decisions splits engineers who treat safety guarantees as close to inviolable from those who treat hardware access as a first-class engineering tool in its own right.

Language purists argue that a single unsafe block weakens the correctness argument for the entire system. The moment one component relies on manually verified invariants instead of compiler-enforced ones, the codebase's mathematical safety guarantee stops being uniform. They'll accept a real memory or latency penalty — sometimes a steep one — to preserve the property that every correctness claim in the codebase is machine-checkable. From where they stand, the unsafe escape hatch exists for genuine emergencies, not routine optimization.

Pragmatic systems engineers see this as an ideological stance that hardware simply can't always afford to indulge. At the bottom of the stack, everything is unsafe anyway: syscalls, memory-mapped hardware registers, DMA transfers — none of that has a type checker watching over it. Refusing a well-contained, thoroughly audited unsafe optimization out of theoretical purity ignores the real hardware budgets the systems in question actually have to live within.

The right resolution isn't picking a spot on that spectrum — it's changing the question being asked. A language's safety guarantees were never meant to make unsafe operations impossible. They're meant to make them visible, localized, and auditable. An `unsafe` block in Rust or C# doesn't disable safety verification for the whole file or application — it draws a tight boundary around one micro-scoped zone. The systems engineer isn't rejecting safety, and isn't rejecting hardware access either. Hermetic safe packaging buys both at once: a narrow unsafe core, a safe public API, elevated engineering process, explicit invariant documentation. The unsafe code becomes an implementation detail. It never becomes the architecture.

Where to draw the line on acceptable unsafe code is a calibration every team has to make, based on their domain's performance requirements, failure consequences, and actual engineering discipline. High-throughput networking, compression engines, and OS kernels sit at one end of that spectrum. Standard business logic applications should rarely if ever get anywhere near the question. The exact calibration matters less than having made one on purpose — rather than drifting into unsafe code without ever consciously deciding to.
