import type { GameState, Point, Line, CaptureInfo } from './bagchal.js';
import {
	generatePoints,
	generateLines,
	buildAdjacencyMap,
	makeInitialBoard,
	calculateValidTigerMoves,
	calculateValidGoatMoves,
	resetGame
} from './bagchal.js';

// Initialize game constants
const points: Point[] = generatePoints();
const lines: Line[] = generateLines(points);
const adjacency = buildAdjacencyMap(points, lines);
const initialBoard = makeInitialBoard();

// Create reactive game state using Svelte runes
let gameState = $state<GameState>({
	board: initialBoard,
	turn: 'GOAT',
	phase: 'PLACEMENT',
	goatsPlaced: 0,
	goatsCaptured: 0,
	winner: null,
	selectedPieceId: null,
	validMoves: [],
	message: ''
});

// Optimized: Single calculation for tiger moves (cached automatically by $derived)
let tigerMoveResult = $derived.by(() => {
	const sel = gameState.selectedPieceId;
	if (gameState.turn === 'TIGER' && sel !== null) {
		return calculateValidTigerMoves(gameState, sel, adjacency, points);
	}
	return { destinations: [] as number[], captures: [] as CaptureInfo[] };
});

// Functions to get derived values (can't export derived state from modules)
export function getValidMoves() {
	const sel = gameState.selectedPieceId;
	if (sel === null) {
		return [];
	}

	if (gameState.turn === 'GOAT') {
		return calculateValidGoatMoves(gameState, sel, adjacency);
	} else {
		return tigerMoveResult.destinations;
	}
}

export function getCurrentTigerCaptures() {
	return tigerMoveResult.captures;
}

// Export the state and computed values
export {
	gameState,
	points,
	lines,
	adjacency
};

// Helper function to reset the game
export function resetGameState() {
	resetGame(gameState, points);
} 