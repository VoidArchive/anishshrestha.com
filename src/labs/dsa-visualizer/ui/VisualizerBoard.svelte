<!--
DSA Visualizer Board Component

Displays visualization for sorting algorithms and pathfinding algorithms.
For sorting: Shows array bars with proper scaling and site color scheme.
For pathfinding: Shows interactive grid with transparent styling matching Game of Life.
Responsive design with proper click handling and space utilization.
-->

<script lang="ts">
	import type { DSAState } from '../types';
	import { toggleWall, setStartPoint, setEndPoint } from '../store.svelte';
	
	interface Props {
		state: DSAState;
	}
	
	let { state }: Props = $props();
	
	// Calculate bar heights for sorting visualization (0-100% scaling)
	function getBarHeight(value: number, maxValue: number): number {
		if (maxValue === 0) return 5;
		return Math.max((value / maxValue) * 100, 2); // Min 2% height for visibility
	}
	
	// Get maximum value in array for proper scaling
	let maxValue = $derived(state.mode === 'SORTING' ? Math.max(...state.array) : 100);
	
	// Get bar color based on state - using site color scheme
	function getBarColor(index: number): string {
		if (state.sorted.includes(index)) {
			return 'bar-sorted'; // Green for sorted
		} else if (state.comparing.includes(index)) {
			return 'bar-comparing'; // Red for comparing
		} else {
			return 'bar-default'; // Default gray
		}
	}
	
	// Get grid cell color for pathfinding - enhanced multi-layer visualization
	function getCellColor(x: number, y: number): string {
		const node = state.grid[y]?.[x];
		if (!node) return 'cell-empty';
		
		// Priority order for visual states
		if (node.isStart) return 'cell-start';
		if (node.isEnd) return 'cell-end'; 
		if (node.isWall) return 'cell-wall';
		if (node.isPath) return 'cell-path';
		if (node.isCurrent) return 'cell-current';
		if (node.isFrontier) return 'cell-frontier';
		if (node.isVisited) return 'cell-visited';
		
		return 'cell-empty';
	}
	
	// Handle grid cell interactions for pathfinding
	let isMouseDown = false;
	let isDraggingStart = false;
	let isDraggingEnd = false;
	
	function handleCellMouseDown(x: number, y: number, event: MouseEvent) {
		if (state.mode !== 'PATHFINDING' || state.isAnimating) return;
		
		event.preventDefault();
		isMouseDown = true;
		
		const node = state.grid[y]?.[x];
		if (!node) return;
		
		if (node.isStart) {
			isDraggingStart = true;
		} else if (node.isEnd) {
			isDraggingEnd = true;
		} else {
			// Toggle wall
			toggleWall(x, y);
		}
	}
	
	function handleCellMouseEnter(x: number, y: number) {
		if (!isMouseDown || state.mode !== 'PATHFINDING' || state.isAnimating) return;
		
		if (isDraggingStart) {
			setStartPoint(x, y);
		} else if (isDraggingEnd) {
			setEndPoint(x, y);
		} else {
			toggleWall(x, y);
		}
	}
	
	function handleMouseUp() {
		isMouseDown = false;
		isDraggingStart = false;
		isDraggingEnd = false;
	}
	
	function handleCellDoubleClick(x: number, y: number) {
		if (state.mode !== 'PATHFINDING' || state.isAnimating) return;
		
		const node = state.grid[y]?.[x];
		if (!node) return;
		
		// Double-click to set start point if none exists
		if (!state.start && !node.isWall && !node.isEnd) {
			setStartPoint(x, y);
		}
		// Double-click to set end point if start exists but no end
		else if (state.start && !state.end && !node.isWall && !node.isStart) {
			setEndPoint(x, y);
		}
	}
</script>

<!-- Global mouse up listener -->
<svelte:window onmouseup={handleMouseUp} />

<!-- Recessed Board Container matching Game of Life -->
<div class="board-container">
	{#if state.mode === 'PATHFINDING'}
		<!-- Compact Grid Info -->
		<div class="grid-info">
			<span class="grid-size">{state.gridSize.width}×{state.gridSize.height}</span>
			<span class="interaction-hint">Double-click to set start/end • Click/drag for walls</span>
		</div>
	{/if}

	<!-- Board Well -->
	<div class="board-well">
		<div class="board-inner">
			<div class="board-wrapper">
				{#if state.mode === 'SORTING'}
					<!-- Sorting Visualization -->
					<div class="sorting-container">
						<div class="bars-wrapper">
							{#each state.array as value, index}
								<div class="bar-container">
									<!-- Bar with proper scaling -->
									<div
										class="bar {getBarColor(index)}"
										style:height="{getBarHeight(value, maxValue)}%"
										title="Value: {value}, Index: {index}"
									></div>
									<!-- Value label -->
									<span class="bar-label">{value}</span>
								</div>
							{/each}
						</div>
					</div>
				{:else if state.mode === 'PATHFINDING'}
					<!-- Pathfinding Visualization -->
					<div class="pathfinding-container">
						<div 
							class="pathfinding-grid"
							style:grid-template-columns="repeat({state.gridSize.width}, 1fr)"
							style:grid-template-rows="repeat({state.gridSize.height}, 1fr)"
						>
							{#each state.grid as row, y}
								{#each row as node, x}
									<button
										class="grid-cell {getCellColor(x, y)}"
										onmousedown={(e) => handleCellMouseDown(x, y, e)}
										onmouseenter={() => handleCellMouseEnter(x, y)}
										ondblclick={() => handleCellDoubleClick(x, y)}
										title="({x}, {y}) - {node.isStart ? 'Start' : node.isEnd ? 'End' : node.isWall ? 'Wall' : node.isPath ? 'Path' : node.isCurrent ? 'Current' : node.isFrontier ? 'Frontier' : node.isVisited ? 'Visited' : 'Empty'}"
									></button>
								{/each}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Board container takes full available space */
	.board-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		height: 100%;
	}

	/* Compact Grid Info */
	.grid-info {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: center;
		margin-bottom: var(--space-2);
		flex-shrink: 0;
	}

	.grid-size {
		font-weight: 600;
	}

	.interaction-hint {
		font-style: italic;
		color: var(--color-text-secondary);
	}

	/* Board Well - matching Game of Life exactly but no rounded corners */
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
		/* Deep inset effect - NO rounded corners */
		box-shadow: 
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			inset 0 0 20px rgba(0, 0, 0, 0.5),
			inset 0 0 40px rgba(201, 42, 42, 0.02);
		border-radius: 0; /* Remove rounded corners */
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

	/* Sorting Styles */
	.sorting-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		min-height: 300px;
	}
	
	.bars-wrapper {
		display: flex;
		align-items: end;
		justify-content: center;
		gap: 2px;
		height: 90%;
		width: 100%;
		max-width: 800px;
	}
	
	.bar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		min-width: 8px;
		max-width: 40px;
		height: 100%;
	}
	
	.bar {
		width: 100%;
		transition: all 0.3s ease;
		border-radius: 0; /* No rounded corners */
		position: relative;
	}

	/* Bar color classes - using site color scheme */
	.bar-default {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
	}

	.bar-comparing {
		background: var(--color-primary);
		border: 1px solid var(--color-primary);
		box-shadow: 0 0 4px rgba(201, 42, 42, 0.3);
	}

	.bar-sorted {
		background: #10b981; /* Green for sorted */
		border: 1px solid #10b981;
		box-shadow: 0 0 4px rgba(16, 185, 129, 0.3);
	}
	
	.bar-label {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
		text-align: center;
	}

	/* Pathfinding Styles - matching Game of Life */
	.pathfinding-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
	}
	
	.pathfinding-grid {
		display: grid;
		gap: 1px;
		background: rgba(21, 21, 21, 0.5); /* Transparent like GoL */
		border-radius: 0; /* No rounded corners */
		padding: 2px;
		width: 100%;
		height: 100%;
		min-width: 300px;
		min-height: 300px;
	}
	
	.grid-cell {
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
		min-width: 0;
		min-height: 0;
		aspect-ratio: 1;
		border-radius: 0; /* No rounded corners */
		padding: 0;
		margin: 0;
		outline: none;
	}
	
	.grid-cell:hover {
		transform: scale(1.1);
		z-index: 1;
		position: relative;
	}
	
	.grid-cell:active {
		transform: scale(0.9);
	}

	/* Grid cell color classes - matching Game of Life transparency */
	.cell-empty {
		background: var(--color-bg-secondary);
		opacity: 0.8;
	}

	.cell-empty:hover {
		background: #fef2f2;
		opacity: 1;
	}

	.cell-wall {
		background: var(--color-text-muted);
		opacity: 1;
	}

	.cell-wall:hover {
		background: var(--color-text-primary);
	}

	.cell-start {
		background: #10b981; /* Green */
		box-shadow: 0 0 4px rgba(16, 185, 129, 0.3);
		opacity: 1;
	}

	.cell-start:hover {
		background: #059669;
		box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
	}

	.cell-end {
		background: var(--color-primary); /* Red */
		box-shadow: 0 0 4px rgba(201, 42, 42, 0.3);
		opacity: 1;
	}

	.cell-end:hover {
		background: #b91c1c;
		box-shadow: 0 0 6px rgba(201, 42, 42, 0.5);
	}

	.cell-path {
		background: #fbbf24; /* Yellow */
		box-shadow: 0 0 4px rgba(251, 191, 36, 0.3);
		opacity: 1;
	}

	.cell-visited {
		background: #bfdbfe; /* Light blue */
		opacity: 0.9;
	}

	.cell-frontier {
		background: #c7d2fe; /* Lighter blue for frontier */
		box-shadow: 0 0 2px rgba(99, 102, 241, 0.3);
		opacity: 0.8;
		animation: frontier-pulse 1s ease-in-out infinite alternate;
	}

	.cell-current {
		background: #fef08a; /* Bright yellow for current exploring */
		box-shadow: 0 0 6px rgba(254, 240, 138, 0.6);
		opacity: 1;
		animation: current-pulse 0.8s ease-in-out infinite alternate;
	}

	/* Animations for better UX */
	@keyframes frontier-pulse {
		from { opacity: 0.6; }
		to { opacity: 0.9; }
	}

	@keyframes current-pulse {
		from { 
			transform: scale(1);
			box-shadow: 0 0 6px rgba(254, 240, 138, 0.6);
		}
		to { 
			transform: scale(1.05);
			box-shadow: 0 0 8px rgba(254, 240, 138, 0.8);
		}
	}

	.grid-cell:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
		z-index: 2;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.sorting-container {
			padding: 0.5rem;
		}
		
		.bar-label {
			font-size: 0.625rem;
		}
		
		.pathfinding-container {
			padding: 0.5rem;
		}
		
		.grid-info {
			flex-direction: column;
			gap: var(--space-1);
		}
		
		.pathfinding-grid {
			min-width: 250px;
			min-height: 250px;
		}

		.grid-cell {
			min-width: 6px;
			min-height: 6px;
		}
	}
	
	@media (max-width: 480px) {
		.bars-wrapper {
			gap: 1px;
		}
		
		.bar-container {
			min-width: 6px;
		}
		
		.bar-label {
			display: none;
		}

		.grid-cell {
			min-width: 4px;
			min-height: 4px;
		}
		
		.pathfinding-grid {
			gap: 0.5px;
			min-width: 200px;
			min-height: 200px;
		}
	}
</style>