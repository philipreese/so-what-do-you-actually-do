# Part II — Software Architecture

## For My Wife

Before a contractor frames a single wall, they settle where the walls actually go — which one holds up the roof, which one can move later if you want a bigger kitchen, where the one shared hallway connects every room to every other room. Get that decided badly, and no amount of nice paint in the rooms afterward fixes it. You'd be repainting a house whose rooms were never really rooms, just space that happened to end up on either side of a wall nobody thought hard about.

That's this part. Part I handed over words like coupling and cohesion; this is the first place those words get spent on an actual decision — where the walls of a system go, and what's allowed to depend on what. Should this be one big open floor plan or several separate rooms with doors? Once that's decided, every room built afterward inherits it. A hallway placed badly doesn't announce itself on day one. It shows up two years later, when someone wants to add a room and discovers the only way in runs straight through the nursery.

The chapters in this part are one continuous argument, not eight separate ones: where a wall goes, and what it costs to be wrong about it. A wall drawn in the wrong place doesn't just complicate the room next to it — it complicates the resale value of the whole house, whether anyone in it ever wanted to be a real-estate expert or not.

## For My Kids

Before anyone touches a saw, you draw the blueprint for the clubhouse first. Where the walls go. Where the one door is. Whether it's two rooms or one big room with a curtain.

**This part is the blueprint stage**, not the building stage. Nobody's hammering anything yet.

Skip the blueprint and go straight to nailing boards together, and you find out the hard way — usually after it's built — that you put the only door on the side facing the neighbor's yard instead of your own.

Once the blueprint is drawn, it's expensive to change. Moving a wall after the clubhouse is standing means tearing out something that already works, just to fix something nobody checked before the first nail went in.

**A clubhouse with the door in the wrong spot doesn't fall down.** It just quietly makes every day inside it a little more annoying than it needed to be, for as long as the clubhouse stands.

---

Part I gave you the vocabulary — coupling, cohesion, abstraction, the latency hierarchy, partial failure. This part is the first place that vocabulary gets spent on a real decision: how do you carve a system into pieces, and what governs how those pieces talk to each other and own their data?

The part moves in a specific order, and each chapter hands the next one a settled question. Chapter 10 asks the biggest structural question first — should this be one deployable unit or many — and its answer (mostly: stay a monolith until a named constraint forces the split) sets up everything that follows. Chapters 11 and 12 are then about the unit itself, because once a service exists, its internal dependency direction matters independent of anything downstream. Hexagonal architecture and the Dependency Inversion Principle in those two chapters are the same idea — information hiding (Ch 04) applied structurally — approached from a design-pattern angle and a mechanism angle respectively, so read them together. Chapter 13 takes coupling and cohesion, first defined in Chapter 3, and re-derives the stakes when they cross a network boundary instead of a function call. Chapter 14 asks when any of this is worth its cost at all, since a layer is a bet, not a virtue.

The back half turns from structure to interface. Chapter 15's rule — every exposed field is a permanent commitment — is the idea Part III spends eight chapters operationalizing into REST, RPC, and event contracts; if you only read one chapter before starting Part III, make it this one. Chapter 16 is what happens after the surface ships and has to change. Chapter 17 reframes synchronous versus asynchronous communication as a question about temporal coupling rather than speed, the same lens Chapter 13's bounded contexts need to make sense of event-driven decoupling — and it's also where Part X's concurrency chapters pick the thread back up, at the level of a single process instead of a network. Chapter 18 closes the part by asking who owns the data once the system is no longer one thing, and its answer — ownership follows lifecycle, not usage — is the chapter every service boundary decision in this book eventually gets checked against.

None of these are independent choices. A monolith decomposed along the wrong seam (Ch 10) produces the shared-database anti-pattern (Ch 18) no matter how carefully the API surface (Ch 15) is designed on top of it. This part's chapters are best read as one continuous argument about where a boundary should go and what it costs to be wrong about it, not as six unrelated topics that happen to share the word "architecture."
