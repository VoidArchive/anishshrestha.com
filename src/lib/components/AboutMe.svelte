<!--
About Me Component

Personal introduction with improved content structure and engagement.
Features the famous vim easter egg with gopher cursor follow animation.
Enhanced with better readability and subtle visual improvements.
-->

<script lang="ts">
	import { User, Briefcase } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let vimText: HTMLElement;
	let showGopher = false;
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let mouseX = 0;
	let mouseY = 0;

	function handleMouseEnter() {
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			showGopher = true;
		}, 200);
	}

	function handleMouseLeave() {
		if (hoverTimer) clearTimeout(hoverTimer);
		showGopher = false;
	}

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	onMount(() => {
		return () => {
			if (hoverTimer) clearTimeout(hoverTimer);
		};
	});
</script>

<section class="section-card">
	<h2 class="section-title">
		<User size={20} class="text-primary inline" /> About Me
	</h2>
	<div class="about-content">
		<!-- Introduction -->
		<div class="intro-section">
			<p class="intro-text">
				Hi, I'm Anish. I'm a software developer from Nepal who loves building innovative solutions
				and bringing ideas to life through code.
			</p>
		</div>

		<!-- Current work -->
		<div class="work-section">
			<div class="work-header">
				<Briefcase size={16} class="text-primary" />
				<span class="work-label">Currently</span>
			</div>
			<p class="work-description">
				Building full-stack applications at <a
					href="https://www.globalsquareit.com"
					class="company-link"
					target="_blank"
					rel="noopener noreferrer">Global Square</a
				>, crafting scalable systems from database design to user interfaces, with expertise in
				modern web technologies and distributed architectures.
			</p>
		</div>

		<!-- Background -->
		<div class="background-section">
			<p class="background-text">
				I specialize in full-stack development, creating everything from interactive visualizers and
				games to enterprise applications. My experience spans frontend frameworks, backend services,
				database design, and DevOps practices - bringing complete software solutions to life.
			</p>

			<!-- Additional detail for SEO and AI understanding -->
			<p class="background-text">
				My work includes building scalable web applications, implementing complex algorithms,
				creating interactive user experiences, and solving challenging software engineering
				problems. I enjoy working across the entire technology stack and have experience with both
				startup environments and enterprise systems.
			</p>
		</div>

		<!-- Vim easter egg -->
		<div class="vim-section">
			<p class="vim-container">
				<span
					bind:this={vimText}
					class="vim-easter-egg"
					on:mouseenter={handleMouseEnter}
					on:mouseleave={handleMouseLeave}
					on:mousemove={handleMouseMove}
					role="button"
					tabindex="0"
				>
					The internet can still be fun.
				</span>
				<!-- <span class="vim-hint">← try hovering</span> -->
			</p>
		</div>
	</div>
</section>

<!-- Go Gopher that follows cursor -->
{#if showGopher}
	<div class="gopher-cursor" style="left: {mouseX - 16}px; top: {mouseY + 20}px;">
		<img src="/go-vim.svg" alt="Go Gopher with Vim" width="48" height="36" />
	</div>
{/if}

<style>
	.about-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.intro-section {
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.intro-text {
		color: var(--color-text);
		font-size: 1rem;
		line-height: 1.6;
		font-weight: 500;
	}

	.work-section,
	.background-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.work-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.work-label {
		color: var(--color-text);
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.work-description,
	.background-text {
		color: var(--color-text);
		line-height: 1.6;
		font-size: 0.9rem;
	}

	.company-link {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		border-bottom: 1px solid transparent;
	}

	.company-link:hover {
		border-bottom-color: var(--color-primary);
		color: #ef4444;
	}

	.vim-section {
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
	}

	.vim-container {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin: 0;
	}

	.vim-easter-egg {
		/* font-family: var(--font-family-mono); */
		cursor: pointer;
		transition: all 0.3s ease;
		padding: var(--space-1) var(--space-2);
		border: 1px solid transparent;
		border-radius: 2px;
	}

	.vim-easter-egg:hover,
	.vim-easter-egg:focus {
		color: var(--color-primary);
		/* border-color: var(--color-border); */
		/* background: rgba(201, 42, 42, 0.05); */
		outline: none;
	}

	.gopher-cursor {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		transition: opacity 0.3s ease;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.about-content {
			gap: var(--space-3);
		}

		.vim-container {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}
	}
</style>
