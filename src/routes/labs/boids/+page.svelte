<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { BoidsShell } from '#labs/boids/index.js';
</script>

<Seo
	title="Boids Flocking | Anish Shrestha"
	description="A live boids flocking simulation: tune separation, alignment, cohesion, speed and perception and watch a flock emerge from three rules."
/>

<BoidsShell />
