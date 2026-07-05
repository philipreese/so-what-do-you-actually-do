# Part XI — Security

## For My Wife

Getting on a flight means passing through several different checks that don't trust each other. The ticket counter checks your ID against your booking. The security line checks what you're carrying. The gate agent scans your boarding pass one more time, right before you walk down the jet bridge — even though you already showed ID twice. None of those checks assumes the previous one caught everything. Each one is protecting something slightly different, and each one still runs even after the others already passed.

**Part III already drew a line between two questions** — who someone is, and what they're allowed to do — in the specific context of one boundary, an API. This part exists because that same line reappears at every layer of a system, not just the one everyone thinks to guard. A locked front door doesn't mean the safe inside needs no lock of its own. A verified ticket doesn't mean the gate agent skips the scan.

**A reader leaving this part should be able to look at any single check in a system and ask two things:** what, specifically, is this check protecting — and what actually happens the moment someone gets past it anyway. Most expensive security failures aren't a missing lock. They're one lock that everyone quietly assumed was doing the job of two.

## For My Kids

Going to a theme park, you don't just get checked once. You buy a ticket at the gate. Then you get a wristband scanned to walk into the park. Then, at one specific ride, there's a height bar you have to clear — a totally different check, just for that one ride.

**Passing one of those doesn't mean you skip the others.** Having a valid ticket doesn't get you past the height bar. A scanned wristband doesn't refund a ticket you never bought.

Each check is guarding something different. The gate is making sure you paid. The wristband is making sure you're allowed inside today. The height bar is making sure you're tall enough for that specific ride to be safe for you.

**This part is about noticing all the separate checks**, and asking, for each one, exactly what it's actually protecting — because assuming one check covers a job that was really a different check's whole job is how a person ends up somewhere they shouldn't be.

---

Part III already introduced the confused deputy problem and zero-trust architecture, and drew the line between authentication and authorization, in the specific context of API boundary design. Part XI exists because that line reappears at every layer of a system, not just the API boundary, and needs its own vocabulary to be handled deliberately rather than reactively. It also leans hard on Part I's Ch 07 (partial failure, fail-fast) and Ch 09 (blast radius and reversibility) — this Part's core argument is that those same systems-thinking tools, applied to an adversarial context instead of an accidental-failure one, are most of what security engineering actually is.

The Part's chapter order mirrors how a real security review proceeds. Ch 79 establishes a shared vocabulary — asset, adversary, attack surface, trust boundary — that every later chapter assumes rather than re-derives, and makes the Ch 09 argument explicit: a mistake caught at design time costs a redraw, the same mistake caught in production costs a redesign under incident pressure. Ch 80 generalizes Ch 24's zero-trust architecture from the one boundary it originally covered into a system-wide principle — no single control should ever be the only thing standing between an attacker and an asset — and that principle becomes the organizing frame the rest of the Part builds on. Ch 81 and Ch 82 are both, in different ways, Ch 80 applied concretely: input validation is defense-in-depth enforced at every trust boundary a request crosses, not just the system's outer edge, and authentication-versus-authorization is Ch 24's boundary-logic question worked out at the mechanics level RBAC, ABAC, and token design actually require.

Ch 83 and Ch 84 close the Part on the two failure modes that don't look like attacks at all until after the fact: a leaked secret that reads as a legitimately authenticated request, and a dependency that's exactly current and still malicious. Both point back to Part VII's release machinery — Ch 83 to Ch 61's OIDC-based trusted publishing, Ch 84 to Ch 56's signed tags and Ch 63's dependency management — as the deferred security half of decisions that Part VII covered on their operational merits alone. A reader leaving Part XI should be able to look at any control in a system and ask two questions this Part trained: what specific trust boundary is this protecting, and what happens the moment it fails.
