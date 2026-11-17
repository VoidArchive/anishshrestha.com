<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { formatDate } from '#lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Blog | Anish Shrestha"
	description="Anish Shrestha on system design, Go libraries for Nepal's payment and stock systems, how the labs were built, and what went wrong."
/>

<main class="page container">
	<h1 class="page-title">Blog</h1>
	<p class="dek">
		How I built things and what broke: Go libraries, system design entries, the engines behind the
		labs, and the parts that were brute force.
	</p>

	{#if data.posts.length > 0}
		<ol class="ruled">
			{#each data.posts as post (post.slug)}
				<li>
					<h2><a href="/blog/{post.slug}">{post.title}</a></h2>
					<p>{post.description}</p>
					<p class="meta">
						<time class="tag" datetime={post.date}>{formatDate(post.date)}</time>
						{#if post.series === 'system-design'}<a class="tag" href="/system-design"
								>System design</a
							>{/if}
						{#if post.relatedLab}<a class="tag" href={post.relatedLab.url}>Has a live lab</a>{/if}
						{#each post.tags as tag (tag)}<span class="tag">{tag}</span>{/each}
					</p>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="dek">No posts yet.</p>
	{/if}
</main>

<style>
	.ruled .meta {
		margin: 0;
	}
	/* A hyphenated tag never breaks across lines */
	.tag {
		display: inline-block;
		white-space: nowrap;
		margin-right: 0.35em;
	}
	/* The dot trails its item, so a wrapped line never starts with one */
	.tag:not(:last-child)::after {
		content: ' ·';
		color: var(--color-spot-text);
	}
</style>
