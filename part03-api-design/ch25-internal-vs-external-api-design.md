# Chapter 25 — Internal vs. External API Design

**Prerequisites:** [Part II, Ch 14 — Abstraction Layers: When to Add One](../part02-software-architecture/ch14-abstraction-layers-when-to-add-one.md), [Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Ch 16 — Versioning and Backward Compatibility](../part02-software-architecture/ch16-versioning-backward-compatibility.md), [Part III, Ch 21 — Error Handling Contracts](ch21-error-handling-contracts.md). Specifically: the structural internal/external stability distinction, backward-compatible vs. breaking changes, and the sunset pattern.

**New vocabulary introduced:** Hyrum's Law, consumer-driven contract test

**Key takeaways:**
- Ch 15 drew the structural line between internal and external API stability. This chapter is about what actually changes operationally once that line gets crossed: process, tooling, support obligations — not field exposure, which was already settled.
- What makes an API "external" was never whether it sits on the public internet — it's whether the provider controls the consumer's deployment schedule. The moment a consumer you can't coordinate with depends on an endpoint, that endpoint is functionally external, whether or not anyone ever designed, documented, or versioned it as one.
- Hyrum's Law is the mechanism behind that trap: with enough consumers, every observable behavior — intended or not — eventually becomes something somebody's depending on. An undocumented sort order, an incidental field, a timing quirk; none of it stays safe to change once enough people are watching it happen.
- SDKs, formal change management, and gateway infrastructure aren't marketing exercises the moment an API goes external — they're how the cost of that uncoordinated consumer base gets paid predictably, instead of landing, unplanned, on the support queue at 2 a.m.

---

## Accidental vs. Intentional Externalization

**What it is:** An API's "external" status is determined by whether the provider controls the consumer's deployment schedule, not by network location. Externalization, once it happens, is a one-way door.

**Why it exists:** The genuinely catastrophic case was never a deliberately published public API — it's an internal endpoint quietly discovered and leaned on by a team the provider has no way to coordinate with. Once that's happened, the endpoint is external in every sense that matters, whatever anyone originally intended for it.

**Options:**
1. **Implicit internal APIs** — built fast, without formal versioning or documentation, on the assumption every caller lives in the same repository and can be updated in lockstep
2. **Formally externalized APIs** — hardened with explicit documentation, SLAs, and real backward-compatibility guarantees, because the provider has no way to force a consumer to migrate

**Trade-offs:**
- *Implicit internal:* velocity through the roof — fields get renamed, endpoints get deleted, and nothing's standing in the way — right up until it guarantees a severe outage the moment some uncoordinated team turns out to be depending on exactly the thing that just changed.
- *Formally externalized:* protects every consumer and builds the kind of trust an organization can actually count on — but it's a real, permanent procedural tax, and the underlying code never gets to move quite as fast again.

**When to choose each:**
- *Implicit internal:* only when provider and consumer ship through the exact same pipeline, owned by the exact same team.
- *Formally externalized:* the moment an API crosses an organizational boundary where the provider can't simply refactor the caller's code itself.

**Common failure modes:**
- **The Hyrum's Law trap:** an internal API happens to return users sorted alphabetically — purely an accident of the underlying database index, never documented, never intended by anyone. A partner team discovers the endpoint and builds a UI that quietly assumes that ordering. Two years later the index changes, the sort order randomizes, and the partner's UI breaks — the provider never agreed to a contract about sort order, but Hyrum's Law wrote one anyway: with enough consumers, every observable behavior eventually becomes something somebody's depending on, documented or not.

**Example:** Google engineers fight this at scale on purpose: an internal service can rack up thousands of uncoordinated consumers simply because the company is large enough for that to happen by accident. Google's infrastructure actively randomizes hash-map iteration order and protobuf field serialization at runtime — deliberately making the *unspecified* parts of the output chaotic, so consumers are structurally forced to depend only on the explicit contract, because nothing implicit is stable enough to lean on without noticing. **[Strong Recommendation: treat "discovered and depended on by someone you can't coordinate with" as the actual definition of external, not "published on purpose"]**

---

## Formal Change Management

**What it is:** The procedural infrastructure — changelogs, deprecation notices, consumer-driven contract tests — that replaces direct coordination once a provider can no longer just walk over and ask a consumer to update their code.

**Why it exists:** An internal team can push one atomic commit that updates both the API and every caller of it in the same breath. An external consumer has to be notified, persuaded, and given real time to migrate on their own schedule — there's no commit anywhere that reaches across to touch their side too.

**Options:**
1. **Synchronous code updates** — the provider changes the API and the consumer's code in the same commit
2. **Formal change management** — consumer-driven contract tests verify changes don't break known clients, changelogs are published, and deprecation notices go out well before any structural change ships

**Trade-offs:**
- *Synchronous updates:* instant and provably safe, with no legacy version left hanging around to maintain — but structurally impossible the instant provider and consumer cross an organizational boundary.
- *Formal change management:* both sides get to evolve genuinely independently — but it's slow, and it demands real documentation discipline plus running multiple API versions at once through an actual sunset window (Ch 16).

**When to choose each:**
- *Synchronous updates:* tight microservice clusters living in a single monorepo.
- *Formal change management:* the default for any API with third-party or autonomous-partner consumers.

**Common failure modes:**
- **The ghost deprecation:** a field gets removed because internal dashboards show nobody using it — except those dashboards never tracked field-level usage to begin with, so "nobody" was never a real number. With no consumer-driven contract test and no published changelog, thousands of integrations break silently, and the support queue is on fire before anyone even spots the pattern.

**Example:** GitHub's API treats this as a real operational cost, not paperwork to file away: exhaustive changelogs for even minor behavioral tweaks, explicit deprecation headers, and scheduled brownouts — deliberate, brief failures — that force lagging consumers to notice and migrate before the underlying endpoint actually gets deleted. Same sunset discipline as Ch 16, just running at the process level instead of the wire level this time.

---

## The Stability Buffer: SDKs vs. Raw Wire

**What it is:** Whether the provider distributes and maintains native client libraries that wrap the API, or leaves every consumer to integrate against the raw HTTP/JSON or gRPC contract directly.

**Why it exists:** An SDK is an anti-corruption layer (Ch 14) planted directly inside the consumer's own codebase. The provider swaps pagination from an integer offset to an opaque cursor (Ch 23), and the SDK swallows that translation internally — the consumer's `list_users()` call never has to change a single character.

**Options:**
1. **Raw wire contracts** — an OpenAPI/gRPC spec is published; consumers write their own clients, retry logic, and pagination loops
2. **Published SDKs** — the provider builds and maintains native libraries across languages that wrap the raw calls

**Trade-offs:**
- *Raw wire contracts:* costs the provider next to nothing to maintain — but pushes every ounce of distributed-systems complexity (retries, backoff, token refresh) onto each consumer individually, and the same integration bugs get rewritten from scratch by every client that hand-rolls its own version.
- *Published SDKs:* a genuinely good developer experience, and the provider gets to ship performance or security fixes transparently, no consumer action required — but now it's maintaining parallel codebases across however many languages it supports, multiplying the cost of every new feature by however many SDKs exist to carry it.

**When to choose each:**
- *Raw wire contracts:* internal RPC where a platform team already code-generates stubs centrally, or low-stakes single-purpose integrations.
- *Published SDKs:* public SaaS APIs where developer experience is a genuine competitive differentiator.

**Common failure modes:**
- **The out-of-sync SDK:** the backend ships a shiny new endpoint, but the team maintaining the Ruby SDK is three sprints behind. Ruby consumers can't touch the new feature for months — fragmenting the ecosystem and pushing frustrated developers to bypass the SDK and write raw HTTP calls anyway, which defeats the entire reason the SDK existed.

**Example:** An internal gRPC service needs zero public documentation — a compiled `.proto` file is the whole contract, and every caller is internal anyway. Stripe runs the opposite playbook: official SDKs across seven languages, with the SDK itself treated as the actual product, not the REST endpoints underneath it — used specifically to bury the genuinely terrifying complexity of payment retries and idempotency (Ch 22) behind a clean local interface nobody has to think about.

---

## External Edge Infrastructure

**What it is:** The gateways, rate limiters, and developer portals that exist specifically to manage untrusted, uncoordinated third-party traffic — infrastructure internal services rarely need at all.

**Why it exists:** Internal services can lean on a lightweight service mesh and tribal knowledge about who's calling whom. External traffic needs strict policing, automated credential issuance, and self-serve documentation instead, because there's no Zoom call to schedule with every new third-party developer who shows up wanting an API key.

**Options:**
1. **Internal service mesh** — lightweight sidecar proxies (Envoy) handling routing and mTLS between trusted internal nodes
2. **Public API gateway + developer portal** — a dedicated edge proxy (Kong, Apigee) terminating external traffic, enforcing rate limits, validating third-party credentials, and feeding a self-serve portal

**Trade-offs:**
- *Internal mesh:* low latency, low operational overhead — and no mechanism whatsoever for throttling an abusive external tenant, or onboarding a total stranger without a human getting involved by hand.
- *Gateway + portal:* external onboarding runs fully on autopilot, and the backend is protected from traffic spikes it never agreed to absorb — but that's a real new single point of failure, plus a dedicated platform team now needed just to keep it running.

**When to choose each:**
- *Internal mesh:* all inter-service traffic within the trusted boundary.
- *Gateway + portal:* the moment any third party can interact with the system without a human approving it first.

**Common failure modes:**
- **The unthrottled onboarding:** a public API launch points external traffic straight at the internal load balancer, no gateway standing in front of it anywhere. One external developer's buggy `while (true)` loop fires off 50,000 requests a second, with no tenant-level rate limit anywhere to stop it — and the resulting database overload takes down the core product for every customer, not just the one running the bad script.

**Example:** Twilio and SendGrid run entirely on self-serve gateway infrastructure: a new developer creates an account, the portal issues scoped API keys on its own, and the gateway starts metering traffic against a billing tier immediately — no engineer on the provider's side is ever pulled in to onboard a single customer, by design.

---

## Why Smart Engineers Disagree: The True Cost of Developer Experience

The real fight over external APIs was never about the JSON shape — it's about how much to invest in everything sitting around it.

Engineers optimizing for backend efficiency argue a published OpenAPI spec is enough: "we hand you the accurate contract; how you consume it from there is your problem." SDKs, polished developer portals, detailed changelogs — to them, that all reads as marketing spend competing with real engineering for the same headcount.

Engineers optimizing for adoption argue an API with no native SDKs and no real documentation is effectively unusable, and that the engineering cost of maintaining an SDK is far cheaper than the human cost of fielding thousands of support tickets from developers who got HMAC verification or cursor pagination subtly wrong on their own time.

Going external is a product decision wearing a technical one's clothes, and that's exactly what resolves the disagreement: the developer experience *is* the product once an API goes public. Skipping SDKs, changelogs, and a portal doesn't make that complexity vanish — it just moves the bill off the engineering budget and onto the support queue, where it's harder to plan for and considerably more expensive per incident. If the organization isn't ready to fund that infrastructure, it isn't actually ready to go external. Internal APIs get optimized for change. External ones get optimized for continuity, and continuity is never free.
