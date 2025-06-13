import type { GameState, Point } from '$games/bagchal/rules';
import type { Move } from './types';
import { MoveGenerator } from './moveGeneration.js';

/**
 * Simplified move ordering to improve alpha-beta pruning efficiency for Bagchal.
 */
export class MoveOrderer {
	// Strategic position sets
	private static readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);
	private static readonly CENTER_POSITIONS = new Set([12]);
	private static readonly CROSS_POSITIONS = new Set([6, 8, 16, 18]);

	/**
	 * Orders moves for optimal alpha-beta pruning with safety-first approach
	 */
	static orderMoves(
		moves: Move[],
		state: GameState,
		maximizing: boolean,
		adjacency: Map<number, number[]>,
		points: Point[]
	): Move[] {
		return moves.sort((a, b) => {
			let aScore = 0;
			let bScore = 0;
			if (maximizing) {
				aScore = this.calculateTigerMoveScore(a);
				bScore = this.calculateTigerMoveScore(b);
			} else {
				aScore = this.calculateGoatMoveScore(a, state, adjacency, points);
				bScore = this.calculateGoatMoveScore(b, state, adjacency, points);
			}
			return bScore - aScore;
		});
	}

	// --------------------------- Tiger ordering ---------------------------
	private static calculateTigerMoveScore(move: Move): number {
		let score = 0;
		
		// MASSIVELY prioritize captures - this is how tigers win
		if (move.moveType === 'CAPTURE') {
			score += 5000; // Increased from 2000 to 5000
			
			// Extra bonus for captures that lead to more captures
			if (this.CENTER_POSITIONS.has(move.to)) score += 500;
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 300;
		}
		
		// Strategic positioning for creating threats
		if (move.moveType === 'MOVEMENT') {
			// Much higher rewards for aggressive positioning
			if (this.CENTER_POSITIONS.has(move.to)) score += 600; // Doubled
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 400; // Almost tripled
			if (this.CROSS_POSITIONS.has(move.to)) score += 250; // More than doubled
			
			// Bonus for moving away from corners (corners are passive)
			if (move.from !== null) {
				const isFromCorner = [0, 4, 20, 24].includes(move.from);
				if (isFromCorner) score += 200; // Big bonus for leaving corners
			}
			
			// Basic movement bonus
			score += 100; // Doubled from 50
		}
		
		return score;
	}

	// --------------------------- Goat ordering ---------------------------
	private static calculateGoatMoveScore(
		move: Move, 
		state: GameState, 
		adjacency: Map<number, number[]>, 
		points: Point[]
	): number {
		let score = 0;
		
		// SAFETY FIRST: In CLASSIC mode, heavily penalize suicide moves
		if (state.mode === 'CLASSIC' && state.turn === 'GOAT') {
			// Create a test state to check if this move would be suicidal
			const testState = { ...state, board: [...state.board] };
			
			if (move.moveType === 'PLACEMENT') {
				testState.board[move.to] = 'GOAT';
				// Check if this placement would be immediately capturable
				if (MoveGenerator.wouldBeImmediatelyCaptured(move.to, testState, adjacency, points)) {
					score -= 10000; // Massive penalty - move to end of list
				}
			} else if (move.moveType === 'MOVEMENT' && move.from !== null) {
				testState.board[move.from] = null;
				testState.board[move.to] = 'GOAT';
				// Check if this movement would be immediately capturable
				if (MoveGenerator.wouldBeImmediatelyCaptured(move.to, testState, adjacency, points)) {
					score -= 10000; // Massive penalty - move to end of list
				}
			}
		}
		
		// In early game, prioritize safe positions over aggressive ones
		const isEarlyGame = state.goatsPlaced < 15;
		
		if (isEarlyGame) {
			// Early game: be more conservative
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 200;
			if (this.CROSS_POSITIONS.has(move.to)) score += 150;
			if (this.CENTER_POSITIONS.has(move.to)) score += 100;
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
