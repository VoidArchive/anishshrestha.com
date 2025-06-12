<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog - Software Engineering Insights from Nepal | Anish Shrestha</title>
	<meta name="description" content="Technical blog by Anish Shrestha, Go and Python developer from Kathmandu, Nepal. Deep-dives into software engineering, distributed systems, and web development." />
	<meta name="keywords" content="Nepal tech blog, software engineering Nepal, Go programming blog, Python development, distributed systems, Kathmandu developer blog" />
	<meta property="og:title" content="Blog - Software Engineering Insights from Nepal" />
	<meta property="og:description" content="Technical blog by Anish Shrestha, Go and Python developer from Kathmandu, Nepal. Deep-dives into software engineering." />
	<meta property="og:url" content="https://anishshrestha.com/blog" />
</svelte:head>

<main class="container">
	<div class="py-8 max-w-4xl mx-auto">
		<header class="text-center mb-12 pb-8 border-b border-border">
			<h1 class=" text-primary-red text-4xl lg:text-4xl mb-4">Blog</h1>
			<p class="text-text-secondary text-lg">Technical deep-dives and thoughts on software engineering</p>
		</header>

		{#if data.posts.length > 0}
			<div class="flex flex-col gap-8">
				{#each data.posts as post}
					<a href="/blog/{post.slug}" class="block bg-bg-secondary border border-border p-6 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:border-primary-red no-underline" style="box-shadow: 0 8px 15px -3px rgba(201, 42, 42, 0.1);">
						<article>
							<div class="absolute top-0 left-0 right-0 h-0.5 opacity-50 transition-opacity duration-300 hover:opacity-80" style="background: linear-gradient(135deg, var(--color-primary-red) 0%, transparent 50%);"></div>
							
							<div class="flex justify-between items-center mb-4">
								<time class="text-text-secondary text-sm font-mono">{formatDate(post.date)}</time>
								<div class="flex gap-2 flex-wrap">
									{#each post.tags as tag}
										<span class="bg-bg-primary text-white text-xs px-2 py-1 border border-border">{tag}</span>
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