<script lang="ts">
	import { onMount } from 'svelte';
	const currentYear = new Date().getFullYear();
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

<footer class="border-border bg-bg-secondary border-t">
	<div
		class="text-text container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row"
	>
		<p>&copy; {currentYear} Anish Shrestha. All rights reserved.</p>

		<p class="text-text-muted italic">
			<span
				bind:this={vimText}
				class="vim-easter-egg"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				on:mousemove={handleMouseMove}
				role="button"
				tabindex="0"
			>
				<a href="https://github.com/VoidArchive/anishshrestha.com">Made with SvelteKit</a>
			</span>
		</p>
	</div>
</footer>

<!-- Go Gopher that follows cursor -->
{#if showGopher}
	<div class="gopher-cursor" style="left: {mouseX + 16}px; top: {mouseY - 20}px;">
		<img src="/go-vim.svg" alt="Go Gopher with Vim" width="48" height="36" />
	</div>
{/if}

<style>
	.vim-easter-egg {
		position: relative;
		transition: all 0.3s ease-in-out;
		cursor: pointer;
	}

	.vim-easter-egg:hover {
		background: linear-gradient(
			90deg,
			#ffffff 0%,
			#fecaca 25%,
			#f87171 50%,
			#ef4444 75%,
			#dc2626 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 100%;
		animation: gradientShift 2s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.gopher-cursor {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		transition: all 0.1s ease-out;
		animation: gopherFloat 2s ease-in-out infinite;
	}

	@keyframes gopherFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-5px);
		}
	}
</style>

