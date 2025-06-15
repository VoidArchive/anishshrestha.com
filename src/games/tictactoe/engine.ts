import type { BaseEngine } from '$core/engine/BaseEngine';
import { initialState, applyMove, checkWinner, type GameState, type Player } from './rules';

export interface TicTacToeMove {
  from: null;
  to: number; // 0-8 board position
  moveType: 'PLACE';
}

export class TicTacToeEngine implements BaseEngine<TicTacToeMove, GameState> {
  initialState(): GameState {
    return initialState();
  }

  validMoves(state: GameState): TicTacToeMove[] {
    if (state.winner) return [];
    
    const moves: TicTacToeMove[] = [];
    for (let i = 0; i < 9; i++) {
      if (state.board[i] === null) {
        moves.push({
          from: null,
          to: i,
          moveType: 'PLACE'
        });
      }
    }
    return moves;
  }

  applyMove(state: GameState, move: TicTacToeMove): GameState {
    return applyMove(state, move.to);
  }

  evaluate(state: GameState): number {
    if (state.winner === 'DRAW') return 0;
    if (state.winner === 'X') return 1;
    if (state.winner === 'O') return -1;
    return 0; // Game not finished
  }
}

export const ticTacToeEngine = new TicTacToeEngine(); 