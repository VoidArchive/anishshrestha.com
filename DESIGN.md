---
name: anishshrestha.com
description: A magazine front page where the claim, the shipped product and the live labs share one sheet of paper.
colors:
  paper: '#ffffff'
  ink: '#141414'
  ink-muted: '#555555'
  cobalt-spot: '#2242c8'
  cobalt-deep: '#1a35a3'
  cobalt-tint: '#dfe6fb'
typography:
  display:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: 'clamp(38px, 5.4vw, 80px)'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '-0.02em'
  page-title:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: 'clamp(32px, 4vw, 48px)'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.015em'
  section-heading:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: 'clamp(24px, 2.4vw, 30px)'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1.2
  dek:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '19px'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.6
  body-post:
    fontFamily: 'Source Serif 4, Georgia, Times New Roman, serif'
    fontSize: '18px'
    fontWeight: 400
    lineHeight: 1.6
  numeral:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: 'clamp(56px, 9vw, 96px)'
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: '-0.04em'
  label-head:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.14em'
  label:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: '0.06em'
  caption:
    fontFamily: 'Public Sans, system-ui, sans-serif'
    fontSize: '13px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.02em'
  code:
    fontFamily: 'Fira Code, ui-monospace, monospace'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: '0px'
spacing:
  hairline-gap: '8px'
  caption-gap: '10px'
  row: '18px'
  section-head: '20px'
  column-gap: '28px'
  plate-gap: '32px'
  plate-row-gap: '40px'
  section: '64px'
  page-foot: '72px'
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
    padding: '10px 0'
  running-head-current:
    textColor: '{colors.cobalt-spot}'
  button:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '7px 12px'
  button-hover:
    textColor: '{colors.cobalt-spot}'
  button-active:
    backgroundColor: '{colors.cobalt-spot}'
    textColor: '{colors.paper}'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '7px 12px'
  reading-row:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.cobalt-spot}'
    typography: '{typography.label}'
    padding: '8px 0 0'
  reading-control:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    padding: '3px 0'
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
  codeblock:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.code}'
    rounded: '{rounded.none}'
    padding: '16px 18px'
  chain-node:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '12px 14px 14px'
  entry-numeral:
    textColor: '{colors.cobalt-spot}'
    typography: '{typography.numeral}'
  definition-label:
    textColor: '{colors.cobalt-spot}'
    typography: '{typography.label}'
---

# Design System: anishshrestha.com

## Overview

**Creative North Star: "The Mathematical Games Spread"**

The site is set like a mid-century popular-science magazine: white coated stock, near-black ink, and one cobalt spot ink that does every job colour has to do. The front page is no longer an essay. It opens with the role in one serif line, an italic dek and a single "work with me" line on the left, and the shipped product on the right as a bordered screenshot plate captioned Fig. 1. Under both, on a heavy rule, three proof columns divided by column rules. Below that come the numbered system design entries, each naming the project behind it, and then four lab plates that are not illustrations of the labs but the labs themselves, running in place, with their reading (generation, population, running) printed beneath on a hairline rule.

The world is dense and quiet. Rules do the structural work (running head, section openers, rows, caption rows, column rules), and the only things that move are the simulations. Hover changes colour, never position. There is no chrome: no shadows, no gradients, no rounded corners, no filled cards, no kickers above headings. The one box the world owns is the plate, a 1.5px ink frame on paper, used for a live figure, a screenshot, an architecture node, a lab control panel; code sits in its lighter 1px cousin. This world evolves the home spread committed under `seed:a9745f2fa560bd8e`; it refuses the essay-first magazine opening it replaces, the profile-card-plus-skill-grid portfolio, and the terminal costume that came before both.

**Scope.** This system ships on every route: the home page (`src/routes/+page.svelte`, `src/lib/components/spread/*`), the shared running head and footer (`src/lib/components/Header.svelte`, `Footer.svelte`), the reading routes (projects index and project pages, the system design hub, about, blog index and posts, error page), which share the `.page`, `.page-title`, `.dek`, `.meta`, `.ruled`, `.section`, `.prose-block` and `.codeblock` scaffolding in `src/app.css`, and the six lab pages, where the global `.section-card`, `.section-title`, `.btn` and `.caps` classes carry the world and each lab opens with a serif h1 and an italic dek. The legacy token names in `src/app.css` (`--color-bg-*`, `--color-text*`, `--color-primary*`, `--color-border`) are aliases of the two inks kept so Tailwind utilities keep working. Three brand commitments bind every surface: the Go gopher easter egg stays, VoidArchive is the handle, and the theme is light.

**Key Characteristics:**

- White paper, near-black ink, one cobalt spot ink and its tint; nothing else.
- Hairline (1px) and heavy (1.5px) ink rules carry all structure.
- Source Serif 4 for reading, Public Sans capitals for labels, readings and captions, Fira Code for code only.
- The claim and the shipped product share the first screen; proof sits directly under both.
- Cobalt grotesk numerals number the evidence: "Fig. n" caption prefixes on home, entry numbers on the system design hub.
- Live plates: spot colour and a solid border while running, ink and a dashed border when paused.
- Square corners, no shadows, no gradients, no filled cards, no kickers.

## Colors

A two-ink print palette: paper and ink with a single cobalt spot ink, its screen tint, and a deeper pull of the same ink for code.

### Primary

- **Cobalt Spot** (`{colors.cobalt-spot}`): the one spot ink. The masthead wordmark, the current nav tab and its bar, entry numerals, "Fig. n" caption prefixes, the `.meta` line under a row, definition-row labels and the "What it proves" prefix, list markers, the running state of every live plate, the reading row, link underlines, hover colour, the active state of a toggle button, the focus outline, and the text selection background.
- **Cobalt Deep** (`{colors.cobalt-deep}`): the same ink, pulled darker. Function, class and tag names inside highlighted code. Nothing outside a code block uses it.
- **Cobalt Tint** (`{colors.cobalt-tint}`): the spot ink screened back. Grid lines inside the Game of Life plate, the row rules inside a table body, and the fill behind inline code in a post. Inline code is the only place it sits behind text.

### Neutral

- **Paper** (`{colors.paper}`): page, plate, button and code block background. There is only one surface.
- **Ink** (`{colors.ink}`): all text, every rule and border, the paused state of every plate, chain nodes and their arrows, Bagchal board lines and points, and the resting colour of buttons and reading controls.
- **Ink Muted** (`{colors.ink-muted}`): three small jobs only: the label of a secondary button, comments in highlighted code, and a collapsed `details` summary. Prose never uses it; secondary voice is carried by italic and by size, not by grey.

### Named Rules

**The Two-Ink Rule.** Every surface is printed with ink and one spot colour on paper. No greys for hierarchy, no second accent, no tinted backgrounds behind prose. If something needs to stand out, it is cobalt; if not, it is ink. Syntax highlighting inside a code block is the one place a reader meets other hues, and it is recorded below as an exception, not as palette.

**The Running Ink Rule.** Spot colour on a plate means it is running. A paused or idle plate drops to ink and its border goes dashed. The reading row's state square inherits the same colour, so colour and the word (Running / Paused) always agree.

## Typography

**Display Font:** Source Serif 4 (with Georgia, Times New Roman, serif)
**Body Font:** Source Serif 4 (same family; optical size 8..60, weights 400, 600, italic 400)
**Label/Numeral Font:** Public Sans (with system-ui, sans-serif; weights 400, 700)
**Code Font:** Fira Code (with ui-monospace, monospace; weights 400, 600)

**Character:** A text serif doing the reading work and a plain grotesk doing the apparatus work (running head, entry numbers, readings, captions, dates, row labels). The two never mix inside a sentence; the grotesk is set in spaced capitals, as a tight numeral, or as a small caption. The mono is a third voice with one job: text a reader could paste into a terminal or an editor.

### Hierarchy

- **Display** (600, `clamp(38px, 5.4vw, 80px)`, 1, -0.02em, balanced wrap): the home h1, one line of role. Home only.
- **Page title** (600, `clamp(32px, 4vw, 48px)`, 1.05, -0.015em, balanced): the h1 of every reading route. Lab pages run their h1 a step smaller, `clamp(34px, 3vw, 40px)`. One h1 per page.
- **Section heading** (600, `clamp(24px, 2.4vw, 30px)`, 1.15, -0.01em): the h2 that follows a heavy section rule. The home proof columns set their project names at `clamp(24px, 2.4vw, 32px)` and the projects index at `clamp(28px, 3vw, 38px)`.
- **Headline** (600, 24px, 1.2, balanced): row titles in ruled lists (blog index). Entry titles are 22px on home and `clamp(22px, 2.4vw, 28px)` on the hub; lab cards 20px. Headline links have no underline at rest and underline on hover.
- **Dek** (400 italic, 19px, 1.5, max 60ch): the sentence under a page title. Italic is the secondary voice of this world: deks, ledes (18px), the hire line (18px), closing notes (17px).
- **Body** (400, 17px, 1.5 in rows and 1.6 in prose blocks, `text-wrap: pretty`, max 65 to 68ch): reading text on every reading route. Posts run at 18px / 1.6 and drop to 17px under 640px. Lab control panels run a denser 15.5px.
- **Numeral** (Public Sans 700, -0.04em, tabular, cobalt): entry numbers. Billboard size on the system design hub (`clamp(56px, 9vw, 96px)`, line-height 0.85, `aria-hidden`), 22px as "No. n" on home, and `clamp(96px, 16vw, 200px)` for the status code on the error page.
- **Label, running head** (Public Sans 400, 12px, 0.14em, uppercase): masthead (700, cobalt), nav, footer line.
- **Label** (Public Sans 700, 12px, 0.06em, uppercase, tabular numerals): `.caps` and `.meta`. Dates, kinds, readings, button text, table heads, definition-row labels, the "Fig. n" and "What it proves" prefixes. Lab panel titles use the same face at 0.14em in cobalt.
- **Caption** (Public Sans 400, 13px, 0.02em, sentence case): figure captions and the detail line inside a chain node. The only grotesk text set in sentence case.
- **Code** (Fira Code 400, 14px, 1.6, tab size 4; 13px under 640px): code blocks. Inline code in a post is 0.85em.

### Named Rules

**The Capitals Rule.** Public Sans appears as spaced uppercase (0.06em to 0.14em) at 12px, as a tight-tracked cobalt numeral, or as a 13px caption. It is never running text, and it is never smaller than 12px.

**The Base-16 Rule.** The root is 16px / 1.5; text sizes are fixed pixel values against it (12, 13, 17, 18, 19, 22, 24), and only headings and numerals are fluid.

**The Code-Only Rule.** Fira Code sets code and nothing else: install lines, examples, inline identifiers. It is never a label, a heading or a mood.

## Layout

Every page sits in a centred container up to 1440px wide with fluid side margins (`clamp(16px, 5vw, 72px)`). The running head's 1.5px rule and the footer's 1.5px rule are drawn on the container's content box, so both line up exactly with the page margin. Reading routes narrow the column inside that container: 760px by default, 1040px on the wide routes (projects, project pages, system design), with 44px above the title and 72px below the page.

Sections stack vertically and each opens on a rule: 64px of space, a 1.5px ink rule, 20px of padding, then a serif h2. Rows inside a section open on 1px rules; a ruled list opens with a 1.5px rule and gives each row 18px of padding. These rules are the entire structure.

The home opening is a two-column grid, `minmax(0, 1fr)` for the claim and `minmax(0, 0.82fr)` for the screenshot plate, `clamp(32px, 5vw, 72px)` apart. The proof strip spans both columns: three equal columns on a 1.5px top rule, divided by 1px ink column rules with 28px of padding either side. System design entries are a two-column row (a 96px numeral column on home, `clamp(64px, 12vw, 140px)` on the hub). The lab plates are a four-up grid with a 32px column gap and 40px row gap. Definition rows put a cobalt label in a fixed column (160px on about, 180px for hosting) and the value beside it. The projects index pairs a 300px name column with the description.

Breakpoints, observed: at 1100px the plates drop to two-up, and to one column at 640px. At 860px the home opening becomes one column and reorders so the proof strip follows the claim directly and the screenshot follows the proofs; the proofs become stacked rows on 1px rules, closed by a 1.5px rule. At 820px the "How it runs" chain turns from left-to-right to top-to-bottom and hosting rows stack. At 640px the running head tightens (tracking 0.08em, nav gap 16px, 12px above), entry rows stack their numeral above the title, and code drops to 13px. At 520px definition rows stack. Lab pages put the board beside a 350px control column from 1025px up and stack below it.

Spacing is a small fixed set: 8px (hairline rule to reading), 10px (caption gap, running head link padding), 18px (ruled row padding), 20px (section opener padding), 28px (column padding, nav gap), 32px and 40px (plate grid gaps), 64px (between sections), 72px (page foot, above the footer rule).

## Elevation & Depth

No shadows, no tonal layering, no translucent surfaces, no blur. The world is a single sheet of paper and everything sits on it at the same depth. Nothing overlaps anything else. Links, buttons and plates do not lift, scale or glow on hover; state is shown by colour (ink to cobalt), by fill (a selected toggle goes solid cobalt with paper text), and by the border style of a plate (solid to dashed). Focus is a 2px cobalt outline offset 2px, pulled inside the frame on a scrollable code block.

### Named Rules

**The One-Sheet Rule.** There is one surface and one depth. If something needs to be separated, draw a rule; if it needs to be framed, draw a plate; if it needs to be noticed, print it in cobalt. Never a shadow, a blur, a gradient or a raised surface.

## Shapes

Square. Every box, plate, button, input and outline has a 0px radius; the shape vocabulary has a single step, `none`. Borders are ink in two weights: 1.5px for plates (live figures, screenshots, chain nodes, lab control panels), primary buttons, the running head and footer rules, section openers and the top and bottom of a table; 1px for rows, column rules, caption rules, code blocks, secondary buttons, inputs and post images. A paused plate keeps its 1.5px weight and switches to `dashed`. The current nav tab carries a 3px cobalt bar on its bottom edge, sitting on the running head rule; it is the heaviest rule in the world and the only cobalt one. Chain nodes are joined by a 1.5px ink rule ending in a solid triangular arrowhead (8px long, 10px tall). The reading row's state marker is an 8px square of currentColor, not a dot. Links underline with a 1px spot-colour line offset 3px; the home proof names thicken it to 2px at 5px offset. The scrollbar thumb is a square ink bar on paper.

## Components

### Links

- **Inline:** inherit ink colour, 1px underline in cobalt, offset 3px, no transition. Hover turns the text cobalt and keeps the underline.
- **Headline links** (ruled lists, entries, lab cards): no underline at rest; underline on hover.
- **Meta links** (inside a `.meta` line): ink among cobalt capitals; no underline in ruled lists, underlined where the line is a list of actions.
- **Focus:** 2px solid cobalt outline, 2px offset, on links, buttons and scrollable code alike.

### Running Head and Footer (navigation)

- **Running head:** a baseline-aligned flex row on a 1.5px ink rule, Public Sans 12px uppercase 0.14em, 28px above the row. Left: the domain as masthead, cobalt bold. Right: Projects, System Design, Blog, About, 28px apart, ink, no underline, cobalt on hover. The current section is cobalt with a 3px cobalt bar on the rule; lab pages light Projects, because the labs live under it. The row wraps rather than collapsing into a menu; under 640px tracking drops to 0.08em and the gap to 16px.
- **Footer:** 72px above a 1.5px rule on the content box, then one line of the same capitals: the copyright on the left, "VoidArchive on GitHub" on the right. GitHub lives here, not in the nav. The gopher lives here too: on the home route, hovering the handle brings it out.

### Buttons

- **Shape:** square, paper fill, Public Sans 700 12px uppercase 0.06em, padding 7px 12px.
- **Primary:** 1.5px ink border, ink text. Used for the one action a block offers ("Open the lab", "All posts", "Front page") and for lab controls.
- **Secondary:** 1px ink border, muted text.
- **Hover:** text and border turn cobalt, eased over 120ms. Colour only; nothing moves.
- **Active (toggles):** solid cobalt fill, cobalt border, paper text. The selected option in a lab's mode switch.
- **Disabled:** 40% opacity, not-allowed cursor.

### Plates (live figures and screenshots)

- **Shape:** 1.5px solid ink border on paper, square corners, width 100%, height from aspect ratio.
- **Running:** the simulation draws in cobalt (cells, boids, bars); grid lines inside the Life plate are cobalt tint; border solid.
- **Paused:** the simulation draws in ink and the border goes dashed.
- **Screenshot plate:** the same frame around an image, linked to its project page. Project pages crop a tall screenshot to 4:3 from the top.
- **Interaction:** the Life canvas uses a crosshair cursor and toggles a cell on click or tap; the others are pokeable through their controls. Under `prefers-reduced-motion: reduce` a plate renders one still frame, paused, with its Play control available.

### Reading Row and Controls

- Sits directly under a live plate on a 1px ink top rule, 8px padding and margin. Public Sans 700, 12px, uppercase, 0.06em, tabular numerals, cobalt. Items wrap with a 4px by 16px gap. The first item is the state word preceded by an 8px square in currentColor. Controls are pushed right, 12px apart.
- **Reading controls** are text buttons with no background and no border: ink, with a cobalt 1px underline offset 3px, cobalt on hover, 3px of vertical padding (cancelled by a negative margin) for a 24px target. Labels are verbs (Pause, Play, Reseed, Shuffle).

### Figure Captions

- Under the plate or reading row with a 10px gap: Public Sans 13px, 0.02em, sentence case, ink. On home each opens with the cobalt "Fig. n" prefix (12px uppercase bold, 6px right margin), then one sentence of fact, then an inline link. The number lives in the caption only; there is no numeral above or over the plate.

### Proof Columns

- Three columns on a 1.5px rule, 1px column rules between, 18px above and 28px either side. Each: the project name as a linked serif heading with a 2px cobalt underline, one 17px sentence of what it proves, and a cobalt `.meta` line naming its kind. Under 860px they become stacked rows.

### Numbered Entries

- A row on a 1px rule: a cobalt Public Sans 700 numeral in a fixed left column, then a serif title, a 17px description, and a `.meta` line with the date and "Backed by" the project. On home the numeral reads "No. n" at 22px; on the system design hub it is the bare number at billboard size. The list closes on a 1px rule with a link in grotesk capitals (12px, 0.1em).

### Definition Rows

- A `dl` of rows on 1px rules: a cobalt `.caps` label in a fixed column, the value in 17px serif beside it. Used for hosting, skills, contact and the rules of a game. "What it proves" is the inline form: a cobalt `.caps` prefix, 6px right margin, then the sentence, on a 1px rule.

### Code Blocks

- 1px ink border on paper, padding 16px 18px, Fira Code 14px / 1.6, horizontal scroll, keyboard-focusable when it scrolls. A one-line command wraps instead of scrolling. In posts the same frame carries syntax highlighting and a 32px square copy button at the top right (1px ink border, cobalt on hover and when copied). Inline code is 0.85em on cobalt tint.

### How It Runs (chain figure)

- A `figure` with a cobalt `.caps` caption naming the flow, then an ordered row of equal-width nodes 30px apart. Each node is a plate (1.5px ink border, padding 12px 14px 14px) holding an 18px serif bold name and a 13px grotesk detail. Each node after the first is joined to the previous by a 1.5px ink rule across the gap ending in an arrowhead. Under 820px the row turns vertical with 22px gaps, and the rule and arrowhead turn to point down from 24px in.

### Tables

- 1.5px ink rules top and bottom, no vertical rules; head cells in `.caps` on a 1px ink rule, body rows on cobalt-tint rules, tabular numerals, cells top-aligned.

### Callouts

- A lab's link to its write-up and a post's link to its lab are rule-bound blocks, not boxes: a 1px (or 1.5px opening) rule above, a 1px rule below, a `.meta` line, a sentence and one button or link.

### Lab Control Panels

- A plate holding controls: 1.5px ink border, 16px padding, opened by a cobalt capitals title (12px, 700, 0.14em) on a 1px ink rule. Inputs are square, 1px ink border, grotesk, with cobalt as the accent colour.

## Do's and Don'ts

### Do:

- **Do** print with two inks: ink and cobalt on white, with the tint reserved for grid lines inside a plate, table row rules and inline code.
- **Do** structure with rules: 1.5px ink to open a section or frame a plate, 1px for rows, column rules and caption rows.
- **Do** put the claim and the shipped product on the same first screen, with the proof directly under both.
- **Do** set apparatus (readings, dates, nav, row labels, button text) in Public Sans capitals at 12px with 0.06em to 0.14em tracking; set reading text in Source Serif 4 at 17px, 18px in posts.
- **Do** number evidence with cobalt Public Sans 700: "Fig. n" as a caption prefix, "No. n" beside an entry, a billboard numeral on the hub.
- **Do** show state by colour and border: cobalt and solid while running, ink and dashed while paused, with the reading row's word and square agreeing.
- **Do** keep hover to a colour change (ink to cobalt) and focus to a 2px cobalt outline offset 2px; nothing changes position.
- **Do** draw architecture as plates joined by an ink rule and arrowhead, and turn the chain vertical under 820px.
- **Do** put the proof before the picture on narrow screens: under 860px the proof rows follow the claim and the screenshot follows them.
- **Do** render one still frame with a Play control under `prefers-reduced-motion: reduce`.
- **Do** keep the Go gopher, the VoidArchive handle, and the light theme on every surface.

### Don't:

- **Don't** use shadows, gradients, blur, translucency or a second surface colour; the page is one sheet of paper.
- **Don't** draw filled, shadowed or rounded cards; the only box is a plate, an ink frame on paper, and everything else is separated by rules and whitespace.
- **Don't** round a corner; every radius is 0.
- **Don't** add a kicker or eyebrow above a headline; the grotesk capitals belong to apparatus (dates, readings, row labels), not to headings.
- **Don't** set a billboard "Fig. n" above or over a plate, a masthead issue number, a drop cap or a multi-column essay; that front page was replaced.
- **Don't** introduce grey text for hierarchy; use italic, size or the serif/grotesk switch instead.
- **Don't** add a second accent, a tinted background behind prose, or the legacy coral `#ff6b6b`, scanlines or terminal prompt motif.
- **Don't** set anything but code in Fira Code, and don't set code in anything else.
- **Don't** animate anything but the simulations: no entrance animations, no hover lifts, no movement on links or buttons.
- **Don't** set Public Sans as running text or below 12px, or Source Serif 4 as a label.
