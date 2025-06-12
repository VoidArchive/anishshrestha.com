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
				<a href="/blog" class="back-to-blog">← Back to all posts</a>
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
		border-bottom: 1px solid var(--border-color);
	}

	.breadcrumb {
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.breadcrumb a {
		color: var(--text-secondary);
		transition: color 0.3s ease;
	}

	.breadcrumb a:hover {
		color: var(--primary-red);
	}

	.separator {
		margin: 0 0.5rem;
		color: var(--border-color);
	}

	.current {
		color: var(--primary-red);
	}

	.post-title {
		color: #c92a2a;
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 1.5rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.post-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.post-date {
		color: var(--text-secondary);
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
	}

	.post-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tag {
		background-color: var(--bg-secondary);
		color: #f8f8f8;
		font-size: 0.8rem;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--border-color);
	}

	.post-content {
		line-height: 1.8;
		color: #f8f8f8;
		font-family: 'Fira Code', monospace;
	}

	/* Global markdown styles for the post content */
	:global(.post-content h1) {
		color: #c92a2a;
		font-size: 2rem;
		font-weight: 700;
		margin: 2.5rem 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #333333;
		font-family: system-ui, -apple-system, sans-serif;
	}

	:global(.post-content h2) {
		color: #c92a2a;
		font-size: 1.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	:global(.post-content h3) {
		color: #c92a2a;
		font-size: 1.25rem;
		font-weight: 500;
		margin: 1.5rem 0 0.75rem 0;
		font-family: system-ui, -apple-system, sans-serif;
	}

	:global(.post-content p) {
		margin-bottom: 1.5rem;
		color: #f8f8f8;
	}

	:global(.post-content ul, .post-content ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	:global(.post-content li) {
		margin-bottom: 0.5rem;
		color: #f8f8f8;
	}

	:global(.post-content code) {
		background-color: var(--bg-secondary);
		color: var(--primary-red);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		border: 1px solid var(--border-color);
	}

	:global(.post-content pre) {
		background-color: var(--bg-secondary);
		border: 1px solid rgba(248, 248, 248, 0.2);
		border-radius: 6px;
		padding: 1.5rem;
		margin: 1.5rem 0;
		overflow-x: auto;
		font-family: 'Fira Code', monospace;
		font-size: 0.9rem;
		line-height: 1.5;
		position: relative;
		padding-top: 3rem;
	}

	:global(.post-content pre code) {
		background: none;
		border: none;
		padding: 0;
		color: var(--text-primary);
	}

	:global(.post-content blockquote) {
		border-left: 4px solid var(--primary-red);
		background-color: var(--bg-secondary);
		padding: 1rem 1.5rem;
		margin: 1.5rem 0;
		border-radius: 0 6px 6px 0;
	}

	:global(.post-content blockquote p) {
		margin-bottom: 0;
		color: var(--text-secondary);
		font-style: italic;
	}

	:global(.post-content strong) {
		color: #f8f8f8;
		font-weight: 600;
	}

	:global(.post-content hr) {
		border: none;
		border-top: 1px solid var(--border-color);
		margin: 3rem 0;
	}

	.post-footer {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border-color);
	}

	.post-nav {
		display: flex;
		justify-content: center;
	}

	.back-to-blog {
		color: var(--primary-red);
		font-weight: 500;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--primary-red);
		border-radius: 4px;
		transition: var(--transition-smooth);
	}

	.back-to-blog:hover {
		background-color: var(--primary-red);
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.blog-post {
			padding: 1rem 0;
		}

		.post-title {
			font-size: 2rem;
		}

		.post-meta {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		:global(.post-content h1) {
			font-size: 1.75rem;
		}

		:global(.post-content h2) {
			font-size: 1.375rem;
		}

		:global(.post-content pre) {
			font-size: 0.8rem;
		}
	}
</style> 