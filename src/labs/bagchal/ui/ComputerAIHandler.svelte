<script lang="ts">
	import { onDestroy } from 'svelte';
	import { gameState, adjacency, points } from '$labs/bagchal/store.svelte';
	import { executeMove, checkIfTigersAreTrapped } from '$labs/bagchal/rules';
	import { ComputerPlayer } from '$labs/bagchal/ai';
	import type { Move } from '$labs/bagchal/ai/types';

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

	// Computer player - use $derived to react to gameMode changes
	let computerPlayer = $derived(new ComputerPlayer(gameMode));

	// Computer move state
	let isComputerThinking = $state(false);

	// Race condition protection - atomic lock mechanism
	let moveExecutionLock = $state(false);

	// Timeout tracking for cleanup
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

	// Check if it's the computer's turn
	function isComputerTurn(): boolean {
		if (!isPlayingComputer) return false;
		return gameState.turn !== playerSide;
	}

	// Execute computer move
	async function executeComputerMove() {
		// Atomic check-and-set pattern to prevent race conditions
		if (moveExecutionLock || isComputerThinking || gameState.winner) return;

		// Set lock atomically - if already set, another execution is in progress
		moveExecutionLock = true;
		isComputerThinking = true;

		try {
			const computerMove = computerPlayer.getBestMove(gameState);

			if (computerMove) {
				// Trigger animation first
				onTriggerAnimation?.(computerMove);

				// Wait for animation to reach midpoint, then execute move
				try {
					await new Promise((resolve) => {
						const timeoutId = setTimeout(resolve, 200);
						activeTimeouts.push(timeoutId);
					});
				} catch (error) {
					// NOTE: Animation timing error - continue with move execution
					console.warn('Animation timing delay failed:', error);
				}

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
				try {
					await new Promise((resolve) => setTimeout(resolve, 400));
				} catch (error) {
					// NOTE: Animation completion delay failed - continue execution
					console.warn('Animation completion delay failed:', error);
				}
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
			// Ensure proper cleanup of both locks
			isComputerThinking = false;
			moveExecutionLock = false;
		}
	}

	// Reactive computer move trigger
	$effect(() => {
		if (isComputerTurn() && !moveExecutionLock && !isComputerThinking && !gameState.winner) {
			// Simple delay to prevent immediate execution after undo
			const timeSinceUndo = Date.now() - lastUndoTime;
			if (timeSinceUndo >= 200) {
				executeComputerMove();
			} else {
				try {
					const timeoutId = setTimeout(() => {
						try {
							if (
								isComputerTurn() &&
								!moveExecutionLock &&
								!isComputerThinking &&
								!gameState.winner
							) {
								executeComputerMove();
							}
						} catch (error) {
							// NOTE: Delayed computer move execution failed
							console.warn('Delayed computer move execution failed:', error);
						}
					}, 200 - timeSinceUndo);
					activeTimeouts.push(timeoutId);
				} catch (error) {
					// NOTE: setTimeout for delayed computer move failed
					console.warn('setTimeout for delayed computer move failed:', error);
					// Fallback: try to execute immediately if conditions are met
					if (isComputerTurn() && !moveExecutionLock && !isComputerThinking && !gameState.winner) {
						executeComputerMove();
					}
				}
			}
		}
	});

	// Cleanup function to clear all active timeouts
	function cleanup() {
		activeTimeouts.forEach((timeoutId) => {
			clearTimeout(timeoutId);
		});
		activeTimeouts = [];
		isComputerThinking = false;
		moveExecutionLock = false;
	}

	// Clear timeouts when component is destroyed
	onDestroy(() => {
		cleanup();
	});

	// Export functions and state for parent component
	export { isComputerThinking, computerPlayer };
</script>
