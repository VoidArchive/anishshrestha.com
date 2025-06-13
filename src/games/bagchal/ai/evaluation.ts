import type { GameState, Point } from '$games/bagchal/rules';
import type { EvaluationWeights, StrategicPositions } from './types';

/**
 * Position evaluation for Bagchal AI.
 */
export class PositionEvaluator {
	// Evaluation weights - rebalanced to prevent early sacrifices and improve goat play
	private static readonly WEIGHTS: EvaluationWeights = {
		GOAT_CAPTURED: 300, // Increased from 200 to heavily penalize goat losses
		TIGER_MOBILITY: 6,
		POSITION_CONTROL: 4,
		ENDGAME: 50000,
		GOAT_MOBILITY: 3, // Increased to value goat mobility more
		TIGER_TRAPPED: 150,
		GOAT_CONNECTIVITY: 12, // Increased to promote better coordination
		TIGER_COORDINATION: 20,
		CENTRALIZATION: 15,
		TEMPO: 25,
		CAPTURE_THREAT: 40
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

		// CRITICAL FIX: In CLASSIC mode, immediately reject any position where goats can be captured
		if (state.mode === 'CLASSIC') {
			// Check if any goat can be immediately captured by tigers
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === 'GOAT') {
					const captureThreats = PositionEvaluator.checkImmediateCaptureThreats(i, state, adjacency);
					if (captureThreats > 0) {
						// Return extremely negative score for goats - this position is unacceptable
						return -PositionEvaluator.WEIGHTS.ENDGAME * 10;
					}
				}
			}
		}

		let score = 0;

		// Heavily penalize captured goats, especially early in the game
		const earlyGamePenalty = state.goatsPlaced < 15 ? 5.0 : state.goatsPlaced < 18 ? 3.0 : 1.0; // Much stronger early penalty
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

		// Simple tiger mobility calculation without expensive move generation
		let tigerMobility = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				tigerMobility += freeNeighbors;
			}
		}
		score += tigerMobility * PositionEvaluator.WEIGHTS.TIGER_MOBILITY;

		// Strategic position control
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				if (PositionEvaluator.POSITIONS.STRATEGIC_POSITIONS.has(i)) {
					score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 1.5;
				}
				if (PositionEvaluator.POSITIONS.CENTER_POSITIONS.has(i)) {
					score -= PositionEvaluator.WEIGHTS.POSITION_CONTROL * 2;
				}
				
				// CRITICAL: Check for immediate capture threats for this goat
				const captureThreats = PositionEvaluator.checkImmediateCaptureThreats(i, state, adjacency);
				if (captureThreats > 0) {
					// Massive penalty for placing goats where they can be immediately captured
					score += captureThreats * 500; // This will make the move very unattractive
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

		// Simple tiger threat analysis without expensive move generation
		let tigerThreats = 0;
		let tigerMobility = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				const goatNeighbors = neighbors.filter(n => state.board[n] === 'GOAT');
				
				tigerMobility += freeNeighbors;
				
				// Check for capture threats (simple version)
				for (const goatPos of goatNeighbors) {
					const goatNeighbors = adjacency.get(goatPos) || [];
					const potentialLandings = goatNeighbors.filter(n => 
						n !== i && state.board[n] === null
					).length;
					if (potentialLandings > 0) tigerThreats += 1;
				}
			}
		}
		
		score += tigerMobility * PositionEvaluator.WEIGHTS.TIGER_MOBILITY;
		score += tigerThreats * PositionEvaluator.WEIGHTS.CAPTURE_THREAT;

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

		// Check if tigers are getting trapped (simple version)
		let trappedTigers = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				const freeNeighbors = neighbors.filter(n => state.board[n] === null).length;
				if (freeNeighbors === 0) {
					trappedTigers += 1;
					score -= PositionEvaluator.WEIGHTS.ENDGAME; // Heavily penalize trapped tigers
				} else if (freeNeighbors <= 1) {
					score -= PositionEvaluator.WEIGHTS.TIGER_TRAPPED;
				}
			}
		}

		// Enhanced strategic position control
		score += PositionEvaluator.evaluatePositionalControl(state);

		// Basic goat strategy evaluation (no sacrifice encouragement)
		score -=
			PositionEvaluator.evaluateGoatConnectivity(state, adjacency) *
			PositionEvaluator.WEIGHTS.GOAT_CONNECTIVITY;
		score -= PositionEvaluator.evaluateGoatTrapFormation(state, adjacency, _points) * 1.2;
		score -= PositionEvaluator.evaluateGoatDefensiveCoordination(state, adjacency) * 1.0;

		// Tiger coordination
		score +=
			PositionEvaluator.evaluateTigerCoordination(state, adjacency) *
			PositionEvaluator.WEIGHTS.TIGER_COORDINATION;

		// Progressive aggression only in very late game
		const totalGoats = 20 - state.goatsCaptured;

		if (totalGoats <= 8) {
			// Only in very late game: some aggression
			score += tigerThreats * PositionEvaluator.WEIGHTS.TEMPO;
		}

		if (totalGoats <= 6) {
			// Endgame: maximum aggression
			score += tigerThreats * 100;
			
			if (tigerThreats === 0 && tigerMobility > 0) {
				score -= 30;
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
}
