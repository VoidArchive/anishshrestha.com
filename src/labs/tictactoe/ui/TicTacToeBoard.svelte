<script lang="ts">
	import type { GameState } from '$labs/tictactoe/rules';

	export let gameState: GameState;
	export let handleCellClick: (index: number) => void;
</script>

<!-- 3x3 TicTacToe board -->
<div class="board-container">
	<!-- Board Lines -->
	<div class="line vert v1"></div>
	<div class="line vert v2"></div>
	<div class="line horiz h1"></div>
	<div class="line horiz h2"></div>

	<!-- Grid of cells -->
	<div class="ttt-grid">
		{#each gameState.board as cell, index (index)}
			<button
				class="cell"
				onclick={() => handleCellClick(index)}
				disabled={!!cell || !!gameState.winner}
			>
				{#if cell === 'X'}
					<svg
						class="icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#f8f8f8"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
					>
				{:else if cell === 'O'}
					<svg
						class="icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#f8f8f8"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><circle cx="12" cy="12" r="9" /></svg
					>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.board-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
	}

	/* Board lines */
	.line {
		position: absolute;
		background: var(--color-border, #666);
	}
	.vert {
		top: 0;
		bottom: 0;
		width: 4px;
	}
	.horiz {
		left: 0;
		right: 0;
		height: 4px;
	}
	.v1 {
		left: 33.333%;
	}
	.v2 {
		left: 66.666%;
	}
	.h1 {
		top: 33.333%;
	}
	.h2 {
		top: 66.666%;
	}

	.ttt-grid {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}

	.cell {
		background: transparent;
		border: none;
		outline: none;
		cursor: pointer;
		color: var(--color-primary-red);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cell:disabled {
		cursor: default;
		opacity: 0.8;
	}

	.icon {
		width: 60%;
		height: 60%;
	}
</style>
