<script lang="ts">
	import { User } from 'lucide-svelte';
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
		<User size={20} class="text-primary-red inline" /> About Me
	</h2>
	<div class="space-y-4">
		<p class="text-text-primary leading-relaxed">
			Software engineer in Kathmandu. I write Go & Python.
		</p>
		<p class="text-text-primary leading-relaxed">
			Currently building production services at Global Square, turning specifications into scalable
			systems.
		</p>
		<p class="text-text-primary leading-relaxed">
			Previously built ERP systems focusing on accounting and invoicing modules, plus e-commerce
			platforms.
		</p>
		<p class="text-text-primary leading-relaxed">
			Spare hours: Calisthenics, NEPSE portfolio management, hiking around Nepal
		</p>
		<p class="text-text-secondary italic">
			<span
				bind:this={vimText}
				class="vim-easter-egg"
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				on:mousemove={handleMouseMove}
				role="button"
				tabindex="0"
			>
				I use vim btw.
			</span>
		</p>
	</div>
</section>

<!-- Go Gopher that follows cursor -->
{#if showGopher}
	<div class="gopher-cursor" style="left: {mouseX - 16}px; top: {mouseY + 20}px;">
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
