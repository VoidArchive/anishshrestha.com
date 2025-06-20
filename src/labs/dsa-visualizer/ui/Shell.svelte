<!--
DSA Visualizer Shell Component

Main layout component for the DSA visualizer.
Matches Game of Life's design pattern with proper spacing and card structure.
Features consolidated controls in sidebar and main content area with statistics.
-->

<script lang="ts">
	import {
		dsaState,
		setAlgorithm,
		setMode,
		setArraySize,
		setAnimationSpeed,
		skipToEnd,
		shuffleArray,
		clearWalls,
		startAnimation,
		pauseAnimation,
		resumeAnimation,
		stepForward,
		stepBackward,
		resetVisualization,
		getCurrentStepDescription
	} from '../store.svelte';
	import VisualizerBoard from './VisualizerBoard.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import { ArrowUpDown, ArrowLeftRight, BarChart3, Search, Route, Grid3X3 } from 'lucide-svelte';

	// Derived state
	let stepDescription = $derived(getCurrentStepDescription());

	// Algorithm complexity information
	const algorithmComplexity = {
		BUBBLE_SORT: { time: 'O(n²)', space: 'O(1)' },
		SELECTION_SORT: { time: 'O(n²)', space: 'O(1)' },
		INSERTION_SORT: { time: 'O(n²)', space: 'O(1)' },
		QUICK_SORT: { time: 'O(n log n)', space: 'O(log n)' },
		MERGE_SORT: { time: 'O(n log n)', space: 'O(n)' },
		HEAP_SORT: { time: 'O(n log n)', space: 'O(1)' },
		BFS: { time: 'O(V + E)', space: 'O(V)' },
		DFS: { time: 'O(V + E)', space: 'O(V)' },
		DIJKSTRA: { time: 'O(V²)', space: 'O(V)' },
		A_STAR: { time: 'O(b^d)', space: 'O(b^d)' }
	};

	let complexity = $derived(
		algorithmComplexity[dsaState.algorithm] || { time: 'N/A', space: 'N/A' }
	);
</script>

<ErrorBoundary fallback="The DSA Visualizer encountered an error. Please try refreshing the page.">
	<section class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
		<div class="dsa-layout">
			<!-- Left Column: Controls -->
			<aside class="dsa-sidebar">
				<div class="sidebar-content">
					<!-- Consolidated Control Panel -->
					<section class="section-card no-margin">
						<h2 class="section-title text-lg">Controls</h2>
						<ControlPanel
							mode={dsaState.mode}
							algorithm={dsaState.algorithm}
							arraySize={dsaState.arraySize}
							animationSpeed={dsaState.animationSpeed}
							isAnimating={dsaState.isAnimating}
							completed={dsaState.completed}
							currentStep={dsaState.currentStep}
							totalSteps={dsaState.totalSteps}
							onModeChange={setMode}
							onAlgorithmChange={setAlgorithm}
							onArraySizeChange={setArraySize}
							onAnimationSpeedChange={setAnimationSpeed}
							onSkipToEnd={skipToEnd}
							onStart={startAnimation}
							onPause={pauseAnimation}
							onResume={resumeAnimation}
							onStepForward={stepForward}
							onStepBackward={stepBackward}
							onShuffle={shuffleArray}
							onClearWalls={clearWalls}
							onReset={resetVisualization}
						/>
					</section>

					<!-- Algorithm Information -->
					<section class="section-card no-margin">
						<h2 class="section-title text-lg">Algorithm Info</h2>
						<div class="algo-info">
							<div class="algo-item">
								<span class="algo-label">Algorithm:</span>
								<span class="algo-value">{dsaState.algorithm.replace('_', ' ')}</span>
							</div>

							<div class="algo-item">
								<span class="algo-label">Time Complexity:</span>
								<code class="complexity-value">{complexity.time}</code>
							</div>

							<div class="algo-item">
								<span class="algo-label">Space Complexity:</span>
								<code class="complexity-value">{complexity.space}</code>
							</div>

							<div class="algo-item step-description-item">
								<span class="algo-label">Current Step:</span>
								<div class="step-description-container">
									<p class="step-description">{stepDescription || 'Ready to start...'}</p>
								</div>
							</div>
						</div>
					</section>
				</div>
			</aside>

			<!-- Right Column: Visualizer and Statistics -->
			<main class="dsa-main">
				<div class="main-content">
					<!-- Visualizer Board -->
					<div class="section-card no-margin board-section">
						<h2 class="section-title">
							{dsaState.mode === 'SORTING' ? 'Sorting' : 'Pathfinding'} Visualizer
						</h2>
						<VisualizerBoard state={dsaState} />
					</div>

					<!-- Statistics Display -->
					<section class="section-card no-margin">
						<h2 class="section-title text-lg">Statistics</h2>
						<div class="stats-container">
							<!-- Progress Bar Section -->
							<div class="progress-section">
								<div class="progress-header">
									<span class="progress-label">Progress</span>
									<span class="progress-percentage">
										{dsaState.totalSteps > 0
											? Math.round((dsaState.currentStep / dsaState.totalSteps) * 100)
											: 0}%
									</span>
								</div>
								<div class="progress-bar">
									<div
										class="progress-fill"
										style="width: {dsaState.totalSteps > 0
											? (dsaState.currentStep / dsaState.totalSteps) * 100
											: 0}%"
									></div>
								</div>
								<div class="progress-steps">
									{dsaState.currentStep} / {dsaState.totalSteps} steps
								</div>
							</div>

							<!-- Algorithm-Specific Stats -->
							<div class="stats-grid">
								{#if dsaState.mode === 'SORTING'}
									<!-- Sorting Statistics with Icons -->
									<div class="stat-card primary">
										<div class="stat-icon">
											<ArrowUpDown size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Comparisons</span>
											<span class="stat-value">{dsaState.comparisons}</span>
										</div>
									</div>

									<div class="stat-card secondary">
										<div class="stat-icon">
											<ArrowLeftRight size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Swaps</span>
											<span class="stat-value">{dsaState.swaps}</span>
										</div>
									</div>

									<div class="stat-card info">
										<div class="stat-icon">
											<BarChart3 size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Array Size</span>
											<span class="stat-value">{dsaState.array.length}</span>
										</div>
									</div>
								{:else if dsaState.mode === 'PATHFINDING'}
									<!-- Pathfinding Statistics with Icons -->
									<div class="stat-card primary">
										<div class="stat-icon">
											<Search size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Nodes Visited</span>
											<span class="stat-value">{dsaState.nodesVisited}</span>
										</div>
									</div>

									<div class="stat-card secondary">
										<div class="stat-icon">
											<Route size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Path Length</span>
											<span class="stat-value">{dsaState.pathLength}</span>
										</div>
									</div>

									<div class="stat-card info">
										<div class="stat-icon">
											<Grid3X3 size={20} />
										</div>
										<div class="stat-content">
											<span class="stat-label">Grid Size</span>
											<span class="stat-value"
												>{dsaState.gridSize.width}×{dsaState.gridSize.height}</span
											>
										</div>
									</div>
								{/if}
							</div>

							<!-- Status Badge -->
							<div class="status-section">
								<div
									class="status-badge {dsaState.completed
										? 'completed'
										: dsaState.isAnimating
											? 'running'
											: 'ready'}"
								>
									<div class="status-indicator"></div>
									<span class="status-text">
										{dsaState.completed ? 'Completed' : dsaState.isAnimating ? 'Running' : 'Ready'}
									</span>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	</section>
</ErrorBoundary>

<style>
	.dsa-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-4);
		min-height: 80vh;
	}

	@media (min-width: 1024px) {
		.dsa-layout {
			grid-template-columns: 350px 1fr;
		}
	}

	.dsa-sidebar {
		display: flex;
		flex-direction: column;
	}

	.sidebar-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.dsa-main {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: var(--space-4);
		min-height: 0;
	}

	/* Remove margin from cards and use gap instead */
	.section-card.no-margin {
		margin-bottom: 0;
	}

	/* Special styling for board section to fill available space */
	.board-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* Algorithm Info Styles */
	.algo-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.algo-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.algo-item.step-description-item {
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-3);
		margin-top: var(--space-1);
	}

	.algo-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.algo-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-transform: capitalize;
	}

	.complexity-value {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		color: var(--color-primary);
		background: var(--color-bg-secondary);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
		display: inline-block;
	}

	.step-description {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}

	/* Statistics Styles */
	.stats-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* Progress Section */
	.progress-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.progress-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-weight: 600;
	}

	.progress-percentage {
		font-size: 1rem;
		color: var(--color-primary);
		font-weight: 700;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--color-bg-primary);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-primary), #ff6b6b);
		transition: width 0.3s ease;
	}

	.progress-steps {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--space-3);
	}

	/* Stat Cards */
	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.stat-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-1px);
	}

	.stat-card.primary {
		border-left: 3px solid var(--color-primary);
	}

	.stat-card.primary .stat-icon {
		color: var(--color-primary);
	}

	.stat-card.secondary {
		border-left: 3px solid #5c7cfa;
	}

	.stat-card.secondary .stat-icon {
		color: #5c7cfa;
	}

	.stat-card.info {
		border-left: 3px solid #51cf66;
	}

	.stat-card.info .stat-icon {
		color: #51cf66;
	}

	.stat-icon {
		flex-shrink: 0;
		color: var(--color-text-muted);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	/* Status Section */
	.status-section {
		display: flex;
		justify-content: center;
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.ready {
		background: rgba(148, 163, 184, 0.1);
		color: #94a3b8;
		border: 1px solid rgba(148, 163, 184, 0.3);
	}

	.status-badge.running {
		background: rgba(251, 191, 36, 0.1);
		color: #fbbf24;
		border: 1px solid rgba(251, 191, 36, 0.3);
	}

	.status-badge.completed {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		flex-shrink: 0;
	}

	.status-badge.ready .status-indicator {
		background: #94a3b8;
	}

	.status-badge.running .status-indicator {
		background: #fbbf24;
		animation: pulse 1.5s infinite;
	}

	.status-badge.completed .status-indicator {
		background: #22c55e;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Fixed layout for step description */
	.step-description-container {
		min-height: 60px; /* Fixed height to prevent layout shifts */
		display: flex;
		align-items: flex-start;
		overflow: hidden; /* Prevent text from extending beyond container */
	}

	/* Board section stability */
	.board-section {
		min-height: 500px; /* Ensure consistent board area */
	}

	/* Mobile adjustments */
	@media (max-width: 1024px) {
		.dsa-layout {
			grid-template-columns: 1fr; /* Single column on tablets */
		}
	}

	@media (max-width: 768px) {
		.dsa-layout {
			gap: var(--space-4);
			min-height: auto;
		}

		.sidebar-content {
			gap: var(--space-3);
		}

		.main-content {
			gap: var(--space-3);
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
			gap: var(--space-2);
		}

		.stat-card {
			padding: var(--space-2);
			flex-direction: column; /* Stack icon and content */
			text-align: center;
			gap: var(--space-1);
		}

		.stat-value {
			font-size: 1rem;
		}

		.algo-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}

		.algo-value,
		.complexity-value {
			font-size: 0.875rem;
		}

		.step-description-container {
			min-height: 72px; /* Fixed height to prevent layout shifts on mobile */
			overflow-wrap: break-word; /* Handle long descriptions gracefully */
		}

		.step-description {
			font-size: 0.875rem;
			line-height: 1.4;
		}

		/* Better board sizing on mobile */
		.board-section {
			min-height: 400px;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr; /* Single column on small mobile */
		}

		.stat-card {
			flex-direction: row; /* Back to row for very small screens */
			text-align: left;
		}

		.progress-header {
			flex-direction: column;
			gap: var(--space-1);
			text-align: center;
		}

		.step-description-container {
			min-height: 80px; /* Slightly more height for very small screens */
		}

		.step-description {
			font-size: 0.8125rem; /* Slightly smaller text for better fit */
			line-height: 1.3;
		}
	}
</style>
