---
version: 1
slug: "src-routes-page-svelte"
primary_target: "src/routes/+page.svelte"
related_targets: []
---

# Home page surface brief

Scope: the `/` route only. Visitor mode: Experience (the labs lead; the author is a byline). Audience: fellow developers and learners arriving from a post, a README, or a shared lab link. Job: play a running experiment within seconds, then find its story and the rest of the labs. Proof and content: six labs under `src/labs`, nine posts, three Go projects; all real, nothing invented. Constraints: light theme pinned by the user; the gopher easter egg and the VoidArchive handle stay; copy may be rewritten as long as every fact holds; the shared Header is not rendered on this route (the running head carries the nav) and the shared Footer is re-tinted to this world so the gopher survives.

## Direction contract

THESIS: The home page is a magazine spread whose numbered figures are the live labs, running. It refuses the profile-card-plus-grid portfolio and the terminal costume.

OWN-WORLD: White coated stock, near-black ink (#141414), one cobalt spot ink (#2242c8) with its tint (#dfe6fb). Hairline black rules and column rules. Serif essay text in two narrow columns (Source Serif 4), grotesk caption capitals (Public Sans). Figure numbers at billboard scale in the spot colour, overlapping their plates. Depth only by overlap across a rule; no shadows, no gradients, no cards, no kickers.

STORY: The visitor sees Conway's Game of Life running inside Fig. 1, clicks a cell and changes it, reads two columns about the labs, scrolls to Figs. 2 to 4 alive (boids, sorting, Bagchal), then the Notes column of posts and the Instruments list of Go libraries, and ends at the byline colophon where the gopher lives.

FIRST VIEWPORT: Running head rule: site and issue line left, nav tabs right. Left 520px: 60px serif headline, italic byline, two-column essay with a spot-colour drop cap. Right 700px: "Fig. 1" at 132px overlapping the top-left corner of a bordered 700×520 live Game of Life grid on a tint grid; caption rule beneath with the live reading (generation · population · running). The strip of Fig. 2, 3, 4 plates starts at the bottom edge and is cut by the fold.

FORM: Mathematical Games spread, position 3 on the ordered list; seed:a9745f2fa560bd8e.

SIGNATURE INTERACTION: every figure is alive and pokeable; a paused figure drops to a flat ink outline and its reading says Paused. Motion grammar: only the simulations move; no entrance animations; under prefers-reduced-motion figures render one still frame with a Play control.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved

- Site-wide rollout of this world to blog, projects, labs, and the shared Header is a later surface each.
- The red bird mark is not used on this surface; the running-head wordmark stands in. Whether it returns elsewhere is open.
