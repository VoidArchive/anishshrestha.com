import type { GameState } from '$labs/tictactoe/rules';
import type { TicTacToeMove } from '$labs/tictactoe/engine';
import { TicTacToeEngine as TicTacToeEngineClass } from '$labs/tictactoe/engine';
import { Minimax } from '$core/ai';

// Create AI instances for both players
const aiEngines = {
	X: new TicTacToeEngineClass('X'),
	O: new TicTacToeEngineClass('O')
};

const minimaxAIs = {
	X: new Minimax<TicTacToeMove, GameState>(aiEngines.X, {
		maxDepth: 9, // Perfect play - TicTacToe tree is small
		stateHash: <S>(state: S) => {
			const gameState = state as GameState;
			return gameState.board.join(',') + '|' + gameState.turn;
		}
	}),
	O: new Minimax<TicTacToeMove, GameState>(aiEngines.O, {
		maxDepth: 9, // Perfect play - TicTacToe tree is small
		stateHash: <S>(state: S) => {
			const gameState = state as GameState;
			return gameState.board.join(',') + '|' + gameState.turn;
		}
	})
};

/** Returns the optimal move index (0-8) for the given state. */
export function getBestMove(state: GameState, aiPlayer: 'X' | 'O' = 'O'): number | null {
	if (state.winner) return null;

	try {
		// Use the appropriate AI instance for the player
		const ai = minimaxAIs[aiPlayer];
		const [bestMove] = ai.search(state, true); // Always maximizing from AI's perspective
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
	minimaxAIs.X.clearCache();
	minimaxAIs.O.clearCache();
}
