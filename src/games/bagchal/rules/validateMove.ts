import type { GameState, Point } from './bagchal';
import {
  calculateValidGoatMoves,
  calculateValidTigerMoves,
} from './bagchal';

export interface GameMove {
  from?: number | null;
  to: number;
  jumpedGoatId?: number | null;
  moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Verifies that the provided move is legal in the current game state.
 * This function is PURE – it never mutates the supplied state.
 */
export function validateMove(
  state: GameState,
  move: GameMove,
  adjacency: Map<number, number[]>,
  points: Point[]
): ValidationResult {
  // Basic structural validation
  if (move.to == null || move.to < 0 || move.to >= state.board.length) {
    return { valid: false, reason: 'Destination out of bounds' };
  }

  // ---- Placement Phase ---------------------------------------------------
  if (move.moveType === 'PLACEMENT') {
    if (state.phase !== 'PLACEMENT') {
      return { valid: false, reason: 'Not in placement phase' };
    }
    if (state.turn !== 'GOAT') {
      return { valid: false, reason: 'Only goats place during placement phase' };
    }
    if (state.board[move.to] !== null) {
      return { valid: false, reason: 'Target position occupied' };
    }
    return { valid: true };
  }

  // From-id must exist for movement / capture
  if (move.from == null || move.from < 0 || move.from >= state.board.length) {
    return { valid: false, reason: 'Missing or invalid source' };
  }

  const movingPiece = state.board[move.from];
  if (!movingPiece) {
    return { valid: false, reason: 'No piece at source' };
  }

  if (state.phase !== 'MOVEMENT') {
    return { valid: false, reason: 'Not in movement phase' };
  }

  // Ensure turn matches piece
  if (
    (movingPiece === 'GOAT' && state.turn !== 'GOAT') ||
    (movingPiece === 'TIGER' && state.turn !== 'TIGER')
  ) {
    return { valid: false, reason: 'Not your turn' };
  }

  // ---- GOAT MOVES --------------------------------------------------------
  if (movingPiece === 'GOAT') {
    const destinations = calculateValidGoatMoves(state, move.from, adjacency);
    if (!destinations.includes(move.to)) {
      return { valid: false, reason: 'Illegal goat move' };
    }
    return { valid: true };
  }

  // ---- TIGER MOVES -------------------------------------------------------
  if (movingPiece === 'TIGER') {
    const { destinations, captures } = calculateValidTigerMoves(
      state,
      move.from,
      adjacency,
      points
    );

    if (move.moveType === 'CAPTURE') {
      const cap = captures.find((c) => c.destinationId === move.to);
      if (!cap) return { valid: false, reason: 'Invalid capture destination' };
      if (cap.jumpedGoatId !== move.jumpedGoatId) {
        return { valid: false, reason: 'Incorrect jumped goat id' };
      }
      return { valid: true };
    }

    // Simple movement for tiger
    if (!destinations.includes(move.to)) {
      return { valid: false, reason: 'Illegal tiger move' };
    }
    return { valid: true };
  }

  return { valid: false, reason: 'Unknown piece type' };
} 