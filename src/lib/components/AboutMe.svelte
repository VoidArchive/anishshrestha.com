<script lang="ts">
	import { User } from 'lucide-svelte';
	import VimGopherCursor from './VimGopherCursor.svelte';
	import { onMount } from 'svelte';

	let vimText: HTMLElement;
	let showCustomCursor = false;
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;

	function handleMouseEnter() {
		if (hoverTimer) clearTimeout(hoverTimer);
		hoverTimer = setTimeout(() => {
			showCustomCursor = true;
		}, 1000);
	}

	function handleMouseLeave() {
		if (hoverTimer) clearTimeout(hoverTimer);
		showCustomCursor = false;
	}

	onMount(() => {
		return () => {
			if (hoverTimer) clearTimeout(hoverTimer);
		};
	});
</script>

<section class="section-card">
	<h2 class="section-title">
		<User size={20} class="inline" /> About Me
	</h2>
	<div class="space-y-4">
		<p class="text-text-primary leading-relaxed">
			I build systems that actually work. Based in Kathmandu, Nepal, I spend my days writing Go for distributed systems and Python when data gets messy.
		</p>
		<p class="text-text-primary leading-relaxed">
			Most software today is overengineered garbage. I prefer boring solutions that scale over clever abstractions that break. When I need a frontend, it's SvelteKit for interactivity or plain HTML when it's just content.
		</p>
		<p class="text-text-primary leading-relaxed">
			I've been coding since I was 14, started with C++ (terrible idea), survived PHP, and now mostly stick to Go and Python. PostgreSQL is my database of choice because it just works and doesn't pretend to be something it's not. Working remotely with international clients has taught me the value of clear communication and reliable code.
		</p>
		<p class="text-text-secondary italic">
			<span 
				bind:this={vimText}
				class="vim-easter-egg"
				class:show-gopher-cursor={showCustomCursor}
				on:mouseenter={handleMouseEnter}
				on:mouseleave={handleMouseLeave}
				role="button"
				tabindex="0"
			>
				I use vim btw.
			</span>
		</p>
	</div>
</section>

<!-- Hidden SVG for cursor -->
{#if showCustomCursor}
	<div class="gopher-cursor-container">
		<VimGopherCursor />
	</div>
{/if}

<style>
	.vim-easter-egg {
		position: relative;
		transition: all 0.3s ease-in-out;
		cursor: pointer;
	}

	.vim-easter-egg:hover {
		background: linear-gradient(90deg, #ffffff 0%, #fecaca 25%, #f87171 50%, #ef4444 75%, #dc2626 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 100%;
		animation: gradientShift 2s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	.show-gopher-cursor {
		cursor: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI4IiBmaWxsPSIjOTZkNmZmIiBzdHJva2U9IiMzOTQ2NTUiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjkiIGN5PSI4IiByPSIxLjUiIGZpbGw9IiMzOTQ2NTUiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjgiIHI9IjEuNSIgZmlsbD0iIzM5NDY1NSIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjcuNSIgcj0iMC41IiBmaWxsPSIjZmZmZmZmIi8+PGNpcmNsZSBjeD0iMTQuNSIgY3k9IjcuNSIgcj0iMC41IiBmaWxsPSIjZmZmZmZmIi8+PHBhdGggZD0iTSA5IDEyIFEgMTIgMTUgMTUgMTIiIHN0cm9rZT0iIzM5NDY1NSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PGVsbGlwc2UgY3g9IjciIGN5PSI2IiByeD0iMiIgcnk9IjMiIGZpbGw9IiM5NmQ2ZmYiIHN0cm9rZT0iIzM5NDY1NSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGVsbGlwc2UgY3g9IjE3IiBjeT0iNiIgcng9IjIiIHJ5PSIzIiBmaWxsPSIjOTZkNmZmIiBzdHJva2U9IiMzOTQ2NTUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg=='), auto !important;
	}

	.gopher-cursor-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 32px;
		height: 32px;
		pointer-events: none;
		z-index: 9999;
		display: none;
	}
</style> 