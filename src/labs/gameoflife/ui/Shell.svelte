<!--
Conway's Game of Life - Main Shell Component

Main container that provides the layout structure for the Game of Life simulation.
Uses two-column layout similar to other games but adapted for cellular automaton.
-->

<script lang="ts">
	import { onDestroy } from 'svelte';
	import GameGrid from './GameGrid.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import SimulationStats from './SimulationStats.svelte';
	import PatternSelector from './PatternSelector.svelte';
	import { destroySimulation } from '../store.svelte';

	// Cleanup simulation when component is destroyed
	onDestroy(() => {
		destroySimulation();
	});
</script>

<svelte:head>
	<title>Game of Life | Labs</title>
	<meta
		name="description"
		content="Conway's Game of Life - Interactive cellular automaton simulation"
	/>
</svelte:head>

<section class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
	<div class="game-layout">
		<!-- Left Column: Controls and Information -->
		<aside class="game-sidebar">
			<div class="sidebar-content">
				<!-- Simulation Controls -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">Controls</h2>
					<ControlPanel />
				</section>

				<!-- Pattern Selector -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">Patterns</h2>
					<PatternSelector />
				</section>

				<!-- Game Information -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">About</h2>
					<div class="game-info">
						<p style="margin-bottom: var(--space-2);">
							Conway's Game of Life is a cellular automaton that simulates evolution based on simple
							rules.
						</p>
						<div class="info-rules" style="gap: var(--space-1);">
							<h4 style="margin-bottom: var(--space-2);">Rules:</h4>
							<ul style="margin: 0; padding-left: var(--space-4); gap: var(--space-1);">
								<li>Live cell with 2-3 neighbors survives</li>
								<li>Dead cell with 3 neighbors becomes alive</li>
								<li>All other cells die or remain dead</li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</aside>

		<!-- Right Column: Game Grid and Statistics -->
		<main class="game-main">
			<div class="main-content">
				<!-- Game Board -->
				<div class="section-card no-margin board-section">
					<h2 class="section-title">Game of Life</h2>
					<GameGrid />
				</div>

				<!-- Statistics Display -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">Statistics</h2>
					<SimulationStats />
				</section>
			</div>
		</main>
	</div>
</section>

<style>
	.game-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-6);
		min-height: 80vh;
	}

	@media (min-width: 1024px) {
		.game-layout {
			grid-template-columns: 350px 1fr;
		}
	}

	.game-sidebar {
		display: flex;
		flex-direction: column;
	}

	.sidebar-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.game-main {
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

	.game-info {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.info-rules ul {
		list-style-type: disc;
		color: var(--color-text-muted);
	}

	.info-rules li {
		margin-bottom: var(--space-1);
	}

	.info-rules h4 {
		color: var(--color-text);
		font-weight: 600;
		font-size: 0.875rem;
	}

	/* Mobile adjustments */
	@media (max-width: 1024px) {
		.game-layout {
			grid-template-columns: 1fr; /* Single column on tablets and below */
		}
	}

	@media (max-width: 768px) {
		.game-layout {
			gap: var(--space-4);
			min-height: auto;
		}

		.sidebar-content {
			gap: var(--space-3);
		}

		.main-content {
			gap: var(--space-3);
		}

		/* Better board sizing on mobile */
		.board-section {
			min-height: 400px;
		}
	}

	@media (max-width: 480px) {
		.game-layout {
			gap: var(--space-3);
		}

		.sidebar-content {
			gap: var(--space-2);
		}

		.main-content {
			gap: var(--space-2);
		}

		.board-section {
			min-height: 350px;
		}
	}
</style>
