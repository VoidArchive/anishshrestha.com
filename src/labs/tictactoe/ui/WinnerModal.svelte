<script lang="ts">
	import type { GameState } from '#labs/tictactoe/rules.js';

	let { gameState, onPlayAgain }: { gameState: GameState; onPlayAgain: () => void } = $props();
</script>

<!-- Inline result plate under the board: no overlay, so the tinted winning line stays visible -->
{#if gameState.winner}
	<div class="result" role="status">
		<p class="headline">
			{gameState.winner === 'DRAW' ? 'A draw' : `${gameState.winner} wins`}
		</p>
		<button class="btn" onclick={onPlayAgain}>Play again</button>
	</div>
{/if}

<style>
	.result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-top: 16px;
		padding: 14px 16px;
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
	}
	.headline {
		margin: 0;
		font-family: var(--font-family-serif);
		font-size: 22px;
		font-weight: 600;
		line-height: 1.2;
	}
</style>
