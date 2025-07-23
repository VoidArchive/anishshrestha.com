<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		gameState,
		handleCellClick as applyPlayerMove,
		resetGame
	} from '$labs/tictactoe/store.svelte';
	import TicTacToeBoard from './TicTacToeBoard.svelte';
	import GameSettings from './GameSettings.svelte';
	import WinnerModal from './WinnerModal.svelte';
	import { getBestMove, resetAI } from '$labs/tictactoe/ai';

	// Game options
	let isPlayingComputer = $state(true);
	let playerSide: 'X' | 'O' = $state('X');
	let isComputerThinking = $state(false);

	// Timeout tracking for cleanup
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

	function isComputerTurn(): boolean {
		return isPlayingComputer && gameState.turn !== playerSide;
	}

	function handleCellClick(index: number) {
		if (isComputerTurn() || gameState.winner) return;
		applyPlayerMove(index);
	}

	$effect(() => {
		// trigger computer move if conditions met
		if (isComputerTurn() && !isComputerThinking && !gameState.winner) {
			isComputerThinking = true;
			// small async delay for UX
			const timeoutId = setTimeout(() => {
				// Double-check conditions in case state changed during timeout
				if (isComputerTurn() && !gameState.winner) {
					const aiPlayer = playerSide === 'X' ? 'O' : 'X'; // AI plays opposite of player
					const move = getBestMove(gameState, aiPlayer);
					if (move !== null) {
						applyPlayerMove(move);
					}
				}
				isComputerThinking = false;
			}, 200);

			// Track timeout for cleanup
			activeTimeouts.push(timeoutId);

			// Cleanup function to cancel timeout if effect reruns
			return () => {
				clearTimeout(timeoutId);
				isComputerThinking = false;
				// Remove from active timeouts
				const index = activeTimeouts.indexOf(timeoutId);
				if (index > -1) {
					activeTimeouts.splice(index, 1);
				}
			};
		}
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

	// Cleanup function to clear all active timeouts
	function cleanup() {
		activeTimeouts.forEach((timeoutId) => {
			clearTimeout(timeoutId);
		});
		activeTimeouts = [];
		isComputerThinking = false;
	}

	// Clear timeouts when component is destroyed
	onDestroy(() => {
		cleanup();
	});
</script>

<!-- Layout: controls left, board right (same as Bagchal) -->
<div class="grid h-full grid-cols-1 gap-8 lg:grid-cols-[350px_1fr]">
	<!-- Sidebar Section -->
	<aside class="space-y-6">
		<!-- Game Status -->
		<div class="section-card">
			<h2 class="section-title">Game Status</h2>
			<p><strong>Current Turn:</strong> {gameState.turn}</p>
			{#if isComputerThinking && isComputerTurn() && !gameState.winner}
				<p class="text-text-muted mt-1 text-sm">AI is thinking…</p>
			{/if}
		</div>

		<!-- Controls -->
		<div class="section-card">
			<h2 class="section-title">Controls</h2>
			<button class="btn w-full" onclick={handleReset}>Reset Game</button>
		</div>

		<!-- Game Settings -->
		<GameSettings
			{isPlayingComputer}
			{playerSide}
			onGameModeChange={handleGameModeChange}
			onPlayerSideChange={handlePlayerSideChange}
			onReset={handleReset}
		/>
	</aside>

	<!-- Board Section -->
	<section class="flex flex-col">
		<div class="section-card h-full">
			<h2 class="section-title">Tic Tac Toe</h2>

			<!-- Recessed Game Board Container -->
			<div class="flex flex-1 flex-col items-center justify-center p-3 sm:p-6">
				<!-- Board Well for consistent styling with Bagchal -->
				<div class="board-well">
					<div class="board-inner">
						<div class="board-wrapper">
							<TicTacToeBoard {gameState} {handleCellClick} />
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<!-- Winner modal -->
<WinnerModal {gameState} onPlayAgain={handleReset} />

<style>
	/* Board well styling copied from Bagchal for a consistent look */
	.board-well {
		width: 100%;
		padding: 0.75rem;
		position: relative;
	}

	.board-inner {
		width: 100%;
		aspect-ratio: 1;
		background: linear-gradient(145deg, #151515, var(--color-bg-primary));
		padding: 0.75rem;
		position: relative;
		box-shadow:
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			inset 0 0 20px rgba(0, 0, 0, 0.5),
			inset 0 0 40px rgba(201, 42, 42, 0.02);
	}

	.board-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	/* Increase cell size when space allows */
	:global(.ttt-grid .cell) {
		font-size: clamp(2.5rem, 6vw, 6rem);
	}
</style>
