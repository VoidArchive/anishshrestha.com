<script lang="ts">
	import { gameState, resetGameState } from '$labs/bagchal/store.svelte';
	import type { PieceType, Player, GamePhase } from '$labs/bagchal/rules';

	interface Props {
		moveHistory: string[];
		onSetMoveHistory: (history: string[]) => void;
		onClearComputerCache: () => void;
	}

	let { moveHistory, onSetMoveHistory, onClearComputerCache }: Props = $props();

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

	let gameStateHistory: SavedGameState[] = $state([]);
	let lastUndoTime = $state(0);

	// Derived state
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
			positionHistory: [...gameState.positionHistory],
			positionCounts: new Map(gameState.positionCounts),
			moveHistoryLength: moveHistory.length
		});

		if (gameStateHistory.length > 10) {
			gameStateHistory.shift();
		}
	}

	function undoMove(undoCount: number = 1) {
		for (let i = 0; i < undoCount && gameStateHistory.length > 0; i++) {
			const previousState = gameStateHistory.pop();
			if (previousState) {
				gameState.board = previousState.board;
				gameState.turn = previousState.turn;
				gameState.phase = previousState.phase;
				gameState.goatsPlaced = previousState.goatsPlaced;
				gameState.goatsCaptured = previousState.goatsCaptured;
				gameState.selectedPieceId = previousState.selectedPieceId;
				gameState.winner = previousState.winner;
				gameState.positionHistory = previousState.positionHistory;
				gameState.positionCounts = previousState.positionCounts;

				if (i === undoCount - 1) {
					// Only update move history on the last undo
					onSetMoveHistory(moveHistory.slice(0, previousState.moveHistoryLength));
				}
			}
		}

		// Clear any pending computer moves to prevent AI from going haywire
		onClearComputerCache();
		lastUndoTime = Date.now();
	}

	function resetGame() {
		resetGameState();
		onSetMoveHistory([]);
		gameStateHistory = [];
		onClearComputerCache();
		lastUndoTime = 0;
	}

	function addToHistory(message: string) {
		onSetMoveHistory([...moveHistory, message]);
	}

	// Export functions and state for parent component
	export { saveGameState, undoMove, resetGame, addToHistory, canUndo, lastUndoTime };
</script>
