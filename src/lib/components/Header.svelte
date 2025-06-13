<script lang="ts">
	import { page } from '$app/state';

	// With $app/state, page is already reactive
	// Access page.url.pathname directly in the template
</script>

<header class="border-border border-b py-4">
	<div class="container">
		<div class="flex flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
			<div class="text-text-primary text-2xl font-bold">
				<a href="/">Anish</a>
			</div>
			<nav class="flex flex-wrap items-center justify-center gap-2">
				<a href="/games" class="nav-link {page.url.pathname.startsWith('/games') ? 'active' : ''}"
					>Games</a
				>
				<span class="text-text-secondary mx-1">/</span>
				<a href="/blog" class="nav-link {page.url.pathname.startsWith('/blog') ? 'active' : ''}"
					>Blog</a
				>
				<span class="text-text-secondary mx-1">/</span>
				<a href="/projects" class="nav-link {page.url.pathname === '/projects' ? 'active' : ''}"
					>Projects</a
				>
			</nav>
		</div>
	</div>
</header>

<style>
	.nav-link {
		color: #f8f8f8;
		transition: color 0.3s ease;
		font-size: 1rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		text-decoration: none;
	}

	.nav-link:hover {
		color: #c92a2a;
	}

	.nav-link.active {
		background-color: #c92a2a;
		color: #f8f8f8;
		padding: 0.25rem 0.5rem;
		border-radius: 0;
	}

	.nav-link:focus {
		outline: none;
	}
</style>
