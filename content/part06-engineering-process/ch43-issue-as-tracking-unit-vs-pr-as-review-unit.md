# Ch 43 — Issue as Tracking Unit vs. PR as Review Unit

*The issue and the PR answer different questions at different sizes.*

An issue and a pull request answer different questions and have different natural sizes: the issue is the unit of intent, the PR is the unit of review, and the mapping between them is one-to-many, not one-to-one. Review effectiveness degrades sharply as diff size grows, an empirical finding rather than a matter of reviewer discipline, so the burden of keeping diffs small belongs to the author. Forcing a 1:1 mapping produces one of two failure modes: the monster PR that reviews an entire issue in one unreviewable diff, or a fragmented tracker sliced to match convenient diff boundaries. Incremental PRs, feature flags, and stacked PRs are the standard techniques for splitting implementation into reviewable steps while keeping one stable issue as the record of intent.

**Prerequisites:** [Issue Tracking: What Makes a Good Issue](ch42-issue-tracking-what-makes-a-good-issue.md), [What Engineering Actually Optimizes](../part01-systems-thinking/ch01-what-engineering-optimizes.md), [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md), [Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md)

**New vocabulary introduced:** unit of intent, unit of review, monster PR

**Key takeaways:**
- An issue and a pull request answer different questions and have different natural sizes. The issue is the *unit of intent* — why this work exists and what outcome closes it. The PR is the *unit of review* — a bounded diff a human can actually evaluate for correctness.
- The natural mapping between them is one-to-many, not one-to-one. An issue closes when its acceptance criteria are met, regardless of how many PRs it took to get there.
- Review effectiveness degrades sharply as diff size grows — this is an empirical finding, not a matter of reviewer discipline. The burden of keeping diffs small belongs on the author, not the reviewer.
- Forcing a 1:1 mapping produces one of two failure modes: the *monster PR* that reviews an entire issue in one unreviewable diff, or a fragmented issue tracker sliced to match convenient diff boundaries, which destroys the tracker's value as a record of intent.
- Incremental PRs, feature flags, and stacked PRs are the standard techniques for splitting implementation into reviewable steps while keeping one stable issue as the record of intent.
- Every PR should reference the issue that motivated it. An issue with no linked activity, or a PR with no linked issue, is a signal worth noticing — the alternative is a PR-only workflow where the diff explains how but nothing records why.

## For My Wife

Renovating a kitchen is one project with one reason behind it — you want a bigger kitchen, and that's true from the first sledgehammer swing to the day you cook dinner in it. But no inspector signs off on the whole renovation in a single visit at the very end. They come by after the electrical is roughed in, again after the plumbing, again after the drywall goes up, because each of those checks has to be small enough for one person to actually look at closely enough to catch a real problem. This chapter draws the same distinction for engineering work: the reason a project exists and the size of a check someone can carefully verify are two different things, and forcing them into the same size breaks one or the other.

If the whole kitchen only ever gets checked once, at the very end, the inspector either waves it through without really looking — nobody can hold an entire renovation in their head during one walkthrough — or you'd have to pretend it was six unrelated tiny projects instead of one kitchen, which makes it impossible for anyone to see the actual goal anymore. Neither is good. The renovation stays one project. The inspections stay small enough to be real.

> [!NOTE]
> This isn't a matter of some reviewers being lazier than others — it's closer to a physical limit. Studies of code review at companies like Google and Cisco found that once a single review passes a few hundred lines, the number of real problems a reviewer actually catches drops off sharply, no matter how conscientious they are. Past a certain size, a careful check and a rubber stamp start looking identical from the outside.

## For My Kids

### The Six-Week Checkpoint

Say you're doing a science fair project that takes six weeks — one project, one question you're trying to answer, from day one to presentation day.

**Your teacher doesn't wait until presentation day to look at any of it.** She checks in at specific small points: is your question actually testable, does your experiment design make sense, are you recording data correctly. Each check is small enough that she can actually look closely and catch a real problem — a flawed test, a missing control group — while there's still time to fix it.

**Now imagine she only checked the whole thing once, the day before presentations.** Six weeks of work, all at once — she can maybe skim it, nod, and hope it's fine, because there's no realistic way to catch a real flaw buried somewhere in six weeks of work in the ten minutes she has to look. That's not extra thoroughness. It just looks like a check without actually being one.

**The project itself never got smaller — it's still the same one big question the whole time.** What changed is that the checks got small enough to actually mean something. Splitting it into six real checkpoints isn't turning one project into six unrelated ones; it's making sure somebody could genuinely catch a problem before it's too late to fix.

> [!CAR]
> If you were working on something that took weeks to finish, would you rather have someone check on it along the way or only see it at the very end? Why?

---

[Ch 42](ch42-issue-tracking-what-makes-a-good-issue.md) established what makes a single issue actionable. This chapter draws a distinction most teams never make explicit, and pay for that omission later, usually in the form of a backlog nobody trusts or a PR nobody can review: the issue and the pull request are different units, sized for different purposes, and the mapping between them is naturally one-to-many. Confuse them and you get planning artifacts that stopped representing real work months ago, or code reviews too large for anyone to actually review. The mechanics of branches and merging are covered in Part VII; what reviewers should actually look for during review is covered in [Ch 47](ch47-code-review.md). This chapter is only about what size each artifact should be.

---

### Size the Mapping Around One Issue, Many PRs

**What it is:** The choice between forcing every issue to close via exactly one pull request, and letting a single issue be satisfied by however many PRs its implementation naturally requires.

**Why it exists:** An issue is a unit of intent: it defines a problem and the acceptance criteria that resolve it, and it stays open until that outcome is achieved, however many implementation steps that takes. A PR is a unit of review: it exists to be verified by a human in one sitting, and its natural size is bounded by what a reviewer can actually hold in their head at once. These two objectives rarely land on the same boundary, and forcing them to means one of them loses — either the issue gets stretched to fit whatever a reviewer can stomach, or the PR gets stretched to whatever it takes to close the issue.

**Options:**
1. **1:1 mapping** — every issue is closed by exactly one PR.
2. **1:N mapping** — an issue is closed once its acceptance criteria are satisfied, across as many PRs as the implementation needs.

**Trade-offs:**

[Strong Recommendation] **1:N as the default for any non-trivial work.** A 1:1 mapping keeps the bookkeeping simple — the issue auto-closes the moment its one PR merges — but it forces exactly the choice described above. If the issue represents real work, its PR grows until nobody can review it. If a team dodges that by keeping PRs small, it ends up slicing the issue tracker into artificial fragments that match diff boundaries instead of actual intent, and the tracker stops representing anything a planner or stakeholder can use. A 1:N mapping keeps both units honest — the issue stays a stable statement of intent, the PR stays sized for review — at the cost of some extra bookkeeping: cross-referencing PRs against the issue and tracking which parts are actually done.

**When to choose each:** 1:1 is reasonable for trivial, single-layer changes — a dependency bump, a one-line hotfix, a documentation typo — where the entire change already fits comfortably in one review. For anything that spans more than one architectural layer, or that takes more than a sitting to implement, default to 1:N and keep the issue as the single point of reference.

**Common failure modes:** *The monster PR.* A team enforcing strict 1:1 mapping implements a multi-region payment routing change — database models, network client integration, retry queues, configuration — as one diff running several thousand lines. It sits unreviewed for weeks because no reviewer can hold the whole thing in their head at once, and by the time anyone works up the nerve to review it seriously, the base branch has already drifted out from under it. *The fragmented backlog.* To dodge monster PRs under a 1:1 rule, a team instead splits one cohesive feature into dozens of issues — "create user table," "add name column," "expose name field via API" — each one sized to match a convenient diff instead of a real unit of intent. The tracker turns into a mirror of implementation steps and stops being usable as a roadmap for anything.

**Example:** A migration of an application's caching layer from a local in-process store to a distributed Redis cluster gets tracked as one issue with clear acceptance criteria (cache reads and writes go through Redis; local state is removed; no correctness regression under load) and implemented across a sequence of PRs: introduce the Redis client adapter, dual-write to both stores behind a toggle, cut reads over, delete the legacy code. One issue, four PRs, each one small enough to actually review.

---

### Review Effectiveness Degrades as Diffs Grow

**What it is:** The empirical observation that reviewers detect fewer defects per line, and give less scrutiny overall, as the size of a single review grows — not because reviewers become careless, but because human attention does not scale linearly with diff size.

**Why it exists:** A review unit has to be sized for human comprehension, not for whatever's convenient to ship. Past a certain size, a reviewer physically cannot hold the whole change in working memory, and the review quietly shifts from actual verification to something closer to faith: skim it, check that CI is green, click approve.

**Options:**
1. **Small reviews, frequent turnaround** — changes are split so each one stays within what a reviewer can evaluate carefully in one sitting.
2. **Large reviews, infrequent turnaround** — changes accumulate into a bigger diff before being submitted for review.

**Trade-offs:**

[Consensus] **Small, frequent reviews over large, infrequent ones.** This isn't a matter of taste — it's one of the more consistently reproduced findings in empirical software engineering. The SmartBear/Cisco code review study found defect detection falls off sharply once a single review passes roughly 200–400 lines, and Google's own published research on code review at scale ("Modern Code Review: A Case Study at Google," Sadowski et al., 2018) documents that keeping change sizes far smaller than typical industry norms, paired with fast turnaround, is a deliberate, institutionally reinforced practice — not an accident of tooling nobody bothered to fix. Large reviews cut down on how often an author has to ask for review, but that saving is an illusion: review quality collapses long before the diff gets big enough to actually save meaningful coordination effort.

**When to choose each:** The responsibility for splitting a change belongs to the author before submission, not to the reviewer after the fact. If a reviewer cannot reasonably read and understand the entire diff in one sitting, the change is too large regardless of how logically connected its parts are.

**Common failure modes:** A large diff collects a handful of superficial line comments and an approval within minutes — the reviewer has effectively verified that the pipeline is green, not that the logic is correct. A hidden concurrency bug or a missing index allocation slips through unnoticed because nobody had any attention budget left to trace the less obvious paths once the diff crossed a few hundred lines.

**Example:** An 800-line PR alters a core financial allocation loop. Because of its size, the reviewer skims it, confirms CI is green, and approves within minutes. A race condition in the new concurrency handling ships to production and causes silent data corruption — a defect that a reviewer working through a 100-line version of the same change, one step at a time, would have had a real shot at catching.

---

### Split Implementation Without Splitting Intent

**What it is:** The concrete techniques that let a team divide an issue's implementation into small, reviewable PRs while the issue itself stays a single, stable statement of intent: incremental PRs, feature flags, and stacked PRs.

**Why it exists:** Knowing small PRs beat large ones doesn't tell you how to actually produce them without breaking the main branch or shipping half-finished functionality to real users. Each of the three techniques below solves that problem differently, and each fits a different shape of dependency between the steps.

**Options:**
1. **Incremental PRs** — each PR leaves the system fully working; later PRs build on top.
2. **Feature flags** — implementation is merged behind a toggle before the functionality is exposed, so incomplete but inert code reaches the main branch safely.
3. **Stacked PRs** — a sequence of dependent branches, each reviewed against the one before it, for changes where a later step genuinely cannot be understood or validated without the exact code of the step before it.

**Trade-offs:**

Incremental PRs are the simplest option and need no extra machinery, but they only work when the underlying work actually decomposes into steps that each leave the system functional — not every change is that obliging. Feature flags handle the case where the work can't be exposed incrementally (a UI redesign, a new API surface) by merging real code before anyone flips it on, at the cost of a toggle that has to be removed later — a flag left behind after its purpose is served is just dead configuration quietly eroding everyone's ability to reason about what the system actually does. Stacked PRs handle tightly sequential work where each step's diff only makes sense next to the one before it, giving reviewers small individual diffs without hiding anything behind a flag, at the cost of real git discipline: an upstream fix has to be rebased down through every dependent branch, and without tooling support that turns into its own maintenance burden fast.

**When to choose each:** Use incremental PRs whenever the work can be sliced into steps that each leave the system working. Use feature flags when the functionality genuinely can't be exposed piece by piece. Use stacked PRs when later steps are written against the exact shape of earlier ones and can't be reviewed in isolation.

**Common failure modes:** A team adopts feature flags without a pruning discipline (see [Ch 49](ch49-process-overhead-the-value-threshold.md)), and over several quarters accumulates dozens of stale, unmaintained flag conditions. Nobody can say with any confidence which code paths are actually live, and an old, forgotten flag firing unexpectedly causes a production incident. Separately, a team refuses to merge anything until an entire stack of dependent PRs is complete, which defeats the whole point of stacking — the branches sit around long enough to diverge from the base exactly as much as a single monster PR would have.

**Example:** The popularity of stacked-PR tooling like Graphite says something about how common tightly sequential work actually is: a chain of dependent branches, each reviewed on its own, with tooling handling the rebase propagation that would otherwise make maintaining the stack a full-time job.

---

### Link Every PR to the Issue It Serves

**What it is:** The discipline of having every pull request explicitly reference the issue that motivated it, so the code's *how* and the issue's *why* remain connected after the PR merges.

**Why it exists:** The PR explains how a change was implemented. On its own, it says nothing about why the change was needed, what alternatives got considered, or what constraint made the chosen approach the right one — that context lives in the issue. Without an explicit link between them, someone eventually has to reconstruct that connection by hand: searching commit messages, review comments, and timestamps for a thread that, by then, may not even exist anymore.

**Options:**
1. **Explicit linkage** — every PR references its motivating issue, mechanically where possible (GitHub's closing keywords: `fixes #123`, `closes #123`).
2. **Implicit linkage** — the relationship between a PR and its motivating work is left for a future reader to infer.

**Trade-offs:**

[Strong Recommendation] **Explicit linkage by default.** The cost is negligible — one line in a PR description — against a real, recurring cost on the other side: an engineer investigating a production incident who can see exactly how a value was changed but has no idea why, because the PR description just said "optimize socket pooling" and the issue explaining the actual constraint was never referenced. Explicit linkage also buys automatic status updates for free: a merged PR referencing `fixes #123` closes the issue without anyone touching two systems by hand.

**When to choose each:** Use explicit linkage for any change against a codebase that will be maintained past the current sprint. Implicit linkage is only tolerable for disposable, short-lived work — a prototype spike, throwaway tooling — that no one will need to trace back to intent later.

**Common failure modes:** *The PR-only workflow.* A team gradually stops filing issues altogether and leans on PR descriptions as the sole record of both intent and implementation. Six months later, an engineer can see that a timeout dropped from five seconds to two hundred and fifty milliseconds, but the reasoning behind that specific number was never written down anywhere durable — reconstructing it turns into a guessing exercise instead of an archaeology one.

**Example:** GitHub's issue-closing keywords let a merged PR automatically close the issue it references, giving teams bi-directional traceability — from issue to implementation and back — without anyone maintaining that link by hand. When a decision needs to survive independently of any single issue or PR — a rejected alternative architecture, a rationale that'll matter again in two years — that belongs in an ADR, not buried in a PR description (see [Ch 45](ch45-architecture-decision-records.md)).

---

### Why Smart Engineers Disagree on Where Intent Should Live

Once a team accepts the one-issue-many-PRs model, a second disagreement surfaces: should the durable record of *why* a change happened live in the issue tracker, or in version control itself — commit messages and PR descriptions?

Engineers who favor the issue tracker point to cross-functional visibility: product, security, and support all need to search engineering context without reading diffs, and an issue tracker is built for that in a way a commit log never will be. Engineers who favor version control point to durability: companies migrate issue-tracking vendors, reorganize, lose access to old boards, and when that happens the tracker's history goes with it — the git log, by comparison, is nearly impossible to lose, because it travels with the code itself.

Both concerns are legitimate, and the practical answer isn't picking a side. Use the issue tracker for what it's actually good at — coordinating active work, prioritization, cross-team visibility while a project is still alive. But for a decision whose reasoning needs to outlive any given tracker — why an alternative architecture got rejected, why a specific constraint was chosen — write it down somewhere a vendor migration can't touch: the commit history, or a standalone Architecture Decision Record ([Ch 45](ch45-architecture-decision-records.md)). The issue tracker is the right home for short-lived coordination; permanent rationale belongs somewhere that outlives the tool that happened to be popular this year.
