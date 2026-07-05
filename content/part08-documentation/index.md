# Part VIII — Documentation

## For My Wife

Every family ends up with a shoebox, or a drawer, for the papers that actually matter — the passport, the house deed, the insurance card. Nobody files every receipt that crosses the kitchen counter. The filing itself isn't the discipline; deciding what's actually worth keeping is. And even inside that shoebox, the deed and the insurance card aren't the same kind of paper: the deed is frozen the day you signed it, a record of a decision made once. The insurance card has to stay current, or it's actively lying to whoever reaches for it in an emergency.

**By this point in the book, a reader has spent seven parts learning to make the everyday stuff explain itself** — clear names, a sensible layout, comments only where something can't otherwise be said. This part exists to admit that some information will never fit inside any of that, no matter how well it's organized, and to take that leftover information as seriously as everything else in the book. Not everything belongs in the shoebox. But what does belong there deserves the same care as anything else worth keeping.

**The costly version of this mistake isn't writing too little.** It's writing an ordinary receipt as if it were the deed — filing something that needed no permanence at all, until nobody can tell the shoebox's one true record from the pile of things that just happened to get saved.

## For My Kids

Everybody's got a box under the bed — not for every worksheet that ever came home from school, just the stuff that actually matters. A report card. One really good drawing. A note somebody wrote you.

**Not everything goes in the box.** Most school papers get recycled the same day, and that's fine — they did their job already.

But even inside the box, two things aren't the same kind of keep. A photo from your birthday is done — it's exactly what it was that day, forever, and nobody expects it to update. The class supply list taped inside your backpack is the opposite: it only works if it still says what's actually true this week.

**Mixing those two up is the actual mistake.** Treat a photo like it needs updating and you ruin it. Treat this week's supply list like an old photo — never checked again — and you show up to school without the one thing you needed.

---

By this point in the book, a reader has spent seven Parts learning to make code self-explanatory: clear naming (Ch 28), file structure that mirrors the domain (Ch 27), comments reserved for the WHY a diff can't say (Ch 30). Part VIII exists to draw the boundary around that effort — to say plainly that some information will never fit inside the code no matter how well it's organized, and to give that remaining information the same rigor the rest of the book gives everything else. The Part assumes the code-quality instincts of Part IV and the systems-thinking vocabulary of Part I (complexity as the enemy, Principle 6's proxy-metric warning); what it hands off is a working taxonomy for every kind of written artifact a team produces about its own system.

Ch 64 opens with the harder discipline: treating external documentation as a last resort rather than a default, because every page carries an ongoing documentation tax whether or not it turns out to be worth writing. Ch 65 then sorts what survives that filter into a small number of categories, using two axes — who's reading, and whether the artifact must track today's reality or is allowed to freeze a past decision. That living-document-vs.-point-in-time distinction is the spine of the rest of the Part: Ch 66 is entirely about the discipline living documents demand (co-locating documentation with the code review that changes it, per Principle 8, and treating a documentation corpus as vulnerable to the same write-only rot Ch 42 diagnosed in issue trackers), while Ch 65 already established that a spec or ADR going stale after implementation starts isn't a bug to fix.

Ch 67 and Ch 68 each take that general taxonomy and specialize it for a reader under pressure. Ch 67 argues that for an API consumer — often without access to the implementation, sometimes outside the organization — documentation isn't supplemental, it's the interface itself, and it revisits Hyrum's Law from Ch 25 to explain why an explicit non-guarantee is a defense mechanism, not just a courtesy. Ch 68 does the same for the on-call responder, arguing a runbook only earns trust by being rehearsed, the same false-confidence trap Ch 41 named for coverage metrics — and it deliberately defers to Part IX for what triggers a responder to open the runbook in the first place (alerting, Ch 71) and what the runbook ultimately protects (an SLO or error budget, Ch 73). That handoff is the throughline out of this Part: Part VIII establishes how to write down what a system does and why; Part IX picks up how to watch what it's actually doing right now.
