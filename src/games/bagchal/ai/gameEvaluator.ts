import type { GameState } from '$games/bagchal/rules';
import type { Move } from './types';
import { Minimax } from '$core/ai';
import { BagchalEngine } from '$games/bagchal/engine';

/**
 * Bagchal-specific evaluator delegating search to the generic Minimax helper.
 */
export class GameEvaluator {
	public readonly maxDepth: number;
	private readonly engine: Minimax<Move, GameState>;

	constructor(maxDepth = 7) {
		this.maxDepth = maxDepth;
		this.engine = new Minimax<Move, GameState>(BagchalEngine, { maxDepth });
	}

	clearCache(): void {
		this.engine.clearCache();
	}

	minimax(
		state: GameState,
		depth: number,
		_alpha: number,
		_beta: number,
		maximising: boolean
	): [number, Move | null] {
		const [move, score] = this.engine.search(state, maximising, depth);
		return [score, move];
	}
}
