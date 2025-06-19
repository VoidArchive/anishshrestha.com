<script lang="ts">
	import { gameState, adjacency, points } from '$games/bagchal/store.svelte';
	import { executeMove, checkIfTigersAreTrapped } from '$games/bagchal/rules';
	import { ComputerPlayer } from '$games/bagchal/ai';
	import type { Move } from '$games/bagchal/ai/types';

	interface Props {
		gameMode: 'EASY' | 'HARD';
		isPlayingComputer: boolean;
		playerSide: string;
		lastUndoTime: number;
		onSaveGameState: () => void;
		onAddToHistory: (message: string) => void;
		onTriggerAnimation?: (move: Move) => void;
	}

	let { 
		gameMode, 
		isPlayingComputer, 
		playerSide, 
		lastUndoTime,
		onSaveGameState, 
		onAddToHistory,
		onTriggerAnimation
	}: Props = $props();

	// Computer player
	let computerPlayer = new ComputerPlayer(gameMode);

	// Computer move state
	let isComputerThinking = $state(false);
	let aiCalculatedMove = $state(null as Move | null);

	// Check if it's the computer's turn
	function isComputerTurn(): boolean {
		if (!isPlayingComputer) return false;
		return gameState.turn !== playerSide;
	}

	// Execute computer move
	async function executeComputerMove() {
		if (isComputerThinking || gameState.winner) return;

		isComputerThinking = true;
		aiCalculatedMove = null;

		try {
			const computerMove = computerPlayer.getBestMove(gameState, adjacency, points);

			if (computerMove) {
				// Trigger animation first
				onTriggerAnimation?.(computerMove);
				
				// Wait for animation to reach midpoint, then execute move
				await new Promise((resolve) => setTimeout(resolve, 600));

				onSaveGameState();

				// Execute the move at animation midpoint
				if (computerMove.moveType === 'PLACEMENT') {
					gameState.board[computerMove.to] = 'GOAT';
					gameState.goatsPlaced++;
					onAddToHistory(`Computer placed goat at position ${computerMove.to}`);

					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						gameState.winner = 'GOAT';
						onAddToHistory('Computer (Goats) wins by trapping tigers!');
					}

					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
					}

					if (!gameState.winner) {
						gameState.turn = gameState.turn === 'GOAT' ? 'TIGER' : 'GOAT';
					}
				} else {
					if (computerMove.jumpedGoatId) {
						onAddToHistory(
							`AI captured goat at ${computerMove.jumpedGoatId} and moved to ${computerMove.to}`
						);
					} else {
						onAddToHistory(`AI moved from ${computerMove.from} to ${computerMove.to}`);
					}

					executeMove(
						gameState,
						computerMove.from!,
						computerMove.to,
						computerMove.jumpedGoatId || null,
						adjacency,
						points
					);
				}

				gameState.selectedPieceId = null;
				
				// Wait for animation to complete
				await new Promise((resolve) => setTimeout(resolve, 600));
			} else {
				if (gameState.turn === 'TIGER') {
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						gameState.winner = 'GOAT';
						onAddToHistory('Tigers are trapped - Goats win!');
					}
				} else {
					onAddToHistory('Computer (Goats) has no valid moves available');
				}
			}
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error('Computer move error:', error);
			}
		} finally {
			isComputerThinking = false;
		}
	}

	// Update computer player mode when gameMode changes
	$effect(() => {
		computerPlayer.setMode(gameMode);
	});

	// Reactive computer move trigger
	$effect(() => {
		if (isComputerTurn() && !isComputerThinking && !gameState.winner) {
			// Simple delay to prevent immediate execution after undo
			const timeSinceUndo = Date.now() - lastUndoTime;
			if (timeSinceUndo >= 200) {
				executeComputerMove();
			} else {
				setTimeout(() => {
					if (isComputerTurn() && !isComputerThinking && !gameState.winner) {
						executeComputerMove();
					}
				}, 200 - timeSinceUndo);
			}
		}
	});

	// Export functions and state for parent component
	export { isComputerThinking, computerPlayer };
</script> 