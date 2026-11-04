<!--
Conway's Game of Life - Control Panel Component

Provides simulation controls including play/pause, step, reset, and speed adjustment.
-->

<script lang="ts">
	import { Play, Pause, SkipForward, RotateCcw, Shuffle, Square } from '@lucide/svelte';
	import {
		simulationState,
		startSimulation,
		stopSimulation,
		stepGeneration,
		resetSimulation,
		clearGrid,
		randomizeGrid,
		changeSpeed,
		toggleWrapEdges,
		resizeGrid
	} from '../store.svelte.js';
	import { SimulationSpeed } from '../rules/types';

	let stats = $derived({
		isRunning: simulationState.isRunning,
		speed: simulationState.speed,
		gridWidth: simulationState.gridSize.width,
		gridHeight: simulationState.gridSize.height
	});

	function toggleSimulation(): void {
		if (stats.isRunning) {
			stopSimulation();
		} else {
			startSimulation();
		}
	}

	function handleSpeedChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const speed = parseInt(target.value) as SimulationSpeed;
		changeSpeed(speed);
	}

	function handleRandomize(): void {
		randomizeGrid(0.25); // 25% alive probability
	}

	function handleGridSizeChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const [width, height] = target.value.split('x').map(Number);
		resizeGrid(width, height);
	}
</script>

<div class="control-panel">
	<div class="control-group">
		<span class="caps control-group-title">Simulation</span>
		<div class="button-row">
			<button
				class="btn"
				class:active={stats.isRunning}
				onclick={toggleSimulation}
				aria-label={stats.isRunning ? 'Pause simulation' : 'Start simulation'}
			>
				{#if stats.isRunning}
					<Pause size={14} />
					Pause
				{:else}
					<Play size={14} />
					Play
				{/if}
			</button>

			<button
				class="btn"
				onclick={stepGeneration}
				disabled={stats.isRunning}
				aria-label="Step one generation"
			>
				<SkipForward size={14} />
				Step
			</button>
		</div>
	</div>

	<div class="control-group">
		<label class="caps control-group-title" for="life-speed">Speed</label>
		<select
			id="life-speed"
			value={stats.speed}
			onchange={handleSpeedChange}
			disabled={stats.isRunning}
		>
			<option value={SimulationSpeed.VERY_SLOW}>Very Slow (1s)</option>
			<option value={SimulationSpeed.SLOW}>Slow (0.5s)</option>
			<option value={SimulationSpeed.NORMAL}>Normal (0.2s)</option>
			<option value={SimulationSpeed.FAST}>Fast (0.1s)</option>
			<option value={SimulationSpeed.VERY_FAST}>Very Fast (0.05s)</option>
		</select>
	</div>

	<div class="control-group">
		<span class="caps control-group-title">Grid</span>
		<div class="button-row">
			<button
				class="btn"
				onclick={handleRandomize}
				aria-label="Fill with random cells"
				title="Generate random starting pattern"
			>
				<Shuffle size={14} />
				Randomize
			</button>

			<button
				class="btn"
				onclick={clearGrid}
				aria-label="Clear all cells"
				title="Remove all living cells"
			>
				<Square size={14} />
				Clear Grid
			</button>

			<button
				class="btn"
				onclick={resetSimulation}
				aria-label="Reset simulation"
				title="Reset generation counter and stats"
			>
				<RotateCcw size={14} />
				Reset All
			</button>
		</div>
	</div>

	<div class="control-group">
		<label class="caps control-group-title" for="life-size">Grid Size</label>
		<select
			id="life-size"
			value="{stats.gridWidth}x{stats.gridHeight}"
			onchange={handleGridSizeChange}
			disabled={stats.isRunning}
		>
			<option value="20x15">Small (20×15)</option>
			<option value="40x30">Medium (40×30)</option>
			<option value="60x45">Large (60×45) - Virtualized</option>
			<option value="80x60">X-Large (80×60) - Virtualized</option>
			<option value="100x75">XX-Large (100×75) - Virtualized</option>
			<option value="150x100">Huge (150×100) - Virtualized</option>
		</select>
	</div>

	<div class="control-group">
		<label class="caps checkbox-label">
			<input type="checkbox" checked={simulationState.wrapEdges} onchange={toggleWrapEdges} />
			Wrap edges (toroidal)
		</label>
	</div>
</div>

<style>
	.control-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.control-group-title {
		font-weight: 400;
		letter-spacing: 0.14em;
		font-size: 12px;
	}

	.button-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.btn:disabled:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
	}

	select {
		width: 100%;
		padding: 7px 8px;
		font-size: 13px;
	}

	select:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.checkbox-label input {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}
</style>
