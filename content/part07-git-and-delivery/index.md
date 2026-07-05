# Part VII — Git and Delivery

## For My Wife

A piece of pottery doesn't get rebuilt from scratch at every stage. The same lump goes onto the wheel, then into the glaze, then into the kiln, then onto the shelf — one continuous object, picking up a mark at each stop it never has to earn twice. A crack in the glazing means you fix the glazing, not restart the whole piece from wet clay.

**Part VI settled how work gets recorded, planned, and reviewed.** This part picks up exactly where a decision gets approved and follows it the rest of the way to something real — through the history it leaves, the checks that validate it, and the release that finally puts it in someone's hands. Fourteen chapters is the longest stretch in this book, but it's one piece moving through one continuous set of stations, not fourteen separate crafts.

**The one thing every stage of this part agrees on:** the object should never have to start over. A history rewritten out from under someone, a check that has to be repeated from nothing every time, a release built fresh for every place it ships — all of it is the same mistake, dressed differently: treating something that already survived one stage as if it hadn't.

## For My Kids

A birthday cake doesn't get made three separate times — once for mixing, once for baking, once for frosting. It's the same cake, going through three different stations, picking up something new at each one: batter, then heat, then frosting. Nobody throws it out and starts over between stops.

**This part is those stations, one after another.** How the cake gets mixed (the history it leaves behind), how it gets checked before it's done (does it pass the toothpick test), and how it finally makes it to the actual party.

Imagine if the frosting station scraped the cake down to nothing and started with a fresh bowl of batter, every single time. You'd never get to the party. The whole point of stations is that each one builds on what the last one already did.

**A cake that has to restart at every station never becomes a cake.** It just becomes batter, forever, in a very tired kitchen.

---

Part VI settled how work gets recorded, planned, and reviewed. This part picks up exactly where a PR gets merged and follows that change the rest of the way to production — through the branch it lived on, the history it leaves behind, the pipeline that validates it, and the release that finally ships it. Fourteen chapters is the longest run in this book, but they trace one continuous path, not fourteen separate tools.

The first six chapters are about the history a team leaves in its wake. Chapter 50 opens with the argument the rest of the part keeps returning to in different forms: every one of these decisions is really about *when* a cost gets paid, not whether it exists — trunk-based development pays integration risk continuously and in small amounts, the same logic Chapter 44's walking skeleton applied to planning in Part VI. Chapters 51 through 55 apply that same when-does-the-cost-land question to commits, PR history, branch names, force pushes, and rebases — and Chapter 54's reframe, that a branch is only "private" until a second person depends on it, is the load-bearing idea Chapter 55 builds on directly. Chapter 56 closes this stretch by separating the tag as a mechanical artifact from the version-string promise Chapter 16 already covered back in Part II, a distinction worth holding onto since it's easy to conflate the two.

Chapters 57 through 60 shift from history to the pipeline itself, and Chapter 57 reaches back to reuse Chapter 34's feedback-loop-latency argument from Part V directly: CI's job is to be cheap, fast, and deterministic, not maximally thorough. Chapter 58 asks where fail-fast actually belongs inside that pipeline — a different answer at the stage level than across parallel checks — and Chapter 59's caching chapter is this part's sharpest warning: a cache keyed wrong doesn't just slow a pipeline down, it makes CI lie, passing for the wrong reason. Chapter 60's matrix builds are the multiplicative cost every one of the preceding pipeline decisions gets paid across, once instead of many.

The final three chapters are where all of it converges into an actual release. Chapter 61 mechanizes everything Chapters 51 and 56 established — commit discipline and tags — into automation that's only as trustworthy as the discipline feeding it. Chapter 62 draws the line release automation stops at: build once, promote the identical artifact everywhere, and let only configuration vary. Chapter 63 closes the part on the dependency graph underneath every build in it, arguing that reproducibility was never optional — it's the property every other chapter in this part has been quietly assuming the whole time.
