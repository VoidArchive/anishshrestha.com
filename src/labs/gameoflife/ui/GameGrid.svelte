<!--
Conway's Game of Life - Interactive Game Grid Component

Displays the cellular automaton grid with click-to-toggle functionality.
Each cell represents a Conway's Game of Life organism (alive or dead).
Responsive design adapts cell size for mobile devices.
-->

<script lang="ts">
	import { getSimulationState, toggleCellAt } from '../store.svelte';

	// Get simulation state reactively
	let simulationState = $derived(getSimulationState());

	/**
	 * Handles cell click to toggle its state
	 */
	function handleCellClick(x: number, y: number): void {
		toggleCellAt(x, y);
	}

	/**
	 * Checks if a cell is alive
	 */
	function isCellAlive(x: number, y: number): boolean {
		return simulationState.grid[y]?.[x] === true;
	}

	// Reactive grid dimensions for proper updates
	let gridWidth = $derived(simulationState.gridSize.width);
	let gridHeight = $derived(simulationState.gridSize.height);
</script>

<!-- Recessed Game Board Container -->
<div class="game-board-container">
	<!-- Game Info -->
	<div class="grid-info">
		<span class="grid-size">{gridWidth} × {gridHeight} Grid</span>
		<span class="interaction-hint">Click cells to toggle</span>
	</div>

	<!-- Carved Board Well -->
	<div class="board-well">
		<div class="board-inner">
			<div class="board-wrapper">
				<!-- Game Grid -->
				<div
					class="game-grid"
					style="grid-template-columns: repeat({gridWidth}, 1fr); grid-template-rows: repeat({gridHeight}, 1fr);"
					role="grid"
					aria-label="Conway's Game of Life grid"
				>
					<!-- eslint-disable @typescript-eslint/no-unused-vars -->
					{#each Array(gridHeight) as _, y (y)}
						{#each Array(gridWidth) as _, x (`${y}-${x}`)}
							<button
								class="cell {isCellAlive(x, y) ? 'alive' : 'dead'}"
								onclick={() => handleCellClick(x, y)}
								aria-label="Cell at position {x}, {y}. Currently {isCellAlive(x, y)
									? 'alive'
									: 'dead'}"
								aria-selected={isCellAlive(x, y)}
								role="gridcell"
								data-x={x}
								data-y={y}
							></button>
						{/each}
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Game board container takes full available space */
	.game-board-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		height: 100%;
	}

	/* Grid Info */
	.grid-info {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-align: center;
		margin-bottom: var(--space-3);
		flex-shrink: 0;
	}

	.grid-size {
		font-weight: 600;
	}

	.interaction-hint {
		font-style: italic;
	}

	/* Recessed Board Well Effect - optimized for space utilization */
	.board-well {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
		padding: 0.5rem;
	}

	@media (min-width: 640px) {
		.board-well {
			padding: 0.75rem;
		}
	}

	.board-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, #151515, var(--color-bg-primary));
		padding: 0.5rem;
		position: relative;
		min-height: 0;
		/* Deep inset effect */
		box-shadow: 
			/* Strong inset shadows for depth */
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			/* Inner glow */ inset 0 0 20px rgba(0, 0, 0, 0.5),
			/* Subtle red accent glow */ inset 0 0 40px rgba(201, 42, 42, 0.02);
	}

	@media (min-width: 640px) {
		.board-inner {
			padding: 0.75rem;
		}
	}

	/* Add subtle texture overlay */
	.board-inner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(201, 42, 42, 0.008) 0%, transparent 50%);
		pointer-events: none;
	}

	/* Board wrapper styling - takes full available space */
	.board-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		padding: 0.5rem;
		background: transparent;
	}

	@media (min-width: 640px) {
		.board-wrapper {
			padding: 0.75rem;
		}
	}

	.game-grid {
		display: grid;
		gap: 1px;
		background: rgba(21, 21, 21, 0.5);
		border-radius: 4px;
		padding: 2px;
		width: 100%;
		height: 100%;
		/* Remove max constraints to use available space */
		min-width: 300px;
		min-height: 300px;
	}

	.cell {
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 1px;
		padding: 0;
		margin: 0;
		outline: none;
		/* Allow cells to be smaller for larger grids */
		min-width: 8px;
		min-height: 8px;
		width: 100%;
		height: 100%;
	}

	.cell.dead {
		background: var(--color-bg-secondary);
		opacity: 0.8;
	}

	.cell.dead:hover {
		background: #fef2f2;
		opacity: 1;
		transform: scale(1.1);
		z-index: 1;
	}

	.cell.alive {
		background: var(--color-primary);
		box-shadow: 0 0 4px rgba(201, 42, 42, 0.3);
		opacity: 1;
	}

	.cell.alive:hover {
		background: #b91c1c;
		transform: scale(1.1);
		box-shadow: 0 0 6px rgba(201, 42, 42, 0.5);
		z-index: 1;
	}

	.cell:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
		z-index: 2;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.grid-info {
			flex-direction: column;
			gap: var(--space-1);
			margin-bottom: var(--space-2);
		}

		.cell {
			min-width: 6px;
			min-height: 6px;
		}

		.game-grid {
			border-width: 1px;
			padding: 1px;
			gap: 0.5px;
			min-width: 250px;
			min-height: 250px;
		}
	}

	/* Very small screens */
	@media (max-width: 480px) {
		.cell {
			min-width: 4px;
			min-height: 4px;
		}

		.game-grid {
			gap: 0.5px;
			min-width: 200px;
			min-height: 200px;
		}
	}
</style>
