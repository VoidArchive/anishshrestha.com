<!--
Conway's Game of Life - Interactive Game Grid Component

Displays the cellular automaton grid with click-to-toggle functionality.
Each cell represents a Conway's Game of Life organism (alive or dead).
Responsive design adapts cell size for mobile devices.
Implements virtual scrolling for large grids (>50x50) to optimize performance.
-->

<script lang="ts">
	import { simulationState, toggleCellAt } from '../store.svelte';

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

	// Virtual scrolling implementation for large grids
	let gridContainer: HTMLDivElement;
	let scrollTop = $state(0);
	let scrollLeft = $state(0);
	let containerWidth = $state(0);
	let containerHeight = $state(0);

	// Cell size calculation - responsive
	let cellSize = $derived(() => {
		if (gridWidth > 100 || gridHeight > 100) return 4; // Very large grids
		if (gridWidth > 50 || gridHeight > 50) return 6; // Large grids
		return 8; // Normal grids
	});

	// Determine if we should use virtualization
	let useVirtualization = $derived(gridWidth > 50 || gridHeight > 50);

	// Calculate viewport bounds for virtual scrolling
	let viewportBounds = $derived(() => {
		if (!useVirtualization) return null;

		const cellSizeWithGap = cellSize() + 1; // Include gap
		const visibleCols = Math.ceil(containerWidth / cellSizeWithGap);
		const visibleRows = Math.ceil(containerHeight / cellSizeWithGap);

		// Add buffer for smooth scrolling
		const bufferCols = Math.max(2, Math.ceil(visibleCols * 0.1));
		const bufferRows = Math.max(2, Math.ceil(visibleRows * 0.1));

		const startCol = Math.max(0, Math.floor(scrollLeft / cellSizeWithGap) - bufferCols);
		const endCol = Math.min(gridWidth - 1, startCol + visibleCols + bufferCols * 2);
		const startRow = Math.max(0, Math.floor(scrollTop / cellSizeWithGap) - bufferRows);
		const endRow = Math.min(gridHeight - 1, startRow + visibleRows + bufferRows * 2);

		return {
			startCol,
			endCol,
			startRow,
			endRow,
			visibleCols,
			visibleRows
		};
	});

	// Calculate visible cells for rendering
	let visibleCells = $derived.by(() => {
		if (!useVirtualization) {
			// Render all cells for small grids
			const cells = [];
			for (let y = 0; y < gridHeight; y++) {
				for (let x = 0; x < gridWidth; x++) {
					cells.push({ x, y });
				}
			}
			return cells;
		}

		const bounds = viewportBounds();
		if (!bounds) return [];

		const cells = [];
		for (let y = bounds.startRow; y <= bounds.endRow; y++) {
			for (let x = bounds.startCol; x <= bounds.endCol; x++) {
				cells.push({ x, y });
			}
		}
		return cells;
	});

	// Handle scroll events for virtual scrolling
	function handleScroll(event: Event): void {
		const target = event.target as HTMLDivElement;
		scrollTop = target.scrollTop;
		scrollLeft = target.scrollLeft;
	}

	// Update container dimensions on resize
	function updateContainerDimensions(): void {
		if (gridContainer) {
			const rect = gridContainer.getBoundingClientRect();
			containerWidth = rect.width;
			containerHeight = rect.height;
		}
	}

	// Reactive effect to update dimensions when grid changes
	$effect(() => {
		if (gridContainer) {
			updateContainerDimensions();
		}
	});

	// Handle window resize for responsive behavior
	$effect(() => {
		if (typeof window !== 'undefined') {
			const handleResize = () => {
				updateContainerDimensions();
			};

			window.addEventListener('resize', handleResize);

			// Cleanup on component destroy
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});
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
				<!-- Game Grid Container -->
				<div
					bind:this={gridContainer}
					class="game-grid-container {useVirtualization ? 'virtualized' : 'standard'}"
					onscroll={useVirtualization ? handleScroll : undefined}
					role="grid"
					aria-label="Conway's Game of Life grid"
				>
					{#if useVirtualization}
						<!-- Virtual Grid for Large Grids -->
						<div
							class="grid-viewport"
							style="
								width: {gridWidth * (cellSize() + 1)}px;
								height: {gridHeight * (cellSize() + 1)}px;
								position: relative;
							"
						>
							{#each visibleCells as cell (cell.x + '-' + cell.y)}
								<button
									class="cell {isCellAlive(cell.x, cell.y) ? 'alive' : 'dead'} virtualized"
									style="
										position: absolute;
										left: {cell.x * (cellSize() + 1)}px;
										top: {cell.y * (cellSize() + 1)}px;
										width: {cellSize()}px;
										height: {cellSize()}px;
									"
									onclick={() => handleCellClick(cell.x, cell.y)}
									aria-label="Cell at position {cell.x}, {cell.y}. Currently {isCellAlive(
										cell.x,
										cell.y
									)
										? 'alive'
										: 'dead'}"
									aria-selected={isCellAlive(cell.x, cell.y)}
									role="gridcell"
									data-x={cell.x}
									data-y={cell.y}
								></button>
							{/each}
						</div>
					{:else}
						<!-- Standard Grid for Small Grids -->
						<div
							class="game-grid"
							style="
								grid-template-columns: repeat({gridWidth}, 1fr);
								grid-template-rows: repeat({gridHeight}, 1fr);
							"
						>
							{#each visibleCells as cell (cell.x + '-' + cell.y)}
								<button
									class="cell {isCellAlive(cell.x, cell.y) ? 'alive' : 'dead'}"
									onclick={() => handleCellClick(cell.x, cell.y)}
									aria-label="Cell at position {cell.x}, {cell.y}. Currently {isCellAlive(
										cell.x,
										cell.y
									)
										? 'alive'
										: 'dead'}"
									aria-selected={isCellAlive(cell.x, cell.y)}
									role="gridcell"
									data-x={cell.x}
									data-y={cell.y}
								></button>
							{/each}
						</div>
					{/if}
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

	/* Game Grid Container - supports both standard and virtualized modes */
	.game-grid-container {
		width: 100%;
		height: 100%;
		background: rgba(21, 21, 21, 0.5);
		border-radius: 4px;
		padding: 2px;
		min-width: 300px;
		min-height: 300px;
		position: relative;
	}

	/* Virtualized container with scrolling */
	.game-grid-container.virtualized {
		overflow: auto;
		/* Custom scrollbar for better UX */
		scrollbar-width: thin;
		scrollbar-color: rgba(201, 42, 42, 0.3) rgba(21, 21, 21, 0.2);
	}

	/* Webkit scrollbar styling */
	.game-grid-container.virtualized::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.game-grid-container.virtualized::-webkit-scrollbar-track {
		background: rgba(21, 21, 21, 0.2);
		border-radius: 4px;
	}

	.game-grid-container.virtualized::-webkit-scrollbar-thumb {
		background: rgba(201, 42, 42, 0.3);
		border-radius: 4px;
	}

	.game-grid-container.virtualized::-webkit-scrollbar-thumb:hover {
		background: rgba(201, 42, 42, 0.5);
	}

	/* Standard grid layout for small grids */
	.game-grid {
		display: grid;
		gap: 1px;
		width: 100%;
		height: 100%;
	}

	/* Virtual grid viewport - contains absolutely positioned cells */
	.grid-viewport {
		background: transparent;
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
		min-width: 4px;
		min-height: 4px;
		width: 100%;
		height: 100%;
	}

	/* Virtualized cells have absolute positioning */
	.cell.virtualized {
		position: absolute;
		min-width: unset;
		min-height: unset;
		width: unset;
		height: unset;
		/* Optimize for better scrolling performance */
		will-change: transform;
		contain: layout style paint;
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
		}

		.game-grid-container {
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
		}

		.game-grid-container {
			min-width: 200px;
			min-height: 200px;
		}
	}
</style>
