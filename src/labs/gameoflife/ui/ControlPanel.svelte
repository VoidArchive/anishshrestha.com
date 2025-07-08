<!--
Conway's Game of Life - Control Panel Component

Provides simulation controls including play/pause, step, reset, and speed adjustment.
Uses consistent button styling and clear visual feedback for current state.
-->

<script lang="ts">
	import { Play, Pause, SkipForward, RotateCcw, Shuffle, Square } from 'lucide-svelte';
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
	} from '../store.svelte';
	import { SimulationSpeed } from '../rules/types';

	// Get reactive stats directly from simulation state
	let stats = $derived({
		population: simulationState.stats.population,
		generation: simulationState.generation,
		born: simulationState.stats.born,
		died: simulationState.stats.died,
		isRunning: simulationState.isRunning,
		speed: simulationState.speed,
		wrapEdges: simulationState.wrapEdges,
		gridWidth: simulationState.gridSize.width,
		gridHeight: simulationState.gridSize.height
	});

	/**
	 * Toggles simulation play/pause state
	 */
	function toggleSimulation(): void {
		if (stats.isRunning) {
			stopSimulation();
		} else {
			startSimulation();
		}
	}

	/**
	 * Handles speed change from select input
	 */
	function handleSpeedChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const speed = parseInt(target.value) as SimulationSpeed;
		changeSpeed(speed);
	}

	/**
	 * Handles randomize with default probability
	 */
	function handleRandomize(): void {
		randomizeGrid(0.25); // 25% alive probability
	}

	/**
	 * Handles grid size preset selection
	 */
	function handleGridSizeChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		const [width, height] = target.value.split('x').map(Number);
		resizeGrid(width, height);
	}
</script>

<div class="control-panel">
	<!-- Primary Controls -->
	<div class="control-group">
		<h4 class="control-group-title">Simulation</h4>
		<div class="button-row" style="gap: var(--space-2);">
			<button
				class="btn control-btn primary"
				onclick={toggleSimulation}
				aria-label={stats.isRunning ? 'Pause simulation' : 'Start simulation'}
			>
				{#if stats.isRunning}
					<Pause size={16} />
					Pause
				{:else}
					<Play size={16} />
					Play
				{/if}
			</button>

			<button
				class="btn control-btn"
				onclick={stepGeneration}
				disabled={stats.isRunning}
				aria-label="Step one generation"
			>
				<SkipForward size={16} />
				Step
			</button>
		</div>
	</div>

	<!-- Speed Control -->
	<div class="control-group">
		<h4 class="control-group-title">Speed</h4>
		<select
			class="speed-select"
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

	<!-- Grid Controls -->
	<div class="control-group">
		<h4 class="control-group-title">Grid</h4>
		<div class="grid-controls">
			<button
				class="btn control-btn"
				onclick={handleRandomize}
				aria-label="Fill with random cells"
				title="Generate random starting pattern"
			>
				<Shuffle size={16} />
				Randomize
			</button>

			<button
				class="btn control-btn clear-btn"
				onclick={clearGrid}
				aria-label="Clear all cells"
				title="Remove all living cells"
			>
				<Square size={16} />
				Clear Grid
			</button>

			<button
				class="btn control-btn reset-btn"
				onclick={resetSimulation}
				aria-label="Reset simulation"
				title="Reset generation counter and stats"
			>
				<RotateCcw size={16} />
				Reset All
			</button>
		</div>
	</div>

	<!-- Grid Size Control -->
	<div class="control-group">
		<h4 class="control-group-title">Grid Size</h4>
		<select
			class="size-select"
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

	<!-- Options -->
	<div class="control-group">
		<h4 class="control-group-title">Options</h4>
		<label class="checkbox-label">
			<input
				type="checkbox"
				checked={simulationState.wrapEdges}
				onchange={toggleWrapEdges}
				class="checkbox-input"
			/>
			<span class="checkbox-text">Wrap edges (toroidal)</span>
		</label>
	</div>
</div>

<style>
	.control-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.control-group-title {
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
		padding-bottom: var(--space-1);
		border-bottom: 1px solid var(--color-border);
	}

	.button-row {
		display: flex;
		flex-wrap: wrap;
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.875rem;
		padding: var(--space-2) var(--space-3);
		white-space: nowrap;
	}

	.control-btn.primary {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.control-btn.primary:hover {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.control-btn:disabled:hover {
		background: transparent;
		color: var(--color-text);
		border-color: var(--color-border);
	}

	.speed-select {
		width: 100%;
		padding: var(--space-2);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		border-radius: 4px;
		transition: border-color 0.3s ease;
	}

	.speed-select:hover {
		border-color: var(--color-primary);
	}

	.speed-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(201, 42, 42, 0.1);
	}

	.speed-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.size-select {
		width: 100%;
		padding: var(--space-2);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		border-radius: 4px;
		transition: border-color 0.3s ease;
	}

	.size-select:hover {
		border-color: var(--color-primary);
	}

	.size-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(201, 42, 42, 0.1);
	}

	.size-select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.checkbox-input {
		width: 16px;
		height: 16px;
		accent-color: var(--color-primary);
		cursor: pointer;
	}

	.checkbox-text {
		font-family: var(--font-family-mono);
		user-select: none;
	}

	.grid-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.clear-btn {
		background: rgba(148, 163, 184, 0.1);
		border-color: rgba(148, 163, 184, 0.3);
		color: #94a3b8;
	}

	.clear-btn:hover:not(:disabled) {
		background: rgba(148, 163, 184, 0.2);
		border-color: #94a3b8;
	}

	.reset-btn {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.reset-btn:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.button-row {
			flex-direction: column;
			gap: var(--space-2) !important;
		}

		.control-btn {
			width: 100%;
			justify-content: center;
		}

		.control-group {
			gap: var(--space-3);
		}

		.speed-select {
			font-size: 0.875rem;
		}

		.size-select {
			font-size: 0.875rem;
		}
	}

	@media (max-width: 480px) {
		.control-panel {
			gap: var(--space-2);
		}

		.control-btn {
			padding: var(--space-3) var(--space-2);
			font-size: 0.8rem;
		}

		.control-group-title {
			font-size: 0.8rem;
		}

		.checkbox-label {
			font-size: 0.8rem;
		}

		.checkbox-text {
			font-size: 0.8rem;
		}
	}
</style>
