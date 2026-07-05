# Part V — Testing Strategy

## For My Wife

Before a long road trip, you don't just check that the gas tank is full and call the car "inspected." You check the tires separately from the oil, the oil separately from the brakes, the brakes separately from the headlights — because a full tank tells you nothing about worn brake pads, and new tires say nothing about a headlight that's about to die on a dark highway.

**Part IV argued code should be organized so nobody has to hold the whole system in their head at once.** This part asks the same question about confidence: how do you trust that something works without re-checking all of it, every time, from scratch? The answer is that different checks catch different problems, and none of them substitutes for the others. A test that confirms one small piece behaves correctly on its own tells you nothing about whether all the pieces cooperate once they're actually running together — the same way confirming the tires are fine tells you nothing about the brakes.

**The costly mistake isn't skipping a check.** It's running one check, feeling thoroughly reassured, and quietly assuming it covered ground it never touched — the equivalent of driving off confident about the brakes because you remembered to check the tires.

## For My Kids

At a check-up, the doctor doesn't just look in your ears and call the whole visit done. Ears, then eyes, then a blood pressure cuff — three completely different checks, because a perfect ear exam tells the doctor exactly nothing about your eyes.

**That's this whole part.** Different checks catch different problems, and acing one doesn't mean the others are fine too.

Some kids think if they got 100% on the spelling test, math must be fine too. It isn't. They're different subjects, checked in different ways, and one score never speaks for the other.

**The mistake that trips people up most** isn't forgetting to check something. It's checking ONE thing carefully, feeling totally sure of yourself, and forgetting that being right about ears says nothing at all about eyes.

---

Part IV argued that code should be organized so a reader can reason about one piece without loading the whole system into their head. This part asks the same question about verification: how do you gain confidence in a system without re-running the entire thing for every change? The answer running through all eight chapters is that different tests buy different, non-substitutable kinds of confidence, and spending them in the wrong place is a resource allocation mistake, not a stylistic one.

Chapter 34 sets the shape everything else refines: push verification as low as the architecture allows, because a failing end-to-end test tells you something broke without telling you where. Chapter 35 turns that shape into a placement rule — reusing Chapter 11's ports-and-adapters distinction from Part II to decide, concretely, which layer owns which kind of test — and lands on the chapter's sharpest reframe: difficulty writing a unit test is a signal about the design, not the test. Chapter 36 is the mechanics of what a test actually replaces, insisting on a taxonomy (dummy, stub, spy, mock, fake) most engineers collapse into one word, because mocks and fakes buy fundamentally different kinds of confidence — interaction versus state — and confusing them is how a refactor-proof suite quietly turns into one that breaks on every internal change. Chapter 37 is the discipline underneath all of it: fixture bloat isn't a maintenance failure to manage more carefully, it's the structurally inevitable result of ever building a shared mutable fixture for data that should have been constructed fresh.

The last four chapters are about the edges of what a test suite can and can't tell you. Chapter 38 introduces property-based testing as a way to strip out the confirmation bias baked into every example a human thinks to write by hand. Chapter 39 draws the boundary this part has been implicitly assuming throughout — a test suite has its own complexity budget, and a test that verifies a framework instead of your own logic is spending that budget for zero marginal confidence. Chapter 40 is the smallest-grain application of Chapter 28's naming argument from Part IV: a test's name is written for the worst moment it will ever be read, a failing CI log with no source file open. Chapter 41 closes the part on the metric every team eventually mistakes for the goal itself — coverage proves code ran, never that its behavior was checked, and treating it as a mandatory gate reliably produces Goodhart's Law in miniature.

Read together, this part argues that a test suite is judged the same way any other system in this book is: by whether its cost is proportional to the confidence it actually buys, not by how large or exhaustive it looks.
