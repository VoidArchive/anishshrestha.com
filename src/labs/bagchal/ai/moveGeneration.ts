import type { GameState, Point } from '$labs/bagchal/rules';
import type { Move } from './types';

export class MoveGenerator {
	static getValidMoves(
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): Move[] {
		const moves: Move[] = [];

		if (state.turn === 'GOAT') {
			if (state.phase === 'PLACEMENT') {
				for (let i = 0; i < state.board.length; i++) {
					if (state.board[i] === null) {
						const move: Move = { from: null, to: i, moveType: 'PLACEMENT' };

						// Skip moves that would be immediately captured in easy mode
						if (state.mode === 'EASY') {
							const wouldBeCaptured = MoveGenerator.wouldBeImmediatelyCaptured(
								i,
								state,
								adjacency,
								points
							);
							if (wouldBeCaptured) {
								continue; // Skip capturable moves
							}
						}

						moves.push(move);
					}
				}
			} else {
				moves.push(...MoveGenerator.getGoatMoves(state, adjacency, points));
			}
		} else {
			moves.push(...MoveGenerator.getTigerMoves(state, adjacency, points));
		}

		return moves;
	}

	static getGoatMoves(
		state: GameState,
		adjacency: Map<number, number[]>,
		points?: Point[]
	): Move[] {
		const moves: Move[] = [];

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						const move: Move = { from: i, to: neighbor, moveType: 'MOVEMENT' };

						// Skip moves that would be immediately captured in easy mode
						if (state.mode === 'EASY' && points) {
							const wouldBeCaptured = MoveGenerator.wouldBeImmediatelyCaptured(
								neighbor,
								state,
								adjacency,
								points
							);
							if (wouldBeCaptured) {
								continue; // Skip capturable moves
							}
						}

						moves.push(move);
					}
				}
			}
		}

		return moves;
	}

	static getTigerMoves(
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): Move[] {
		const moves: Move[] = [];

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];

				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						moves.push({ from: i, to: neighbor, moveType: 'MOVEMENT' });
					} else if (state.board[neighbor] === 'GOAT') {
						const captureTargets = this.findCaptureTargets(i, neighbor, state, adjacency, points);
						for (const target of captureTargets) {
							moves.push({ from: i, to: target, jumpedGoatId: neighbor, moveType: 'CAPTURE' });
						}
					}
				}
			}
		}

		return moves;
	}

	// Removed unused method: getTigerMovesForPosition
	// This was a helper method that was never called

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
				if (this.isValidCaptureLine(tigerPos, goatPos, target, points)) {
					targets.push(target);
				}
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

	/**
	 * Check if placing a goat at a position would result in immediate capture
	 */
	static wouldBeImmediatelyCaptured(
		position: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): boolean {
		if (state.mode === 'EASY' && points) {
			const neighbors = adjacency.get(position) || [];

			for (const neighbor of neighbors) {
				if (state.board[neighbor] === 'TIGER') {
					// Check if this tiger can capture the goat at 'position'
					const goatNeighbors = adjacency.get(position) || [];

					for (const landing of goatNeighbors) {
						if (landing !== neighbor && state.board[landing] === null) {
							// If points are provided, verify the capture line is geometrically valid
							if (!this.isValidCaptureLine(neighbor, position, landing, points)) {
								continue;
							}
							return true; // This goat would be immediately capturable
						}
					}
				}
			}
		}

		return false;
	}
}
