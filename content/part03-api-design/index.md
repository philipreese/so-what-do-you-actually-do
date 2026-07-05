# Part III — API Design

## For My Wife

A restaurant's printed menu is a promise, not a suggestion. Order the Tuesday special this week, and order it again next year, and you're trusting it's still roughly the same dish — not because the kitchen signed a contract, but because that's what a menu item *is*: a name you can rely on without having to ask what's actually in it every single time.

**Part II decided where the walls of the building go.** This part is about the menu handed to everyone standing on the other side of the counter — the actual thing a customer reads, orders from, and plans their whole visit around. Change what's inside a dish without changing its name on the menu, and nobody official broke a rule. Every regular who ordered it expecting the usual still got a surprise they didn't ask for, and won't necessarily forgive.

The chapters here work through what a trustworthy menu actually requires: whether you're describing a dish (facts) or an instruction the kitchen carries out (a request), what a customer should be told when the fryer's out, how to survive an order the waiter forgot he already put in. All of it is the same warning, worked out from different angles: **the menu is the actual commitment.** Not the kitchen, not the chef's intentions, not what the dish used to be. What's printed and handed to a stranger is the promise everything else has to keep.

## For My Kids

Say there's a vending machine at school with a button, B4, that's given out the same bag of pretzels for as long as anyone remembers.

Every kid who presses B4 is trusting that button to mean pretzels. Not "probably pretzels." Pretzels.

**Now say someone restocks the machine with pretzel-flavored crackers instead** — different bag, same button, no note taped to the front. Nobody did anything against the rules. The machine still takes your money. It still gives you something. But every kid who trusted B4 just got fooled, and didn't get a say in it.

This part is about what it actually takes to be a trustworthy vending machine — not just today, but for every kid who presses the same button next year without checking first.

**The rule underneath all of it:** if you're ever going to change what's behind a button, you don't get to keep calling it the same button. Somebody, somewhere, built their whole afternoon around trusting what it said.

---

Part II decided where boundaries go and what governs a service's dependencies; this part is about the contract at those boundaries themselves — the actual thing a consumer reads, calls, and depends on for years. Every chapter here operationalizes Chapter 15's rule from Part II: every exposed field is a permanent commitment. This part is where that abstract warning turns into eight concrete decisions about what the commitment looks like.

The order tracks a request from its first design decision to its least forgiving edge case. Chapter 19 asks the ontological question first — is this API nouns with state, functions to invoke, or facts that already happened — because REST, RPC, and event-driven quietly answer questions about coupling and evolvability that nobody explicitly voted on. Chapter 20 takes REST's answer and works out what a "resource" actually is in a real domain, not a database table wearing a URL. Chapters 21 and 22 are the two disciplines every API needs regardless of which ontology it picked: a structured way to fail (Ch 21) and a way to survive being called twice (Ch 22), the second of which only matters because Chapter 17's at-least-once delivery, back in Part II, ruled out anything cleaner. Chapter 23 is the same idea applied to results too large for one response, and it's the first chapter in this part to reach back past API design entirely, to Chapter 6's sequential-versus-random I/O cost from Part I.

The back half is about who's on the other end of the contract. Chapter 24 draws the line between two checks — who you are and what you're allowed to do — that get enforced in structurally different places, and it's the direct ancestor of everything Part XI's security chapters build on. Chapter 25 makes the argument this part has been building toward all along: what makes an API "external" was never the network, it's whether you can coordinate with whoever's depending on it, and Hyrum's Law guarantees that every observable behavior of a popular-enough API eventually becomes somebody's dependency, intended or not. Chapter 26 closes the part with a deliberate register change, trading the network boundary every other chapter assumes for a language boundary with no timeout, no retry, and no graceful degradation — the same information-hiding argument from Chapter 4, pushed to the one place in this book where getting the contract wrong doesn't return an error code, it crashes the process.

Read in order, these eight chapters are a single argument: an API is not the code that implements it, it's the promise a consumer is allowed to build on — and every decision in this part is really a decision about how expensive that promise is to keep.
