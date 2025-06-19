export type Player = 'X' | 'O';

export interface GameState {
	board: (Player | null)[]; // 3x3 board flattened to 9 cells
	turn: Player;
	winner: Player | 'DRAW' | null;
}

/**
 * Returns a fresh initial game state
 */
export function initialState(): GameState {
	return {
		board: Array(9).fill(null),
		turn: 'X',
		winner: null
	};
}

const winningCombos: number[][] = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

export function checkWinner(board: (Player | null)[]): Player | 'DRAW' | null {
	for (const combo of winningCombos) {
		const [a, b, c] = combo;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a] as Player;
		}
	}
	// No winner but board full => draw
	if (board.every(Boolean)) return 'DRAW';
	return null;
}

/**
 * Apply a move to the provided state immutably and return a new state
 */
export function applyMove(state: GameState, index: number): GameState {
	// Ignore invalid moves
	if (state.winner || state.board[index]) {
		return state;
	}

	const newBoard = [...state.board];
	newBoard[index] = state.turn;

	const winner = checkWinner(newBoard);

	return {
		board: newBoard,
		turn: winner ? state.turn : state.turn === 'X' ? 'O' : 'X',
		winner
	};
}
