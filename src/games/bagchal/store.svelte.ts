import type { GameState, Point, Line, CaptureInfo } from './rules';
import {
  generatePoints,
  generateLines,
  buildAdjacencyMap,
  makeInitialBoard,
  calculateValidTigerMoves,
  calculateValidGoatMoves,
  resetGame
} from './rules';

// Initialize game constants
export const points: Point[] = generatePoints();
export const lines: Line[] = generateLines(points);
export const adjacency = buildAdjacencyMap(points, lines);
const initialBoard = makeInitialBoard();

// Reactive game state (Svelte runes)
export const gameState = $state<GameState>({
  board: initialBoard,
  turn: 'GOAT',
  phase: 'PLACEMENT',
  goatsPlaced: 0,
  goatsCaptured: 0,
  winner: null,
  selectedPieceId: null,
  validMoves: [],
  message: '',
  positionHistory: [],
  positionCounts: new Map(),
  mode: 'EASY',
  movesWithoutCapture: 0
});

// Cached tiger move calculation
const tigerMoveResult = $derived.by(() => {
  const sel = gameState.selectedPieceId;
  if (gameState.turn === 'TIGER' && sel !== null) {
    return calculateValidTigerMoves(gameState, sel, adjacency, points);
  }
  return { destinations: [] as number[], captures: [] as CaptureInfo[] };
});

export function getValidMoves() {
  const sel = gameState.selectedPieceId;
  if (sel === null) return [];
  return gameState.turn === 'GOAT'
    ? calculateValidGoatMoves(gameState, sel, adjacency)
    : tigerMoveResult.destinations;
}

export function getCurrentTigerCaptures() {
  return tigerMoveResult.captures;
}

export function resetGameState() {
  resetGame(gameState, points);
}
