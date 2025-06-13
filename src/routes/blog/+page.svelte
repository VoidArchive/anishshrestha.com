<script lang="ts">
	import { formatDate } from '$lib/utils/blog';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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

<main class="container">
	<div class="mx-auto max-w-4xl py-8">
		<header class="border-border mb-12 border-b pb-8 text-center">
			<h1 class=" text-primary-red mb-4 text-4xl lg:text-4xl">Blog</h1>
			<p class="text-text-secondary text-lg">
				Technical deep-dives and thoughts on software engineering
			</p>
		</header>

		{#if data.posts.length > 0}
			<div class="flex flex-col gap-8">
				{#each data.posts as post}
					<a
						href="/blog/{post.slug}"
						class="bg-bg-secondary border-border hover:border-primary-red relative block overflow-hidden border p-6 no-underline transition-all duration-300 hover:-translate-y-0.5"
						style="box-shadow: 0 8px 15px -3px rgba(201, 42, 42, 0.1);"
					>
						<article>
							<div
								class="absolute top-0 right-0 left-0 h-0.5 opacity-50 transition-opacity duration-300 hover:opacity-80"
								style="background: linear-gradient(135deg, var(--color-primary-red) 0%, transparent 50%);"
							></div>

							<div class="mb-4 flex items-center justify-between">
								<time class="text-text-secondary font-mono text-sm">{formatDate(post.date)}</time>
								<div class="flex flex-wrap gap-2">
									{#each post.tags as tag}
										<span class="bg-bg-primary border-border border px-2 py-1 text-xs text-white"
											>{tag}</span
										>
									{/each}
								</div>
							</div>

							<h2 class="mb-3">
								<span
									class="text-text-primary hover:text-primary-red text-2xl font-semibold transition-colors duration-300"
									>{post.title}</span
								>
							</h2>

							<p class="text-text-secondary mb-4 leading-relaxed">{post.description}</p>
						</article>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-text-secondary py-8 text-center">
				<p>No blog posts found. Check back soon!</p>
			</div>
		{/if}
	</div>
</main>
