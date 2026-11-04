<script lang="ts">
	import { onMount } from 'svelte';

	// Same defaults as the lab: a hundred years of fifty-two weeks, counted from the author's birth date
	const BIRTH = '2000-03-28';
	const YEARS = 100;
	const WEEKS = 52;
	const W = 600;
	const H = 400;

	let canvas: HTMLCanvasElement;
	const lived = Math.min(
		YEARS * WEEKS,
		Math.ceil((Date.now() - new Date(BIRTH).getTime()) / (7 * 24 * 60 * 60 * 1000))
	);
	const left = YEARS * WEEKS - lived;
	const percent = ((lived / (YEARS * WEEKS)) * 100).toFixed(1);

	function draw() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const styles = getComputedStyle(canvas);
		const spot = styles.getPropertyValue('--spread-spot');
		const ink = styles.getPropertyValue('--spread-ink');
		const tint = styles.getPropertyValue('--spread-tint');
		const pad = 10;
		// years run left to right, weeks top to bottom, so the whole life fits a landscape plate
		const cw = (W - pad * 2) / YEARS;
		const ch = (H - pad * 2) / WEEKS;
		ctx.clearRect(0, 0, W, H);
		for (let year = 0; year < YEARS; year++) {
			for (let week = 0; week < WEEKS; week++) {
				const i = year * WEEKS + week;
				const x = pad + year * cw;
				const y = pad + week * ch;
				if (i < lived) {
					ctx.fillStyle = spot;
					ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
				} else if (i === lived) {
					ctx.fillStyle = ink;
					ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
				} else {
					ctx.strokeStyle = tint;
					ctx.lineWidth = 1;
					ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
				}
			}
		}
	}

	onMount(draw);
</script>

<canvas
	bind:this={canvas}
	width={W}
	height={H}
	aria-label="A life in weeks: {lived.toLocaleString()} weeks lived of {(
		YEARS * WEEKS
	).toLocaleString()}."
></canvas>
<div class="reading">
	<span class="state">{percent}% lived</span>
	<span>{lived.toLocaleString()} weeks lived</span>
	<span>{left.toLocaleString()} left</span>
	<span class="controls"><a href="/labs/life-calendar">Enter your date</a></span>
</div>

<style>
	canvas {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 3 / 2;
		border: 1.5px solid var(--spread-ink);
		background: var(--spread-paper);
	}
</style>
