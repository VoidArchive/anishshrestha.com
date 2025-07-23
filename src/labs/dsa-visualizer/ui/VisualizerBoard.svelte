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

		// Priority order for visual states (higher priority = rendered on top)
		if (node.isStart) return 'cell-start';
		if (node.isEnd) return 'cell-end';
		if (node.isWall) return 'cell-wall';
		if (node.isPath) return 'cell-path';
		if (node.isCurrent) return 'cell-current exploring'; // Enhanced current state
		if (node.isFrontier) return 'cell-frontier pulsing'; // Enhanced frontier
		if (node.isVisited) return 'cell-visited';

		return 'cell-empty';
	}

	// Get additional CSS classes for enhanced animations
	function getCellAnimationClass(x: number, y: number): string {
		const node = state.grid[y]?.[x];
		if (!node) return '';

		let classes = [];

		// Add distance-based coloring for Dijkstra
		if (state.algorithm === 'DIJKSTRA' && node.distance !== Infinity && node.isVisited) {
			const normalizedDistance = Math.min(node.distance / 20, 1); // Normalize to 0-1
			classes.push(`distance-${Math.floor(normalizedDistance * 5)}`); // 0-5 distance classes
		}

		// Add direction-based effects for A*
		if (state.algorithm === 'A_STAR' && node.fScore !== undefined) {
			const normalizedFScore = Math.min((node.fScore || 0) / 50, 1);
			classes.push(`fscore-${Math.floor(normalizedFScore * 3)}`); // 0-3 f-score classes
		}

		// Add exploration wave effect
		if (node.isVisited && !node.isPath && !node.isStart && !node.isEnd) {
			classes.push('wave-effect');
		}

		return classes.join(' ');
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
							{#each state.array as value, index (index)}
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
							style="aspect-ratio: {state.gridSize.width} / {state.gridSize.height};"
						>
							{#each state.grid as row, y (y)}
								{#each row as node, x (`${y}-${x}`)}
									<button
										class="grid-cell {getCellColor(x, y)} {getCellAnimationClass(x, y)}"
										onmousedown={(e) => handleCellMouseDown(x, y, e)}
										onmouseenter={() => handleCellMouseEnter(x, y)}
										ondblclick={() => handleCellDoubleClick(x, y)}
										aria-label="Grid cell at ({x}, {y}) - {node.isStart
											? 'Start'
											: node.isEnd
												? 'End'
												: node.isWall
													? 'Wall'
													: node.isPath
														? 'Path'
														: node.isCurrent
															? `Current (exploring)`
															: node.isFrontier
																? 'Frontier (queued)'
																: node.isVisited
																	? `Visited${node.distance !== Infinity ? ` (d:${node.distance})` : ''}`
																	: 'Empty'}"
										title="({x}, {y}) - {node.isStart
											? 'Start'
											: node.isEnd
												? 'End'
												: node.isWall
													? 'Wall'
													: node.isPath
														? 'Path'
														: node.isCurrent
															? `Current (exploring)`
															: node.isFrontier
																? 'Frontier (queued)'
																: node.isVisited
																	? `Visited${node.distance !== Infinity ? ` (d:${node.distance})` : ''}`
																	: 'Empty'}"
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
	/* Board container takes full available space with consistent sizing */
	.board-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 500px; /* Prevent layout shifts */
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
		padding: 0.25rem; /* Reduced padding for more space */
		/* Prevent layout shift by stabilizing container */
		contain: layout;
		flex: 1; /* Ensure it takes full available space */
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
		min-height: 300px; /* Much larger minimum */
		/* Force stable grid sizing */
		contain: layout size style;
	}

	.grid-cell {
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
		min-width: 8px; /* Larger minimum for better visibility */
		min-height: 8px;
		aspect-ratio: 1;
		border-radius: 0; /* No rounded corners */
		padding: 0;
		margin: 0;
		outline: none;
		/* Force stable cell sizing */
		contain: layout style;
		will-change: background, opacity;
	}

	.grid-cell:hover {
		background-color: rgba(255, 255, 255, 0.1);
		z-index: 1;
		position: relative;
	}

	.grid-cell:active {
		opacity: 0.8;
	}

	/* Grid cell color classes - consistent styling to prevent layout shifts */
	.cell-empty {
		background: var(--color-bg-secondary);
		opacity: 1;
		border: 1px solid transparent; /* Consistent border space */
	}

	.cell-empty:hover {
		background: #fef2f2;
		opacity: 1;
		border: 1px solid transparent;
	}

	.cell-wall {
		background: var(--color-text-muted);
		opacity: 1;
		border: 1px solid transparent; /* Consistent border space */
	}

	.cell-wall:hover {
		background: var(--color-text-primary);
		border: 1px solid transparent;
	}

	.cell-start {
		background: #10b981; /* Green */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
	}

	.cell-start:hover {
		background: #059669;
		border: 1px solid transparent;
	}

	.cell-end {
		background: var(--color-primary); /* Red */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
	}

	.cell-end:hover {
		background: #b91c1c;
		border: 1px solid transparent;
	}

	.cell-path {
		background: #fbbf24; /* Yellow */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
	}

	.cell-visited {
		background: #bfdbfe; /* Light blue */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
	}

	.cell-frontier {
		background: #c7d2fe; /* Lighter blue for frontier */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
		animation: frontier-pulse 1s ease-in-out infinite alternate;
	}

	.cell-current {
		background: #fef08a; /* Bright yellow for current exploring */
		border: 1px solid transparent; /* Consistent border space */
		opacity: 1;
		animation: current-pulse 0.8s ease-in-out infinite alternate;
	}

	/* Enhanced current state with exploring animation */
	.cell-current.exploring {
		background: linear-gradient(45deg, #fef08a, #f59e0b);
		border: 1px solid transparent; /* Consistent border space */
		animation: exploring-pulse 1s ease-in-out infinite;
	}

	/* Enhanced frontier with pulsing animation */
	.cell-frontier.pulsing {
		background: linear-gradient(135deg, #c7d2fe, #818cf8);
		border: 1px solid transparent; /* Consistent border space */
		animation: frontier-wave 1.5s ease-in-out infinite;
	}

	/* Animations for better UX - layout-shift free */
	@keyframes frontier-pulse {
		from {
			opacity: 0.8;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes current-pulse {
		from {
			opacity: 0.9;
		}
		to {
			opacity: 1;
		}
	}

	/* Enhanced exploring animation - only opacity changes */
	@keyframes exploring-pulse {
		0% {
			opacity: 0.9;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.9;
		}
	}

	/* Enhanced frontier wave animation - layout-shift free */
	@keyframes frontier-wave {
		0% {
			background: linear-gradient(135deg, #c7d2fe, #818cf8);
			opacity: 0.8;
		}
		50% {
			background: linear-gradient(135deg, #818cf8, #6366f1);
			opacity: 1;
		}
		100% {
			background: linear-gradient(135deg, #c7d2fe, #818cf8);
			opacity: 0.8;
		}
	}

	/* Wave effect for visited nodes - only affects opacity and background */
	.wave-effect {
		animation: wave-ripple 0.6s ease-out;
	}

	/* Algorithm-specific visualizations */
	/* Dijkstra distance-based coloring */
	.distance-0 {
		background-color: #dbeafe !important;
	} /* Very close - light blue */
	.distance-1 {
		background-color: #bfdbfe !important;
	} /* Close - medium blue */
	.distance-2 {
		background-color: #93c5fd !important;
	} /* Medium - blue */
	.distance-3 {
		background-color: #60a5fa !important;
	} /* Far - darker blue */
	.distance-4 {
		background-color: #3b82f6 !important;
	} /* Very far - dark blue */
	.distance-5 {
		background-color: #1d4ed8 !important;
	} /* Furthest - very dark blue */

	/* A* f-score based coloring */
	.fscore-0 {
		background: linear-gradient(45deg, #dbeafe, #e0e7ff) !important;
		border: 1px solid transparent !important; /* Consistent with other cells */
	}
	.fscore-1 {
		background: linear-gradient(45deg, #bfdbfe, #c7d2fe) !important;
		border: 1px solid transparent !important; /* Consistent with other cells */
	}
	.fscore-2 {
		background: linear-gradient(45deg, #93c5fd, #a5b4fc) !important;
		border: 1px solid transparent !important; /* Consistent with other cells */
	}
	.fscore-3 {
		background: linear-gradient(45deg, #60a5fa, #818cf8) !important;
		border: 1px solid transparent !important; /* Consistent with other cells */
	}

	@keyframes wave-ripple {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.9;
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
			padding: 0.25rem;
		}

		.grid-info {
			flex-direction: column;
			gap: var(--space-1);
		}

		.pathfinding-grid {
			min-width: 300px; /* Increased minimum */
			min-height: 350px; /* Much larger for mobile */
		}

		.grid-cell {
			min-width: 8px; /* Larger for better touch targets */
			min-height: 8px;
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
			min-width: 6px; /* Larger minimum for small screens */
			min-height: 6px;
		}

		.pathfinding-grid {
			gap: 0.5px;
			min-width: 280px; /* Increased minimum */
			min-height: 320px; /* Much larger */
		}
	}
</style>
