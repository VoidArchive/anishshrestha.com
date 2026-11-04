<!--
Conway's Game of Life - Interactive Game Grid Component

The plate: a 1.5px ink border on paper, tint grid lines, live cells in the spot
colour while running and ink when paused. Cell size derives from the container
width; the grid scrolls when the cells would otherwise fall below the touch floor.
Implements virtual scrolling for large grids (>50x50) to optimize performance.
-->

<script lang="ts">
	import { simulationState, toggleCellAt } from '../store.svelte.js';

	function handleCellClick(x: number, y: number): void {
		toggleCellAt(x, y);
	}

	function isCellAlive(x: number, y: number): boolean {
		return simulationState.grid[y]?.[x] === true;
	}

	let gridWidth = $derived(simulationState.gridSize.width);
	let gridHeight = $derived(simulationState.gridSize.height);
	let running = $derived(simulationState.isRunning);

	let gridContainer: HTMLDivElement;
	let scrollTop = $state(0);
	let scrollLeft = $state(0);
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let narrow = $state(false);

	// Cells fill the container width; on phones they never drop below 24px so a finger can hit one
	let cellSize = $derived(() => {
		const fit = Math.floor(containerWidth / gridWidth) - 1;
		return Math.max(narrow ? 24 : 6, fit);
	});

	let useVirtualization = $derived(gridWidth > 50 || gridHeight > 50);

	let viewportBounds = $derived(() => {
		if (!useVirtualization) return null;

		const cellSizeWithGap = cellSize() + 1;
		const visibleCols = Math.ceil(containerWidth / cellSizeWithGap);
		const visibleRows = Math.ceil(containerHeight / cellSizeWithGap);

		const bufferCols = Math.max(2, Math.ceil(visibleCols * 0.1));
		const bufferRows = Math.max(2, Math.ceil(visibleRows * 0.1));

		const startCol = Math.max(0, Math.floor(scrollLeft / cellSizeWithGap) - bufferCols);
		const endCol = Math.min(gridWidth - 1, startCol + visibleCols + bufferCols * 2);
		const startRow = Math.max(0, Math.floor(scrollTop / cellSizeWithGap) - bufferRows);
		const endRow = Math.min(gridHeight - 1, startRow + visibleRows + bufferRows * 2);

		return { startCol, endCol, startRow, endRow, visibleCols, visibleRows };
	});

	let visibleCells = $derived.by(() => {
		if (!useVirtualization) {
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

	function handleScroll(event: Event): void {
		const target = event.target as HTMLDivElement;
		scrollTop = target.scrollTop;
		scrollLeft = target.scrollLeft;
	}

	function updateContainerDimensions(): void {
		if (gridContainer) {
			containerWidth = gridContainer.clientWidth;
			containerHeight = gridContainer.clientHeight;
			narrow = window.innerWidth <= 1024;
		}
	}

	$effect(() => {
		if (gridContainer) {
			updateContainerDimensions();
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateContainerDimensions);
			return () => {
				window.removeEventListener('resize', updateContainerDimensions);
			};
		}
	});
</script>

<div
	bind:this={gridContainer}
	class="game-grid-container"
	class:running
	onscroll={useVirtualization ? handleScroll : undefined}
	role="grid"
	aria-label="Conway's Game of Life grid, {gridWidth} by {gridHeight} cells. Click a cell to toggle it."
>
	{#if useVirtualization}
		<div
			class="grid-viewport"
			style="
				width: {gridWidth * (cellSize() + 1) - 1}px;
				height: {gridHeight * (cellSize() + 1) - 1}px;
			"
		>
			{#each visibleCells as cell (cell.x + '-' + cell.y)}
				<button
					class="cell {isCellAlive(cell.x, cell.y) ? 'alive' : 'dead'} virtualized"
					style="
						left: {cell.x * (cellSize() + 1)}px;
						top: {cell.y * (cellSize() + 1)}px;
						width: {cellSize()}px;
						height: {cellSize()}px;
					"
					onclick={() => handleCellClick(cell.x, cell.y)}
					aria-label="Cell at position {cell.x}, {cell.y}. Currently {isCellAlive(cell.x, cell.y)
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
		<div
			class="game-grid"
			style="
				grid-template-columns: repeat({gridWidth}, {cellSize()}px);
				grid-template-rows: repeat({gridHeight}, {cellSize()}px);
			"
		>
			{#each visibleCells as cell (cell.x + '-' + cell.y)}
				<button
					class="cell {isCellAlive(cell.x, cell.y) ? 'alive' : 'dead'}"
					onclick={() => handleCellClick(cell.x, cell.y)}
					aria-label="Cell at position {cell.x}, {cell.y}. Currently {isCellAlive(cell.x, cell.y)
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

<style>
	/* The plate. Dashed while paused, solid while running, like every plate on the spread. */
	.game-grid-container {
		width: 100%;
		max-height: 80vh;
		overflow: auto;
		border: 1.5px dashed var(--color-ink);
		background: var(--color-paper);
		scrollbar-width: thin;
		scrollbar-color: var(--color-ink) var(--color-paper);
	}

	.game-grid-container.running {
		border-style: solid;
	}

	/* Tint shows through the 1px gaps as the grid lines */
	.game-grid {
		display: grid;
		gap: 1px;
		width: max-content;
		background: var(--color-tint);
	}

	.grid-viewport {
		position: relative;
		background: var(--color-tint);
	}

	.cell {
		border: 0;
		padding: 0;
		margin: 0;
		cursor: crosshair;
		display: block;
	}

	.cell.virtualized {
		position: absolute;
		contain: layout style paint;
	}

	.cell.dead {
		background: var(--color-paper);
	}

	.cell.dead:hover {
		background: var(--color-tint);
	}

	.cell.alive {
		background: var(--color-ink);
	}

	.running .cell.alive {
		background: var(--color-spot);
	}

	.cell:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: -2px;
		position: relative;
		z-index: 1;
	}

	.cell.virtualized:focus-visible {
		position: absolute;
	}
</style>
