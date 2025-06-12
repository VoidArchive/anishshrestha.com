<script lang="ts">
	interface Props {
		moveHistory: string[];
	}

	let { moveHistory }: Props = $props();
</script>

<div class="section-card">
	<h2 class="section-title">Move History</h2>
	<div class="max-h-32 overflow-y-auto">
		{#if moveHistory.length === 0}
			<p class="text-text-secondary text-sm">No moves yet</p>
		{:else}
			<ul class="text-sm space-y-1">
				{#each moveHistory as move, index}
					<li class="text-text-secondary">
						{index + 1}. {move}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	/* Scrollbar for move history */
	.max-h-32::-webkit-scrollbar {
		width: 4px;
	}
	
	.max-h-32::-webkit-scrollbar-track {
		background: var(--color-bg-primary);
	}
	
	.max-h-32::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 2px;
	}
	
	.max-h-32::-webkit-scrollbar-thumb:hover {
		background: var(--color-primary-red);
	}
</style> 