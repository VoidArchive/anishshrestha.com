<script lang="ts">
	import LifeFigure from '#lib/components/spread/LifeFigure.svelte';
	import BoidsFigure from '#lib/components/spread/BoidsFigure.svelte';
	import SortFigure from '#lib/components/spread/SortFigure.svelte';
	import LifeCalendarFigure from '#lib/components/spread/LifeCalendarFigure.svelte';
	import { formatDate } from '#lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let cols = $state(35);
	let rows = $state(26);

	const instruments = [
		{
			name: 'nepal-payment-go',
			what: 'One Go SDK for eSewa, Khalti, ConnectIPS and FonePay. HMAC and RSA signatures handled.',
			href: 'https://github.com/VoidArchive/nepal-payment-go'
		},
		{
			name: 'go-nepse',
			what: 'Type-safe client for the Nepal Stock Exchange API, with token handling via embedded WebAssembly.',
			href: 'https://github.com/VoidArchive/go-nepse'
		},
		{
			name: 'NTX',
			what: 'Stock research for NEPSE. Go and Protobuf behind, SvelteKit in front. Live.',
			href: 'https://ntx.anishshrestha.com'
		}
	];
</script>

<main class="spread">
	<section class="opening">
		<div class="column">
			<h1>Six working experiments, and how I built each one</h1>
			<p class="byline">by Anish Shrestha, software developer, Kathmandu</p>
			<div class="essay">
				<p>
					Every figure on this page is running. Fig. 1 is Conway's Game of Life, the cellular
					automaton in which a handful of rules about neighbours produces gliders, oscillators and
					still lifes. Click any cell and the colony changes course. After it come a flock of boids,
					a sorting visualizer, and my own life drawn in weeks.
				</p>
				<p>
					I wrote up the engine behind each lab: the animation step system in the visualizer, the
					opening book in Bagchal, the spatial hash that keeps the flock fast. Next to the labs are
					the Go libraries I maintain, a unified payment SDK for Nepal and a client for the Nepal
					Stock Exchange.
				</p>
				<p>
					Some of my solutions are elegant, others are brute force. All of them work eventually.
				</p>
			</div>
		</div>

		<figure class="plate lead">
			<span class="fig" aria-hidden="true">Fig. 1</span>
			<LifeFigure bind:cols bind:rows />
			<figcaption>
				<b>Fig. 1</b> Conway's Game of Life, {cols} × {rows} cells, edges wrap.
				<a href="/labs/gameoflife">Open the lab</a> ·
				<a href="/blog/building-conways-game-of-life-svelte">Read how it was built</a>
			</figcaption>
		</figure>
	</section>

	<section class="plates" aria-label="More figures">
		<figure class="plate">
			<span class="fig" aria-hidden="true">Fig. 2</span>
			<BoidsFigure />
			<figcaption>
				<b>Fig. 2</b> Boids flocking from three rules: separation, alignment, cohesion.
				<a href="/labs/boids">Open the lab</a>
			</figcaption>
		</figure>
		<figure class="plate">
			<span class="fig" aria-hidden="true">Fig. 3</span>
			<SortFigure />
			<figcaption>
				<b>Fig. 3</b> Quick sort, one comparison per frame.
				<a href="/labs/dsa-visualizer">Open the lab</a> ·
				<a href="/blog/building-dsa-visualizer-animation-engine">Read how it was built</a>
			</figcaption>
		</figure>
		<figure class="plate">
			<span class="fig" aria-hidden="true">Fig. 4</span>
			<LifeCalendarFigure />
			<figcaption>
				<b>Fig. 4</b> My life in weeks: one square each, a hundred years, counted from my birth
				date. <a href="/labs/life-calendar">Enter your own</a>
			</figcaption>
		</figure>
	</section>
	<p class="also">
		<b>Figs. 5, 6</b> Two more labs, without plates: <a href="/labs/bagchal">Bagchal</a>, the Nepali
		tigers-and-goats game with a minimax opponent, and <a href="/labs/tictactoe">Tic Tac Toe</a>
		with an unbeatable minimax player. <a href="/labs">All labs</a>
	</p>

	<section class="back">
		<div class="notes">
			<h2>Notes</h2>
			{#each data.latestPosts as post (post.slug)}
				<article>
					<time datetime={post.date}>{formatDate(post.date)}</time>
					<h3><a href="/blog/{post.slug}">{post.title}</a></h3>
					<p>{post.description}</p>
				</article>
			{/each}
			<p class="more"><a href="/blog">All notes</a></p>
		</div>
		<div class="instruments">
			<h2>Instruments</h2>
			<p class="lede">The Go libraries I built for Nepal's financial plumbing.</p>
			{#each instruments as tool (tool.name)}
				<article>
					<h3><a href={tool.href} rel="noopener">{tool.name}</a></h3>
					<p>{tool.what}</p>
				</article>
			{/each}
			<p class="more"><a href="/projects">All projects</a></p>
		</div>
	</section>

	<section class="colophon">
		<p>
			I'm Anish Shrestha. Write to me at <a href="mailto:hi@anishshrestha.com"
				>hi@anishshrestha.com</a
			>, or find me as <a href="https://github.com/VoidArchive" rel="me">VoidArchive</a> on GitHub
			and on
			<a href="https://linkedin.com/in/theinanish" rel="me">LinkedIn</a>.
		</p>
	</section>
</main>

<style>
	.spread {
		--spread-paper: var(--color-paper);
		--spread-ink: var(--color-ink);
		--spread-spot: var(--color-spot);
		--spread-tint: var(--color-tint);
		--serif: var(--font-family-serif);
		--grot: var(--font-family-sans);
		--measure: 520px;
		color: var(--spread-ink);
		background: var(--spread-paper);
		font-family: var(--serif);
		font-size: 16px;
		line-height: 1.5;
		padding: 0 clamp(16px, 5vw, 72px) 0;
		max-width: 1440px;
		margin: 0 auto;
	}
	.spread :global(::selection) {
		background: var(--spread-spot);
		color: var(--spread-paper);
	}
	.spread a {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: var(--spread-spot);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		transition: none;
	}
	.spread a:hover {
		color: var(--spread-spot);
	}
	.spread a:focus-visible,
	.spread :global(button:focus-visible) {
		outline: 2px solid var(--spread-spot);
		outline-offset: 2px;
	}

	/* Opening spread */
	.opening {
		display: grid;
		grid-template-columns: minmax(0, var(--measure)) minmax(0, 1fr);
		gap: 56px;
		padding-top: 40px;
		align-items: start;
	}
	h1 {
		font-weight: 600;
		font-size: clamp(34px, 4.2vw, 60px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		text-wrap: balance;
		margin: 0 0 18px;
	}
	.byline {
		font-style: italic;
		font-size: 17px;
		margin: 0 0 26px;
	}
	.essay {
		column-count: 2;
		column-gap: 28px;
		column-rule: 1px solid var(--spread-ink);
		font-size: 15.5px;
		text-wrap: pretty;
	}
	.essay p {
		margin: 0 0 12px;
		text-indent: 1.4em;
	}
	.essay p:first-child {
		text-indent: 0;
	}
	.essay p:first-child::first-letter {
		float: left;
		font-size: 58px;
		line-height: 0.85;
		padding: 6px 8px 0 0;
		font-weight: 600;
		color: var(--spread-spot);
	}

	/* Plates */
	.plate {
		position: relative;
		margin: 0;
		/* numeral height plus a gap: the number sits above the plate, never over the figure */
		padding-top: calc(clamp(48px, 6vw, 88px) + 10px);
	}
	.fig {
		position: absolute;
		top: 0;
		left: -14px;
		font-family: var(--grot);
		font-weight: 700;
		font-size: clamp(48px, 6vw, 88px);
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--spread-spot);
		z-index: 1;
		pointer-events: none;
	}
	.plate figcaption,
	.spread :global(.reading) {
		font-family: var(--grot);
		font-size: 11.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.5;
	}
	.spread :global(.reading) {
		font-variant-numeric: tabular-nums;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		border-top: 1px solid var(--spread-ink);
		padding-top: 8px;
		margin-top: 8px;
		color: var(--spread-spot);
		font-weight: 700;
	}
	.spread :global(.reading .state::before) {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		background: currentColor;
		margin-right: 6px;
		vertical-align: 1px;
	}
	.spread :global(.reading .controls) {
		margin-left: auto;
		display: flex;
		gap: 12px;
	}
	.spread :global(.reading button),
	.spread :global(.reading a) {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: var(--spread-ink);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--spread-spot);
		text-underline-offset: 3px;
	}
	.spread :global(.reading button:hover),
	.spread :global(.reading a:hover) {
		color: var(--spread-spot);
	}
	.plate figcaption {
		margin-top: 10px;
		text-transform: none;
		letter-spacing: 0.02em;
		font-size: 13px;
	}
	.plate figcaption b {
		color: var(--spread-spot);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 11.5px;
		margin-right: 6px;
	}

	.plates {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 48px 40px;
		margin-top: 72px;
		padding-top: 24px;
		border-top: 1.5px solid var(--spread-ink);
	}
	.also {
		margin: 24px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--spread-ink);
		font-size: 15.5px;
		text-wrap: pretty;
	}
	.also b {
		font-family: var(--grot);
		font-size: 11.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--spread-spot);
		margin-right: 6px;
	}

	/* Back pages */
	.back {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 56px;
		margin-top: 72px;
		padding-top: 24px;
		border-top: 1.5px solid var(--spread-ink);
	}
	.back h2 {
		font-family: var(--grot);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--spread-spot);
		margin: 0 0 18px;
	}
	.back article {
		padding: 14px 0;
		border-top: 1px solid var(--spread-ink);
	}
	.back time {
		display: block;
		font-family: var(--grot);
		font-size: 11.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.back h3 {
		font-size: 22px;
		font-weight: 600;
		line-height: 1.2;
		margin: 0 0 6px;
		text-wrap: balance;
	}
	.back h3 a {
		text-decoration: none;
	}
	.back h3 a:hover {
		text-decoration: underline;
	}
	.back p {
		margin: 0;
		font-size: 15.5px;
		text-wrap: pretty;
	}
	.back .lede {
		margin-bottom: 14px;
		font-style: italic;
	}
	.back .more {
		margin-top: 16px;
		font-family: var(--grot);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.colophon {
		margin-top: 72px;
		padding: 24px 0 56px;
		border-top: 1.5px solid var(--spread-ink);
		font-style: italic;
		font-size: 17px;
		max-width: 60ch;
	}
	.colophon p {
		margin: 0;
	}

	@media (max-width: 1024px) {
		/* The live lab leads on narrow screens: plate right after the byline, essay after the plate */
		.opening {
			grid-template-columns: 1fr;
			gap: 0;
		}
		.column {
			display: contents;
		}
		.plate.lead {
			order: 1;
			margin-bottom: 40px;
		}
		.essay {
			order: 2;
		}
		.plates,
		.back {
			grid-template-columns: 1fr;
			gap: 40px;
		}
	}
	@media (max-width: 640px) {
		.essay {
			column-count: 1;
		}
		.fig {
			left: -4px;
		}
	}
</style>
