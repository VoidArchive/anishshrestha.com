import type { GameState, Move } from './types';

export interface BaseEngine<M = Move, S = GameState> {
	initialState(): S;
	validMoves(state: S): M[];
	applyMove(state: S, move: M): S;
	evaluate?(state: S): number;
}
