# Part IV — Code Organization

## For My Wife

A matryoshka doll opens to reveal a smaller doll built exactly the same way — same proportions, same painted face, same seam running around the middle — all the way down to the smallest one that doesn't open at all. Nobody redesigns the concept at each size. The same idea just keeps repeating, smaller.

Parts II and III worked at the scale of a whole system: which service owns what, what a contract between two of them looks like. This part shrinks the lens all the way down to a single file, a single name, a single comment — and the argument is that none of that changes what actually matters. The same discipline that keeps a company's departments from stepping on each other's work is the same discipline that keeps one file from turning into a drawer everything gets shoved into. It's one idea, nested inside itself, all the way to the smallest piece anyone actually touches.

**What's easy to miss is that the smallest doll matters as much as the biggest one.** A single confusingly named variable, a comment that's quietly stopped being true, a file that became five unrelated things because nobody wanted to make a second file — none of it looks like an architecture problem. Each one is just as real as a badly drawn service boundary, only small enough that it's tempting to wave off as not worth the fuss. It's the same fuss. It's just wearing a smaller doll.

## For My Kids

Ever seen a nesting doll — you open the big one and there's a smaller doll inside, painted the exact same way, and inside THAT one is an even smaller one, same design, all the way down to a tiny one that doesn't open?

**That's this whole part, in one toy.** Whatever rule makes a big thing organized also makes the smallest thing inside it organized, the exact same way, just smaller.

The same rule that keeps a giant toy box from turning into one big dumping ground also applies to a single small pencil case. Sort things by what they're actually for — not by "junk that didn't have a home" — and it works whether it's a whole room or one drawer.

**Skip it at the small size, and it comes back to bite you anyway.** A messy pencil case is annoying for one kid, for one class. But it's the exact same mistake as a messy room, just wearing a smaller doll — and it costs you the same ten minutes of searching either way.

---

Parts II and III worked at the scale of services and contracts. This part shrinks the lens to the smallest unit an engineer actually touches day to day — a file, a name, a comment, a single `if unsafe` block — and argues that the same structural discipline applies at every scale, all the way down.

Chapter 27 opens with the claim the rest of the part builds on: a file tree isn't storage, it's the physical enforcement mechanism for the architectural boundaries Part II spent nine chapters establishing. Package-by-feature versus package-by-layer is Chapter 11's hexagonal ports-and-adapters distinction, reapplied to a directory listing instead of a dependency graph. Chapter 28 takes that same idea to the level of a single identifier, treating a name as the cheapest form of information hiding available — free of the indirection or runtime cost every other technique in this book charges. Chapter 29 answers the question those first two chapters raise but don't settle: given a boundary, how much should actually live inside it? The answer — split on falling cohesion, never on rising line count — is Chapter 3's cohesion concept from Part I, applied at the grain of an individual file for the first time.

Chapters 30 and 31 are both about a cost that's easy to underestimate because it's paid by a reader, not a machine: the tax of anything standing between code and the person trying to understand it, whether that's a comment that's drifted out of sync or an abstraction with no second implementation to justify it. Chapter 31 in particular is the chapter every "just add an interface for it" instinct in this book gets checked against — indirection is not free, and an abstraction that hides nothing just doubles the type count.

The last two chapters are where this part's structural discipline meets the language runtime itself. Chapter 32 asks how a single process should represent failure, and settles the exceptions-versus-error-values debate on a distinction the wire-level version of this same argument, back in Chapter 21, already established: operational failures get one treatment, exceptional ones get another. Chapter 33 closes the part at its least forgiving edge, where the compiler stops verifying correctness altogether — the direct precursor to Chapter 26's FFI boundary in Part III, and proof that the same wrap-the-danger-in-a-safe-core discipline this part has been arguing for all along still holds even where the compiler can no longer enforce it.
