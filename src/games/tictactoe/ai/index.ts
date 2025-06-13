import type { GameState, Player } from '$games/tictactoe/rules';

/** Returns the optimal move index (0-8) for the given state using minimax. */
export function getBestMove(state: GameState): number | null {
	if (state.winner) return null;

	const maximizingPlayer: Player = state.turn; // AI plays the current turn's symbol

	let bestScore = -Infinity;
	let bestMove: number | null = null;

	for (let i = 0; i < 9; i++) {
		if (state.board[i] !== null) continue;

		// make move
		state.board[i] = maximizingPlayer;
		const score = minimax(state, false, maximizingPlayer);
		// undo
		state.board[i] = null;

		if (score > bestScore) {
			bestScore = score;
			bestMove = i;
		}
	}

	return bestMove;
}

function minimax(state: GameState, isMaximizing: boolean, aiPlayer: Player): number {
	const terminal = checkWinnerQuick(state.board);
	if (terminal !== null) {
		if (terminal === 'DRAW') return 0;
		return terminal === aiPlayer ? 1 : -1;
	}

	const currentPlayer: Player = isMaximizing ? aiPlayer : (aiPlayer === 'X' ? 'O' : 'X');
	let bestScore = isMaximizing ? -Infinity : Infinity;

	for (let i = 0; i < 9; i++) {
		if (state.board[i] !== null) continue;

		// play move
		state.board[i] = currentPlayer;
		const winner = checkWinnerQuick(state.board);
		let score: number;
		if (winner !== null) {
			if (winner === 'DRAW') score = 0;
			else score = winner === aiPlayer ? 1 : -1;
		} else {
			score = minimax(state, !isMaximizing, aiPlayer);
		}
		state.board[i] = null;

		if (isMaximizing) {
			bestScore = Math.max(bestScore, score);
		} else {
			bestScore = Math.min(bestScore, score);
		}
	}

	return bestScore;
}

// Lightweight winner check to avoid circular import
function checkWinnerQuick(board: (Player | null)[]): Player | 'DRAW' | null {
	const wins = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	];
	for (const [a, b, c] of wins) {
		if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] as Player;
	}
	return board.every(Boolean) ? 'DRAW' : null;
} 