<script lang="ts">
	import Seo from '#lib/components/Seo.svelte';
	import { GameOfLifeShell } from '#labs/gameoflife/index.js';
</script>

<Seo
	title="Game of Life | Anish Shrestha"
	description="Conway's Game of Life: an interactive cellular automaton. Toggle cells, insert gliders and oscillators, and watch three rules about neighbours play out."
/>

<GameOfLifeShell />
