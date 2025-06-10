<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { formatDate } from '$lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Header />

<main class="container">
	<div class="py-8 max-w-4xl mx-auto">
		<header class="text-center mb-12 pb-8 border-b border-border">
			<h1 class="text-primary-red text-4xl lg:text-5xl font-bold mb-2">Blog</h1>
			<p class="text-text-secondary text-lg">Technical deep-dives and thoughts on software engineering</p>
		</header>

		{#if data.posts.length > 0}
			<div class="flex flex-col gap-8">
				{#each data.posts as post}
					<a href="/blog/{post.slug}" class="block bg-bg-secondary border border-border rounded-md p-6 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:border-primary-red no-underline" style="box-shadow: 0 8px 15px -3px rgba(201, 42, 42, 0.1);">
						<article>
							<div class="absolute top-0 left-0 right-0 h-0.5 opacity-50 transition-opacity duration-300 hover:opacity-80" style="background: linear-gradient(135deg, var(--color-primary-red) 0%, transparent 50%);"></div>
							
							<div class="flex justify-between items-center mb-4">
								<time class="text-text-secondary text-sm font-mono">{formatDate(post.date)}</time>
								<div class="flex gap-2 flex-wrap">
									{#each post.tags as tag}
										<span class="bg-bg-primary text-white text-xs px-2 py-1 rounded border border-border">#{tag}</span>
									{/each}
								</div>
							</div>
							
							<h2 class="mb-3">
								<span class="text-text-primary text-2xl font-semibold transition-colors duration-300 hover:text-primary-red">{post.title}</span>
							</h2>
							
							<p class="text-text-secondary leading-relaxed mb-4">{post.description}</p>
						</article>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8 text-text-secondary">
				<p>No blog posts found. Check back soon!</p>
			</div>
		{/if}
	</div>
</main> 