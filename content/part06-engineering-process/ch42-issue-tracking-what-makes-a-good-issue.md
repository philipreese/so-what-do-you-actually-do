# Ch 42 — Issue Tracking: What Makes a Good Issue

*A theme is not an issue if it never gets to close.*

An issue is a shared engineering artifact, not a personal reminder, and it should contain enough context that someone other than its author can complete the work without a clarification thread. Stating the problem before the solution — "cache invalidation serves stale reads after writes" instead of "replace Redis with Postgres" — preserves the freedom to discover a better fix during implementation. Acceptance criteria convert "done" from an opinion into something another engineer can verify independently, and without them issues reopen because people disagree about what was actually promised. An issue with no natural completion point is a theme, not an issue, and will sit open indefinitely.

**Prerequisites:** [What Engineering Actually Optimizes](../part01-systems-thinking/ch01-what-engineering-optimizes.md), [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md), [Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md), [Comments: What to Comment, What Not To](../part04-code-organization/ch30-comments-what-to-comment-what-not-to.md)

**New vocabulary introduced:** theme, write-only tracker

**Key takeaways:**
- An issue is a shared engineering artifact, not a personal reminder. It should contain enough context that someone other than its author can complete the work without a clarification thread.
- State the problem before the solution. Recording "cache invalidation serves stale reads after writes" instead of "replace Redis with Postgres" preserves the freedom to discover a better fix during implementation.
- Acceptance criteria convert "done" from an opinion into something another engineer can verify independently. Without them, issues reopen because people disagree about what was actually promised.
- Bugs, features, and chores are different contracts with different required information and different definitions of done. Treating them as one generic type loses information a triager needs.
- One issue should represent one unit of work that can close. An issue with no natural completion point — "improve performance," "clean up the codebase" — is a theme, not an issue, and will sit open indefinitely.
- Creating issues is cheap; maintaining the collection is not. A backlog that is never pruned decays into a *write-only tracker* — closing an issue as "won't do" is a legitimate outcome, not a failure.

## For My Wife

> *A ticket that says "the search is broken" and a ticket that says "search returns zero results when a product name contains an apostrophe" aren't the same amount of work to read — but only one of them can actually be handed to somebody else.*

**A good work ticket is basically a grocery list you're leaving for someone else to shop from, not a note only you could decode.** "Get stuff for dinner" means nothing to whoever picks up the list — they don't know what dinner is, what you already have, or what counts as done. "Two pounds of chicken thighs, skin on, from the meat counter" means the same thing to anyone who reads it, and you can both look in the cart afterward and agree, with no argument, whether the job got done. This chapter's core advice does the same thing for engineering tickets: describe the actual problem, not the fix you've already guessed at, and say exactly what "finished" looks like, so two different people don't end up quietly disagreeing later about whether the work is really over.

**The other trap is the chore that never has an end.** "Clean the garage" sits on a to-do list for years, because there's no moment where it's obviously, checkably done — you can always find one more shelf. "Sort and label the tools in the left cabinet" has an actual finish line. A ticket needs the same thing. If nobody can point to the moment it's over, it isn't a task yet — it's a wish, and wishes sit open forever, cluttering the list until nobody trusts the list at all.

## For My Kids

### The Door That Didn't Need Replacing

Say your bedroom door won't shut all the way, and you tell your dad "we need to buy a new door." He spends an afternoon and real money on a new door — and it turns out the actual problem was one bent hinge a wrench could've fixed in five minutes. You didn't tell him the problem. You told him your guess at the fix, and that guess is the only thing that ever got considered.

**"My door won't shut all the way" is a completely different request.** It tells him what's actually wrong and lets him find the real fix — hinge, warped wood, whatever it turns out to be — instead of locking in your first guess before anyone's even looked.

**Then there's the other trap: asking for something with no actual finish line.** "Clean your room" can go on forever — there's always one more thing to straighten, so it never feels done, and you can argue about it for years. "Put the clean laundry from the chair into your dresser" has a real ending: you can both look at the chair, see it's empty, and agree it's actually finished.

**Good requests do both things at once:** they describe the real problem instead of a guessed-at fix, and they have a moment where anyone can look and say "yep, that's done" — not a vague hope that just sits there, half-finished, forever.

> [!CAR]
> Think of a time you asked for help fixing something and described the fix you thought was needed instead of what was actually wrong. How did that turn out?

---

An issue is the smallest planning artifact in an engineering process: a description of work that someone can understand, perform, verify, and close, ideally without anyone getting paged for clarification. Every larger construct in this Part — the pull request in [Ch 43](ch43-issue-as-tracking-unit-vs-pr-as-review-unit.md), the milestone in [Ch 44](ch44-milestone-and-phase-planning.md) — is ultimately just issues stacked on top of each other, and the whole apparatus still has to justify its own overhead in [Ch 49](ch49-process-overhead-the-value-threshold.md). Get the base unit wrong and every process built on it inherits the same fuzziness, just at a larger and more expensive scale. This chapter covers what makes an issue actually actionable, how to scope one so it has a chance of closing, and why a healthy tracker needs as much deletion as creation — hoarding tickets is not the same as managing work.

---

### Describe the Problem, Not the Assumed Solution

**What it is:** Writing an issue around the problem being solved and the outcome that would resolve it, rather than immediately prescribing an implementation.

**Why it exists:** The first solution anyone proposes is rarely the best one, and an issue tends to get read long after it's filed — by a different engineer, or by the same one who's since learned something. An issue that records "replace Redis with PostgreSQL" has already thrown out every alternative fix before anyone even looked at the problem it was meant to solve. An issue that records "cache invalidation occasionally serves stale data after a write; stale reads should not occur under normal operation" leaves the door open for whoever picks it up to find something cheaper, or better, or just different — possibly a fix the original author never would have thought of.

**Options:**
1. **Solution-first** — the issue names the specific implementation to build.
2. **Problem-first** — the issue names the undesired behavior and the outcome that would resolve it, leaving the implementation to whoever does the work.

**Trade-offs:**

[Strong Recommendation] **Problem-first, as the default.** A solution-first issue is immediately actionable, and it loses nothing when the solution really is externally constrained — migrating off a deprecated library version, satisfying a regulatory requirement that spells out the exact behavior. Outside that narrow case, it buries the assumptions behind the chosen fix and makes the issue almost impossible to revisit once that fix turns out to be wrong: the team ends up committed to an implementation nobody would pick again, purely because the issue wrote down the solution instead of the objective. Problem-first costs a little more upfront — sometimes enough that the issue should point to a spec (see [Ch 46](ch46-spec-first-development.md)) rather than try to hold the full reasoning itself — but it keeps the door open and makes success checkable independent of whichever implementation wins.

**When to choose each:** Default to problem-first. Use solution-first only when the implementation truly isn't a design decision — the target library version is fixed by an upstream deprecation, the compliance requirement specifies the exact behavior required.

**Common failure modes:** *The frozen fix.* An issue titled "Replace Redis with PostgreSQL" gets filed, debated across three separate threads, and eventually implemented — weeks of migration work — while the actual stale-read problem turns out to be a missing cache invalidation call that had nothing to do with which database sat behind it. Because the issue named a migration instead of a symptom, nobody ever stopped to ask whether the migration was solving anything.

**Example:** Well-run open-source bug trackers describe observable deficiencies — "search returns stale results after a delete" — rather than prescribing the patch. Contributors routinely solve the stated problem in ways the original reporter never would have guessed, precisely because the issue left them room to.

---

### Acceptance Criteria Make "Done" Checkable

**What it is:** An explicit statement of the observable conditions that determine whether an issue is complete, distinct from a general description of the desired feature.

**Why it exists:** Without a checkable definition of done, "done" is just an opinion, and issues reopen because two engineers disagreed about whether the promised behavior actually showed up. Acceptance criteria turn a subjective judgment call ("the feature works") into something a second engineer can check without needing telepathic access to the first engineer's mental model: "a user can reset a password without contacting support," "the API returns HTTP 404 for a nonexistent resource," "the operation completes within two seconds under the stated load."

**Options:**
1. **Implicit completion** — the issue describes the feature; whoever implements it decides when it's done.
2. **Explicit acceptance criteria** — the issue states the specific, observable conditions that must hold for the issue to close.

**Trade-offs:**

[Strong Recommendation] **Explicit acceptance criteria as the default for any shared issue.** Implicit completion is faster to type, but it hands you inconsistent interpretations, recurring reopenings, and a QA process with nothing concrete to check against. Explicit criteria cost more thought upfront and sometimes need a rewrite once mid-implementation reality corrects the plan, but they make closure an objective fact rather than a vibe — and they're close enough to a test plan that half the work of writing one is already done.

**When to choose each:** Write explicit criteria for anything a second person might implement, review, or verify — which is nearly all shared work. Criteria should describe observable behavior, not implementation, so that internal refactoring later doesn't change what "done" means.

**Common failure modes:** An issue closes, gets reopened a week later because someone else's idea of "works" didn't match the implementer's, closes again with slightly different behavior, and reopens again — a slow-motion argument conducted entirely through ticket status. The churn isn't a communication problem; it's a symptom that the issue never had a definition of done, only a description of a feature.

**Example:** Teams that define completion around observable behavior ("returns 404 for unknown IDs") instead of implementation details ("uses a lookup table") get to refactor the internals however they like without ever reopening the question of whether the issue is still closed.

---

### Match Issue Type to the Kind of Work

**What it is:** Treating bugs, features, and tasks/chores as distinct categories with different required information and different definitions of done, rather than one generic issue type.

**Why it exists:** A bug describes existing behavior that's wrong; a feature introduces behavior that doesn't exist yet; a task changes engineering assets without changing anything a user would notice. Each needs different information to be actionable, and each closes under a different condition. A bug report missing reproduction steps, expected behavior, observed behavior, and environment turns triage into a guessing game — Joel Spolsky made exactly this case in "Painless Bug Tracking" back in 2000, and the four-field structure he recommended is still the one everyone reaches for. A feature request with no acceptance criteria can't be verified as done. A task with no stated scope never has a moment where it's obviously finished — it just sort of stops.

**Options:**
1. **One generic issue type** for everything, with free-form description.
2. **Distinct issue types** — bug, feature, task/chore — each with its own required fields and definition of done.

**Trade-offs:**

A single generic type is simpler to build tooling around, but it throws away information: a triager can't tell from the type alone whether they're looking at a regression, a request, or maintenance work, and has to read the whole body every time just to figure out which questions even apply. Distinct types demand a little more upfront discipline — someone has to pick the right one and fill in its fields — in exchange for issue quality that doesn't depend on anyone's good intentions: a bug report that mechanically requires reproduction steps literally cannot be filed without them.

**When to choose each:** Choose the type based on the nature of the work, not organizational convenience or priority-seeking. A bug is incorrect existing behavior, full stop — not "important work" that someone wants bumped up the queue.

**Common failure modes:** Feature requests get filed as bugs to borrow a bug's higher default priority. Maintenance work gets dressed up as a feature so it can compete for budget. Bug reports filed against a generic template skip reproduction steps because nothing made the reporter provide them, and the bug sits unreproducible for a week until someone tracks the reporter down for details that should have been in the ticket the first time.

**Example:** Spolsky's canonical structure — repro steps, expected behavior, observed behavior, environment — is still the standard shape for a usable bug report, because those four fields are exactly what a second engineer needs to reproduce a failure without borrowing the reporter's machine, or their memory.

---

### Scope Around One Closeable Unit

**What it is:** Restricting an issue to a single, bounded piece of work that can realistically be completed and closed, as distinct from a *theme* — an ongoing aspiration like "improve performance" or "clean up technical debt" that has no natural completion point.

**Why it exists:** Issues exist to move from open to closed — that's the whole job. An issue whose completion criteria are inherently unbounded — "modernize infrastructure" — never actually closes; it just accumulates unrelated commits under one ticket number forever, and a few months in nobody can even say what "done" would look like for it anymore. A theme is a legitimate planning concept — an epic, a roadmap category — but it needs to be broken into concrete, closeable issues before anyone's assigned to it, not tracked as one ticket that outlives several sprint cycles and possibly the engineer who filed it.

**Options:**
1. **Atomic bounded issues** — "add request timeout to authentication service," "fix race condition in cache invalidation" — each closeable by a bounded amount of work.
2. **Themes tracked as issues** — "improve performance," "clean up the codebase" — logged directly as a single ticket without decomposition.

**Trade-offs:**

[Strong Recommendation] **Bounded issues for anything assigned to an individual for active work; themes only as an explicit, higher-level category that gets decomposed before assignment.** A bounded issue maps cleanly onto a reviewable pull request (the subject of [Ch 43](ch43-issue-as-tracking-unit-vs-pr-as-review-unit.md)), gives progress you can actually measure, and can be handed to whichever engineer happens to be free. A theme tracked directly as an issue is cheaper to file, but it produces progress nobody can describe, resists any honest estimate, and rarely finishes — there was never a finish line to cross, just a title that sounded like one.

**When to choose each:** If completion can't be objectively recognized, the work needs to be decomposed further. If multiple engineers could work on different parts of it in parallel, it's probably more than one issue already.

**Common failure modes:** *The eternal ticket.* "Clean up the database migration layer" gets assigned to an engineer, who submits ten unrelated pull requests against it over three weeks and then quietly moves on to something else. Because "cleanup" has no checkable boundary, the ticket stays open indefinitely, skewing milestone metrics and hiding the fact that the real work was finished in spirit weeks before it was finished in ticket status.

**Example:** Large, multi-week architectural transitions — deprecating an API version in a system the size of Kubernetes — get managed through a design document (see [Ch 46](ch46-spec-first-development.md)) plus a pile of specific, independently closeable issues ("implement validation webhook for PodSecurityPolicy"), never as one ticket left open for the full life of the migration.

---

### Enforce Minimum Quality Mechanically, Not by Memory

**What it is:** Using issue templates to require specific fields — reproduction steps and environment for a bug, acceptance criteria for a feature — rather than relying on every reporter to remember what a good issue contains.

**Why it exists:** This is Principle 8 — mechanical enforcement beats human discipline — applied to process instead of code. If issue quality depends entirely on the reporter remembering the right structure, it'll vary by person and by how good their Monday is going. A template that requires the fields a triager actually needs makes the well-formed issue the path of least resistance, instead of something that depends on everyone's memory staying sharp forever.

**Options:**
1. **Manual discipline** — no enforced structure; quality depends on the reporter.
2. **Issue templates** — a per-type template mechanically requires the fields that type needs.

**Trade-offs:**

Manual discipline is flexible and costs nothing to set up, but it produces inconsistent quality and quietly transfers the cost onto whoever triages the issue, who ends up typing the same clarifying question for the hundredth time. Templates standardize what a triager can expect and make automation — routing, labeling — much easier, at the cost of turning bureaucratic the moment the required-field list outgrows what's actually necessary: reporters end up spending more energy satisfying the form than describing the problem.

**When to choose each:** Templates earn their cost for recurring categories — bug reports, feature requests, operational incidents — where the required information is predictable. Every mandatory field should have to justify its own existence; a template that demands ten fields to file a one-line typo fix will just get worked around or ignored.

**Common failure modes:** A template starts with three required fields and, over the course of a year, accumulates twelve as every stakeholder with a reporting need bolts on one more. Reporters start abandoning the template and pasting free text instead, and the mechanism that was supposed to guarantee quality is now actively talking people out of filing issues in the first place.

**Example:** GitHub's `ISSUE_TEMPLATE` mechanism lets a repository demand reproduction steps for bug reports while running a lighter template for feature requests — mechanical enforcement scoped to exactly what that issue type needs, not one form trying to fit every shape of work.

---

### Treat the Backlog as a Living Collection, Not an Archive

**What it is:** Actively closing obsolete, duplicate, and superseded issues rather than letting every filed issue remain open indefinitely.

**Why it exists:** Creating an issue costs almost nothing. Maintaining the pile it becomes does — every open issue is an ongoing tax on prioritization, duplicate detection, and search, and that tax compounds as the pile grows. A backlog that only ever grows turns into a *write-only tracker*: hundreds or thousands of issues nobody's looked at in years, that no longer reflect what the team actually intends to do, and that engineers have quietly stopped trusting as a planning signal. Once that trust is gone, real work migrates to documents and chat threads, and the tracker becomes a very expensive place to file things nobody reads.

**Options:**
1. **Complete historical backlog** — nothing is ever closed as "won't do"; everything stays open until literally implemented.
2. **Continuously pruned backlog** — obsolete issues, duplicates, and rejected proposals are closed on an ongoing basis.
3. **Automated backlog decay** — tooling auto-archives issues that receive no activity within a defined window.

**Trade-offs:**

[Strong Recommendation] **A continuously pruned backlog, optionally backed by automated decay, over a complete historical archive.** A complete backlog guarantees nothing is ever forgotten, but stale issues flood search results, distort prioritization, and eventually the whole collection stops reflecting what the team actually intends to do — the same asymmetry [Ch 39](../part05-testing-strategy/ch39-when-not-to-test.md) made about deleting negative-ROI tests applies here: closing something is a legitimate maintenance action, not an admission of failure. A pruned backlog demands continuous human attention (or tooling that substitutes for it) and occasionally closes something that turns out to matter six months later, but it keeps the tracker usable as a decision-making tool instead of a museum.

**When to choose each:** Treat "won't do" as a healthy, ordinary outcome, not an admission of failure. Reach for automated decay once a backlog is too large for anyone to read and evaluate in a reasonable sitting — roughly the point where triage itself has become a project.

**Common failure modes:** *Backlog bankruptcy.* A team accumulates well over a thousand open issues across several years, each one technically still "active." The volume makes the backlog useless for milestone planning ([Ch 44](ch44-milestone-and-phase-planning.md)), so the team quietly stops using it and starts tracking real work in documents or chat instead — the tracker is still there, still accepting new issues, doing absolutely nothing.

**Example:** Linear's built-in auto-archive closes an issue that's sat untouched for a set period with no comment, status change, or milestone assignment — a small tooling decision that encodes a whole process philosophy: inactive work should vanish unless someone is still actually willing to do it.

---

### Why Smart Engineers Disagree on Tracker Philosophy

The tracker wars are mostly philosophical, not technical, and the spectrum runs from GitHub Issues at one end to Jira at the other. GitHub Issues is deliberately minimal — a title, a body, labels, and whatever conventions a team bothers to layer on top voluntarily. Jira is a configurable workflow engine — custom fields, required states, permission schemes, transition rules — built to let an organization encode a genuinely elaborate process directly into the tool, for better or worse.

Engineers who favor the minimal end argue that most of what a heavyweight tracker enforces is overhead a small, aligned team simply doesn't need: everyone already carries the missing context in their heads, so mandatory fields and workflow gates just add friction to filing an issue without adding real information. Engineers who favor the configurable end argue that once an organization scales past the point where everyone shares context — hundreds of engineers, multiple teams, compliance or audit requirements to satisfy — human discipline alone stops being reliable, and the same mechanical-enforcement argument that justifies issue templates justifies going further still: a workflow that refuses to move an issue to "in review" without a linked design doc is Principle 8 with the leash off.

Neither camp is wrong, exactly — they're optimizing for different problems. A minimal tracker accelerates a small, autonomous team and turns into friction the moment coordination costs start to dominate; a heavily configured tracker provides traceability and governance that same small team would experience as pure sludge. The question isn't which tool is better in the abstract — it's whether the structure a given tracker imposes removes more coordination cost than it adds for the team stuck using it. That's the general question of when process earns its keep, and [Ch 49](ch49-process-overhead-the-value-threshold.md) takes it up directly.
