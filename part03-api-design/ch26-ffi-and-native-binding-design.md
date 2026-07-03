# Chapter 26 — FFI and Native Binding Design

**Prerequisites:** [Part I, Ch 04 — Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Part III, Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Ch 22 — Idempotency](ch22-idempotency.md). Specifically: information hiding, minimal surface area, and the contrast with network-level graceful degradation this chapter inverts.

**New vocabulary introduced:** Foreign Function Interface (FFI), Application Binary Interface (ABI)

**Key takeaways:**
- This chapter is a deliberate register change from the rest of Part III: not a network boundary, but a language boundary — code written in one language calling directly into code compiled in another. There's no timeout here, no retry, no graceful degradation to fall back on. A mistake at a network boundary returns a `500`; a mistake at an FFI boundary can take down the entire host process with it. It's the least forgiving API surface anywhere in this book.
- An API is a logical contract. An ABI is the physical one — exact memory layout, struct padding, calling convention, none of it negotiable. Two different compilers agreeing on source-level behavior tells you nothing about whether they agree on what bytes a struct actually contains.
- Memory ownership is the central design problem here, because there's no shared garbage collector watching both sides of the fence. Exactly one side has to be responsible for freeing whatever crosses the boundary, and that responsibility has to be spelled out explicitly, never just assumed.
- Exceptions, panics, and stack unwinding are language runtime features, not hardware features, and not one of them can safely cross into a different runtime. Error handling at this boundary drops all the way down to primitives: return codes, out-parameters, or a thread-local error slot — never a thrown exception reaching across a language it was never built to survive.

---

## ABI vs. API: The Binary Contract

**What it is:** The distinction between the logical contract a human reads (the API — function signatures, types) and the physical, compiled contract the CPU actually executes (the ABI — memory layout, struct padding, register usage, calling convention).

**Why it exists:** A CPU never reads source code — it reads memory addresses and registers, full stop. Within one language, the compiler quietly guarantees caller and callee agree on memory layout. Cross an FFI boundary and you've got two entirely different compilers involved, with nothing forcing them to agree on anything at all — miss on byte alignment and the callee reads pure garbage straight out of its registers.

**Options:**
1. **Language-specific ABI** — exposing a higher-level language's native, often unstable, ABI directly (C++, Rust)
2. **The C ABI** — routing all cross-boundary communication through the stable, universally understood C calling convention

**Trade-offs:**
- *Language-specific ABI:* lets you pass genuinely rich types across (`std::vector`, generic traits) — but it's fundamentally unstable ground to build on; C++'s ABI shifts with the compiler (GCC vs. MSVC) and even with optimization flags, so unless caller and callee share the exact same toolchain, the boundary corrupts memory without so much as a warning.
- *The C ABI:* mathematically stable, and every language on earth supports it — but it strips the surface down to the lowest common denominator on offer: raw pointers, contiguous byte arrays, primitive integers. Every high-level feature gets left at the door like a coat check.

**When to choose each:**
- *C ABI:* the default for any library meant to be consumed by more than one language.
- *Language-specific ABI:* never across a real FFI boundary, unless caller and callee are built from the same monorepo with the same toolchain — which means it isn't really a foreign boundary at all.

**Common failure modes:**
- **The field-reordering segfault:** a C struct gets a new boolean field slipped into the middle. For C consumers who recompile, that's a non-breaking source change, nothing to see here. For a Python binding that dynamically links without recompiling, the byte layout has shifted underneath it without asking — the library reads memory at the old offsets, misreads a pointer, and takes down the entire process.

**Example:** The Rust standard library deliberately makes no promise of a stable Rust ABI — the compiler is free to reorder struct fields for padding optimization whenever it feels like it. Exposing a Rust library to Python or C requires `#[repr(C)]` on structs and `extern "C"` on functions, forcing Rust to explicitly give up its own optimizations and obey the C ABI right at the boundary. **[Consensus: route every cross-language boundary through the C ABI; nothing else is stable enough to build on]**

---

## Cross-Boundary Memory Ownership

**What it is:** The explicit rule for which side of an FFI boundary allocates memory, and — more importantly — which side is responsible for freeing it.

**Why it exists:** Memory allocators aren't a universal language. A pointer allocated by Rust's allocator can't be garbage-collected by the JVM; hand a C-allocated buffer to Python and its GC has no idea how big the thing is and no business calling `free()` on it anyway. Skip the explicit rule and you get a permanent leak or a double free — take your pick, the language boundary doesn't care which.

**Options:**
1. **Caller allocates** — the high-level language allocates a buffer and passes a pointer in; the native library fills it
2. **Callee allocates (opaque pointers)** — the native library allocates internally and returns an opaque pointer; the caller must later pass that exact pointer to a library-provided free function

**Trade-offs:**
- *Caller allocates:* memory stays entirely inside the calling language's own GC domain, killing cross-boundary leak risk outright — but the caller has to know the size in advance, which for dynamically sized data usually costs two FFI calls instead of one: ask for the size, then hand over the buffer.
- *Callee allocates:* information hiding survives completely — the caller never has to learn the struct's size or layout — but now the caller has to track that pointer's entire lifecycle perfectly; let its own GC drop the reference before calling the native free function, and that memory is gone for good, quietly, with nothing to flag it.

**When to choose each:**
- *Caller allocates:* strings, flat byte buffers, predictably sized numeric arrays.
- *Callee allocates:* complex domain objects, state machines, connections — anything where size or layout shouldn't leak to the caller, paired with an explicit `LibraryName_Free()`.

**Common failure modes:**
- **The cross-allocator free:** a C++ library allocates an object and hands it back; a consumer frees it with plain C `free()` instead of `delete`, or worse, with an entirely different runtime's allocator — a different `.dll`'s C runtime, say. Heap metadata corrupts without a sound, and the application keeps limping along on corrupted state for hours before finally crashing somewhere that looks completely unrelated.

**Example:** SQLite's C API is the reference case for doing ownership right. `sqlite3_prepare_v2()` allocates internal state and hands back an opaque `sqlite3_stmt*` — the caller never allocated it, so the contract demands passing that exact pointer to `sqlite3_finalize()` when finished with it. Python's `sqlite3` standard-library module just wraps this directly: a Python object's `__del__` calls `sqlite3_finalize()` on its own, translating an explicit C ownership contract into something that looks, from the Python side, like ordinary garbage collection doing its job.

---

## Error Handling Across FFI Boundaries

**What it is:** The mechanical translation of failure across a boundary that cannot physically propagate exceptions, panics, or stack unwinding.

**Why it exists:** Exceptions are a language runtime feature, not something the hardware ever agreed to. Let a C++ exception or a Rust `panic!` try to unwind the stack across an `extern "C"` boundary into a runtime with completely different unwinding mechanics — Python, Node's V8 — and the result is undefined behavior, which in practice means an immediate, unceremonious crash.

**Options:**
1. **Return codes + out-parameters** — the function returns a primitive status integer; the actual result is written into a pointer the caller provided
2. **Thread-local error state** — the function returns a null/sentinel value on failure, and the caller separately queries a thread-local function (`getLastError()`) for the details

**Trade-offs:**
- *Return codes + out-parameters:* mathematically safe, entirely stateless, and every language on the planet supports it — but genuinely unpleasant to write against; calls don't compose, and every call site needs its own mutable out-pointers plus an `if (res != 0)` check nobody enjoys typing.
- *Thread-local error state:* the function signature gets to return the actual data, which reads far more naturally on the page — but it leans on hidden mutable state behind the scenes. Forget to check it, or slip in another FFI call before you do, and the error's been silently overwritten and is simply gone.

**When to choose each:**
- *Return codes + out-parameters:* the universal, safe default for low-level native bindings.
- *Thread-local error state:* only when integrating deeply into a runtime that already enforces this pattern globally.

**Common failure modes:**
- **The cross-boundary panic:** a native math library written in Rust exposes `extern "C"` division but never catches a divide-by-zero panic. The host — a Node.js backend, say — passes a zero, Rust panics and tries to unwind the stack straight across the V8 boundary, and the entire server process segfaults instantly, taking every concurrent request it was serving down with it, because of one unhandled failure in one native call nobody thought to guard.

**Example:** CPython's C API leans on thread-local error state: a failing C extension returns `NULL` and calls `PyErr_SetString()` first; the interpreter checks the thread-local indicator the moment it sees `NULL` and raises the matching Python exception. SQLite goes the other way entirely, relying on return codes across the board — nearly every call returns an `int` like `SQLITE_OK`, `SQLITE_BUSY`, or `SQLITE_ERROR`, with no hidden state lurking anywhere. **[Strong Recommendation: default to return codes and out-parameters; reserve thread-local error state for integrating into a runtime that already mandates it]**

---

## Why Smart Engineers Disagree: "Thick" vs. "Thin" Bindings

The sharpest disagreement in FFI design comes down to how much abstraction the binding layer in the host language ought to provide.

Engineers optimizing for native performance and mechanical transparency argue for thin bindings: the host-language layer should map 1:1 onto the C functions, no more. If the C library needs three calls to initialize a struct, the Python developer makes those exact three calls with raw pointers, full stop. Wrapping it in Pythonic classes, to them, just hides the true cost of every allocation and makes debugging the actual C mechanics nearly impossible when something eventually goes wrong.

Engineers optimizing for developer velocity and safety argue for thick bindings instead: forcing application developers to manage raw pointers and call `free()` by hand is a guaranteed leak-and-segfault factory. The FFI boundary should translate raw C structures into native, garbage-collected host objects immediately, treating the C ABI as hostile territory to be aggressively hidden behind idiomatic classes and automatic destructors.

The resolution is to build both, kept in strict isolation rather than smushed into one layer. First, a purely mechanical, unsafe, 1:1 thin binding — often literally named a `sys` module or crate — that mirrors the C ABI exactly and carries no logic of its own. Then, a thick, idiomatic wrapper built on top of that thin layer, which is what application code actually touches — fully insulated from the FFI mechanics, with an escape hatch back down to the thin layer for the rare hot path that needs to bypass the wrapper's overhead. Try to make the FFI layer itself idiomatic and you get a boundary too slow for systems work and too unsafe for application work, simultaneously. The two goals only survive as separate layers. They don't survive as one.

*Concepts expanded in later chapters: the broader practice of writing unsafe or low-level code (Part IV, Ch 33); concurrency and threading across a language boundary (Part X).*
