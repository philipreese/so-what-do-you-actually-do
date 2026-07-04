# Ch 27 — File and Module Structure

**Prerequisites:** [Complexity Is the Enemy](../part01-systems-thinking/ch02-complexity-is-the-enemy.md), [Coupling and Cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [Abstraction and Information Hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [Layered, Hexagonal, and Ports-and-Adapters Architecture](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md), [Dependency Direction and Inversion](../part02-software-architecture/ch12-dependency-direction-inversion.md)

**New vocabulary introduced:** package-by-layer, package-by-feature, god package

**Key takeaways:**
- A file tree isn't storage — it's the physical enforcement mechanism for architectural boundaries, whether anyone designed it that way on purpose or not.
- Package-by-feature is the correct default for application code; package-by-layer belongs in frameworks where the technical role genuinely *is* the domain.
- Ports belong with the domain. Adapters belong with infrastructure. Physical directory segregation is what lets the compiler enforce dependency direction instead of a code review comment.
- Circular package dependencies are almost never a naming or tooling problem — they're a sign the architectural boundary got drawn in the wrong place.
- A `utils/` or `common/` package isn't an architectural layer. It's the absence of one, wearing a folder name.

## For My Wife

**Most companies keep their filing cabinets organized one of two ways.** Either by client — one folder holds everything about the Martinez account, contract and invoices and correspondence all together — or by document type: one drawer for every invoice regardless of whose it is, another drawer for every contract. Programmers organize code the same way, and this chapter argues client-style organization wins for almost anything a business actually changes over time. If the Martinez account's terms change, you open one folder. Organize by document type instead, and that same change sends you digging through five different drawers — the invoice one, then the contract one, then the correspondence one — turning a small update into a scavenger hunt.

**The one place document-type organization actually earns its keep is when the type of document is the whole job** — a filing service whose entire business is "process invoices," where the invoice format itself is what changes, not any particular client's invoice. For an ordinary business, that's the exception, not the rule.

**The other trap this chapter names is the junk drawer.** Every kitchen has one — takeout menus, dead batteries, a screwdriver, kept together because nobody wants to decide where they actually belong. Codebases grow the same drawer, usually named "utils" or "common," and it fills up the same way: nobody owns it, everyone tosses something in because deciding is more work than not deciding, and within a couple of years it's so large and so tangled into the rest of the system that touching it risks breaking three unrelated features nobody remembers still depend on it.

---

Previous chapters established the principles of [coupling and cohesion](../part01-systems-thinking/ch03-coupling-and-cohesion.md), [information hiding](../part01-systems-thinking/ch04-abstraction-and-information-hiding.md), [ports and adapters](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md), and [dependency direction](../part02-software-architecture/ch12-dependency-direction-inversion.md). This chapter answers the question those chapters explicitly punted on: once you understand the principles, what do they actually look like as directories and import statements in a real codebase?

Naming within packages is covered in [Ch 28](ch28-naming-conventions-and-when-they-matter.md). Deciding when to split a single concept across multiple files is covered in [Ch 29](ch29-when-to-split-files-vs-keep-together.md).

---

### Package-by-Layer vs. Package-by-Feature

**What it is:** The primary organizing decision for a codebase's root structure — whether packages are grouped by technical role or by business capability.

**Why it exists:** When a business requirement changes, some engineer has to go modify code. The directory structure is what decides whether that modification stays contained to one package or scatters itself across the entire repository.

**Options:**

1. **Package-by-layer** — Directories named after technical roles: `controllers/`, `services/`, `repositories/`, `models/`.
2. **Package-by-feature** — Directories named after business capabilities: `orders/`, `billing/`, `inventory/`, each containing its own controller, service, and repository.
3. **Hybrid** — Feature packages for application code; genuinely generic infrastructure (logging, metrics, config) in their own explicitly named packages outside the feature tree.

**Trade-offs:**

| | Package-by-layer | Package-by-feature |
|---|---|---|
| Cohesion | High *technical* cohesion | High *domain* cohesion |
| Change locality | A single feature change touches many directories | A single feature change stays in one directory |
| Team ownership | Difficult — no directory maps to a team's domain | Natural — a team owns a directory subtree |
| Cross-feature leakage | High — shared directories blur domain boundaries | Low — features are physically isolated |

Package-by-layer maximizes technical cohesion — all the HTTP parsing logic lives in one folder, tidy and self-contained. It torches domain cohesion in the same move: every business feature ends up scattered across every technical directory at once. The cost shows up as shotgun surgery: one new feature means touching `controllers/`, `services/`, `repositories/`, `models/`, and `tests/` — six directories, and not one of them actually named after the feature you're building.

Package-by-feature reverses the whole arrangement. All billing logic — controller, service, repository — lives in `billing/`, full stop. The feature finally has an address. The trade-off is a little duplicated technical boilerplate across feature packages, which is almost always the cheaper problem to have.

**When to choose each:**

[Consensus] Choose **package-by-feature** for business applications, product code, and any codebase organized around domain capabilities. Industry practice has more or less landed on this one.

[Strong Recommendation] Choose **package-by-layer** only for framework code, generic platform libraries, or low-level infrastructure where the technical role genuinely *is* the domain — a query parser, a connection pool, a protocol implementation. In those places, `parsing/`, `execution/`, and `mapping/` describe exactly what evolves independently, no translation required. The hybrid — feature packages plus a small, deliberately named set of infrastructure packages — is what mature production systems actually converge on.

**Common failure modes:** In a package-by-layer structure, `services/` quietly balloons to 150 files spanning 20 unrelated business domains. Navigating it means holding the entire system in your head at once. Every new developer drops their service in next to a dozen others it has nothing to do with. The structure describes the technical stack in loving detail — and says nothing at all about what the system does.

**Example:** Idiomatic Go rejects package-by-layer for application code outright. A repository with `models/`, `controllers/`, and `utils/` at the top level is a documented anti-pattern in the Go community, called out repeatedly by Go's own maintainers. Go's package-level visibility rules force you to export everything from a shared package — a `models/` package has to export all its types, and information hiding dies right there. The moment `User` references `Order` and `Order` references `User` right back, the result is a circular import the compiler flatly refuses to build — the structural failure gets dragged into the open at compile time instead of hiding until production.

---

### Physical Placement of Ports and Adapters

**What it is:** The literal directory mapping for the hexagonal architecture from [Ch 11](../part02-software-architecture/ch11-layered-hexagonal-ports-adapters.md) — where interfaces (ports) live on disk, and where the infrastructure that implements them lives.

**Why it exists:** [Dependency inversion](../part02-software-architecture/ch12-dependency-direction-inversion.md) requires the domain never depend on infrastructure. Share a directory between the domain package and its PostgreSQL adapter, and sooner or later somebody imports a PostgreSQL-specific type straight into business logic — nothing in the toolchain will lift a finger to stop them. Physical package segregation is what turns the dependency rule from a line item on a code-review checklist into something the compiler actually enforces.

**Options:**

1. **Core-owned ports** — The domain package contains the interfaces it needs; adapter packages implement those interfaces and import the core. The core imports nothing from adapters.
2. **Infrastructure-owned ports** — Infrastructure defines the interfaces; domain code depends on them. This reverses dependency direction.
3. **Flat placement** — Domain logic, ports, and adapters share a single directory. Enforced only by discipline.

A core-owned layout:

```
core/
  orders/
    service.go
    order.go
    repository.go     ← port (interface owned by the domain)

adapters/
  postgres/
    order_repo.go     ← imports core/, implements the port
  redis/
  http/
```

**Trade-offs:**

[Strong Recommendation] **Core-owned ports** make the dependency rule mechanically enforceable, not just aspirational. Because `postgres/` imports `core/`, a circular import running the other direction fails the build outright. The domain stays technology-independent, full stop. Swapping a database implementation means touching only the adapter package. Infrastructure developers do have to learn the domain interfaces — a genuinely worthwhile cost to pay.

**Infrastructure-owned ports** flip the coupling on its head: the domain now depends on infrastructure choices. Change a database and you're changing domain code along with it — which is exactly the failure mode this whole pattern exists to prevent.

**Flat placement** works fine at small scale with an unusually disciplined team. The architectural constraint lives entirely in reviewers' heads, and heads forget. It erodes, reliably, given enough time.

**Common failure modes:** A team adopts hexagonal architecture in spirit but colocates domain and adapters in a single package anyway. Somebody imports an AWS SDK exception type directly into `PaymentService`, because there's no directory boundary standing in the way. The architecture degrades quietly, with no alarm going off. The first visible symptom is usually a database-specific exception showing up in a raw HTTP response, baffling whoever's on call.

**Example:** Rust enforces this pattern at the language level. A production Rust project defines a `core` module holding public traits (ports), and a separate `infrastructure` module holding database adapters. Through explicit `pub use` re-exports, `infrastructure` exposes only the selected public symbols, hiding concrete adapter implementations from the rest of the application entirely. The module tree enforces information hiding. The compiler enforces dependency direction. Nobody has to catch it in code review.

---

### Circular Package Dependencies

**What it is:** The structural condition where package A imports package B and package B imports package A.

**Why it exists:** Circular dependencies were never a naming problem. They're almost always a symptom of a concept split across a boundary it should never have had to cross — two things that belong together got forced apart, or a shared primitive got left tangled up inside a higher-level feature package that had no business holding onto it.

**Options:**

1. **Package merging** — Collapse the two mutually dependent packages into one.
2. **Primitive extraction** — Identify the shared type or interface causing the cycle and extract it into a third, independent package that both A and B import.

**Trade-offs:**

[Strong Recommendation] Choose **package merging** when the cycle comes from overlapping domain concepts. `orders/` imports `invoices/` to calculate a total, `invoices/` imports `orders/` right back to read line items — the cycle is telling you these were always one lifecycle domain, not two. The boundary was drawn wrong. Merge them and move on.

Choose **primitive extraction** when the cycle traces back to a shared mechanical type — a `RequestContext`, a common error type, a foundational event struct — that neither package genuinely owns. Pull it out into its own dedicated, dependency-free package.

**Common failure modes:** In languages that tolerate runtime circular imports (Python, Node.js), engineers paper over the structural problem by moving the import statement inside the function body. The deferred import delays resolution until call time and buries the architectural failure where nobody will see it — until the two packages initialize each other's state in the wrong order under production load and the crash is anything but predictable.

The second failure mode: extract the shared type into `common/`, then keep tossing more things in there for convenience. The original cycle disappears, sure, but `common/` now imports everything and everything imports it right back — a god package that just changed its name.

**Example:** Go refuses to compile circular package imports, full stop. Engineers new to the language often find this maddening at first. It's actually a feature: the cycle gets exposed at build time instead of discovered during a production incident at 2 a.m. The structural boundary problem gets addressed on the spot instead of quietly accumulating.

---

### The God Package

**What it is:** A package named `common/`, `shared/`, `helpers/`, or `utils/` that accumulates code whose only relationship is that no one knew where else to put it.

**Why it exists:** Creating a domain package means somebody has to make an ownership decision. Adding one more function to `utils/` doesn't require anyone to decide anything. Convenience replaces architecture one function call at a time, and nobody notices it happening.

**Trade-offs:**

A `utils/` package typically ends up holding string helpers, date formatting, SQL generation, HTTP utilities, authentication helpers, configuration loading, and stray fragments of business logic that never found a real home. None of it has anything to do with the rest. Every other package imports `utils/` purely because it's convenient, which quietly makes it the single most coupled component in the entire system — sky-high afferent coupling paired with next to zero internal cohesion.

The right question was never "where should this go?" It's "what *is* this, actually?" Code that's genuinely shared deserves a package named after what it does, not where it landed. A date formatter and timezone parser belong in `timeparse/`. A money type and rounding rule belong in `currency/`. A structured logging adapter belongs in `logging/`. That name constrains what's allowed to pile up there and makes ownership impossible to dodge.

[Strong Recommendation] A shared package earns its keep for genuinely generic, stable technical capabilities — logging, metrics, configuration, cryptographic primitives. The test: can you describe the package in one noun phrase without reciting its contents? If not, it isn't an architectural layer. It's a junk drawer with a README.

**Common failure modes:** A `utils/` package starts life with three innocent string helpers, balloons to 3,000 lines over three years, and ends up one of the top five most-imported packages in the entire repository. No team owns it, so every team edits it. Any attempt to split it up now requires coordinating with every single team that imports it. It can't be removed without a multi-quarter refactor nobody wants to sponsor, and it keeps growing faster than anyone can clean it up.

**Example:** Large legacy Java codebases routinely grow a `common.jar` that every other module is forced to depend on. Its contents span serialization helpers, business rule fragments, database utilities, and domain types accumulated over a decade of "I'll just put it in common." No team owns it. Every team depends on it. Changing it requires releasing every downstream module — which is precisely why changes to it happen so rarely, and precisely why it never stops growing in the meantime.

---

### Why Smart Engineers Disagree on What Constitutes a "Feature"

The disagreement was never about whether package-by-feature beats package-by-layer for application code — that question settled a while ago. It's about what actually counts as a feature.

One engineer organizes around business domains: `orders/`, `billing/`, `inventory/`. Another organizes around team ownership boundaries instead — same underlying idea, but the granularity now follows Conway's Law rather than the domain model. A third engineer, building a query engine, reaches for `parsing/`, `planning/`, `execution/`, and `storage/` — all technical roles on paper, but also the exact independent axes along which a query engine actually changes. For that engineer, the organizing principle *is* the technical stage, and package-by-layer is describing reality accurately, not violating some rule.

The organizing principle that actually works follows the primary axis of change, wherever that turns out to live. Independent business capabilities evolving at different rates? Organize by business capability. Independent technical components evolving at different rates, because the product genuinely *is* a stack of technical components? Organize by technical component. The scheme was never the problem — the problem is picking a scheme optimized for one axis when every real change in the system happens along a completely different one.
