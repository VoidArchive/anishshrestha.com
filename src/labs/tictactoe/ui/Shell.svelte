<script lang="ts">
	import {
		gameState,
		handleCellClick as applyPlayerMove,
		resetGame
	} from '#labs/tictactoe/store.svelte.js';
	import TicTacToeBoard from './TicTacToeBoard.svelte';
	import GameSettings from './GameSettings.svelte';
	import WinnerModal from './WinnerModal.svelte';
	import { getBestMove, resetAI } from '#labs/tictactoe/ai/index.js';

	// Game options
	let isPlayingComputer = $state(true);
	let playerSide: 'X' | 'O' = $state('X');

	// Session tally, counted once per finished game; the store itself keeps no score
	let tally = $state({ X: 0, O: 0, DRAW: 0 });
	let tallied = false;
	$effect(() => {
		const w = gameState.winner;
		if (w && !tallied) {
			tally[w]++;
			tallied = true;
		}
		if (!w) tallied = false;
	});

	const status = $derived.by(() => {
		const w = gameState.winner;
		if (w === 'DRAW') return 'Draw';
		if (w) {
			if (!isPlayingComputer) return `${w} wins`;
			return w === playerSide ? 'You win' : 'You lose';
		}
		if (!isPlayingComputer) return `${gameState.turn} to move`;
		return gameState.turn === playerSide ? 'Your move' : 'Thinking';
	});

	function isComputerTurn(): boolean {
		return isPlayingComputer && gameState.turn !== playerSide;
	}

	function handleCellClick(index: number) {
		if (isComputerTurn() || gameState.winner) return;
		applyPlayerMove(index);
	}

	// The computer answers a beat after the turn passes to it. Only state reads happen here;
	// the move itself runs in the timeout, so the effect never writes what it tracks.
	$effect(() => {
		if (!isComputerTurn() || gameState.winner) return;
		const aiPlayer = playerSide === 'X' ? 'O' : 'X';
		const id = setTimeout(() => {
			if (!isComputerTurn() || gameState.winner) return;
			const move = getBestMove(gameState, aiPlayer);
			if (move !== null) applyPlayerMove(move);
		}, 200);
		return () => clearTimeout(id);
	});

	function handleGameModeChange(isComputer: boolean) {
		isPlayingComputer = isComputer;
	}

	function handlePlayerSideChange(side: 'X' | 'O') {
		playerSide = side;
		resetAI(); // Clear AI cache when changing sides
	}

	function handleReset() {
		resetGame();
		resetAI(); // Clear AI cache when resetting game
	}
</script>

<header class="lab-head">
	<h1>Tic Tac Toe</h1>
	<p class="dek">The classic game against an unbeatable minimax player.</p>
</header>

<div class="lab-grid">
	<aside class="settings">
		<GameSettings
			{isPlayingComputer}
			{playerSide}
			onGameModeChange={handleGameModeChange}
			onPlayerSideChange={handlePlayerSideChange}
			onReset={handleReset}
		/>
	</aside>

	<section class="figure" aria-label="Game">
		<div class="plate" class:over={!!gameState.winner}>
			<TicTacToeBoard {gameState} {handleCellClick} />
		</div>

		<div class="reading">
			<span class="state">{status}</span>
			{#if isPlayingComputer}
				<span>{playerSide}</span>
				<span>Wins {tally[playerSide]}</span>
				<span>Draws {tally.DRAW}</span>
				<span>Losses {tally[playerSide === 'X' ? 'O' : 'X']}</span>
			{:else}
				<span>X {tally.X}</span>
				<span>O {tally.O}</span>
				<span>Draws {tally.DRAW}</span>
			{/if}
			<span class="controls">
				<button onclick={handleReset}>Reset</button>
			</span>
		</div>

		<WinnerModal {gameState} onPlayAgain={handleReset} />
	</section>
</div>

<style>
	.lab-head {
		margin-bottom: 40px;
	}
	h1 {
		font-family: var(--font-family-display);
		font-weight: 600;
		font-size: clamp(34px, 3vw, 40px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		margin: 8px 0 10px;
	}
	.dek {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: 17px;
		margin: 0;
	}

	.lab-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
	}
	.figure {
		max-width: 560px;
		width: 100%;
	}
	.plate {
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
	}
	.plate.over {
		border-style: dashed;
	}

	/* Reading row: the home page pattern, scoped here */
	.reading {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--color-ink);
		font-family: var(--font-family-sans);
		font-size: 11.5px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		line-height: 1.5;
		font-variant-numeric: tabular-nums;
		color: var(--color-spot-text);
	}
	.state::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		background: currentColor;
		margin-right: 6px;
		vertical-align: 1px;
	}
	.controls {
		margin-left: auto;
		display: flex;
		gap: 12px;
	}
	.reading button {
		font: inherit;
		letter-spacing: inherit;
		text-transform: inherit;
		color: var(--color-ink);
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--color-spot);
		text-underline-offset: 3px;
	}
	.reading button:hover {
		color: var(--color-spot-text);
	}

	@media (min-width: 1025px) {
		.lab-grid {
			grid-template-columns: 350px minmax(0, 1fr);
			align-items: start;
		}
	}
	@media (max-width: 1024px) {
		/* The board leads on phones; settings follow it */
		.settings {
			order: 2;
		}
		.figure {
			order: 1;
		}
	}
</style>
