# Part I — Systems Thinking

You're starting at the beginning because there isn't a version of this book that works out of order. Every later part — architecture, APIs, testing, concurrency, performance — is really the same handful of ideas applied to a new surface: what is this trading off, what did that trade-off cost somewhere else, and who has to live with it. Those ideas don't have a natural home in any single downstream topic, so they get established once, here, before any of the "real" decisions start.

That's a different goal from most of what follows. Later parts are organized around decisions: monolith or services, REST or RPC, mock or real dependency. This part is organized around the vocabulary those decisions get made in. Reading it doesn't teach you a technology. It teaches you what question you're actually answering when you reach for one.

The throughline is that every non-trivial engineering choice is a trade-off, and most of what looks like technical disagreement is really a disagreement about which trade-off should win — not about who understands the system better. Chapter 1 makes that claim directly: systems optimize multiple objectives at once, those objectives compete, and naming the one you're prioritizing matters more than being right about which one to pick. Everything else in the part is that idea, examined from different angles. Chapter 2 identifies complexity as the actual enemy — not scale, not bad luck — and separates the kind you can remove from the kind you can't. Chapters 3 and 4 give you the vocabulary for structure: coupling, cohesion, and abstraction, including the uncomfortable fact that abstractions are guesses about the future and guesses are sometimes wrong. Chapter 5 turns that into a design stance — decide what's allowed to change, and lock down the rest on purpose, instead of by accident. Chapter 6 grounds all of it in physics: a network call is not "a bit slower" than a memory read, and pretending otherwise is where a lot of theoretically-clean designs go to die. Chapter 7 does the same for failure, arguing that reliability is a structural property, not something you retrofit with better monitoring. Chapter 8 zooms out to show that a system optimized part-by-part can still get worse overall — the whole point at which "local reasoning" quietly stops working. Chapter 9 closes the part with the question underneath all of it: given that you can't get every trade-off right, how much time does any single decision actually deserve?

None of this is abstract for its own sake. Every concept here gets used, by name, in a part you haven't read yet — Chapter 2's complexity sources come back in code organization, Chapter 6's latency hierarchy comes back in performance, Chapter 8's Little's Law comes back in concurrency. Read this part with the expectation that you're not learning theory, you're loading the vocabulary the rest of the book assumes you already have.

If you read only one part, read this one. The vocabulary and concepts introduced here are assumed throughout Parts II–XII.

---

## Chapters

| Chapter | Title | Status |
|---------|-------|--------|
| Ch 01 | What Engineering Actually Optimizes | [Complete] |
| Ch 02 | Complexity Is the Enemy | [Complete] |
| Ch 03 | Coupling and Cohesion | [Complete] |
| Ch 04 | Abstraction and Information Hiding | [Complete] |
| Ch 05 | Designing for Change | [Complete] |
| Ch 06 | Cost Models and Mechanical Sympathy | [Complete] |
| Ch 07 | Reliability as a Design Principle | [Complete] |
| Ch 08 | Local vs. Global Optimization | [Complete] |
| Ch 09 | Decision Frameworks for Trade-offs | [Complete] |

---

## Prerequisites

None. This is the entry point.

## What This Part Establishes

- A shared vocabulary for reasoning about complexity, coupling, and abstraction
- The primary cost dimensions engineers optimize for (and the tensions between them)
- A framework for making decisions under genuine uncertainty
