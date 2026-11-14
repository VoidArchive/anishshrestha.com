<script lang="ts">
	import { state, updateBoidCount } from '../store.svelte.js';

	function handleBoidCountChange(e: Event): void {
		const target = e.target as HTMLInputElement;
		updateBoidCount(parseInt(target.value, 10));
	}
</script>

<div class="controls">
	<!-- Boid Count -->
	<label class="control-group">
		<span class="caps control-label">Boids <b>{state.params.boidCount}</b></span>
		<input
			type="range"
			min="10"
			max="500"
			step="10"
			value={state.params.boidCount}
			oninput={handleBoidCountChange}
		/>
	</label>

	<!-- Max Speed -->
	<label class="control-group">
		<span class="caps control-label">Max speed <b>{state.params.maxSpeed.toFixed(1)}</b></span>
		<input type="range" min="1" max="10" step="0.5" bind:value={state.params.maxSpeed} />
	</label>

	<!-- Perception Radius -->
	<label class="control-group">
		<span class="caps control-label">Perception <b>{state.params.perceptionRadius}px</b></span>
		<input type="range" min="20" max="150" step="5" bind:value={state.params.perceptionRadius} />
	</label>

	<!-- Separation Weight -->
	<label class="control-group">
		<span class="caps control-label"
			>Separation <b>{state.params.separationWeight.toFixed(1)}</b></span
		>
		<input type="range" min="0" max="5" step="0.1" bind:value={state.params.separationWeight} />
	</label>

	<!-- Alignment Weight -->
	<label class="control-group">
		<span class="caps control-label"
			>Alignment <b>{state.params.alignmentWeight.toFixed(1)}</b></span
		>
		<input type="range" min="0" max="5" step="0.1" bind:value={state.params.alignmentWeight} />
	</label>

	<!-- Cohesion Weight -->
	<label class="control-group">
		<span class="caps control-label">Cohesion <b>{state.params.cohesionWeight.toFixed(1)}</b></span>
		<input type="range" min="0" max="5" step="0.1" bind:value={state.params.cohesionWeight} />
	</label>

	<!-- Edge Mode -->
	<div class="control-group">
		<span class="caps control-label">Edge behavior</span>
		<div class="toggle-group" role="radiogroup" aria-label="Edge behavior">
			<button
				class="btn"
				class:active={state.params.edgeMode === 'wrap'}
				onclick={() => (state.params.edgeMode = 'wrap')}
				role="radio"
				aria-checked={state.params.edgeMode === 'wrap'}
			>
				Wrap
			</button>
			<button
				class="btn"
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

	.control-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.control-label {
		display: flex;
		justify-content: space-between;
		font-weight: 400;
		letter-spacing: 0.14em;
		font-size: 12px;
	}

	.control-label b {
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--color-spot-text);
		font-variant-numeric: tabular-nums;
	}

	input[type='range'] {
		width: 100%;
		margin: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.toggle-group {
		display: flex;
		gap: var(--space-2);
	}

	.toggle-group .btn {
		flex: 1;
		justify-content: center;
	}
</style>
