import type { GameState, Point } from '$games/bagchal/rules';
import type { Move } from './types';

/**
 * Simplified move ordering to improve alpha-beta pruning efficiency for Bagchal.
 */
export class MoveOrderer {
	// Strategic position sets
	private static readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);
	private static readonly CENTER_POSITIONS = new Set([12]);
	private static readonly CROSS_POSITIONS = new Set([6, 8, 16, 18]);

	/**
	 * Orders moves for optimal alpha-beta pruning using simple heuristics
	 */
	static orderMoves(
		moves: Move[],
		state: GameState,
		maximizing: boolean,
		_adjacency: Map<number, number[]>,
		_points: Point[]
	): Move[] {
		return moves.sort((a, b) => {
			let aScore = 0;
			let bScore = 0;
			if (maximizing) {
				aScore = this.calculateTigerMoveScore(a);
				bScore = this.calculateTigerMoveScore(b);
			} else {
				aScore = this.calculateGoatMoveScore(a, state);
				bScore = this.calculateGoatMoveScore(b, state);
			}
			return bScore - aScore;
		});
	}

	// --------------------------- Tiger ordering ---------------------------
	private static calculateTigerMoveScore(move: Move): number {
		let score = 0;
		
		// Prioritize captures heavily
		if (move.moveType === 'CAPTURE') score += 2000;
		
		// Strategic positions
		if (this.CENTER_POSITIONS.has(move.to)) score += 300;
		if (this.STRATEGIC_POSITIONS.has(move.to)) score += 150;
		if (this.CROSS_POSITIONS.has(move.to)) score += 100;
		
		// Basic movement
		if (move.moveType === 'MOVEMENT') score += 50;
		
		return score;
	}

	// --------------------------- Goat ordering ---------------------------
	private static calculateGoatMoveScore(move: Move, state: GameState): number {
		let score = 0;
		
		// In early game, prioritize safe positions over aggressive ones
		const isEarlyGame = state.goatsPlaced < 15;
		
		if (isEarlyGame) {
			// Early game: be more conservative
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 200; // Reduced from 300
			if (this.CROSS_POSITIONS.has(move.to)) score += 150; // Reduced from 200
			if (this.CENTER_POSITIONS.has(move.to)) score += 100; // Much reduced from 600
		} else {
			// Late game: can be more aggressive
			if (this.CENTER_POSITIONS.has(move.to)) score += 400;
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 250;
			if (this.CROSS_POSITIONS.has(move.to)) score += 180;
		}
		
		// Phase-specific bonuses
		if (state.phase === 'PLACEMENT') {
			// Early game: focus on building strong positions gradually
			score += 50;
		} else {
			// Late game: mobility and blocking become more important
			if (move.moveType === 'MOVEMENT') {
				score += 150;
			}
		}
		
		return score;
	}
}
