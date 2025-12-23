<script lang="ts">
	import { onDestroy } from 'svelte';
	import Canvas from './Canvas.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import Stats from './Stats.svelte';
	import { destroySimulation } from '../store.svelte';

	onDestroy(() => {
		destroySimulation();
	});
</script>

<svelte:head>
	<title>Boids Flocking | Labs</title>
	<meta
		name="description"
		content="Boids flocking simulation - Emergent behavior from simple rules"
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

				<!-- About -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">About</h2>
					<div class="game-info">
						<p style="margin-bottom: var(--space-2);">
							Boids simulate flocking behavior through three simple rules that create emergent
							complexity.
						</p>
						<div class="info-rules" style="gap: var(--space-1);">
							<h4 style="margin-bottom: var(--space-2);">Rules:</h4>
							<ul style="margin: 0; padding-left: var(--space-4); gap: var(--space-1);">
								<li><strong>Separation</strong> - Avoid crowding neighbors</li>
								<li><strong>Alignment</strong> - Steer towards average heading</li>
								<li><strong>Cohesion</strong> - Move towards center of mass</li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</aside>

		<!-- Right Column: Canvas and Statistics -->
		<main class="game-main">
			<div class="main-content">
				<!-- Simulation Canvas -->
				<div class="section-card no-margin board-section">
					<h2 class="section-title">Boids Flocking Simulation</h2>
					<Canvas />
				</div>

				<!-- Statistics Display -->
				<section class="section-card no-margin">
					<h2 class="section-title text-lg">Statistics</h2>
					<Stats />
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

	.section-card.no-margin {
		margin-bottom: 0;
	}

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

	@media (max-width: 1024px) {
		.game-layout {
			grid-template-columns: 1fr;
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
