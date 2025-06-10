<script lang="ts">
	import { formatDate } from '$lib/utils/blog.js';
	import type { BlogPost } from '$lib/utils/blog.js';
	import { Zap } from 'lucide-svelte';

	interface Props {
		posts: BlogPost[];
	}

	let { posts }: Props = $props();
</script>

<section class="section-card">
	<h2 class="section-title">
		<Zap size={20} class="inline" /> Latest Posts
	</h2>
	<div class="flex flex-col gap-6">
		{#if posts.length > 0}
			{#each posts as post}
				<a href="/blog/{post.slug}" class="block bg-bg-primary border border-border rounded p-4 transition-all duration-300 hover:border-primary-red no-underline">
					<article>
						<div class="mb-2">
							<time class="text-text-secondary text-xs font-mono">{formatDate(post.date)}</time>
						</div>
						<h3 class="mb-2">
							<span class="text-text-primary text-base font-semibold transition-colors duration-300 hover:text-primary-red">{post.title}</span>
						</h3>
						<p class="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-2">{post.description}</p>
						<div class="flex gap-1 flex-wrap">
							{#each post.tags.slice(0, 3) as tag}
								<span class="bg-bg-secondary text-white text-xs px-1.5 py-0.5 rounded-sm border border-border">#{tag}</span>
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
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style> 