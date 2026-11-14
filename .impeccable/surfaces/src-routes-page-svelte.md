---
version: 1
slug: "src-routes-page-svelte"
primary_target: "src/routes/+page.svelte"
related_targets: ["src/routes/projects/+page.svelte", "src/routes/projects/[slug]/+page.svelte", "src/routes/system-design/+page.svelte", "src/routes/about/+page.svelte"]
---

# Home page surface brief

Scope: the `/` route, and the reading routes that share its world. Visitor mode: Persuade on home, Read elsewhere. Audience, in order: a remote employer deciding in seconds whether the author ships backend systems; Nepali companies needing payment or stock-data integrations; fellow developers. Job: state the role, show three deployed proofs, then the system design entries, then the labs, with one "work with me" line to /about. Constraints: URLs fixed; home title fixed; one h1, one meta description and one canonical per page; all text prerendered; light theme; gopher and VoidArchive handle stay.

## Direction contract

THESIS: Same paper, new front page. The claim and the shipped product share the first screen; it refuses both the essay-first magazine opening it replaces and the profile-card-plus-skill-grid portfolio.

OWN-WORLD: White stock, ink #141414, one cobalt spot ink #2242c8 and its tint. Hairline and 1.5px ink rules, column rules, no cards, no shadows, square corners. Source Serif 4 for reading, Public Sans capitals for labels, Fira Code for code only. Bordered plates for live figures, screenshots and architecture nodes.

STORY: The visitor reads the role in one line, sees NTX running as Fig. 1, picks one of three proofs, and can reach "Work with me" without scrolling. Below: numbered system design entries each naming the project behind it, then four live lab plates.

FIRST VIEWPORT: Running head (domain left, Projects, System Design, Blog, About right) on a 1.5px rule. Left: h1 at clamp(38px, 5.4vw, 80px), a 46ch dek, the italic hire line. Right: the NTX screenshot plate with its Fig. 1 caption. Under both, on a 1.5px rule, three proof columns divided by 1px column rules.

FORM: evolution of the Mathematical Games spread (seed:a9745f2fa560bd8e); structure pinned by the brief, so no new roll.

SIGNATURE INTERACTION: the lab plates are alive and pokeable; the "How it runs" figure on project pages turns from a left-to-right chain to a top-to-bottom one on phones. Motion grammar: only the simulations move.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Kursi Fighter content is placeholder in `src/lib/site.ts`.
- Résumé file not supplied; About falls back to an email link until `RESUME_URL` is set.
