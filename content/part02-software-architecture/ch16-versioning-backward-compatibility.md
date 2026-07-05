# Chapter 16 — Versioning and Backward Compatibility

*There is no neutral middle category between compatible and breaking.*

Once an API has a consumer, every change is either backward compatible or breaking, and most versioning incidents are classification failures where an engineer believed a change was safe when it wasn't. A version number in a URL doesn't make an API evolvable; a disciplined process for classifying changes and migrating consumers off old contracts does. URI versioning, header-based versioning, and schema-level versioning all solve the same problem with different trade-offs in discoverability, caching, and tooling, and none of them is an interchangeable default. Deprecating a version safely requires a time-bound, instrumented lifecycle, not documentation that merely says a version is deprecated.

**Prerequisites:** [Part I, Ch 03 — Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Part II, Ch 15 — API Surface Design: What to Expose, What to Hide](ch15-api-surface-design-expose-hide.md). Specifically: afferent coupling and the minimal-surface-area principle.

**New vocabulary introduced:** sunset pattern

**Key takeaways:**
- Once an API has a consumer, every change is either backward compatible or breaking — there is no neutral middle category, only different amounts of coordination cost. Most versioning incidents are classification failures: an engineer believed a change was safe when it wasn't.
- A version number in a URL does not make an API evolvable. A disciplined process for classifying changes and migrating consumers off old contracts does. Versioning is an operational discipline, not a structural feature.
- URI versioning, header-based versioning, and schema-level versioning (protobuf, Avro) all solve the same problem — running multiple contracts at once — with different trade-offs in discoverability, caching, and tooling. They are not interchangeable defaults; pick based on what has to route and cache the request.
- Deprecating an API version safely means a time-bound, instrumented lifecycle — not documentation alone. "It says deprecated in the docs" is not an operational control.

## For My Wife

> *To the client, a breaking change and a server crash are indistinguishable.*

**Once your software has users, any change to what it promises them is either backward compatible or it isn't — and the consequences of misclassifying are immediate and public.** The chapter's opening example is a validation rule that rejects ages over 150 as "clearly a bug fix." Some legacy automated client has been submitting `199` for years due to its own bad data. The day that validation ships, that client starts getting HTTP 400 errors instead of the 200s it's used to. A completely separate team's automated process fails at 3am because of a change that looked like a defensive cleanup to whoever made it.

**Backward compatible means: everything a consumer is currently doing keeps working.** Adding new optional fields to a response is always safe. Removing a field, changing a field's type, or making a previously optional input required is always breaking, even if the change seems minor — widening an integer from 32 to 64 bits breaks any client compiled against the old type definition, even though the new type is technically a superset. The chapter makes this binary explicit because "probably fine" is how production incidents get written.

When a breaking change genuinely has to ship, the answer is versioning — running the old and new contracts simultaneously so consumers can migrate on their own schedule. URI versioning (`/v1/`, `/v2/`) is the chapter's strong recommendation over the alternatives, purely for operational reasons: it routes at the load balancer without inspecting headers, it shows up in access logs, and it's debuggable by pasting a URL into a browser.

Retiring the old version safely is its own discipline. Documentation alone doesn't work — a surprising fraction of consumers never read it, and "deprecated" in the changelog doesn't generate a 2am alert when traffic on `/v1/` is still running at 40% two weeks before the sunset date. The sunset pattern puts active, programmatic signals in the responses themselves: a warning header, then a `Sunset` date header, then scheduled brownouts — deliberate brief outages designed to trip the alerting of whatever client wasn't paying attention to the headers. Not cruel. Necessary.

## For My Kids

### The Empty Corner at 7:45

Say you drive your neighbor's kid to school every morning, and the deal has always been: be at the corner by 7:45, and you'll wait a couple minutes for stragglers.

**One day you decide 7:45 means 7:45, no more grace period — waiting felt sloppy, and this seems like an easy fix.** You don't mention it to anyone; it's such a small change, barely worth a text. The next morning, the kid who's always been a minute late is standing on an empty corner, watching a car that already left. From where they're standing, that's not "a small adjustment." That's just you not showing up.

**Here's the part that matters: to the person depending on you, there's no difference between "I changed the rules quietly" and "I just didn't show up."** Both look exactly the same from the corner. Whatever you meant by it never reaches them — only what actually happened does.

If the pickup time genuinely has to change, the fix isn't complicated: tell everyone first, pick a date it actually starts, and keep the old grace period running until then. A promise you're changing needs a warning. A promise you're just breaking doesn't — and from the sidewalk, those look identical.

> [!CAR]
> If you needed to change a rule you'd promised someone, how much warning would feel fair to give them before it actually changed?

---

## The Backward Compatibility Boundary

**What it is:** Every API change is either backward compatible — safe to ship right now — or breaking — unsafe without a version boundary standing in front of it. There is no polite middle category, whatever the commit message claims.

**Why it exists:** Engineers ship breaking changes convinced they're minor all the time — tightening a validation rule, renaming a field that was badly named to begin with. To whatever's on the other end consuming the API, an unannounced breaking change looks exactly like a server crash. It has no way to tell the difference, and it won't try to.

**Options:**
1. **Backward compatible** — adding optional fields, adding new endpoints, relaxing constraints, accepting a wider range of valid input
2. **Breaking** — removing fields, changing a field's type, adding new *required* input, tightening constraints

**Trade-offs:**
- *Staying strictly compatible:* deploy any time, no consumer coordination needed — and the surface only ever grows, deprecated fields and legacy parameters piling up forever as structural tech debt nobody's allowed to remove.
- *Allowing breaking changes:* cleans that debt out and lines the contract back up with the current domain model — and breaks every consumer who hasn't rewritten their integration to keep up with you.

**When to choose each:**
- *Compatible changes:* the default for essentially all routine feature work — bias toward adding a new optional field over modifying an existing one.
- *Breaking changes:* only as part of a planned major version, with the business explicitly accepting the cost of a deprecation and migration cycle.

**Common failure modes:**
- **The tightened-validation trap:** rejecting ages over 150 as biologically impossible feels like an obvious bug fix, right up until a legacy automated client that's been sending `199` because of its own bad data starts getting HTTP 400 instead of 200. That's a production outage, unannounced, caused by a change that looked purely defensive to whoever shipped it.
- Treating field removal as though it were the same thing as deprecation, or assuming "I only added an optional field" is automatically safe — it isn't, the moment some consumer was quietly relying on that field's *absence*.

**Example:** Google's API Improvement Proposals (AIP-206) draw the line with no ambiguity left in it: adding a response field is never breaking. Changing a field's type is *always* breaking, full stop, even widening `int32` to `int64` — because a statically typed client fails to deserialize the new payload regardless of whether the new type is technically a superset of the old one. **[Consensus: classify every API change as compatible or breaking before shipping it — "probably fine" is not a classification]**

---

## API Versioning Strategies

**What it is:** Whatever routing and parsing mechanism lets a provider serve multiple, incompatible API contracts at the same time while consumers migrate between them on their own schedule.

**Why it exists:** Breaking changes catch up with every API eventually. The moment one ships, old and new contracts both have to be served at once, and something, somewhere, has to route each incoming request to the right implementation of the two.

**Options:**
1. **URI versioning** — the version is encoded in the path (`/v1/users`, `/v2/users`)
2. **Header-based versioning** — the version travels in a header (`Accept: application/vnd.api+json;version=2`)
3. **Schema-level versioning** — compatibility is encoded directly into a binary serialization format (Protobuf, Avro) via field tags, independent of any HTTP-level scheme

**Trade-offs:**

| Strategy | Buys | Costs |
|---|---|---|
| URI versioning | Trivial to route at a load balancer, highly discoverable, caches cleanly with standard CDN rules | Technically misuses REST semantics (a version isn't really a distinct resource); duplicated routes internally |
| Header-based versioning | Keeps the URL as pure resource identity | Breaks naive HTTP caching (needs `Vary: Accept`), harder to debug with a plain `curl`, requires header inspection at the gateway |
| Schema-level versioning | Compatibility enforced at compile/serialization time, not by convention | Requires the whole ecosystem to adopt a schema registry and give up human-readable payloads |

**When to choose each:**
- *URI versioning:* public web APIs and external integrations — the default.
- *Schema-level versioning:* high-throughput internal service-to-service RPC.
- *Header-based versioning:* rarely the right default; mainly seen where a legacy enterprise REST standard mandates it.

**Common failure modes:**
- **The minor-version route:** minting `/v1.1/`, `/v1.2/` for changes that were already backward compatible, forcing every consumer to update and redeploy just to receive additions that never should have required a single line of client change. It defeats the entire point of calling something compatible.
- **Silent field-number reuse:** in a schema-level scheme, a field gets deleted and its integer tag later gets handed to something new. Old clients deserialize the new data using the old field's meaning — no error thrown anywhere, just quietly, confidently wrong data.

**Example:** Protobuf's field numbering is the textbook case of schema-level versioning done right: fields are identified by integer tag (`string name = 1;`), not by name, so renaming is free and new fields can be added without asking permission — but a deleted field's tag can never be recycled, or old clients will read new data as if it were the old field. The compatibility rule here isn't a convention some engineer has to remember. It's enforced by the schema mechanics themselves. **[Strong Recommendation: URI versioning by default for anything externally consumed — operational simplicity at the load balancer beats theoretical REST purity]**

---

## The Sunset Pattern

**What it is:** A structured, time-bound lifecycle for retiring an API version nobody should be using anymore: active → deprecated, with warnings → sunset, with active disruption → gone.

**Why it exists:** Supporting every version that ever shipped, forever, is its own unmanageable species of complexity. Consumers are going to have to migrate eventually one way or another. The sunset pattern just makes sure it happens on a calendar instead of as an ambush.

**Options:**
1. **Permanent support** — the old version lives indefinitely, mapped onto the current backend through accumulating translation layers
2. **The sunset pattern** — a deprecation window with escalating, programmatic signals, ending in scheduled removal

**Trade-offs:**
- *Permanent support:* zero friction for consumers — a decade-old integration just keeps working, forever — while the provider's codebase becomes a permanent museum of legacy adapters that somebody has to keep the lights on for, indefinitely.
- *Sunset pattern:* the codebase stays clean and the attack surface stays small, and real migration work gets pushed onto consumers whether they budgeted for it or not — cut the window too short and they abandon the platform outright instead of doing the migration.

**When to choose each:**
- *Permanent support:* infrastructure with an installed base too enormous and too uncoordinated to ever migrate as a group — hardware drivers, OS syscalls, foundational wire protocols.
- *Sunset pattern:* the default for SaaS APIs, SDKs, and internal services — which is to say, almost everything else.

**Common failure modes:**
- **The silent deprecation:** the docs say a version is "deprecated," and nothing programmatic actually enforces that. Years later, the provider finally flips off the old servers and discovers, the hard way, that they were still carrying 40% of production traffic. Documentation was never an operational control. It was a suggestion nobody read.

**Example:** The PostgreSQL wire protocol takes the permanent-support road — its binary protocol has held stable across decades of major versions, so a driver written in 2005 still runs fine today. A typical SaaS sunset runs the opposite playbook, on a real clock: a year out, responses start carrying `Deprecation: true`. Six months out, a `Sunset: <date>` header shows up. A month out, the provider runs brief, scheduled "brownouts" — deliberate 503s lasting a few minutes at a time — specifically to trip the alerting of whatever legacy consumers weren't watching the headers closely enough.

---

## Why Smart Engineers Disagree: URI vs. Header Versioning

The classic fight in API versioning pits architectural purity against operational pragmatism, and it's a fight operational pragmatism basically always wins.

REST purists argue a URL names a resource, not a representation of it — a `User` is the same resource whether the response is shaped like v1 or v2. By that logic, URI versioning (`/v1/users`) is a category error, and the version belongs in a content-negotiation header where it can't offend anybody's model of what a URL means.

The operationally minded — SREs, infrastructure teams — push back immediately. Caching on header values is fragile. Routing on headers means deeper inspection at every load balancer in the chain. And a header isn't something you can paste into a Slack message or grep out of an access log at 2 a.m. when a customer's support ticket just landed and somebody needs to know which version they hit.

The pragmatic case wins because it has to: REST's theoretical purity buys nothing if the API can't be cached by a CDN, routed by an ordinary Layer 7 load balancer, or debugged in thirty seconds by whoever's on call tonight. URI versioning dominates in the real world for exactly that reason — it matches how web infrastructure actually behaves, and it trades a sliver of semantic purity for a mountain of operational resilience.

*Concepts expanded in later chapters: REST vs. RPC transport mechanics (Part III, Ch 19); branching and release strategy for the code that implements these versions (Part VII, Ch 50, Ch 56).*
