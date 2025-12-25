<script lang="ts">
	import { Play, Pause, RotateCcw } from 'lucide-svelte';
	import { state, toggleSimulation, resetSimulation, updateBoidCount } from '../store.svelte';

	function handleBoidCountChange(e: Event): void {
		const target = e.target as HTMLInputElement;
		updateBoidCount(parseInt(target.value, 10));
	}
</script>

<div class="controls">
	<!-- Playback Controls -->
	<div class="control-row">
		<button
			class="btn control-btn"
			onclick={toggleSimulation}
			aria-label={state.isRunning ? 'Pause' : 'Play'}
		>
			{#if state.isRunning}
				<Pause size={18} />
				<span>Pause</span>
			{:else}
				<Play size={18} />
				<span>Play</span>
			{/if}
		</button>

		<button class="btn btn-secondary control-btn" onclick={resetSimulation} aria-label="Reset">
			<RotateCcw size={18} />
			<span>Reset</span>
		</button>
	</div>

	<!-- Boid Count -->
	<label class="control-group">
		<span class="control-label">Boids: {state.params.boidCount}</span>
		<input
			type="range"
			min="10"
			max="500"
			step="10"
			value={state.params.boidCount}
			oninput={handleBoidCountChange}
			class="slider"
		/>
	</label>

	<!-- Max Speed -->
	<label class="control-group">
		<span class="control-label">Max Speed: {state.params.maxSpeed.toFixed(1)}</span>
		<input
			type="range"
			min="1"
			max="10"
			step="0.5"
			bind:value={state.params.maxSpeed}
			class="slider"
		/>
	</label>

	<!-- Perception Radius -->
	<label class="control-group">
		<span class="control-label">Perception: {state.params.perceptionRadius}px</span>
		<input
			type="range"
			min="20"
			max="150"
			step="5"
			bind:value={state.params.perceptionRadius}
			class="slider"
		/>
	</label>

	<!-- Separation Weight -->
	<label class="control-group">
		<span class="control-label">Separation: {state.params.separationWeight.toFixed(1)}</span>
		<input
			type="range"
			min="0"
			max="5"
			step="0.1"
			bind:value={state.params.separationWeight}
			class="slider"
		/>
	</label>

	<!-- Alignment Weight -->
	<label class="control-group">
		<span class="control-label">Alignment: {state.params.alignmentWeight.toFixed(1)}</span>
		<input
			type="range"
			min="0"
			max="5"
			step="0.1"
			bind:value={state.params.alignmentWeight}
			class="slider"
		/>
	</label>

	<!-- Cohesion Weight -->
	<label class="control-group">
		<span class="control-label">Cohesion: {state.params.cohesionWeight.toFixed(1)}</span>
		<input
			type="range"
			min="0"
			max="5"
			step="0.1"
			bind:value={state.params.cohesionWeight}
			class="slider"
		/>
	</label>

	<!-- Edge Mode -->
	<div class="control-group">
		<span class="control-label">Edge Behavior</span>
		<div class="toggle-group" role="radiogroup" aria-label="Edge behavior">
			<button
				class="toggle-btn"
				class:active={state.params.edgeMode === 'wrap'}
				onclick={() => (state.params.edgeMode = 'wrap')}
				role="radio"
				aria-checked={state.params.edgeMode === 'wrap'}
			>
				Wrap
			</button>
			<button
				class="toggle-btn"
				class:active={state.params.edgeMode === 'bounce'}
				onclick={() => (state.params.edgeMode = 'bounce')}
				role="radio"
				aria-checked={state.params.edgeMode === 'bounce'}
			>
				Bounce
			</button>
		</div>
	</div>
</div>

<style>
	.controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.control-row {
		display: flex;
		gap: var(--space-2);
	}

	.control-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.control-label {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
	}

	.slider {
		width: 100%;
		height: 6px;
		background: var(--color-bg-secondary);
		outline: none;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
	}

	.toggle-group {
		display: flex;
		gap: var(--space-1);
	}

	.toggle-btn {
		flex: 1;
		padding: var(--space-2);
		background: var(--color-bg-secondary);
		border: 1px solid transparent;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.toggle-btn:hover {
		background: var(--color-bg-primary);
	}

	.toggle-btn.active {
		background: var(--color-primary);
		color: var(--color-bg-primary);
		border-color: var(--color-primary);
	}
</style>
