<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { BlogPost } from '$lib/utils/blog';
	import { Rss } from 'lucide-svelte';

	interface Props {
		posts: BlogPost[];
	}

	let { posts }: Props = $props();
</script>

<section class="section-card">
	<h2 class="section-title">
		<Rss size={20} class="text-primary inline" /> Latest Posts
	</h2>
	<div class="flex flex-col gap-6">
		{#if posts.length > 0}
			{#each posts as post (post.slug)}
				<a
					href="/blog/{post.slug}"
					class="post-card bg-bg-primary border-border hover:border-primary relative block overflow-hidden border p-4 no-underline transition-all duration-300"
				>
					<article>
						<div class="mb-2">
							<time class="text-text-muted font-mono text-xs">{formatDate(post.date)}</time>
						</div>
						<h3 class="mb-2">
							<span
								class="text-text hover:text-primary text-base font-semibold transition-colors duration-300"
								>{post.title}</span
							>
						</h3>
						<p class="text-text-muted mb-3 line-clamp-2 text-sm leading-relaxed">
							{post.description}
						</p>
						<div class="flex flex-wrap gap-1">
							{#each post.tags.slice(0, 3) as tag (tag)}
								<span class="bg-bg-secondary border-border border px-1.5 py-0.5 text-xs text-white"
									>{tag}</span
								>
							{/each}
						</div>
					</article>
				</a>
			{/each}
		{:else}
			<div class="placeholder-box">
				<span>Blog posts coming soon...</span>
			</div>
		{/if}
	</div>
</section>

<style>
	.post-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
		pointer-events: none;
		z-index: 1;
	}

	.post-card:hover::before {
		left: 100%;
	}

	.post-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -3px rgba(201, 42, 42, 0.15);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
