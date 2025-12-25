<script lang="ts">
	import { Terminal, Locate } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let nameVisible = $state(false);
	let titleVisible = $state(false);
	let locationVisible = $state(false);

	onMount(() => {
		// Staggered typing reveal
		setTimeout(() => (nameVisible = true), 200);
		setTimeout(() => (titleVisible = true), 600);
		setTimeout(() => (locationVisible = true), 900);
	});
</script>

<section class="terminal-window">
	<!-- Terminal chrome -->
	<div class="terminal-header">
		<div class="terminal-buttons">
			<span class="terminal-btn close"></span>
			<span class="terminal-btn minimize"></span>
			<span class="terminal-btn maximize"></span>
		</div>
		<div class="terminal-title">anish@portfolio: ~</div>
		<div class="terminal-buttons invisible">
			<span class="terminal-btn"></span>
			<span class="terminal-btn"></span>
			<span class="terminal-btn"></span>
		</div>
	</div>

	<!-- Terminal content -->
	<div class="terminal-body">
		<div class="mb-6 flex justify-center">
			<img src="/bird-logo.svg" alt="Anish's Logo" width="64" height="116" class="logo-glow" />
		</div>

		<div class="terminal-line {nameVisible ? 'visible' : ''}">
			<span class="prompt">$</span>
			<span class="command">whoami</span>
		</div>
		<div class="terminal-output profile-name {nameVisible ? 'visible' : ''}">
			Anish Shrestha<span class="cursor"></span>
		</div>

		<div class="terminal-line {titleVisible ? 'visible' : ''}">
			<span class="prompt">$</span>
			<span class="command">cat role.txt</span>
		</div>
		<div class="terminal-output profile-title {titleVisible ? 'visible' : ''}">
			<Terminal size={16} class="text-primary inline" /> Software Developer
		</div>

		<div class="terminal-line {locationVisible ? 'visible' : ''}">
			<span class="prompt">$</span>
			<span class="command">echo $LOCATION</span>
		</div>
		<div class="terminal-output profile-title {locationVisible ? 'visible' : ''}">
			<Locate size={16} class="text-primary inline" /> Nepal
		</div>
	</div>
</section>

<style>
	.terminal-window {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		overflow: hidden;
		margin-bottom: var(--space-6);
		box-shadow:
			0 0 0 1px rgba(255, 107, 107, 0.05),
			0 20px 50px -10px rgba(0, 0, 0, 0.5),
			0 0 40px -20px var(--color-glow);
	}

	.terminal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border);
	}

	.terminal-buttons {
		display: flex;
		gap: 8px;
	}

	.terminal-buttons.invisible {
		visibility: hidden;
	}

	.terminal-btn {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-border);
	}

	.terminal-btn.close {
		background: #ff5f56;
	}

	.terminal-btn.minimize {
		background: #ffbd2e;
	}

	.terminal-btn.maximize {
		background: #27ca40;
	}

	.terminal-title {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
	}

	.terminal-body {
		padding: var(--space-6);
	}

	.logo-glow {
		filter: drop-shadow(0 0 20px var(--color-glow));
	}

	.terminal-line {
		margin-bottom: var(--space-1);
		opacity: 0;
		transform: translateY(5px);
		transition: all 0.3s ease;
	}

	.terminal-line.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.prompt {
		color: var(--color-primary);
		margin-right: var(--space-2);
		font-weight: 600;
	}

	.command {
		color: var(--color-text-muted);
	}

	.terminal-output {
		margin-bottom: var(--space-4);
		padding-left: var(--space-4);
		opacity: 0;
		transform: translateY(5px);
		transition: all 0.3s ease 0.15s;
	}

	.terminal-output.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.profile-name {
		color: var(--color-text);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.profile-title {
		color: var(--color-text);
		font-size: 0.95rem;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.cursor {
		display: inline-block;
		width: 10px;
		height: 1.2em;
		background: var(--color-primary);
		margin-left: 4px;
		animation: blink 1s step-end infinite;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	@media (max-width: 768px) {
		.terminal-body {
			padding: var(--space-4);
		}

		.profile-name {
			font-size: 1.25rem;
		}
	}
</style>
