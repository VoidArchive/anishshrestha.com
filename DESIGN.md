---
name: anishshrestha.com
description: A magazine front page where the claim, the shipped product and the live labs share one sheet of paper, printed in ink and arcade orange, with a night edition.
colors:
  paper: '#ffffff'
  ink: '#141414'
  ink-muted: '#555555'
  arcade-orange: '#ff6a13'
  orange-text: '#c2410c'
  orange-deep: '#a8380a'
  orange-tint: '#ffe3d1'
  code-teal: '#0b6b5f'
  code-oxblood: '#8a1c1c'
  night-paper: '#0e1014'
  night-ink: '#e9e9e6'
  night-ink-muted: '#a4a6ad'
  night-orange-deep: '#ff8a45'
  night-orange-tint: '#3d2212'
  night-code-teal: '#6fd3c3'
  night-code-rose: '#f2a8a8'
typography:
  display:
    fontFamily: 'Besley, Georgia, serif'
    fontSize: 'clamp(38px, 5.4vw, 80px)'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '-0.02em'
  page-title:
    fontFamily: 'Besley, Georgia, serif'
    fontSize: 'clamp(32px, 4vw, 48px)'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.015em'
  section-heading:
    fontFamily: 'Besley, Georgia, serif'
    fontSize: 'clamp(24px, 2.4vw, 30px)'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Besley, Georgia, serif'
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1.2
  dek:
    fontFamily: 'Literata, Georgia, Times New Roman, serif'
    fontSize: '19px'
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: 'Literata, Georgia, Times New Roman, serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.6
  body-post:
    fontFamily: 'Literata, Georgia, Times New Roman, serif'
    fontSize: '18px'
    fontWeight: 400
    lineHeight: 1.6
  numeral:
    fontFamily: 'Libre Franklin, system-ui, sans-serif'
    fontSize: 'clamp(56px, 9vw, 96px)'
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: '-0.04em'
  label-head:
    fontFamily: 'Libre Franklin, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.14em'
  label:
    fontFamily: 'Libre Franklin, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: '0.06em'
  caption:
    fontFamily: 'Libre Franklin, system-ui, sans-serif'
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
    textColor: '{colors.orange-text}'
  running-head:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label-head}'
    padding: '10px 0'
  running-head-current:
    textColor: '{colors.orange-text}'
  masthead-bird:
    backgroundColor: '{colors.orange-text}'
    width: '14px'
    height: '26px'
  theme-toggle:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label-head}'
    rounded: '{rounded.none}'
    padding: '4px 0'
  theme-toggle-hover:
    textColor: '{colors.orange-text}'
  button:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '7px 12px'
  button-hover:
    textColor: '{colors.orange-text}'
  button-active:
    backgroundColor: '{colors.arcade-orange}'
    textColor: '{colors.ink}'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.none}'
    padding: '7px 12px'
  reading-row:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.orange-text}'
    typography: '{typography.label}'
    padding: '8px 0 0'
  reading-control:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    padding: '3px 0'
    rounded: '{rounded.none}'
  reading-control-hover:
    textColor: '{colors.orange-text}'
  plate-running:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.arcade-orange}'
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
    textColor: '{colors.orange-text}'
    typography: '{typography.numeral}'
  definition-label:
    textColor: '{colors.orange-text}'
    typography: '{typography.label}'
---

# Design System: anishshrestha.com

## Overview

**Creative North Star: "The Mathematical Games Spread"**

The site is set like a mid-century popular-science magazine: white coated stock, near-black ink, and one arcade-orange spot ink that does every job colour has to do. A night edition prints the same sheet reversed: near-black paper, off-white ink, the same orange. The front page is no longer an essay. It opens with the role in one serif line, an italic dek and a single "work with me" line on the left, and the shipped product on the right as a bordered screenshot plate captioned Fig. 1. Under both, on a heavy rule, three proof columns divided by column rules. Below that come the numbered system design entries, each naming the project behind it, and then four lab plates that are not illustrations of the labs but the labs themselves, running in place (a Bagchal board playing itself, a flock, a quick sort, a life in weeks), with their reading (state, counts) printed beneath on a hairline rule.

The world is dense and quiet. Rules do the structural work (running head, section openers, rows, caption rows, column rules), and the only things that move are the simulations. Hover changes colour, never position. There is no chrome: no shadows, no gradients, no rounded corners, no filled cards, no kickers above headings. The one box the world owns is the plate, a 1.5px ink frame on paper, used for a live figure, a screenshot, an architecture node, a lab control panel; code sits in its lighter 1px cousin. This world evolves the home spread committed under `seed:a9745f2fa560bd8e`; it refuses the essay-first magazine opening it replaces, the profile-card-plus-skill-grid portfolio, and the terminal costume that came before both.

**Scope.** This system ships on every route: the home page (`src/routes/+page.svelte`, `src/lib/components/spread/*`), the shared running head and footer (`src/lib/components/Header.svelte`, `Footer.svelte`), the reading routes (projects index and project pages, the system design hub, about, blog index and posts, error page), which share the `.page`, `.page-title`, `.dek`, `.meta`, `.ruled`, `.section`, `.prose-block` and `.codeblock` scaffolding in `src/app.css`, and the six lab pages, where the global `.section-card`, `.section-title`, `.btn` and `.caps` classes carry the world and each lab opens with a serif h1 and an italic dek. Tokens live in the `@theme` block of `src/app.css` and are overridden for the night edition in `:root[data-theme='dark']`; `src/app.html` sets `data-theme` before first paint from the saved choice or, failing that, the system preference, and the footer toggle changes and saves it. The legacy token names (`--color-bg-*`, `--color-text*`, `--color-primary*`, `--color-border`) are aliases of the same inks, kept so Tailwind utilities keep working. Three commitments bind every surface: VoidArchive is the handle, the bird is the mark (masthead and favicon), and every surface is built from tokens so it prints in both editions.

**Key Characteristics:**

- Paper, ink, one arcade-orange spot ink and its tint; nothing else, in a day and a night edition.
- Hairline (1px) and heavy (1.5px) ink rules carry all structure.
- Besley for headings, Literata for reading and italics, Libre Franklin capitals for labels, nav, readings and captions, Fira Code for code only.
- The claim and the shipped product share the first screen; proof sits directly under both.
- Orange grotesk numerals number the evidence: "Fig. n" caption prefixes on home, entry numbers on the system design hub.
- Live plates: spot colour and a solid border while running, ink and a dashed border when paused.
- Square corners, no shadows, no gradients, no filled cards, no kickers.

## Colors

A two-ink print palette in two editions: paper and ink with a single arcade-orange spot ink, a darker pull of it for text, its screen tint, and a deeper pull for code. The night edition reverses paper and ink and keeps the orange.

### Primary

- **Arcade Orange** (`{colors.arcade-orange}`, `--color-spot`, the same value in both editions): the one spot ink, used wherever it is a fill, a rule or a line. The running state of every live plate (cells, boids, bars), link underlines, the 3px bar under the current nav tab, the solid fill of an active toggle, hover borders, the focus outline, the input accent colour, and the text selection background.
- **Orange Text** (`{colors.orange-text}` by day; Arcade Orange itself at night; `--color-spot-text`): every piece of orange text. Arcade Orange is only 2.9:1 on white, so text takes this darker pull: the masthead and its bird, the current nav tab, entry numerals, "Fig. n" caption prefixes, the `.meta` line, definition-row labels, list markers, the reading row, lab panel titles, and the hover colour of links and buttons.
- **On-Orange** (Ink by day, Night Paper at night; `--color-on-spot`): the label on an orange fill, meaning an active toggle and selected text. It is the dark ink in both editions; white never sits on orange.
- **Orange Deep** (`{colors.orange-deep}` by day, `{colors.night-orange-deep}` at night; `--color-spot-dim`): function, class and tag names inside highlighted code. Not a surface or a text colour outside a code block.
- **Orange Tint** (`{colors.orange-tint}` by day, `{colors.night-orange-tint}` at night; `--color-tint`): the spot ink screened back. Grid lines inside the life-calendar and Game of Life plates, the row rules inside a table body, and the fill behind inline code in a post. Inline code is the only place it sits behind text.

### Neutral

- **Paper** (`{colors.paper}` by day, `{colors.night-paper}` at night): page, plate, button and code block background. There is only one surface.
- **Ink** (`{colors.ink}` by day, `{colors.night-ink}` at night): all text, every rule and border, the paused state of every plate, chain nodes and their arrows, board lines, and the resting colour of buttons and reading controls.
- **Ink Muted** (`{colors.ink-muted}` by day, `{colors.night-ink-muted}` at night): three small jobs only: the label of a secondary button, comments in highlighted code, and a collapsed `details` summary. Prose never uses it; secondary voice is carried by italic and by size, not by grey.

### Code tokens

- **Code Teal** (`{colors.code-teal}` by day, `{colors.night-code-teal}` at night; `--color-code-number`): numbers, booleans and constants in highlighted code.
- **Code Oxblood** (`{colors.code-oxblood}` by day, `{colors.night-code-rose}` at night; `--color-code-string`): strings and attribute values. Keywords, operators and punctuation stay ink. These two hues exist only inside a code block.

### Named Rules

**The Two-Ink Rule.** Every surface is printed with ink and one spot colour on paper. No greys for hierarchy, no second accent, no tinted backgrounds behind prose. If something needs to stand out, it is orange; if not, it is ink. Two exceptions are accepted and neither is palette: syntax highlighting inside a code block, and the tiger and goat pieces on a Bagchal board (home Fig. 2 and the Bagchal lab), which are full-colour illustrated icons the owner chose on purpose. The board under them stays ink lines on paper. Do not extend either exception to other surfaces.

**The Orange Text Rule.** Orange as a fill, rule, underline or outline is Arcade Orange. Orange as text is the Orange Text token. A label on an orange fill is On-Orange. Never set text in raw Arcade Orange on the day edition, and never set paper-coloured text on orange.

**The Running Ink Rule.** Spot colour on a plate means it is running. A paused plate draws in ink and its border goes dashed; the reading row beneath stays in orange text and its first word says which state it is (Running / Paused).

**The Night Edition Rule.** Dark is the same sheet reversed, not a second design. Every colour in a component comes from a token, so a surface that works by day works at night with no extra rules; the only per-theme values are the token overrides.

## Typography

**Display Font:** Besley (with Georgia, serif; variable 400 to 700, used at 600)
**Body Font:** Literata (with Georgia, Times New Roman, serif; optical size 7..72, weights 400, 600, italic 400)
**Label/Numeral Font:** Libre Franklin (with system-ui, sans-serif; weights 400, 700)
**Code Font:** Fira Code (with ui-monospace, monospace; weights 400, 600)

**Character:** A Clarendon for headings, an old-style text serif doing the reading work and every italic, and a plain grotesk doing the apparatus work (running head, entry numbers, readings, captions, dates, row labels). Every h1, h2 and h3 is Besley; everything else that reads as a sentence is Literata. Serif and grotesk never mix inside a sentence; the grotesk is set in spaced capitals, as a tight numeral, or as a small caption. The mono is a third voice with one job: text a reader could paste into a terminal or an editor.

### Hierarchy

- **Display** (600, `clamp(38px, 5.4vw, 80px)`, 1, -0.02em, balanced wrap): the home h1, one line of role. Home only.
- **Page title** (600, `clamp(32px, 4vw, 48px)`, 1.05, -0.015em, balanced): the h1 of every reading route. Lab pages run their h1 a step smaller, `clamp(34px, 3vw, 40px)`. One h1 per page.
- **Section heading** (600, `clamp(24px, 2.4vw, 30px)`, 1.15, -0.01em): the h2 that follows a heavy section rule. The home proof columns set their project names at `clamp(24px, 2.4vw, 32px)` and the projects index at `clamp(28px, 3vw, 38px)`.
- **Headline** (600, 24px, 1.2, balanced): row titles in ruled lists (blog index). Entry titles are 22px on home and `clamp(22px, 2.4vw, 28px)` on the hub; lab cards 20px. Headline links have no underline at rest and underline on hover.
- **Dek** (Literata 400 italic, 19px, 1.5, max 60ch): the sentence under a page title; `clamp(18px, 1.5vw, 21px)` at 46ch on home. Italic is the secondary voice of this world: deks, ledes (18px), the hire line (18px), closing notes (17px).
- **Body** (Literata 400, 17px, 1.5 in rows and 1.6 in prose blocks, `text-wrap: pretty`, max 65 to 68ch): reading text on every reading route, including the sentence under a project's dek that says what the project proves. Posts run at 18px / 1.6 and drop to 17px under 640px. Lab control panels run a denser 15.5px. Bold is 600.
- **Numeral** (Libre Franklin 700, -0.04em, tabular, orange text): entry numbers. Billboard size on the system design hub (`clamp(56px, 9vw, 96px)`, line-height 0.85, `aria-hidden`), 22px as "No. n" on home, and `clamp(96px, 16vw, 200px)` for the status code on the error page.
- **Label, running head** (Libre Franklin 400, 12px, 0.14em, uppercase): masthead (700, orange text), nav, footer line including the theme toggle.
- **Label** (Libre Franklin 700, 12px, 0.06em, uppercase, tabular numerals): `.caps` and `.meta`. Dates, kinds, readings, button text, table heads, definition-row labels, the "Fig. n" prefix. Lab panel titles use the same face at 0.14em in orange text.
- **Caption** (Libre Franklin 400, 13px, 0.02em, sentence case): figure captions and the detail line inside a chain node. The only grotesk text set in sentence case.
- **Code** (Fira Code 400, 14px, 1.6, tab size 4; 13px under 640px): code blocks. Inline code in a post is 0.85em.

### Named Rules

**The Capitals Rule.** Libre Franklin appears as spaced uppercase (0.06em to 0.14em) at 12px, as a tight-tracked orange numeral, or as a 13px caption. It is never running text, and it is never smaller than 12px.

**The Base-16 Rule.** The root is 16px / 1.5; text sizes are fixed pixel values against it (12, 13, 17, 18, 19, 22, 24), and only headings and numerals are fluid.

**The Code-Only Rule.** Fira Code sets code and nothing else: install lines, examples, inline identifiers. It is never a label, a heading or a mood.

## Layout

Every page sits in a centred container up to 1440px wide with fluid side margins (`clamp(16px, 5vw, 72px)`). The running head's 1.5px rule and the footer's 1.5px rule are drawn on the container's content box, so both line up exactly with the page margin. Reading routes narrow the column inside that container: 760px by default, 1040px on the wide routes (projects, project pages, system design), with 44px above the title and 72px below the page.

Sections stack vertically and each opens on a rule: 64px of space, a 1.5px ink rule, 20px of padding, then a serif h2. Rows inside a section open on 1px rules; a ruled list opens with a 1.5px rule and gives each row 18px of padding. These rules are the entire structure.

The home opening is a two-column grid, `minmax(0, 1fr)` for the claim and `minmax(0, 0.82fr)` for the screenshot plate, `clamp(32px, 5vw, 72px)` apart. The proof strip spans both columns: three equal columns on a 1.5px top rule, divided by 1px ink column rules with 28px of padding either side. System design entries are a two-column row (a 96px numeral column on home, `clamp(64px, 12vw, 140px)` on the hub). The lab plates are a four-up grid with a 32px column gap and 40px row gap. Definition rows put an orange label in a fixed column (160px on about, 180px for hosting, 88px for the rules of a game) and the value beside it. The projects index pairs a 300px name column with the description, and lists the six labs three-up beneath on 1px rules.

Breakpoints, observed: at 1100px the plates drop to two-up, and to one column at 640px. At 860px the home opening becomes one column and reorders so the proof strip follows the claim directly and the screenshot follows the proofs; the proofs become stacked rows on 1px rules, closed by a 1.5px rule. At 820px the "How it runs" chain turns from left-to-right to top-to-bottom, hosting rows and the projects index stack, and the lab list goes two-up (one column at 520px). At 640px the running head tightens (tracking 0.08em, nav gap 16px, 12px above), entry rows stack their numeral above the title, and code drops to 13px. At 520px definition rows stack. Lab pages put the board beside a 350px control column from 1025px up and stack below it.

Spacing is a small fixed set: 8px (hairline rule to reading), 10px (caption gap, running head link padding), 18px (ruled row padding), 20px (section opener padding), 28px (column padding, nav gap), 32px and 40px (plate grid gaps), 64px (between sections), 72px (page foot, above the footer rule).

## Elevation & Depth

No shadows, no tonal layering, no translucent surfaces, no blur. The world is a single sheet of paper and everything sits on it at the same depth. Nothing overlaps anything else. Links, buttons and plates do not lift, scale or glow on hover; state is shown by colour (ink to orange text), by fill (a selected toggle goes solid orange with ink text), and by the border style of a plate (solid to dashed). Focus is a 2px orange outline offset 2px, pulled inside the frame on a scrollable code block. The night edition is the same flat sheet; it adds no glow and no raised surface.

### Named Rules

**The One-Sheet Rule.** There is one surface and one depth. If something needs to be separated, draw a rule; if it needs to be framed, draw a plate; if it needs to be noticed, print it in orange. Never a shadow, a blur, a gradient or a raised surface.

## Shapes

Square. Every box, plate, button, input and outline has a 0px radius; the shape vocabulary has a single step, `none`. Borders are ink in two weights: 1.5px for plates (live figures, screenshots, chain nodes, lab control panels), primary buttons, the running head and footer rules, section openers and the top and bottom of a table; 1px for rows, column rules, caption rules, code blocks, secondary buttons, inputs and post images. A paused plate keeps its 1.5px weight and switches to `dashed`. The current nav tab carries a 3px orange bar on its bottom edge, sitting on the running head rule; it is the heaviest rule in the world and the only orange one. Chain nodes are joined by a 1.5px ink rule ending in a solid triangular arrowhead (8px long, 10px tall). The reading row's state marker is an 8px square of currentColor, not a dot; the theme toggle uses the same square as a checkbox, outlined (1.5px) when off and filled when on. The one drawn shape that is not a rectangle is the bird: a tall single-colour silhouette (14px by 26px in the masthead) applied as a CSS mask so it takes the masthead's ink, and the same bird in Arcade Orange as the favicon. Links underline with a 1px Arcade Orange line offset 3px; the home proof names thicken it to 2px at 5px offset. The scrollbar thumb is a square ink bar on paper.

## Components

### Links

- **Inline:** inherit ink colour, 1px underline in Arcade Orange, offset 3px, no transition. Hover turns the text to the Orange Text token and keeps the underline.
- **Headline links** (ruled lists, entries, lab cards): no underline at rest; underline on hover.
- **Meta links** (inside a `.meta` line): ink among orange capitals; no underline in ruled lists, underlined where the line is a list of actions.
- **Focus:** 2px solid Arcade Orange outline, 2px offset, on links, buttons and scrollable code alike.

### Running Head and Footer (navigation)

- **Running head:** a baseline-aligned flex row on a 1.5px ink rule, Libre Franklin 12px uppercase 0.14em, 28px above the row. Left: the bird mark, then the domain as masthead, both in orange text, bold. Right: Projects, System Design, Blog, About, 28px apart, ink, no underline. The current section is orange text with a 3px Arcade Orange bar on the rule; lab pages light Projects, because the labs live under it. The row wraps rather than collapsing into a menu; under 640px tracking drops to 0.08em and the gap to 16px.
- **Bird mark:** `static/bird-logo.svg` used as a mask on a 14px by 26px span filled with currentColor, 8px left of the site name, `aria-hidden`. Because it is a mask it follows the masthead colour in both editions. Never place it as an image with its own fill inside the page.
- **Footer:** 72px above a 1.5px rule on the content box, then one line of the same capitals, spread across the measure: the copyright, the theme toggle, and "VoidArchive on GitHub". GitHub lives here, not in the nav. Nothing in the footer moves.
- **Theme toggle:** a text button in the footer line labelled "Dark mode", no border and no background, preceded by an 8px square that is outlined when off and filled when on, with `aria-pressed` carrying the state. Hover turns it to orange text. It sets `data-theme` on the root and saves the choice; with no saved choice the system preference decides.

### Buttons

- **Shape:** square, paper fill, Libre Franklin 700 12px uppercase 0.06em, padding 7px 12px.
- **Primary:** 1.5px ink border, ink text. Used for the one action a block offers ("Open the lab", "All posts", "Front page") and for lab controls.
- **Secondary:** 1px ink border, muted text.
- **Hover:** text turns to orange text and the border to Arcade Orange, eased over 120ms. Colour only; nothing moves.
- **Active (toggles):** solid Arcade Orange fill and border, On-Orange (dark ink) text. The selected option in a lab's mode switch.
- **Disabled:** 40% opacity, not-allowed cursor.

### Plates (live figures and screenshots)

- **Shape:** 1.5px solid ink border on paper, square corners, width 100%, height from aspect ratio.
- **Running:** the simulation draws in Arcade Orange (lived weeks, boids, bars); grid lines inside the life-calendar plate are the tint; border solid.
- **Paused:** the simulation draws in ink and the border goes dashed.
- **Bagchal plate:** an SVG board, 1.5px ink lines on paper, that plays itself one move every 650ms. Its pieces are the full-colour tiger and goat icons from `static/icons/` (the accepted exception to the Two-Ink Rule), so running and paused differ by border and reading only.
- **Life-calendar plate:** replays the lived weeks once, then blinks the current week; it has no pause, and its reading opens with "Replaying" and then the percentage lived.
- **Screenshot plate:** the same frame around an image, linked to its project page. Project pages show the screenshot at its natural ratio with a plain 13px grotesk caption.
- **Interaction:** plates are poked through the controls in their reading row. Under `prefers-reduced-motion: reduce` a plate renders one still frame, paused, with its Play control available.

### Reading Row and Controls

- Sits directly under a live plate on a 1px ink top rule, 8px padding and margin. Libre Franklin 700, 12px, uppercase, 0.06em, tabular numerals, orange text. Items wrap with a 4px by 16px gap. The first item is the state word preceded by an 8px square in currentColor. Controls are pushed right, 12px apart.
- **Reading controls** are text buttons with no background and no border: ink, with an Arcade Orange 1px underline offset 3px, orange text on hover, 3px of vertical padding (cancelled by a negative margin) for a 24px target. Labels are verbs (Pause, Play, Restart, Shuffle).

### Figure Captions

- Under the plate or reading row with a 10px gap: Libre Franklin 13px, 0.02em, sentence case, ink. On home each opens with the orange "Fig. n" prefix (12px uppercase bold, 6px right margin), then one sentence of fact, then an inline link. The number lives in the caption only; there is no numeral above or over the plate.

### Proof Columns

- Three columns on a 1.5px rule, 1px column rules between, 18px above and 28px either side. Each: the project name as a linked Besley heading with a 2px Arcade Orange underline, one 17px sentence of what it proves, and an orange `.meta` line naming its kind. Under 860px they become stacked rows.

### Numbered Entries

- A row on a 1px rule: an orange Libre Franklin 700 numeral in a fixed left column, then a Besley title, a 17px description, and a `.meta` line with the date and "Backed by" the project. On home the numeral reads "No. n" at 22px; on the system design hub it is the bare number at billboard size. The list closes on a 1px rule with a link in grotesk capitals (12px, 0.1em).

### Definition Rows

- A `dl` of rows on 1px rules: an orange `.caps` label in a fixed column, the value in 17px Literata beside it. Used for hosting, skills, contact and the rules of a game. What a project proves is not a definition row: it is a plain 17px paragraph with no label, under the dek on a project page and under the summary on the projects index.

### Code Blocks

- 1px ink border on paper, padding 16px 18px, Fira Code 14px / 1.6, horizontal scroll, keyboard-focusable when it scrolls. A one-line command wraps instead of scrolling. In posts the same frame carries syntax highlighting and a 32px square copy button at the top right (1px ink border, orange on hover and when copied). Highlighting uses tokens only: ink for keywords and punctuation, Ink Muted for comments, Orange Deep for names, Code Teal for numbers, Code Oxblood for strings, each with a night value. Inline code is 0.85em on the tint.

### How It Runs (chain figure)

- A `figure` with an orange `.caps` caption naming the flow, then an ordered row of equal-width nodes 30px apart. Each node is a plate (1.5px ink border, padding 12px 14px 14px) holding an 18px Literata bold name and a 13px grotesk detail. Each node after the first is joined to the previous by a 1.5px ink rule across the gap ending in an arrowhead. Under 820px the row turns vertical with 22px gaps, and the rule and arrowhead turn to point down from 24px in.

### Tables

- 1.5px ink rules top and bottom, no vertical rules; head cells in `.caps` on a 1px ink rule, body rows on tint rules, tabular numerals, cells top-aligned.

### Callouts

- A lab's link to its write-up and a post's link to its lab are rule-bound blocks, not boxes: a 1px (or 1.5px opening) rule above, a 1px rule below, a `.meta` line, a sentence and one button or link.

### Lab Control Panels

- A plate holding controls: 1.5px ink border, 16px padding, opened by an orange capitals title (12px, 700, 0.14em) on a 1px ink rule. Inputs are square, 1px ink border, grotesk, with Arcade Orange as the accent colour.

## Do's and Don'ts

### Do:

- **Do** print with two inks: ink and arcade orange on paper, with the tint reserved for grid lines inside a plate, table row rules and inline code.
- **Do** take every colour from a token (`--color-paper`, `--color-ink`, `--color-spot`, `--color-spot-text`, `--color-on-spot`, `--color-tint`) so the surface prints in both the day and the night edition.
- **Do** use the Orange Text token for orange text and Arcade Orange for fills, rules, underlines and outlines; put dark ink, never white, on an orange fill.
- **Do** structure with rules: 1.5px ink to open a section or frame a plate, 1px for rows, column rules and caption rows.
- **Do** put the claim and the shipped product on the same first screen, with the proof directly under both.
- **Do** set h1, h2 and h3 in Besley 600; set reading text and italics in Literata at 17px, 18px in posts.
- **Do** set apparatus (readings, dates, nav, row labels, button text) in Libre Franklin capitals at 12px with 0.06em to 0.14em tracking.
- **Do** number evidence with orange Libre Franklin 700: "Fig. n" as a caption prefix, "No. n" beside an entry, a billboard numeral on the hub.
- **Do** show state by colour and border: orange and solid while running, ink and dashed while paused, with the reading row's first word naming the state.
- **Do** keep hover to a colour change (ink to orange text) and focus to a 2px Arcade Orange outline offset 2px; nothing changes position.
- **Do** draw architecture as plates joined by an ink rule and arrowhead, and turn the chain vertical under 820px.
- **Do** put the proof before the picture on narrow screens: under 860px the proof rows follow the claim and the screenshot follows them.
- **Do** render one still frame with a Play control under `prefers-reduced-motion: reduce`.
- **Do** keep the bird mark as a mask in the masthead and as the favicon, the VoidArchive handle in the footer, and the theme toggle beside it.

### Don't:

- **Don't** use shadows, gradients, blur, translucency or a second surface colour; the page is one sheet of paper, by day and at night.
- **Don't** draw filled, shadowed or rounded cards; the only box is a plate, an ink frame on paper, and everything else is separated by rules and whitespace.
- **Don't** round a corner; every radius is 0.
- **Don't** add a kicker or eyebrow above a headline, and don't label a sentence with a capitals prefix; the grotesk capitals belong to apparatus (dates, readings, row labels), not to headings or prose.
- **Don't** set a billboard "Fig. n" above or over a plate, a masthead issue number, a drop cap or a multi-column essay; that front page was replaced.
- **Don't** introduce grey text for hierarchy; use italic, size or the serif/grotesk switch instead.
- **Don't** add a second accent or a tinted background behind prose, and don't bring back the cobalt spot ink, the legacy coral `#ff6b6b`, scanlines or the terminal prompt motif.
- **Don't** treat the Bagchal tiger and goat icons as licence for multicolour illustration elsewhere; they are the one accepted exception, on a Bagchal board only.
- **Don't** hard-code a hex value in a component or write a rule that only works in one edition.
- **Don't** set anything but code in Fira Code, and don't set code in anything else.
- **Don't** animate anything but the simulations: no entrance animations, no hover lifts, no movement on links or buttons, no animated mascot.
- **Don't** set Libre Franklin as running text or below 12px, Besley as body text, or Literata as a capitals label.
