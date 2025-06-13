import type { GameState, Point } from '$games/bagchal/rules';
import type { EvaluationWeights, StrategicPositions } from './types';

/**
 * Position evaluation for Bagchal AI.
 */
export class PositionEvaluator {
	// Evaluation weights - rebalanced for much stronger tiger play
	private static readonly WEIGHTS: EvaluationWeights = {
		GOAT_CAPTURED: 400, 
		TIGER_MOBILITY: 12, // Increased - tigers need mobility
		POSITION_CONTROL: 8, // Increased for better positioning
		ENDGAME: 10000,
		GOAT_MOBILITY: 4, 
		TIGER_TRAPPED: 300, // Much higher penalty for trapped tigers
		GOAT_CONNECTIVITY: 15, 
		TIGER_COORDINATION: 40, // Much higher for coordinated attacks
		CENTRALIZATION: 25, // Higher for center control
		TEMPO: 40, // Higher for maintaining pressure
		CAPTURE_THREAT: 100 // Much higher - threats are key for tigers
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
	static evaluatePosition(
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number {
		// Check for terminal states first
		if (state.winner === 'TIGER') {
			return PositionEvaluator.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'GOAT') {
			return -PositionEvaluator.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'DRAW') {
			return 0;
		}

		// SAFETY FIRST: In CLASSIC mode, immediately reject any position with capturable goats
		// This must happen BEFORE any other evaluation to ensure safety is non-negotiable
		if (state.mode === 'CLASSIC') {
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === 'GOAT') {
					if (PositionEvaluator.wouldBeImmediatelyCaptured(i, state, adjacency, points)) {
						// Return catastrophic penalty - no positional advantage can justify suicide
						return -50000;
					}
				}
			}
		}

		let score = 0;

		// Heavily penalize captured goats, especially early in the game
		const earlyGamePenalty = state.goatsPlaced < 15 ? 5.0 : state.goatsPlaced < 18 ? 3.0 : 1.0;
		score += state.goatsCaptured * PositionEvaluator.WEIGHTS.GOAT_CAPTURED * earlyGamePenalty;

		// Phase-specific evaluation
		if (state.phase === 'PLACEMENT') {
			score += PositionEvaluator.evaluatePlacementPhase(state, adjacency, points);
		} else {
			score += PositionEvaluator.evaluateMovementPhase(state, adjacency, points);
		}

		return score;
	}

	// --------------------------- Placement phase ---------------------------
	private static evaluatePlacementPhase(
		state: GameState,
		adjacency: Map<number, number[]>,
		_points: Point[]
	): number {
		let score = 0;

		// ENHANCED tiger evaluation during placement phase
		let tigerMobility = 0;
		let tigerPressure = 0;
		let cornerEscapeBonus = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				const goatNeighbors = neighbors.filter(n => state.board[n] === 'GOAT').length;
				
				tigerMobility += freeNeighbors;
				
				// Reward tigers for exerting pressure (being near goats)
				tigerPressure += goatNeighbors * 2;
				
				// Big bonus for tigers that have moved away from starting corners
				const isStartingCorner = [0, 4, 20, 24].includes(i);
				if (!isStartingCorner) {
					cornerEscapeBonus += 100; // Major bonus for active positioning
				}
				
				// Extra bonus for central positioning during placement
				if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
					cornerEscapeBonus += 150;
				} else if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					cornerEscapeBonus += 80;
				}
			}
		}
		
		score += tigerMobility * PositionEvaluator.WEIGHTS.TIGER_MOBILITY;
		score += tigerPressure * PositionEvaluator.WEIGHTS.CAPTURE_THREAT;
		score += cornerEscapeBonus;

		// Strategic position control
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 1.5;
				}
				if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
					score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 2;
				}
				
				// Progressive position strategy based on game progress
				const gameProgress = state.goatsPlaced / 20.0;
				if (gameProgress < 0.3) {
					// Early game: prefer safe edges
					const neighbors = adjacency.get(i) || [];
					const tigerNeighbors = neighbors.filter(n => state.board[n] === 'TIGER').length;
					if (tigerNeighbors === 0) score -= 50; // Reward safe positions early
				} else if (gameProgress < 0.7) {
					// Mid game: gradual movement toward strategic positions
					if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
						score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 0.5;
					}
				} else {
					// Late game: aggressive center control
					if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
						score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 1.5;
					}
				}
			} else if (state.board[i] === 'TIGER') {
				if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
					score += PositionEvaluator.WEIGHTS.POSITION_CONTROL * 1.5;
				}
			}
		}

		// Enhanced goat strategy evaluation
		score -=
			PositionEvaluator.evaluateGoatConnectivity(state, adjacency) *
			PositionEvaluator.WEIGHTS.GOAT_CONNECTIVITY;
		score -= PositionEvaluator.evaluateGoatTrapFormation(state, adjacency, _points) * 0.8;
		score -= PositionEvaluator.evaluateGoatDefensiveCoordination(state, adjacency) * 1.0;

		// Progress penalty for tigers (goats get more time to set up)
		const goatProgress = state.goatsPlaced / 20.0;
		score -= goatProgress * 30;

		return score;
	}

	// --------------------------- Movement phase ---------------------------
	private static evaluateMovementPhase(
		state: GameState,
		adjacency: Map<number, number[]>,
		_points: Point[]
	): number {
		let score = 0;

		// ENHANCED tiger threat analysis and positioning
		let tigerThreats = 0;
		let tigerMobility = 0;
		let tigerCoordination = 0;
		let huntingFormation = 0;
		
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				const goatNeighbors = neighbors.filter(n => state.board[n] === 'GOAT');
				
				tigerMobility += freeNeighbors;
				
				// Enhanced capture threat counting with geometric validation
				for (const goatPos of goatNeighbors) {
					const goatNeighbors = adjacency.get(goatPos) || [];
					for (const landing of goatNeighbors) {
						if (landing !== i && state.board[landing] === null) {
							// Check if it's a valid capture line
							if (PositionEvaluator.isValidCaptureLine(i, goatPos, landing, _points)) {
								tigerThreats += 1;
								
								// Bonus for multiple tigers threatening the same goat
								for (let j = 0; j < state.board.length; j++) {
									if (j !== i && state.board[j] === 'TIGER') {
										const tigerNeighbors = adjacency.get(j) || [];
										if (tigerNeighbors.includes(goatPos)) {
											tigerCoordination += 1;
										}
									}
								}
							}
						}
					}
				}
				
				// Reward tigers for hunting formation (moving toward center)
				if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
					huntingFormation += 3;
				} else if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					huntingFormation += 2;
				} else if (PositionEvaluator.POSITIONS.CROSS_POSITIONS.has(i)) {
					huntingFormation += 1;
				}
			}
		}
		
		score += tigerMobility * PositionEvaluator.WEIGHTS.TIGER_MOBILITY;
		score += tigerThreats * PositionEvaluator.WEIGHTS.CAPTURE_THREAT;
		score += tigerCoordination * PositionEvaluator.WEIGHTS.TIGER_COORDINATION;
		score += huntingFormation * PositionEvaluator.WEIGHTS.TEMPO;

		// Simple goat mobility calculation
		let goatMobility = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				goatMobility += freeNeighbors;
			}
		}
		score -= goatMobility * PositionEvaluator.WEIGHTS.GOAT_MOBILITY;

		// Simple tiger trap check
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				if (freeNeighbors === 0) {
					score -= PositionEvaluator.WEIGHTS.ENDGAME; // Heavily penalize trapped tigers
				} else if (freeNeighbors <= 1) {
					score -= PositionEvaluator.WEIGHTS.TIGER_TRAPPED;
				}
			}
		}

		// SIMPLIFIED strategic position control - no expensive helper functions
		for (let i = 0; i < state.board.length; i++) {
			if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') score += PositionEvaluator.WEIGHTS.POSITION_CONTROL;
				else if (state.board[i] === 'GOAT') score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL;
			}
			if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') score += PositionEvaluator.WEIGHTS.CENTRALIZATION;
				else if (state.board[i] === 'GOAT') score -= PositionEvaluator.WEIGHTS.CENTRALIZATION * 1.5;
			}
		}

		// SIMPLIFIED goat connectivity - just count adjacent goats
		let goatConnectivity = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				const goatNeighbors = neighbors.filter((n) => state.board[n] === 'GOAT').length;
				goatConnectivity += goatNeighbors;
			}
		}
		score -= goatConnectivity * PositionEvaluator.WEIGHTS.GOAT_CONNECTIVITY;

		// AGGRESSIVE TIGER STRATEGY - much more proactive throughout the game
		const totalGoats = 20 - state.goatsCaptured;
		const goatsRemaining = totalGoats;

		// Early aggression - tigers must create pressure immediately
		if (goatsRemaining >= 15) {
			score += tigerThreats * PositionEvaluator.WEIGHTS.TEMPO * 0.8;
			// Reward tigers for moving away from corners early
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === 'TIGER') {
					const isCorner = [0, 4, 20, 24].includes(i);
					if (!isCorner) score += 50; // Big bonus for leaving corners
				}
			}
		}

		// Mid-game coordination (10-14 goats)
		if (goatsRemaining >= 10 && goatsRemaining <= 14) {
			score += tigerThreats * PositionEvaluator.WEIGHTS.TEMPO * 1.2;
			score += tigerCoordination * 50; // Heavy coordination bonus
			
			// Punish tigers with no threats if they have mobility
			if (tigerThreats === 0 && tigerMobility > 2) {
				score -= 100;
			}
		}

		// Late game maximum aggression (5-9 goats)
		if (goatsRemaining >= 5 && goatsRemaining <= 9) {
			score += tigerThreats * PositionEvaluator.WEIGHTS.TEMPO * 1.5;
			score += tigerCoordination * 100;
			
			// Strong penalty for not threatening when possible
			if (tigerThreats === 0 && tigerMobility > 1) {
				score -= 200;
			}
		}

		// Endgame: desperate aggression (≤4 goats)
		if (goatsRemaining <= 4) {
			score += tigerThreats * 200;
			score += tigerCoordination * 150;
			
			// Every tiger must contribute to threats or be penalized heavily
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === 'TIGER') {
					const neighbors = adjacency.get(i) || [];
					const adjacentGoats = neighbors.filter(n => state.board[n] === 'GOAT').length;
					if (adjacentGoats === 0) {
						score -= 150; // Heavy penalty for tigers not threatening
					}
				}
			}
		}

		return score;
	}

	// --------------------------- Helper evaluators ---------------------------
	private static evaluatePositionalControl(state: GameState): number {
		let score = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') score += PositionEvaluator.WEIGHTS.POSITION_CONTROL;
				else if (state.board[i] === 'GOAT') score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL;
			}
			if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') score += PositionEvaluator.WEIGHTS.CENTRALIZATION;
				else if (state.board[i] === 'GOAT') score -= PositionEvaluator.WEIGHTS.CENTRALIZATION * 1.5;
			}
		}
		return score;
	}

	private static evaluateGoatConnectivity(
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		let connectivity = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				const goatNeighbors = neighbors.filter((n) => state.board[n] === 'GOAT').length;
				connectivity += goatNeighbors;
			}
		}
		return connectivity;
	}

	private static evaluateGoatTrapFormation(
		state: GameState,
		adjacency: Map<number, number[]>,
		_points: Point[]
	): number {
		let trapScore = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				// Simple mobility check without expensive move generation
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				const goatNeighbors = neighbors.filter(n => state.board[n] === 'GOAT').length;
				
				// Tiger with limited mobility
				if (freeNeighbors <= 1) trapScore += 100;
				else if (freeNeighbors <= 2) trapScore += 50;
				
				// Tiger surrounded by goats
				trapScore += goatNeighbors * 25;
			}
		}
		return trapScore;
	}

	private static evaluateGoatDefensiveCoordination(
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		let coordinationScore = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const defensiveValue = PositionEvaluator.calculateDefensiveValue(i, state, adjacency);
				coordinationScore += defensiveValue;
				if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					const protectionValue = PositionEvaluator.calculateProtectionValue(i, state, adjacency);
					coordinationScore += protectionValue * 2;
				}
			}
		}
		return coordinationScore;
	}

	private static evaluateTigerCoordination(
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		let coordination = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === 'GOAT') {
						const goatNeighbors = adjacency.get(neighbor) || [];
						const supportingTigers = goatNeighbors.filter(
							(n) => n !== i && state.board[n] === 'TIGER'
						).length;
						coordination += supportingTigers;
					}
				}
			}
		}
		return coordination;
	}

	// --------------------------- Low-level helpers ---------------------------
	private static getBlockingPositions(
		tigerPos: number,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		const neighbors = adjacency.get(tigerPos) || [];
		return neighbors.filter((n) => state.board[n] === 'GOAT').length;
	}

	private static calculateDefensiveValue(
		goatPos: number,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		const neighbors = adjacency.get(goatPos) || [];
		let defensiveValue = 0;
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				defensiveValue -= 30;
			} else if (state.board[neighbor] === null) {
				const secondLevelNeighbors = adjacency.get(neighbor) || [];
				const nearbyTigers = secondLevelNeighbors.filter(
					(pos) => state.board[pos] === 'TIGER'
				).length;
				defensiveValue -= nearbyTigers * 2;
			} else if (state.board[neighbor] === 'GOAT') {
				defensiveValue += 5;
			}
		}
		return defensiveValue;
	}

	private static calculateProtectionValue(
		pos: number,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		const neighbors = adjacency.get(pos) || [];
		let protectionValue = 0;
		const supportingGoats = neighbors.filter((n) => state.board[n] === 'GOAT').length;
		protectionValue += supportingGoats * 8;
		if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(pos)) protectionValue += 20;
		return protectionValue;
	}

	private static calculatePostCaptureAdvantage(
		goatPos: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		_points: Point[]
	): number {
		// Simplified calculation without expensive move generation
		let advantageScore = 0;
		
		// Check if removing this goat would trap nearby tigers
		const neighbors = adjacency.get(goatPos) || [];
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				// Count how many free positions this tiger would have after capture
				const tigerNeighbors = adjacency.get(neighbor) || [];
				const freePositions = tigerNeighbors.filter(n => 
					n !== goatPos && state.board[n] === null
				).length;
				
				if (freePositions === 0) advantageScore += 200; // Tiger would be trapped
				else if (freePositions <= 1) advantageScore += 100; // Tiger would be severely limited
			}
		}
		
		return advantageScore;
	}

	/**
	 * Check if a goat at a given position can be immediately captured by tigers
	 */
	private static checkImmediateCaptureThreats(
		goatPos: number,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		let threats = 0;
		const neighbors = adjacency.get(goatPos) || [];
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				// Check if this tiger can capture the goat
				const goatNeighbors = adjacency.get(goatPos) || [];
				const possibleLandings = goatNeighbors.filter(pos => 
					pos !== neighbor && state.board[pos] === null
				);
				
				if (possibleLandings.length > 0) {
					threats += 1;
				}
			}
		}
		
		return threats;
	}

	/**
	 * Check if placing a goat at a position would result in immediate capture
	 * This matches the logic in MoveGenerator for consistency
	 */
	private static wouldBeImmediatelyCaptured(
		position: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): boolean {
		const neighbors = adjacency.get(position) || [];
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				// Check if this tiger can capture the goat at 'position'
				const goatNeighbors = adjacency.get(position) || [];
				
				for (const landing of goatNeighbors) {
					if (landing !== neighbor && state.board[landing] === null) {
						// Verify the capture line is geometrically valid
						if (!PositionEvaluator.isValidCaptureLine(neighbor, position, landing, points)) {
							continue;
						}
						return true; // This goat would be immediately capturable
					}
				}
			}
		}
		
		return false;
	}

	/**
	 * Check if a capture line is geometrically valid (straight line)
	 */
	private static isValidCaptureLine(
		from: number,
		middle: number,
		to: number,
		points: Point[]
	): boolean {
		if (!points[from] || !points[middle] || !points[to]) return false;

		const p1 = points[from];
		const p2 = points[middle];
		const p3 = points[to];

		const dx1 = p2.x - p1.x;
		const dy1 = p2.y - p1.y;
		const dx2 = p3.x - p2.x;
		const dy2 = p3.y - p2.y;

		const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
		return crossProduct < 0.001;
	}
}
