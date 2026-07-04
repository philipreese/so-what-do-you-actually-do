# Chapter 23 — Pagination and Streaming

*How you hand back a big result set is a consistency contract.*

Any API returning a collection eventually has to decide how to hand back more results than fit in one response, and that decision is a consistency and performance contract, not a UI nicety. Offset/limit pagination is the simplest model and the one every SQL query produces unasked, but it's unstable under concurrent writes and gets linearly more expensive with depth. Cursor-based pagination anchors each request to a specific, indexed position, buying constant performance and immunity to page drift at the cost of arbitrary jump-to-page access and a genuinely unique sort key. Streaming abandons discrete pages entirely for datasets that are open-ended or too large to paginate, trading normal request/response statelessness for the operational complexity of holding a connection open indefinitely.

**Prerequisites:** [Part I, Ch 06 — Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md), [Part II, Ch 16 — Versioning and Backward Compatibility](../part02-software-architecture/ch16-versioning-backward-compatibility.md), [Part III, Ch 20 — Resource Modeling](ch20-resource-modeling.md), [Ch 21 — Error Handling Contracts](ch21-error-handling-contracts.md). Specifically: sequential vs. random I/O cost, and backward-compatible API surfaces.

**New vocabulary introduced:** cursor (keyset pagination), page drift

**Key takeaways:**
- Any API returning a collection eventually has to decide how to hand back more results than fit in one response. That's a consistency and performance contract, not a UI nicety — it decides whether results stay correct under concurrent writes and how expensive a deep query gets to run.
- Offset/limit pagination is the simplest mental model going, and the one every SQL query produces without being asked — but it's structurally unstable under concurrent mutation (page drift), and gets linearly more expensive with depth, because the database still has to scan and throw away every row sitting before the offset.
- Cursor-based (keyset) pagination anchors each request to a specific, indexed position instead of a relative offset, buying constant performance at any depth and total immunity to page drift — at the cost of giving up arbitrary "jump to page N" access and requiring a genuinely unique, deterministic sort key to hang the whole thing on.
- Streaming abandons the idea of discrete pages entirely, for datasets that are open-ended, real-time, or just too large to paginate sanely at all — trading HTTP's normal request/response statelessness for continuous delivery and every bit of the operational complexity that comes with holding a connection open indefinitely.

## For My Wife

**Every API that can return a list of things eventually has to decide: what do you do when the list is too long to send all at once?** The obvious answer is pages — give me items 1 through 50, then 51 through 100 — and that's exactly how most systems start. The problem is that a database doesn't naturally skip ahead to item 50,000 the way you'd flip to a bookmark; it reads items 1 through 49,999 first, throws them away, and then returns what you asked for. At scale, asking for page 10,000 of an active feed can push a database cluster into serious distress — not because your query was wrong, but because of what "skip ahead" actually costs at the hardware level.

**Cursor-based pagination is the answer most high-traffic APIs settle on.** Instead of "give me items 50 through 100," you say "give me the next 50 items after the one with ID xyz-789." The database can jump straight to that position through an index without scanning everything before it, the way a physical bookmark works — open to the right page immediately, no leafing. The trade-off is that "jump to page 47" becomes impossible; you can only move forward from where you last were. That's genuinely worse for some UIs, and the chapter says so honestly, but it's also the only approach that doesn't get slower the deeper into the data you go.

The stakes are concrete: an API that exposes raw offset pagination to the public internet is handing anyone with an API key a button that can unintentionally saturate your database. One developer's runaway script requesting offset 1,000,000 in a tight loop isn't a security attack — it's a performance accident that can take down the product for every other customer sharing that cluster.

## For My Kids

Say the team roster gets posted on the locker room door, and the office keeps stapling new permission slips to the very front of the stack as they come in. You ask the coach, "skip the first 200 names, read me the next 10." Fine the first time — but every time you ask again, whoever's reading has to recount from name one, and it gets slower the deeper into the list you go.

**Here's the part that actually breaks: while you're reading, the office staples five more names to the front.** Everyone's position just shifted. The name you thought was 201st might now be 206th. Ask for "the next 10 after position 200" again and you could see the same name twice, or skip someone entirely — not because anyone made a mistake, just because the list moved while you weren't looking.

**The fix is asking a different kind of question.** Instead of "skip 200," you say "give me the next 10 names after Jordan Smith." Whoever's reading jumps straight to Jordan's name and keeps going — no recounting from the top, and it doesn't matter how many names got added to the front, because you were never depending on a position number in the first place.

**The one thing you give up is jumping straight to "position 500."** You can only move forward from wherever you actually last stopped — a fair trade for never again seeing your own name twice, or worse, not seeing it at all.

---

## Offset/Limit Pagination

**What it is:** Returning a slice of a sorted result set by specifying how many items to skip (`OFFSET`) and how many to return (`LIMIT`).

**Why it exists:** It matches how people already picture a list in their heads — page 1, page 2 — and maps straight onto SQL, letting a client jump to any point in a collection at will while the server computes total page counts without breaking a sweat.

**Options:**
1. **Explicit offset** — the client supplies the raw integer (`?offset=100&limit=50`)
2. **Page numbers** — the client supplies a page number and size (`?page=3&size=50`); the server computes the offset

**Trade-offs:**
- Both hand the client maximum flexibility — a "jump to page 25" control takes an afternoon to build — but both structurally guarantee **page drift**: insert an item at the front of the list while a user sits on page 1, and page 2 now silently duplicates what used to be page 1's last item, or skips one entirely. Nobody wrote a bug; the math just works out that way.
- Both also charge the depth penalty: query time grows linearly with the offset, because the database still has to read and throw away every row ahead of it, even though not one of those rows ever gets returned to anybody.

**When to choose each:**
- Acceptable only for small, rarely mutated datasets where write-safety under concurrency genuinely doesn't matter — a list of geographic regions, a bounded admin dashboard.
- Never for a high-velocity feed or a large multi-tenant table.

**Common failure modes:**
- **The deep-offset timeout:** a client requests page 10,000 of an events table — `OFFSET 500000`. PostgreSQL has no free way to skip rows; under MVCC it has to evaluate visibility rules for every one of those half-million skipped rows just to confirm each one deserves to be thrown out, burning CPU on work whose entire output gets discarded on arrival. At scale this is, functionally, a self-inflicted denial-of-service vector pointed straight at the public internet.

**Example:** `SELECT * FROM events ORDER BY created_at DESC LIMIT 50 OFFSET 10000` reads as completely innocuous and falls straight off a performance cliff at depth — the database can't optimize the skip away, so it redoes the exact same discarded work every single time the query runs. **[Consensus: offset pagination is fine for small, static data and actively dangerous for anything large or frequently written]**

---

## Cursor-Based (Keyset) Pagination

**What it is:** Anchoring each page request to a specific, unique, sortable position in the data — "give me items after this one" — rather than a relative position counted from the start.

**Why it exists:** Because the query targets a specific indexed row instead of a relative offset, the database can jump straight to it through the index (typically a B-tree) without scanning a single row ahead of it — eliminating both page drift and the depth penalty by construction, not by clever tuning that might stop working later.

**Options:**
1. **Transparent cursors** — the cursor is the entity's own identifier (`?starting_after=evt_456`)
2. **Opaque cursors** — the server encodes the sort field and unique ID together (commonly base64), so the client can't inspect or construct one itself

**Trade-offs:**
- *Cursor pagination generally:* consistent latency no matter how deep you go, and items never get skipped or duplicated under concurrent writes — but arbitrary page access is gone for good (there's no way to ask for "page 10" without already holding the cursor that leads there), and the sort has to sit on a genuinely unique, deterministic, indexed ordering to work at all.
- *Transparent vs. opaque:* a transparent cursor is simpler when the client already understands the identifier format going in; an opaque cursor keeps the freedom to change the underlying indexing strategy later without breaking every client URL that's quietly depending on its current shape.

**When to choose each:**
- *Cursor pagination:* the default for any high-throughput, frequently mutated API, infinite-scroll feed, or synchronization endpoint.
- *Opaque cursors:* the default for public APIs, specifically to preserve the right to change the index later.
- *Transparent cursors:* fine when sorting strictly by a chronological primary key the client already understands.

**Common failure modes:**
- **The non-unique sort:** a cursor is implemented sorted purely by `created_at`. Two records land in the exact same millisecond. With no tie-breaker, the ordering between them turns nondeterministic, and one of the two gets silently skipped across a page boundary — invisible, unless somebody happens to notice a record that never shows up anywhere.

**Example:** Stripe's `starting_after`/`ending_before` parameters, tied to an object's own unique ID, are the industry-standard case of transparent cursor pagination. GitHub's REST API runs the opaque version instead, driving clients forward entirely through RFC 5988 `Link` headers (`Link: <https://api.github.com/...&cursor=xyz>; rel="next"`) without ever exposing the underlying index mechanics or asking the client to build the next URL by hand.

---

## Streaming as a Non-Pagination Model

**What it is:** Abandoning discrete, bounded pages entirely in favor of a single open connection over which the server continuously pushes records.

**Why it exists:** Some result sets are genuinely open-ended, real-time, or simply too large for issuing thousands of sequential paginated requests and tracking cursors between them to make any sense as a strategy.

**Options:**
1. **Newline-delimited JSON (NDJSON)** — the server flushes one JSON object per line over a standard HTTP response
2. **Server-Sent Events (SSE)** — a unidirectional event stream over one HTTP connection, natively supported by browsers
3. **gRPC server streaming** — a single RPC call yielding a continuous stream of protobuf messages over multiplexed HTTP/2

**Trade-offs:**
- Streaming slashes network overhead and gets the fastest possible time-to-first-byte for a large dataset — but it gives up HTTP's normal statelessness in exchange: standard load balancers can and do drop long-lived connections, a mid-stream failure has no obvious point to resume from, and memory pressure shifts onto the client, which now either keeps pace with what the server is pushing or falls behind and starts dropping data.

**When to choose each:**
- *gRPC streaming:* internal microservice bulk transfers where HTTP/2 is already controlled end-to-end.
- *NDJSON / SSE:* public-facing firehose APIs and large asynchronous exports.

**Common failure modes:**
- **Unbuffered memory exhaustion:** a service streams a five-million-row table via NDJSON, but the ORM underneath quietly loads the entire result set into memory before writing so much as the first byte. The process OOMs, defeating the exact physical constraint streaming was supposed to route around in the first place.
- Treating a stream like pagination and expecting to rewind it, or losing stream position on disconnect with no resumable token anywhere to recover from.

**Example:** The Twitter/X "firehose" is the canonical streaming collection — there genuinely is no page when you're reading the global stream of every tweet. The API just opens a persistent connection and pushes JSON objects out as they happen, leaving the client fully responsible for keeping up and for reconnection state.

---

## Why Smart Engineers Disagree: UI Flexibility vs. System Safety

The most common version of this fight runs straight down the frontend/backend fault line.

Frontend engineers defend offset pagination because enterprise users expect an actual data grid — "Page 1 of 50," with a control that jumps straight to page 25. Cursor pagination breaks that UI pattern outright, forcing a fallback to next/previous buttons or infinite scroll, which is a genuinely worse experience for anyone trying to hunt down a specific historical record.

Backend and systems engineers see offset pagination at scale as a standing operational vulnerability, not a UI quirk. Exposing a raw `OFFSET` to the public internet is, functionally, a denial-of-service vector someone else built for you — a request for offset 1,000,000 forces the database to burn real CPU scanning and discarding rows nobody wanted, putting cluster stability on the line just to buy a nicer-looking page control.

The resolution favors the database, because the constraint here was never a matter of taste — it's hardware physics (Ch 06). Offset pagination doesn't scale with collection size. Cursor pagination does, by construction, no tuning required. The pragmatic answer is to mandate cursor pagination at the API boundary to guarantee stable performance regardless of depth, and let the frontend's design language — next/previous, infinite scroll — adapt to the physical constraints of the system underneath it, rather than the other way around. Offset pagination assumes a mostly static dataset. Cursor pagination assumes a changing but orderable one. Streaming assumes no stable snapshot exists at all. Pick the wrong one and you haven't just lost some performance — you've silently redefined what "the result set" even means.
