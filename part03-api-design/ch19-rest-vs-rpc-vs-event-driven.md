# Chapter 19 — REST vs. RPC vs. Event-Driven

**Prerequisites:** [Part II, Ch 15 — API Surface Design: What to Expose, What to Hide](../part02-software-architecture/ch15-api-surface-design-expose-hide.md), [Ch 17 — Synchronous vs. Asynchronous Communication](../part02-software-architecture/ch17-sync-vs-async-communication.md). Specifically: minimal surface area, temporal coupling, the synchronous vs. asynchronous coupling decision, and the saga pattern.

**New vocabulary introduced:** HATEOAS, event-carried state transfer

**Key takeaways:**
- Ch 17 settled whether an interaction is synchronous or asynchronous. This chapter is the layer underneath that: once you know the timing, what shape does the actual call take on the wire? REST, RPC, and event-driven aren't three flavors of the same idea — they're three different answers to the question "what is this API, ontologically speaking?"
- REST treats the system as nouns with state, poked at through a small uniform verb set. RPC treats it as functions you invoke. Event-driven treats it as a stream of facts that already happened, whether anyone's listening or not. Pick one and you've quietly decided how coupling, evolvability, and debuggability are all going to behave.
- The failure that actually shows up in production isn't picking the wrong one of the three — it's mixing them without noticing: verb-shaped endpoints wearing REST's clothes, resource-shaped services wearing RPC's clothes, events that are secretly commands wearing a trench coat.
- HATEOAS is REST's textbook ideal, and almost nobody ships it, for a good reason: the coordination tax it charges rarely buys back more than disciplined, well-documented, pragmatic REST already gets you for free.

---

## REST: Resource-Oriented Architecture

**What it is:** A system modeled as nouns (resources) identified by stable URIs, with state mutated through a small, uniform set of verbs — the HTTP methods (GET, POST, PUT, PATCH, DELETE).

**Why it exists:** REST rides on mechanics the web already built for you. Map a domain operation onto a standard HTTP method and every CDN, gateway, and reverse proxy between you and the client can cache reads, rate-limit writes, and route traffic without ever having to understand what your application actually does.

**Options:**
1. **Pragmatic REST** — resources identified by URLs, manipulated via HTTP verbs, with clients relying on out-of-band documentation (OpenAPI/Swagger) rather than in-band discovery
2. **Strict HATEOAS** (Hypermedia As The Engine Of Application State) — the server embeds the actions currently available directly in each response, so the client never needs prior knowledge of the URL structure

**Trade-offs:**
- *Pragmatic REST:* legible to a human, universally supported, and cacheable by infrastructure that has no idea what your business does — but insisting everything be a noun forces a genuinely complex transaction ("approve a loan and transfer the funds") into a manufactured resource like `POST /loan-approvals` that nobody in the business actually thinks of as a "thing."
- *Strict HATEOAS:* the client, in theory, never has to know your URL structure at all, and routes can move without breaking anyone — but in practice every payload bloats with link metadata, static client codegen stops working, and the coordination bill comes due somewhere almost no team ever gets it back.

**When to choose each:**
- *Pragmatic REST:* the default for public-facing APIs, mobile backends, and third-party integrations, where human discoverability and ecosystem trust matter more than theoretical client/server decoupling.
- *Strict HATEOAS:* almost never. The computational and cognitive tax outweighs the decoupling benefit in nearly every real system.

**Common failure modes:**
- **HTTP verb abuse:** mapping a destructive, non-idempotent action onto GET — `GET /users/123/delete` — so a browser or edge cache pre-fetching that URL for performance quietly executes a deletion nobody asked it to run.
- **Verb endpoints disguised as resources:** `/createUser`, `/resetPassword` — RPC calls wearing REST's clothing to a costume party, losing the uniform-interface benefit REST offers without gaining any of the typing benefit RPC would have.
- **The god resource:** one endpoint that returns a wildly different shape depending on which query parameters showed up, purely to dodge a second round trip — which quietly kills the predictable, cacheable resource model REST exists to hand you.

**Example:** Stripe and GitHub are the textbook cases of pragmatic REST done right: enormous, genuinely complex domains exposed through predictable, noun-based URIs, versioned and documented within an inch of their lives, with no real HATEOAS anywhere in sight. GitHub's API does carry a thin layer of hypermedia links for pagination and navigation — partial credit, not the strict ideal — and that's about as close to HATEOAS as most production APIs ever bother getting. **[Strong Recommendation: pragmatic REST over strict HATEOAS for any API with consumers outside your direct coordination]**

---

## RPC: Procedure-Oriented Architecture

**What it is:** A system modeled as functions a client invokes on a remote server as if it were local — explicit, specific verbs (`CalculateCompoundInterest()`) rather than REST's noun-based limitations.

**Why it exists:** RPC trades human legibility for computational performance, strict typed contracts, and code generation — the exact opposite bet REST makes.

**Options:**
1. **gRPC** — protobuf binary serialization over multiplexed HTTP/2, Google's high-performance RPC framework
2. **Twirp** — protobuf's strict schema definitions transmitted over plain HTTP/1.1, trading gRPC's streaming for ordinary load-balancer compatibility

**Trade-offs:**
- *gRPC:* fast, tightly compressed, and enforces backward/forward compatibility at compile time, before a bad change can ship at all — but the binary wire format kills a naive `curl` debugging session dead and demands layer-7 load balancers that actually understand multiplexed HTTP/2 streams.
- *Twirp:* keeps protobuf's compile-time safety and codegen while riding on infrastructure as ordinary as a standard ALB — but that ordinariness costs gRPC's bidirectional streaming.

**When to choose each:**
- *gRPC:* the default for high-throughput, internal service-to-service communication where serialization cost is actually on the critical path.
- *Twirp:* strict schema enforcement is wanted, but the infrastructure team isn't ready to operate a full HTTP/2 service mesh.

**Common failure modes:**
- **The local-method illusion:** a generated client stub (`client.FetchUser(id)`) looks exactly like a local function call, so a developer drops one inside a tight loop, forgets it's crossing a real network boundary, and watches system throughput collapse under an N+1 latency tax nobody noticed introducing.
- **REST-shaped RPC:** a gRPC service designed as `UserService.GetUser(UserIdRequest)`, quietly reshaped into acting like a resource container instead of a procedure boundary — losing RPC's clarity without picking up any of REST's uniformity in exchange.
- Fine-grained RPC calls multiplying past the point of sense, until the system is chattier across the network than the monolith it replaced ever was.

**Example:** Google's internal Stubby — gRPC's predecessor — proved this at hyperscale: parsing JSON strings on every single call is a CPU tax nobody at that volume can afford. Enforcing binary protobuf RPCs internally means every service talks through a strictly typed, compiled contract instead of a loosely typed pile of strings. **[Consensus: gRPC for internal service-to-service traffic where both ends are under your control; REST where they aren't]**

---

## Event-Driven: Fact-Oriented Payloads

**What it is:** Messages placed on an asynchronous broker that declare an immutable fact — "this already happened" — rather than a command. Where REST and RPC are inherently request-shaped, events are fact-shaped.

**Why it exists:** Real temporal decoupling (Ch 17) requires the publisher to genuinely not care who consumes a fact or what they do with it — not "doesn't currently know," but structurally doesn't need to. This is event-driven decoupling (Ch 13), just showing up as payload design rather than a transport choice.

**Options:**
1. **Thin events** — the payload carries only an identifier and an event type (`{"event": "OrderPlaced", "order_id": "123"}`); the consumer fetches the full state itself
2. **Fat events** (event-carried state transfer) — the payload carries the full state of the resource at the moment of the event

**Trade-offs:**
- *Thin events:* lightweight, and the consumer never acts on stale data because it always goes and fetches the current state itself — except that fetch drags back exactly the temporal coupling events existed to kill; the publisher's API goes down, and the consumer can't process a single event until it's back.
- *Fat events:* temporal coupling is gone, full stop — the consumer has everything it needs and never calls the publisher at all — but delivery lag opens the door to eventual-consistency collapse: a consumer can happily act on a snapshot some newer mutation has already quietly outdated.

**When to choose each:**
- *Thin events:* the payload would be very large (video processing pipelines), or privacy/regulatory constraints prohibit broadcasting full record contents onto a shared bus.
- *Fat events:* the default for CQRS read projections (Ch 18) and saga orchestration (Ch 17), where cross-domain data availability matters more than payload size.

**Common failure modes:**
- **Commands disguised as events:** publishing `SendWelcomeEmail` to a topic dresses like an event but is really an RPC command wearing someone else's name tag — the publisher is now tightly coupled to the email service's very existence, with none of the decoupling events were supposed to buy. The actual fact-shaped version is `UserRegistered`; whether anyone sends a welcome email off the back of that is the email service's business, not the publisher's.
- **Event explosion:** every internal state change gets its own published event with zero curation, until vague names like `UserUpdated` mean a dozen different things to a dozen different consumers, and the event stream ends up harder to reason about than the function calls it replaced.

**Example:** Kafka event schemas in heavily decoupled architectures lean toward fat events modeled in Avro or protobuf — a `PaymentSecured` event carries its full transactional metadata along with it, letting fulfillment, analytics, and ledger services each go about their business with zero dependency on whether the billing API happens to be up right now.

---

## Why Smart Engineers Disagree: Nouns vs. Verbs in Complex Domains

The sharpest friction in wire-level API design surfaces the moment someone tries to model a complex, multi-step business transaction — and underneath it, it's really an argument about which side of the network boundary you happen to be standing on.

REST advocates insist everything gets modeled as a noun, multi-step process included. A checkout that needs fraud checks, inventory verification, and payment gets routed through an abstract `CheckoutSession` resource, mutated with `PATCH` requests as it crawls forward. The payoff, they argue, is keeping the predictability of web infrastructure and getting standard HTTP caching and conditional-request semantics for free.

RPC advocates call this architectural gymnastics. A checkout is fundamentally an action, not an entity, and forcing a verb to cosplay as a noun produces an opaque state machine where an obvious one would've done fine. They'd rather just expose `ExecuteCheckout()` and let the execution path be exactly as explicit as it actually is.

Both sides are right — on their own side of the perimeter. Public interfaces need REST's stability and the free web infrastructure that comes bundled with it, because that's the audience you can't coordinate with and need a contract that ages gracefully for. Internal services coordinating procedural sagas across boundaries you actually control lose nothing switching to RPC verbs, and gain real clarity by refusing to invent a noun for every process. The mistake was never choosing REST or RPC — it's dragging the public-interface argument into an internal boundary, or the internal-clarity argument out into a public one.

REST is a state interface. RPC is a function boundary. Events are a recorded history that multiple systems get to interpret on their own terms. None of the three are competing implementations of one underlying abstraction, whatever the diagrams in some vendor's slide deck imply — and the actual failure mode this whole chapter is about is treating them as if they were.

*Concepts expanded in later chapters: resource modeling in depth (Part III, Ch 20), idempotency mechanics (Part III, Ch 22), pagination strategies (Part III, Ch 23), authentication and authorization at the boundary (Part III, Ch 24).*
