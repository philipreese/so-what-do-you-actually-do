# Ch 51 — Commit Message Conventions

**Prerequisites:** [Comments: What to Comment, What Not To](../part04-code-organization/ch30-comments-what-to-comment-what-not-to.md), [Issue as Tracking Unit vs. PR as Review Unit](../part06-engineering-process/ch43-issue-as-tracking-unit-vs-pr-as-review-unit.md), [Architecture Decision Records (ADRs)](../part06-engineering-process/ch45-architecture-decision-records.md), [Branching Strategies](ch50-branching-strategies.md)

**New vocabulary introduced:** None — this chapter applies comment-rot (Ch 30) and ADR (Ch 45) concepts already defined, rather than coining new terms.

**Key takeaways:**
- Code gets refactored. Once a commit is merged, its message is effectively permanent — the reasoning survives long after the exact lines it describes have been rewritten or deleted.
- [Strong Recommendation] Structured, human-readable commit messages — Chris Beams' seven rules: separated subject/body, imperative mood, body explains *why* not *what* — are the baseline for any codebase expected to outlive its author or gain a second contributor.
- [Strong Recommendation] Conventional Commits' machine-parseable prefixes (`feat:`, `fix:`, `chore:`) are the direct, hard prerequisite for the automated version-bumping and changelog generation covered in Ch 61 — this is infrastructure a release pipeline depends on, not stylistic preference.
- A commit message documents one bounded change; an ADR documents a decision that outlives any single commit. A commit that reaches for architectural justification should reference the ADR by ID, not restate its reasoning — reasoning trapped only in a commit body disappears the moment the file it was attached to is deleted or rewritten.
- Commit discipline matters independent of whether history is later squashed at merge (Ch 52): a disciplined history is what makes preserving it worthwhile, and squashing a disciplined history still produces one good message, while squashing an undisciplined one only hides the mess instead of fixing it.

## For My Wife

Think about writing on the back of an old photograph. The photo itself just shows what things looked like in that one moment — the caption is what explains why anyone bothered to take it and keep it. "Kitchen, 2019" tells you almost nothing. "The week we found out we were moving to Ohio, the day before we told the kids" tells you everything the photo alone never could, and it still tells you that thirty years later, long after the kitchen's been renovated twice and everyone in the photo has moved on somewhere else.

This chapter argues that a commit message — the short explanation a programmer attaches every time they save a change to a shared project — deserves exactly the same treatment. The code itself is going to keep changing: rewritten, reorganized, eventually deleted and replaced by something else. What survives, if it was written well, is the explanation of why the change happened in the first place — what problem it fixed, what constraint forced the decision, what would break if someone undid it later without knowing why it was there. A message that just describes what the code already obviously shows — "fixed the bug" — is like captioning a photo "people in a kitchen." Technically true. Tells the next person nothing they couldn't already see for themselves.

**And the caption only works if someone actually writes it at the time — nobody remembers the real reason for a decision two years later, no matter how sure they feel in the moment.** By the time a photo needs its caption explained out loud, the person who could explain it has usually moved away, changed jobs, or simply forgotten — which is exactly the moment a good caption was supposed to be there waiting.

## For My Kids

Say you're doing a science experiment over several weeks, tweaking your setup a little each time, and you keep a lab notebook. After one round, you write "changed to 2 tablespoons of baking soda." That tells you what changed. It tells you nothing about why, and in three weeks, you won't remember either.

**"Changed to 2 tablespoons because 1 tablespoon fizzled out in under 10 seconds and I couldn't get a clean timing reading" is a completely different entry.** It survives long after that exact setup is gone — you'll run a dozen more versions, change the baking soda again, maybe swap the vinegar out entirely, and this one note still tells you exactly why 2 tablespoons became the number in the first place.

**The habit only works if you write it down in the moment, not later.** You will not remember, three weeks and six versions from now, why you made a change that felt obvious at the time. The reason is only easy to write down for about the next ten minutes. After that, it's already starting to blur, and by the science fair it's gone completely — replaced by a guess dressed up as a memory.

---

This chapter treats the commit message as a structured artifact with real downstream consumers — `git blame`, `git bisect`, and automated release tooling — not as free-form developer prose. It covers content discipline and machine-parseable format; it does not cover branch topology (already covered in [Ch 50](ch50-branching-strategies.md)), whether history is squashed or preserved at merge time ([Ch 52](ch52-squash-vs-preserve-history.md) — commit discipline matters regardless of that decision), or linking a change to the issue that motivated it (already covered in [Ch 43](../part06-engineering-process/ch43-issue-as-tracking-unit-vs-pr-as-review-unit.md)).

A commit message outlives its own diff. The code it describes will get refactored, moved, or partially undone; the message explaining why that code existed in the first place stays put unless someone deliberately rewrites history. That asymmetry — transient diff, durable explanation — is the whole reason commit discipline is worth enforcing instead of leaving to individual taste.

### Content Discipline: Chris Beams' Seven Rules

**What it is:** A widely adopted set of formatting and content rules ("How to Write a Git Commit Message," Chris Beams) that standardizes the human-readable structure of a commit: separate the subject from the body with a blank line, limit the subject to about 50 characters, capitalize it, don't end it with a period, write it in the imperative mood ("Fix," not "Fixed" or "Fixes"), wrap the body at 72 characters, and use the body to explain *what* and *why* — not *how*, since the diff already shows how.

**Why it exists:** A commit message that just restates the diff is redundant with `git show` — you already have the diff, right there. A commit message that explains the constraint or incident behind the change survives even after the surrounding code is refactored beyond recognition. This is the same comment-rot argument from Ch 30, one level up: an inline comment can drift out of sync with the code sitting next to it, but a merged commit message is frozen at the exact state of the world it described, immune to the rot that catches comments living inside code that keeps changing around them.

**Options:**
1. **Free-form messages** — whatever the author felt like typing, no required structure.
2. **Beams' structured format** — subject/body separation, imperative mood, rationale in the body.

**Trade-offs:** Free-form messages cost nothing to write and are fine for work nobody will ever need to trace back through. Structured messages cost a small amount of discipline per commit but stay interpretable years later, no matter what's since happened to the code around them.

**When to choose each:** Use the structured format for anything merged into a shared, long-lived branch. Free-form is defensible only for local, unpushed, throwaway work that will never be merged — the commits nobody but you will ever see.

**Common failure modes:** The redundant diff summary — a message like "fixed bug" or "added if statement to check for null" that adds no information `git show` doesn't already give you for free, and says nothing about why the bug existed or what upstream condition produced it. The opposite failure is just as damaging: a commit that skips rationale entirely, so a later engineer, staring at nothing but the diff, "fixes" the same problem back into existence because the constraint that justified the original change was never written down anywhere.

**Example:** The Linux kernel enforces this discipline at massive scale: subject lines are prefixed by subsystem (`kernel/sched:`, `drivers/net:`), bodies frequently document hardware errata or memory-ordering constraints that justify the exact change, and every commit carries a `Signed-off-by` line establishing provenance. This isn't stylistic — maintainers trace a history with hundreds of contributors using `git bisect`, and that only works because the messages actually say what each commit was for.

### Conventional Commits: A Machine-Parseable Format

**What it is:** A specification that prefixes a commit subject with a semantic token — `feat:`, `fix:`, `chore:`, `refactor:`, or one of these with a `!` or `BREAKING CHANGE:` footer to flag an incompatible change — following the grammar `<type>[optional scope]: <description>`.

**Why it exists:** Beams' rules make a commit readable to a human; Conventional Commits makes it readable to a machine too. A tool can parse a stream of `feat:`/`fix:`/breaking-change tokens and derive a semantically correct version bump and changelog entry without a human deciding any of it by hand — the mechanical chain Ch 61's release automation sits directly on top of.

**Trade-offs:**

| Dimension | Prose Commit Logs | Conventional Commits |
|---|---|---|
| Automation potential | None — release notes and version bumps require manual curation | Full — drives automated versioning tools natively |
| Expressive freedom | High — no forced categorization | Constrained — every change must fit a predefined type |
| Enforcement | Manual, via review | Programmatic, via a commit-lint hook or CI gate |

[Strong Recommendation] Adopt Conventional Commits once a team has, or wants, an automated release pipeline — at that point it's infrastructure the pipeline depends on, not a style preference. A team with no automated release process gains little from the constraint and can reasonably stay with prose, provided Beams' content rules still apply.

**Common failure modes:** The mislabeled breaking change. An engineer drops a column from a shared schema and commits it as `refactor: clean up user schema fields` instead of `feat!: remove deprecated user schema fields` or attaching a `BREAKING CHANGE:` footer. An automated release tool reads `refactor:` as a no-op for versioning purposes, ships a patch-level bump, and a change that should have demanded a major version and a migration window rolls out silently instead, breaking every consumer still reading the dropped column. The failure isn't the tool — it's a commit type chosen carelessly, which no tool can catch after the fact.

**Example:** In a pipeline built on Conventional Commits, `fix(auth): catch token expiration exception` triggers a patch bump (`v2.4.1` → `v2.4.2`); `feat(billing): support Adyen gateway integration` triggers a minor bump (`v2.4.1` → `v2.5.0`); a commit carrying a breaking-change marker triggers a major bump (`v2.4.1` → `v3.0.0`). Tools like semantic-release scan history since the last tag, compute the version, and publish a changelog entirely mechanically — which also means entirely at the mercy of whoever typed the prefix.

### Commit Messages vs. Architecture Decision Records

**What it is:** The boundary between what a commit message documents (a single, bounded change, tied to a diff) and what an ADR documents (a durable architectural decision, expected to outlive any individual commit or file it originally touched).

**Why it exists:** Some decisions matter beyond the lifetime of the code that first implemented them. A commit message explaining a major architectural pivot is discoverable only as long as `git blame` can trace a line back to it — the moment that file is deleted or substantially rewritten, the explanation goes with it. An ADR, stored as its own artifact, survives independent of any specific file's history.

**Options:**
1. **Commit-only** — architectural reasoning lives entirely inside commit bodies.
2. **ADR-only** — architectural reasoning lives entirely in the ADR registry, commits stay purely tactical.
3. **Commit references ADR** — the commit stays short and tactical, and points to the ADR by ID when the change implements or touches a recorded decision.

**Trade-offs:** Commit-only reasoning is convenient to write in the moment but evaporates under refactors, file deletions, and squash merges. ADR-only reasoning is durable but, without a pointer from the commit, a reader following `git blame` to a specific line has no way to know it even exists. Referencing the ADR from the commit costs one extra line and buys both properties: a short, targeted commit message plus a durable trail back to the full reasoning.

**When to choose each:** Use commit-only for genuinely local, bounded changes with no architectural weight. Reference an ADR from the commit whenever the change implements, revises, or depends on a decision that already has (or should have) one — small systems with no formal ADR practice can reasonably skip this, but any team already keeping ADRs (Ch 45) should default to cross-referencing rather than duplicating.

**Common failure modes:** The evaporated architecture context — a team migrates a service from synchronous transactions to an event-driven model and the only explanation of *why* lives in a 300-line commit body on the initial scaffolding commit. Two years later that scaffolding gets deleted and replaced, the explanation disappears right along with it, and new engineers reverse-engineer speculative theories about a decision that was actually well-reasoned at the time — just no longer discoverable.

**Example:** An ADR at `docs/adr/0034-multi-region-replication.md` records the trade-offs behind adopting multi-region replication. The commit that implements it stays tactical: `fix(db): handle replica synchronization timeouts (ref: ADR-0034)`. If the database driver gets replaced next year, that specific fix commit fades into ordinary history, but the durable justification for replication is still fully discoverable in the ADR registry, independent of which commit or file first implemented it.

---

### Why Smart Engineers Disagree

The real disagreement is about where engineering intent should actually live: the local, terminal-native Git log, or the code-hosting platform's pull request interface.

Engineers who center the PR argue that commit-level discipline is a holdover from email-driven, pre-platform open-source workflows. The PR description is where review actually happens — it supports rich text, threaded comments, and links to the issue that motivated the change (Ch 43) — and if the branch is going to be squash-merged into one commit anyway (Ch 52), polishing every intermediate commit message is effort spent on text that will never survive to `main`.

Engineers who center the local Git log point out that a PR description is metadata sitting in an external vendor's database, not the repository itself — if the organization migrates hosting providers, or the platform has an outage, that record is gone or unreachable, while the Git history travels along with every clone, forever. They also note that `git bisect` checks out commits in a detached-HEAD state with zero platform context attached: an on-call engineer bisecting a regression at 3 a.m. is reading commit messages, not pull request threads, and a commit history that outsourced its reasoning to the platform hands that engineer nothing.

Both positions are correct about the tool they're optimizing for. A team that reliably squash-merges and treats the PR description as the permanent record can get away with lighter intermediate-commit discipline, provided the final squashed message meets Beams' bar. A team that preserves full history (Ch 52) or relies on `git bisect` across long-lived history has no substitute for disciplined commits, because by the time anyone actually needs that history, the only context bisect runs against is the Git log — nothing else is in the room.
