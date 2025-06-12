<script lang="ts">
	import { onMount } from 'svelte';
	import { gameState, points, lines, adjacency, getValidMoves, getCurrentTigerCaptures, resetGameState } from '$lib/state.svelte';
	import { executeMove, checkIfTigersAreTrapped } from '$lib/bagchal';
	import GameBoard from './game/GameBoard.svelte';
	import GameSidebar from './game/GameSidebar.svelte';
	import WinnerModal from './game/WinnerModal.svelte';
	
	// Game history for undo functionality
	let moveHistory: string[] = $state([]);
	let gameStateHistory: any[] = $state([]); // Store previous game states
	
	// Game settings
	let isPlayingComputer = $state(false);
	
	// Local derived state
	let validMoves = $derived(getValidMoves());
	let currentTigerCaptures = $derived(getCurrentTigerCaptures());
	let canUndo = $derived(gameStateHistory.length > 0 && !gameState.winner);
	
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
			moveHistoryLength: moveHistory.length
		});
		
		// Keep only last 10 moves to prevent memory issues
		if (gameStateHistory.length > 10) {
			gameStateHistory.shift();
		}
	}
	
	// Handle board position clicks
	function handlePointClick(id: number) {
		console.log(
			`Click on ID: ${id}, Current Turn: ${gameState.turn}, Phase: ${gameState.phase}, Selected: ${gameState.selectedPieceId}`
		);

		if (gameState.winner) {
			console.log('Game already won, ignoring click.');
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
					console.log(`Goat placed at ${id}. Total placed: ${gameState.goatsPlaced}`);
					
					// Add to move history
					moveHistory.push(`Goat placed at position ${id}`);

					// Check for Goat Win by Trapping
					console.log('Checking for trap after placement...');
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						console.log('Goats Win! Tigers detected as trapped after placement.');
						gameState.winner = 'GOAT';
						moveHistory.push('Goats win by trapping tigers!');
					}

					// Change phase if 20 goats are placed AND no winner yet
					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
						console.log('Goat phase changed to MOVEMENT.');
					}

					// Switch turn ONLY if no winner was determined
					if (!gameState.winner) {
						console.log('Switching turn to TIGER.');
						gameState.turn = 'TIGER';
					}

					// Reset selection
					gameState.selectedPieceId = null;
				}
				return;
			}
			// --- MOVEMENT PHASE ---
			else {
				if (pieceAtClickId === 'GOAT') {
					// Selecting a goat
					gameState.selectedPieceId = id;
				} else if (
					pieceAtClickId === null &&
					currentlySelectedId !== null &&
					validMoves.includes(id)
				) {
					// Save state before making move
					saveGameState();
					
					// Moving a goat
					executeMove(gameState, currentlySelectedId, id, null, adjacency, points);
					moveHistory.push(`Goat moved from ${currentlySelectedId} to ${id}`);
				} else {
					// Invalid click
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
			
			// Restore move history to previous length
			moveHistory = moveHistory.slice(0, previousState.moveHistoryLength);
		}
	}

	// Game mode handler
	function handleGameModeChange(isComputer: boolean) {
		isPlayingComputer = isComputer;
		// TODO: Implement computer AI logic when isComputer is true
	}
	
	onMount(() => {
		resetGame();
		console.log('Bagchal game initialized');
	});
</script>

<div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 h-full">
	<GameBoard {points} {lines} {gameState} {validMoves} {handlePointClick} />
	<GameSidebar 
		{gameState} 
		{moveHistory} 
		{isPlayingComputer}
		{canUndo}
		onReset={resetGame}
		onGameModeChange={handleGameModeChange}
		onUndo={undoMove}
	/>
</div>

<WinnerModal {gameState} onPlayAgain={resetGame} /> 