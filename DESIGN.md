---
name: anishshrestha.com
description: A magazine spread whose numbered figures are live labs, running.
colors:
  paper: '#ffffff'
  ink: '#141414'
  ink-muted: '#555555'
  cobalt-spot: '#2242c8'
  cobalt-tint: '#dfe6fb'
typography:
  display:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: 'clamp(34px, 4.2vw, 60px)'
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: '-0.015em'
  figure-numeral:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: 'clamp(64px, 9vw, 132px)'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '-0.04em'
  headline:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '22px'
    fontWeight: 600
    lineHeight: 1.2
  title-italic:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '15.5px'
    fontWeight: 400
    lineHeight: 1.5
  label-head:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.14em'
  label-reading:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '11.5px'
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: '0.06em'
  caption:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.02em'
rounded:
  none: '0px'
spacing:
  hairline-gap: '8px'
  caption-gap: '10px'
  row: '14px'
  section-head: '24px'
  column-gap: '28px'
  nav-gap: '28px'
  plate-gap: '40px'
  spread-gap: '56px'
  section: '72px'
components:
  link-inline:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.none}'
  link-inline-hover:
    textColor: '{colors.cobalt-spot}'
  running-head:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label-head}'
    padding: '0 0 10px'
  reading-row:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.cobalt-spot}'
    typography: '{typography.label-reading}'
    padding: '8px 0 0'
  reading-control:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label-reading}'
    padding: '0'
    rounded: '{rounded.none}'
  reading-control-hover:
    textColor: '{colors.cobalt-spot}'
  plate-running:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.cobalt-spot}'
    rounded: '{rounded.none}'
  plate-paused:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
  section-label:
    textColor: '{colors.cobalt-spot}'
    typography: '{typography.label-head}'
  back-row:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    padding: '14px 0'
---

# Design System: anishshrestha.com

## Overview

**Creative North Star: "The Mathematical Games Spread"**

The site is set like a feature spread in a mid-century popular-science magazine: white coated stock, near-black ink, and one cobalt spot ink that does every job colour has to do. The figures are not illustrations of the labs; they are the labs, running in place, numbered Fig. 1 to Fig. 4 with their reading (generation, population, running) printed beneath on a hairline rule. Essay text sits in two narrow serif columns with a column rule and a spot-colour drop cap. The running head carries the masthead, issue number and the primary nav as small grotesk capitals on a 1.5px rule. There is no chrome: no cards, no shadows, no gradients, no rounded corners, no kickers above headings. Depth is never faked: nothing overlaps, nothing casts a shadow.

The world is deliberately dense and quiet. Rules do the structural work (running head, section openers, article rows, caption rows), and the only motion on the page is the simulations themselves. Hover changes colour, never position. This world was committed for the home route under the direction contract `seed:a9745f2fa560bd8e` and refuses the profile-card-plus-grid portfolio and the terminal costume that preceded it.

**Scope.** This system ships on every route: the home spread (`src/routes/+page.svelte`, `src/lib/components/spread/*`), the shared running head and colophon footer (`src/lib/components/Header.svelte`, `Footer.svelte`), the reading routes (blog index and posts, projects, labs index, error page, which share the `.page`, `.page-title`, `.dek`, `.meta`, `.ruled` scaffolding in `src/app.css`), and the six lab pages, where the global `.section-card`, `.section-title`, `.btn` and `.caps` classes carry the world and each lab opens with its figure numeral and a serif h1. The legacy dark terminal world is gone; the old token names in `src/app.css` (`--color-bg-*`, `--color-text*`, `--color-primary*`, `--color-border`) are aliases of the two inks kept so Tailwind utilities keep working. Figure numerals run at `clamp(48px, 6vw, 88px)` on the home plates and `clamp(40px, 5vw, 64px)` on lab pages; they sit above their plate, never over it. Three brand commitments bind every surface: the Go gopher easter egg stays, VoidArchive is the handle, and the theme is light.

**Key Characteristics:**

- White paper, near-black ink, one cobalt spot ink and its tint; nothing else.
- Hairline (1px) and heavy (1.5px) ink rules carry all structure.
- Source Serif 4 for reading, Public Sans capitals for labels, readings and captions.
- Figure numerals in spot colour, set above their plates.
- Live plates: spot colour and a solid border while running, ink and a dashed border when paused.
- Flat everywhere; depth only by overlap across a rule.
- Square corners, no shadows, no gradients, no cards, no kickers.

## Colors

A two-ink print palette: paper and ink with a single cobalt spot ink and its screen tint.

### Primary

- **Cobalt Spot** (`{colors.cobalt-spot}`): the one spot ink. Figure numerals, the masthead wordmark, drop cap, section labels (Notes, Instruments), "Fig. n" caption prefixes, the running state of every live plate (live cells, flock, sort bars, tigers), the reading row text, link underlines, hover colour, focus outline, and text selection background.
- **Cobalt Tint** (`{colors.cobalt-tint}`): the spot ink screened back. Used for the cell grid lines inside the Game of Life plate and as the retinted legacy `--color-bg-tertiary`. Never used as a fill behind text.

### Neutral

- **Paper** (`{colors.paper}`): page and plate background. Plates are paper, not a lighter or darker surface; there is only one surface.
- **Ink** (`{colors.ink}`): all text, every rule and border, the paused state of every plate (paused cells, paused flock, idle bars, Bagchal board lines and points), and the resting colour of reading controls.
- **Ink Muted** (`{colors.ink-muted}`): exists only as the retinted legacy `--color-text-muted` for the shared Footer on the home route. The spread itself uses no muted text; secondary voice is carried by italic and by size, not by grey.

### Named Rules

**The Two-Ink Rule.** Every surface is printed with ink and one spot colour on paper. No greys for hierarchy, no second accent, no tinted backgrounds behind text. If something needs to stand out, it is cobalt; if not, it is ink.

**The Running Ink Rule.** Spot colour on a plate means it is running. A paused or idle plate drops to ink. The reading row's state square inherits the same colour, so colour and the word (Running / Paused / Opening) always agree.

## Typography

**Display Font:** Source Serif 4 (with Georgia, Times New Roman, serif)
**Body Font:** Source Serif 4 (same family; optical size 8..60, weights 400, 600, italic 400)
**Label/Numeral Font:** Public Sans (with system-ui, sans-serif; weights 400, 700)

**Character:** A text serif doing the essay work and a plain grotesk doing the apparatus work (running head, figure numbers, readings, captions, dates). The two never mix inside a sentence; the grotesk is always set in capitals or at billboard size, so the pairing reads as magazine typography rather than a web font stack.

### Hierarchy

- **Display** (600, `clamp(34px, 4.2vw, 60px)`, 1.02, -0.015em, balanced wrap): the page headline. One per page.
- **Figure numeral** (Public Sans 700, `clamp(64px, 9vw, 132px)`, 1, -0.04em): "Fig. n" set in spot colour, absolutely positioned at the top-left of its plate, overlapping it; `aria-hidden`, since the caption repeats the number.
- **Headline** (600, 22px, 1.2, balanced): article titles in the Notes and Instruments columns. Links in headlines have no underline at rest and underline on hover.
- **Title italic** (400 italic, 17px, 1.5): byline, column ledes, and the colophon. Italic is the secondary voice of this world.
- **Body** (400, 15.5px, 1.5, `text-wrap: pretty`): essay and article text. Essay paragraphs after the first indent 1.4em with 12px between; the first paragraph opens with a 58px, 600-weight spot-colour floated drop cap. Columns are at most 520px wide (`--measure`).
- **Label, running head** (Public Sans 400, 12px, 0.14em, uppercase): masthead, nav, section labels (Notes, Instruments), "All notes / All projects" links (0.1em).
- **Label, reading** (Public Sans 700, 11.5px, 0.06em, uppercase, tabular numerals): the live reading beneath each plate; also the dates in the back pages at weight 400, and the spot-colour "Fig. n" caption prefix.
- **Caption** (Public Sans 400, 13px, 0.02em, sentence case): figure captions. The only grotesk text set in sentence case.

### Named Rules

**The Capitals Rule.** Public Sans appears either as spaced uppercase (0.06em to 0.14em) at 11.5px to 12px, or as a tight-tracked figure numeral at billboard size. It is never body text.

**The Base-16 Rule.** The spread root is 16px / 1.5; every text size is a fixed pixel value against it (11.5, 12, 13, 15.5, 17, 22), with only the headline and numeral fluid.

## Layout

The spread is a centred page up to 1440px wide with fluid side margins (`clamp(16px, 5vw, 72px)`) and 36px above the running head (20px under 640px). Sections stack vertically and each opens on a rule: the running head closes with a 1.5px ink rule; the plates strip, back pages and colophon each open with a 1.5px rule, 72px above and 24px of padding below; the "Figs. 5, 6" note opens on a 1px rule. Every article row in the back pages opens on a 1px rule with 14px of padding above and below. These rules are the entire structure; there are no boxes.

The opening spread is a two-column grid: a 520px text column (`minmax(0, 520px)`) and the lead plate filling the rest, 56px apart, 44px below the running head. Essay text runs in two CSS columns, 28px apart, with a 1px ink column rule. The plates strip is a three-column grid (48px row gap, 40px column gap). The back pages are two equal columns 56px apart. The colophon is a single italic paragraph at most 60ch wide.

Breakpoints, observed: at 1024px the opening collapses to one column and reorders so the lead plate follows the byline and the essay follows the plate (the live lab must lead on narrow screens); the plates and back pages become single columns with 40px gaps. At 640px the running head stacks (masthead above nav, 10px gap, nav gap 18px), the essay drops to a single column, and the figure numeral's left offset shrinks from -14px to -4px. Plate height follows its aspect ratio (700:520 for Fig. 1, 3:2 for Figs. 2 and 3, square SVG viewBox for Fig. 4), so plates stay fully visible at every width.

Spacing is a small fixed set: 8px (hairline rule to reading), 10px (caption gap, running head padding), 14px (article row padding), 24px (section opener padding), 28px (column and nav gaps), 40px and 56px (grid gaps), 72px (between sections).

## Elevation & Depth

No shadows, no tonal layering, no translucent surfaces. The world is a single sheet of paper and everything sits on it at the same depth. The only depth cue is overlap: the spot-colour figure numeral is positioned above its plate's top edge (`z-index: 1`, `pointer-events: none`) and crosses the plate's 1.5px border, like a number printed over a photograph. Links, buttons and plates do not lift, scale or glow on hover; state is shown by colour (ink to cobalt) and by the border style of the plate (solid to dashed). Focus is a 2px cobalt outline offset 2px.

### Named Rules

**The Overlap-Only Rule.** Depth is produced by one element crossing a rule or a border, never by shadow, blur, gradient or a raised surface. If a component needs to sit "above" something, it overlaps an edge.

## Shapes

Square. Every box, plate, button and outline has a 0px radius; the design.json tonal and shape vocabulary has a single step, `none`. Borders are ink: 1.5px solid around every plate and under the running head and section openers, 1px for column rules, caption rules, article rows and the inline note. A paused plate keeps the same 1.5px weight and switches to `dashed`. Inside plates, the Bagchal board is 1.5px ink lines with 4px-radius ink points and 16px-radius cobalt tiger discs, the only circles in the world. The reading row's state marker is an 8px square of currentColor, not a dot. Links underline with a 1px spot-colour line offset 3px, which is the world's smallest rule.

## Components

The home route has no form inputs, cards or chips. The components below are the ones that recur.

### Links

- **Inline:** inherit ink colour, 1px underline in cobalt, offset 3px, no transition. Hover turns the text cobalt and keeps the underline.
- **Headline links** (back pages): no underline at rest; underline on hover.
- **Running head links** (masthead, nav): no underline at any state; hover turns cobalt.
- **Focus:** 2px solid cobalt outline, 2px offset, on links and buttons alike.

### Running Head (navigation)

- A flex row on a 1.5px ink bottom rule, baseline aligned, Public Sans 12px uppercase 0.14em. Left: masthead with the domain in cobalt bold, issue number and month. Right: four nav links 28px apart, ink, no underline, cobalt on hover. Under 640px it stacks, masthead first, 10px gap, nav links 18px apart. It replaces the shared Header on this route.

### Plates (live figures)

- **Shape:** 1.5px solid ink border on paper, square corners, width 100%, height from aspect ratio.
- **Running:** the simulation draws in cobalt (cells, boids, bars, tigers); grid lines inside the Life plate are cobalt tint; border solid.
- **Paused:** the simulation draws in ink and the border goes dashed. In the sort plate the active bar inverts (ink while running, cobalt while paused) so there is always one mark in the other ink.
- **Numeral:** "Fig. n" overlapping the top-left corner, with 52px of top padding reserved on the figure (68px on the lead plate) so the numeral crosses the border without covering the content.
- **Interaction:** the Life canvas uses a crosshair cursor and toggles a cell on click or tap; the others are pokeable only through their controls. Under `prefers-reduced-motion: reduce` a plate renders one still frame, paused, with its Play control available.

### Reading Row

- Sits directly under a plate on a 1px ink top rule, 8px padding and margin. Public Sans 700, 11.5px, uppercase, 0.06em, tabular numerals, cobalt. Items wrap with a 4px by 18px gap. The first item is the state word (Running / Paused / Opening) preceded by an 8px square in currentColor. Controls are pushed right (`margin-left: auto`, 12px apart).

### Reading Controls (buttons)

- Text buttons with no background, no border and no padding: they inherit the reading row's face and tracking, set in ink with a cobalt 1px underline offset 3px; hover turns cobalt. Labels are verbs (Pause, Play, Reseed, Shuffle). This is the only button style in the world; there is no filled primary button.

### Figure Captions

- Under the reading row with 10px gap: Public Sans 13px, 0.02em, sentence case, ink. Open with the spot-colour "Fig. n" prefix (11.5px uppercase bold, 6px right margin), then one sentence of fact, then the inline links "Open the lab" and "Read how it was built" separated by a middle dot.

### Back Page Rows

- Section label in cobalt capitals (12px, 0.14em, 18px below). Each article: 1px ink top rule, 14px vertical padding, a date in grotesk capitals (11.5px, 4px below), a 22px serif 600 headline, a 15.5px serif description. Columns close with an "All notes" / "All projects" link in grotesk capitals (12px, 0.1em), 16px above.

### Colophon

- Opens on a 1.5px rule with 72px above, 24px of padding, 56px below. One italic 17px serif paragraph, at most 60ch, with inline links. The byline, handle and contact live here; the gopher lives in the retinted shared Footer beneath it.

## Do's and Don'ts

### Do:

- **Do** print with two inks: ink `#141414` and cobalt `#2242c8` on white, with the tint `#dfe6fb` reserved for grid lines inside a plate.
- **Do** structure with rules: 1.5px ink to open a section or frame a plate, 1px for column rules, caption rows and article rows.
- **Do** set reading apparatus (readings, dates, captions, nav, section labels) in Public Sans capitals at 11.5px to 12px with 0.06em to 0.14em tracking; set prose in Source Serif 4 at 15.5px / 1.5.
- **Do** number a live figure with a cobalt Public Sans 700 numeral at `clamp(64px, 9vw, 132px)` overlapping the top-left corner of its plate, and repeat the number as a cobalt caption prefix.
- **Do** show state by colour and border: cobalt and solid while running, ink and dashed while paused, with the reading row's word and square agreeing.
- **Do** keep hover to a colour change (ink to cobalt) and focus to a 2px cobalt outline offset 2px; no transition, no movement.
- **Do** let the lead plate come before the essay under 1024px so the live lab stays in the first viewport on phones.
- **Do** render one still frame with a Play control under `prefers-reduced-motion: reduce`.
- **Do** keep the Go gopher, the VoidArchive handle, and the light theme on every surface, in this world or the legacy one.

### Don't:

- **Don't** use shadows, gradients, blur, translucency or a second surface colour; the page is one sheet of paper.
- **Don't** draw cards or boxed containers; separate content with rules and whitespace.
- **Don't** round a corner; every radius is 0.
- **Don't** add a kicker or eyebrow above a headline; the grotesk capitals belong to apparatus (section labels, dates, readings), not to headings.
- **Don't** introduce grey text for hierarchy; use italic, size or the serif/grotesk switch instead.
- **Don't** add a second accent, a tinted background behind text, or the legacy coral `#ff6b6b`, Fira Code, scanlines or terminal prompt motif on a surface built in this world.
- **Don't** animate anything but the simulations: no entrance animations, no hover lifts, no transitions on links.
- **Don't** set Public Sans as running text or Source Serif 4 as a label.
