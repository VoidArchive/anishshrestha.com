<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { post } = data;
</script>

<svelte:head>
	<title>{post.title} - Anish Shrestha</title>
	<meta name="description" content={post.description} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:type" content="article" />
</svelte:head>

<main class="container">
	<article class="blog-post">
		<header class="post-header">
			<nav class="breadcrumb">
				<a href="/">Home</a>
				<span class="separator">/</span>
				<a href="/blog">Blog</a>
				<span class="separator">/</span>
				<span class="current">{post.title}</span>
			</nav>

			<h1 class="post-title">{post.title}</h1>

			<div class="post-meta">
				<time class="post-date">{formatDate(post.date)}</time>
				<div class="post-tags">
					{#each post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</div>
		</header>

		<div class="post-content">
			{@render post.content()}
		</div>

		<footer class="post-footer">
			<nav class="post-nav">
				<a href="/blog" class="btn">← Back to all posts</a>
			</nav>
		</footer>
	</article>
</main>

<style>
	.blog-post {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 0;
	}

	.post-header {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border);
	}

	.breadcrumb {
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.breadcrumb a {
		color: var(--color-text-secondary);
		transition: color 0.3s ease;
	}

	.breadcrumb a:hover {
		color: var(--color-primary-red);
	}

	.separator {
		margin: 0 0.5rem;
		color: var(--color-border);
	}

	.current {
		color: var(--color-primary-red);
	}

	.post-title {
		color: var(--color-text-secondary);
		font-size: 1.8rem;
		font-weight: 700;
		line-height: 1;
		margin-bottom: 1.5rem;
		font-family: var(--font-family-mono);
	}

	.post-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.post-date {
		color: var(--color-text-secondary);
		font-family: var(--font-family-mono);
		font-size: 0.9rem;
	}

	.post-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		background-color: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--color-border);
	}

	.post-content {
		line-height: 1.8;
		color: var(--color-text-secondary);
		font-family: var(--font-family-mono);
	}

	/* Markdown styles within post-content only */
	.post-content :global(h1),
	.post-content :global(h2),
	.post-content :global(h3) {
		color: var(--color-text-secondary);
		font-size: 1rem;
		font-weight: 700;
		margin: 2.5rem 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-border);
		font-family: var(--font-family-mono);
	}

	.post-content :global(p) {
		margin-bottom: 1.5rem;
		color: var(--color-text-secondary);
	}

	.post-content :global(ul),
	.post-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	.post-content :global(li) {
		margin-bottom: 0.5rem;
		color: var(--color-text-secondary);
		transition: color 0.3s ease;
	}

	/* Bullet / number marker colour */
	.post-content :global(li)::marker {
		color: var(--color-text-secondary);
	}

	.post-content :global(code) {
		background-color: var(--color-bg-secondary);
		color: var(--color-text-primary);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: var(--font-family-mono);
		font-size: 0.9rem;
		border: 1px solid var(--color-border);
	}

	.post-content :global(pre) {
		background-color: var(--color-bg-primary);
		border: 1px solid rgba(248, 248, 248, 0.2);
		border-radius: 6px;
		padding: 1.5rem;
		margin: 1.5rem 0;
		overflow-x: auto;
		font-family: var(--font-family-mono);
		font-size: 0.9rem;
		line-height: 1.5;
		position: relative;
		padding-top: 3rem;
	}

	.post-content :global(pre code) {
		background: none;
		border: none;
		padding: 0;
		color: var(--color-text-secondary);
	}

	.post-content :global(blockquote) {
		border-left: 4px solid var(--color-primary-red);
		background-color: var(--color-bg-secondary);
		padding: 1rem 1.5rem;
		margin: 1.5rem 0;
		border-radius: 0 6px 6px 0;
	}

	.post-content :global(blockquote p) {
		margin-bottom: 0;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.post-content :global(strong) {
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.post-content :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 3rem 0;
	}

	.post-footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
	}

	.post-nav {
		display: flex;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.blog-post {
			padding: 1rem 0;
		}

		.post-title {
			font-size: 1.5rem;
		}

		.post-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.post-content :global(h1) {
			font-size: 1.75rem;
		}

		.post-content :global(h2) {
			font-size: 1.375rem;
		}

		.post-content :global(pre) {
			font-size: 0.8rem;
		}
	}
</style>
