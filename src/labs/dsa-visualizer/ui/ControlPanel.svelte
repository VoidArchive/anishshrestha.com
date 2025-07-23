<!--
DSA Visualizer Control Panel

Consolidated control panel matching Game of Life's design pattern.
Provides simulation controls, algorithm selection, settings, and grid controls
in logical groupings for better UX and consistency.
-->

<script lang="ts">
	import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Square } from 'lucide-svelte';
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

	// Updated speed options with much faster ranges
	const speedOptions = [
		{ value: 0, label: 'Instant' },
		{ value: 10, label: 'Ultra Fast (10ms)' },
		{ value: 25, label: 'Very Fast (25ms)' },
		{ value: 50, label: 'Fast (50ms)' },
		{ value: 100, label: 'Normal (100ms)' },
		{ value: 250, label: 'Slow (250ms)' },
		{ value: 500, label: 'Very Slow (500ms)' }
	];

	function handleModeChange(newMode: AlgorithmType) {
		onModeChange(newMode);
	}

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
		} else {
			if (currentStep === 0) {
				onStart();
			} else {
				onResume();
			}
		}
	}

	function handleSkipToEnd() {
		onSkipToEnd?.();
	}
</script>

<div class="control-panel">
	<!-- Simulation Controls -->
	<div class="control-group">
		<h4 class="control-group-title">Simulation</h4>
		<div class="simulation-controls">
			<!-- Primary Play/Pause Button -->
			<button
				class="btn control-btn primary"
				onclick={toggleSimulation}
				aria-label={isAnimating ? 'Pause simulation' : completed ? 'Restart' : 'Start simulation'}
			>
				{#if isAnimating}
					<Pause size={16} />
					Pause
				{:else if completed}
					<RotateCcw size={16} />
					Restart
				{:else}
					<Play size={16} />
					Play
				{/if}
			</button>

			<!-- Step Controls -->
			<div class="step-controls">
				<button
					class="btn control-btn step-btn"
					onclick={onStepBackward}
					disabled={isAnimating || currentStep === 0}
					aria-label="Step backward"
					title="Previous step"
				>
					<SkipBack size={14} />
				</button>

				<span class="step-indicator">{currentStep}/{totalSteps}</span>

				<button
					class="btn control-btn step-btn"
					onclick={onStepForward}
					disabled={isAnimating || completed || totalSteps === 0}
					aria-label="Step forward"
					title="Next step"
				>
					<SkipForward size={14} />
				</button>
			</div>

			<!-- Quick Actions -->
			{#if onSkipToEnd && totalSteps > 0 && !completed && !isAnimating}
				<button
					class="btn control-btn skip-btn"
					onclick={handleSkipToEnd}
					aria-label="Skip to end"
					title="Jump to final result"
				>
					Skip to End
				</button>
			{/if}
		</div>
	</div>

	<!-- Algorithm Selection -->
	<div class="control-group">
		<h4 class="control-group-title">Algorithm</h4>
		<div class="algorithm-controls">
			<!-- Mode Selection -->
			<div class="mode-buttons">
				<button
					class="mode-btn"
					class:active={mode === 'SORTING'}
					onclick={() => handleModeChange('SORTING')}
					disabled={isAnimating}
				>
					Sorting
				</button>
				<button
					class="mode-btn"
					class:active={mode === 'PATHFINDING'}
					onclick={() => handleModeChange('PATHFINDING')}
					disabled={isAnimating}
				>
					Pathfinding
				</button>
			</div>

			<!-- Algorithm Selection -->
			<select
				class="algorithm-select"
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
	</div>

	<!-- Settings -->
	<div class="control-group">
		<h4 class="control-group-title">Settings</h4>
		<div class="settings-controls">
			{#if mode === 'SORTING'}
				<!-- Array Size -->
				<div class="setting-item">
					<label class="setting-label" for="array-size-input">
						Array Size: <span class="setting-value">{arraySize}</span>
						<span class="setting-hint">Drag to adjust</span>
					</label>
					<div class="range-container">
						<input
							id="array-size-input"
							type="range"
							class="range-input"
							min="5"
							max="50"
							value={arraySize}
							style="--value: {arraySize}"
							oninput={handleArraySizeChange}
							disabled={isAnimating}
						/>
						<div class="range-labels">
							<span class="range-label-min">5</span>
							<span class="range-label-max">50</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Speed Control -->
			<div class="setting-item">
				<label class="setting-label" for="speed-select">Speed:</label>
				<select
					id="speed-select"
					class="speed-select"
					value={animationSpeed}
					onchange={handleSpeedChange}
					disabled={isAnimating}
				>
					{#each speedOptions as speed (speed.value)}
						<option value={speed.value}>{speed.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Data Controls -->
	<div class="control-group">
		<h4 class="control-group-title">Data</h4>
		<div class="data-controls">
			<button
				class="btn control-btn"
				onclick={onShuffle}
				disabled={isAnimating}
				aria-label={mode === 'SORTING' ? 'Shuffle array' : 'Add random walls'}
				title={mode === 'SORTING' ? 'Generate new random array' : 'Add random walls to grid'}
			>
				<Shuffle size={16} />
				{mode === 'SORTING' ? 'Shuffle' : 'Random Walls'}
			</button>

			{#if mode === 'PATHFINDING'}
				<button
					class="btn control-btn"
					onclick={onClearWalls}
					disabled={isAnimating}
					aria-label="Clear all walls"
					title="Remove all walls from grid"
				>
					<Square size={16} />
					Clear Walls
				</button>
			{/if}

			<button
				class="btn control-btn reset-btn"
				onclick={onReset}
				disabled={isAnimating}
				aria-label="Reset everything"
				title="Reset to initial state"
			>
				<RotateCcw size={16} />
				Reset All
			</button>
		</div>
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

	/* New Simulation Controls Layout */
	.simulation-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.step-controls {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: var(--space-1);
	}

	.step-indicator {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		min-width: 35px;
		text-align: center;
		font-weight: 600;
	}

	.data-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.875rem;
		padding: var(--space-2) var(--space-3);
		white-space: nowrap;
	}

	.step-btn {
		padding: var(--space-1) var(--space-2);
		background: transparent;
		border: none;
		border-radius: 2px;
	}

	.step-btn:hover:not(:disabled) {
		background: var(--color-bg-secondary);
	}

	.skip-btn {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
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

	.control-btn.primary {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.control-btn.primary:hover:not(:disabled) {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.algorithm-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.mode-buttons {
		display: flex;
		gap: var(--space-1);
		width: 100%;
	}

	.mode-btn {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mode-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-text-primary);
	}

	.mode-btn.active {
		background: var(--color-bg-primary);
		border-color: var(--color-primary);
		color: var(--color-text-primary);
	}

	.mode-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.algorithm-select,
	.speed-select {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		transition: border-color 0.2s ease;
	}

	.algorithm-select:focus,
	.speed-select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.algorithm-select:disabled,
	.speed-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.settings-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.setting-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.setting-value {
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.setting-hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
		opacity: 0.8;
	}

	.range-container {
		position: relative;
		width: 100%;
	}

	.range-container::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: repeating-linear-gradient(
			to right,
			transparent 0%,
			transparent calc(20% - 1px),
			var(--color-border) calc(20% - 1px),
			var(--color-border) 20%
		);
		transform: translateY(-50%);
		pointer-events: none;
		opacity: 0.3;
		z-index: 1;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-1);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-family: var(--font-family-mono);
	}

	.range-label-min,
	.range-label-max {
		user-select: none;
		opacity: 0.7;
	}

	.range-input {
		width: 100%;
		height: 6px;
		background: var(--color-border);
		outline: none;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
		background-image: linear-gradient(
			to right,
			var(--color-primary) 0%,
			var(--color-primary) calc((100% - 20px) * (var(--value, 25) - 5) / (50 - 5)),
			var(--color-border) calc((100% - 20px) * (var(--value, 25) - 5) / (50 - 5)),
			var(--color-border) 100%
		);
	}

	.range-input:hover {
		background: var(--color-bg-secondary);
		border-color: var(--color-primary);
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(201, 42, 42, 0.1);
	}

	.range-input:focus {
		border-color: var(--color-primary);
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.1),
			0 0 0 2px rgba(201, 42, 42, 0.2);
	}

	.range-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: var(--color-primary);
		cursor: pointer;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		position: relative;
		z-index: 2;
	}

	.range-input::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
	}

	.range-input::-webkit-slider-thumb:active {
		transform: scale(1.05);
		background: #b91c1c;
	}

	.range-input::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: var(--color-primary);
		cursor: pointer;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
	}

	.range-input::-moz-range-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
	}

	.range-input::-moz-range-thumb:active {
		transform: scale(1.05);
		background: #b91c1c;
	}

	/* Track styling for Firefox */
	.range-input::-moz-range-track {
		height: 6px;
		background: var(--color-border);
		border-radius: 3px;
		border: 1px solid var(--color-border);
	}

	.range-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.range-input:disabled::-webkit-slider-thumb {
		cursor: not-allowed;
		transform: none;
	}

	.range-input:disabled::-moz-range-thumb {
		cursor: not-allowed;
		transform: none;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.control-panel {
			gap: var(--space-2);
		}
	}
</style>
