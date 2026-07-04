# KIDS_SECTION_NOTES.md — Calibration Cheat Sheet ("For My Kids" pass)

Scaffolding for this pass only. Delete after all 90 chapters are done (user's call, flag first).

---

## Ch01 and Ch88 (calibration)

### What worked
- One physical, hands-on analogy followed all the way through — fort-building (Ch01), pinned group-chat message (Ch88) — no metaphor-switching mid-section
- Ending on the concrete bad outcome itself (fort collapses into slow/weak/ugly; team stands in the wrong gym at 4:00) rather than a restated moral
- Landing the chapter's actual recommendation as an action inside the analogy ("ask out loud what we're building this for" / "connect the note straight to the schedule") instead of naming it as a rule
- Picked non-screen analogies on purpose (fort, sports team schedule) even though video games would have been the lazy default fit for both

### What was cut
- The word "cache" itself — first draft of Ch88 used "cache" as a plain-English aside; cut it, since it's a technical term even used casually
- "Optimize"/"optimizing for" — replaced with "building this for" / "going for" (Ch01)
- "Invalidation" / "TTL" / "stampede" — none appear; TTL became "make the message expire on its own, good for three days"; explicit/event-driven invalidation became "someone has to remember by hand" vs. "connect the note straight to the schedule"
- A resolution-first ending — restructured Ch88 so the mechanical-fix sentence is immediately followed by the stakes sentence, not the other way around, so the section ends on the bad outcome, not the fix

### Edge cases and decisions
- **Add styling, varied per chapter** — user flagged that plain unstyled prose paragraphs were wrong too. Now using the same device palette as the wife pass: italic pull-quote openers, bold lead-ins on select paragraphs (not every paragraph), occasional `[!NOTE]` blocks for a test/rule worth isolating. Vary which devices a given chapter uses — don't make every section a pull-quote + 3 bold paragraphs template. Ch01/Ch88 got pull-quote + bold leads; Ch02 got bold leads + a `[!NOTE]` for the "test"; Ch03 got bold leads only, no quote/NOTE; Ch04/Ch05 got bold leads only. Keep rotating.
- **Paragraph length: keep them SHORT.** First calibration pass used 2 dense paragraphs (~120-130 words each) — user flagged this as wrong on sight. Revised to 4-8 short paragraphs (1-4 sentences each), same total word count, just broken up more. Read much better for the target age — skimmable, one beat per paragraph. Use this shorter-paragraph shape for every chapter going forward, not just the calibration two.
- Word count target: 150–250, and it's a hard cap (unlike the wife section's softer 200–280) — both calibration drafts ran ~260-275 on first pass and needed trimming; budget for a trim pass every chapter
- The two sections (wife/kids) do NOT need to share the same concrete image — Ch01's wife section has no single analogy (stays abstract/direct), Ch88's wife section uses convenience-store/warehouse while kids uses a team group chat. They only need to agree on which idea is the one worth keeping.
- Zero exclamation points used in both calibration drafts — the instructions allow one or two but neither draft needed one; don't force one in just to hit the allowance
- Formatting: no bold, no pull-quote, no [!NOTE] in either calibration section — plain prose paragraphs only. (Open question for later Parts: consider whether any formatting variation belongs in "For My Kids" sections at all, or whether plain prose is the right default throughout, unlike the wife pass which varied structure deliberately.)

### Next session
- Continue with rest of Part I, Ch02–Ch09
- Push after Part I or Part I+II together

---

## Part I complete, Ch02–Ch09

### Analogies used (for reference — avoid repeating verbatim)
- **Ch02**: packing for sleepaway camp (essential vs. self-invented ziplock-nesting complexity)
- **Ch03**: split class presentation, "like slide 4 showed" (hidden coupling between two halves nobody wrote down)
- **Ch04**: snack captain for the team (hide the method, not just the data — teammates who wire their own plans to *how* you get snacks, not *that* snacks arrive)
- **Ch05**: school locker, one shelf built to flex for gym clothes vs. speculative compartments for a trombone/sport/elective that never showed up
- **Ch06**: distance to fetch something while doing homework — bag by your feet vs. kitchen drawer vs. a friend three houses over (the latency-hierarchy cliffs, not a smooth gradient)
- **Ch07**: baking cookies for a bake sale, salt-instead-of-sugar caught immediately vs. hidden in the dough vs. discovered by a stranger mid-bite at the sale (crash vs. corruption vs. wrong answer)
- **Ch08**: relay race, drilling the already-fast runner vs. the one runner actually holding the team's time back (bottleneck, not average)
- **Ch09**: five bucks of allowance vs. three hundred saved dollars on a console (reversibility × blast radius; plus "still deciding" for six months is itself a decision)

### What worked
- One analogy per chapter, never split across two — even chapters with 3-4 named sub-concepts (Ch09 had reversibility/blast-radius, deferral, Cynefin, ADRs) still only translated the single throughline the wife section also centered on, not all four
- Domestic/physical analogies (camp packing, a locker, a kitchen) read better than anything ops/screen-adjacent — none of Part I reached for a video game or app as the vehicle
- Ending on the concrete embarrassing/costly moment (stranger biting a salty cookie; empty CVS parking lot; crumpled binder loose in a backpack) rather than a restated lesson

### Edge cases and decisions
- When a chapter's wife section covers multiple named ideas (Ch04 had encapsulation-vs-info-hiding, leaky abstractions, AND wrong-abstraction-is-worse), pick the one presented *first and most developed* in the wife section as the kids throughline, not the one in the `[!NOTE]` aside — the NOTE-boxed idea is usually the secondary point, not the core one
- Don't reuse a chapter's own wife-section image for the kids section — different image, same underlying idea, is the right level of overlap (e.g., Ch04 wife section used a filing-cabinet-style example already spent in Ch03's wife section; kids used snack-captain instead, fresh territory)

### Next session
- Continue with Part II, Ch10–Ch18
- Push after Part II (or Part II+III together)

---

## Part II complete, Ch10–Ch18

### Analogies used (for reference — avoid repeating verbatim)
- **Ch10**: group project — working together at one table vs. splitting up "because it feels grown-up" while still texting every ten minutes (distributed monolith)
- **Ch11**: an invented card game — rules written generically ("compare the two highest numbers") vs. welded to one deck ("the blue Uno card wins")
- **Ch12**: science-fair shopping list written in your own words vs. one volunteer's private shorthand (interface ownership)
- **Ch13**: two unrelated school clubs secretly sharing one spreadsheet (shared-database anti-pattern — same failure shape as Ch03's hidden coupling, different scale)
- **Ch14**: relaying a message through your sister to Mom — real middleman (she times it, softens it) vs. pointless one (repeats verbatim, just adds a hop)
- **Ch15**: guest WiFi password vs. handing out the real one that's now impossible to walk back a year later
- **Ch16**: neighbor carpool pickup time quietly tightened with no warning — indistinguishable, to the kid on the corner, from just not showing up
- **Ch17**: borrowing a phone charger — calling a chain of friends live (stuck until everyone answers) vs. texting the group chat (free to walk away, but might not hear back in time)
- **Ch18**: three family members independently feeding the hamster "to be safe" — nobody was the one actual owner of the true answer

### What worked
- Several chapters this Part circle the same underlying shape (own the vocabulary / don't weld to one implementation — Ch04, Ch11, Ch12, Ch14 all touch it) — kept each one's *surface scenario* distinct (card game, shopping list, message relay) even when the underlying lesson rhymes; a reader shouldn't notice the repetition
- Physical/social kid analogies continue to outperform anything ops-flavored — no chapter in Part II reached for an app or screen as the vehicle
- The "two things looked independent but weren't" shape (Ch10, Ch13) reads well as a reveal — state the surface appearance first, then show the moment it breaks

### Edge cases and decisions
- When a wife-section chapter already has a strong, obvious analogy (Ch17's phone-call/text-message), it's fine for the kids section to reuse the same vehicle rather than force a different one — reused it here (charger/group-chat framing) since it was genuinely the best fit, not because of laziness. Sharing an image across the two sections is allowed; it's just not required.
- Ch18 and Ch13 are both "shared state, multiple owners" chapters at different scales (data ownership vs. architecture-level coupling) — used genuinely different scenarios (hamster feeding vs. shared spreadsheet) so they don't read as the same joke twice

### Next session
- Continue with Part III, Ch19–Ch26
- Push now (after Part I + Part II) per the 2-3 Part cadence

---

## Part III complete, Ch19–Ch26

### Analogies used (for reference — avoid repeating verbatim)
- **Ch19**: family group chat, "walked the dog" as fact vs. request — same words, two meanings, mixed up
- **Ch20**: lemonade stand menu ("Regular Lemonade — $2") vs. handing customers the cooler's internal shelf/jug layout
- **Ch21**: school locker drop-box rejecting homework — wrong slot (your fault) vs. jammed box (not your fault) vs. a box that lies and says "delivered!"
- **Ch22**: texting a friend at the concession stand "grab me a soda" twice, worried the first didn't send — needs a named "soda request #1" to be recognized as a repeat
- **Ch23**: team roster stapled-to-the-front-of-the-stack — skip-N-names (slow, breaks when the list shifts) vs. "next 10 after Jordan Smith" (fast, stable)
- **Ch24**: an 8th-grader's badge scan letting a 6th-grader's bag get fetched — the door checks *who* can enter, never checks *what*/*for whom* the errand was
- **Ch25**: a shortcut through the woods that a dozen classmates start relying on without ever asking permission — becomes a real obligation whether or not you meant it to
- **Ch26**: two partners never agreeing who packs away grandma's borrowed glass ornaments each night — both assume the other has it, until one night both grab the same one at once

### What worked
- Ch19 and Ch22 both hinge on "the exact same message can mean two different things" / "a duplicate has to be recognized as a duplicate" — kept the surface scenarios totally distinct (group chat wording vs. a named request) since the underlying shape is genuinely different (ambiguity vs. deduplication)
- For the most jargon-dense chapter yet (Ch26, FFI/ABI/memory ownership — three sub-concepts), picked only the one sub-idea that survives translation cleanly (ownership/responsibility) rather than forcing all three into one analogy — the "no do-over, it just breaks" stakes did double duty covering the chapter's "least forgiving surface" framing without a separate analogy for it
- Continued avoiding screens/apps as the reflexive analogy — group chat text wording (Ch19, Ch22) is the closest this Part came to a screen, and even those are about the words/timing, not the technology

### Edge cases and decisions
- When a chapter's core idea is very close to one already covered (Ch25's Hyrum's Law vs. Ch16's backward-compatibility-as-a-promise), picked a genuinely distinct surface analogy (a shortcut path vs. a carpool pickup time) so neither reads as a rerun, even though the underlying lesson ("an unannounced/unintended promise is still a promise once people depend on it") rhymes on purpose
- Highly technical chapters (Ch26) still get zero jargon — no "memory," "pointer," "allocate," or "crash" used in the literal computing sense; translated entirely into a physical, breakable, borrowed object

### Next session
- Continue with Part IV, Ch27–Ch33
- Push after Part IV (or IV+V together)

---

## Part IV complete, Ch27–Ch33

### Analogies used (for reference — avoid repeating verbatim)
- **Ch27**: school binders organized by subject vs. by type, plus the backpack's catch-all "stuff" folder (junk-drawer package)
- **Ch28**: calling the family car "the blue car" (breaks the day it's repainted) vs. "Mom's car" (survives any paint job)
- **Ch29**: sorting a Lego tub by build (a whole 800-piece castle in one bin, fine) vs. by size (five unrelated leftover pieces dumped together, useless)
- **Ch30**: a note taped to the class hamster cage — "this is the hamster's cage" (worthless) vs. "no sunflower seeds, allergic" (earns its place) vs. the same note surviving two hamsters past being true
- **Ch31**: a flipped fridge magnet for two-sibling dish duty (right-sized, permanent) vs. an elaborate six-slot chore wheel built for kids and chores that don't exist
- **Ch32**: texting a friend to grab something from the store — an explicit "got it" / "sold out" vs. silence you have to guess about
- **Ch33**: the family's locked-away sharp chef's knife, used only for a real reason (paper-thin garlic) and put straight back, with a heads-up given to whoever's in the kitchen next

### What worked
- Ch05 (locker, Part I) and Ch31 cover near-identical lessons (don't build for imagined future needs) — kept the concrete images completely different (school locker shelving vs. a chore wheel) so neither reads as a rerun, same approach used for Ch13/Ch18 and Ch16/Ch25 pairs in earlier Parts
- This Part's chapters are the most inward-facing/mechanical yet (file trees, naming, comments, error propagation) — leaning on a kid's own physical organizing systems (binders, a Lego tub, a chore magnet) mapped cleanly, same way Part VII's wife pass leaned on dishes/calendars for its own mechanical chapters
- Ch33's knife analogy carries real, appropriate-for-the-age stakes (a locked-away sharp tool, a younger sibling's safety) without being gratuitous — mirrors how the wife pass let genuinely serious analogies (fire drills, security) stand on their own weight rather than forcing artificial lightness

### Edge cases and decisions
- Ch30 deliberately did NOT reuse the wife section's own strong images (the fridge note, the window note) — picked a fresh scenario (hamster cage) rather than riffing on the same picture, since the wife section for this chapter is unusually good and reusing it would read as copying rather than translating
- For chapters this technical (Ch32's exception vs. error-as-value; Ch33's unsafe code), still zero jargon — no "exception," "stack," "compiler," or "memory" in the literal technical sense anywhere in either kids section

### Next session
- Continue with Part V, Ch34–Ch41
- Push after Part IV+V together (per this session's request to cover at least Parts III and IV, now both done — user said pause after this)
