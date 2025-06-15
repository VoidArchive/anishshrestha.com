import type { GameState, Point } from '$games/bagchal/rules';
import { BOARD_POSITIONS } from './utils';

/**
 * Simple, fast position evaluation for Bagchal AI
 * Philosophy: Simple rules work better than complex analysis
 */
export class PositionEvaluator {
  // Simple evaluation weights - balanced for good gameplay
  private static readonly WEIGHTS = {
    GOAT_CAPTURED: 500,      // Increased - captures are the win condition
    TIGER_MOBILITY: 12,      // Increased - mobility creates threats
    GOAT_MOBILITY: -6,       // Increased penalty - limit goat options
    CENTER_CONTROL: 30,      // Increased - center dominance is key
    TIGER_NEAR_WIN: 5000,    // New - bonus when close to winning
    ENDGAME_BONUS: 10000     // Decisive game end bonus
  };

  /**
   * Main evaluation function - simple and fast
   * Positive = good for tigers, Negative = good for goats
   */
  static evaluatePosition(
    state: GameState,
    adjacency: Map<number, number[]>,
    points: Point[]
  ): number {
    // Terminal states
    if (state.winner === 'TIGER') return PositionEvaluator.WEIGHTS.ENDGAME_BONUS;
    if (state.winner === 'GOAT') return -PositionEvaluator.WEIGHTS.ENDGAME_BONUS;
    if (state.winner === 'DRAW') return 0;

    let score = 0;

    // 1. Captured goats (most important - this is how tigers win)
    score += state.goatsCaptured * PositionEvaluator.WEIGHTS.GOAT_CAPTURED;

    // 2. Near-win bonus (4 goats captured = very close to winning)
    if (state.goatsCaptured >= 4) {
      score += PositionEvaluator.WEIGHTS.TIGER_NEAR_WIN;
    }

    // 3. Mobility evaluation (threats and movement)
    score += PositionEvaluator.evaluateMobility(state, adjacency);

    // 3.5 Corner fortress bonus during placement – reward tigers that keep at least one corner
    if (state.phase === 'PLACEMENT') {
      for (const corner of BOARD_POSITIONS.CORNERS) {
        if (state.board[corner] === 'TIGER') {
          score += 80;
        }
      }
    }

    // 4. Center control (creates maximum threats)
    score += PositionEvaluator.evaluatePositions(state);

    return score;
  }

  /**
   * Evaluate mobility for both sides
   */
  private static evaluateMobility(state: GameState, adjacency: Map<number, number[]>): number {
    // Reduce mobility impact in placement phase to prevent early corner exodus
    const tigerWeight = state.phase === 'PLACEMENT' ? PositionEvaluator.WEIGHTS.TIGER_MOBILITY / 2 : PositionEvaluator.WEIGHTS.TIGER_MOBILITY;

    let tigerMoves = 0;
    let goatMoves = 0;

    for (let i = 0; i < state.board.length; i++) {
      const piece = state.board[i];
      if (!piece) continue;

      const neighbors = adjacency.get(i) || [];
      const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;

      if (piece === 'TIGER') {
        tigerMoves += freeNeighbors;
        
        // Tigers also get points for capture opportunities
        const captureOpportunities = PositionEvaluator.countCaptureOpportunities(i, state, adjacency);
        tigerMoves += captureOpportunities * 2; // Captures are worth 2x normal moves
      } else if (piece === 'GOAT' && state.phase === 'MOVEMENT') {
        goatMoves += freeNeighbors;
      }
    }

    return (tigerMoves * tigerWeight) + 
           (goatMoves * PositionEvaluator.WEIGHTS.GOAT_MOBILITY);
  }

  /**
   * Evaluate positional control - simplified
   */
  private static evaluatePositions(state: GameState): number {
    let score = 0;

    // Center control is the key to tiger dominance
    if (state.board[BOARD_POSITIONS.CENTER] === 'TIGER') {
      score += PositionEvaluator.WEIGHTS.CENTER_CONTROL;
    } else if (state.board[BOARD_POSITIONS.CENTER] === 'GOAT') {
      score -= PositionEvaluator.WEIGHTS.CENTER_CONTROL;
    }

    return score;
  }

  /**
   * Count capture opportunities for a tiger - simplified
   */
  private static countCaptureOpportunities(
    tigerPos: number,
    state: GameState,
    adjacency: Map<number, number[]>
  ): number {
    let opportunities = 0;
    const neighbors = adjacency.get(tigerPos) || [];

    for (const neighbor of neighbors) {
      if (state.board[neighbor] === 'GOAT') {
        // Calculate where tiger would land if jumping over this goat
        const deltaRow = Math.floor(neighbor / 5) - Math.floor(tigerPos / 5);
        const deltaCol = (neighbor % 5) - (tigerPos % 5);
        const landingPos = neighbor + (deltaRow * 5) + deltaCol;
        
        // Check if landing position is valid and empty
        if (landingPos >= 0 && landingPos < 25 && state.board[landingPos] === null) {
          const landingNeighbors = adjacency.get(landingPos) || [];
          if (landingNeighbors.includes(neighbor)) {
            opportunities++;
          }
        }
      }
    }

    return opportunities;
  }

  /**
   * Calculate direction vector between two positions
   */
  private static getDirection(from: number, to: number): number {
    const fromRow = Math.floor(from / 5);
    const fromCol = from % 5;
    const toRow = Math.floor(to / 5);
    const toCol = to % 5;

    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;

    return deltaRow * 5 + deltaCol;
  }
}
