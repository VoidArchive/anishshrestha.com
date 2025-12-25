<script lang="ts">
	interface Props {
		moveHistory: string[];
	}

	let { moveHistory }: Props = $props();
</script>

<div class="section-card">
	<h2 class="section-title">Move History</h2>
	<div class="max-h-40 overflow-y-auto">
		{#if moveHistory.length === 0}
			<p class="text-text-muted text-sm">No moves yet</p>
		{:else}
			<ul class="space-y-1 text-xs sm:text-sm">
				{#each moveHistory.toReversed() as move, index (index)}
					<li class="text-text-muted list-none">
						{moveHistory.length - index}. {move}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	/* Mobile scrollbar styling */
	.max-h-40::-webkit-scrollbar {
		width: 4px;
	}

	.max-h-40::-webkit-scrollbar-track {
		background: var(--color-bg-primary);
	}

	.max-h-40::-webkit-scrollbar-thumb {
		background: var(--color-border);
	}

	.max-h-40::-webkit-scrollbar-thumb:hover {
		background: var(--color-primary-red);
	}
</style>
