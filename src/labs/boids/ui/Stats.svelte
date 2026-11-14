<script lang="ts">
	import { state, toggleSimulation, resetSimulation } from '../store.svelte.js';
</script>

<div class="reading" aria-live="polite">
	<span class="state">{state.isRunning ? 'Running' : 'Paused'}</span>
	<span>{state.stats.boidCount} boids</span>
	<span>{state.stats.fps} fps</span>
	<span>{state.canvasSize.width} × {state.canvasSize.height}</span>
	<span class="controls">
		<button type="button" onclick={toggleSimulation}>{state.isRunning ? 'Pause' : 'Play'}</button>
		<button type="button" onclick={resetSimulation}>Reset</button>
	</span>
</div>

<style>
	.reading {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		border-top: 1px solid var(--color-ink);
		padding-top: 8px;
		margin-top: 8px;
		color: var(--color-spot-text);
		font-family: var(--font-family-sans);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.5;
		font-variant-numeric: tabular-nums;
	}

	.state::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		background: currentColor;
		margin-right: 6px;
		vertical-align: 1px;
	}

	.controls {
		margin-left: auto;
		display: flex;
		gap: 12px;
	}

	.reading button {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: var(--color-ink);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}

	.reading button:hover {
		color: var(--color-spot-text);
	}
</style>
