<!--
DSA Visualizer Control Panel

Simulation, algorithm, settings and data controls as grotesk-caps buttons and
native inputs, grouped under plain caps labels.
-->

<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Square } from '@lucide/svelte';
	import type { AlgorithmType, SortingAlgorithm, PathfindingAlgorithm } from '../types';

	interface Props {
		mode: AlgorithmType;
		algorithm: SortingAlgorithm | PathfindingAlgorithm;
		arraySize: number;
		animationSpeed: number;
		isAnimating: boolean;
		completed: boolean;
		currentStep: number;
		totalSteps: number;
		onModeChange: (mode: AlgorithmType) => void;
		onAlgorithmChange: (algorithm: SortingAlgorithm | PathfindingAlgorithm) => void;
		onArraySizeChange: (size: number) => void;
		onAnimationSpeedChange: (speed: number) => void;
		onStart: () => void;
		onPause: () => void;
		onResume: () => void;
		onStepForward: () => void;
		onStepBackward: () => void;
		onShuffle: () => void;
		onClearWalls: () => void;
		onReset: () => void;
		onSkipToEnd?: () => void;
	}

	let {
		mode,
		algorithm,
		arraySize,
		animationSpeed,
		isAnimating,
		completed,
		currentStep,
		totalSteps,
		onModeChange,
		onAlgorithmChange,
		onArraySizeChange,
		onAnimationSpeedChange,
		onStart,
		onPause,
		onResume,
		onStepForward,
		onStepBackward,
		onShuffle,
		onClearWalls,
		onReset,
		onSkipToEnd
	}: Props = $props();

	const sortingAlgorithms: { value: SortingAlgorithm; label: string }[] = [
		{ value: 'BUBBLE_SORT', label: 'Bubble Sort' },
		{ value: 'SELECTION_SORT', label: 'Selection Sort' },
		{ value: 'INSERTION_SORT', label: 'Insertion Sort' },
		{ value: 'QUICK_SORT', label: 'Quick Sort' },
		{ value: 'MERGE_SORT', label: 'Merge Sort' },
		{ value: 'HEAP_SORT', label: 'Heap Sort' }
	];

	const pathfindingAlgorithms: { value: PathfindingAlgorithm; label: string }[] = [
		{ value: 'BFS', label: 'Breadth-First Search' },
		{ value: 'DFS', label: 'Depth-First Search' },
		{ value: 'DIJKSTRA', label: "Dijkstra's Algorithm" },
		{ value: 'A_STAR', label: 'A* Algorithm' }
	];

	const speedOptions = [
		{ value: 0, label: 'Instant' },
		{ value: 10, label: 'Ultra Fast (10ms)' },
		{ value: 25, label: 'Very Fast (25ms)' },
		{ value: 50, label: 'Fast (50ms)' },
		{ value: 100, label: 'Normal (100ms)' },
		{ value: 250, label: 'Slow (250ms)' },
		{ value: 500, label: 'Very Slow (500ms)' }
	];

	function handleAlgorithmChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		onAlgorithmChange(target.value as SortingAlgorithm | PathfindingAlgorithm);
	}

	function handleArraySizeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onArraySizeChange(parseInt(target.value));
	}

	function handleSpeedChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		onAnimationSpeedChange(parseInt(target.value));
	}

	function toggleSimulation() {
		if (isAnimating) {
			onPause();
		} else if (completed) {
			onReset();
		} else if (currentStep === 0) {
			onStart();
		} else {
			onResume();
		}
	}
</script>

<div class="control-panel">
	<div class="group">
		<h3 class="caps">Simulation</h3>
		<div class="row">
			<button
				type="button"
				class="btn"
				onclick={toggleSimulation}
				aria-label={isAnimating ? 'Pause simulation' : completed ? 'Restart' : 'Start simulation'}
			>
				{#if isAnimating}
					<Pause size={14} />
					Pause
				{:else if completed}
					<RotateCcw size={14} />
					Restart
				{:else}
					<Play size={14} />
					Play
				{/if}
			</button>

			<button
				type="button"
				class="btn step-btn"
				onclick={onStepBackward}
				disabled={isAnimating || currentStep === 0}
				aria-label="Step backward"
				title="Previous step"
			>
				<SkipBack size={14} />
			</button>
			<span class="caps step-indicator">{currentStep}/{totalSteps}</span>
			<button
				type="button"
				class="btn step-btn"
				onclick={onStepForward}
				disabled={isAnimating || completed || totalSteps === 0}
				aria-label="Step forward"
				title="Next step"
			>
				<SkipForward size={14} />
			</button>

			{#if onSkipToEnd && totalSteps > 0 && !completed && !isAnimating}
				<button
					type="button"
					class="btn"
					onclick={() => onSkipToEnd?.()}
					aria-label="Skip to end"
					title="Jump to final result"
				>
					Skip to End
				</button>
			{/if}
		</div>
	</div>

	<div class="group">
		<h3 class="caps">Algorithm</h3>
		<div class="row">
			<button
				type="button"
				class="btn mode-btn"
				class:active={mode === 'SORTING'}
				onclick={() => onModeChange('SORTING')}
				disabled={isAnimating}
			>
				Sorting
			</button>
			<button
				type="button"
				class="btn mode-btn"
				class:active={mode === 'PATHFINDING'}
				onclick={() => onModeChange('PATHFINDING')}
				disabled={isAnimating}
			>
				Pathfinding
			</button>
		</div>
		<select
			aria-label="Algorithm"
			value={algorithm}
			onchange={handleAlgorithmChange}
			disabled={isAnimating}
		>
			{#if mode === 'SORTING'}
				{#each sortingAlgorithms as algo (algo.value)}
					<option value={algo.value}>{algo.label}</option>
				{/each}
			{:else}
				{#each pathfindingAlgorithms as algo (algo.value)}
					<option value={algo.value}>{algo.label}</option>
				{/each}
			{/if}
		</select>
	</div>

	<div class="group">
		<h3 class="caps">Settings</h3>
		{#if mode === 'SORTING'}
			<label class="caps field" for="array-size-input">
				<span>Array size</span>
				<span class="value">{arraySize}</span>
			</label>
			<input
				id="array-size-input"
				type="range"
				min="5"
				max="50"
				value={arraySize}
				oninput={handleArraySizeChange}
				disabled={isAnimating}
			/>
		{/if}
		<label class="caps field" for="speed-select">Speed</label>
		<select
			id="speed-select"
			value={animationSpeed}
			onchange={handleSpeedChange}
			disabled={isAnimating}
		>
			{#each speedOptions as speed (speed.value)}
				<option value={speed.value}>{speed.label}</option>
			{/each}
		</select>
	</div>

	<div class="group">
		<h3 class="caps">Data</h3>
		<div class="row">
			<button
				type="button"
				class="btn"
				onclick={onShuffle}
				disabled={isAnimating}
				aria-label={mode === 'SORTING' ? 'Shuffle array' : 'Add random walls'}
				title={mode === 'SORTING' ? 'Generate new random array' : 'Add random walls to grid'}
			>
				<Shuffle size={14} />
				{mode === 'SORTING' ? 'Shuffle' : 'Random Walls'}
			</button>

			{#if mode === 'PATHFINDING'}
				<button
					type="button"
					class="btn"
					onclick={onClearWalls}
					disabled={isAnimating}
					aria-label="Clear all walls"
					title="Remove all walls from grid"
				>
					<Square size={14} />
					Clear Walls
				</button>
			{/if}

			<button
				type="button"
				class="btn"
				onclick={onReset}
				disabled={isAnimating}
				aria-label="Reset everything"
				title="Reset to initial state"
			>
				<RotateCcw size={14} />
				Reset All
			</button>
		</div>
	</div>
</div>

<style>
	.control-panel {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.group h3 {
		font-weight: 400;
		letter-spacing: 0.14em;
		font-size: 12px;
		border-bottom: 1px solid var(--color-ink);
		padding-bottom: 4px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.btn {
		white-space: nowrap;
		min-height: 32px;
	}
	.step-btn {
		min-width: 32px;
		justify-content: center;
		padding: 7px;
	}
	.step-indicator {
		min-width: 3.5em;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
	.mode-btn {
		flex: 1;
		justify-content: center;
	}
	select {
		width: 100%;
		min-height: 32px;
		padding: 6px 8px;
		font-size: 13px;
	}
	select:disabled,
	input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.field {
		display: flex;
		justify-content: space-between;
		font-weight: 400;
	}
	.field .value {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* Range: a hairline track and a square spot thumb; the only non-native control */
	input[type='range'] {
		width: 100%;
		height: 24px;
		margin: 0;
		border: 0;
		background: transparent;
		appearance: none;
		cursor: pointer;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 1px;
		background: var(--color-ink);
	}
	input[type='range']::-moz-range-track {
		height: 1px;
		background: var(--color-ink);
	}
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 20px;
		margin-top: -10px;
		border: 0;
		background: var(--color-spot);
	}
	input[type='range']::-moz-range-thumb {
		width: 12px;
		height: 20px;
		border: 0;
		border-radius: 0;
		background: var(--color-spot);
	}
</style>
