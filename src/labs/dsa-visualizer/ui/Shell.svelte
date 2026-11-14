<!--
DSA Visualizer Shell

Fig. 3 of the spread: the lab name, a one-line dek, the board plate with its
reading row, and a controls column. On narrow screens the board comes first.
-->

<script lang="ts">
	import BlogStoryCallout from '#lib/components/BlogStoryCallout.svelte';
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
		cleanupTimeouts,
		resumeAnimation,
		stepForward,
		stepBackward,
		resetVisualization
	} from '../store.svelte.js';
	import { onDestroy } from 'svelte';
	import VisualizerBoard from './VisualizerBoard.svelte';

	// Leaving the lab mid-run must not leave step timers firing into the shared store
	onDestroy(() => {
		pauseAnimation();
		cleanupTimeouts();
	});
	import ControlPanel from './ControlPanel.svelte';
	import ErrorBoundary from '#lib/components/ErrorBoundary.svelte';

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
	<main class="dsa container">
		<header class="head">
			<h1>DSA Visualizer</h1>
			<p class="dek">
				Six sorting and four pathfinding algorithms, drawn one step at a time. Pick one, press Play,
				or step through by hand.
			</p>
		</header>

		<div class="layout">
			<div class="board">
				<VisualizerBoard state={dsaState} />
			</div>

			<aside class="controls">
				<section class="section-card">
					<h2 class="section-title">Controls</h2>
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

				<section class="section-card no-margin">
					<h2 class="section-title">Complexity</h2>
					<dl class="complexity">
						<dt class="caps">Time</dt>
						<dd><code>{complexity.time}</code></dd>
						<dt class="caps">Space</dt>
						<dd><code>{complexity.space}</code></dd>
					</dl>
				</section>
			</aside>
		</div>
		<BlogStoryCallout
			variant="banner"
			blogTitle="Why My Pathfinding Visualizer Forgot Its Past"
			blogUrl="/blog/pathfinding-visualizer-forgot-its-past"
		/>
	</main>
</ErrorBoundary>

<style>
	.dsa {
		padding-top: 36px;
		padding-bottom: 72px;
	}
	.head {
		margin-bottom: 40px;
	}
	h1 {
		font-size: clamp(34px, 3vw, 40px);
		font-weight: 600;
		line-height: 1.02;
		letter-spacing: -0.015em;
		text-wrap: balance;
		margin: 8px 0 10px;
	}
	.dek {
		font-size: 17px;
		font-style: italic;
		max-width: 60ch;
		margin: 0;
		text-wrap: pretty;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 40px;
		align-items: start;
	}
	@media (min-width: 1025px) {
		.layout {
			grid-template-columns: minmax(0, 1fr) 340px;
		}
	}

	.complexity {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 8px 18px;
		align-items: baseline;
		margin: 0;
	}
	.complexity dt {
		font-weight: 400;
	}
	.complexity dd {
		margin: 0;
	}
	.complexity code {
		font-family: var(--font-family-mono);
		font-size: 13px;
	}
</style>
