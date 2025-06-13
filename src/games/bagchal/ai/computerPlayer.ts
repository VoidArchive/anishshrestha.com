import type { GameState, Point, GameMode } from '$games/bagchal/rules';
import type { Move } from './types';
import { GameEvaluator } from './gameEvaluator.js';

/**
 * Main AI interface encapsulating search & difficulty management for Bagchal.
 */
export class ComputerPlayer {
	private evaluator: GameEvaluator;
	private mode: GameMode;

	constructor(mode: GameMode = 'CLASSIC') {
		this.mode = mode;
		const depthMap: Record<GameMode, number> = {
			CLASSIC: 10,
			REFORGED: 10 // TODO: adjust when reforged rules finalized
		};
		this.evaluator = new GameEvaluator(depthMap[mode]);
	}

	/** Return the best move found for the current position. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBestMove(state: GameState, _adjacency: Map<number, number[]>, _points: Point[]): Move | null {
		try {
			const maximizing = state.turn === 'TIGER';
			let bestMove: Move | null = null;
			let depth = 1;
			while (depth <= this.evaluator.maxDepth) {
				const [, move] = this.evaluator.minimax(state, depth, -Infinity, Infinity, maximizing);
				if (move) bestMove = move;
				depth++;
			}
			return bestMove;
		} catch (err) {
			if (import.meta.env.DEV) console.error('AI move error:', err);
			return null;
		}
	}

	setMode(mode: GameMode): void {
		this.mode = mode;
		const depthMap: Record<GameMode, number> = {
			CLASSIC: 10,
			REFORGED: 10
		};
		this.evaluator = new GameEvaluator(depthMap[mode]);
	}

	getMode(): GameMode {
		return this.mode;
	}

	clearCache(): void {
		this.evaluator.clearCache();
	}
}
