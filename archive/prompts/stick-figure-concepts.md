# Stick-Figure Concept Grid — corrected against the real 90-chapter TOC

Same visual language as the ChatGPT sample: one simple stick figure + one clear prop per
panel, consistent line weight, no faces, no color. Format: `NN. LABEL — visual concept`.

## Part I — Systems Thinking
1. THE OPTIMIZATION TARGET — figure with arrows pointing several different directions from one point
2. COMPLEXITY — figure next to a tangled scribble/knot
3. COUPLING & COHESION — two figures linked by a taut chain, circled by a dotted ring
4. ABSTRACTION — figure looking at a plain box; gears hidden behind it
5. DESIGNING FOR CHANGE — figure at a fork in the road with swappable signs
6. MECHANICAL SYMPATHY — figure next to a staircase of shrinking blocks (register→RAM→disk)
7. RELIABILITY — figure holding an umbrella
8. LOCAL VS. GLOBAL — one gear spinning fast next to a big stalled gear it's connected to
9. DECISION FRAMEWORKS — figure at a signpost with several forked arrows

## Part II — Software Architecture
10. MONOLITH VS. SERVICES — one big box vs. several small connected boxes
11. LAYERED ARCHITECTURE — stacked horizontal bars with a plug on the side
12. DEPENDENCY DIRECTION — arrow from a wobbly box pointing at a solid box
13. ARCHITECTURE COUPLING — same chain-link icon as #3, at building scale (boxes, not figures)
14. ABSTRACTION LAYERS — figure sliding a translucent pane between two boxes
15. API SURFACE — a door with some windows open, some boarded up
16. VERSIONING — two doors marked v1 / v2 with a rope bridge between them
17. SYNC VS. ASYNC — figure waiting face-to-face vs. figure dropping a letter in a mailbox and walking off
18. DATA OWNERSHIP — a fenced-in database icon, one figure holding the only key

## Part III — API Design
19. REST/RPC/EVENTS — three tiny icons in a row: a door, a phone, a bell
20. RESOURCE MODELING — a labeled filing drawer
21. ERROR CONTRACTS — figure handed a clearly labeled card instead of a blank "?"
22. IDEMPOTENCY — figure pressing the same button twice, same result both times
23. PAGINATION & STREAMING — a stack of numbered pages next to a continuous hose of dots
24. AUTHN/AUTHZ BOUNDARIES — figure with an ID badge at a gate, locked door behind it
25. INTERNAL VS. EXTERNAL API — a fence with a public gate on one side, a private door on the other
26. FFI — two mismatched puzzle pieces jammed together with a connector piece

## Part IV — Code Organization
27. FILE STRUCTURE — labeled stacked drawers
28. NAMING — a name tag stuck on a plain box
29. SPLIT VS. KEEP TOGETHER — a box, half-cut by scissors, question mark above
30. COMMENTS — a sticky note on one line of code, rest uncovered
31. ABSTRACTION: HELP OR OBSCURE — a box either clearly labeled or wrapped in fog
32. ERROR HANDLING STYLES — three tiny paths: a net, a falling figure, a labeled box
33. UNSAFE CODE — figure stepping past a low guardrail marked with a caution sign

## Part V — Testing Strategy
34. TESTING PYRAMID — a triangle divided into three horizontal bands
35. TEST LAYERS — same triangle, each band labeled
36. MOCK VS. REAL — a puppet next to a real object of the same shape
37. FIXTURES — a small labeled prop box
38. PROPERTY-BASED TESTING — a die feeding into a checklist
39. WHEN NOT TO TEST — a faint checkmark, figure shrugging
40. TEST NAMING — a labeled rack of test tubes
41. COVERAGE — a target with only some rings shaded in

## Part VI — Engineering Process
42. GOOD ISSUES — a ticket card with every field filled in
43. ISSUE VS. PR — a ticket next to a magnifying glass over a code block
44. MILESTONE PLANNING — a flagged checkpoint on a road/timeline
45. ADRs — figure writing in a bound notebook stamped "DECISION"
46. SPEC-FIRST — a blueprint sitting in front of an unbuilt outline
47. CODE REVIEW — two figures, one holding a red pen over a code block
48. TECHNICAL DEBT — figure dragging a ball and chain
49. PROCESS OVERHEAD — a scale weighing a gear against a stack of paper

## Part VII — Git and Delivery
50. BRANCHING — a tree diagram with several branches
51. COMMIT MESSAGES — a neat scroll/receipt with a clear label
52. SQUASH VS. PRESERVE — several small blocks squashed into one vs. left separate
53. BRANCH LIFECYCLE — a branch tag looping into a trash can
54. FORCE PUSH — figure shoving a box hard, caution sign overhead
55. MERGE VS. REBASE — two lines merging into one vs. one line replaying on top of another
56. TAGGING & RELEASES — a flag pinned to a point on a timeline
57. WHAT BELONGS IN CI — a checklist gate, one item roped off outside it
58. FAIL-FAST VS. FAIL-SAFE — a pipeline forking to a stop sign vs. a soft net
59. CI CACHING — a robot arm grabbing a pre-made box instead of building one
60. MATRIX BUILDS — a grid of small identical boxes, rows and columns
61. RELEASE AUTOMATION — a conveyor belt moving a box onto a truck, unattended
62. ENVIRONMENT PROMOTION — a box climbing labeled stairs: dev → staging → prod
63. TOOLCHAIN & DEPENDENCIES — a wrench linked to a small chain of tool icons

## Part VIII — Documentation
64. WHAT TO DOCUMENT — an open book beside a code window, one page intentionally blank
65. README/SPEC/ADR/COMMENT — four small labeled documents in a row
66. DOCS STAYING HONEST — a book getting a fresh "last updated" stamp
67. API DOCS — an instruction card handed from one figure to another
68. RUNBOOKS — figure holding a checklist while a small flame icon flickers nearby

## Part IX — Observability
69. LOGGING LEVELS — a scroll of lines next to a volume dial
70. METRICS/LOGS/TRACES — three tiny icons: a bar chart, lines of text, a dotted path
71. ALERTING SIGNAL VS. NOISE — one ringing bell among a row of muted bells
72. DISTRIBUTED TRACING — a dotted path hopping across several small boxes
73. ERROR BUDGETS & SLOs — a piggy bank beside a dial reading "99.9%"

## Part X — Concurrency and Parallelism
74. SHARED STATE VS. MESSAGES — two figures reaching for the same box vs. one handing a sealed envelope to the other
75. LOCKS — a padlock on a shared box
76. ASYNC/THREADS/PROCESSES — a figure juggling vs. identical figures walking in step vs. separate boxes each with its own figure
77. DEADLOCK/LIVELOCK/STARVATION — two figures each gripping one end of a table, stuck
78. THE ACTOR MODEL — small mailbox icons, each feeding one isolated figure

## Part XI — Security
79. THREAT MODELING — figure sketching a diagram, magnifying glass over one weak spot
80. DEFENSE IN DEPTH — concentric rings around a center dot
81. INPUT VALIDATION — figure at a gate checking a form, rejecting a bad shape
82. AUTHN VS. AUTHZ — an ID check next to a separate locked door with a keyhole
83. SECRETS MANAGEMENT — figure holding a key inside a small safe
84. SUPPLY CHAIN RISK — a chain of boxes, one showing a small crack

## Part XII — Performance
85. WHEN TO OPTIMIZE — a gate that only opens once a measurement chart clears it
86. PROFILING-FIRST — a magnifying glass over a bar chart of a running figure
87. LATENCY VS. THROUGHPUT — one fast single lane vs. many slower parallel lanes
88. CACHING — figure grabbing a nearby labeled box instead of walking to a distant warehouse
89. DATA STRUCTURES & ALGORITHMS — a neatly sorted row of boxes beside a scattered pile
90. COST OF ABSTRACTION — a layered stack with a small price tag on top

## Appendix B
A. DECISION FRAMEWORKS — figure holding a small fanned spread of labeled tool cards (a
   scale, a fork-in-the-road sign, a checklist), choosing one to hold up
B. COMMON SMELLS — figure holding its nose near a box with faint stink lines
C. ARCHITECTURE PATTERNS CATALOG — figure standing before a wall of small labeled
   blueprint tiles, lifting one off the wall to look at it closer
D. FULL GLOSSARY — figure at a large open book with a magnifying glass over one
   highlighted word, small labeled tabs sticking out along the book's edge like a
   dictionary's thumb index


# Part Header Image Prompts

One image-generation prompt per Part (12) plus Appendices. Same simple flat stick-figure
line-art style as the existing 90 chapter icons — no faces, consistent line weight, same
limited color palette — but composed as a single wider "banner" scene with more than one
figure or element interacting, since each of these represents a whole Part rather than one
concept. Paste each one to Gemini individually.

---

**Part I — Systems Thinking**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A single stick figure stands at the center holding several strings, each leading off in a
different direction to a small labeled icon (a scale, a tangled knot, a mountain, a
signpost) — representing the different, competing things a system can be optimized for.
The figure is calm and deliberate, not overwhelmed, gently holding all the threads at once.

**Part II — Software Architecture**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands in front of a large, partially transparent
blueprint of a building made of labeled blocks and layered floors, some connected by
visible lines, some deliberately separated by gaps. The figure is mid-gesture, pointing
at one connection between two blocks, as if deciding whether it belongs.

**Part III — API Design**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

Two stick figures face each other across a simple service counter
or window. One figure passes a clearly labeled, neatly wrapped box through the window;
behind that figure, a stack of other boxes sits deliberately out of reach on the far
side, implying things kept hidden versus the one thing offered.

**Part IV — Code Organization**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands in front of a wall of small labeled drawers
and folders, arranged into a few clear, distinct clusters rather than one messy pile. The
figure is placing one last labeled item into the correct drawer, mid-motion.

**Part V — Testing Strategy**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands at the base of a large three-tiered pyramid
(small top band, wider middle, wide base), each band lightly labeled with a simple icon
(a checkmark, two puzzle pieces, a bridge). The figure holds a checklist and is looking
up at the whole shape rather than any one tier.

**Part VI — Engineering Process**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure walks a winding path marked with a few simple
signpost checkpoints (a ticket icon, a notebook, a magnifying glass over a document). In
the distance behind the figure, small and out of focus, a tiny ball-and-chain sits
unattended at a fork not taken.

**Part VII — Git and Delivery**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands where several branching lines (like tree
branches) reconverge into a single road leading to a small rocket or delivery truck at
the far edge of the frame. One branch trails off and fades, implying a path that was
abandoned.

**Part VIII — Documentation**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure holds an open book in one hand, and with the other
hand holds up a small mirror toward a simple machine or gear assembly next to them,
checking that what's written in the book actually matches what the mirror reflects.

**Part IX — Observability**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands calmly in front of a small wall of simple
dashboards — a bar chart, a wavy line, a dotted path, a dial — all glowing gently, like
instruments on a cockpit panel. The figure has one hand raised near a single bell,
not touching it, deciding whether it's worth ringing.

**Part X — Concurrency and Parallelism**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

Several identical stick figures stand around a single shared table
or resource in the center of the frame. One figure holds a simple padlock token; the
others wait their turn calmly, in a loose orderly line rather than crowding in.

**Part XI — Security**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands inside a set of concentric protective rings or
walls, like ripples, holding a single small key. A faint outline of a second figure is
visible just outside the outermost ring, without any hostility implied — simply "outside."

**Part XII — Performance**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands at a gate that is only halfway open, one hand
on a stopwatch and the other on a small chart that is trending upward. Beyond the gate,
out of focus, a wrench sits untouched — implying the fix is waiting for the measurement,
not the other way around.

**Appendices**
Same very simple capybara but not stick-figure line-art style as my existing chapter icons: clean
consistent line weight, limited flat color palette. Wide banner composition.

A stick figure stands in front of a small, neatly organized card
catalog or library shelf, mid-motion pulling one labeled drawer open partway among many
closed ones — implying quick lookup and reference rather than a story being told start to
finish.
