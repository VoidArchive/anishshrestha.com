<script lang="ts">
	interface Props {
		moveHistory: string[];
	}

	let { moveHistory }: Props = $props();
</script>

<div class="section-card">
	<h2 class="section-title">Move History</h2>
	<div class="max-h-40 overflow-y-auto sm:max-h-none sm:overflow-visible">
		{#if moveHistory.length === 0}
			<p class="text-text-secondary text-sm">No moves yet</p>
		{:else}
			<ul class="space-y-1 text-xs sm:text-sm ">
				{#each moveHistory as move, index}
					<li class="text-text-secondary list-none">
						{index + 1}. {move}
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
		border-radius: 2px;
	}

	.max-h-40::-webkit-scrollbar-thumb:hover {
		background: var(--color-primary-red);
	}
</style>
