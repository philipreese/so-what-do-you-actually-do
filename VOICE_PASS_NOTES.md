# Voice Pass Notes

Scaffolding for the multi-session editorial voice pass (`prompts/edit1-voice-pass.md`). Delete once every Part + Appendix B is done.

## IMPORTANT CALIBRATION CORRECTION (read this first)

The first pass at Part I (1-2 light edits per chapter, ~5-10 line diffs) was **too conservative** — user feedback: "I was expecting a lot more changes than this." Corrected calibration, confirmed by the user as "both broader AND bolder":

- **Broader:** touch most paragraphs in a chapter, not just 1-2 highlight moments. Nearly every "What it is" / "Why it exists" paragraph, failure-mode bullet, and example should get reworked for rhythm and word choice, even where the original wasn't strictly "bad."
- **Bolder:** don't just swap a flagged word or add one clause. Rewrite the sentence or paragraph around it — vary sentence length, add a real aside, restructure the rhythm. A word-level fix (leverage -> rides) is a tell-removal, not a voice pass, and doesn't count toward the "loosen the prose" goal on its own.
- **Target diff scale per chapter:** Part I chapters (~150-220 lines) ended up with roughly 30 insertions / 30 deletions each after recalibration. That's the right ballpark — not 4 lines, not a full rewrite of every sentence either.
- Still do NOT touch: headings, template section labels, table cells/numbers, recommendation labels (`[Consensus]` etc.), cross-reference links. Verified after each chapter with a diff grep for these patterns — they stayed byte-identical through both the light and heavy passes.
- Still cap at 1-2 places per chapter for an actual joke/aside; the "broader" instruction is about reworking flat prose throughout, not adding more jokes.

## AI-tell hunt

- Grep the diff (added lines only) for the retired-word list *after* finishing each chapter, not just once at the end of a session — it's easy to accidentally introduce one while rewriting (happened twice with "load-bearing" during the Part I heavy pass, both caught by post-hoc grep and fixed).
- Also worth checking recommendation-label text is byte-identical before/after (not just "did I touch a `[Strong Recommendation]` line" — the surrounding prose changes on every line, so a raw diff grep isn't enough; extract just the bracketed label text and diff that in isolation).

## Part I (Ch 01–09) — done, recalibrated

Two commits: first pass (light, superseded in spirit but not reverted) then a full recalibration pass reworking most paragraphs in all 9 chapters. Diffs of the second pass ran ~30/30 lines per chapter.

**What worked well (heavier pass):**
- Rewriting a "Why it exists" paragraph's rhythm entirely rather than just its word choice — e.g. Ch06: "Hardware doesn't care about your one request — it cares about keeping caches warm, pipes full, and disks busy, which it does best in batches."
- Turning a dry example into a sharper one with one added concrete, true detail (Ch03 left-pad: "eleven lines of code that padded strings with leading characters").
- Varying sentence length aggressively — short punchy sentence after a long one, especially at section openings and closings.

**What stayed untouched by design:**
- Recap/summary sections (Ch09 "What Part I Has Established") — structural, not the "tidy inspirational" pattern being hunted.
- All table contents, all numbers, all recommendation label brackets.

## Part II (Ch 10–18) — done

Applied the recalibrated (broader + bolder) approach throughout, no light-pass-then-redo needed. Ch 10-12 got a light pass first (before the recalibration landed mid-session) and were deepened afterward to match; Ch 13-18 got the heavy treatment from the start. All 9 chapters landed in the same ~20-30 insertions/deletions range as Part I — consistent regardless of chapter length (Ch14 is short at 77 lines and came out ~18/18, proportionally the same).

**One new judgment call:** two Part II sentences drafted with "load-bearing" got caught and fixed before commit (Ch07 in Part I, none in Part II this time — the retired-word grep is now a reliable habit, not a one-off catch). Keep running it per-chapter or per-part before committing; it's cheap and it's caught a real mistake every time so far.

**Pattern that keeps working:** rewriting a Trade-offs bullet pair as two sentences with matching structure but opposite payloads (e.g. Ch12: "no adapter layer to write... but vendor vocabulary... leaks directly into the domain" -> "zero adapter layer to write, vendor SDK objects pass straight through the codebase untouched — and vendor vocabulary... leaks directly into the domain right along with them"). The parallelism makes the trade-off land harder without changing what's actually being traded.

## Part III (Ch 19–26) — done

Applied the recalibrated approach from the start, no light-pass-then-redo needed. All 8 chapters (this Part has 8, not 9 — Ch 19 through Ch 26) landed at ~23-32 insertions/deletions each, same range as Parts I and II. Diff stat for the whole Part: 208 insertions / 208 deletions across 8 files.

**Two retired words caught in the *original*, unedited book text** (not introduced by this pass — present in the synthesized chapters before any voice-pass editing touched them): Ch19 had "REST leverages the mechanics..." (leverage-as-verb), Ch21's closing essay had "load-bearing infrastructure, not decoration," and Ch22's Stripe example had "the client experiences a seamless success." All three got rewritten as part of the normal paragraph rework for those sections — worth noting because it means the retired-word grep is catching pre-existing book prose, not just things this pass might introduce. Good sign the grep step is pulling real weight, not just checking work already known to be clean.

**One new judgment call:** Ch26 (FFI/native bindings) is a genuine register shift from the rest of Part III — it's the one chapter in the book so far explicitly about a *language* boundary instead of a *network* boundary, and the original prose already flagged that ("a deliberate register change"). Resisted the urge to force in extra jokes to match the surrounding chapters' rhythm — the subject matter (segfaults, memory corruption, undefined behavior) already carries enough of its own dry, deadpan energy that added humor would compete with it rather than support it. Used the "coat check" aside once and left it at that.

**Pattern that keeps working, restated:** opening a "Why it exists" paragraph by restating the mechanical fact more bluntly before pivoting to the human consequence (e.g. Ch26: "A CPU never reads source code — it reads memory addresses and registers, full stop"). Landing the blunt version first, then the implication, reads more like a person explaining something than a spec restating itself.

## Part IV (Ch 27–33) — done

Different template flavor from Parts I-III: recommendation labels (`[Consensus]`, `[Strong Recommendation]`, `[Legitimate Trade-off]`) appear inline at the start of a paragraph, immediately followed by a **bolded key term** (e.g. `[Strong Recommendation] **Core-owned ports** make the dependency rule...`), rather than bundled into a bracketed sentence at the end of an Example line. Treated the same as before: bracket tag left untouched, bolded term immediately after it left untouched (it's naming the option being recommended, not prose), everything else fair game. Verified byte-identical labels the same way as Parts I-III — the extraction regex doesn't care about the paragraph-position difference.

This Part also has real code blocks (Go, Rust, Java) inside several chapters (Ch27, Ch32, Ch33) — added a new verification step beyond the usual four: diff just the fenced-code-block content in isolation (`awk '/^```/{f=!f;next} f'` on before/after) and confirm it's byte-identical. All three chapters passed clean; only the prose around the code blocks changed.

7 chapters (not 9 — this Part runs Ch 27 through Ch 33), landed at 56-76 insertions/deletions each depending on chapter length, 232/232 total across the Part. Ch32 (error handling) and Ch33 (unsafe code) ran the densest — both are technical-precision-heavy chapters with a lot of named failure modes (*The Ghost Crash*, *The Catch-and-Ignore Block*, *The DIY Panic Wrapper*, *The Leaky Pointer Contract*), and those italicized failure-mode names were left untouched as a structural label, same treatment as headings.

**One new AI-tell catch:** Ch29 had "help humans navigate a codebase" in a from-scratch rewritten sentence — "navigate" is on the retired list even in this completely mundane, non-metaphorical usage ("find a file," not "navigate the landscape of"). Fixed to "find their way around a codebase." Confirms the grep should run literally, not just for the metaphor-heavy version of a word — the retired list bans the word, not just the cliché phrase built around it.

**Judgment call on technical density:** Part IV chapters (naming, error handling, unsafe code) carry more precise engineering claims per paragraph than Parts I-III's more architectural material. Kept rewrites to rhythm/word-choice/connective-tissue changes and did not loosen any claim's precision — e.g. "profiling under production conditions" and "database-level uniqueness constraint"-style specificity stayed exactly as specific after rewriting, just less flatly worded.

## Part V (Ch 34–41) — done

Same inline-label template as Part IV. All 8 chapters landed at 54-82 insertions/deletions each (denser chapters like Ch36 and Ch40 ran higher — both are 139-204 lines with a lot of named failure-mode scenarios), 279/279 total across the Part. Several chapters (Ch37, Ch40) have Go/JS code blocks; all verified byte-identical via the fenced-code-block diff check established in Part IV.

**One AI-tell catch, same word as Part IV:** Ch37 had "how teams navigate that particular tension" in a from-scratch sentence — "navigate" again, again in a totally mundane non-metaphorical sense. Fixed to "work through." Two Parts running into the same word in ordinary, non-cliché usage suggests it's worth specifically grep-checking "navigate" as a standalone habit-word, not just watching for the "navigate the landscape" cliché construction.

**Reused phrase caught by self-monitoring, not fixed:** noticed mid-Part that "2 a.m." (as in "auditing a production incident at 2 a.m.") had already appeared in Part II (Ch16) and Part III. Used it once early in Part V (Ch37's fixture chapter) then deliberately avoided it for the rest of the Part, swapping in "under pressure" instead in Ch32/Ch39 contexts. Worth a light watch across future Parts — a handful of specific images (2 a.m. on-call, junk drawer, trench coat) are useful but shouldn't become the book's tic the way the AI-tell list describes avoiding in the first place.

**Judgment call on technical density:** this Part (mocking taxonomy, fixture reset semantics, coverage measurement hierarchy) is the most terminology-dense so far — Fowler's test double taxonomy, Goodhart's Law, execution-verification gap, etc. Rewrote rhythm and connective tissue throughout but left every named term, every hierarchy tier, and every specific tool name (Testcontainers, Hypothesis, PIT, mutmut) exactly as precise as the original — loosening prose here means loosening the sentences around the facts, never the facts themselves.

## Part VI (Ch 42–49) — done

Different template flavor again: inline `[Strong Recommendation]`/`[Consensus]` labels (like Parts IV-V), but denser prose with fewer named failure-mode italics per chapter than Part V. All 8 chapters landed at 20-28 insertions/deletions each, 195/195 total across the Part — tighter and more consistent range than any prior Part, likely because these chapters (issue tracking, PR review, ADRs, spec-first dev, technical debt, process overhead) run shorter and more uniform in structure than Parts IV-V's code-heavy chapters.

**Two more pre-existing retired words caught in original book text, both in Ch45's closing "Why Smart Engineers Disagree" section:** "load-bearing architectural assumption" — rewrote as "an assumption the whole system depends on ... with nobody left who remembers it was ever a choice at all." Third time `load-bearing` has turned up in unedited prose across this pass (Part I, Part III, now Part VI) — it's evidently a natural phrase to reach for when the synthesis models write about compounding technical risk, worth grep-checking specifically in every remaining Part.

**Pattern that keeps working:** ending a Trade-offs or Why-it-exists paragraph on a short, blunt clause instead of trailing off — e.g. Ch48: "the other one is just a mess with a nicer name," Ch44: "usually on a Friday." Keeps the 1-2-jokes-per-chapter cap intact since these are one clause tacked onto an existing sentence, not a whole new joke paragraph.

**Judgment call:** Ch49 (Process Overhead) closes Part VI the same way Ch39 closed Part V and Ch09 closed Part I — a reflective, meta chapter auditing the Part's own claims. Treated its "Why Smart Engineers Disagree" section with the same restraint as other closers: tightened rhythm, cut no claims, added no jokes (the subject — when process stops earning its cost — carries its own dry irony without needing a punchline bolted on).

## Part VII (Ch 50–63) — done

Largest Part in the book (14 chapters, not 8-9). Same inline `[Strong Recommendation]`/`[Consensus]`/`[Legitimate Trade-off]` label template as Parts IV-VI. Diffs ran narrower than prior Parts overall — 7 to 18 insertions/deletions per chapter, 174/174 total across the Part — because Git-mechanics chapters (branching, commits, force-push, CI caching) run denser and more technical per line than Parts IV-VI's material, leaving less room for rhythm rework without touching mechanical claims. Shortest diffs (Ch59 at 8/8, Ch61 at 7/7) were the most acronym/setting-dense chapters (cache keys, semantic-release internals) where most sentences already carried maximum technical load.

**One near-miss on the retired-word grep:** Ch53's rewrite of a Why-it-exists paragraph landed on "nobody trusts it as a navigation tool anymore" — the retired-word regex correctly flagged `navigat` even though this is the ordinary noun "navigation," not a metaphor. Confirms the Part IV/V lesson (grep bans the literal string, not just the cliché) cuts both ways: it also catches completely mundane uses that aren't AI-tells at all, so every hit still needs a human read, not a blind find-and-replace. Rewrote to "nobody trusts it enough to search it anymore" — cleaner anyway.

**Pre-existing retired word caught again:** Ch57's intro had "Fast and trustworthy are both load-bearing" in the original, unedited text — the fourth `load-bearing` catch across this pass (Parts I, III, VI, now VII). At this point it's confirmed as the single most common AI-tell surviving in the original synthesis-model prose; worth a standalone grep pass over any future Part before starting the per-chapter pass, not just catching it incidentally during rewrites.

**Pattern that keeps working, restated again:** ending a paragraph on a short, blunt clause — Ch53: "gathering dust," Ch60: "not to a generic notion of thoroughness that doesn't tell the two apart." Still the highest-value, lowest-risk move for the 1-2-jokes-per-chapter budget: it reads as personality without adding a whole new sentence's worth of risk to a technical claim.

**Judgment call on the Part's closer:** Ch63 (Toolchain and Dependency Management) explicitly bookends back to Ch50 in its own closing lines ("Part VII began with... It ends here..."). Left that bookend paragraph's structure untouched and only tightened rhythm within it, consistent with how other Part-closing meta-passages (Ch09, Ch39, Ch49) have been treated — the callback is doing real structural work, not just flourish.

## Part VIII (Ch 64–68) — done

Small Part (5 chapters, Documentation). Distinct template flavor from Parts VI-VII: `### Decision: [Title]` headers instead of `### [Name]`, heavier use of markdown tables (trade-off tables, and Ch64's docstring-stub example table), and each chapter's closer is titled "Why Smart Engineers Disagree on [specific topic]" (e.g. "...on Documentation Volume") rather than the generic "Why Smart Engineers Disagree" used everywhere in Parts VI-VII. All 5 chapters landed at 10-19 insertions/deletions each, 68/68 total across the Part — tightest range yet, likely because this Part's chapters are shorter and more uniformly structured (3 Decision sections each) than Part VII's git-mechanics chapters.

**No new retired-word catches this Part** — first Part since III without at least one pre-existing `load-bearing`/`navigate`/etc. hit in the original synthesis text. Still ran the grep per chapter as usual; came back clean every time.

**Two tables per chapter left completely untouched, confirmed by targeted diff:** Ch64's trade-off tables and its tautological-docstring-stub example table (`FetchUserByID` / `IsCacheValid` rows), Ch65's artifact-comparison table, Ch67 and Ch68's option/trade-off tables. No table cell content changed in any of the 5 chapters — only the prose immediately surrounding them.

**Pattern that keeps working, restated again:** ending a Why-it-exists or failure-mode paragraph on a short blunt clause — Ch64: "a fossil wearing the clothes of a live document," Ch65: "you don't edit the transcript, you file an addendum," Ch68: "a puzzle box hiding the real problem." Still the reliable move within the 1-2-jokes-per-chapter budget.

**Judgment call on topic-specific closers:** unlike Parts VI-VII's generic "Why Smart Engineers Disagree" title, every Part VIII closer names its actual axis of disagreement in the heading itself (Documentation Volume, whether specs/ADRs can change, deletion vs. preservation, narrative investment, guidance vs. automation). Left every closer heading exactly as-is — these aren't flourish, they're doing the same structural labeling job as the rest of the template and were treated like any other heading.

## Part IX (Ch 69–73) — done

Back to the generic "Why Smart Engineers Disagree" closer title (Part VIII's topic-specific pattern didn't carry forward into Observability). Same inline `[Strong Recommendation]`/`[Consensus]` label template as Parts IV-VII, `### Decision: [Title]` headers like Part VIII, and heavy use of both markdown tables and fenced diagram/formula code blocks (Ch70's signal-comparison and question-routing tables, Ch72's trace-context ASCII diagram, Ch73's burn-rate formula block) — all left completely untouched, verified with the Part IV-established code-block-isolation diff in addition to the usual table check. All 5 chapters landed at 10-21 insertions/deletions each, 70/70 total across the Part.

**No new retired-word catches this Part** — second Part in a row (after VIII) clean on the first pass, no pre-existing `load-bearing`/`navigate`/etc. hits in the original synthesis text either.

**Pattern that keeps working, restated again:** ending a Why-it-exists or failure-mode paragraph on a short blunt clause — Ch69: "which functions tend to do," Ch70: "a log's cost structure wearing a metric's name tag," Ch73: "declining to take risk the objective already signed off on." Still the reliable, low-risk move for the 1-2-jokes-per-chapter budget.

**Judgment call on technical density:** this Part (log cardinality, trace propagation, burn-rate math, SLI/SLO/SLA taxonomy) is as precision-heavy as Part V's testing terminology — every named formula, every specific number (43 minutes/month at 99.9%, a 14.4 burn-rate multiplier, Prometheus's label-set model), and every tool name (OpenTelemetry, Dapper, PagerDuty, kafka-lag-exporter) stayed exactly as precise after rewriting. Loosened only the connective prose around the numbers, never the numbers themselves.