---
title: 'Redesigning My Site as a Magazine Spread'
slug: 'redesigning-my-site-as-a-magazine-spread'
description: 'The old site was a dark terminal with a glowing red accent, like most developer portfolios. The new one is white stock, one cobalt ink, and numbered figures that are the labs themselves, running. How that decision got made.'
date: '2026-11-04'
published: true
tags: ['design', 'sveltekit', 'portfolio', 'process']
---

Until last week this site was a dark terminal. Near-black background, coral accent, Fira Code everywhere, a scanline overlay, a `$ whoami` prompt for the profile. I liked it when I built it. It was also what nearly every developer portfolio looks like, and a technical audit of it scored 11 out of 20: muted text that failed contrast on every page, focus rings removed on every button, no `h1` on most routes, Game of Life cells six pixels wide on a phone.

I decided to replace the look rather than patch it. This is how the new one came about.

## Start with what the site is for

Before any visual decision, I wrote down who the site is for and what it must prove. The answer was not "hiring managers," even though the old metadata was tuned for them. The people who actually arrive here come from a blog post, a GitHub README, or a shared lab link. They want to play with the experiment and read how it was built. The site's claim is that I ship working experiments, six of them, each with a written account of its engine.

That reframing decided the home page. If the labs are the proof, the labs should be the first thing on the page, running, not a card grid of screenshots underneath a bio.

## The direction

I worked through the redesign with a design tool that deals directions from a catalog rather than letting me pick my favourite, which would have been a Distill-style explorable explanation, the direction most developer sites with live demos land on. The one it dealt was a magazine spread: the Mathematical Games column from Scientific American, the one that introduced Conway's Game of Life in 1970.

That fit better than my own pick. A magazine spread has a running head, a two-column essay, and numbered figures with captions. Here the figures are the labs. Fig. 1 is Game of Life, alive, with its generation and population printed under it on a hairline rule. Fig. 2 is a flock of boids. Fig. 3 is a quick sort stepping one comparison per frame. Fig. 4 is my life in weeks. The essay is short and in my own voice.

## The rules of the world

The whole system fits in a few lines:

- White stock, near-black ink, one cobalt spot ink and its tint. Nothing else.
- Hairline and 1.5px rules carry all structure. No cards, no shadows, no gradients, no rounded corners.
- Source Serif 4 for reading. Public Sans capitals for labels, readings, and controls.
- A running figure is cobalt with a solid border. A paused one is ink with a dashed border.
- Only the simulations move. No entrance animations, no hover lifts.

Every lab page follows the same grammar: a figure number, a serif title, the board as a plate, a reading row instead of stat tiles, controls as caps buttons. The blog, projects, and labs index share one reading scaffold.

## What the process caught

A reviewer pass on the first build sent back eight findings. The material ones: on a phone, Fig. 1 sat below the headline and three paragraphs, so the live lab was not in the first viewport; the figures were a two-by-two grid instead of the three-up strip the direction called for; and the home page Game of Life was 35 by 26 cells, too small to tap on a 390px screen. All three were real. The grid now drops to 14 by 10 on phones, and the plate follows the byline.

Then the things only a person notices. The figure numerals, at 132px, covered the plates. The "Made with SvelteKit" line was noise. External links opened in the same tab. The boids in bounce mode flew off the plate and came back. Each of those took minutes to fix once said out loud.

## The score

The same audit now gives 17 out of 20. Zero contrast failures, an `h1` on every route, no heading skips, no horizontal overflow at 390px, touch targets at 24px or more, and no hard-coded colours anywhere outside the token file. The remaining points are a Google Fonts stylesheet that still blocks render and a pathfinding grid whose cells are small on phones.

More than the score, the site now says what I wanted it to say. The experiments are first, they run, and the words are mine.
