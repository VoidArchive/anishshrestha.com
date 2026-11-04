<script lang="ts">
	import type { GameState } from '#labs/tictactoe/rules.js';

	let {
		gameState,
		handleCellClick
	}: { gameState: GameState; handleCellClick: (index: number) => void } = $props();

	// rules.ts keeps its combos private; the board only needs them to tint the winning line
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	const winLine = $derived(
		lines.find(
			([a, b, c]) =>
				gameState.board[a] &&
				gameState.board[a] === gameState.board[b] &&
				gameState.board[a] === gameState.board[c]
		) ?? []
	);
</script>

<!-- 3x3 board: cells on an ink background so the 1px gaps read as rules -->
<div class="ttt-grid" role="grid" aria-label="Tic Tac Toe board">
	{#each gameState.board as cell, index (index)}
		<button
			class="cell"
			class:o={cell === 'O'}
			class:win={winLine.includes(index)}
			onclick={() => handleCellClick(index)}
			disabled={!!cell || !!gameState.winner}
			aria-label="Cell {index + 1}, {cell ?? 'empty'}"
		>
			{#if cell === 'X'}
				<svg
					class="icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="square"
					><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
				>
			{:else if cell === 'O'}
				<svg
					class="icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"><circle cx="12" cy="12" r="9" /></svg
				>
			{/if}
		</button>
	{/each}
</div>

<style>
	.ttt-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
		gap: 1px;
		width: 100%;
		aspect-ratio: 1;
		background: var(--color-ink);
	}

	.cell {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-paper);
		border: 0;
		padding: 0;
		color: var(--color-ink);
		cursor: pointer;
	}
	.cell.o {
		color: var(--color-spot);
	}
	.cell.win {
		background: var(--color-tint);
	}
	.cell:disabled {
		cursor: default;
	}
	.cell:focus-visible {
		outline: 2px solid var(--color-spot);
		outline-offset: -4px;
	}

	.icon {
		width: 50%;
		height: 50%;
	}
</style>
