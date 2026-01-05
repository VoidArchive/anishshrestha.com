import type { GameState } from '$labs/bagchal/rules';
import type { Move } from './types';

import { MoveGenerator } from './moveGeneration.js';
import { ADJACENCY_MAP, POINTS } from './utils.js';

/**
 * Hardcoded opening book for Bagchal
 * Strategy: 4 predefined openings, one for each edge
 * Each opening has exactly 4 moves, then AI takes over
 */
export class OpeningBook {
  // Four complete opening sequences - one for each edge
  private static readonly OPENINGS = [
    // Top edge opening: midpoint → left protector → right protector → corner
    [2, 1, 3, 0],

    // Left edge opening: midpoint → top protector → bottom protector → corner
    [10, 5, 15, 20],

    // Right edge opening: midpoint → top protector → bottom protector → corner
    [14, 9, 19, 4],

    // Bottom edge opening: midpoint → left protector → right protector → corner
    [22, 21, 23, 24]
  ];

  /**
   * Get opening book move for goats
   */
  static getOpeningMove(state: GameState): Move | null {
    // Only provide opening moves for goats in placement phase
    if (state.turn !== 'GOAT' || state.phase !== 'PLACEMENT') {
      return null;
    }

    // Only use opening book for first 4 moves
    if (state.goatsPlaced >= 4) {
      return null;
    }

    const moveNumber = state.goatsPlaced + 1;

    // Get current opening sequence (stored in game state or select new one)
    const currentOpening = OpeningBook.getCurrentOpening(state);
    const targetPosition = currentOpening[moveNumber - 1];

    // Validate the move is safe and available
    if (state.board[targetPosition] !== null) {
      return null; // Position occupied, let AI handle
    }

    if (MoveGenerator.wouldBeImmediatelyCaptured(targetPosition, state, ADJACENCY_MAP, POINTS)) {
      return null; // Not safe, let AI handle
    }

    return {
      from: null,
      to: targetPosition,
      moveType: 'PLACEMENT'
    };
  }

  /**
   * Get current opening - select randomly on first move
   */
  private static getCurrentOpening(state: GameState): number[] {
    // For first move, select completely randomly
    if (state.goatsPlaced === 0) {
      const randomIndex = Math.floor(Math.random() * OpeningBook.OPENINGS.length);
      return OpeningBook.OPENINGS[randomIndex];
    }

    // For subsequent moves, determine which opening was used based on first goat position
    const firstGoatPos = state.board.findIndex((piece) => piece === 'GOAT');

    // Match first goat position to opening
    for (const opening of OpeningBook.OPENINGS) {
      if (opening[0] === firstGoatPos) {
        return opening;
      }
    }

    // Fallback to first opening if we can't determine
    return OpeningBook.OPENINGS[0];
  }
}
