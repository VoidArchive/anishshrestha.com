---
title: 'Making Game of Life Playable on a Phone'
slug: 'game-of-life-on-a-phone'
description: 'An audit found the Game of Life grid rendering 1,203 cells at six pixels each on a 390-pixel screen. What it took to make every cell a real tap target without losing the grid.'
date: '2026-11-04'
published: true
tags: ['accessibility', 'mobile', 'svelte', 'game-of-life']
labSlug: 'gameoflife'
relatedLab:
  name: 'Game of Life'
  url: '/labs/gameoflife'
  description: "Conway's cellular automaton with a pattern library, a seeded grid, and cells you can tap on a phone"
---

The Game of Life lab was the first one I built for this site, and it worked well on a laptop. A technical audit of the site this month measured it on a phone: 1,203 cell buttons, each six pixels square. WCAG asks for 24. You could not toggle a cell with a finger if you tried, and the controls panel sat above the grid, so on a 390-pixel screen the board itself was a thousand pixels below the fold.

## Cell size from the container, not the grid

The old cell size was a function of the grid dimensions alone: eight pixels for a normal grid, six for a large one, four for a huge one. That is reasonable on a wide screen and meaningless on a narrow one. The new rule looks at the width the grid actually has:

```ts
const narrow = window.innerWidth <= 1024;
const cellSize = Math.max(narrow ? 24 : 6, Math.floor(containerWidth / gridWidth) - 1);
```

On a phone the floor is 24 pixels, so the default 40 by 30 grid becomes 1,000 pixels wide and the container scrolls. That is a deliberate trade. A grid you can pan and tap beats a grid you can see whole and cannot touch. On a desktop the floor is six pixels and the whole grid fits as before.

The home page figure takes the other route. It is a canvas, not a grid of buttons, and on that page it is decoration, so under 600 pixels it drops from 35 by 26 cells to 14 by 10. The cells land at about 25 pixels and the caption reads the live size.

## Board first

The lab's layout used to put controls, patterns, and rules in a sidebar on the left, and on a phone the sidebar stacked on top. The fix is CSS order: the board is first in the DOM, the sidebar second, and a desktop media query moves the sidebar into its column. The board is now the first thing on a phone, with its reading row under it, and the controls follow.

## Seed the grid

An empty grid makes the first tap on Play do nothing, which reads as broken. The shell now seeds the grid at 25 percent density on mount if the population is zero. Randomize and Clear still work as before, but the lab is alive when you arrive.

## The parts that were just wrong

Two strings in the pattern panel began with "Debug:" and shipped to production for a year. The statistics panel was four tiles with coloured icons; it is now a single reading row, "Generation 128 · Population 47 · Born 3 · Died 5", in tabular figures so the numbers do not jitter as they change. Every button and the grid cells had `outline: none`, which removed keyboard focus entirely; they now show a focus ring only for keyboard focus.

## What the audit says now

No contrast failures, one `h1`, no skipped headings, no horizontal overflow at 390 pixels, every tap target at 24 pixels or more. The lab lost nothing. The pattern library, the toroidal wrap option, the speed presets, and the virtualised path for grids over 50 cells wide are all still there.

To see the before and after, open the lab on your phone and tap a cell.
