import type { GameState, Point } from '../bagchal';
import type { Move } from './types';
import { GameEvaluator } from './gameEvaluator';

/**
 * Main AI interface for the computer player
 */
export class ComputerPlayer {
	private evaluator: GameEvaluator;
	private difficulty: 'easy' | 'medium' | 'hard';

	constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
		this.difficulty = difficulty;
		// Reasonable depths for good performance
		const depths = { easy: 3, medium: 5, hard: 7 }; 
		this.evaluator = new GameEvaluator(depths[difficulty]);
	}

	/**
	 * Gets the best move for the computer player
	 */
	public getBestMove(
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): Move | null {
		try {
			const maximizing = state.turn === 'TIGER';
			
			// Use iterative deepening for better performance and time management
			let bestMove: Move | null = null;
			let currentDepth = 1;
			const maxDepth = this.evaluator.maxDepth;
			
			while (currentDepth <= maxDepth) {
				const [, move] = this.evaluator.minimax(
					state,
					currentDepth,
					-Infinity,
					Infinity,
					maximizing,
					adjacency,
					points
				);
				
				if (move) {
					bestMove = move;
				}
				
				currentDepth++;
			}

			return bestMove;
		} catch (error) {
			// Environment-based logging
			if (import.meta.env.DEV) {
				console.error('Error in computer move calculation:', error);
			}
			return null;
		}
	}

	/**
	 * Changes the difficulty level and clears cache
	 */
	public setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
		this.difficulty = difficulty;
		// Reasonable depths for good performance
		const depths = { easy: 3, medium: 5, hard: 7 };
		this.evaluator = new GameEvaluator(depths[difficulty]);
	}

	/**
	 * Clear the AI cache (call between games)
	 */
	public clearCache(): void {
		this.evaluator.clearCache();
	}

	/**
	 * Get current difficulty
	 */
	public getDifficulty(): 'easy' | 'medium' | 'hard' {
		return this.difficulty;
	}
} 