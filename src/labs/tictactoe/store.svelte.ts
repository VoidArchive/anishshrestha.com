import { initialState, applyMove, type GameState } from './rules';

// Reactive game state
export const gameState = $state<GameState>(initialState());

export function handleCellClick(index: number) {
	if (gameState.winner || gameState.board[index]) return;
	const newState = applyMove(gameState, index);
	// NOTE: Use Object.assign for consistent state mutation pattern
	Object.assign(gameState, newState);
}

export function resetGame() {
	// NOTE: Use Object.assign for consistent state mutation pattern
	Object.assign(gameState, initialState());
}
