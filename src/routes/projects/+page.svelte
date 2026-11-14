<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { projects, labs } from '#lib/site.js';
</script>

<Seo
	title="Projects | Anish Shrestha"
	description="Projects by Anish Shrestha: NTX, a payment SDK for Nepal, a NEPSE client library and Kursi Fighter, plus six small labs that run in the browser."
/>

<main class="page page-wide container">
	<h1 class="page-title">Projects</h1>
	<p class="dek">
		Three things I built and keep running, one game in progress, and six smaller labs you can play
		with in the browser.
	</p>

	<ol class="ruled big">
		{#each projects as p (p.slug)}
			<li>
				<div class="name">
					<h2><a href="/projects/{p.slug}">{p.name}</a></h2>
					<p class="meta">{p.kind}</p>
				</div>
				<div>
					<p>{p.summary}</p>
					<p>{p.proves}</p>
					<p class="meta links">
						<a href="/projects/{p.slug}"
							>{p.runs.chains.length > 0 ? 'How it runs' : 'Project page'}</a
						>
						{#each p.links.filter((l) => l.href.startsWith('http')).slice(0, 2) as link (link.href)}
							<span class="sep" aria-hidden="true">·</span><a href={link.href}>{link.label}</a>
						{/each}
					</p>
				</div>
			</li>
		{/each}
	</ol>

	<section class="section" id="labs">
		<h2>Labs</h2>
		<p class="lede">Small experiments. Each one runs the moment it loads.</p>
		<ul class="labs">
			{#each labs as lab (lab.slug)}
				<li>
					<h3><a href="/labs/{lab.slug}">{lab.name}</a></h3>
					<p>{lab.description}</p>
					<p class="meta links">
						<a href="/labs/{lab.slug}">Play</a>
						{#if lab.post}· <a href="/blog/{lab.post}">How it was built</a>{/if}
					</p>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.big > li {
		display: grid;
		grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
		gap: 8px 40px;
		padding: 26px 0;
	}
	.big h2 {
		font-size: clamp(28px, 3vw, 38px);
		line-height: 1.05;
		letter-spacing: -0.015em;
		margin: 0 0 8px;
	}
	.big .name .meta {
		margin: 0;
	}
	.links {
		margin: 0;
	}
	.sep {
		margin: 0 6px;
	}
	.links a {
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
		/* 24px tap target */
		display: inline-block;
		padding: 3px 0;
	}

	.lede {
		font-style: italic;
		font-size: 18px;
		margin: 0 0 20px;
	}
	.labs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0 32px;
	}
	.labs li {
		padding: 14px 0 18px;
		border-top: 1px solid var(--color-ink);
	}
	.labs h3 {
		font-size: 20px;
		font-weight: 600;
		line-height: 1.2;
		margin: 0 0 4px;
	}
	.labs h3 a {
		text-decoration: none;
	}
	.labs h3 a:hover {
		text-decoration: underline;
	}
	.labs p:not(.meta) {
		margin: 0 0 6px;
		font-size: 16px;
		text-wrap: pretty;
	}

	@media (max-width: 820px) {
		.big > li {
			grid-template-columns: 1fr;
		}
		.labs {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 520px) {
		.labs {
			grid-template-columns: 1fr;
		}
	}
</style>
