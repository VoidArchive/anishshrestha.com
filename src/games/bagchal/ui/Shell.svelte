<script lang="ts">
	import { onMount } from 'svelte';
	import {
		gameState,
		points,
		lines,
		adjacency,
		getValidMoves,
		getCurrentTigerCaptures,
		resetGameState
	} from '$games/bagchal/store.svelte';
	import {
		executeMove,
		checkIfTigersAreTrapped,
		type PieceType,
		type Player,
		type GamePhase
	} from '$games/bagchal/rules';
	import { ComputerPlayer } from '$games/bagchal/ai';
	import GameBoard from './GameBoard.svelte';
	import GameSidebar from './GameSidebar.svelte';
	import WinnerModal from './WinnerModal.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import type { Move } from '$games/bagchal/ai/types';

	// Game history for undo functionality
	let moveHistory: string[] = $state([]);

	// Type for saved game state
	interface SavedGameState {
		board: PieceType[];
		turn: Player;
		phase: GamePhase;
		goatsPlaced: number;
		goatsCaptured: number;
		selectedPieceId: number | null;
		winner: Player | 'DRAW' | null;
		positionHistory: string[];
		positionCounts: Map<string, number>;
		moveHistoryLength: number;
	}

	let gameStateHistory: SavedGameState[] = $state([]); // Store previous game states

	// Game settings
	let isPlayingComputer = $state(true); // Default to computer
	let playerSide = $state('GOAT'); // Default to playing as goats
	let gameMode: 'CLASSIC' | 'REFORGED' = $state('CLASSIC');

	// Computer player - initialize with default mode
	let computerPlayer = new ComputerPlayer('CLASSIC');

	// Local derived state
	let validMoves = $derived(getValidMoves());
	let currentTigerCaptures = $derived(getCurrentTigerCaptures());
	let canUndo = $derived(gameStateHistory.length > 0 && !gameState.winner);

	// Computer move flag to prevent infinite loops
	let isComputerThinking = $state(false);
	let aiCalculatedMove = $state(null as Move | null);

	// Save current game state before making a move
	function saveGameState() {
		gameStateHistory.push({
			board: [...gameState.board],
			turn: gameState.turn,
			phase: gameState.phase,
			goatsPlaced: gameState.goatsPlaced,
			goatsCaptured: gameState.goatsCaptured,
			selectedPieceId: gameState.selectedPieceId,
			winner: gameState.winner,
			positionHistory: [...gameState.positionHistory],
			positionCounts: new Map(gameState.positionCounts),
			moveHistoryLength: moveHistory.length
		});

		// Keep only last 10 moves to prevent memory issues
		if (gameStateHistory.length > 10) {
			gameStateHistory.shift();
		}
	}

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
			// Add a small delay for better UX
			await new Promise((resolve) => setTimeout(resolve, 200));

			const computerMove = computerPlayer.getBestMove(gameState, adjacency, points);

			if (computerMove) {
				// Store the calculated move for animation
				aiCalculatedMove = computerMove;

				// Wait for animation to complete before executing move
				await new Promise((resolve) => setTimeout(resolve, 800)); // Faster animation

				saveGameState();

				if (computerMove.moveType === 'PLACEMENT') {
					// Computer placing goat
					gameState.board[computerMove.to] = 'GOAT';
					gameState.goatsPlaced++;
					moveHistory.push(`Computer placed goat at position ${computerMove.to}`);

					// Check for Goat Win by Trapping
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						gameState.winner = 'GOAT';
						moveHistory.push('Computer (Goats) wins by trapping tigers!');
					}

					// Change phase if 20 goats are placed
					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
					}

					// Switch turn
					if (!gameState.winner) {
						gameState.turn = gameState.turn === 'GOAT' ? 'TIGER' : 'GOAT';
					}
				} else {
					// Computer movement or capture
					if (computerMove.jumpedGoatId) {
						moveHistory.push(
							`Computer captured goat at ${computerMove.jumpedGoatId} and moved to ${computerMove.to}`
						);
					} else {
						moveHistory.push(`Computer moved from ${computerMove.from} to ${computerMove.to}`);
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

				// Reset selection and clear animation
				gameState.selectedPieceId = null;
				aiCalculatedMove = null;
			} else {
				// No valid move available for computer - check if game should end
				if (gameState.turn === 'TIGER') {
					// Tiger has no moves - tigers are trapped, goats win
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						gameState.winner = 'GOAT';
						moveHistory.push('Tigers are trapped - Goats win!');
					}
				} else {
					// Goat has no moves (very rare case)
					moveHistory.push('Computer (Goats) has no valid moves available');
				}
			}
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error('Computer move error:', error);
			}
			aiCalculatedMove = null;
		} finally {
			// Always reset thinking state at the end
			isComputerThinking = false;
		}
	}

	// Handle board position clicks
	function handlePointClick(id: number) {
		if (import.meta.env.DEV) {
			console.log(
				`Click on ID: ${id}, Current Turn: ${gameState.turn}, Phase: ${gameState.phase}, Selected: ${gameState.selectedPieceId}`
			);
		}

		if (gameState.winner) {
			if (import.meta.env.DEV) {
				console.log('Game already won, ignoring click.');
			}
			return;
		}

		const pieceAtClickId = gameState.board[id];
		const currentlySelectedId = gameState.selectedPieceId;

		// --- GOAT'S TURN ---
		if (gameState.turn === 'GOAT') {
			// --- PLACEMENT PHASE ---
			if (gameState.phase === 'PLACEMENT') {
				if (pieceAtClickId === null) {
					// Save state before making move
					saveGameState();

					// Place the goat
					gameState.board[id] = 'GOAT';
					gameState.goatsPlaced++;
					if (import.meta.env.DEV) {
						console.log(`Goat placed at ${id}. Total placed: ${gameState.goatsPlaced}`);
					}

					// Add to move history
					moveHistory.push(`Goat placed at position ${id}`);

					// Check for Goat Win by Trapping
					if (import.meta.env.DEV) {
						console.log('Checking for trap after placement...');
					}
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						if (import.meta.env.DEV) {
							console.log('Goats Win! Tigers detected as trapped after placement.');
						}
						gameState.winner = 'GOAT';
						moveHistory.push('Goats win by trapping tigers!');
					}

					// Change phase if 20 goats are placed AND no winner yet
					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
						if (import.meta.env.DEV) {
							console.log('Goat phase changed to MOVEMENT.');
						}
					}

					// Switch turn ONLY if no winner was determined
					if (!gameState.winner) {
						if (import.meta.env.DEV) {
							console.log('Switching turn to TIGER.');
						}
						gameState.turn = 'TIGER';
					}

					// Reset selection
					gameState.selectedPieceId = null;
				}
				return;
			}
			// --- MOVEMENT PHASE ---
			else {
				if (import.meta.env.DEV) {
					console.log(
						'Movement phase - GOAT turn. Piece at click:',
						pieceAtClickId,
						'Selected:',
						currentlySelectedId,
						'Valid moves:',
						validMoves
					);
					if (currentlySelectedId !== null) {
						const adjacentPositions = adjacency.get(currentlySelectedId) || [];
						console.log(
							'Adjacent positions for selected goat at',
							currentlySelectedId,
							':',
							adjacentPositions
						);
						const emptyAdjacent = adjacentPositions.filter((pos) => gameState.board[pos] === null);
						console.log('Empty adjacent positions:', emptyAdjacent);
					}
				}
				if (pieceAtClickId === 'GOAT') {
					// Selecting a goat
					if (import.meta.env.DEV) {
						console.log('Selecting goat at:', id);
					}
					gameState.selectedPieceId = id;
				} else if (
					pieceAtClickId === null &&
					currentlySelectedId !== null &&
					validMoves.includes(id)
				) {
					// Save state before making move
					if (import.meta.env.DEV) {
						console.log('Moving goat from', currentlySelectedId, 'to', id);
					}
					saveGameState();

					// Moving a goat
					executeMove(gameState, currentlySelectedId, id, null, adjacency, points);
					moveHistory.push(`Goat moved from ${currentlySelectedId} to ${id}`);
				} else {
					// Invalid click
					if (import.meta.env.DEV) {
						console.log('Invalid goat click - deselecting');
					}
					gameState.selectedPieceId = null; // Deselect
				}
				return;
			}
		}

		// --- TIGER'S TURN ---
		if (gameState.turn === 'TIGER') {
			if (pieceAtClickId === 'TIGER') {
				// Selecting a tiger
				gameState.selectedPieceId = id;
			} else if (
				pieceAtClickId === null &&
				currentlySelectedId !== null &&
				validMoves.includes(id)
			) {
				// Save state before making move
				saveGameState();

				// Moving/Capturing
				const captureInfo = currentTigerCaptures.find((c) => c.destinationId === id);
				const jumpedGoatId = captureInfo ? captureInfo.jumpedGoatId : null;

				if (jumpedGoatId) {
					moveHistory.push(`Tiger captured goat at ${jumpedGoatId} and moved to ${id}`);
				} else {
					moveHistory.push(`Tiger moved from ${currentlySelectedId} to ${id}`);
				}

				executeMove(gameState, currentlySelectedId, id, jumpedGoatId, adjacency, points);
			} else {
				// Invalid click
				if (currentlySelectedId !== null) {
					gameState.selectedPieceId = null; // Deselect
				}
			}
			return;
		}
	}

	function resetGame() {
		resetGameState();
		moveHistory = [];
		gameStateHistory = []; // Clear undo history
		computerPlayer.clearCache(); // Clear AI cache for new game

		// Reset AI state
		isComputerThinking = false;
		aiCalculatedMove = null;
	}

	// Undo the last move
	function undoMove() {
		if (gameStateHistory.length === 0) return;

		const previousState = gameStateHistory.pop();
		if (previousState) {
			// Restore game state
			gameState.board = previousState.board;
			gameState.turn = previousState.turn;
			gameState.phase = previousState.phase;
			gameState.goatsPlaced = previousState.goatsPlaced;
			gameState.goatsCaptured = previousState.goatsCaptured;
			gameState.selectedPieceId = previousState.selectedPieceId;
			gameState.winner = previousState.winner;
			gameState.positionHistory = previousState.positionHistory;
			gameState.positionCounts = previousState.positionCounts;

			// Restore move history to previous length
			moveHistory = moveHistory.slice(0, previousState.moveHistoryLength);
		}
	}

	// Game mode handler
	function handleGameModeChange(isComputer: boolean) {
		isPlayingComputer = isComputer;
	}

	// Player side handler
	function handlePlayerSideChange(side: string) {
		playerSide = side;
	}

	// Mode handler
	function handleModeChange(newMode: 'CLASSIC' | 'REFORGED') {
		gameMode = newMode;
		computerPlayer.setMode(newMode);
		gameState.mode = newMode;
	}

	// Reactive computer move trigger
	$effect(() => {
		// Only trigger if it's really the computer's turn and we're not already processing
		if (isComputerTurn() && !isComputerThinking && !gameState.winner && !aiCalculatedMove) {
			if (import.meta.env.DEV) {
				console.log('Triggering computer move - Turn:', gameState.turn, 'Player Side:', playerSide);
			}
			// Use setTimeout to prevent immediate re-triggering
			setTimeout(() => {
				if (isComputerTurn() && !isComputerThinking && !gameState.winner && !aiCalculatedMove) {
					executeComputerMove();
				}
			}, 100);
		}
	});

	onMount(() => {
		resetGame();
		if (import.meta.env.DEV) {
			console.log('Bagchal game initialized');
		}
	});
</script>

<ErrorBoundary fallback="The Bagchal game encountered an error. Please try restarting the game.">
	<div class="grid h-full grid-cols-1 gap-8 lg:grid-cols-[350px_1fr]">
		<GameBoard
			{points}
			{lines}
			{gameState}
			{validMoves}
			{handlePointClick}
			{isComputerThinking}
			{isPlayingComputer}
			{playerSide}
			{aiCalculatedMove}
		/>
		<GameSidebar
			{gameState}
			{moveHistory}
			{isPlayingComputer}
			{playerSide}
			{gameMode}
			{isComputerThinking}
			{canUndo}
			onReset={resetGame}
			onGameModeChange={handleGameModeChange}
			onPlayerSideChange={handlePlayerSideChange}
			onModeChange={handleModeChange}
			onUndo={undoMove}
		/>
	</div>

	<WinnerModal
		{gameState}
		{moveHistory}
		{isPlayingComputer}
		{playerSide}
		onPlayAgain={resetGame}
		onSwitchSides={() => {
			playerSide = playerSide === 'GOAT' ? 'TIGER' : 'GOAT';
			resetGame();
		}}
		onChangeMode={() => {
			gameMode = gameMode === 'CLASSIC' ? 'REFORGED' : 'CLASSIC';
			computerPlayer.setMode(gameMode);
			gameState.mode = gameMode;
			resetGame();
		}}
	/>
</ErrorBoundary>
