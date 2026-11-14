<script lang="ts">
	import { page } from '$app/state';

	const links = [
		// Labs live under Projects, so a lab page lights the Projects tab
		{ href: '/projects', label: 'Projects', also: '/labs' },
		{ href: '/system-design', label: 'System Design' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' }
	];
	const current = (link: (typeof links)[number]) =>
		page.url.pathname.startsWith(link.href) ||
		(link.also !== undefined && page.url.pathname.startsWith(link.also));
</script>

<header class="running-head">
	<div class="container">
		<a class="masthead" href="/"><span class="bird" aria-hidden="true"></span>anishshrestha.com</a>
		<nav aria-label="Primary">
			{#each links as link (link.href)}
				<a href={link.href} aria-current={current(link) ? 'page' : undefined}>{link.label}</a>
			{/each}
		</nav>
	</div>
</header>

<style>
	.running-head {
		padding-top: 28px;
	}
	.running-head .container {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0 24px;
		font-family: var(--font-family-sans);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		line-height: 1.5;
	}
	/* The rule sits on the container's content box so it lines up with the page margin */
	.running-head .container::after {
		content: '';
		flex-basis: 100%;
		border-bottom: 1.5px solid var(--color-ink);
	}
	.running-head a {
		display: inline-block;
		padding: 10px 0;
		text-decoration: none;
		white-space: nowrap;
	}
	.masthead {
		color: var(--color-spot-text);
		font-weight: 700;
	}
	/* The bird is a mask so it takes the spot ink in both themes */
	.bird {
		display: inline-block;
		width: 14px;
		height: 26px;
		margin: -10px 8px -6px 0;
		vertical-align: middle;
		background: currentColor;
		mask: url('/bird-logo.svg') center / contain no-repeat;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 28px;
	}
	nav a[aria-current='page'] {
		color: var(--color-spot-text);
		box-shadow: inset 0 -3px 0 var(--color-spot);
	}
	@media (max-width: 640px) {
		.running-head {
			padding-top: 12px;
		}
		.running-head .container {
			letter-spacing: 0.08em;
		}
		nav {
			gap: 0 16px;
		}
	}
</style>
