<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import BagchalFigure from '#lib/components/spread/BagchalFigure.svelte';
	import BoidsFigure from '#lib/components/spread/BoidsFigure.svelte';
	import SortFigure from '#lib/components/spread/SortFigure.svelte';
	import LifeCalendarFigure from '#lib/components/spread/LifeCalendarFigure.svelte';
	import { formatDate } from '#lib/utils/blog.js';
	import { projects } from '#lib/site.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const proof = ['ntx', 'nepal-payment-go', 'kursi-fighter'].map((slug) =>
		projects.find((p) => p.slug === slug)!
	);
</script>

<Seo
	title="Anish Shrestha | Software Developer"
	description="Anish Shrestha, a Go backend developer learning system design in public. Each lesson is backed by a deployed project, like NTX or a payment SDK for Nepal."
/>

<main class="home container">
	<section class="opening">
		<div class="lead">
			<h1>Go backend developer, learning system design in public.</h1>
			<p class="dek">
				I’m Anish Shrestha. I write backends in Go, and I’m learning system design by building
				things. I only write a lesson up once the project behind it is deployed.
			</p>
			<p class="hire">
				I take contract work on Go backends, Nepali payment gateways and NEPSE data.
				<a href="/about">Work with me</a>.
			</p>
		</div>

		<figure class="shot">
			<a href="/projects/ntx" aria-label="NTX project page">
				<img
					src="/ntx-hero.webp"
					alt="The NTX company page for Nabil Bank: share price chart and a stock overview of the checks that hold."
					width="2600"
					height="1536"
					fetchpriority="high"
				/>
			</a>
			<figcaption>
				<b>Fig. 1</b> NTX, my stock research platform for the Nepal Stock Exchange. Go, ConnectRPC
				and SQLite behind this page. <a href="https://ntx.anishshrestha.com">See it live</a>
			</figcaption>
		</figure>

		<ol class="proof" aria-label="Three projects that back this up">
			{#each proof as p (p.slug)}
				<li>
					<h2><a href="/projects/{p.slug}">{p.name}</a></h2>
					<p>{p.proves}</p>
					<p class="meta">{p.kind}</p>
				</li>
			{/each}
		</ol>
	</section>

	{#if data.entries.length > 0}
		<section class="section entries">
			<h2>Latest system design entries</h2>
			<ol>
				{#each data.entries as entry (entry.slug)}
					<li>
						<span class="no">No. {entry.no}</span>
						<div>
							<h3><a href="/blog/{entry.slug}">{entry.title}</a></h3>
							<p>{entry.description}</p>
							<p class="meta">
								<time datetime={entry.date}>{formatDate(entry.date)}</time>
								{#if entry.project}· Backed by <a href="/projects/{entry.project.slug}"
										>{entry.project.name}</a
									>{/if}
							</p>
						</div>
					</li>
				{/each}
			</ol>
			<p class="more"><a href="/system-design">All entries, in order</a></p>
		</section>
	{/if}

	<section class="section labs">
		<h2>Labs</h2>
		<p class="lede">
			Smaller things I built to learn something. These four are running right now; poke them.
		</p>
		<div class="plates">
			<figure class="plate">
				<BagchalFigure />
				<figcaption>
					<b>Fig. 2</b> Bagchal, four tigers against twenty goats, playing itself.
					<a href="/labs/bagchal">Play it yourself</a>
				</figcaption>
			</figure>
			<figure class="plate">
				<BoidsFigure />
				<figcaption>
					<b>Fig. 3</b> Boids flocking from three rules.
					<a href="/labs/boids">Open the lab</a>
				</figcaption>
			</figure>
			<figure class="plate">
				<SortFigure />
				<figcaption>
					<b>Fig. 4</b> Quick sort, one comparison per frame.
					<a href="/labs/dsa-visualizer">Open the lab</a>
				</figcaption>
			</figure>
			<figure class="plate">
				<LifeCalendarFigure />
				<figcaption>
					<b>Fig. 5</b> My life in weeks; the blinking square is this week.
					<a href="/labs/life-calendar">Enter your own</a>
				</figcaption>
			</figure>
		</div>
		<p class="also">
			You can play <a href="/labs/bagchal">Bagchal</a> and <a href="/labs/tictactoe">Tic Tac Toe</a>
			against a minimax opponent.
			<a href="/projects#labs">All six labs</a>
		</p>
	</section>
</main>

<style>
	.home {
		--grot: var(--font-family-sans);
		/* The live figures read their inks from these */
		--spread-paper: var(--color-paper);
		--spread-ink: var(--color-ink);
		--spread-spot: var(--color-spot);
		--spread-tint: var(--color-tint);
		padding-bottom: 88px;
	}

	/* Opening: the claim on the left, the shipped product on the right, three proofs under both */
	.opening {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.82fr);
		gap: 0 clamp(32px, 5vw, 72px);
		padding-top: clamp(28px, 4vw, 52px);
	}
	h1 {
		font-weight: 600;
		font-size: clamp(38px, 5.4vw, 80px);
		line-height: 1;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 24px;
	}
	.dek {
		font-size: clamp(18px, 1.5vw, 21px);
		line-height: 1.5;
		max-width: 46ch;
		margin: 0 0 20px;
		text-wrap: pretty;
	}
	.hire {
		font-style: italic;
		font-size: 18px;
		max-width: 46ch;
		margin: 0;
		text-wrap: pretty;
	}
	.hire a {
		font-style: normal;
		font-weight: 600;
	}

	.shot {
		margin: 0;
		align-self: start;
	}
	.shot > a {
		display: block;
		border: 1.5px solid var(--color-ink);
	}
	.shot img {
		display: block;
		width: 100%;
		height: auto;
	}
	figcaption {
		margin-top: 10px;
		font-family: var(--grot);
		font-size: 13px;
		letter-spacing: 0.02em;
		line-height: 1.5;
		text-wrap: pretty;
	}
	figcaption b {
		color: var(--color-spot-text);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 12px;
		margin-right: 6px;
	}

	.proof {
		grid-column: 1 / -1;
		list-style: none;
		margin: clamp(32px, 4vw, 48px) 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border-top: 1.5px solid var(--color-ink);
	}
	.proof li {
		padding: 18px 28px 0;
		border-left: 1px solid var(--color-ink);
	}
	.proof li:first-child {
		padding-left: 0;
		border-left: 0;
	}
	.proof li:last-child {
		padding-right: 0;
	}
	.proof h2 {
		font-size: clamp(24px, 2.4vw, 32px);
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.01em;
		margin: 0 0 8px;
	}
	.proof h2 a {
		text-decoration-thickness: 2px;
		text-underline-offset: 5px;
	}
	.proof p:not(.meta) {
		margin: 0 0 10px;
		font-size: 17px;
		text-wrap: pretty;
	}
	.proof .meta {
		margin: 0;
	}

	/* System design entries */
	.entries ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.entries li {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		gap: 20px;
		padding: 16px 0;
		border-top: 1px solid var(--color-ink);
	}
	.entries li:first-child {
		border-top: 0;
		padding-top: 4px;
	}
	.no {
		font-family: var(--grot);
		font-weight: 700;
		font-size: 22px;
		letter-spacing: -0.02em;
		color: var(--color-spot-text);
		font-variant-numeric: tabular-nums;
		padding-top: 2px;
	}
	.entries h3 {
		font-size: 22px;
		font-weight: 600;
		line-height: 1.2;
		margin: 0 0 6px;
		text-wrap: balance;
	}
	.entries h3 a {
		text-decoration: none;
	}
	.entries h3 a:hover {
		text-decoration: underline;
	}
	.entries li p:not(.meta) {
		margin: 0 0 6px;
		font-size: 17px;
		max-width: 68ch;
		text-wrap: pretty;
	}
	.entries .meta {
		margin: 0;
	}
	.entries .meta a {
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}
	.more {
		margin: 14px 0 0;
		padding-top: 14px;
		border-top: 1px solid var(--color-ink);
		font-family: var(--grot);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	/* Labs: the live plates */
	.lede {
		font-style: italic;
		font-size: 18px;
		margin: 0 0 24px;
	}
	.plates {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 40px 32px;
	}
	.plate {
		margin: 0;
	}
	.home :global(.reading) {
		font-family: var(--grot);
		font-size: 12px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.5;
		font-variant-numeric: tabular-nums;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		border-top: 1px solid var(--color-ink);
		padding-top: 8px;
		margin-top: 8px;
		color: var(--color-spot-text);
		font-weight: 700;
	}
	.home :global(.reading .state::before) {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		background: currentColor;
		margin-right: 6px;
		vertical-align: 1px;
	}
	.home :global(.reading .controls) {
		margin-left: auto;
		display: flex;
		gap: 12px;
	}
	.home :global(.reading button),
	.home :global(.reading a) {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: var(--color-ink);
		background: none;
		border: 0;
		/* 24px tall target without moving the baseline */
		padding: 3px 0;
		margin: -3px 0;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}
	.home :global(.reading button:hover),
	.home :global(.reading a:hover) {
		color: var(--color-spot-text);
	}
	.also {
		margin: 28px 0 0;
		padding-top: 12px;
		border-top: 1px solid var(--color-ink);
		font-size: 17px;
		text-wrap: pretty;
	}

	@media (max-width: 1100px) {
		.plates {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 860px) {
		.opening {
			grid-template-columns: 1fr;
		}
		/* Proof links come straight after the claim; the screenshot follows them */
		.proof {
			grid-template-columns: 1fr;
			grid-row: 2;
			margin-bottom: 36px;
			border-bottom: 1.5px solid var(--color-ink);
		}
		.proof li,
		.proof li:first-child,
		.proof li:last-child {
			padding: 16px 0;
			border-left: 0;
			border-top: 1px solid var(--color-ink);
		}
		.proof li:first-child {
			border-top: 0;
		}
	}
	@media (max-width: 640px) {
		.plates {
			grid-template-columns: 1fr;
		}
		.entries li {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
