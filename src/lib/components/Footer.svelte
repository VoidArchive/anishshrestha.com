<script lang="ts">
	import { onMount } from 'svelte';
	const currentYear = new Date().getFullYear();

	// Theme toggle: app.html has already set data-theme; this mirrors and changes it
	let dark = $state(false);
	onMount(() => {
		dark = document.documentElement.dataset.theme === 'dark';
	});
	function toggleTheme() {
		dark = !dark;
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// private mode: the choice lasts for this page only
		}
	}
</script>

<footer class="colophon-foot">
	<div class="container">
		<p>&copy; {currentYear} Anish Shrestha</p>
		<p>
			<button class="theme" type="button" aria-pressed={dark} onclick={toggleTheme}
				>Dark mode</button
			>
		</p>
		<p>
			<a class="github" href="https://github.com/VoidArchive" rel="me">VoidArchive on GitHub</a>
		</p>
	</div>
</footer>

<style>
	.colophon-foot {
		margin-top: 72px;
	}
	.colophon-foot .container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0 24px;
		padding-bottom: 40px;
		font-family: var(--font-family-sans);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	/* The rule sits on the content box, like the running head's */
	.colophon-foot .container::before {
		content: '';
		flex-basis: 100%;
		border-top: 1.5px solid var(--color-ink);
		margin-bottom: 6px;
	}
	.colophon-foot p {
		margin: 0;
		padding: 4px 0;
	}
	.github {
		text-decoration: none;
	}
	.github:hover {
		color: var(--color-spot-text);
	}
	.theme {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: inherit;
		background: none;
		border: 0;
		padding: 4px 0;
		cursor: pointer;
	}
	/* An 8px square, filled when dark mode is on: the same state marker the reading rows use */
	.theme::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-right: 8px;
		border: 1.5px solid currentColor;
		box-sizing: border-box;
	}
	.theme[aria-pressed='true']::before {
		background: currentColor;
	}
	.theme:hover {
		color: var(--color-spot-text);
	}
</style>
