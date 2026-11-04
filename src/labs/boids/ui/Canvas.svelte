<script lang="ts">
	import { onMount } from 'svelte';
	import { state, updateCanvasSize, resetSimulation } from '../store.svelte.js';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number | null = null;
	let container: HTMLDivElement;

	const BOID_SIZE = 8;
	const TRAIL_ALPHA = 0.15;

	function drawBoid(x: number, y: number, vx: number, vy: number, color: string): void {
		if (!ctx) return;

		const angle = Math.atan2(vy, vx);

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);

		// Draw triangle pointing in direction of movement
		ctx.beginPath();
		ctx.moveTo(BOID_SIZE, 0);
		ctx.lineTo(-BOID_SIZE / 2, BOID_SIZE / 2);
		ctx.lineTo(-BOID_SIZE / 2, -BOID_SIZE / 2);
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();

		ctx.restore();
	}

	function render(): void {
		if (!ctx || !canvas) return;

		// Inks come from the page tokens so the plate matches the spread
		const styles = getComputedStyle(canvas);
		const paper = styles.getPropertyValue('--color-paper');
		const boidColor = styles.getPropertyValue(state.isRunning ? '--color-spot' : '--color-ink');

		// Semi-transparent wash of paper for the trail effect
		ctx.globalAlpha = TRAIL_ALPHA;
		ctx.fillStyle = paper;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;

		for (const boid of state.boids) {
			drawBoid(boid.position.x, boid.position.y, boid.velocity.x, boid.velocity.y, boidColor);
		}

		animationId = requestAnimationFrame(render);
	}

	function handleResize(): void {
		if (!container || !canvas) return;

		// Content box: the plate's border must not count toward the drawing size
		const width = container.clientWidth;
		const height = container.clientHeight;

		canvas.width = width;
		canvas.height = height;

		updateCanvasSize(width, height);

		// Clear canvas on resize
		if (ctx) {
			ctx.fillStyle = getComputedStyle(canvas).getPropertyValue('--color-paper');
			ctx.fillRect(0, 0, width, height);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		handleResize();
		// The flock was seeded at a placeholder size; reseed inside the measured plate
		resetSimulation();
		render();

		window.addEventListener('resize', handleResize);

		// Cleanup lives here, not in onDestroy: onDestroy also runs during SSR where window is undefined
		return () => {
			if (animationId !== null) {
				cancelAnimationFrame(animationId);
			}
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="plate" class:paused={!state.isRunning} bind:this={container}>
	<canvas
		bind:this={canvas}
		aria-label="A flock of {state.boids.length} boids following separation, alignment and cohesion."
	></canvas>
</div>

<style>
	.plate {
		width: 100%;
		aspect-ratio: 3 / 2;
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
		overflow: hidden;
	}

	.plate.paused {
		border-style: dashed;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 640px) {
		.plate {
			aspect-ratio: 4 / 3;
		}
	}
</style>
