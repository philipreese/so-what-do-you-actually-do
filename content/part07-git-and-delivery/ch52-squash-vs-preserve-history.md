# Ch 52 — Squash vs. Preserve History

*The real question is whether you trust the commits inside a PR.*

Squash versus preserve is not an aesthetic choice — it's a consistency check on whether the team actually trusts the commits inside a PR to be individually meaningful units of history. Squash-and-merge is the pragmatic default when in-review commits are genuinely noisy, since it guarantees one clean commit with one clean message regardless of how messy the process behind it was. Preserving full history is superior only when the commits being preserved were actually curated under real commit discipline; preserving a noisy history is strictly worse than squashing it, since it fills the permanent record with the exact noise squashing exists to remove.

**Prerequisites:** [Issue as Tracking Unit vs. PR as Review Unit](../part06-engineering-process/ch43-issue-as-tracking-unit-vs-pr-as-review-unit.md), [Process Overhead: The Value Threshold](../part06-engineering-process/ch49-process-overhead-the-value-threshold.md), [Branching Strategies](ch50-branching-strategies.md), [Commit Message Conventions](ch51-commit-message-conventions.md)

**New vocabulary introduced:** None — this chapter is a consistency check against commit discipline (Ch 51) and PR sizing (Ch 43) already established, not a source of new cross-chapter terms.

**Key takeaways:**
- Squash vs. preserve is not an aesthetic choice. It's a consistency check: does the team actually trust the commits inside a PR to be individually meaningful units of history?
- [Legitimate Trade-off] gated on an empirical fact, not taste: squash-and-merge is the pragmatic default when in-review commits are genuinely noisy ("fix typo," "address review feedback," "oops"), because it guarantees one clean commit with one clean message regardless of how messy the process behind it was.
- Preserving full history is superior only when the commits being preserved were actually curated under Ch 51's discipline. Preserving a noisy history is strictly worse than squashing it — it fills the permanent record with the exact noise squashing exists to remove.
- Squashing coarsens `git bisect`'s resolution from a single commit to an entire PR. This is a second, independent reason — alongside Ch 43's review-size argument — to keep PRs small: a large squashed PR turns "bisect found the bad commit" into "now manually audit two thousand lines by hand."
- Merge policy is downstream of commit hygiene, not the reverse. Decide how disciplined the team's commits actually are, then let that decide the merge policy — choosing preserve-history first and hoping discipline follows produces the worst outcome available.

## For My Wife

Imagine planning a family dinner over a group text. Most of that thread is noise nobody needs kept forever — "wait no," "ignore that," "typo, meant Tuesday not Thursday," fifteen messages just nailing down a time everyone can make. Nobody wants that whole thread saved as the official family record. What's actually worth keeping is the clean summary: "Dinner Saturday at 6, Sam's bringing dessert."

This chapter is about that exact choice, applied to how programmers save their work. While someone's building something, they save their progress constantly, and most of those saves are exactly like that group chat: "fix typo," "try again," "oops." Collapsing them into one clean, final entry before it becomes part of the permanent record is usually the right call, for the same reason nobody archives the "wait no" texts — keeping them doesn't preserve anything valuable, it just clutters the record with noise nobody will ever want to read again.

**But every so often, the individual messages actually were worth keeping.** Picture a different group chat — a real, careful negotiation about which restaurant to pick, with each person laying out an actual reason: allergies, budget, how far someone has to drive. That thread tells a story worth keeping intact, message by message, because each one was a real, separate piece of reasoning, not filler. The chapter's actual point is that the decision isn't about which approach seems more thorough — it's about being honest with yourself about which kind of thread you actually have, because a record stuffed with fifteen "ignore that" texts is exactly what nobody wants to be searching through at two in the morning when something's actually gone wrong.

## For My Kids

Say you're solving a math problem, and your scratch paper has fifteen different attempts scribbled on it — false starts, crossed-out mistakes, a "wait, that's wrong" you circled and abandoned twice. Nobody wants that handed in as your actual answer. What you turn in is one clean final version: here's the problem, here's the answer, done.

**Collapsing fifteen messy scratch attempts into one clean answer is exactly right — most of that mess was never worth keeping.** The three minutes you spent chasing a wrong approach before erasing it isn't useful history. It's just what solving something actually looks like while it's still happening.

**But sometimes the steps themselves genuinely matter, and erasing them loses something real.** A geometry proof with five real, deliberate steps — each one an actual piece of reasoning, not a false start — is worth keeping exactly as written, because a teacher checking your work needs to see which specific step the logic breaks down on, not just a final answer with no path to it.

**The real question was never "clean vs. messy" as a matter of taste.** It's whether what you're keeping was actually a sequence of meaningful steps, or just the ordinary mess of getting to an answer. Keep real steps. Erase actual scratch work. Confusing the two either buries a real proof under a clean-looking final answer, or hands in fifteen crossed-out false starts as if they were the actual point.

---

This chapter covers what a pull request's history looks like once it merges: collapsed into one synthetic commit (squash), or kept as the sequence of commits made during development, either preserved as-is or linearized via rebase beforehand. It does not cover commit message format itself — that's Ch 51's job, and this chapter's entire argument leans on it — nor the rebase mechanics used to clean up a branch before merging (Ch 55), nor the force-push required to apply that cleanup (Ch 54).

### Squash-and-Merge vs. Preserving History

**What it is:** The merge-time policy decision over whether a branch's individual commits survive into the target branch's permanent history, or get collapsed into a single commit at merge time.

**Why it exists:** While a branch is under active development, commits accumulate the ordinary noise of getting something working — fixups, responses to review comments, abandoned attempts — useful in the moment but worthless the instant the change ships. The merge policy is the filter deciding whether that noise becomes permanent system history or gets swept out at the merge gate.

**Options:**
1. **Squash-and-merge** — every commit on the branch collapses into one commit on the target branch, typically carrying the PR's title and description as its message.
2. **Preserve history** — the branch's commits land on the target branch intact, either through an explicit merge commit or linearized via rebase beforehand.

**Trade-offs:** Squash-and-merge produces a clean main history no matter how messy the branch's commits were, at the cost of permanently discarding the step-by-step evolution of the change. Preserving history keeps that evolution — genuinely valuable for tracing how a complex change actually got built — but only if the commits being preserved were curated to each be independently meaningful. A branch full of "fix lint," "typo," "trying again" commits doesn't become useful history just by being preserved; it becomes permanent noise.

[Legitimate Trade-off], gated on an empirical fact about the team's actual practice, not a matter of taste: if commit discipline (Ch 51) isn't actually enforced, squash-and-merge is the correct default, full stop. If it is enforced — ideally mechanically, via a commit-lint hook rather than someone eyeballing it in review — preserving history is strictly better, because it keeps a debugging resolution squashing throws away for good.

**When to choose each:** Default to squash-and-merge for any team without a mechanically enforced commit convention. Choose to preserve history only once Ch 51's discipline is already in practice as a mandatory pre-merge check — every preserved commit should independently compile, pass tests, and stand alone as a meaningful, atomic change. Preserving history as an aspiration, hoping the team's discipline catches up to it later, produces the worst outcome on the table: a permanent record polluted with exactly the noise squashing exists to filter out.

**Common failure modes:** The toxic noise flood — a team adopts history preservation on the belief that "more information is always better," skips any enforcement gate, and within months the main branch's log is saturated with entries like "fixed lint error," "typo," "trying again," "maybe this fixes it." `git log` becomes unreadable at exactly the moment it matters most: a live production triage. The inverse failure is quieter but no less costly: a team squashes everything and mistakes the resulting clean log for evidence of good engineering discipline, when the discipline never existed upstream — squashing just hid it from the permanent record, not from the process that produced the code.

**Example:** GitHub's "Squash and merge" button is the mainstream, zero-configuration default precisely because it makes no assumption about the quality of commits inside a PR. The Git project and the Linux kernel do the opposite: they reject squashing entirely and require contributors to submit a curated, rebased sequence of atomic patches, each independently reviewable — a model that only works because their commit discipline (Ch 51) is enforced through mandatory maintainer review, not because preserving history is inherently superior to squashing.

### Bisect Granularity: Coarse vs. Fine

**What it is:** `git bisect` performs a binary search over commit history to locate the commit that introduced a regression. Its usefulness is bounded by how much a single commit actually represents — squashing coarsens that unit from an individual change to an entire PR.

**Why it exists:** A binary search is only as informative as the granularity of what it's searching. Collapsing a PR's internal commits into one doesn't break bisect's ability to function, but it does shift what "found it" actually means — from a specific line to an entire merged PR's diff.

**Options:**
1. **Coarse-grained (squashed):** every node in history maps to a full merged PR.
2. **Fine-grained (preserved, curated patches):** history contains the small, atomic commits that made up the branch, each independently bisectable.

**Trade-offs:**

| Dimension | Coarse-grained (squash) | Fine-grained (preserved patches) |
|---|---|---|
| Bisect identifies | The PR that introduced the regression | The specific commit — sometimes the specific line |
| Depends on PR size | Heavily — a small PR makes this moot | Lightly — works even inside a large branch |
| Risk of a broken intermediate state | None; every commit on main was a validated PR | Some; a bad intermediate commit can stall a bisect |

**When to choose each:** If PRs are already kept small (Ch 43), coarse-grained resolution is nearly as good as fine-grained — isolating the regression to a small PR is functionally close to isolating the exact line. Fine-grained history earns its cost mainly in low-level, algorithmically dense systems — kernels, compilers, databases — where a single-line change can have effects wildly disproportionate to its size, and PRs can't always be kept small enough to make squashing harmless.

**Common failure modes:** The two-thousand-line blind spot. A team allows long-lived, multi-week feature branches and squashes them at merge. A regression surfaces weeks later; `git bisect` runs cleanly and immediately flags the offending commit — which turns out to span seventy-four files and two thousand lines, because it's the entire squashed feature. The tool didn't fail; the PR size did, and squashing just made that failure visible at the worst possible moment.

**Example:** A bisect that lands on `feat: overhaul user checkout service (#4321)` in a squashed history hands the engineer an entire feature to audit by hand. The same regression in a curated, preserved history lands directly on `fix(checkout): adjust floating-point roundoff in tax calculation matrix` — the exact line, no manual audit required. The difference isn't the merge strategy in isolation; it's commit granularity upstream, and the merge strategy just decides whether that granularity survives or gets thrown away.

---

### Why Smart Engineers Disagree

The disagreement is about what a Git repository's history is actually for.

One view treats the repository as something close to a flight recorder: the messy, literal sequence of how the code was actually written — false starts, temporary bugs, midnight fixes and all — is itself valuable, unfiltered data about how the system evolved, and squashing it away amounts to erasing what really happened. The opposing view treats the log as documentation written for future maintainers, not a diary of the process: a maintainer tracing a regression gets nothing from a developer's typo fixes and abandoned attempts, and a history cluttered with them actively buries the architectural changes that actually matter.

Both views are right about different repositories. The flight-recorder view is only defensible where the "literal sequence" is actually worth keeping — which requires the same commit discipline Ch 51 argues for being genuinely, continuously practiced, not just aspired to in a wiki page nobody reads. The documentation view is right everywhere else, which in practice is most teams: very few sustain kernel-grade commit hygiene at scale, and for those teams, preserving the raw sequence doesn't preserve history — it preserves noise. This is why the chapter treats squash-vs-preserve as a dependency relationship rather than a genuine axis of taste: merge policy is decided by commit hygiene, not the other way around.
