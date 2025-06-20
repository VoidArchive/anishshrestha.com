<script lang="ts">
	import TwoColumnShell from '$lib/layouts/TwoColumnShell.svelte';
	import { formatDate } from '$lib/utils/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Removed unused tags variable
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

<main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<TwoColumnShell>
		<svelte:fragment slot="left">
			<section class="section-card">
				<h3 class="section-title text-lg">Blog</h3>
				<p class="text-text-muted text-sm leading-relaxed">
					Technical writings about software development, programming challenges, and insights from
					building distributed systems. Sharing my journey through code, algorithms, and
					architectural decisions.
				</p>
			</section>
		</svelte:fragment>

		<div class="mx-auto max-w-4xl">
			{#if data.posts.length > 0}
				<div class="blog-posts-container">
					{#each data.posts as post (post.slug)}
						<a href="/blog/{post.slug}" class="blog-card section-card">
							<article class="blog-content">
								<div class="blog-header">
									<h2 class="blog-title">{post.title}</h2>
									<time class="blog-date">{formatDate(post.date)}</time>
								</div>

								<p class="blog-description">{post.description}</p>

								<div class="blog-footer">
									<div class="blog-tags">
										{#each post.tags as tag (tag)}
											<span class="blog-tag">{tag}</span>
										{/each}
										{#if post.relatedLab}
											<span class="blog-tag interactive-tag">Interactive</span>
										{/if}
									</div>

									{#if post.relatedLab}
										<p class="lab-preview">
											Try live demo: <strong>{post.relatedLab.name}</strong>
										</p>
									{/if}
								</div>
							</article>
						</a>
					{/each}
				</div>
			{:else}
				<div class="text-text-muted py-8 text-center">
					<p>No blog posts found. Check back soon!</p>
				</div>
			{/if}
		</div>
	</TwoColumnShell>
</main>

<style>
	.blog-posts-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.blog-card {
		display: block;
		text-decoration: none;
		color: inherit;
		margin-bottom: 0;
		transition: all 0.3s ease;
	}

	.blog-card:hover {
		transform: translateY(-2px);
	}

	.blog-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		height: 100%;
	}

	.blog-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.blog-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.3;
		transition: color 0.3s ease;
	}

	.blog-card:hover .blog-title {
		color: var(--color-primary);
	}

	.blog-date {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.4;
	}

	.blog-description {
		color: var(--color-text-muted);
		margin: 0;
		line-height: 1.6;
		font-size: 1rem;
		flex-grow: 1;
	}

	.blog-footer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: auto;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.blog-tag {
		background-color: var(--color-bg-primary);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		line-height: 1;
		margin: 0;
		font-family: var(--font-mono);
		transition: all 0.2s ease;
	}

	.interactive-tag {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		font-weight: 600;
	}

	.lab-preview {
		color: var(--color-text-muted);
		margin: 0;
		font-size: 0.875rem;
		font-style: italic;
	}

	.lab-preview strong {
		color: var(--color-text-primary);
		font-weight: 600;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.blog-title {
			font-size: 1.25rem;
		}

		.blog-description {
			font-size: 0.95rem;
		}
	}
</style>
