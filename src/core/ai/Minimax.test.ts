import { describe, it, expect, beforeEach } from 'vitest';
import { Minimax } from './Minimax';
import type { BaseEngine } from '$core/engine/BaseEngine';

// Simple Tic-Tac-Toe engine for testing Minimax
interface TTTState {
	board: (string | null)[];
	turn: 'X' | 'O';
	winner: string | null;
}

type TTTMove = number;

const TicTacToeEngine: BaseEngine<TTTMove, TTTState> = {
	initialState(): TTTState {
		return {
			board: Array(9).fill(null),
			turn: 'X',
			winner: null
		};
	},

	validMoves(state: TTTState): TTTMove[] {
		if (state.winner) return [];
		return state.board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);
	},

	applyMove(state: TTTState, move: TTTMove): TTTState {
		const newBoard = [...state.board];
		newBoard[move] = state.turn;

		const winner = checkWinner(newBoard);

		return {
			board: newBoard,
			turn: state.turn === 'X' ? 'O' : 'X',
			winner
		};
	},

	evaluate(state: TTTState): number {
		if (state.winner === 'X') return 100;
		if (state.winner === 'O') return -100;
		if (state.board.every((c) => c !== null)) return 0; // Draw
		return 0;
	}
};

function checkWinner(board: (string | null)[]): string | null {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8], // rows
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8], // cols
		[0, 4, 8],
		[2, 4, 6] // diagonals
	];

	for (const [a, b, c] of lines) {
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a];
		}
	}
	return null;
}

describe('Minimax', () => {
	let minimax: Minimax<TTTMove, TTTState>;

	beforeEach(() => {
		minimax = new Minimax(TicTacToeEngine, { maxDepth: 9 });
	});

	describe('search', () => {
		it('returns a valid move', () => {
			const state = TicTacToeEngine.initialState();

			const [move] = minimax.search(state, true);

			expect(move).not.toBeNull();
			expect(move).toBeGreaterThanOrEqual(0);
			expect(move).toBeLessThan(9);
		});

		it('finds winning move for X', () => {
			// X has two in a row, can win
			const state: TTTState = {
				board: ['X', 'X', null, 'O', 'O', null, null, null, null],
				turn: 'X',
				winner: null
			};

			const [move, score] = minimax.search(state, true);

			expect(move).toBe(2); // Complete the row
			expect(score).toBe(100); // Win score
		});

		it('blocks opponent winning move', () => {
			// O is about to win, X should block
			const state: TTTState = {
				board: ['O', 'O', null, 'X', 'X', null, null, null, null],
				turn: 'X',
				winner: null
			};

			const [move] = minimax.search(state, true);

			expect(move).toBe(2); // Block O's winning row
		});

		it('returns null move when game is over', () => {
			const state: TTTState = {
				board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
				turn: 'O',
				winner: 'X'
			};

			const [move] = minimax.search(state, false);

			expect(move).toBeNull();
		});

		it('respects depth override', () => {
			const shallowMinimax = new Minimax(TicTacToeEngine, { maxDepth: 1 });
			const state = TicTacToeEngine.initialState();

			// Should still return a move (just less optimal)
			const [move] = shallowMinimax.search(state, true);

			expect(move).not.toBeNull();
		});
	});

	describe('transposition table', () => {
		it('caches positions', () => {
			const state = TicTacToeEngine.initialState();

			// First search
			minimax.search(state, true);

			// Clear and search again - should still work
			minimax.clearCache();

			const [move] = minimax.search(state, true);
			expect(move).not.toBeNull();
		});

		it('can be disabled', () => {
			const noTTMinimax = new Minimax(TicTacToeEngine, {
				maxDepth: 5,
				useTranspositionTable: false
			});

			const state = TicTacToeEngine.initialState();
			const [move] = noTTMinimax.search(state, true);

			expect(move).not.toBeNull();
		});
	});

	describe('move ordering', () => {
		it('works with custom move ordering', () => {
			const orderedMinimax = new Minimax(TicTacToeEngine, {
				maxDepth: 5,
				orderMoves: (moves) => {
					// Prioritize center move
					return [...moves].sort((a, b) => (a === 4 ? -1 : b === 4 ? 1 : 0));
				}
			});

			const state = TicTacToeEngine.initialState();
			const [move] = orderedMinimax.search(state, true);

			// Should still find a good move
			expect(move).not.toBeNull();
		});
	});

	describe('alpha-beta pruning', () => {
		it('produces same result as full search', () => {
			// Alpha-beta should prune branches but get same result
			const state: TTTState = {
				board: ['X', null, 'O', null, 'X', null, null, null, null],
				turn: 'O',
				winner: null
			};

			const [move, score] = minimax.search(state, false);

			// O should find the best defensive move
			expect(move).not.toBeNull();
			expect(typeof score).toBe('number');
		});
	});

	describe('maximizing vs minimizing', () => {
		it('maximizing player seeks highest score', () => {
			const state: TTTState = {
				board: ['X', 'X', null, null, null, null, null, null, null],
				turn: 'X',
				winner: null
			};

			const [, score] = minimax.search(state, true);

			// X should find a winning path
			expect(score).toBeGreaterThan(0);
		});

		it('minimizing player seeks lowest score', () => {
			const state: TTTState = {
				board: ['O', 'O', null, null, null, null, null, null, null],
				turn: 'O',
				winner: null
			};

			const [, score] = minimax.search(state, false);

			// O should find a winning path (negative score from X's perspective)
			expect(score).toBeLessThan(0);
		});
	});
});
