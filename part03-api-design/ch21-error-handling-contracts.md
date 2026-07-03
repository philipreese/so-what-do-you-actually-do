# Chapter 21 — Error Handling Contracts

**Prerequisites:** [Part I, Ch 07 — Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md), [Part II, Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Ch 16 — Versioning and Backward Compatibility](../part02-software-architecture/ch16-versioning-backward-compatibility.md). Specifically: minimal surface area, backward vs. breaking changes, and partial failure.

**New vocabulary introduced:** correlation ID

**Key takeaways:**
- Error responses are part of the API surface (Ch 15), and they carry the exact same backward-compatibility obligations as a success response does (Ch 16). An undocumented, inconsistent error shape is a contract violation whether or not anyone ever bothered to call it "the contract."
- A status code alone is too blunt an instrument to act on. A structured error body — a stable machine-readable code, a human-readable message, a correlation ID — is what lets a client branch on failure instead of regexing prose like it's 2004.
- The 4xx/5xx boundary isn't a style preference, it's a retry contract: 4xx says the same request will never succeed unchanged, 5xx says it might. Get this classification wrong and you haven't just confused a human reading logs — you've broken automated retry logic, in a specific and entirely predictable direction.
- One HTTP status code cannot represent a batch operation where some items succeeded and others didn't. Partial failure (Ch 07) at the wire level needs a per-item result, not an all-or-nothing verdict that pretends the operation was atomic when it plainly wasn't.

## For My Wife

**When software calls another piece of software and something goes wrong, there's a decision hiding inside how the failure gets reported: is it the caller's fault, or the system's fault?** The web has a built-in answer for this — a range of numeric codes where 400-level means "you asked for something wrong, sending it again won't help," and 500-level means "we're having a problem on our end, maybe try again." Getting this backwards has mechanical consequences: an automated retry system that sees a 500 (server fault) will keep resending a request that was actually rejected because a required field was missing — trying indefinitely because it was told to keep trying, charging the server thousands of requests to tell the client the same thing over and over.

**The chapter's second argument is that the error message itself is part of the contract — not a bonus, not a detail.** A plain "something went wrong" buried in a response body is useless to code that needs to branch on failure type. A structured error — a stable machine-readable code (`insufficient_funds`), a human-readable explanation, and a tracking identifier that lets support trace the exact failure through the logs — is what lets a calling system handle `insufficient_funds` differently from `card_expired` instead of treating every failure as a single category of "bad." The tracking identifier (called a correlation ID) is especially underrated: it's the difference between a support ticket that goes nowhere and one that resolves in five minutes.

> [!NOTE]
> There's a known anti-pattern where a server wraps an error inside a `200 OK` response — technically "everything went fine delivering this message" while the message itself says the operation failed. This breaks monitoring tools, CDN caches, and retry logic all at once, since every layer between the client and server reads the 200 and concludes nothing is wrong.

Miss this on a batch operation that sends a hundred records at once — where forty succeeded and sixty failed — and returning a single pass/fail answer means either lying about the forty successes or the sixty failures. Real batch APIs return a per-item result, and skipping that costs you a system that silently eats data with no way to recover which pieces made it through.

---

## Structured Error Responses

**What it is:** Returning a consistent, typed payload for every failure — a machine-readable code, a human-readable message, and a correlation ID — instead of a bare status code or free-form text.

**Why it exists:** A status code alone is too imprecise to act on. `400 Bad Request` tells you the client made a structural mistake — not which field, not why, not how to recover programmatically. A structured body closes that gap, for any client that has to act on the failure instead of just showing a human a red banner.

**Options:**
1. **Flat string messages** — a human-readable string in the body (`"Invalid email format"`)
2. **Structured error objects** — a stable error code, a descriptive message, and a correlation ID a caller can hand to support or trace internally

**Trade-offs:**
- *Flat strings:* trivial to write, barely any payload — and completely unactionable by code. A client trying to handle `insufficient_funds` differently from any other failure has to regex a human sentence, and that regex breaks the moment the provider rewords the message for clarity.
- *Structured objects:* the human-readable message and the machine-actionable state finally get to live apart — but every code and field name you emit becomes a permanent fixture of the contract (Ch 15), supported forever whether you meant it to be or not.

**When to choose each:**
- *Structured objects:* the default for any machine-to-machine API, public SaaS REST API, or mobile backend.
- *Flat strings:* acceptable only for internal CLI tools or scripts consumed exclusively by a human.

**Common failure modes:**
- **The "200 OK" error:** an exception gets caught at the framework level, and the response comes back `200 OK` anyway, with `{"error": true, "message": "Failed to save"}` buried inside it. Every piece of standard HTTP-level monitoring, CDN caching, and gateway metrics now cheerfully reports 100% success while every single client is actually broken.
- Returning a bare `"error": "something broke"` with no machine-readable classification anywhere, or an error shape that changes personality from one endpoint to the next.

**Example:** Stripe's error object — a broad `type` (`card_error`), a stable machine `code` (`insufficient_funds`), a human message, and the specific `param` that failed — is the de facto industry reference at this point. RFC 7807 ("Problem Details for HTTP APIs") standardizes the identical idea with `type`, `title`, `status`, and `detail` fields, and Google's gRPC error model (`status`, `code`, typed `details`) does the same job for strongly typed RPC systems — three unrelated ecosystems, landing on the same structural answer independently. **[Consensus: every production error response needs a stable machine-readable code and a correlation ID, independent of which standard's field names you use]**

---

## The Client vs. Server Fault Domain

**What it is:** The strict segregation of failures into client errors (4xx — the caller's request was wrong) and server errors (5xx — the provider degraded), used as a retry contract, not just a classification label.

**Why it exists:** Whether retrying a failed request can help at all is a mechanical fact about whose fault it was, not a matter of optimism. A 4xx means resending the exact same payload will never work — the request itself has to change. A 5xx means the provider might genuinely have recovered by the time the retry lands.

**Options:**
1. **Generic error bucketing** — broad `400` for client mistakes, broad `500` for everything else, with the JSON body carrying the real distinction
2. **Semantic fault segregation** — the specific failure maps to a precise status (`409 Conflict`, `429 Too Many Requests`, `502 Bad Gateway`, `503 Service Unavailable`)

**Trade-offs:**
- *Generic bucketing:* less for the backend developer to think about while writing the exception handler — and every client now inherits that laziness, parsing the body just to learn what kind of failure this even was, while any edge infrastructure routing on status code alone breaks outright.
- *Semantic segregation:* lines up neatly with standard web infrastructure — a proxy or service mesh retries a 503 automatically and rejects a 400 on sight, no custom logic required — but jamming a rich set of internal domain exceptions into a rigid, decades-old status code set occasionally feels exactly like forcing a square peg into a round hole.

**When to choose each:**
- *Semantic segregation:* the default for every RESTful boundary and public API.
- *Generic bucketing:* never, for a genuinely resource-oriented API — it isn't a real option, it's the failure mode this section exists to name.

**Common failure modes:**
- **The 500 amplification:** a missing required field slips right past validation; the unhandled exception bubbles up, and the framework returns a generic `500`. The client's SDK sees a 5xx, assumes transient degradation, and retries the same malformed payload ten times with exponential backoff — turning one small validation gap into a self-inflicted denial-of-service the client aims at its own provider.
- Treating every `5xx` as permanent and giving up on the spot, or retrying a `429` or validation failure as though it were transient — both of these invert the exact contract this section is trying to establish.

**Example:** Hit a rate limit on GitHub's API and you get back a precise `429 Too Many Requests`, not a generic `400` or `500` shrug. Because the fault domain is explicit, any off-the-shelf HTTP client or service mesh already knows to back off — no GitHub-specific parsing required, no special-casing anywhere.

---

## Partial Failure in Batch Operations

**What it is:** The wire-level representation of a request that mutates many independent items at once, where some succeed and others fail — and a single HTTP status code can't express that split.

**Why it exists:** A batch insert of 100 records that succeeds on 99 and dies on 1 — a duplicate key, say — is exactly the partial failure (Ch 07) distributed systems churn out constantly, on schedule. Force one status code onto that result and you're lying about either the 99 successes or the lone failure. There's no version of "just pick one" that isn't a lie to somebody.

**Options:**
1. **All-or-nothing (atomic)** — the whole batch runs in one transaction; any single failure rolls back everything and returns one `4xx`/`5xx`
2. **Per-item result (multi-status)** — the request is accepted, processed as far as possible, and the response lists each item's individual success or failure

**Trade-offs:**
- *All-or-nothing:* dead-simple mental model for the client — it either fully worked or it fully didn't — but at any real scale, the odds that at least one item in a large batch fails creep toward 100%, which quietly makes large atomic batches unusable in practice.
- *Per-item result:* throughput goes up and good data lands even when some of it doesn't — but the client absorbs real complexity in exchange, parsing out which items failed and assembling its own smaller retry batch by hand.

**When to choose each:**
- *All-or-nothing:* small, logically inseparable mutations where partial application would be actively wrong (creating an invoice and its line items together).
- *Per-item result:* the default for bulk ingestion, webhooks, and large synchronization jobs where throughput matters more than all-or-nothing simplicity.

**Common failure modes:**
- **The poisoned retry loop:** an all-or-nothing batch of 100 fails on item 45 and returns `400`. A naive client integration just retries the entire batch. Without strict idempotency (Ch 22) on the provider's side, items 1 through 44 get inserted a second time before item 45 fails again, right on schedule — and it keeps repeating until the database is packed with duplicates.
- Returning `200 OK` for a batch while quietly dropping the items that failed, leaving the client with no way to even learn its data came back incomplete.

**Example:** Elasticsearch's `_bulk` API is built entirely around per-item results, and for good reason: it exists to ingest massive log volumes, and failing an entire batch over one malformed document just isn't an option at that scale. It returns `200 OK` — the network request itself succeeded — alongside an `errors: true` flag and a per-document array listing the exact status code and error string for each one.

---

## Why Smart Engineers Disagree: HTTP Semantics vs. Payload Pragmatism

The most persistent fight over error contracts is between REST purists and RPC pragmatists, and underneath it, it's really the REST-vs-RPC ontology disagreement from Ch 19 showing back up at the error layer.

REST advocates treat HTTP status codes as real infrastructure that things depend on, not decoration you can swap out. A `404` is structurally different from a `409`, and proxies, load balancers, and CDNs lean on that difference to route, cache, and shed load correctly without asking your application a single question. Ignore status codes, to them, and you're throwing away machinery the entire internet already built for you at no charge.

RPC and GraphQL advocates see rigid loyalty to a fixed, decades-old status code set as accidental complexity (Ch 02) dressed up as principle — they'd rather return `200 OK` for every successfully delivered payload and push the real business error entirely into a structured, strongly typed body, on the theory that this is strictly more expressive than anything HTTP's status codes were ever designed to carry.

Both sides are internally consistent. The actual failure is mixing them. A system that claims to be a public REST API is structurally on the hook to honor HTTP semantics — return `200 OK` with an embedded error body there and you've broken both the contract and the infrastructure built to read it. A system built explicitly as internal RPC over HTTP loses nothing by pushing all error semantics into the payload the way gRPC does — that's a coherent design choice, not a violation of one. The actual failure mode was never picking a paradigm; it's refusing to commit to either one and ending up with an API that does both, unpredictably, depending on which endpoint you happen to be hitting that day.

*Concepts expanded in later chapters: retry and idempotency mechanics (Part III, Ch 22); authentication- and authorization-specific error semantics, including the 401-vs-403 distinction (Part III, Ch 24).*
