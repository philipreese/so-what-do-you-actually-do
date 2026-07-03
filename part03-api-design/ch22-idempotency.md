# Chapter 22 — Idempotency

**Prerequisites:** [Part II, Ch 17 — Synchronous vs. Asynchronous Communication](../part02-software-architecture/ch17-sync-vs-async-communication.md), [Part III, Ch 21 — Error Handling Contracts](ch21-error-handling-contracts.md). Specifically: at-least-once delivery, the impossibility of real exactly-once delivery across a network boundary, and structured error responses.

**New vocabulary introduced:** idempotency key

**Key takeaways:**
- Ch 17 established that at-least-once delivery is the realistic default once a call crosses a process or network boundary, and that true exactly-once delivery is off the table there. Idempotency is what makes that fact survivable: it doesn't stop a request from arriving twice, it makes arriving twice a non-event.
- Some operations are naturally idempotent by construction (`PUT`, `DELETE`) — do them twice and you land in the same place. Others (`POST`) aren't, and need designed idempotency: a client-supplied key the server uses to spot a retry and hand back the original result instead of doing the work again.
- The only enforcement mechanism that actually holds up is a database-level uniqueness constraint, not an application-level check. A `SELECT`-then-`INSERT` check has a race window two concurrent retries can both slip through at once; an atomic `UNIQUE` constraint has no such window to slip through.
- A server can't remember every key forever, and pretending otherwise just moves the problem. The retention window is a genuine trade-off — too short and a legitimately delayed retry reads as brand new; too long and transport metadata sits there bloating the domain tables it got bolted onto, permanently.

---

## Natural vs. Designed Idempotency

**What it is:** The distinction between operations that are safe to retry purely because of what their HTTP verb means (natural idempotency), and operations that need explicit engineering to become safe to retry (designed idempotency).

**Why it exists:** A client never gets to be certain a request actually reached the server — only that a response didn't come back, which is a very different fact. If the network eats the acknowledgment, the client has no choice but to retry, and if the API wasn't built with that in mind, the retry itself is what corrupts the state.

**Options:**
1. **Natural idempotency** (`PUT`, `DELETE`, `GET`) — the operation targets a specific existing identity and replaces or removes its state; repeating it produces the identical end state
2. **Designed idempotency** (`POST`) — the operation creates a new entity or triggers a side effect with no prior identity to target; repeating it by default produces a new effect each time, unless explicitly protected

**Trade-offs:**
- *Natural idempotency:* zero backend tracking, zero storage cost, and a client that can hammer the retry button as hard as it wants with no coordination required — but it demands the client already know the target identity, often costing an extra round trip just to obtain or generate an ID before the mutation can even happen.
- *Designed idempotency:* a client gets to safely fire off a complex, multi-step creation in one `POST` — but the provider is now on the hook to build and maintain a correct, concurrent, server-side deduplication mechanism, forever.

**When to choose each:**
- *Natural idempotency:* the default mental model for reads, replacements, and deletions — standard HTTP clients and service meshes already retry `GET`/`PUT`/`DELETE` automatically because the protocol guarantees they're safe.
- *Designed idempotency:* required for any `POST` that initiates a state transition, charges money, or triggers an asynchronous side effect.

**Common failure modes:**
- **The unsafe default retry:** a mobile client library retries every timeout automatically, no questions asked. Checkout is implemented as a plain, non-idempotent `POST /checkout`. The user's signal drops mid-request, the library dutifully retries, and the customer gets charged twice for one cart — not because anything actually broke, but because nobody told the retry logic this particular door wasn't safe to knock on twice.
- Assuming `POST` is idempotent purely by accident — no key, no protection — and getting a silent duplicate creation instead of the clean, honest failure you'd rather have had.

**Example:** `DELETE /users/456` is naturally idempotent: the first call removes the user and returns success; a retry might get a `404` back instead of a `200`, but the actual system state — the user is gone — is identical either way. The retry is genuinely, structurally harmless, no extra design required to make it so.

---

## The Idempotency Key Pattern

**What it is:** The client generates a unique identifier for a logical operation (typically a UUID), sends it with the request, and the server uses it to recognize a retry and return the original result instead of re-executing the side effect.

**Why it exists:** It gives the server a way to tell "the user genuinely clicked checkout twice" apart from "the network retried the same checkout once" — a distinction the server has zero hope of making on its own, since both show up looking like the exact same request.

**Options:**
1. **Application-level check** — the application runs a `SELECT` to see whether the key already exists before executing the logic and inserting the key
2. **Database-level uniqueness constraint** — the application attempts an `INSERT` into an idempotency-key table with a `UNIQUE` constraint and lets the database reject the duplicate atomically

**Trade-offs:**
- *Application-level check:* simple to write, no schema changes required — and structurally broken anyway: two concurrent retries can both run the `SELECT`, both see no existing key, and both go ahead and execute the side effect before either has gotten around to writing its own key. The check and the use were never atomic to begin with.
- *Database-level constraint:* the database's own concurrency control makes the race physically impossible — but it demands writing the idempotency key and the resulting response inside the same transaction as the side effect, which adds write volume and ties the API's response layer to persistence.

**When to choose each:**
- *Database-level constraint:* the only acceptable choice for financial transactions, state-machine mutations, or any designed-idempotency endpoint.
- *Application-level check:* never, in any system with real concurrency. It isn't a lighter-weight option — it's the failure mode this section exists to rule out.

**Common failure modes:**
- **The lost response:** the `UNIQUE` constraint does its job and correctly prevents the double charge — but the server answers the duplicate with a bare `400` or `409`. The client retried precisely because it never saw the first response, and now it has no way of knowing whether the original operation actually went through.

**Example:** Stripe's `Idempotency-Key` header is the textbook implementation. A `POST` carries the header; Stripe inserts the key into a sharded PostgreSQL table with a `UNIQUE` constraint, in the same transaction as the charge. If the insert succeeds, the payment runs and the response gets cached against that key. If a retry shows up with the same key, the constraint violation short-circuits execution before it can even start, and Stripe hands back the cached original response — the client sees the same success either time, and never has to know a retry happened at all. **[Strong Recommendation: enforce idempotency with a database uniqueness constraint, written atomically with the side effect — never as a separate read-then-write check]**

---

## The Retention Window

**What it is:** How long the server keeps an idempotency key and its cached response before purging it — the boundary past which a retry stops being recognized as a retry.

**Why it exists:** Storage isn't free, and a system chewing through millions of mutations a day can't hold on to every key and response indefinitely. At some point the server has to be allowed to forget on purpose — which means a retry that shows up late enough will eventually get treated as brand new, by design rather than by accident.

**Options:**
1. **Infinite retention** — the idempotency key lives permanently on the domain record itself (an `idempotency_key` column on `orders`)
2. **Finite retention window** (commonly 24–48 hours) — keys and cached responses live in a dedicated, fast store (Redis with a TTL, a table with a cleanup job) and are purged after a fixed period

**Trade-offs:**
- *Infinite retention:* mathematically safe against a retry arriving at literally any point in the future — but it bloats domain tables with transport-layer metadata that has nothing to do with the domain, and it still can't reconstruct the original HTTP response (headers, status code) — only the entity that resulted from it.
- *Finite window:* storage stays lean and the exact original response gets cached properly — but it opens a real edge case: a retry that legitimately shows up after the window closes gets silently treated as brand new, and the side effect fires a second time.

**When to choose each:**
- *Finite window:* the industry-standard default, typically 24–48 hours.
- *Infinite retention:* only when the idempotency key is the same value as a core domain identifier the client generated itself (the client mints the order ID as a UUID, merging the two concepts into one).

**Common failure modes:**
- **The late-retry double charge:** a mobile order succeeds on the server, but the connection dies before the client ever sees the response. The phone goes dark for three days. The moment it reconnects, a background worker blindly retries the original request — and because the server's 24-hour window closed long ago, the key is gone and the order gets created a second time.

**Example:** Stripe documents its retention window right out in the open: 24 hours. A retry with the same key after that window has closed is the client's problem, not a bug on Stripe's end — the contract spells out exactly how long a network retry has to get itself resolved within.

---

## Why Smart Engineers Disagree: What to Return for a Duplicate Key

The sharpest disagreement in idempotency design isn't about the mechanism at all — it's about which status code to hand back once a duplicate actually gets caught.

REST purists argue a duplicate `POST` against an already-created resource is, structurally, a conflict, and deserves a `409 Conflict`. Returning `200 OK` or `201 Created` for a request that didn't create anything on this particular execution, to them, misrepresents what actually just happened.

Pragmatists counter that this defeats the entire point of having an idempotency key in the first place. The client is only retrying because the network already failed it once — it has no idea the first attempt actually succeeded. A `409` breaks its retry loop and forces it to write extra error-handling logic just to go find out, via a separate `GET`, what state things are really in.

The pragmatic answer wins here, and it follows directly from what idempotency is for: the `Idempotency-Key` header is a contract that says "make sure this happens exactly once, and hand me the result" — not "tell me whether this particular HTTP call was the one that did it." Returning the cached success response (`200`/`201` with the original body) fulfills that contract completely. The whole point of the mechanism is to hide the network's unreliability behind a stable, idempotent abstraction; punishing the client with a `409` for a partition it never caused just drags the exact problem idempotency exists to erase right back into the room.
