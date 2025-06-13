<script lang="ts">
	interface Props {
		onReset: () => void;
		onUndo: () => void;
		canUndo: boolean;
	}

	let { onReset, onUndo, canUndo }: Props = $props();
</script>

<div class="section-card">
	<h2 class="section-title">Game Controls</h2>
	<div class="space-y-3">
		<button class="btn w-full" onclick={onReset}> New Game </button>
		<button class="btn w-full" onclick={onUndo} disabled={!canUndo}> Undo Move </button>
	</div>
</div>

<style>
	/* Disable button styling */
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:disabled:hover {
		border-color: var(--color-border);
		color: var(--color-text-primary);
	}
</style>
