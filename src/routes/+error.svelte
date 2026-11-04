<script lang="ts">
	import { page } from '$app/state';

	const titles: Record<number, string> = {
		404: 'Page not found',
		403: 'Access forbidden',
		500: 'Server error'
	};
	let status = $derived(page.status);
	let title = $derived(titles[status] ?? 'Something went wrong');
	let message = $derived(
		status === 404
			? 'There is nothing at this address. Check the URL, or start again from the front page.'
			: (page.error?.message ?? 'An unexpected error occurred. Reloading the page may help.')
	);

	function goBack() {
		if (window.history.length > 1) window.history.back();
		else window.location.href = '/';
	}
</script>

<svelte:head>
	<title>{status} – {title} | anishshrestha.com</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="page container">
	<p class="numeral status" aria-hidden="true">{status}</p>
	<h1 class="page-title">{title}</h1>
	<p class="dek">{message}</p>
	<p class="actions">
		<a class="btn" href="/">Front page</a>
		<button class="btn-secondary" type="button" onclick={goBack}>Go back</button>
	</p>
	<p class="meta">
		<a href="mailto:hi@anishshrestha.com?subject=Error%20{status}%20at%20{page.url.pathname}"
			>Report this</a
		>
	</p>
</main>

<style>
	.status {
		font-size: clamp(96px, 16vw, 200px);
		margin: 0 0 8px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin: 0 0 24px;
	}
</style>
