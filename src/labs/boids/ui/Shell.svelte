<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Canvas from './Canvas.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import Stats from './Stats.svelte';
	import { startSimulation, destroySimulation } from '../store.svelte.js';

	onMount(() => {
		// Reduced motion: a still frame with the Play control, never autoplay
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startSimulation();
	});

	onDestroy(() => {
		destroySimulation();
	});
</script>

<section class="lab container">
	<header class="lab-head">
		<span class="fig" aria-hidden="true">Fig. 2</span>
		<h1>Boids Flocking</h1>
		<p class="dek">
			Three rules per bird, separation, alignment and cohesion, and a flock emerges with no leader.
		</p>
	</header>

	<div class="lab-grid">
		<figure class="plate-col">
			<Canvas />
			<Stats />
		</figure>

		<aside class="controls-col">
			<section>
				<h2 class="section-title">Controls</h2>
				<ControlPanel />
			</section>

			<section>
				<h2 class="section-title">About</h2>
				<p>
					Each boid looks only at the neighbours inside its perception radius and steers by three
					rules, so the flock has no leader and no plan.
				</p>
				<ul>
					<li><strong>Separation</strong> steers away from crowding neighbours.</li>
					<li><strong>Alignment</strong> steers toward the average heading.</li>
					<li><strong>Cohesion</strong> steers toward the centre of mass.</li>
				</ul>
			</section>
		</aside>
	</div>
</section>

<style>
	.lab {
		padding-top: 24px;
		padding-bottom: 72px;
	}

	.lab-head {
		max-width: 60ch;
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
		margin-left: -0.04em;
	}

	h1 {
		font-family: var(--font-family-serif);
		font-weight: 600;
		font-size: clamp(34px, 4vw, 40px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		margin: 10px 0 12px;
	}

	.dek {
		font-style: italic;
		font-size: 17px;
		margin: 0;
	}

	.lab-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
	}

	@media (min-width: 1025px) {
		.lab-grid {
			grid-template-columns: minmax(0, 1fr) 320px;
			align-items: start;
		}
	}

	.plate-col {
		margin: 0;
		min-width: 0;
	}

	.controls-col {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.controls-col p,
	.controls-col li {
		font-size: 15.5px;
		line-height: 1.5;
	}

	.controls-col p {
		margin: 0 0 12px;
	}

	.controls-col ul {
		margin: 0;
		padding-left: 1.2em;
	}

	.controls-col li {
		margin-bottom: 4px;
	}
</style>
