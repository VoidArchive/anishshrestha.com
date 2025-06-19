import type { BaseEngine } from '$core/engine/BaseEngine';
import type { GameState } from './rules';
import { makeInitialBoard, generatePoints, generateLines, buildAdjacencyMap } from './rules';
import { MoveGenerator, PositionEvaluator } from '$games/bagchal/ai';
import { executeMove } from './rules';
import type { Move as BagchalMove } from '$games/bagchal/ai/types';

// Pre-compute board description
const points = generatePoints();
const lines = generateLines(points);
const adjacency = buildAdjacencyMap(points, lines);

function cloneState(state: GameState): GameState {
  // Efficient shallow cloning instead of expensive JSON methods
  return {
    board: [...state.board],
    turn: state.turn,
    phase: state.phase,
    goatsPlaced: state.goatsPlaced,
    goatsCaptured: state.goatsCaptured,
    winner: state.winner,
    selectedPieceId: state.selectedPieceId,
    validMoves: [...state.validMoves],
    message: state.message,
    positionHistory: [...state.positionHistory],
    positionCounts: new Map(state.positionCounts),
    movesWithoutCapture: state.movesWithoutCapture,
    mode: state.mode
  };
}

export const BagchalEngine: BaseEngine<BagchalMove, GameState> = {
  initialState(): GameState {
    return {
      board: makeInitialBoard(),
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
      movesWithoutCapture: 0,
      mode: 'EASY'
    };
  },

  validMoves(state: GameState): BagchalMove[] {
    return MoveGenerator.getValidMoves(state, adjacency, points);
  },

  applyMove(state: GameState, move: BagchalMove): GameState {
    const newState = cloneState(state);

    // Handle goat placement separately – executeMove is only for movements/captures
    if (move.moveType === 'PLACEMENT') {
      // Place goat on the board
      newState.board[move.to] = 'GOAT';
      newState.goatsPlaced++;

      // Transition to movement phase when all goats are placed
      if (newState.goatsPlaced >= 20) {
        newState.phase = 'MOVEMENT';
      }

      // Swap turn to tigers after a successful placement
      newState.turn = 'TIGER';

      return newState;
    }

    // For MOVEMENT and CAPTURE use the existing rule helper
    executeMove(
      newState,
      move.from ?? 0,
      move.to,
      move.jumpedGoatId ?? null,
      adjacency,
      points
    );
    return newState;
  },

  evaluate(state: GameState): number {
    return PositionEvaluator.evaluatePosition(state, adjacency, points);
  }
};
