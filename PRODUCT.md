# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

In priority order (changed 2026-11-14):

1. A remote employer deciding in seconds whether the author can ship backend systems. Success: the role, three deployed proofs and a way to get in touch are on the first screen.
2. Nepali companies needing payment or stock-data integrations. Success: they find the payment SDK and NEPSE work, how each runs, and the availability note on /about.
3. Fellow developers reading the blog and playing the labs. Success: a lab that runs the moment it loads and a post that explains the engineering honestly.

## Product Purpose

A personal site that is both a portfolio and a coding laboratory. It exists to ship working experiments (games, simulations, visualizers), write the technical story behind each one, and show the production Go work (payment SDK, NEPSE client, NTX). Success means visitors play a lab, read the matching post, and come away trusting that the author builds things that actually work.

## Positioning

A Go backend developer learning system design in public with AI, with every lesson backed by a deployed project. Voice is casual, first person. Proof: NTX (live), nepal-payment-go, go-nepse, Kursi Fighter. The six labs are supporting evidence, shown after the projects.

## Operating Context

- Routes: home, /projects (four projects, then six labs), /projects/<slug>, /labs/<name> (six labs; /labs redirects to /projects), /system-design (blog posts with `series: 'system-design'`), /blog, /about. Projects and labs are listed once in `src/lib/site.ts`.
- Labs are used in the browser, on desktop and phones, often for a few minutes at a time. Pathfinding and grid labs involve dragging and tapping cells.
- Blog posts are long technical reads with Go and TypeScript code blocks, tables, and callouts linking to the related lab.
- Dev: `pnpm dev`. Deploy: Cloudflare Workers via wrangler. Every page is prerendered; labs hydrate in the browser.
- Analytics: Umami. Contact: hi@anishshrestha.com, GitHub VoidArchive, LinkedIn theinanish.

## Capabilities and Constraints

- SvelteKit 2 with Svelte 5 runes, TypeScript, Tailwind CSS 4 with tokens declared in `src/app.css`, mdsvex for posts, lucide-svelte icons, prism-themes for code highlighting.
- Lab engines live in `src/labs/<name>` with engine, rules, ai, and ui folders; a shared `src/core` holds BaseEngine and Minimax. Redesign must keep these engines and their public state stores intact.
- Content is real and must not be invented: project descriptions, post text, lab names, and repo links are facts.
- Light and dark themes. Light is the default look; dark follows the system preference or the footer toggle, and the choice is saved in localStorage.

## Brand Commitments

- The bird mark stays: in the header beside the site name and as the favicon (`static/bird-logo.svg`).
- The VoidArchive handle and the author name Anish Shrestha are the identity.
- The red bird mark (`static/bird-logo.svg`) is kept only if it fits the chosen theme; the user allows replacing it when it does not match.
- The terminal and CRT motif (prompt logo, `$ whoami` profile, scanlines) is NOT binding. The look is open for full replacement.
- Voice in posts and lab copy: first person, plain, honest about rough edges ("some solutions are elegant, others are brute force").

## Evidence on Hand

- Six working labs with source in `src/labs` and `src/routes/labs`.
- Nine published posts in `src/content/blog` with dates, tags, and lab links.
- Project list with real repo URLs in `src/routes/projects/+page.svelte`; one link (Bagchal) points at a path that no longer exists.
- Open Graph image `static/og-image.png`, NTX screenshot `static/ntx-showcase.png`, lab icons in `static/icons`.
- JSON-LD person and project schema in the root layout; `static/llms.txt`.
- Absent, must not be fabricated: testimonials, client logos, employer case studies, download or star counts.

## Product Principles

1. The artifact leads. A lab should be playable within the first viewport on every device; controls serve the board, not the reverse.
2. Every experiment has a story. Labs link to their post and posts link back; new labs are not complete until both halves exist.
3. Honest engineering over polish claims. Copy says what was built and what is rough; no invented metrics or social proof.
4. Secondary audiences get a clear path, not a pitch. Fintech work and contact details are easy to find without turning the home page into a resume.
5. Playfulness is part of the identity. The labs carry it; small moments of character are welcome where they do not block the task.

## Accessibility & Inclusion

Labs must be fully operable by keyboard and by touch, with cell and control targets at least 24 CSS px. Body and muted text must meet WCAG AA contrast. Motion must respect `prefers-reduced-motion`. The 2026-11-03 audit found gaps in all of these; they are requirements for the redesign, not optional polish.
