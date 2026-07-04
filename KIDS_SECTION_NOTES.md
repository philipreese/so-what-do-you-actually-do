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

---

## Part V complete, Ch34–Ch41

### Analogies used (for reference — avoid repeating verbatim)
- **Ch34**: school play rehearsal stages — solo line-running, scene work with a partner, full cast dress rehearsal (cheap/precise vs. expensive/vague)
- **Ch35**: testing bike brakes in isolation vs. a bike built so tangled that checking the brakes means dealing with the whole bike
- **Ch36**: grading math homework by final answer vs. by exact taught steps — breaks the moment a kid finds a smarter method
- **Ch37**: three siblings sharing one bathroom every school morning, reset or not reset between each one
- **Ch38**: folding/unfolding paper airplanes across a huge pile of different paper types, then shrinking a failure down to the smallest ripped scrap
- **Ch39**: packing for a school trip — not checking the zipper (already fine) vs. actually checking the permission slip and medication
- **Ch40**: a chore chart labeled "Task 7" vs. "Trash bins are out by 7am Tuesday"
- **Ch41**: a piano practice log (minutes logged) vs. being able to actually play measure 12 cold, unwarned

### What worked
- Deliberately avoided reusing the wife section's own strong images this Part more than usual, since Part V's wife pass leans on unusually good analogies (book editing, tasting the sauce, GPS route-checking, hotel room reset, attendance/pop-quiz) — every kids section found a genuinely different vehicle (school play, bike brakes, math grading, shared bathroom, paper airplanes, packing a bag, chore chart, piano practice) rather than translating the same picture into kid words
- This Part's chapters are unusually abstract/meta (testing tests) — school-based analogies (rehearsal, homework grading, chore charts, practice logs) mapped naturally since "checking your own work" is something every kid already does constantly
- Ch37's shared-bathroom analogy nails the specific "only fails depending on execution order" bug shape (order-dependent test failures) that's easy to gloss over — kept the sibling-rotation detail because that's the mechanism, not just flavor

### Edge cases and decisions
- Ch36 and Ch38 both involve "does it still work if you change the method" — kept them structurally distinct (grading process vs. answer; testing one input vs. a systematic sweep across many) since the underlying chapters are answering different questions (state vs. interaction verification; example-based vs. property-based coverage)
- No jargon anywhere in this Part's kids sections — "mock," "fixture," "coverage," "assertion" never appear; even "property-based testing" became "state the rule out loud, then try it on everything"

### Next session
- Continue with Part VI, Ch42–Ch49
- Push after Part V+VI+VII together (per this session's request to cover Parts V, VI, VII)

---

## Part VI complete, Ch42–Ch49

### Analogies used (for reference — avoid repeating verbatim)
- **Ch42**: "buy a new door" (guessed fix) vs. "the door won't shut" (the real problem); "clean your room" (no finish line) vs. "put the clean laundry in the dresser" (checkable done)
- **Ch43**: a six-week science fair project checked at small stages by a teacher vs. only checked once, the day before presentations
- **Ch44**: five friends building a multi-room haunted house — a bare walking-skeleton walkthrough first vs. perfecting each room in isolation; the party date never moves, scope does
- **Ch45**: a coach's written reasons for a lineup change, old note never erased, a new note added instead
- **Ch46**: a joint yard sale with a neighbor — a two-minute upfront conversation about what's in and out of scope, before any tables come out
- **Ch47**: checking a friend's science fair poster for real (logic, not spelling) vs. a ten-second "looks great" rubber stamp
- **Ch48**: shoving stuff in the closet on purpose with a real Saturday plan (real debt) vs. calling it "cleaning" with no plan at all (just a mess)
- **Ch49**: a family road-trip rulebook that only ever grows (grape juice stain, carsickness) and never gets re-checked against whether the original reason still holds

### What worked
- This Part's wife sections lean heavily on domestic/family scenarios already (dinner party, doctor's chart, road trip, toaster) — kids sections deliberately used different domestic scenes (haunted house, yard sale, closet, science fair) rather than translating the same picture, keeping the two sections' images distinct throughout
- Sports/coaching (Ch45) and school project checkpoints (Ch43) gave natural homes for "written record of why" and "small checks beat one big check" without reaching for the same well twice
- Kept process-management chapters (48, 49) grounded in things a kid actually owns the consequences of (their own closet, their own family's road trip rules) rather than abstract "systems," which kept the translation honest instead of hand-wavy

### Edge cases and decisions
- Ch44 and Ch46 both touch "small conversation now vs. expensive surprise later" — kept them structurally distinct: Ch44 is about building a rough whole-thing-first vs. perfecting one piece at a time (integration risk), Ch46 is about agreeing on scope before starting at all (design agreement) — different mechanisms, so different scenes (haunted house vs. yard sale) even though both are "talk first, build second"
- Ch42 and Ch46 both involve "state the actual problem/scope, not a premature guess" — kept surface scenarios (broken door vs. yard sale planning) distinct since one is about diagnosing a single problem and the other is about scoping a joint project

### Next session
- Continue with Part VII, Ch50–Ch63 (14 chapters — largest Part)
- Push after Part V+VI+VII together (per this session's request)

---

## Part VII complete, Ch50–Ch63 (14 chapters — largest Part)

### Analogies used (for reference — avoid repeating verbatim)
- **Ch50**: a band practicing together daily vs. only playing together once, the night before the show
- **Ch51**: a science lab notebook — "changed to 2 tbsp" (what) vs. "...because 1 tbsp fizzled in under 10 seconds" (why)
- **Ch52**: fifteen crossed-out math scratch-paper attempts (squash) vs. a five-step geometry proof worth keeping intact (preserve)
- **Ch53**: training wheels left bolted on after you've learned to balance, vs. a dated photo of the day you learned
- **Ch54**: two siblings building one shared LEGO city — tearing out your own road is fine alone, not once a sibling's neighborhood connects to it
- **Ch55**: two friends searching separate streets for a lost dog — telling it as two parallel searches vs. one flattened fake sequence
- **Ch56**: an official 5K finisher certificate (name, date, time, stamp) vs. a sticky note saying "I ran a race"
- **Ch57**: the ten-second shoes/lunch/homework check every morning vs. a full "am I organized for the semester" review crammed into the same two minutes
- **Ch58**: a Saturday with three unrelated things to get ready for (soccer, birthday present, piano video) — a ripped bag stops that one task, but doesn't stop checking the other two
- **Ch59**: reusing last year's camping packing list, labeled "Camping List" instead of by what's actually still true (same campground, same dates, same gear)
- **Ch60**: prepping every mathematically possible school-lunch combination (3×4×2) vs. just the combos people actually eat
- **Ch61**: a class "Books Read" leaderboard app that's only as honest as how specifically kids log their reading
- **Ch62**: carrying the same science-fair project through school → district → state judging, vs. rebuilding it fresh before each round
- **Ch63**: pulling a garden's weeds five minutes a week vs. an ignored summer ending in a weekend of digging and dead plants

### What worked
- This was the largest Part (14 chapters) and the most mechanically dense (Git/CI plumbing) — leaned almost entirely on kid-owned routines and hobbies (garden, science fair, LEGO, band practice, camping list, lunch packing) rather than reaching for screens/apps, keeping the same discipline as earlier Parts
- Several wife-section analogies for this Part are unusually strong and specific (two cars to a reunion, dishes vs. piled-up sink, moving boxes, contract sign-off, oil changes) — every kids section deliberately found a different vehicle rather than a kid-language translation of the same image, per the pattern set in Part IV/V
- The "two things converging, told two ways" shape (Ch55) mapped cleanly onto a lost-dog search — physical, easy to picture, and the "does the parallel part matter" question survived the translation intact
- Kept "check once, fast, everything at once" (Ch58) visually distinct from "check often, small, cheap" (Ch50, Ch63) even though both are frequency/cost trade-offs — different underlying mechanism (aggregating independent failures vs. paying integration cost continuously vs. routine maintenance), so different scenes

### Edge cases and decisions
- Several chapters in this Part (Ch50, 57, 58, 59) are all shades of "how often/how much to check or combine work" — deliberately varied the domain every time (band practice, backpack, Saturday errands, camping list) so the throughline doesn't read as the same joke four times in a row
- Wife pass explicitly avoided reusing fire/smoke-alarm imagery too many times across the book; kids pass continued that discipline here (Ch57 could have reached for "smoke detector" again but used a morning backpack check instead)

### Next session
- Continue with Part VIII, Ch64–Ch68 (5 chapters — documentation)
- Push now (Parts V+VI+VII complete, per this session's request to cover them)

---

## Part VIII complete, Ch64–Ch68 (5 chapters — documentation)

### Analogies used (for reference — avoid repeating verbatim)
- **Ch64**: a bike with quirks (skipping gear, soft brakes, sticky kickstand) patched with a verbal warning speech to whoever borrows it, instead of actually getting it fixed
- **Ch65**: two fridge notes — a grocery list (must stay current) vs. a note explaining why the family switched grocery stores (frozen record, ruined by editing it to match today)
- **Ch66**: a chore chart taped to the actual fridge in the actual kitchen (updates happen because you're standing right there) vs. a "real" copy in a drawer upstairs nobody updates in the moment
- **Ch67**: babysitting handoff notes for a sitter with zero way to reach you for four hours — current facts only, explicit "this part doesn't matter" callouts, no family history
- **Ch68**: a family's one specific, pre-walked plan for getting separated in a crowd (exact meeting spot, contact numbers already written down) vs. a vague "just find us" agreed to once in the car and never checked against reality

### What worked
- This Part's wife sections lean on strong physical objects (kitchen note, utility bill/inspection report, fridge allergy list, furniture instructions, fire escape plan) — every kids section still found a different vehicle rather than translating the same image, continuing the discipline from every prior Part
- This was the first Part where two chapters (Ch65, Ch66) are both fundamentally about "which writing is allowed to go stale and which isn't" — kept them structurally distinct: Ch65 is about *classifying* a document up front (two fridge notes, two purposes); Ch66 is about *maintaining* a document that's already supposed to stay current (one chore chart, location determines whether updates actually happen)
- Deliberately reused a domestic caretaking frame (babysitter, family emergency plan) for Ch67/Ch68 rather than reaching for a technical-adjacent "handoff" scenario — both land on real, recognizable kid-relevant stakes (a sibling watching, a kid alone in a crowd) without being heavier than the material calls for

### Edge cases and decisions
- Ch65's kids section ran to 252 words on first draft (over the hard 250 cap) — trimmed repeated phrases ("the actual reason the switch happened in the first place" → "the actual reason the switch happened") rather than cutting content; confirms the note from Ch01/88 calibration that a trim pass should be budgeted for nearly every chapter, not just the first two
- Considered an EpiPen/allergy-action-plan analogy for Ch68 (maps "automate the mechanical part" onto the auto-injector device itself) but chose a lost-in-a-crowd family plan instead — same one-named-failure-mode shape, without introducing real medical/emergency content that would tonally clash with this book's otherwise-light stakes
- Formatting rotation this Part: Ch64 bold lead-ins, Ch65 italic pull-quote opener (no bold), Ch66 `[!NOTE]` block, Ch67 plain prose only (no devices), Ch68 bold lead-ins — deliberately varied so no two adjacent chapters use the same device, per this session's reminder to keep varying format chapter to chapter

### Next session
- Continue with Part IX, Ch69–Ch73 (5 chapters — observability)
- Push after Part VIII (or VIII+IX together)
