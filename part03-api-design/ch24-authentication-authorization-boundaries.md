# Chapter 24 — Authentication and Authorization Boundaries

**Prerequisites:** [Part I, Ch 06 — Cost Models and Mechanical Sympathy](../part01-systems-thinking/ch06-cost-models-and-mechanical-sympathy.md), [Part II, Ch 13 — Coupling and Cohesion at the Architecture Level](../part02-software-architecture/ch13-coupling-cohesion-architecture-level.md), [Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Part III, Ch 21 — Error Handling Contracts](ch21-error-handling-contracts.md). Specifically: the network latency tax, bounded contexts, and minimal API surface area.

**New vocabulary introduced:** confused deputy problem, zero-trust architecture

**Key takeaways:**
- Every request has to answer two entirely separate questions: who is this caller (authentication), and what are they actually allowed to do (authorization). This chapter is about where those two checks get enforced architecturally, not the cryptography sitting underneath either one.
- Authentication is cheap to centralize at a gateway, because identity is the same fact no matter where you ask it. Authorization can't be centralized the same way — only the owning service has the domain data to know whether *this* user can act on *this* resource, which is exactly why fine-grained authorization has to live in the service, not out at the edge.
- A token propagated downstream after the initial authentication is what lets internal services skip re-authenticating a user on every single hop — but forward it blindly, without re-verifying it at each boundary, and you've built the confused-deputy problem by hand: a trusted internal service gets tricked into spending its own elevated privilege on a caller's behalf, without ever checking whether that caller was allowed to ask for it in the first place.
- Zero trust — verifying identity at every hop instead of trusting the network perimeter exactly once, at the edge — is the structural answer to confused deputies, not an optional hardening step you get to skip if you're busy. The alternative is a system that's only ever as secure as its single least-careful internal service.

## For My Wife

**There's an important difference between "who are you?" and "what are you allowed to do?" — and most security failures happen when a system treats them as the same question.** The first is authentication: checking your ID at the door. The second is authorization: checking whether you're actually allowed into this specific room, not just the building. The chapter's position is that these two checks can't live in the same place, because only the room itself knows who belongs in it — the front desk doesn't have enough information to make that call correctly.

**The "confused deputy" problem is the specific failure mode this causes.** Imagine a report service that, when you ask it for a summary, goes and fetches data from the user database using its own elevated internal credentials instead of passing along your actual identity. If there's a bug in how it filters the results, it might return data belonging to someone else entirely — not because any system was hacked, but because the database was never told who the real caller was. It trusted the report service's word, the report service got confused about whose data it should show, and the wrong data went to the wrong person. There's no clever hacking in this story; it's just a structural gap that lets an insider mistake look exactly like a security breach from the outside.

The practical upshot is that signed credentials (the thing that says "this specific user is making this request") need to travel intact through every hop of a call chain, not just to the front door — and every service that makes an authorization decision needs to verify that signature itself rather than trusting the previous service already checked. A token that only gets verified once, at the edge, means one compromised internal service gets the run of the whole building.

## For My Kids

Say only 8th graders are allowed in the library's back study room, checked by scanning a badge at the door. You're in 6th grade, so you ask an 8th-grade friend to grab your bag from that room since you left it there. She scans her own badge, walks in, grabs it, hands it over. The door's scanner did its job perfectly: it confirmed an 8th grader walked through. It has zero idea the person who actually wanted in was you.

**Nobody hacked anything. Nobody even lied, exactly.** Your friend used her own real, valid access to run an errand for you, and the system trusted her badge without ever asking whose errand this was. If that room held something that mattered — other kids' private stuff, test materials, whatever — you just got it, because the door checked *who* could scan in, and never checked *what* the request was actually for, or *who* it was really for.

**The fix isn't "don't trust your friend."** It's that "is this person allowed in the building" and "is this specific thing this specific person is asking for actually okay" are two completely different questions — and the second one has to get checked at the actual thing being protected, not just waved through at the front door based on whoever happened to walk in with a working badge.

---

## Enforcement Placement: Gateway vs. Service

**What it is:** Where the logic that verifies identity and evaluates permissions actually executes — once at the edge, independently in every service, or some combination of both.

**Why it exists:** This is a trade between centralized operational control and the kind of defense-in-depth that actually survives one compromised component. Whether you check identity once at the front door or again at the destination determines how far an attacker can move laterally once something inside has already gone wrong.

**Options:**
1. **Centralized gateway** — a single edge proxy authenticates the external request and passes a trusted identity header downstream
2. **Decentralized service enforcement** — every service independently verifies the raw identity payload (a token signature, an mTLS certificate) before acting on it

**Trade-offs:**
- *Centralized gateway:* maximum velocity — services never bother implementing their own auth middleware, and identity gets checked exactly once at the edge for the cost of a rounding error in CPU — but it draws an implicit trust boundary. Bypass the gateway, or compromise any one internal service, and nothing else is standing guard, because everything behind that gateway trusts internal traffic on faith.
- *Decentralized enforcement:* every hop verifies for itself, so one compromised service can't pivot and attack its neighbors — but it costs real CPU on every internal call, and leaves each team free to implement the check slightly differently, which is its own kind of risk.

**When to choose each:**
- *Centralized gateway:* fine for authentication in a genuinely isolated internal network or a modular monolith — but never sufficient for authorization, since the gateway has no way to know whether a specific user can mutate a specific downstream resource.
- *Decentralized enforcement:* the default for authorization universally, and the default for authentication in any modern zero-trust microservice architecture.

**Common failure modes:**
- **The blind passthrough:** a gateway verifies an external token, strips it, and injects `X-User-Id: 123` for downstream services to read. A compromised internal service — or just a badly configured one — sends a direct request to `billing-service` with `X-User-Id: 1`, the admin account. Because the service trusts the perimeter instead of checking anything for itself, the request runs with full admin authority, and not one security control anywhere in that path ever actually looked at it.

**Example:** Kong and Envoy are widely deployed as centralized gateways terminating external identity flows — but in a modern Kubernetes deployment, Envoy is just as likely to be running as a per-pod sidecar instead, which forces decentralized enforcement whether anyone planned it that way or not: mTLS and token signatures get verified at every service boundary, not just once, back at the edge. **[Strong Recommendation: authenticate at the edge for efficiency; authorize in the owning service, because only it has the domain context to make that call correctly]**

---

## Token Propagation and the Confused Deputy

**What it is:** How a caller's identity survives the trip from the gateway through however many internal services a request touches — and what happens when a service acts on a caller's behalf without actually verifying who that caller was.

**Why it exists:** If Service A calls Service B to fulfill a user's request, B has to know who that user actually is before it can enforce any user-level authorization at all. Lose that identity somewhere across the hop, and B is left with exactly one option: trust A completely, no questions asked.

**Options:**
1. **Perimeter trust (service identity)** — Service A authenticates to Service B with its own service-level credentials; B trusts A's claim about what the user is allowed to do
2. **Delegated token forwarding (user identity)** — Service A forwards the original user's signed token intact; Service B verifies it independently

**Trade-offs:**
- *Perimeter trust:* simple, no token-forwarding plumbing to build — but Service B has zero actual visibility into who the real user is, and no choice but to assume Service A already checked whatever it's asking for.
- *Delegated forwarding:* real user context survives all the way through the call chain, so authorization gets enforced correctly at the one layer that actually owns the decision — but it couples internal service calls to the external token format, and any service that logs or forwards that token to an untrusted third party has just leaked it.

**When to choose each:**
- *Perimeter trust:* acceptable only for genuinely non-interactive system jobs with no user context at all — a nightly batch process, a scheduled reconciliation job.
- *Delegated forwarding:* the default for any call chain that originated from an external user.

**Common failure modes:**
- **The confused deputy:** a user asks a report service to generate a summary. The report service queries a downstream user service using its own elevated, perimeter-trusted credentials instead of the user's actual token, meaning to filter the results locally afterward. A bug in that filtering step leaks another company's data straight into the response. The user service was never compromised — it was *confused*, tricked into trusting the report service's network identity instead of demanding the real caller's token up front.

**Example:** OAuth 2.0 and OpenID Connect are the dominant delegated-auth frameworks for exactly this reason: a client's signed JWT passes unchanged from the gateway through Service A into Service B, and B independently verifies the signature itself rather than taking A's word that it already checked — structurally closing off the confused-deputy path before it ever gets a chance to open. **[Consensus: forward and re-verify the caller's actual identity at every hop that makes an authorization decision; never substitute a service's own credentials for it]**

---

## Identity Representation: Reference vs. Value Tokens

**What it is:** Whether the credential passed over the wire is an opaque pointer requiring a lookup (a reference token) or a self-contained, signed payload a service can verify locally (a value token, typically a JWT).

**Why it exists:** This is the trade between instant, centralized revocation and the latency cost of a network round trip on every single request just to check with a central identity provider.

**Options:**
1. **Reference tokens** — a meaningless random string (a session ID); every service calls the identity provider to validate it and fetch identity data
2. **Value tokens (JWTs)** — a signed JSON payload carrying identity and permissions directly; services verify the signature locally with no network call

**Trade-offs:**
- *Reference tokens:* revocation is instant — ban a user and the very next validation call fails, full stop — but every request now pays a synchronous call to a central identity provider, and that provider becomes a global bottleneck the moment you scale.
- *Value tokens:* that bottleneck disappears entirely, verified locally in microseconds — but you inherit the token-expiry problem in exchange: a banned user's already-issued JWT stays cryptographically valid across the whole internal network until it naturally expires, an unavoidable window where the ban simply hasn't caught up yet.

**When to choose each:**
- *Reference tokens:* sensitive financial, healthcare, or administrative operations where instant revocation is a hard regulatory requirement, not a nice-to-have.
- *Value tokens:* the default for standard distributed REST APIs and service-mesh-internal traffic, where microsecond local verification matters more than instant revocation.

**Common failure modes:**
- **The unverifiable JWT:** a service decodes a JWT's base64 payload just to read `user_id`, and skips the actual cryptographic signature check against the identity provider's public key. An attacker edits `user_id` directly, re-encodes it, and walks in with full access — because nothing along the way ever confirmed the payload hadn't been tampered with.

**Example:** GitHub's personal access tokens are opaque reference tokens specifically so a compromised one can be killed instantly with a single round trip to GitHub's servers. Kubernetes service account tokens go the other way, leaning on JWTs as value tokens and prioritizing fast, decentralized validation inside the cluster over the ability to revoke on the spot.

---

## Why Smart Engineers Disagree: Edge vs. Depth Authorization

The sharpest disagreement here isn't about authentication at all — almost everyone agrees that belongs at the edge. It's about where authorization is supposed to live.

Engineers optimizing for operational simplicity want the gateway to handle both. Define "only admins can `POST /billing`" directly in the Envoy or Kong config, and security logic lives in one auditable place while unauthorized traffic never even reaches the internal network.

Engineers optimizing for domain cohesion and zero trust point out that the gateway fundamentally can't make most authorization decisions correctly, no matter how the config is written. It might know a user carries an "admin" role, but it has no way to know whether *this* user owns *this* specific invoice without going and asking the billing domain itself. Pushing authorization rules into gateway config also creates a strange temporal coupling: the platform team now has to touch routing config every time the billing team adds a domain rule that has nothing to do with routing at all.

The resolution isn't a tidy 50/50 compromise — it's splitting the work by what each layer actually has the information to decide. The gateway handles coarse authentication (is this signature valid, has this token expired) and the most superficial routing-level checks. Fine-grained authorization — can this specific user touch this specific resource — is mathematically required to live inside the owning service, because that's the only place the domain data needed to answer the question actually exists. You secure the perimeter with identity. You secure the data with domain logic, and nowhere else gets a vote.

*Concepts expanded in later chapters: cryptographic mechanics of authentication protocols, threat modeling, and secrets management (Part XI, Ch 79–84); RBAC/ABAC policy design in depth (Part XI, Ch 82).*
