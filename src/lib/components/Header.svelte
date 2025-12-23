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

<header class="header-terminal">
	<div class="container">
		<div class="flex items-center justify-between">
			<div class="logo-wrapper">
				<span class="logo-prompt">~/</span>
				<a href="/" on:click={closeMenu} class="logo-text">Anish</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-2 md:flex">
				<a href="/labs" class="nav-link {page.url.pathname.startsWith('/labs') ? 'active' : ''}"
					>Labs</a
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
					href="/labs"
					class="btn {page.url.pathname.startsWith('/labs') ? 'active' : ''}"
					on:click={closeMenu}
				>
					Labs
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
	.header-terminal {
		border-bottom: 1px solid var(--color-border);
		padding: 1rem 0;
		background: var(--color-bg-secondary);
		position: relative;
	}

	.header-terminal::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg, var(--color-primary), transparent 50%);
		opacity: 0.5;
	}

	.logo-wrapper {
		display: flex;
		align-items: center;
		gap: 0;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.logo-prompt {
		color: var(--color-primary);
		font-weight: 400;
		opacity: 0.7;
	}

	.logo-text {
		color: var(--color-text);
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.logo-text:hover {
		color: var(--color-primary);
		text-shadow: 0 0 20px var(--color-glow);
	}

	.nav-link {
		color: var(--color-text-muted);
		transition: all 0.3s ease;
		font-size: 1rem;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		text-decoration: none;
		position: relative;
	}

	.nav-link::before {
		content: './';
		color: var(--color-primary);
		opacity: 0;
		margin-right: 0;
		transition: all 0.3s ease;
		display: inline-block;
		width: 0;
		overflow: hidden;
	}

	.nav-link:hover::before {
		opacity: 0.7;
		width: 1.2em;
		margin-right: 0;
	}

	.nav-link:hover {
		color: var(--color-text);
	}

	.nav-link.active {
		background-color: var(--color-primary);
		color: var(--color-bg-primary);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: 600;
		box-shadow: 0 0 15px -3px var(--color-glow);
	}

	.nav-link.active::before {
		display: none;
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

	@media (min-width: 768px) {
		.logo-wrapper {
			font-size: 1.5rem;
		}
	}
</style>
