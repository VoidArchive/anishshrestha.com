<script lang="ts">
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	import { formatDate } from '$lib/utils/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Collect unique tags for sidebar display
	const tags: string[] = Array.from(new Set(data.posts.flatMap((p) => p.tags)));
</script>

<svelte:head>
	<title>Blog - Software Engineering Insights from Nepal | Anish Shrestha</title>
	<meta
		name="description"
		content="Technical blog by Anish Shrestha, Go and Python developer from Kathmandu, Nepal. Deep-dives into software engineering, distributed systems, and web development."
	/>
	<meta
		name="keywords"
		content="Nepal tech blog, software engineering Nepal, Go programming blog, Python development, distributed systems, Kathmandu developer blog"
	/>
	<meta property="og:title" content="Blog - Software Engineering Insights from Nepal" />
	<meta
		property="og:description"
		content="Technical blog by Anish Shrestha, Go and Python developer from Kathmandu, Nepal. Deep-dives into software engineering."
	/>
	<meta property="og:url" content="https://anishshrestha.com/blog" />
</svelte:head>

<main class="container py-8">
	<TwoColumnShell leftGap="gap-2">
		<svelte:fragment slot="left">
			<section class="section-card p-4">
				<h3 class="section-title mb-4 text-lg">Tags</h3>
				<div class="flex flex-wrap gap-2">
					{#each tags as tag}
						<span class="badge cursor-pointer select-none">{tag}/</span>
					{/each}
				</div>
			</section>
		</svelte:fragment>

		<div class="mx-auto max-w-4xl">
			

			{#if data.posts.length > 0}
				<div class="blog-posts-container">
					{#each data.posts as post}
						<a href="/blog/{post.slug}" class="blog-card">
							<article class="blog-content">
								<div class="blog-meta">
									<time class="blog-date">{formatDate(post.date)}</time>
									<div class="blog-tags">
										{#each post.tags as tag}
											<span class="blog-tag">{tag}</span>
										{/each}
									</div>
								</div>
								
								<!-- Decorative separator removed to prevent layout shift -->

								<h2 class="blog-title-text">{post.title}</h2>
								<p class="blog-description">{post.description}</p>
							</article>
						</a>
					{/each}
				</div>
			{:else}
						<div class="py-8 text-center text-text-muted">
				<p>No blog posts found. Check back soon!</p>
			</div>
			{/if}
		</div>
	</TwoColumnShell>
</main>

<style>
	/* Reset all potential conflicts */
	.blog-posts-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.blog-card {
		display: block;
		text-decoration: none;
		color: inherit;
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		padding: 1rem;
		transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
		will-change: box-shadow, border-color;
		position: relative;
	}

	@media (min-width: 768px) {
		.blog-card {
			padding: 1.25rem;
		}
	}

	.blog-card:hover {
		border-color: var(--color-primary);
		box-shadow: 0 8px 15px -3px rgba(201, 42, 42, 0.1);
	}

	.blog-content {
		/* Lock in spacing to prevent shifts */
		display: block;
		margin: 0;
		padding: 0;
	}

	.blog-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.blog-date {
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.4;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.blog-tag {
		background-color: var(--color-bg-primary);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		line-height: 1;
		margin: 0;
	}

	.blog-title-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem 0;
		line-height: 1.3;
		transition: color 0.3s ease;
	}

	@media (min-width: 768px) {
		.blog-title-text {
			font-size: 1.5rem;
		}
	}

	.blog-description {
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.5;
		font-size: 0.95rem;
	}
</style>
