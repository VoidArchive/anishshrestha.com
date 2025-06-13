import type { GameState, Point } from '$games/bagchal/rules';
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
						
						// CRITICAL FIX: In CLASSIC mode, filter out suicide placement moves
						if (state.mode === 'CLASSIC') {
							const wouldBeCaptured = MoveGenerator.wouldBeImmediatelyCaptured(i, state, adjacency);
							if (wouldBeCaptured) {
								continue; // Skip this move - it's a suicide move
							}
						}
						
						moves.push(move);
					}
				}
			} else {
				moves.push(...this.getGoatMoves(state, adjacency));
			}
		} else {
			moves.push(...this.getTigerMoves(state, adjacency, points));
		}

		return moves;
	}

	static getGoatMoves(state: GameState, adjacency: Map<number, number[]>): Move[] {
		const moves: Move[] = [];

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						moves.push({ from: i, to: neighbor, moveType: 'MOVEMENT' });
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

	static getTigerMovesForPosition(
		tigerPos: number,
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): number[] {
		const moves: number[] = [];
		const neighbors = adjacency.get(tigerPos) || [];

		for (const neighbor of neighbors) {
			if (state.board[neighbor] === null) {
				moves.push(neighbor);
			} else if (state.board[neighbor] === 'GOAT') {
				const captureTargets = this.findCaptureTargets(
					tigerPos,
					neighbor,
					state,
					adjacency,
					points
				);
				moves.push(...captureTargets);
			}
		}

		return moves;
	}

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
	private static wouldBeImmediatelyCaptured(
		position: number,
		state: GameState,
		adjacency: Map<number, number[]>
	): boolean {
		const neighbors = adjacency.get(position) || [];
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === 'TIGER') {
				// Check if this tiger can capture the goat at 'position'
				const goatNeighbors = adjacency.get(position) || [];
				const possibleLandings = goatNeighbors.filter(pos => 
					pos !== neighbor && state.board[pos] === null
				);
				
				if (possibleLandings.length > 0) {
					return true; // This goat would be immediately capturable
				}
			}
		}
		
		return false;
	}
}
