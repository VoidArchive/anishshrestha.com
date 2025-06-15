<script lang="ts">
	import { page } from '$app/state';

	let isMenuOpen = false;

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};

	const closeMenu = () => {
		isMenuOpen = false;
	};
</script>

<header class="border-border border-b py-4">
	<div class="container">
		<div class="flex items-center justify-between">
			<div class="text-text text-xl font-bold md:text-2xl">
				<a href="/" on:click={closeMenu}>Anish</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-2 md:flex">
				<a href="/games" class="nav-link {page.url.pathname.startsWith('/games') ? 'active' : ''}"
					>Games</a
				>
				<span class="text-text-muted mx-1">/</span>
				<a href="/blog" class="nav-link {page.url.pathname.startsWith('/blog') ? 'active' : ''}"
					>Blog</a
				>
				<span class="text-text-muted mx-1">/</span>
				<a href="/projects" class="nav-link {page.url.pathname === '/projects' ? 'active' : ''}"
					>Projects</a
				>
			</nav>

			<!-- Mobile Menu Button -->
			<button
				class="btn md:hidden"
				on:click={toggleMenu}
				aria-label="Toggle menu"
				aria-expanded={isMenuOpen}
			>
				<svg
					class="hamburger-icon {isMenuOpen ? 'open' : ''}"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						class="line line1"
						d="M3 6h18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						class="line line2"
						d="M3 12h18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						class="line line3"
						d="M3 18h18"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>

		<!-- Mobile Navigation -->
		<nav class="mobile-nav {isMenuOpen ? 'open' : ''} md:hidden">
			<div class="mobile-nav-content">
				<a
					href="/games"
					class="btn {page.url.pathname.startsWith('/games') ? 'active' : ''}"
					on:click={closeMenu}
				>
					Games
				</a>
				<a
					href="/blog"
					class="btn {page.url.pathname.startsWith('/blog') ? 'active' : ''}"
					on:click={closeMenu}
				>
					Blog
				</a>
				<a
					href="/projects"
					class=" btn {page.url.pathname === '/projects' ? 'active' : ''}"
					on:click={closeMenu}
				>
					Projects
				</a>
			</div>
		</nav>
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

	/* Hamburger Icon Animation */
	.hamburger-icon {
		transition: transform 0.3s ease;
	}

	.hamburger-icon .line {
		transition: all 0.3s ease;
		transform-origin: center;
	}

	.hamburger-icon.open .line1 {
		transform: rotate(45deg) translate(5px, 5px);
	}

	.hamburger-icon.open .line2 {
		opacity: 0;
	}

	.hamburger-icon.open .line3 {
		transform: rotate(-45deg) translate(7px, -6px);
	}

	/* Mobile Navigation */
	.mobile-nav {
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease;
		background-color: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
		margin-top: 1rem;
	}

	.mobile-nav.open {
		max-height: 200px;
	}

	.mobile-nav-content {
		padding: 1rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
