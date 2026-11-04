<!--
Conway's Game of Life - Main Shell Component

Fig. 1 of the spread, opened as a lab: the board is the plate, the reading row
sits beneath it, and the controls follow (beside it on desktop, after it on phones).
-->

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import GameGrid from './GameGrid.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import SimulationStats from './SimulationStats.svelte';
	import PatternSelector from './PatternSelector.svelte';
	import { destroySimulation, randomizeGrid, simulationState } from '../store.svelte.js';

	// An empty grid makes the first Play do nothing; seed it so the lab is alive on arrival
	onMount(() => {
		if (simulationState.stats.population === 0) randomizeGrid(0.25);
	});

	onDestroy(() => {
		destroySimulation();
	});
</script>

<main class="lab container">
	<header class="lab-head">
		<span class="fig" aria-hidden="true">Fig. 1</span>
		<h1>Game of Life</h1>
		<p class="dek">
			Conway's cellular automaton: three rules about neighbours, run on a grid you can draw on.
		</p>
	</header>

	<div class="game-layout">
		<div class="game-main">
			<GameGrid />
			<SimulationStats />
		</div>

		<aside class="game-sidebar">
			<section class="section-card no-margin">
				<h2 class="section-title">Controls</h2>
				<ControlPanel />
			</section>

			<section class="section-card no-margin">
				<h2 class="section-title">Patterns</h2>
				<PatternSelector />
			</section>

			<section class="section-card no-margin">
				<h2 class="section-title">Rules</h2>
				<p>Each generation, every cell looks at its eight neighbours.</p>
				<ul>
					<li>A live cell with two or three live neighbours survives.</li>
					<li>A dead cell with exactly three live neighbours is born.</li>
					<li>Every other cell dies or stays dead.</li>
				</ul>
			</section>
		</aside>
	</div>
</main>

<style>
	.lab {
		padding-top: 40px;
		padding-bottom: 72px;
	}

	.lab-head {
		margin-bottom: 40px;
	}

	.fig {
		display: block;
		font-family: var(--font-family-sans);
		font-weight: 700;
		font-size: clamp(40px, 5vw, 64px);
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--color-spot);
		margin-left: -4px;
	}

	h1 {
		font-family: var(--font-family-serif);
		font-weight: 600;
		font-size: clamp(34px, 3vw, 40px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		text-wrap: balance;
		margin: 8px 0 10px;
	}

	.dek {
		font-style: italic;
		font-size: 17px;
		margin: 0;
		max-width: 60ch;
	}

	.game-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		align-items: start;
	}

	@media (min-width: 1025px) {
		.game-layout {
			grid-template-columns: minmax(0, 1fr) 350px;
		}
	}

	.game-main {
		min-width: 0;
	}

	.game-sidebar {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-card p {
		font-size: 15.5px;
		margin: 0 0 8px;
		text-wrap: pretty;
	}

	.section-card ul {
		font-size: 15.5px;
		margin: 0;
		padding-left: 20px;
	}

	.section-card li {
		margin-bottom: 4px;
	}
</style>
