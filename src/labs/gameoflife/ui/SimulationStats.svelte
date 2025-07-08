<!--
Conway's Game of Life - Simulation Statistics Component

Displays real-time statistics about the simulation including population,
generation count, birth/death rates, and other relevant metrics.
-->

<script lang="ts">
	import { Activity, Users, TrendingUp, TrendingDown, Hash } from 'lucide-svelte';
	import { simulationState } from '../store.svelte';

	// Get reactive stats directly from simulation state
	let stats = $derived({
		population: simulationState.stats.population,
		generation: simulationState.generation,
		born: simulationState.stats.born,
		died: simulationState.stats.died,
		isRunning: simulationState.isRunning,
		speed: simulationState.speed,
		wrapEdges: simulationState.wrapEdges
	});
</script>

<div class="stats-container">
	<!-- Main Stats Grid (Two Columns) -->
	<div class="stats-grid">
		<!-- Generation Counter -->
		<div class="stat-item">
			<div class="stat-icon">
				<Hash size={18} />
			</div>
			<div class="stat-content">
				<span class="stat-label">Generation</span>
				<span class="stat-value">{stats.generation}</span>
			</div>
		</div>

		<!-- Population -->
		<div class="stat-item">
			<div class="stat-icon">
				<Users size={18} />
			</div>
			<div class="stat-content">
				<span class="stat-label">Population</span>
				<span class="stat-value">{stats.population}</span>
			</div>
		</div>

		<!-- Birth Rate -->
		<div class="stat-item positive">
			<div class="stat-icon">
				<TrendingUp size={18} />
			</div>
			<div class="stat-content">
				<span class="stat-label">Born</span>
				<span class="stat-value">{stats.born}</span>
			</div>
		</div>

		<!-- Death Rate -->
		<div class="stat-item negative">
			<div class="stat-icon">
				<TrendingDown size={18} />
			</div>
			<div class="stat-content">
				<span class="stat-label">Died</span>
				<span class="stat-value">{stats.died}</span>
			</div>
		</div>
	</div>

	<!-- Status and Info Section -->
	<div class="info-section">
		<!-- Status Indicator -->
		<div class="status-indicator">
			<div class="status-dot {stats.isRunning ? 'running' : 'paused'}"></div>
			<span class="status-text">
				{stats.isRunning ? 'Running' : 'Paused'}
			</span>
		</div>

		<!-- Speed Info - Always reserve space to prevent layout shift -->
		<div class="speed-info" class:visible={stats.isRunning}>
			<Activity size={16} />
			<span class="speed-text">
				{stats.speed}ms per generation
			</span>
		</div>

		<!-- Wrap Mode Info -->
		{#if stats.wrapEdges}
			<div class="wrap-info">
				<span class="wrap-badge">Toroidal Mode</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.stats-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	.info-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.stat-item:hover {
		border-color: var(--color-primary);
		background: rgba(201, 42, 42, 0.05);
	}

	.stat-item.positive .stat-icon {
		color: #22c55e;
	}

	.stat-item.negative .stat-icon {
		color: #ef4444;
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
	}

	.stat-label {
		font-family: var(--font-family-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-family: var(--font-family-mono);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.status-dot.running {
		background: #22c55e;
	}

	.status-dot.paused {
		background: var(--color-text-muted);
		animation: none;
	}

	.status-text {
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.speed-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.3s ease,
			visibility 0.3s ease;
	}

	.speed-info.visible {
		opacity: 1;
		visibility: visible;
	}

	.speed-text {
		font-family: var(--font-family-mono);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.wrap-info {
		display: flex;
		justify-content: center;
		padding: var(--space-1);
	}

	.wrap-badge {
		background: var(--color-primary);
		color: white;
		padding: var(--space-1) var(--space-2);
		border-radius: 12px;
		font-family: var(--font-family-mono);
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.stat-item {
			padding: var(--space-3);
		}

		.stat-value {
			font-size: 1.125rem;
		}
	}
</style>
