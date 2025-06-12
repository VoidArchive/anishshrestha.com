import type { GameState, Point } from '../bagchal';
import type { Move } from './types';
import { MoveGenerator } from './moveGeneration';
import { PositionEvaluator } from './evaluation';

/**
 * Advanced move ordering for superior alpha-beta pruning
 */
export class MoveOrderer {
	// Strategic position sets
	private static readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);
	private static readonly CENTER_POSITIONS = new Set([12]);
	private static readonly CROSS_POSITIONS = new Set([6, 8, 16, 18]);

	/**
	 * Orders moves for optimal alpha-beta pruning
	 */
	static orderMoves(moves: Move[], state: GameState, maximizing: boolean, adjacency: Map<number, number[]>, points: Point[]): Move[] {
		return moves.sort((a, b) => {
			let aScore = 0;
			let bScore = 0;
			
			if (maximizing) {
				// Tigers: Aggressive move ordering
				aScore = this.calculateTigerMoveScore(a, state, adjacency, points);
				bScore = this.calculateTigerMoveScore(b, state, adjacency, points);
			} else {
				// Goats: Advanced strategic move ordering
				aScore = this.calculateGoatMoveScore(a, state, adjacency, points);
				bScore = this.calculateGoatMoveScore(b, state, adjacency, points);
			}
			
			return bScore - aScore;
		});
	}

	/**
	 * Calculate move score for tigers (aggressive ordering)
	 */
	private static calculateTigerMoveScore(move: Move, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let score = 0;

		if (move.moveType === 'CAPTURE') {
			score += 2000; // Highest priority
		}

		// Bonus for moves that create multiple threats
		if (this.CENTER_POSITIONS.has(move.to)) {
			score += 300; // Center is powerful for tigers
		}

		// Strategic positions
		if (this.STRATEGIC_POSITIONS.has(move.to)) {
			score += 150;
		}

		// Favor moves that constrain goat mobility
		if (move.moveType === 'MOVEMENT') {
			score += 50;
		}

		return score;
	}

	/**
	 * Calculate move score for goats (strategic ordering)
	 */
	private static calculateGoatMoveScore(move: Move, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let score = 0;

		if (move.moveType === 'PLACEMENT' || move.moveType === 'MOVEMENT') {
			// Ultra-high priority for trap-completing moves
			const trapValue = this.calculateTrapCompletionValue(move, state, adjacency);
			score += trapValue * 1000; // Highest priority
			
			// High priority for blocking immediate tiger captures
			const blockValue = this.calculateCaptureBlockingValue(move, state, adjacency, points);
			score += blockValue * 800;
			
			// Strategic position control with enhanced weighting
			if (this.CENTER_POSITIONS.has(move.to)) {
				score += 600; // Critical center control
			}
			if (this.STRATEGIC_POSITIONS.has(move.to)) {
				score += 300;
			}
			
			// Advanced coordination bonuses
			const coordinationValue = this.calculateMoveCoordinationValue(move, state, adjacency);
			score += coordinationValue * 200;
			
			// Sacrifice evaluation for tactical advantage
			const sacrificeValue = this.calculateMoveSacrificeValue(move, state, adjacency, points);
			score += sacrificeValue * 150;
			
			// Mobility reduction bonus
			const mobilityReduction = this.calculateTigerMobilityReduction(move, state, adjacency, points);
			score += mobilityReduction * 400;
		}

		return score;
	}

	/**
	 * Calculate if a move completes a tiger trap
	 */
	private static calculateTrapCompletionValue(move: Move, state: GameState, adjacency: Map<number, number[]>): number {
		// Simulate the move
		const testState = { ...state, board: [...state.board] };
		if (move.from !== null) {
			testState.board[move.from] = null;
		}
		testState.board[move.to] = 'GOAT';
		
		let trapValue = 0;
		
		// Check if any tigers become trapped after this move
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(i, state, adjacency, []).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(i, testState, adjacency, []).length;
				
				if (newMobility === 0 && originalMobility > 0) {
					trapValue += 5; // Completes a trap!
				} else if (newMobility < originalMobility) {
					trapValue += Math.max(0, originalMobility - newMobility);
				}
			}
		}
		
		return trapValue;
	}

	/**
	 * Calculate if a move blocks an immediate tiger capture threat
	 */
	private static calculateCaptureBlockingValue(move: Move, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let blockValue = 0;
		
		// Check if this move blocks any immediate tiger capture threats
		const neighbors = adjacency.get(move.to) || [];
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'GOAT') {
				// Check if any tiger could capture this goat
				const goatNeighbors = adjacency.get(neighbor) || [];
				for (const potential of goatNeighbors) {
					if (state.board[potential] === 'TIGER') {
						// Check if tiger can capture the goat at neighbor
						const captureTargets = this.findCaptureTargets(potential, neighbor, state, adjacency, points);
						if (captureTargets.length > 0) {
							blockValue += 3; // Blocks an immediate capture threat
						}
					}
				}
			}
		}
		
		return blockValue;
	}

	/**
	 * Calculate coordination value of a move with other goats
	 */
	private static calculateMoveCoordinationValue(move: Move, state: GameState, adjacency: Map<number, number[]>): number {
		const neighbors = adjacency.get(move.to) || [];
		let coordinationValue = 0;
		
		// Count supporting goats that would be adjacent after this move
		const supportingGoats = neighbors.filter(n => state.board[n] === 'GOAT').length;
		coordinationValue += supportingGoats;
		
		// Bonus for creating defensive formations
		if (supportingGoats >= 2) {
			coordinationValue += 2; // Strong formation bonus
		}
		
		return coordinationValue;
	}

	/**
	 * Calculate sacrifice value of a move (positive if it's a good sacrifice)
	 */
	private static calculateMoveSacrificeValue(move: Move, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		// Only consider sacrifice if we're not in a critical situation
		const goatCount = state.board.filter(piece => piece === 'GOAT').length;
		if (goatCount <= 12) return 0;
		
		// Check if this move puts a goat in a position where it could be captured
		// but gains strategic advantage
		const neighbors = adjacency.get(move.to) || [];
		let sacrificeValue = 0;
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				// This goat could be captured, check if it's worth it
				const advantageGained = this.calculatePostCaptureAdvantage(move.to, state, adjacency, points);
				if (advantageGained > 150) { // Only if significant advantage
					sacrificeValue += Math.min(2, advantageGained / 100);
				}
			}
		}
		
		return sacrificeValue;
	}

	/**
	 * Calculate how much a move reduces tiger mobility
	 */
	private static calculateTigerMobilityReduction(move: Move, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		// Simulate the move
		const testState = { ...state, board: [...state.board] };
		if (move.from !== null) {
			testState.board[move.from] = null;
		}
		testState.board[move.to] = 'GOAT';
		
		let totalReduction = 0;
		
		// Calculate mobility reduction for all tigers
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(i, state, adjacency, points).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(i, testState, adjacency, points).length;
				totalReduction += Math.max(0, originalMobility - newMobility);
			}
		}
		
		return totalReduction;
	}

	/**
	 * Helper: Calculate advantage gained after a potential goat sacrifice
	 */
	private static calculatePostCaptureAdvantage(goatPos: number, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		const testState = {
			...state,
			board: [...state.board],
			goatsCaptured: state.goatsCaptured + 1
		};
		testState.board[goatPos] = null;
		
		let advantageScore = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(i, state, adjacency, points).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(i, testState, adjacency, points).length;
				
				if (newMobility < originalMobility) {
					advantageScore += (originalMobility - newMobility) * 30;
				}
				
				if (newMobility === 0) {
					advantageScore += 200;
				}
			}
		}
		
		return advantageScore;
	}

	/**
	 * Helper: Find capture targets for a tiger
	 */
	private static findCaptureTargets(tigerPos: number, goatPos: number, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number[] {
		const targets: number[] = [];
		const goatNeighbors = adjacency.get(goatPos) || [];

		for (const target of goatNeighbors) {
			if (target !== tigerPos && state.board[target] === null) {
				// Check if the move is in a straight line
				if (this.isValidCaptureLine(tigerPos, goatPos, target, points)) {
					targets.push(target);
				}
			}
		}

		return targets;
	}

	/**
	 * Helper: Check if capture move is in valid straight line
	 */
	private static isValidCaptureLine(from: number, middle: number, to: number, points: Point[]): boolean {
		if (!points[from] || !points[middle] || !points[to]) return false;

		const p1 = points[from];
		const p2 = points[middle];
		const p3 = points[to];

		// Check if points are collinear
		const dx1 = p2.x - p1.x;
		const dy1 = p2.y - p1.y;
		const dx2 = p3.x - p2.x;
		const dy2 = p3.y - p2.y;

		// Points are collinear if cross product is zero (with some tolerance)
		const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
		return crossProduct < 0.001;
	}
} 