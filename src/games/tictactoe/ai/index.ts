import type { GameState } from '$games/tictactoe/rules';
import type { TicTacToeMove } from '$games/tictactoe/engine';
import { ticTacToeEngine } from '$games/tictactoe/engine';
import { Minimax } from '$core/ai';

// Create minimax instance for TicTacToe
const minimaxAI = new Minimax<TicTacToeMove, GameState>(ticTacToeEngine, {
  maxDepth: 9, // Perfect play - TicTacToe tree is small
  stateHash: <S>(state: S) => {
    const gameState = state as GameState;
    return gameState.board.join(',') + '|' + gameState.turn;
  }
});

// Clear AI cache when restarting games to prevent stale state
function clearAICache() {
  minimaxAI.clearCache();
}

/** Returns the optimal move index (0-8) for the given state. */
export function getBestMove(state: GameState): number | null {
  if (state.winner) return null;

  try {
    const [bestMove] = minimaxAI.search(state, true); // TicTacToe is always maximizing for current player
    return bestMove?.to ?? null;
  } catch (error) {
    console.error('AI search failed:', error);
    // Fallback: return first available move
    for (let i = 0; i < 9; i++) {
      if (state.board[i] === null) return i;
    }
    return null;
  }
}

/** Clear AI cache - call this when starting a new game */
export function resetAI() {
  clearAICache();
} 