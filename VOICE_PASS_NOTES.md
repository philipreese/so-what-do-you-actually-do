# Voice Pass Notes

Scaffolding for the multi-session editorial voice pass (`prompts/edit1-voice-pass.md`). Delete once every Part + Appendix B is done.

## Part I (Ch 01–09) — done

**Calibration: how much to touch.** Some chapters (esp. Ch 01, 06) came out of synthesis genuinely dry — heavy edits needed. Others (Ch 03, 08, 09) already had strong voice baked in from synthesis (specific numbers, dry asides, real narrative in failure modes) — those got 1 light touch, not a rewrite. Don't assume every chapter needs the same amount of work; read first, then decide how much is missing.

**What worked:**
- Sharpening a failure-mode's *ending* line, not its setup — the setup is usually already precise; the last sentence is where flatness hides. E.g. Ch01 "Defensive deadlock": added "That's worse than a crash: a crash at least tells someone something happened." (kept the technical claim, added the reason it matters).
- Adding one concrete real-world detail to an already-real example, e.g. Ch03 left-pad: added "eleven lines of code" and "most of its dependents had never heard of [it]" — sharper without changing the claim.
- Cutting connective throat-clearing in openers: Ch01 Purpose went from "That framing is incomplete in a way that causes most real architectural mistakes" → "That framing is incomplete, and the gap is where most real architectural mistakes live."

**What was cut / avoided:**
- Did not touch any chapter's closing recap section (e.g. Ch09 "What Part I Has Established") — those are structural summaries the style guide expects, not the "tidy inspirational" pattern the pass is supposed to kill. Leave recap sections alone.
- Avoided adding a joke to every failure mode in a chapter — capped at 1–2 real edits per chapter even when more flat spots existed, per the "pick your spots" instruction.
- Did not touch table cells, recommendation labels, or example numbers anywhere.

**AI-tell hunt — found and fixed (pre-existing in the synthesized text, not introduced by this pass):**
- "leverage(s)" as a verb — Ch06 (Kafka/OS page cache), Ch07 (Kafka/OS page cache) → replaced with "rides"/"riding"
- "paramount" — Ch02 ("reliability is paramount" → "reliability matters more than anything else"), Ch06 ("ordering is paramount" → "getting the order wrong is not an option")
- "navigate" — Ch05 ("navigate generic, parameterized code paths" → "pick their way through")
- No instances of "delve," "unpack," "landscape," "tapestry," "not just X, it's Y," or stacked hedges found — this book's existing prose didn't have the worst LLM tics to begin with, likely because the synthesis process already favored concrete claims over generic phrasing.

**Judgment calls:**
- Left "not despite its simplicity but because of it" (Ch02, SQLite) alone even though it's structurally adjacent to the banned "not just X, it's Y" shape — it's a real reversal/contrast, not empty apposition, and reads naturally rather than as a tell.
- Grep for retired words after finishing, not just during — some (paramount, navigate, leverage) were in the *original* text, not things I was tempted to add. Worth a clean grep pass per Part before committing.
