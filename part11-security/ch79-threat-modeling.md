# Ch 79 — Threat Modeling

**Prerequisites:** [Reliability as a Design Principle](../part01-systems-thinking/ch07-reliability-as-a-design-principle.md) (partial failure, fail-fast), [Decision Frameworks for Trade-offs](../part01-systems-thinking/ch09-decision-frameworks-for-trade-offs.md) (reversibility and blast radius), [Authentication and Authorization Boundaries](../part03-api-design/ch24-authentication-authorization-boundaries.md) (confused deputy problem, zero-trust architecture), [Spec-First Development](../part06-engineering-process/ch46-spec-first-development.md) (Principle 10), [Distributed Tracing](../part09-observability/ch72-distributed-tracing.md)

**New vocabulary introduced:** asset, adversary, attack surface, STRIDE, threat model

**Key takeaways:**
- A **threat model** answers three questions before a line of implementation code is written: what's worth protecting (assets), who benefits from compromising it and what they're capable of (adversaries), and where trust assumptions change as data crosses a boundary (trust boundaries, attack surface). Every later chapter in this Part assumes this vocabulary rather than re-deriving it.
- [Strong Recommendation] Threat model at design time, not after deployment. This is Principle 10 — the cost of correcting a mistake grows with the distance between when it's made and when it's discovered — applied to security specifically, and the same argument Ch 46 already made for spec review: a trust-boundary mistake caught on a diagram costs a redraw; the same mistake caught in production costs a redesign under incident pressure.
- [Strong Recommendation] Treat every boundary crossing as untrusted by default. An "internal" network, an authenticated user, or a trusted vendor integration is not a reason to skip enumeration — it is the next trust boundary to examine.
- [Consensus] Use a structured taxonomy (STRIDE) rather than open-ended "think like an attacker" brainstorming. Structured review is repeatable and teachable; ad hoc review reliably finds the exotic vulnerability the reviewers already find interesting and misses the mundane one that real adversaries actually use.
- The 2013 Target breach is the canonical case: the compromised asset was never the intended target. A narrow, low-value trust boundary (a vendor billing portal) was the entry point to a catastrophic one, because the boundary between them was never explicitly examined.

## For My Wife

Before moving into a new house, the smart move is sitting down and listing out, on purpose, everyone who might end up with some kind of access — not just "who has a key to the front door," but the dog walker, the cleaning service, the neighbor who waters the plants on vacation, the delivery service that knows the garage code. Most break-ins were never going to come through the front door anyway, because that's the door everyone actually thinks to lock. They come through whichever access point nobody bothered to ask about, because it seemed too minor to matter — the side gate the landscaper props open, the spare key hidden under the same mat every house on the street uses.

This chapter argues companies should do the exact same exercise with their own systems before building them, not after something goes wrong: figure out what's actually worth protecting, who might want in and what they're capable of, and every single point where someone or something gets a kind of access — on paper, at the planning stage, while fixing a bad idea still just means erasing a sentence, not tearing out a wall after someone's already gotten in through it.

**And the chapter insists on using an actual checklist for this instead of just eyeballing the house and trusting your gut.** A home inspector who just wanders around looking for whatever catches their eye will reliably find something interesting and just as reliably miss the one boring, unglamorous thing that actually matters, like a carbon monoxide detector that was never installed. A structured room-by-room checklist catches the boring, dangerous gap precisely because it doesn't rely on anyone's gut noticing it — it makes them check the closet under the stairs whether or not it looked interesting.

## For My Kids

*Most surprises don't get ruined by the leak everyone was already watching for. They get ruined by the boring one nobody thought to check.*

Say you're planning a surprise party, and the fun part is imagining the reveal. The actually useful part is sitting down first and listing every single way the surprise could leak — not just the obvious risk (your loud little brother), but every quieter one too: the shared family calendar the guest of honor also checks, the neighbor who might mention balloons on the porch, the group chat that includes someone you forgot was in it.

That's why the smart move is an actual list, gone through point by point, instead of just trusting your gut and hoping you'd notice a leak if one happened. Your gut is great at worrying about the sibling who can't keep a secret. It's much worse at remembering the shared calendar, because nobody's gut flags "boring app nobody thinks about" as dangerous.

Do this on paper, days before the party, and fixing a leak just means telling one person to keep quiet or muting one calendar. Skip it, and you find out about the leak the way most people do — when the guest of honor walks in already knowing, and asks why nobody just told her instead of pretending.

---

A security control is only as good as the understanding of what it defends and against whom, and most security failures never trace back to weak cryptography or a sloppy line of code. They trace back to an engineer protecting the wrong thing — a team hardens password storage to bank-vault standards while an administrative API sits wide open to the internet next door, or ships careful authorization logic while a diagnostic endpoint leaks the internal topology that logic was supposed to hide in the first place. Threat modeling exists to catch that class of mistake on paper, before anyone's built the thing worth breaking into.

Chapter 24 already introduced the **confused deputy problem** and **zero-trust architecture** as one specific application of trust-boundary reasoning — service-to-service authorization. This chapter is the general method those were instances of. Not new territory, just the vocabulary the rest of this Part leans on.

### Decision: Threat Model at Design Time or Rely on Post-Deployment Detection

**What it is:** Whether a system's security posture is analyzed structurally during specification and architecture — before implementation begins — or left to automated scanning (SAST/DAST), bug bounties, and penetration testing after the system is already running.

**Why it exists:** This is Principle 10 applied directly to security. A flaw baked into a core protocol choice or a foundational trust model doesn't get patched by a web application firewall or caught by a linter — no tool downstream of the decision can see the decision was wrong. Correcting it after deployment means a low-reversibility rewrite of a system already carrying production traffic. Ch 46 made the same argument for spec review generally: catching a design flaw before code exists is categorically cheaper than catching it after. This is that argument, aimed at the specific failure mode of a trust boundary nobody looked at.

**Options:**
- **Design-time modeling** — a structured trust-boundary walk (STRIDE or equivalent) during the design phase, before implementation starts.
- **Post-deployment detection** — rely on SAST/DAST tooling, bug bounties, and penetration tests to surface issues once the system exists.

**Trade-offs:** Design-time modeling lowers the blast radius of structural flaws and keeps security controls matched to the system's actual architecture, at the cost of upfront design friction and cross-team discipline that can slow early prototyping. Post-deployment detection maximizes day-one velocity and adds no early process overhead, but any structural flaw it does find arrives as accumulated risk discovered under incident conditions, not as a comment on a design doc — and some flaws (an unauthenticated internal API everyone assumed was unreachable) are exactly what scanning tools are worst at finding, because nothing about them looks anomalous from the inside.

**When to choose each:** [Strong Recommendation] Design-time modeling for core infrastructure, data storage layers, multi-tenant boundaries, authentication pipelines, or anything where compromise is high-blast-radius and low-reversibility (Ch 09). Post-deployment detection alone is defensible only for isolated, non-critical prototypes and ephemeral experiments whose blast radius rounds to zero — never as the primary strategy for anything that will carry real trust boundaries in production.

**Common failure modes:** *The unpatchable core.* A team builds a microservices architecture on an internal Kubernetes namespace, assuming the internal network is safe because it's internal. Penetration testing after launch reveals that any compromised pod can sniff east-west traffic across the cluster — nothing authenticates its peers, nothing encrypts internal transport. Fixing it means rewriting the transport layer of every production service under active incident conditions, instead of just picking a service mesh with mTLS on day one.

**Example:** A design review that catches an unnecessarily internet-accessible administrative endpoint before implementation costs a changed diagram. Finding the same exposure after deployment costs an architectural redesign, a migration plan, and possibly a call to legal about customer notification.

### Decision: Treat Every Boundary Crossing as Untrusted, or Trust the Perimeter

**What it is:** A **trust boundary** is any point where data or control passes between components operating under different trust assumptions — internet to application, service to service, an internal network to a build pipeline, a third-party vendor to internal infrastructure. The **attack surface** is everything reachable from outside a given trust boundary: every API, administrative interface, file-upload path, build pipeline, and diagnostic endpoint. The decision is whether every such crossing gets explicit sanitization and validation, or whether components inside a shared network or environment are allowed to trust each other implicitly.

**Why it exists:** As architectures decompose into more services, those services exchange growing volumes of diagnostic, performance, and transactional metadata. An engineer who assumes internal traffic is safe lets rich internal context — API responses, stack traces, service topology — cross boundaries unfiltered. Security problems cluster at boundaries, not inside individual components, because a boundary is exactly where an assumption quietly changes and nobody goes back to re-check it.

**Options:**
- **Explicit boundary enumeration** — every crossing is treated as untrusted; inbound data is validated and outbound data (including metadata) is sanitized before it leaves the boundary.
- **Implicit perimeter trust** — components inside the same network or environment communicate transparently, trusting that whatever crosses an internal boundary is safe because the perimeter around all of them is defended.

**Trade-offs:** Explicit enumeration keeps internal topology, naming conventions, and infrastructure detail from leaking to anyone watching a boundary crossing, at the cost of writing and maintaining filtering and sanitization logic at every egress point. Implicit perimeter trust is simpler to build and debug — diagnostic and tracing data propagate transparently — but the whole model rests on the perimeter never being breached. The moment one internal component is compromised, everything downstream that trusted it implicitly is exposed, with no second layer of defense to slow anything down.

**When to choose each:** [Strong Recommendation] Explicit boundary enumeration by default for any system with external clients, third-party integrations, or multiple tenants — anywhere the adversary model plausibly includes a malicious insider or a compromised adjacent tenant (Ch 80 makes the deeper architectural argument for defense in depth this generalizes to). Implicit trust is defensible only inside a genuinely single-tenant, hardware-isolated environment where the cost of sanitizing every crossing is measurably incompatible with a latency budget — a narrow exception, not a default.

**Common failure modes:** *The topology leak.* This resolves Ch 72's deferred forward reference: a distributed trace context propagated across a boundary is attack surface, full stop, not just a tracing-mechanics detail. A team instruments distributed tracing across twenty services and forwards `traceparent`/`tracestate` headers by default. Nobody strips them at the public edge, so an external client receives raw trace context in HTTP responses — internal service names, routing structure, infrastructure conventions an attacker can use to turn a blind attack into a targeted one. The tracing mechanism was never the problem. Crossing the boundary without asking what was riding along with it was.

**Example:** Service meshes such as Istio enforce mutual TLS and header sanitization at every pod-to-pod boundary in a Kubernetes cluster, a deliberate rejection of the older assumption that traffic originating inside the data center firewall can be trusted by default.

### Decision: Walk Boundaries With a Structured Taxonomy, or Rely on Ad Hoc Review

**What it is:** Whether vulnerability discovery follows a systematic, exhaustive walk of every trust boundary using a named taxonomy, or relies on open-ended intuition and "think like an attacker" review.

**Why it exists:** Engineers gravitate toward the code paths they understand best, or whichever exploit sounds most interesting at happy hour — and correspondingly overlook the mundane, catastrophic ones. **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege), popularized by Microsoft as a design-review framework, forces a reviewer to check every category against every boundary instead of declaring victory the moment one interesting hole turns up.

**Options:**
- **STRIDE** — a matrix walk of all six categories against every enumerated trust boundary.
- **Ad hoc / intuitive review** — open-ended architectural walkthroughs driven by senior engineers' experience.

**Trade-offs:** STRIDE guarantees baseline coverage and closes blind spots on ordinary operational risks (a missing audit log, an unauthenticated internal endpoint), but degenerates into a check-the-box exercise fast if applied mechanically without real engineering engagement. Ad hoc review is efficient and genuinely good at surfacing complex, domain-specific business-logic flaws, but offers no structural guarantee of completeness — it reliably misses whatever category the reviewers didn't think to look for, which is exactly the category you needed it for.

**When to choose each:** [Consensus] STRIDE as the baseline for every architectural design review, giving every team a uniform, repeatable minimum bar. Ad hoc review adds real value only as a secondary pass on top of a completed STRIDE walk, hunting for the complex logic flaws a checklist can't be expected to catch.

**Common failure modes:** *The blind spot of intuition.* During an informal review of a new ledger service, senior engineers spend hours debating the cryptographic signature scheme on transactions — the interesting problem. With no structured walk of the STRIDE matrix, nobody checks **Repudiation** or **Denial of Service**, and the service ships writing audit logs to an unthrottled local disk with no rate limiting. Any authenticated user can now fill the disk and quietly crash the host.

**Example:** Microsoft and AWS both mandate structured threat-modeling review inside their internal engineering workflows — no major feature reaches implementation until its design has been decomposed into data-flow diagrams and walked against a formal taxonomy.

### Identify Assets and Adversaries Before Choosing What to Protect

Enumerating boundaries and running STRIDE against them assumes two prior questions are already answered: what's worth protecting, and from whom.

An **asset** is anything whose compromise would matter — not just databases and customer records, but credentials, signing keys, build infrastructure, source code, availability, reputation. Security controls cost money, and you can't protect every component equally; the value of a control tracks the value, and the blast radius (Ch 09), of the asset behind it. A code-signing key is often worth more than the application source it signs: the source reveals implementation detail, but a stolen signing key lets an adversary ship malware that looks like it came from the legitimate publisher.

An **adversary** is any party that benefits from compromising an asset, defined by realistic capability, not a vague label like "hackers." An anonymous internet scanner, a malicious insider, and a resourced criminal group present entirely different risks, and modeling only the first while ignoring the second is a common, expensive omission — plenty of ransomware incidents start with stolen employee credentials, at which point the adversary is, for a while, indistinguishable from a legitimate user.

### Why Smart Engineers Disagree on the Adversary Model

The disagreement in a threat-modeling session is almost never about whether a given vulnerability exists. It's about whether the adversary who'd exploit it is realistic enough to justify the cost of stopping them.

Engineers optimizing for delivery pragmatism reason in expected value: probability times impact. If a mitigation requires real architectural indirection — application-level encryption on every internal database column, say — and the attack path requires a compromised cloud-root administrator credential, they'll argue to accept the risk rather than pay the complexity tax. Engineering against an omnipotent adversary, this view holds, mostly just produces unmaintainable systems with no measurable benefit to show for it.

Engineers optimizing for durability reject probability-based reasoning here specifically. Under an assume-breach posture, a structural path to compromise gets exploited eventually, because an adversary is an adaptive, intelligent actor, not a hard drive with a fixed annual failure rate — probability doesn't apply the same way it does to hardware. Leaving a boundary unmitigated because exploitation looks unlikely today reads, to this view, as a lapse in engineering discipline, not a defensible trade-off.

Neither position is wrong on its own; the resolution is matching the adversary model to the system's actual blast radius instead of importing a stance from some other system down the hall. A decentralized financial protocol or a medical-device telemetry pipeline has an unrecoverable blast radius and earns an advanced, persistent adversary in the model. An internal ERP tool behind corporate SSO does not — paying the complexity tax to defend it against a nation-state interception capability isn't rigor, it's just a bill nobody needed to pay.

### Case Study: The 2013 Target Breach

```
[Attacker]
   │  phishing / stolen credentials
   ▼
[Fazio Mechanical — HVAC vendor billing portal]
   │  crosses an unsegmented internal boundary
   ▼
[Target's internal corporate network]
   │  lateral movement via Active Directory
   ▼
[Point-of-sale systems]
```

Attackers didn't go after Target's payment infrastructure directly. They compromised credentials for Fazio Mechanical, a third-party HVAC vendor with legitimate access to a billing and project-management portal — a narrow, low-value integration by any reasonable asset ranking. The structural failure was that Target's network treated that portal's segment as implicitly trusted by the rest of corporate infrastructure: once the vendor credentials were compromised, the attacker walked straight into the internal network with no boundary left to stop lateral movement, reached Active Directory domain controllers, and from there pushed malware onto point-of-sale terminals, exfiltrating over 40 million card numbers.

The vendor credentials were never the target. They were the path across a trust boundary nobody had bothered to examine. A STRIDE walk of the boundary between the vendor portal and the internal network would have surfaced it directly as an Elevation of Privilege and Information Disclosure risk — the fix, isolating the vendor application with no routing path to the core network, touches one firewall rule. Cheap on a design diagram. Catastrophic to have skipped in production.
