<script lang="ts">
	import { onMount } from 'svelte';

	// Same defaults as the lab: a hundred years of fifty-two weeks, counted from my birth date
	const BIRTH = '2000-03-28';
	const YEARS = 100;
	const WEEKS = 52;
	const W = 600;
	const H = 400;
	const PAD = 10;
	// Weeks run across, years run down. The plate is a window: it shows the lived years plus the
	// decade ahead at a readable cell size rather than all hundred years shrunk to nothing.
	const CELL = (W - PAD * 2) / WEEKS;
	const ROWS = Math.floor((H - PAD * 2) / CELL);
	const REPLAY_MS = 2200;
	const TICK_MS = 500;

	let canvas: HTMLCanvasElement;
	const lived = Math.min(
		YEARS * WEEKS,
		Math.ceil((Date.now() - new Date(BIRTH).getTime()) / (7 * 24 * 60 * 60 * 1000))
	);
	const left = YEARS * WEEKS - lived;
	const percent = ((lived / (YEARS * WEEKS)) * 100).toFixed(1);
	const firstRow = Math.max(
		0,
		Math.min(Math.floor(lived / WEEKS) - Math.floor(ROWS * 0.7), YEARS - ROWS)
	);

	let shown = $state(0); // weeks drawn so far during the replay
	let cursorOn = true;
	let replaying = $state(false);
	let frame: number | null = null;
	let ticker: ReturnType<typeof setInterval> | null = null;
	let reduce = false;

	function draw() {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;
		const styles = getComputedStyle(canvas);
		const spot = styles.getPropertyValue('--spread-spot');
		const ink = styles.getPropertyValue('--spread-ink');
		const tint = styles.getPropertyValue('--spread-tint');
		ctx.clearRect(0, 0, W, H);
		for (let row = 0; row < ROWS; row++) {
			const year = firstRow + row;
			for (let week = 0; week < WEEKS; week++) {
				const i = year * WEEKS + week;
				const x = PAD + week * CELL;
				const y = PAD + row * CELL;
				if (i < shown) {
					ctx.fillStyle = spot;
					ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
				} else if (i === lived && !replaying) {
					if (cursorOn) {
						ctx.fillStyle = ink;
						ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
					} else {
						ctx.strokeStyle = ink;
						ctx.lineWidth = 1;
						ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
					}
				} else {
					ctx.strokeStyle = tint;
					ctx.lineWidth = 1;
					ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3);
				}
			}
		}
	}

	function stopTick() {
		if (ticker) clearInterval(ticker);
		ticker = null;
	}

	function startTick() {
		stopTick();
		if (reduce) return;
		ticker = setInterval(() => {
			cursorOn = !cursorOn;
			draw();
		}, TICK_MS);
	}

	function replay() {
		if (frame !== null) cancelAnimationFrame(frame);
		stopTick();
		if (reduce) {
			shown = lived;
			draw();
			return;
		}
		replaying = true;
		shown = 0;
		const start = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / REPLAY_MS);
			shown = Math.round(lived * t * t); // ease in: the early years go slowly, then it runs
			draw();
			if (t < 1) {
				frame = requestAnimationFrame(step);
			} else {
				frame = null;
				replaying = false;
				cursorOn = true;
				draw();
				startTick();
			}
		};
		frame = requestAnimationFrame(step);
	}

	onMount(() => {
		reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		replay();
		return () => {
			if (frame !== null) cancelAnimationFrame(frame);
			stopTick();
		};
	});
</script>

<canvas
	bind:this={canvas}
	width={W}
	height={H}
	aria-label="My life in weeks: {lived.toLocaleString()} weeks lived of {(
		YEARS * WEEKS
	).toLocaleString()}, the decade ahead in view."
></canvas>
<div class="reading">
	<span class="state">{replaying ? 'Replaying' : `${percent}% lived`}</span>
	<span>{shown.toLocaleString()} weeks lived</span>
	<span>{left.toLocaleString()} left</span>
	<span class="controls">
		<button type="button" onclick={replay}>Replay</button>
		<a href="/labs/life-calendar">Enter your date</a>
	</span>
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
