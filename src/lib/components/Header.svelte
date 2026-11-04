<script lang="ts">
	import { page } from '$app/state';

	const issue = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
	const links = [
		{ href: '/labs', label: 'Labs' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/projects', label: 'Projects' }
	];
	const current = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="running-head">
	<div class="container">
		<a class="masthead" href="/">
			<b>anishshrestha.com</b>
			{#if page.data.postCount}· No. {page.data.postCount}{/if}
			· {issue}
		</a>
		<nav aria-label="Primary">
			{#each links as link (link.href)}
				<a href={link.href} aria-current={current(link.href) ? 'page' : undefined}>{link.label}</a>
			{/each}
			<a href="https://github.com/VoidArchive" rel="me">GitHub</a>
		</nav>
	</div>
</header>

<style>
	.running-head {
		padding-top: 36px;
	}
	.running-head .container {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px 16px;
		border-bottom: 1.5px solid var(--color-ink);
		padding-bottom: 10px;
		font-family: var(--font-family-sans);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		line-height: 1.5;
	}
	.running-head a {
		display: inline-block;
		padding: 4px 0;
		text-decoration: none;
		white-space: nowrap;
	}
	.masthead b {
		color: var(--color-spot);
		font-weight: 700;
	}
	nav {
		display: flex;
		gap: 28px;
	}
	nav a[aria-current='page'] {
		color: var(--color-spot);
		border-bottom: 2px solid var(--color-spot);
	}
	@media (max-width: 640px) {
		.running-head {
			padding-top: 20px;
		}
		nav {
			gap: 18px;
		}
	}
</style>
