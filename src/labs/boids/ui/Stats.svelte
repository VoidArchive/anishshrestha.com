<script lang="ts">
	import { state } from '../store.svelte';
</script>

<div class="stats">
	<div class="stat-item">
		<span class="stat-label">Status</span>
		<span class="stat-value" class:running={state.isRunning}>
			{state.isRunning ? 'Running' : 'Paused'}
		</span>
	</div>

	<div class="stat-item">
		<span class="stat-label">Boids</span>
		<span class="stat-value">{state.stats.boidCount}</span>
	</div>

	<div class="stat-item">
		<span class="stat-label">FPS</span>
		<span class="stat-value" class:low={state.stats.fps < 30}>{state.stats.fps}</span>
	</div>

	<div class="stat-item">
		<span class="stat-label">Canvas</span>
		<span class="stat-value">{state.canvasSize.width} × {state.canvasSize.height}</span>
	</div>
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-family: var(--font-mono);
	}

	.stat-value {
		font-size: 1rem;
		color: var(--color-text);
		font-family: var(--font-mono);
		font-weight: 600;
	}

	.stat-value.running {
		color: var(--color-primary);
	}

	.stat-value.low {
		color: #ff9800;
	}
</style>
