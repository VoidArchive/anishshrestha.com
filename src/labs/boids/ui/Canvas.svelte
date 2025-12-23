<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { state, updateCanvasSize } from '../store.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number | null = null;
	let container: HTMLDivElement;

	const BOID_SIZE = 8;
	const BOID_COLOR = '#ff6b6b';
	const TRAIL_ALPHA = 0.15;

	function drawBoid(x: number, y: number, vx: number, vy: number): void {
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

		ctx.fillStyle = BOID_COLOR;
		ctx.fill();

		ctx.restore();
	}

	function render(): void {
		if (!ctx || !canvas) return;

		// Semi-transparent clear for trail effect
		ctx.fillStyle = `rgba(13, 13, 13, ${TRAIL_ALPHA})`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw all boids
		for (const boid of state.boids) {
			drawBoid(boid.position.x, boid.position.y, boid.velocity.x, boid.velocity.y);
		}

		animationId = requestAnimationFrame(render);
	}

	function handleResize(): void {
		if (!container || !canvas) return;

		const rect = container.getBoundingClientRect();
		const width = Math.floor(rect.width);
		const height = Math.floor(rect.height);

		canvas.width = width;
		canvas.height = height;

		updateCanvasSize(width, height);

		// Clear canvas on resize
		if (ctx) {
			ctx.fillStyle = '#0d0d0d';
			ctx.fillRect(0, 0, width, height);
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		handleResize();
		render();

		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (animationId !== null) {
			cancelAnimationFrame(animationId);
		}
		window.removeEventListener('resize', handleResize);
	});
</script>

<div class="canvas-board-container">
	<!-- Canvas Info -->
	<div class="canvas-info">
		<span class="canvas-size">{state.canvasSize.width} × {state.canvasSize.height}</span>
		<span class="interaction-hint">{state.boids.length} boids</span>
	</div>

	<!-- Recessed Board Well -->
	<div class="board-well">
		<div class="board-inner">
			<div class="board-wrapper">
				<div class="canvas-wrapper" bind:this={container}>
					<canvas bind:this={canvas}></canvas>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.canvas-board-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		height: 100%;
	}

	.canvas-info {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-align: center;
		margin-bottom: var(--space-3);
		flex-shrink: 0;
	}

	.canvas-size {
		font-weight: 600;
	}

	.interaction-hint {
		font-style: italic;
	}

	.board-well {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
		padding: 0.5rem;
	}

	@media (min-width: 640px) {
		.board-well {
			padding: 0.75rem;
		}
	}

	.board-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: linear-gradient(145deg, #151515, var(--color-bg-primary));
		padding: 0.5rem;
		position: relative;
		min-height: 0;
		box-shadow:
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			inset 0 0 20px rgba(0, 0, 0, 0.5),
			inset 0 0 40px rgba(255, 107, 107, 0.02);
	}

	@media (min-width: 640px) {
		.board-inner {
			padding: 0.75rem;
		}
	}

	.board-inner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(255, 107, 107, 0.008) 0%, transparent 50%);
		pointer-events: none;
	}

	.board-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		padding: 0.5rem;
		background: transparent;
	}

	@media (min-width: 640px) {
		.board-wrapper {
			padding: 0.75rem;
		}
	}

	.canvas-wrapper {
		width: 100%;
		height: 100%;
		min-height: 300px;
		background: rgba(13, 13, 13, 1);
		border-radius: 4px;
		overflow: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.canvas-info {
			flex-direction: column;
			gap: var(--space-1);
			margin-bottom: var(--space-2);
		}

		.canvas-wrapper {
			min-height: 250px;
		}
	}

	@media (max-width: 480px) {
		.canvas-wrapper {
			min-height: 200px;
		}
	}
</style>
