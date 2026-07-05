# Part VI — Engineering Process

## For My Wife

A neighborhood potluck runs on one unglamorous piece of paper: a sign-up sheet. Everyone writes down what they're bringing before the day arrives. Nobody calls six other households to double-check nobody else is bringing mac and cheese. Nobody shows up assuming somebody else has dessert covered. The sheet isn't the point of the potluck. It's just the reason forty people can coordinate a meal without a single phone call between them.

**Parts II through V were about the things engineers actually build** — services, contracts, files, tests. This part is about how more than one person builds any of it together without constant conversation. An issue is the sign-up sheet for a piece of work: what's actually being brought, claimed once, visible to everyone. A pull request is the moment somebody else looks at what showed up before it goes on the table. None of this is bureaucracy for its own sake — it's the minimum structure that lets people who don't share a house, or a desk, trust that the potluck won't end with three mac-and-cheeses and no dessert.

**Skip the sign-up sheet, and it doesn't mean less work.** It means the same coordination has to happen anyway, through memory and assumption instead of a shared piece of paper — and memory is the thing that quietly fails first.

## For My Kids

For a class project, five kids split up the jobs: one researches, one draws the poster, one writes the script, one practices the presenting, one keeps track of time. Somebody writes the list on the whiteboard so everyone can see who's doing what.

**Without that list, weird things happen.** Two kids research the same thing and nobody draws the poster. Or everyone assumes someone else is timing the practice, and nobody actually does.

The list isn't the fun part of the project. Nobody's proud of a whiteboard. But it's the one thing that lets five kids split up a big job without everybody needing to check in with everybody else every five minutes.

**Skip the list, and the work doesn't get easier — it gets messier**, in exactly the way five kids working from memory and good intentions instead of one shared list usually turns out to be.

---

Parts II through V were about artifacts — services, contracts, files, tests. This part is about the coordination layer that decides how those artifacts actually get built by more than one person: how work gets recorded, planned, reviewed, and eventually judged not worth doing at all. Every chapter here answers the same underlying question in a different arena — what's the minimum structure that lets independent people trust each other's work without a conversation for every decision?

Chapters 42 and 43 establish the two units this part keeps returning to: the issue as a shared record of intent, and the PR as a bounded unit a human can actually review, with a deliberately one-to-many relationship between them. Chapter 44 zooms out from a single unit of work to a plan built from many of them, and its walking-skeleton argument — build a thin slice through every layer first, thicken it later — is Chapter 34's testing-pyramid logic from Part V applied to project sequencing instead of test allocation: surface integration risk early, while it's still cheap to fix. Chapters 45 and 46 are both about capturing a decision before it's lost — an ADR after the fact, a spec before it — and both apply Chapter 9's reversibility-and-blast-radius framework from Part I directly: the weight of the record has to match the weight of the decision, or you get either theater or silence where a real conversation should have happened.

Chapter 47 is where issue and PR meet an actual second reader, and it reframes review's real value as code health and shared ownership rather than defect-catching, since types and tests already catch most defects on their own. Chapter 48 takes on the term this part's chapters get invoked to justify more than any other — technical debt — and insists on Cunningham's original, narrower meaning: a deliberate, tracked trade-off, not a synonym for code somebody doesn't like. Chapter 49 closes by turning this part's own lens on itself, arguing that every process described in the preceding seven chapters is only justified for as long as it keeps answering a real, current risk — and that the failure to ever ask that question again, not the process itself, is what turns useful coordination into overhead nobody remembers agreeing to.

Part VII takes the artifact this part has been building toward — a reviewed, merged PR — and follows it the rest of the way to production.
