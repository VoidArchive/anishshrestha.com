import type { GameState, Point } from '../bagchal';
import type { Move } from './types';

/**
 * Move generation utilities for Bagchal AI
 */
export class MoveGenerator {
	/**
	 * Gets all valid moves for the current state
	 */
	static getValidMoves(state: GameState, adjacency: Map<number, number[]>, points: Point[]): Move[] {
		const moves: Move[] = [];

		if (state.turn === 'GOAT') {
			if (state.phase === 'PLACEMENT') {
				// Placement moves
				for (let i = 0; i < state.board.length; i++) {
					if (state.board[i] === null) {
						moves.push({
							from: null,
							to: i,
							moveType: 'PLACEMENT'
						});
					}
				}
			} else {
				// Movement moves
				moves.push(...this.getGoatMoves(state, adjacency));
			}
		} else {
			// Tiger moves (both placement and movement phases)
			moves.push(...this.getTigerMoves(state, adjacency, points));
		}

		return moves;
	}

	/**
	 * Gets all valid goat moves
	 */
	static getGoatMoves(state: GameState, adjacency: Map<number, number[]>): Move[] {
		const moves: Move[] = [];

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT') {
				const neighbors = adjacency.get(i) || [];
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						moves.push({
							from: i,
							to: neighbor,
							moveType: 'MOVEMENT'
						});
					}
				}
			}
		}

		return moves;
	}

	/**
	 * Gets all valid tiger moves
	 */
	static getTigerMoves(state: GameState, adjacency: Map<number, number[]>, points: Point[]): Move[] {
		const moves: Move[] = [];

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						// Simple movement
						moves.push({
							from: i,
							to: neighbor,
							moveType: 'MOVEMENT'
						});
					} else if (state.board[neighbor] === 'GOAT') {
						// Potential capture - check if there's an empty space beyond the goat
						const captureTargets = this.findCaptureTargets(i, neighbor, state, adjacency, points);
						for (const target of captureTargets) {
							moves.push({
								from: i,
								to: target,
								jumpedGoatId: neighbor,
								moveType: 'CAPTURE'
							});
						}
					}
				}
			}
		}

		return moves;
	}

	/**
	 * Get valid moves for a specific tiger position
	 */
	static getTigerMovesForPosition(tigerPos: number, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number[] {
		const moves: number[] = [];
		const neighbors = adjacency.get(tigerPos) || [];
		
		for (const neighbor of neighbors) {
			if (state.board[neighbor] === null) {
				moves.push(neighbor);
			} else if (state.board[neighbor] === 'GOAT') {
				const captureTargets = this.findCaptureTargets(tigerPos, neighbor, state, adjacency, points);
				moves.push(...captureTargets);
			}
		}
		
		return moves;
	}

	/**
	 * Finds valid capture target positions for a tiger
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
	 * Checks if a capture move is in a valid straight line
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