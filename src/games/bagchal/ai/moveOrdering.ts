import type { GameState, Point } from '$games/bagchal/rules';
import type { Move } from './types';
import { MoveGenerator } from './moveGeneration';

/**
 * Advanced move ordering to improve alpha-beta pruning efficiency for Bagchal.
 */
export class MoveOrderer {
	// Strategic position sets
	private static readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);
	private static readonly CENTER_POSITIONS = new Set([12]);
	private static readonly CROSS_POSITIONS = new Set([6, 8, 16, 18]);

	/**
	 * Orders moves for optimal alpha-beta pruning
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
				aScore = this.calculateTigerMoveScore(a, state, adjacency, points);
				bScore = this.calculateTigerMoveScore(b, state, adjacency, points);
			} else {
				aScore = this.calculateGoatMoveScore(a, state, adjacency, points);
				bScore = this.calculateGoatMoveScore(b, state, adjacency, points);
			}
			return bScore - aScore;
		});
	}

	// --------------------------- Tiger ordering ---------------------------
	private static calculateTigerMoveScore(
		move: Move,
		_state: GameState,
		_adjacency: Map<number, number[]>,
		_points: Point[]
	): number {
		let score = 0;
		if (move.moveType === 'CAPTURE') score += 2000;
		if (this.CENTER_POSITIONS.has(move.to)) score += 300;
		if (this.STRATEGIC_POSITIONS.has(move.to)) score += 150;
		if (move.moveType === 'MOVEMENT') score += 50;
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
		if (move.moveType === 'PLACEMENT' || move.moveType === 'MOVEMENT') {
			const trapValue = this.calculateTrapCompletionValue(move, state, adjacency);
			score += trapValue * 1000;
			const blockValue = this.calculateCaptureBlockingValue(move, state, adjacency, points);
			score += blockValue * 800;
			if (this.CENTER_POSITIONS.has(move.to)) score += 600;
			if (this.STRATEGIC_POSITIONS.has(move.to)) score += 300;
			const coordinationValue = this.calculateMoveCoordinationValue(move, state, adjacency);
			score += coordinationValue * 200;
			const sacrificeValue = this.calculateMoveSacrificeValue(move, state, adjacency, points);
			score += sacrificeValue * 150;
			const mobilityReduction = this.calculateTigerMobilityReduction(
				move,
				state,
				adjacency,
				points
			);
			score += mobilityReduction * 400;
		}
		return score;
	}

	// --------------------------- Goat helper heuristics ---------------------------
	private static calculateTrapCompletionValue(
		move: Move,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		const testState = { ...state, board: [...state.board] } as GameState;
		if (move.from !== null) testState.board[move.from] = null;
		testState.board[move.to] = 'GOAT';
		let trapValue = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					state,
					adjacency,
					[]
				).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					testState,
					adjacency,
					[]
				).length;
				if (newMobility === 0 && originalMobility > 0) trapValue += 5;
				else if (newMobility < originalMobility) trapValue += originalMobility - newMobility;
			}
		}
		return trapValue;
	}

	private static calculateCaptureBlockingValue(
		move: Move,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number {
		let blockValue = 0;
		const neighbors = adjacency.get(move.to) || [];
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'GOAT') {
				const goatNeighbors = adjacency.get(neighbor) || [];
				for (const potential of goatNeighbors) {
					if (state.board[potential] === 'TIGER') {
						const captureTargets = this.findCaptureTargets(
							potential,
							neighbor,
							state,
							adjacency,
							points
						);
						if (captureTargets.length > 0) blockValue += 3;
					}
				}
			}
		}
		return blockValue;
	}

	private static calculateMoveCoordinationValue(
		move: Move,
		state: GameState,
		adjacency: Map<number, number[]>
	): number {
		const neighbors = adjacency.get(move.to) || [];
		const supportingGoats = neighbors.filter((n) => state.board[n] === 'GOAT').length;
		let coordination = supportingGoats;
		if (supportingGoats >= 2) coordination += 2; // formation bonus
		return coordination;
	}

	private static calculateMoveSacrificeValue(
		move: Move,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number {
		const goatCount = state.board.filter((p) => p === 'GOAT').length;
		if (goatCount <= 12) return 0;
		const neighbors = adjacency.get(move.to) || [];
		let sacrificeValue = 0;
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				const advantage = this.calculatePostCaptureAdvantage(move.to, state, adjacency, points);
				if (advantage > 150) sacrificeValue += Math.min(2, advantage / 100);
			}
		}
		return sacrificeValue;
	}

	private static calculateTigerMobilityReduction(
		move: Move,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number {
		const testState = { ...state, board: [...state.board] } as GameState;
		if (move.from !== null) testState.board[move.from] = null;
		testState.board[move.to] = 'GOAT';
		let totalReduction = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					state,
					adjacency,
					points
				).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					testState,
					adjacency,
					points
				).length;
				totalReduction += Math.max(0, originalMobility - newMobility);
			}
		}
		return totalReduction;
	}

	// --------------------------- Shared helpers ---------------------------
	private static calculatePostCaptureAdvantage(
		goatPos: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number {
		const testState = {
			...state,
			board: [...state.board],
			goatsCaptured: state.goatsCaptured + 1
		} as GameState;
		testState.board[goatPos] = null;
		let advantageScore = 0;
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const originalMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					state,
					adjacency,
					points
				).length;
				const newMobility = MoveGenerator.getTigerMovesForPosition(
					i,
					testState,
					adjacency,
					points
				).length;
				if (newMobility < originalMobility) advantageScore += (originalMobility - newMobility) * 30;
				if (newMobility === 0) advantageScore += 200;
			}
		}
		return advantageScore;
	}

	// Straight-line capture helper (same as in moveGeneration)
	private static findCaptureTargets(
		tigerPos: number,
		goatPos: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number[] {
		const targets: number[] = [];
		const goatNeighbors = adjacency.get(goatPos) || [];
		for (const target of goatNeighbors) {
			if (target !== tigerPos && state.board[target] === null) {
				if (this.isValidCaptureLine(tigerPos, goatPos, target, points)) targets.push(target);
			}
		}
		return targets;
	}

	private static isValidCaptureLine(
		from: number,
		middle: number,
		to: number,
		points: Point[]
	): boolean {
		const p1 = points[from];
		const p2 = points[middle];
		const p3 = points[to];
		const dx1 = p2.x - p1.x;
		const dy1 = p2.y - p1.y;
		const dx2 = p3.x - p2.x;
		const dy2 = p3.y - p2.y;
		return Math.abs(dx1 * dy2 - dy1 * dx2) < 0.001;
	}
}
