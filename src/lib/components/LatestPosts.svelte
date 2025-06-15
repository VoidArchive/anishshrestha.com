<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { BlogPost } from '$lib/utils/blog';
	import { Rss, ArrowRight } from 'lucide-svelte';

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
			{#each posts as post}
				<a
					href="/blog/{post.slug}"
					class="bg-bg-primary border-border hover:border-primary block border p-4 no-underline transition-all duration-300"
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
							{#each post.tags.slice(0, 3) as tag}
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

	<a href="/blog" class="btn mt-4 ml-auto flex w-max items-center gap-1">
		<span>View all posts</span>
		<ArrowRight size={14} />
	</a>
</section>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
