import type { GameState, Point } from '$games/bagchal/rules';
import type { Move } from './types';
import { MoveGenerator } from './moveGeneration.js';
import { PositionEvaluator } from './evaluation.js';

/**
 * Simplified move ordering to improve alpha-beta pruning efficiency for Bagchal.
 */
export class MoveOrderer {
  // Strategic position sets
  private static readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);
  private static readonly CENTER_POSITIONS = new Set([12]);
  private static readonly CROSS_POSITIONS = new Set([6, 8, 16, 18]);

  /**
   * Orders moves for optimal alpha-beta pruning with tactical sacrifice awareness
   */
  static orderMoves(
    moves: Move[],
    state: GameState,
    maximizing: boolean,
    adjacency: Map<number, number[]>,
    points: Point[]
  ): Move[] {
    return moves.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      if (maximizing) {
        aScore = this.calculateTigerMoveScore(a);
        bScore = this.calculateTigerMoveScore(b);
      } else {
        aScore = this.calculateGoatMoveScore(a, state, adjacency, points);
        bScore = this.calculateGoatMoveScore(b, state, adjacency, points);
      }
      return bScore - aScore;
    });
  }

  // --------------------------- Tiger ordering ---------------------------
  private static calculateTigerMoveScore(move: Move): number {
    let score = 0;

    // Rule #1: Captures are everything - tigers win by capturing 5 goats
    if (move.moveType === 'CAPTURE') {
      score += 10000; // Massively prioritize any capture

      // Bonus for capturing from strong positions (sets up more captures)
      if (this.CENTER_POSITIONS.has(move.to)) score += 1000;
      if (this.STRATEGIC_POSITIONS.has(move.to)) score += 500;

      return score; // Don't dilute capture priority with other bonuses
    }

    // Rule #2: Create capture threats (key to tiger strategy)
    if (move.moveType === 'MOVEMENT') {
      // Center control creates maximum threats
      if (this.CENTER_POSITIONS.has(move.to)) score += 800;
      
      // Strategic positions (corners + edge midpoints) are strong
      if (this.STRATEGIC_POSITIONS.has(move.to)) score += 400;
      
      // Cross positions provide good mobility
      if (this.CROSS_POSITIONS.has(move.to)) score += 200;

      // Mild bonus for leaving passive corner positions (reduced to avoid early mass exodus)
      if (move.from !== null && [0, 4, 20, 24].includes(move.from)) {
        score += 50;
      }

      // Base movement value
      score += 100;
    }

    return score;
  }

  // --------------------------- Goat ordering ---------------------------
  private static calculateGoatMoveScore(
    move: Move,
    state: GameState,
    adjacency: Map<number, number[]>,
    points: Point[]
  ): number {
    let score = 0;

    // UPDATED: Use tactical sacrifice evaluation instead of blanket safety penalty
    if (state.mode === 'EASY' && state.turn === 'GOAT') {
      // Create a test state to check if this move would be capturable
      const testState = { ...state, board: [...state.board] };

      if (move.moveType === 'PLACEMENT') {
        testState.board[move.to] = 'GOAT';
        // Check if this placement would be immediately capturable
        if (MoveGenerator.wouldBeImmediatelyCaptured(move.to, testState, adjacency, points)) {
          score -= 8000; // Heavy penalty for capturable moves
        }
      } else if (move.moveType === 'MOVEMENT' && move.from !== null) {
        testState.board[move.from] = null;
        testState.board[move.to] = 'GOAT';
        // Check if this movement would be immediately capturable
        if (MoveGenerator.wouldBeImmediatelyCaptured(move.to, testState, adjacency, points)) {
          score -= 8000; // Heavy penalty for capturable moves
        }
      }
    }

    // In early game, prioritize safe positions over aggressive ones
    const isEarlyGame = state.goatsPlaced < 15;

    if (isEarlyGame) {
      // Early game: be more conservative
      if (this.STRATEGIC_POSITIONS.has(move.to)) score += 200;
      if (this.CROSS_POSITIONS.has(move.to)) score += 150;
      if (this.CENTER_POSITIONS.has(move.to)) score += 100;
    } else {
      // Late game: can be more aggressive
      if (this.CENTER_POSITIONS.has(move.to)) score += 400;
      if (this.STRATEGIC_POSITIONS.has(move.to)) score += 250;
      if (this.CROSS_POSITIONS.has(move.to)) score += 180;
    }

    // Phase-specific bonuses
    if (state.phase === 'PLACEMENT') {
      // Early game: focus on building strong positions gradually
      score += 50;
    } else {
      // Late game: mobility and blocking become more important
      if (move.moveType === 'MOVEMENT') {
        score += 150;
      }
    }

    return score;
  }
}
