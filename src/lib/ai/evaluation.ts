import type { GameState, Point } from '../bagchal';
import type { Move, EvaluationWeights, StrategicPositions } from './types';
import { checkIfTigersAreTrapped, getBoardPositionHash, checkForDraw } from '../bagchal';
import { MoveGenerator } from './moveGeneration';

/**
 * Position evaluation for Bagchal AI
 */
export class PositionEvaluator {
	// Evaluation weights - heavily rebalanced for stronger play
	private static readonly WEIGHTS: EvaluationWeights = {
		GOAT_CAPTURED: 200,
		TIGER_MOBILITY: 6,
		POSITION_CONTROL: 4,
		ENDGAME: 50000,
		GOAT_MOBILITY: 2,
		TIGER_TRAPPED: 150,
		GOAT_CONNECTIVITY: 8,
		TIGER_COORDINATION: 20,
		CENTRALIZATION: 15,
		TEMPO: 25,
		CAPTURE_THREAT: 40,
	};

	// Strategic positions
	private static readonly POSITIONS: StrategicPositions = {
		STRATEGIC_POSITIONS: new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]),
		CENTER_POSITIONS: new Set([12]),
		CROSS_POSITIONS: new Set([6, 8, 16, 18])
	};

	/**
	 * Evaluates the current position and returns a score
	 * Positive scores favor tigers, negative scores favor goats
	 */
	static evaluatePosition(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		// Check for terminal states first
		if (state.winner === 'TIGER') {
			return this.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'GOAT') {
			return -this.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'DRAW') {
			return 0;
		}

		let score = 0;

		// Base score from captured goats
		score += state.goatsCaptured * this.WEIGHTS.GOAT_CAPTURED;

		// Phase-specific evaluation
		if (state.phase === 'PLACEMENT') {
			score += this.evaluatePlacementPhase(state, adjacency, points);
		} else {
			score += this.evaluateMovementPhase(state, adjacency, points);
		}

		return score;
	}

	/**
	 * Evaluation specific to placement phase
	 */
	private static evaluatePlacementPhase(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let score = 0;

		// Tiger mobility during placement
		const tigerMoves = MoveGenerator.getTigerMoves(state, adjacency, points);
		score += tigerMoves.length * this.WEIGHTS.TIGER_MOBILITY;

		// Strategic position control
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				if (this.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					score -= this.WEIGHTS.POSITION_CONTROL * 1.5;
				}
				if (this.POSITIONS.CENTER_POSITIONS.has(i)) {
					score -= this.WEIGHTS.POSITION_CONTROL * 2;
				}
			} else if (state.board[i] === 'TIGER') {
				if (this.POSITIONS.CENTER_POSITIONS.has(i)) {
					score += this.WEIGHTS.POSITION_CONTROL * 1.5;
				}
			}
		}

		// Enhanced goat strategy evaluation
		score -= this.evaluateGoatConnectivity(state, adjacency) * this.WEIGHTS.GOAT_CONNECTIVITY;
		score -= this.evaluateGoatTrapFormation(state, adjacency, points) * 0.8;
		score -= this.evaluateGoatDefensiveCoordination(state, adjacency) * 0.6;

		// Progress penalty for tigers
		const goatProgress = state.goatsPlaced / 20.0;
		score -= goatProgress * 30;

		return score;
	}

	/**
	 * Evaluation specific to movement phase
	 */
	private static evaluateMovementPhase(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let score = 0;

		// Tiger moves analysis
		const tigerMoves = MoveGenerator.getTigerMoves(state, adjacency, points);
		const captureMoves = tigerMoves.filter(m => m.moveType === 'CAPTURE');
		
		// Tiger mobility (but heavily favor captures)
		score += (tigerMoves.length - captureMoves.length) * this.WEIGHTS.TIGER_MOBILITY;
		score += captureMoves.length * this.WEIGHTS.CAPTURE_THREAT;

		// Goat mobility (fewer goat moves is better for tigers)
		const goatMoves = MoveGenerator.getGoatMoves(state, adjacency);
		score -= goatMoves.length * this.WEIGHTS.GOAT_MOBILITY;

		// Check if tigers are getting trapped
		if (checkIfTigersAreTrapped(state, adjacency, points)) {
			score -= this.WEIGHTS.ENDGAME;
		}

		// Individual tiger trap evaluation
		const trapCount = this.countTrappedTigers(state, adjacency, points);
		score -= trapCount * this.WEIGHTS.TIGER_TRAPPED;

		// Enhanced strategic position control
		score += this.evaluatePositionalControl(state);

		// Sophisticated goat strategy evaluation
		score -= this.evaluateGoatConnectivity(state, adjacency) * this.WEIGHTS.GOAT_CONNECTIVITY;
		score -= this.evaluateGoatTrapFormation(state, adjacency, points) * 1.2;
		score -= this.evaluateGoatDefensiveCoordination(state, adjacency) * 1.0;
		score -= this.evaluateGoatSacrificeStrategy(state, adjacency, points) * 0.5;

		// Tiger coordination
		score += this.evaluateTigerCoordination(state, adjacency) * this.WEIGHTS.TIGER_COORDINATION;

		// Progressive aggression
		const totalGoats = 20 - state.goatsCaptured;
		
		if (totalGoats <= 12) {
			// Late game: maximum aggression
			score += captureMoves.length * this.WEIGHTS.TEMPO;
			
			if (captureMoves.length >= 2) {
				score += 50 * captureMoves.length;
			}
		}
		
		// Endgame: extreme aggression
		if (totalGoats <= 8) {
			score += captureMoves.length * 100;
			
			if (captureMoves.length === 0 && tigerMoves.length > 0) {
				score -= 30;
			}
		}

		return score;
	}

	/**
	 * Enhanced positional control evaluation
	 */
	private static evaluatePositionalControl(state: GameState): number {
		let score = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (this.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') {
					score += this.WEIGHTS.POSITION_CONTROL;
				} else if (state.board[i] === 'GOAT') {
					score -= this.WEIGHTS.POSITION_CONTROL;
				}
			}
			
			if (this.POSITIONS.CENTER_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') {
					score += this.WEIGHTS.CENTRALIZATION;
				} else if (state.board[i] === 'GOAT') {
					score -= this.WEIGHTS.CENTRALIZATION * 1.5;
				}
			}
		}
		
		return score;
	}

	/**
	 * Evaluate goat connectivity
	 */
	private static evaluateGoatConnectivity(state: GameState, adjacency: Map<number, number[]>): number {
		let connectivity = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				const goatNeighbors = neighbors.filter(n => state.board[n] === 'GOAT').length;
				connectivity += goatNeighbors;
			}
		}
		
		return connectivity;
	}

	/**
	 * Advanced goat trap formation analysis
	 */
	private static evaluateGoatTrapFormation(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let trapScore = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const tigerMoves = MoveGenerator.getTigerMovesForPosition(i, state, adjacency, points);
				const tigerMobility = tigerMoves.length;
				
				if (tigerMobility <= 2) {
					trapScore += 100;
				} else if (tigerMobility <= 4) {
					trapScore += 50;
				}
				
				const blockingPositions = this.getBlockingPositions(i, state, adjacency);
				trapScore += blockingPositions * 25;
			}
		}
		
		return trapScore;
	}

	/**
	 * Evaluate defensive coordination
	 */
	private static evaluateGoatDefensiveCoordination(state: GameState, adjacency: Map<number, number[]>): number {
		let coordinationScore = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const defensiveValue = this.calculateDefensiveValue(i, state, adjacency);
				coordinationScore += defensiveValue;
				
				if (this.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					const protectionValue = this.calculateProtectionValue(i, state, adjacency);
					coordinationScore += protectionValue * 2;
				}
			}
		}
		
		return coordinationScore;
	}

	/**
	 * Evaluate sacrifice opportunities
	 */
	private static evaluateGoatSacrificeStrategy(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let sacrificeScore = 0;
		
		const goatCount = state.board.filter(piece => piece === 'GOAT').length;
		if (goatCount <= 12) return 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const potentialTrapValue = this.calculatePostCaptureAdvantage(i, state, adjacency, points);
				if (potentialTrapValue > 100) {
					sacrificeScore += potentialTrapValue * 0.3;
				}
			}
		}
		
		return sacrificeScore;
	}

	/**
	 * Evaluate tiger coordination
	 */
	private static evaluateTigerCoordination(state: GameState, adjacency: Map<number, number[]>): number {
		let coordination = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === 'GOAT') {
						const goatNeighbors = adjacency.get(neighbor) || [];
						const supportingTigers = goatNeighbors.filter(n => 
							n !== i && state.board[n] === 'TIGER'
						).length;
						coordination += supportingTigers;
					}
				}
			}
		}
		
		return coordination;
	}

	/**
	 * Count trapped tigers
	 */
	private static countTrappedTigers(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let trappedCount = 0;

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const validMoves = MoveGenerator.getTigerMovesForPosition(i, state, adjacency, points);
				if (validMoves.length === 0) {
					trappedCount++;
				}
			}
		}

		return trappedCount;
	}

	// Helper methods
	private static getBlockingPositions(tigerPos: number, state: GameState, adjacency: Map<number, number[]>): number {
		const neighbors = adjacency.get(tigerPos) || [];
		return neighbors.filter(n => state.board[n] === 'GOAT').length;
	}

	private static calculateDefensiveValue(goatPos: number, state: GameState, adjacency: Map<number, number[]>): number {
		const neighbors = adjacency.get(goatPos) || [];
		let defensiveValue = 0;
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				defensiveValue += 15;
			} else if (state.board[neighbor] === null) {
				const secondLevelNeighbors = adjacency.get(neighbor) || [];
				const nearbyTigers = secondLevelNeighbors.filter(pos => state.board[pos] === 'TIGER').length;
				defensiveValue += nearbyTigers * 5;
			}
		}
		
		return defensiveValue;
	}

	private static calculateProtectionValue(pos: number, state: GameState, adjacency: Map<number, number[]>): number {
		const neighbors = adjacency.get(pos) || [];
		let protectionValue = 0;
		
		const supportingGoats = neighbors.filter(n => state.board[n] === 'GOAT').length;
		protectionValue += supportingGoats * 8;
		
		if (this.POSITIONS.CENTER_POSITIONS.has(pos)) {
			protectionValue += 20;
		}
		
		return protectionValue;
	}

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
} 