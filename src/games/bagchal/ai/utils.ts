import type { GameState } from '$games/bagchal/rules';
import { generatePoints, generateLines, buildAdjacencyMap } from '$games/bagchal/rules';

/**
 * Shared utilities for Bagchal AI components – single source of truth for
 * board topology (adjacency) and other geometric helpers.
 */

// ---------------------------------------------------------------------------
// 1. Board geometry
// ---------------------------------------------------------------------------

// Build points & lines once – these are immutable and light-weight.
const _points = generatePoints();
const _lines = generateLines(_points);

// Official adjacency map; converted to both Map and plain object for callers
export const ADJACENCY_MAP: Map<number, number[]> = buildAdjacencyMap(_points, _lines);

// Export immutable points for geometry consumers (AI, UI helpers, etc.)
export const POINTS = _points;

// Key board positions (derived from 5×5 grid indices)
export const BOARD_POSITIONS = {
  CENTER: 12,
  CORNERS: [0, 4, 20, 24],
  EDGE_MIDPOINTS: [2, 10, 14, 22],
  CROSS_POSITIONS: [6, 8, 16, 18]
};

/**
 * Calculate Manhattan distance between two positions
 */
export function getDistance(pos1: number, pos2: number): number {
  const row1 = Math.floor(pos1 / 5);
  const col1 = pos1 % 5;
  const row2 = Math.floor(pos2 / 5);
  const col2 = pos2 % 5;
  
  return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

/**
 * Get all tiger positions from game state
 */
export function getTigerPositions(state: GameState): number[] {
  return state.board
    .map((piece, index) => piece === 'TIGER' ? index : -1)
    .filter(pos => pos !== -1);
}

/**
 * Get all goat positions from game state
 */
export function getGoatPositions(state: GameState): number[] {
  return state.board
    .map((piece, index) => piece === 'GOAT' ? index : -1)
    .filter(pos => pos !== -1);
}

/**
 * Get the landing position if a tiger jumps over a goat
 */
export function getJumpLanding(tigerPos: number, goatPos: number): number {
  const tigerRow = Math.floor(tigerPos / 5);
  const tigerCol = tigerPos % 5;
  const goatRow = Math.floor(goatPos / 5);
  const goatCol = goatPos % 5;

  // Calculate the direction vector
  const deltaRow = goatRow - tigerRow;
  const deltaCol = goatCol - tigerCol;

  // Landing position is goat position + same direction vector
  const landingRow = goatRow + deltaRow;
  const landingCol = goatCol + deltaCol;

  // Check if landing position is valid
  if (landingRow < 0 || landingRow >= 5 || landingCol < 0 || landingCol >= 5) {
    return -1;
  }

  return landingRow * 5 + landingCol;
}

/**
 * Check if three positions are collinear and adjacent in sequence
 */
export function areCollinearAndAdjacent(pos1: number, pos2: number, pos3: number): boolean {
  // Check if pos1 and pos2 are adjacent
  const adjacentToPos1 = ADJACENCY_MAP.get(pos1) || [];
  if (!adjacentToPos1.includes(pos2)) return false;

  // Check if pos2 and pos3 are adjacent  
  const adjacentToPos2 = ADJACENCY_MAP.get(pos2) || [];
  if (!adjacentToPos2.includes(pos3)) return false;

  // Check collinearity
  const row1 = Math.floor(pos1 / 5);
  const col1 = pos1 % 5;
  const row2 = Math.floor(pos2 / 5);
  const col2 = pos2 % 5;
  const row3 = Math.floor(pos3 / 5);
  const col3 = pos3 % 5;

  // Vectors should be in the same direction
  const vec1Row = row2 - row1;
  const vec1Col = col2 - col1;
  const vec2Row = row3 - row2;
  const vec2Col = col3 - col2;

  return vec1Row === vec2Row && vec1Col === vec2Col;
} 