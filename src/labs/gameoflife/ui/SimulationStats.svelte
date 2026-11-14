<!--
Conway's Game of Life - Reading Row

The reading printed beneath the plate: state, generation, population, births,
deaths, with a Play/Pause text control on the right.
-->

<script lang="ts">
	import { simulationState, startSimulation, stopSimulation } from '../store.svelte.js';

	let running = $derived(simulationState.isRunning);
</script>

<div class="reading caps">
	<span class="state">{running ? 'Running' : 'Paused'}</span>
	<span>Generation {simulationState.generation}</span>
	<span>Population {simulationState.stats.population}</span>
	<span>Born {simulationState.stats.born}</span>
	<span>Died {simulationState.stats.died}</span>
	<span>{simulationState.gridSize.width} × {simulationState.gridSize.height} cells</span>
	<span>{simulationState.speed} ms / gen</span>
	{#if simulationState.wrapEdges}
		<span>Edges wrap</span>
	{/if}
	<span class="controls">
		<button type="button" onclick={running ? stopSimulation : startSimulation}>
			{running ? 'Pause' : 'Play'}
		</button>
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
