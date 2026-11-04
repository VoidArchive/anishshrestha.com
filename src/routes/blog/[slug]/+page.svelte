<script lang="ts">
	import { formatDate } from '#lib/utils/blog.js';
	import LiveDemoCallout from '#lib/components/LiveDemoCallout.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} – Anish Shrestha</title>
	<meta name="description" content={post.description} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:type" content="article" />
</svelte:head>

<main class="page container">
	<article class="post">
		<header>
			<h1 class="page-title">{post.title}</h1>
			<p class="dek">{post.description}</p>
			<p class="meta stamp">
				<time datetime={post.date}>{formatDate(post.date)}</time> · {post.tags.join(' · ')}
			</p>
		</header>

		{#if post.relatedLab}
			<LiveDemoCallout
				labName={post.relatedLab.name}
				labUrl={post.relatedLab.url}
				labDescription={post.relatedLab.description}
			/>
		{/if}

		<div class="prose">
			{@render (post.content as import('svelte').Snippet)()}
		</div>

		{#if post.relatedLab}
			<LiveDemoCallout
				labName={post.relatedLab.name}
				labUrl={post.relatedLab.url}
				labDescription={post.relatedLab.description}
				variant="minimal"
			/>
		{/if}

		<footer class="post-foot">
			<a class="btn" href="/blog">All notes</a>
		</footer>
	</article>
</main>

<style>
	.stamp {
		border-top: 1px solid var(--color-ink);
		padding-top: 8px;
		margin-bottom: 36px;
	}

	.prose {
		font-size: 17px;
		line-height: 1.6;
		text-wrap: pretty;
	}
	.prose :global(p) {
		margin: 0 0 1.2em;
	}
	.prose :global(h1),
	.prose :global(h2) {
		font-size: 26px;
		font-weight: 600;
		line-height: 1.2;
		margin: 2.4em 0 0.6em;
		padding-top: 0.6em;
		border-top: 1px solid var(--color-ink);
		text-wrap: balance;
	}
	.prose :global(h3) {
		font-size: 20px;
		font-weight: 600;
		line-height: 1.25;
		margin: 1.8em 0 0.5em;
	}
	.prose :global(h4) {
		font-family: var(--font-family-sans);
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-spot);
		margin: 1.6em 0 0.4em;
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1.2em;
		padding-left: 1.4em;
	}
	.prose :global(li) {
		margin-bottom: 0.4em;
	}
	.prose :global(li::marker) {
		color: var(--color-spot);
	}
	.prose :global(code) {
		font-family: var(--font-family-mono);
		font-size: 0.85em;
		background: var(--color-tint);
		padding: 0.1em 0.35em;
	}
	.prose :global(pre) {
		position: relative;
		margin: 1.5em 0;
		padding: 1.25rem;
		border: 1px solid var(--color-ink);
		background: var(--color-paper);
		font-family: var(--font-family-mono);
		font-size: 14px;
		line-height: 1.55;
		overflow-x: auto;
	}
	.prose :global(pre code) {
		background: none;
		padding: 0;
		font-size: inherit;
	}
	.prose :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		border: 1px solid var(--color-ink);
		margin: 1.5em 0;
	}
	.prose :global(hr) {
		border: 0;
		border-top: 1.5px solid var(--color-ink);
		margin: 3em 0;
	}
	.prose :global(blockquote p) {
		margin: 0;
	}

	.post-foot {
		margin-top: 56px;
		padding-top: 20px;
		border-top: 1.5px solid var(--color-ink);
	}

	@media (max-width: 640px) {
		.prose {
			font-size: 16px;
		}
		.prose :global(pre) {
			font-size: 13px;
			padding: 1rem;
		}
	}
</style>
