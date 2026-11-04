<!--
DSA Visualizer Board

The plate: sort bars or the pathfinding grid inside a 1.5px ink border, then the
reading row (state, algorithm, counts, step) on a hairline rule, the state legend
for the grid, and the current step as a serif caption.
-->

<script lang="ts">
	import type { DSAState, GridNode } from '../types';
	import {
		toggleWall,
		setStartPoint,
		setEndPoint,
		getCurrentStepDescription
	} from '../store.svelte.js';

	interface Props {
		state: DSAState;
	}

	// Destructured under another name: a local called `state` would shadow the $state rune
	let { state: dsa }: Props = $props();

	let maxValue = $derived(dsa.mode === 'SORTING' ? Math.max(...dsa.array) : 100);
	let stepDescription = $derived(getCurrentStepDescription());
	let algorithmName = $derived(dsa.algorithm === 'A_STAR' ? 'A*' : dsa.algorithm.replace('_', ' '));
	let stateWord = $derived(
		dsa.completed
			? 'Completed'
			: dsa.isAnimating
				? 'Running'
				: dsa.currentStep > 0
					? 'Paused'
					: 'Ready'
	);

	function barHeight(value: number): number {
		if (maxValue === 0) return 5;
		return Math.max((value / maxValue) * 100, 2);
	}

	function barClass(index: number): string {
		if (dsa.comparing.includes(index)) return 'comparing';
		if (dsa.sorted.includes(index)) return 'sorted';
		return '';
	}

	function cellState(node: GridNode): string {
		if (node.isStart) return 'start';
		if (node.isEnd) return 'end';
		if (node.isWall) return 'wall';
		if (node.isPath) return 'path';
		if (node.isCurrent) return 'current';
		if (node.isVisited) return 'visited';
		if (node.isFrontier) return 'frontier';
		return 'empty';
	}

	function describe(node: GridNode): string {
		const s = cellState(node);
		return s[0].toUpperCase() + s.slice(1);
	}

	// What a tap or drag does on the grid. Placing the start hands the tool to the end, and
	// placing the end hands it back to walls, so the common path is three taps and Play.
	type Tool = 'wall' | 'start' | 'end';
	let tool: Tool = $state('wall');

	// Drag state for drawing walls or moving the start/end markers
	let dragging = false;
	let draggingStart = false;
	let draggingEnd = false;

	function place(x: number, y: number) {
		if (tool === 'start') {
			setStartPoint(x, y);
			tool = dsa.end ? 'wall' : 'end';
		} else if (tool === 'end') {
			setEndPoint(x, y);
			tool = 'wall';
		}
	}

	function handleCellPointerDown(x: number, y: number, event: PointerEvent) {
		if (dsa.mode !== 'PATHFINDING' || dsa.isAnimating) return;

		event.preventDefault();
		// Touch captures the pointer to its target by default, which would stop pointerenter
		// on neighbouring cells; releasing it lets the drag paint across the grid.
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		dragging = true;

		const node = dsa.grid[y]?.[x];
		if (!node) return;

		if (tool !== 'wall') {
			place(x, y);
			dragging = false;
		} else if (node.isStart) {
			draggingStart = true;
		} else if (node.isEnd) {
			draggingEnd = true;
		} else {
			toggleWall(x, y);
		}
	}

	function handleCellPointerEnter(x: number, y: number) {
		if (!dragging || dsa.mode !== 'PATHFINDING' || dsa.isAnimating) return;

		if (draggingStart) {
			setStartPoint(x, y);
		} else if (draggingEnd) {
			setEndPoint(x, y);
		} else {
			toggleWall(x, y);
		}
	}

	function endDrag() {
		dragging = false;
		draggingStart = false;
		draggingEnd = false;
	}

	// Double-click still works as a shortcut for anyone who knew the old behaviour
	function handleCellDoubleClick(x: number, y: number) {
		if (dsa.mode !== 'PATHFINDING' || dsa.isAnimating) return;
		const node = dsa.grid[y]?.[x];
		if (!node || node.isWall || node.isStart || node.isEnd) return;
		if (!dsa.start) setStartPoint(x, y);
		else setEndPoint(x, y);
	}
</script>

<svelte:window onpointerup={endDrag} onpointercancel={endDrag} onblur={endDrag} />

<div class="plate" class:paused={!dsa.isAnimating}>
	{#if dsa.mode === 'SORTING'}
		<div class="bars" role="img" aria-label="{algorithmName} on {dsa.array.length} values">
			{#each dsa.array as value, index (index)}
				<div class="bar-column">
					<div
						class="bar {barClass(index)}"
						style:height="{barHeight(value)}%"
						title="Value: {value}, Index: {index}"
					></div>
					<span class="bar-label">{value}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="tools caps" role="group" aria-label="Drawing tool">
			<span>Tap or drag to</span>
			<button
				type="button"
				class="btn"
				class:active={tool === 'wall'}
				onclick={() => (tool = 'wall')}
				disabled={dsa.isAnimating}>Draw walls</button
			>
			<button
				type="button"
				class="btn"
				class:active={tool === 'start'}
				onclick={() => (tool = 'start')}
				disabled={dsa.isAnimating}>Place start</button
			>
			<button
				type="button"
				class="btn"
				class:active={tool === 'end'}
				onclick={() => (tool = 'end')}
				disabled={dsa.isAnimating}>Place end</button
			>
		</div>
		<div
			class="grid"
			style:grid-template-columns="repeat({dsa.gridSize.width}, 1fr)"
			style:grid-template-rows="repeat({dsa.gridSize.height}, 1fr)"
			style:aspect-ratio="{dsa.gridSize.width} / {dsa.gridSize.height}"
		>
			{#each dsa.grid as row, y (y)}
				{#each row as node, x (`${y}-${x}`)}
					<button
						type="button"
						class="cell cell-{cellState(node)}"
						onpointerdown={(e) => handleCellPointerDown(x, y, e)}
						onpointerenter={() => handleCellPointerEnter(x, y)}
						ondblclick={() => handleCellDoubleClick(x, y)}
						aria-label="Grid cell at ({x}, {y}) - {describe(node)}"
						title="({x}, {y}) - {describe(node)}"
					>
						{#if node.isStart}S{:else if node.isEnd}E{/if}
					</button>
				{/each}
			{/each}
		</div>
	{/if}
</div>

<p class="reading caps">
	<span class="state">{stateWord}</span>
	<span>{algorithmName}</span>
	{#if dsa.mode === 'SORTING'}
		<span>{dsa.array.length} values</span>
		<span>{dsa.comparisons} comparisons</span>
		<span>{dsa.swaps} swaps</span>
	{:else}
		<span>{dsa.gridSize.width}×{dsa.gridSize.height} grid</span>
		<span>{dsa.nodesVisited} visited</span>
		<span>path {dsa.pathLength}</span>
	{/if}
	<span>step {dsa.currentStep} / {Math.max(dsa.totalSteps, 0)}</span>
</p>

{#if dsa.mode === 'PATHFINDING'}
	<ul class="legend caps" aria-label="Grid legend">
		<li><i class="cell cell-empty"></i>Open</li>
		<li><i class="cell cell-wall"></i>Wall</li>
		<li><i class="cell cell-frontier"></i>Frontier</li>
		<li><i class="cell cell-visited"></i>Visited</li>
		<li><i class="cell cell-current"></i>Current</li>
		<li><i class="cell cell-path"></i>Path</li>
		<li><i class="cell cell-start">S</i>Start</li>
		<li><i class="cell cell-end">E</i>End</li>
	</ul>
{/if}

<p class="caption">
	{#if stepDescription}
		{stepDescription}
	{:else if dsa.mode === 'SORTING'}
		Ready. Press Play, or step through one comparison at a time.
	{:else}
		Start and end are placed. Drag to draw walls, or pick a tool above the grid to move them, then
		press Play.
	{/if}
</p>

<style>
	.plate {
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
		padding: 12px;
	}
	.plate.paused {
		border-style: dashed;
	}

	/* Sorting */
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		aspect-ratio: 16 / 9;
		max-height: 70vh;
	}
	.bar-column {
		flex: 1;
		min-width: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
	}
	.bar {
		width: 100%;
		background: var(--color-spot);
	}
	.bar.comparing {
		background: var(--color-ink);
	}
	.bar.sorted {
		border-top: 1.5px solid var(--color-ink);
	}
	.bar-label {
		margin-top: 4px;
		font-family: var(--font-family-sans);
		font-size: 10px;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	/* Pathfinding */
	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin: 0 0 10px;
		font-weight: 400;
	}
	.grid {
		display: grid;
		gap: 1px;
		width: 100%;
		touch-action: none;
		user-select: none;
	}
	.cell {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1;
		min-width: 0;
		padding: 0;
		margin: 0;
		/* every state keeps a 1px border so switching colour never shifts layout */
		border: 1px solid transparent;
		cursor: pointer;
		font-family: var(--font-family-sans);
		font-size: min(14px, 2.4vw);
		font-weight: 700;
		line-height: 1;
		color: var(--color-paper);
		position: relative;
	}
	.cell:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: -1px;
		z-index: 1;
	}
	.cell-empty {
		background: var(--color-paper);
		border-color: var(--color-tint);
	}
	.cell-empty:hover {
		border-color: var(--color-ink);
	}
	.cell-wall {
		background: var(--color-ink);
	}
	.cell-frontier {
		background: var(--color-paper);
		border-color: var(--color-spot);
	}
	.cell-visited {
		background: var(--color-tint);
		border-color: var(--color-tint);
	}
	.cell-current,
	.cell-path {
		background: var(--color-spot);
	}
	.cell-start,
	.cell-end {
		background: var(--color-spot-dim);
	}
	.cell-path::after {
		content: '';
		width: 30%;
		height: 30%;
		background: var(--color-paper);
	}

	/* Reading row and legend */
	.reading {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		margin: 8px 0 0;
		padding-top: 8px;
		border-top: 1px solid var(--color-ink);
		color: var(--color-spot);
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
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		margin: 10px 0 0;
		padding: 0;
		list-style: none;
		font-weight: 400;
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.legend .cell {
		width: 12px;
		height: 12px;
		aspect-ratio: auto;
		font-size: 8px;
		font-style: normal;
		cursor: default;
	}
	.caption {
		margin: 10px 0 0;
		font-size: 15.5px;
		font-style: italic;
		min-height: 3em;
		text-wrap: pretty;
	}
	@media (max-width: 480px) {
		.bar-label {
			display: none;
		}
	}
</style>
