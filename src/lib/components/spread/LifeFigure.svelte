<script lang="ts">
	import { onMount } from 'svelte';
	import {
		randomizeGrid,
		nextGeneration,
		toggleCell,
		countLivingCells
	} from '#labs/gameoflife/rules/index.js';
	import type { Grid } from '#labs/gameoflife/rules/types.js';

	const STEP_MS = 200;

	let {
		autoplay = true,
		cols = $bindable(35),
		rows = $bindable(26)
	}: { autoplay?: boolean; cols?: number; rows?: number } = $props();

	// Read once in the component body so the draw loop never tracks the props
	let COLS = cols;
	let ROWS = rows;
	let canvas: HTMLCanvasElement;
	let grid: Grid = $state(randomizeGrid(COLS, ROWS, 0.22));
	let generation = $state(0);
	let running = $state(false);
	let population = $derived(countLivingCells(grid));
	let timer: ReturnType<typeof setInterval> | null = null;

	function draw() {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		const cw = w / COLS;
		const ch = h / ROWS;
		const styles = getComputedStyle(canvas);
		ctx.clearRect(0, 0, w, h);
		ctx.strokeStyle = styles.getPropertyValue('--spread-tint');
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let x = 1; x < COLS; x++) {
			ctx.moveTo(Math.round(x * cw) + 0.5, 0);
			ctx.lineTo(Math.round(x * cw) + 0.5, h);
		}
		for (let y = 1; y < ROWS; y++) {
			ctx.moveTo(0, Math.round(y * ch) + 0.5);
			ctx.lineTo(w, Math.round(y * ch) + 0.5);
		}
		ctx.stroke();
		ctx.fillStyle = running
			? styles.getPropertyValue('--spread-spot')
			: styles.getPropertyValue('--spread-ink');
		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				if (grid[y][x]) ctx.fillRect(x * cw, y * ch, cw, ch);
			}
		}
	}

	function step() {
		grid = nextGeneration(grid, true).grid;
		generation += 1;
	}

	function play() {
		if (timer) return;
		running = true;
		timer = setInterval(step, STEP_MS);
	}

	function pause() {
		if (timer) clearInterval(timer);
		timer = null;
		running = false;
	}

	function reseed() {
		grid = randomizeGrid(COLS, ROWS, 0.22);
		generation = 0;
	}

	function onPointer(e: PointerEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor(((e.clientX - rect.left) / rect.width) * COLS);
		const y = Math.floor(((e.clientY - rect.top) / rect.height) * ROWS);
		grid = toggleCell(grid, x, y);
	}

	$effect(() => {
		void grid;
		void running;
		draw();
	});

	onMount(() => {
		// shortcut: grid size is chosen once at mount from the plate width (cells stay >= 24px on phones), not on resize
		if (canvas.clientWidth < 600) {
			COLS = 14;
			ROWS = 10;
			cols = COLS;
			rows = ROWS;
			grid = randomizeGrid(COLS, ROWS, 0.22);
		}
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (autoplay && !reduce) play();
		return pause;
	});
</script>

<div class="figure" class:paused={!running}>
	<canvas
		bind:this={canvas}
		width={700}
		height={520}
		onpointerdown={onPointer}
		aria-label="Conway's Game of Life. Click a cell to toggle it."
	></canvas>
	<div class="reading">
		<span class="state">{running ? 'Running' : 'Paused'}</span>
		<span>Generation {generation}</span>
		<span>Population {population}</span>
		<span class="controls">
			<button type="button" onclick={running ? pause : play}>{running ? 'Pause' : 'Play'}</button>
			<button type="button" onclick={reseed}>Reseed</button>
		</span>
	</div>
</div>

<style>
	.figure {
		display: contents;
	}
	canvas {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 700 / 520;
		border: 1.5px solid var(--spread-ink);
		background: var(--spread-paper);
		cursor: crosshair;
		touch-action: manipulation;
	}
	.paused canvas {
		border-style: dashed;
	}
</style>
