# Ch 69 — Logging: What to Log and at What Level

*A log line earns its place by passing the actionability test, not by feeling worth writing.*

A log line belongs in the system only if it passes the actionability test — a specific person, at some later point, makes a different decision because it exists — not whether it felt interesting to write. [Strong Recommendation] Log levels classify who is expected to act and how urgently, not how the author felt while writing the code, so the identical event can legitimately be DEBUG in one service and ERROR in another. Structured, machine-parseable fields beat free-text messages once logs are aggregated across more than a handful of services, and every request-scoped entry should carry a correlation ID so a request's full history is one indexed query. Logging is a cost center, not a free byproduct of execution, and logging on the chance it's needed repeats the documentation-coverage mistake with a runtime signal instead of a written one.

**Prerequisites:** [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md) (accidental complexity), Principle 6, [Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md) (MTTR), [Error Handling Contracts](../part03-api-design/ch21-error-handling-contracts.md) (correlation ID), [What to Document vs. What to Leave to the Code](../part08-documentation/ch64-what-to-document-vs-what-to-leave-to-the-code.md) (coverage vs. usefulness)

**New vocabulary introduced:** actionability test

**Key takeaways:**
- A log line belongs in the system only if it passes the actionability test: a specific person, at some later point, makes a different decision because it exists. "Was this interesting to write" is not the test; "would this change what I conclude" is.
- [Strong Recommendation] Log levels classify who is expected to act and how urgently, not how the author felt while writing the code. The identical event can legitimately be DEBUG in one service and ERROR in another, depending on who is expected to respond and when.
- [Consensus] Structured, machine-parseable fields beat free-text messages once logs are aggregated across more than a handful of services. Every request-scoped entry should carry the correlation ID from Ch 21 so a request's full history is one indexed query instead of a manual reconstruction.
- Logging is a cost center, not a free byproduct of execution: every retained line is paid for in ingestion, storage, index size, and query latency — paid at exactly the moment, an active incident, when that latency is least affordable. Logging on the chance it's needed repeats Ch 64's documentation-coverage mistake with a runtime signal instead of a written one.
- A log is a second, less-audited copy of application data, and its attack surface has two distinct sides: what gets logged (a sensitive value captured as a side effect is Part XI, Ch 83's concern) and what parses it (a pipeline that lets logged content influence what it does next, the way Log4Shell did, is Part XI, Ch 81's).

## For My Wife

Leaving notes for a babysitter, the instinct is to write down everything that happened during the day — what time snack was, which toy got fought over, what song got sung before nap. Almost none of that is actually useful to the next babysitter. The note worth leaving is the one that changes what they do: "if her temperature goes over 101, call this number," not "she seemed a little warm around 2pm but was fine." The right test was never "did this feel worth mentioning while it was happening" — it's "would the next person do something differently because I wrote this down."

This chapter argues software logs deserve exactly the same discipline, and most of them fail it. A program can narrate everything it does — every function it calls, every step it takes — the same way a diary narrates a whole day. Almost none of it is worth keeping, because almost none of it would change what the person reading it later actually does. The line worth keeping is the one attached to a real decision: a payment got declined, a system failed to reach the database it depends on — not the equivalent of "the toy got put away."

The other half of this chapter is about how urgently something gets flagged. A babysitter needs to know the difference between "mention this when the parents get home" and "call immediately" — and that label has nothing to do with how alarming it felt to the babysitter in the moment. It has to mean the same thing every time, to everyone reading it, or the "call immediately" note gets ignored the one time it actually matters, buried under a pile of routine notes that never needed the same label at all.

## For My Kids

### Don't Cry Code Red

Say you're on lookout during capture the flag, radio in hand, watching the tree line at dusk. You could report literally everything you see — a squirrel, a shadow, your own team walking past — but nobody wants that channel. **The only thing worth radioing in is something your team would actually do something different because of:** "two of them just crossed by the shed" changes what your team does next. "I think I saw a bird" doesn't.

**The second rule matters just as much: whatever word you use for "drop everything, this is serious" has to mean the exact same thing every single time.** Not how nervous you personally feel right now — an actual, agreed-on signal everyone on the team can trust without having to guess how big a deal it really is.

Say it once for something small — "code red, I think that might've been a raccoon" — and it stops meaning anything. Your team hears "code red" a few times for nothing and starts tuning the radio out entirely, the same way anyone tunes out a friend who's always convinced something's a big deal.

Then the actual two players really do come around the shed. You call it in exactly the way you always do. And this time nobody moves — because the radio already trained them not to.

> [!CAR]
> Has a friend ever said something was a huge deal so many times that you stopped believing them — and then missed the one time it actually was? What do you think you'd do differently next time?

---

Every line an application logs in production has to be generated, serialized, shipped, indexed, and stored somewhere — nothing about a `log.info()` call is free just because it's one line in the source. It's the same information-cost argument Ch 02 makes about complexity and Ch 30 and Ch 64 make about comments and documentation, just running at 3 a.m. instead of at review time. An unread log line that restates a step already visible in the code is worth exactly what a comment that restates the code next to it is worth: nothing, plus a bill. It's accidental complexity injected straight into the observability pipeline, paid for whether or not a single human ever queries it. This chapter covers what belongs in a log once logging is already the right tool for the job. Whether a log, a metric, or a trace is the right tool at all is Ch 70's question, not this one's.

### Decision: Apply the Actionability Test, Not a Severity Instinct

**What it is:** The filter for whether an event belongs in a log at all: would a specific person make a different decision because this line exists, not whether the event felt significant to the engineer who wrote it.

**Why it exists:** Developers default to asking "is this interesting?" — a code path got reached, a branch got taken, a helper function ran to completion and nobody said anything about it. Operators asking "would this change what I conclude?" get a much shorter list back. Every line that passes the developer's test but fails the operator's test is noise someone else pays to store and someone else has to scroll past at the worst possible moment to be scrolling.

**Options:**
- **Severity-driven logging** — emit a line whenever an execution state feels notable to the engineer writing the code (a database row inserted, a function entered, a branch taken).
- **Action-driven logging** — restrict lines to state transitions, invariant violations, boundary crossings, and anomalies that require a specific downstream response or investigation.

**Trade-offs:**

| | Pros | Cons |
|---|---|---|
| Severity-driven | Minimal upfront design; produces a detailed local trace during initial development | Massive noise at production scale; high log-to-signal ratio buries the failures that actually matter |
| Action-driven | Small production footprint; every line returned by an incident query carries diagnostic weight | Requires deliberate judgment at write time and in review; a genuinely novel failure mode can fall outside what anyone anticipated logging |

**When to choose each:** [Strong Recommendation] Action-driven logging for every production service. Severity-driven logging is acceptable only in ephemeral local branches or short-lived prototypes, never past that point.

**Common failure modes:** *The Warning Flood.* A service logs a WARN every time a user submits an invalid form field or an expired token — both routine outcomes of normal traffic and automated scanners doing their usual scanning. Because these fire constantly, the operational team stops reading WARN-level output at all. When a real anomaly shows up — an intermittent database replica connection drop, say — it logs at the same level and gets the same reflexive shrug as the thousands of routine warnings around it. Nobody notices until the outage is already user-visible.

**Example:** A payment service should log `payment_authorized`, `authorization_declined`, `gateway_timeout`, and `fraud_rule_triggered` — each one a state transition somebody might have to act on. It should not log that its internal `validateCard()` helper ran; a future reader needs to know that validation failed and which rule failed, not that a function got called, which functions tend to do.

---

### Decision: Log Levels Are a Triage Classification, Not a Record of Developer Sentiment

**What it is:** A log level tells whoever is filtering output how to treat the event during investigation — it does not measure how surprised or frustrated the engineer was when they wrote the line.

**Why it exists:** Without a shared, disciplined meaning attached to each level, filtering breaks down entirely — everyone's ERROR means something different, which is the same as nobody's meaning anything. The convention traces back to syslog's long-standing severity taxonomy, which established that operational events get classified by significance to a responder, not narrated chronologically like a diary. An ERROR should mean "this operation failed and needs investigation," not "this surprised me while I was writing the code at 11 p.m."

**Options:** At minimum: `DEBUG`, `INFO`, `WARN`, `ERROR`. Some systems add `TRACE`, `FATAL`, or `CRITICAL` as finer gradations of the same idea.

**Trade-offs:**

| Level | What it should mean | Common misuse |
|---|---|---|
| DEBUG | Rich diagnostic detail, filtered out entirely in standard production operation | Left enabled in production, where it dominates ingestion volume for no corresponding benefit |
| INFO | A macro-level lifecycle event — service startup, config reload, an expected outcome like a declined card | Used for every internal step, becoming a second DEBUG stream |
| WARN | A non-fatal anomaly worth automated tracking but no immediate response | Used for routine, expected user error (see the Warning Flood, above) |
| ERROR | A localized failure requiring investigation or intervention | Used for expected, already-handled outcomes, which erodes the level's meaning until nobody trusts it |

**When to choose each:** The same underlying event can be legitimately classified differently in different services, because different operators are expected to respond differently. A failed login from an incorrect password is ordinarily INFO — the authentication system behaved exactly as designed. A failure to reach the authentication database is ERROR — the service failed to perform its function. An expected, automatically retried network timeout may be WARN in one service and DEBUG in another, if the retry completely masks the failure from any caller.

**Common failure modes:** Severity inflation — expected, already-handled outcomes (a declined card, an invalid token) get logged as ERROR because they *feel* like failures. ERROR volume grows in lockstep with ordinary traffic, and the one ERROR entry that represents an actual infrastructure failure becomes indistinguishable from the thousands of routine ones sitting next to it. What happens once that erosion feeds an alerting pipeline is Ch 71's subject, not this chapter's — but the erosion itself starts right here, at the moment someone decides what level to assign.

**Example:** The classic Unix syslog severity scale (`LOG_EMERG` down to `LOG_DEBUG`) is the industry's oldest working example of this discipline: levels map to operational posture, not authorial emotion, and infrastructure at the aggregation boundary gets configured to drop `DEBUG` entirely under normal operation.

---

### Decision: Structured Fields Beat Free-Text Messages at Any Real Scale

**What it is:** The choice between emitting an unconstrained, human-readable string per log line versus a stable set of machine-parseable key-value fields, typically serialized as JSON.

**Why it exists:** A free-text line (`"User 98321 connected from 192.168.1.50"`) reads fine for one engineer tailing a single file locally. It gets expensive fast for a centralized log platform processing thousands of events per second across hundreds of services — extracting a specific field means a regular expression that a routine text change can silently break, and the downstream query or dashboard built on it goes blind without so much as a warning.

**Options:**
```
Free-text:
[INFO] 2026-07-02 09:15:00 - User 98321 connected from IP 192.168.1.50

Structured:
{
  "timestamp": "2026-07-02T09:15:00Z",
  "level": "INFO",
  "event": "user_connected",
  "user_id": "98321",
  "client_ip": "192.168.1.50",
  "correlation_id": "req-01j1p5x7"
}
```

**Trade-offs:** Free-text costs nothing to write and nothing at runtime to serialize, but it's effectively unqueryable at scale — filtering on a specific field means a full-text scan or a fragile regex extraction, either of which saturates the log cluster's CPU during exactly the high-volume moment a query is most needed. Structured fields turn logs into an actual queryable dataset: a centralized backend such as an ELK-style pipeline can index a specific key directly and filter billions of records in milliseconds, at the cost of a small, continuous serialization tax on the application's execution path and a real discipline requirement around field naming that somebody has to enforce.

**When to choose each:** [Consensus] Structured JSON for any production service feeding centralized aggregation — which, past a handful of services, is effectively all of them. Free-text remains acceptable for a standalone CLI tool or local script whose entire audience is one engineer watching a terminal, i.e. the last place anyone still tails a log by eye.

Every request-scoped structured entry should include the correlation ID introduced in Ch 21. Even before Ch 72's full distributed trace context exists, a consistent `correlation_id` field lets an on-call engineer run one indexed query and reassemble a request's chronological history across thread and service boundaries — a floor of visibility a service gets almost for free, well before it invests in tracing infrastructure proper.

**Common failure modes:** *The schema collision.* Team A logs a field named `context` as a plain string (`"context": "database_retry"`). Team B logs a field with the same name as a nested object (`"context": {"error_code": 500, "retry_count": 3}`). When the centralized indexer meets both shapes under the same key, it rejects the conflicting payloads — Team B's failure telemetry quietly disappears from the index mid-incident, and nobody notices until they go looking for it and find nothing there. A narrower version of the same failure: a service generates a correlation ID at request start but only logs it on the first line, so every later entry for that request is orphaned from it and the timeline can't be reassembled by that field alone.

**Example:** Structured JSON logs are the input format centralized platforms such as Elasticsearch/ELK are built to index directly, no extraction step required — the format is doing the work a free-text pipeline would otherwise need a regex army for.

---

### Decision: Treat Ingestion Volume as a Budget, Not a Convenience

**What it is:** Whether to log broadly on the chance that some future, unpredicted failure needs the context, versus deliberately restricting standard-operation logging and capturing deep detail only once an actual error occurs.

**Why it exists:** "Log everything, in case it's needed" is Ch 64's documentation-coverage mistake wearing a different costume: volume that satisfies an instinct about future usefulness rather than a demonstrated one, and it's not free just because nobody's paying it in one lump sum. Ingestion, indexing, and query latency all scale with volume, and at high enough throughput a logging platform's bill can rival the cost of the compute infrastructure it's supposed to be watching. Verbose, unreviewed logging also opens a second data-exposure surface: incidental secrets or personal data logged as a side effect become a copy of sensitive data sitting in a store nobody's auditing as carefully as the primary one — a boundary this chapter flags and leaves to Ch 83.

**Options:**
- **Comprehensive, on-the-chance ingestion** — log broadly across execution paths and payload contexts, relying on storage capacity to retain it for whatever investigation eventually needs it.
- **Intentional filtering** — restrict standard-operation logging to boundary state transitions, and rely on dynamic log-level changes or explicit error-context capture to go deep only once something has actually gone wrong.

**Trade-offs:** Comprehensive ingestion means the forensic evidence for a rare, non-reproducible failure is already captured when it happens — at the cost of a large, continuously growing financial and operational bill, degraded query performance across the whole platform, and an expanded exposure surface for anything sensitive that ends up in the payload. Intentional filtering keeps ingestion volume and cost predictable and keeps queries fast even under load, at the cost of needing more deliberate tooling — dynamic log-level control, or a local buffer flushed only on error — to recover deep detail when a genuinely novel failure does occur.

**When to choose each:** [Strong Recommendation] Intentional filtering as the default for any mature, high-traffic, multi-tenant, or regulated system, where cost predictability and data-exposure discipline are hard constraints. Comprehensive ingestion is defensible only in early-stage, low-volume, or short-lived systems where compute cost is trivial relative to the value of not having to guess.

**Common failure modes:** A service under an on-the-chance logging policy logs the full request body of every incoming request, malformed ones included. An unthrottled attack sends malformed payloads at volume; ingestion spikes, saturating the log backend's disk I/O; the log cluster falls over under the load, and the team investigating the attack loses visibility into every other service at the exact moment they need it most. The logging policy that was supposed to provide forensic insurance during an incident instead causes the outage that erases it.

**Example:** The Log4Shell vulnerability (CVE-2021-44228) proved that a logging library is part of a system's attack surface, not some passive utility sitting politely outside it. Applications that logged raw, unvalidated user input — an HTTP `User-Agent` header, for instance — through a vulnerable version of Apache Log4j let a crafted string trigger remote code execution inside the logging call itself. Logging everything without validating or scrubbing what gets logged isn't a neutral default; it's an architectural risk decision, just one made by omission instead of on purpose. The defect itself was a missing input-validation step on untrusted data before it reached an interpreter capable of acting on it — Part XI, Ch 81's subject, not a logging-level or secrets mistake.

---

What triggers a human to get paged over something a log recorded is Ch 71's decision, not this chapter's. Correlating a correlation ID across service boundaries into a full causal trace — trace ID, span ID, propagation — is Ch 72's mechanism; this chapter only establishes that the field belongs in every entry. And the mechanics of keeping a secret out of a log line in the first place belong to Ch 83, not here.

### Why Smart Engineers Disagree

The disagreement isn't about whether logging is useful — it's about how much production visibility is worth its ongoing cost, and it splits engineers who've been burned by missing information from engineers who've been burned by the bill and the noise.

One position holds that disabling deep diagnostic logging in production is a false economy: distributed systems fail in emergent, non-deterministic ways no staging environment reproduces, and without step-by-step state the responder is left guessing, which extends MTTR directly. This position treats the resulting storage and ingestion cost as a justifiable price for engineering clarity, and pushes for DEBUG-level detail to stay available, if not always active, at all times.

The opposing position treats continuous, high-volume production debugging as a design failure in its own right. At meaningful throughput, the string allocation, serialization, and I/O cost of emitting deep-detail logs on every request measurably throttles the service producing them, and the ingestion bill grows with traffic whether or not anything is actually wrong. This position argues that needing a continuous text narrative to confirm a service is behaving correctly is itself a symptom of insufficient modular design (Part IV) — not a logging gap.

Both positions are correct for the system each one has in mind. A low-volume, high-consequence orchestration path — a multi-step billing settlement — can absorb deep logging on every request; the cost is negligible next to the cost of an undetected miscalculation. A high-throughput ingestion path — a message router processing tens of thousands of events per second — cannot; a log line per event there throttles the very system it's meant to observe. The resolution most mature systems converge on is decoupling recording from extraction rather than picking one philosophy globally: keep production-filtered, action-driven logging as the default everywhere, but hold a local, in-memory ring buffer of recent DEBUG-level detail per request. On success, that buffer just gets overwritten by the next request's detail. Only when an actual error is detected does the service flush it to the central log store — paying the full ingestion cost of deep detail exactly once, for the one request that needed it, and nothing for the millions around it that didn't.
