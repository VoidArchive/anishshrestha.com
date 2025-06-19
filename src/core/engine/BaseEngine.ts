export interface BaseEngine<M = unknown, S = unknown> {
	initialState(): S;
	validMoves(state: S): M[];
	applyMove(state: S, move: M): S;
	evaluate?(state: S): number;
}
