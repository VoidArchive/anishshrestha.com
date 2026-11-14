<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="System Design | Anish Shrestha"
	description="Anish Shrestha is learning system design in public. Every entry is a lesson backed by a project that is deployed and linked."
/>

<main class="page page-wide container">
	<h1 class="page-title">System design, learned in public</h1>
	<div class="premise">
		<p>
			I’m a Go backend developer and I’m learning system design the slow way: by building things,
			putting them online, and writing down what the design had to be.
		</p>
		<p>
			An entry only goes up if there is a deployed project behind it, so every lesson links to
			something you can open, install or read the source of. I work through these with AI as a pair
			and I say so. Where I got it wrong first, that is in the entry too.
		</p>
	</div>

	<section class="section">
		<h2>Entries, in order</h2>
		{#if data.entries.length > 0}
			<ol class="entries">
				{#each data.entries as entry (entry.slug)}
					<li>
						<span class="no" aria-hidden="true">{entry.no}</span>
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
		{:else}
			<p class="premise">The first entry is being written.</p>
		{/if}
		<p class="next">
			More entries follow as the projects grow. They also show up on the <a href="/blog">blog</a>,
			and the code behind each one is on the <a href="/projects">projects</a> page.
		</p>
	</section>
</main>

<style>
	.premise {
		font-size: 19px;
		line-height: 1.55;
		max-width: 62ch;
		text-wrap: pretty;
	}
	.premise p {
		margin: 0 0 1em;
	}
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.entries li {
		display: grid;
		grid-template-columns: clamp(64px, 12vw, 140px) minmax(0, 1fr);
		gap: 24px;
		align-items: start;
		padding: 24px 0;
		border-top: 1px solid var(--color-ink);
	}
	.entries li:first-child {
		border-top: 0;
		padding-top: 8px;
	}
	.no {
		font-family: var(--font-family-sans);
		font-weight: 700;
		font-size: clamp(56px, 9vw, 96px);
		line-height: 0.85;
		letter-spacing: -0.04em;
		color: var(--color-spot-text);
		font-variant-numeric: tabular-nums;
	}
	.entries h3 {
		font-size: clamp(22px, 2.4vw, 28px);
		font-weight: 600;
		line-height: 1.15;
		margin: 0 0 8px;
		text-wrap: balance;
	}
	.entries h3 a {
		text-decoration: none;
	}
	.entries h3 a:hover {
		text-decoration: underline;
	}
	.entries li p:not(.meta) {
		margin: 0 0 8px;
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
	.next {
		margin: 0;
		padding-top: 16px;
		border-top: 1px solid var(--color-ink);
		font-style: italic;
		font-size: 17px;
		max-width: 62ch;
	}
	@media (max-width: 520px) {
		.entries li {
			gap: 12px;
		}
	}
</style>
