<script lang="ts">
	import { onMount } from 'svelte';
	import { createFlock, updateFlock } from '#labs/boids/rules/boids.js';
	import { DEFAULT_PARAMS } from '#labs/boids/rules/types.js';
	import type { Boid } from '#labs/boids/rules/types.js';

	const W = 600;
	const H = 400;
	const COUNT = 120;

	let { autoplay = true }: { autoplay?: boolean } = $props();

	let canvas: HTMLCanvasElement;
	let boids: Boid[] = createFlock(COUNT, W, H);
	// Looser flock than the lab so 120 boids stay spread across a small plate
	const params = {
		...DEFAULT_PARAMS,
		boidCount: COUNT,
		perceptionRadius: 36,
		cohesionWeight: 0.5,
		separationWeight: 2
	};
	let running = $state(false);
	let frame: number | null = null;

	function draw() {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;
		const styles = getComputedStyle(canvas);
		ctx.clearRect(0, 0, W, H);
		ctx.fillStyle = running
			? styles.getPropertyValue('--spread-spot')
			: styles.getPropertyValue('--spread-ink');
		for (const b of boids) {
			const a = Math.atan2(b.velocity.y, b.velocity.x);
			ctx.save();
			ctx.translate(b.position.x, b.position.y);
			ctx.rotate(a);
			ctx.beginPath();
			ctx.moveTo(7, 0);
			ctx.lineTo(-5, 4);
			ctx.lineTo(-5, -4);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	}

	function tick() {
		updateFlock(boids, params, W, H);
		draw();
		frame = requestAnimationFrame(tick);
	}

	function play() {
		if (frame !== null) return;
		running = true;
		frame = requestAnimationFrame(tick);
	}

	function pause() {
		if (frame !== null) cancelAnimationFrame(frame);
		frame = null;
		running = false;
		draw();
	}

	onMount(() => {
		draw();
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (autoplay && !reduce) play();
		return pause;
	});
</script>

<canvas
	bind:this={canvas}
	width={W}
	height={H}
	class:paused={!running}
	aria-label="A flock of {COUNT} boids following separation, alignment and cohesion."
></canvas>
<div class="reading">
	<span class="state">{running ? 'Running' : 'Paused'}</span>
	<span>{COUNT} boids</span>
	<span>Wrap edges</span>
	<span class="controls">
		<button type="button" onclick={running ? pause : play}>{running ? 'Pause' : 'Play'}</button>
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
	canvas.paused {
		border-style: dashed;
	}
</style>
