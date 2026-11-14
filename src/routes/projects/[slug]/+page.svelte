<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let p = $derived(data.project);
</script>

<Seo title="{p.name} | Anish Shrestha" description={p.summary} />

<main class="page page-wide container">
	<h1 class="page-title">{p.name}</h1>
	<p class="dek">{p.summary}</p>
	<p class="proves">{p.proves}</p>

	<section class="section">
		<h2>{p.start.heading}</h2>
		{#if p.start.command}
			<pre class="codeblock wrap"><code>{p.start.command}</code></pre>
		{/if}
		{#if p.start.href}
			<p class="go"><a class="btn" href={p.start.href}>{p.start.label ?? p.start.heading}</a></p>
		{/if}
		{#if p.start.note}<p class="note">{p.start.note}</p>{/if}
	</section>

	{#if p.example || p.image}
		<section class="section">
			<h2>A working example</h2>
			{#if p.example}
				<p class="note">{p.example.caption}</p>
				<!-- tabindex: a scrollable region has to be reachable by keyboard -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<pre class="codeblock" tabindex="0"><code>{p.example.code}</code></pre>
			{/if}
			{#if p.image}
				<figure class="shot">
					<img
						src={p.image.src}
						alt={p.image.alt}
						width={p.image.width}
						height={p.image.height}
						loading="lazy"
					/>
					<figcaption>{p.image.caption}</figcaption>
				</figure>
			{/if}
		</section>
	{/if}

	{#if p.links.length > 0}
		<section class="section">
			<h2>Links</h2>
			<ul class="links">
				{#each p.links as link (link.href)}
					<li><a href={link.href}>{link.label}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="section">
		<h2>How it runs</h2>
		{#each p.runs.chains as chain (chain.label)}
			<figure class="chain">
				<figcaption class="caps">{chain.label}</figcaption>
				<ol>
					{#each chain.steps as step, i (i)}
						<li>
							<b>{step.name}</b>
							<span>{step.detail}</span>
						</li>
					{/each}
				</ol>
			</figure>
		{/each}
		{#if p.runs.hosting.length > 0}
			<dl class="hosting">
				{#each p.runs.hosting as row (row.where)}
					<div>
						<dt class="caps">{row.where}</dt>
						<dd>{row.what}</dd>
					</div>
				{/each}
			</dl>
		{:else}
			<p class="note">The hosting and architecture notes for this one are not written yet.</p>
		{/if}
	</section>

	{#if data.lessons.length > 0}
		<section class="section">
			<h2>System design entries from this project</h2>
			<ul class="links">
				{#each data.lessons as entry (entry.slug)}
					<li><a href="/blog/{entry.slug}">No. {entry.no}: {entry.title}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if p.devlog}
		<section class="section">
			<h2>Devlog</h2>
			{#if p.devlog.length > 0}
				<ol class="devlog">
					{#each p.devlog as log (log.date + log.text)}
						<li>
							<time class="caps" datetime={log.date}>{formatDate(log.date)}</time>
							<p>{log.text}</p>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="note">No entries yet. The first one lands with the first playable build.</p>
			{/if}
		</section>
	{/if}

	<p class="back"><a href="/projects">All projects and labs</a></p>
</main>

<style>
	.back {
		margin: 64px 0 0;
		padding-top: 16px;
		border-top: 1.5px solid var(--color-ink);
		font-size: 17px;
	}
	.proves {
		font-size: 17px;
		max-width: 68ch;
		margin: 0;
		text-wrap: pretty;
	}
	.note {
		font-size: 17px;
		max-width: 68ch;
		margin: 0 0 14px;
		text-wrap: pretty;
	}
	.codeblock + .note,
	.go + .note {
		margin: 12px 0 0;
	}
	.go {
		margin: 0;
	}

	.shot {
		margin: 24px 0 0;
	}
	.shot img {
		display: block;
		width: 100%;
		height: auto;
		border: 1.5px solid var(--color-ink);
	}
	.shot figcaption {
		margin-top: 8px;
		font-family: var(--font-family-sans);
		font-size: 13px;
	}

	.links {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 17px;
	}
	.links li {
		padding: 9px 0;
		border-top: 1px solid var(--color-ink);
	}
	.links li:first-child {
		border-top: 0;
		padding-top: 0;
	}

	/* How it runs: bordered nodes joined by an ink rule with an arrowhead */
	.chain {
		--gap: 30px;
		margin: 0 0 28px;
	}
	.chain figcaption {
		color: var(--color-spot-text);
		margin-bottom: 10px;
	}
	.chain ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: var(--gap);
	}
	.chain li {
		position: relative;
		flex: 1 1 0;
		min-width: 0;
		border: 1.5px solid var(--color-ink);
		padding: 12px 14px 14px;
	}
	.chain li b {
		display: block;
		font-size: 18px;
		line-height: 1.2;
		margin-bottom: 4px;
	}
	.chain li span {
		display: block;
		font-family: var(--font-family-sans);
		font-size: 13px;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}
	.chain li + li::before {
		content: '';
		position: absolute;
		right: 100%;
		top: 50%;
		width: var(--gap);
		border-top: 1.5px solid var(--color-ink);
		margin-top: -0.75px;
	}
	.chain li + li::after {
		content: '';
		position: absolute;
		right: 100%;
		top: 50%;
		margin-top: -5px;
		border: 5px solid transparent;
		border-left: 8px solid var(--color-ink);
		border-right: 0;
	}

	.hosting {
		margin: 0;
		border-top: 1px solid var(--color-ink);
	}
	.hosting div {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr);
		gap: 4px 24px;
		padding: 10px 0;
		border-bottom: 1px solid var(--color-ink);
	}
	.hosting dt {
		color: var(--color-spot-text);
		padding-top: 4px;
	}
	.hosting dd {
		margin: 0;
		font-size: 17px;
		max-width: 60ch;
		text-wrap: pretty;
	}

	.devlog {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.devlog li {
		padding: 12px 0;
		border-top: 1px solid var(--color-ink);
	}
	.devlog time {
		color: var(--color-spot-text);
	}
	.devlog p {
		margin: 4px 0 0;
		font-size: 17px;
		max-width: 68ch;
	}

	@media (max-width: 820px) {
		/* The chain turns to read top to bottom */
		.chain ol {
			flex-direction: column;
			gap: 22px;
		}
		.chain li + li::before {
			right: auto;
			left: 24px;
			top: auto;
			bottom: 100%;
			width: 0;
			height: 22px;
			margin: 0;
			border-top: 0;
			border-left: 1.5px solid var(--color-ink);
		}
		.chain li + li::after {
			right: auto;
			left: 19.75px;
			top: auto;
			bottom: 100%;
			margin: 0;
			border: 5px solid transparent;
			border-top: 8px solid var(--color-ink);
			border-bottom: 0;
		}
		.hosting div {
			grid-template-columns: 1fr;
		}
	}
</style>
