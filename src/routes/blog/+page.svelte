<script lang="ts">
	import { formatDate } from '#lib/utils/blog.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Notes – Blog | Anish Shrestha</title>
	<meta
		name="description"
		content="Technical notes by Anish Shrestha: how the labs were built, Go libraries for Nepal's payment and stock systems, and what went wrong along the way."
	/>
	<meta property="og:title" content="Notes – Blog | Anish Shrestha" />
	<meta property="og:url" content="https://anishshrestha.com/blog" />
</svelte:head>

<main class="page container">
	<h1 class="page-title">Notes</h1>
	<p class="dek">
		The written half of each experiment: engines, opening books, spatial hashes, payment signatures,
		and the parts that were brute force.
	</p>

	{#if data.posts.length > 0}
		<ol class="ruled">
			{#each data.posts as post (post.slug)}
				<li>
					<p class="meta">
						<time datetime={post.date}>{formatDate(post.date)}</time>
						{#if post.relatedLab}· <a href={post.relatedLab.url}>Has a live lab</a>{/if}
					</p>
					<h2><a href="/blog/{post.slug}">{post.title}</a></h2>
					<p>{post.description}</p>
					<p class="meta tags">{post.tags.join(' · ')}</p>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="dek">No notes yet.</p>
	{/if}
</main>

<style>
	.tags {
		color: var(--color-ink-muted);
		font-weight: 400;
		margin: 0;
	}
</style>
