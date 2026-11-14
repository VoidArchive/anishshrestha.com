<!-- The one place a page's title, meta description and canonical are emitted. Use exactly once per page. -->
<script lang="ts">
	import { page } from '$app/state';
	import { SITE } from '#lib/site.js';

	let {
		title,
		description,
		type = 'website'
	}: { title: string; description: string; type?: 'website' | 'article' } = $props();

	const url = $derived(SITE + (page.url.pathname.replace(/\/$/, '') || '/'));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>
