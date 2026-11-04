<script lang="ts">
	interface Props {
		moveHistory: string[];
	}

	let { moveHistory }: Props = $props();
</script>

<section class="history">
	<h2 class="section-title">Move History</h2>
	{#if moveHistory.length === 0}
		<p class="empty">No moves yet.</p>
	{:else}
		<ol class="list">
			{#each moveHistory.toReversed() as move, index (index)}
				<li>
					<span class="caps">{moveHistory.length - index}</span>
					<span>{move}</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.history {
		max-width: 680px;
		margin-top: 24px;
	}
	.empty {
		font-style: italic;
	}
	.list {
		list-style: none;
		max-height: 10rem;
		overflow-y: auto;
		font-size: 15.5px;
	}
	.list li {
		display: flex;
		gap: 12px;
		padding: 6px 0;
		border-top: 1px solid var(--color-ink);
	}
	.list li:first-child {
		border-top: 0;
	}
	.list .caps {
		min-width: 2ch;
		color: var(--color-spot);
		font-variant-numeric: tabular-nums;
		line-height: inherit;
	}
</style>
