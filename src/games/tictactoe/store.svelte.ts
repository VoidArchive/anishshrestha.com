import { initialState, applyMove, type GameState } from './rules';

// Reactive game state
export const gameState = $state<GameState>(initialState());

export function handleCellClick(index: number) {
	if (gameState.winner || gameState.board[index]) return;
	const newState = applyMove(gameState, index);
	Object.assign(gameState, newState);
}

export function resetGame() {
	Object.assign(gameState, initialState());
} 