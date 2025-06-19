import type { GameState, Point, GameMode } from '$games/bagchal/rules';
import type { Move } from './types';
import { Minimax } from '$core/ai';
import { BagchalEngine } from '$games/bagchal/engine';
import { OpeningBook } from './openingBook.js';
import { MoveOrderer } from './moveOrdering.js';
import { ADJACENCY_MAP, POINTS } from './utils.js';
import { MoveGenerator } from './moveGeneration.js';

/**
 * Main AI interface encapsulating search & difficulty management for Bagchal.
 */
export class ComputerPlayer {
  private engine: Minimax<Move, GameState>;
  private mode: GameMode;
  private maxDepth: number;

  constructor(mode: GameMode = 'EASY') {
    this.mode = mode;
    // Different depths for difficulty levels
    const depthMap: Record<GameMode, number> = {
      EASY: 4,   // Faster, weaker AI for easy mode
      HARD: 8    // Deeper, stronger AI for hard mode
    };
    this.maxDepth = depthMap[mode];
    this.engine = new Minimax<Move, GameState>(BagchalEngine, {
      maxDepth: this.maxDepth,
      stateHash: this.hashGameState as <S>(state: S) => string,
      orderMoves: (moves, state, maximizing) =>
        MoveOrderer.orderMoves(
          moves as Move[],
          state as GameState,
          maximizing as boolean,
          ADJACENCY_MAP,
          POINTS
        ) as unknown[] as Move[]
    });
  }

  /**
   * Efficient hash function for game states to improve transposition table performance
   */
  private hashGameState(state: GameState): string {
    // Create a compact string representation of the essential game state
    const boardStr = state.board.map(cell => cell === null ? '0' : cell === 'GOAT' ? '1' : '2').join('');
    return `${boardStr}|${state.turn}|${state.phase}|${state.goatsPlaced}|${state.goatsCaptured}`;
  }

  /** Return the best move found for the current position. */
  getBestMove(state: GameState, _adjacency: Map<number, number[]>, _points: Point[]): Move | null {
    try {
      // FIRST: Check opening book for goat placement moves
      if (state.turn === 'GOAT' && state.phase === 'PLACEMENT') {
        const openingMove = OpeningBook.getOpeningMove(state);
        if (openingMove) {
          return openingMove;
        }
      }
      
      const maximizing = state.turn === 'TIGER';
      
      // ADAPTIVE DEPTH: Use different depths based on game phase and complexity
      const adaptiveDepth = this.calculateAdaptiveDepth(state);
      
      // Use adaptive depth for this specific search
      const [bestMove] = this.engine.search(state, maximizing, adaptiveDepth);

      // Simple fallback for edge cases
      return bestMove || this.getEmergencyMove(state, _adjacency);
    } catch (err) {
      if (import.meta.env.DEV) console.error('AI move error:', err);
      return null;
    }
  }

  /**
   * Simple adaptive depth - prioritize speed over deep analysis
   */
  private calculateAdaptiveDepth(state: GameState): number {
    // PLACEMENT PHASE: Slightly deeper (goats are placing)
    if (state.phase === 'PLACEMENT') {
      return Math.min(7, this.maxDepth + 1);
    }
    
    // MOVEMENT PHASE: Standard depth
    if (state.phase === 'MOVEMENT') {
      // Reduce depth when many pieces on board (high branching factor)
      const totalPieces = state.board.filter(cell => cell !== null).length;
      
      if (totalPieces >= 18) {
        return Math.max(4, this.maxDepth - 2); // Faster for complex positions
      } else if (totalPieces >= 12) {
        return Math.max(5, this.maxDepth - 1); // Medium complexity
      }
    }

    // ENDGAME: Slightly deeper when few pieces remain
    const goatsRemaining = 20 - state.goatsCaptured;
    if (goatsRemaining <= 6) {
      return Math.min(7, this.maxDepth + 1); // Deeper for precise endgame
    }

    return this.maxDepth; // Standard depth
  }

  /**
   * Emergency move fallback for edge cases
   */
  private getEmergencyMove(state: GameState, adjacency: Map<number, number[]>): Move | null {
    if (state.turn === 'GOAT') {
      // GOAT fallback – only during placement phase should this ever be needed
      if (state.phase === 'PLACEMENT') {
        // First available empty point
        for (let i = 0; i < state.board.length; i++) {
          if (state.board[i] === null) {
            return { from: null, to: i, moveType: 'PLACEMENT' };
          }
        }
      } else {
        // Movement fallback for goats in movement phase
        for (let i = 0; i < state.board.length; i++) {
          if (state.board[i] === 'GOAT') {
            const neighbors = adjacency.get(i) || [];
            for (const neighbor of neighbors) {
              if (state.board[neighbor] === null) {
                return { from: i, to: neighbor, moveType: 'MOVEMENT' };
              }
            }
          }
        }
      }
    } else {
      // TIGER fallback – use MoveGenerator to get strictly legal moves
      const legalMoves = MoveGenerator.getValidMoves(state, adjacency, POINTS);
      // Prefer captures
      const capture = legalMoves.find((m) => m.moveType === 'CAPTURE');
      if (capture) return capture;
      return legalMoves[0] || null;
    }

    return null; // No legal fallback
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
    const depthMap: Record<GameMode, number> = {
      EASY: 4,   // Faster, weaker AI for easy mode  
      HARD: 8    // Deeper, stronger AI for hard mode
    };
    this.maxDepth = depthMap[mode];
    this.engine = new Minimax<Move, GameState>(BagchalEngine, {
      maxDepth: this.maxDepth,
      stateHash: this.hashGameState as <S>(state: S) => string,
      orderMoves: (moves, state, maximizing) =>
        MoveOrderer.orderMoves(
          moves as Move[],
          state as GameState,
          maximizing as boolean,
          ADJACENCY_MAP,
          POINTS
        ) as unknown[] as Move[]
    });
  }

  getMode(): GameMode {
    return this.mode;
  }

  clearCache(): void {
    this.engine.clearCache();
  }
}
