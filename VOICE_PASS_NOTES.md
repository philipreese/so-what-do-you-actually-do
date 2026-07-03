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
