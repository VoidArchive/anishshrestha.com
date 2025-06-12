import type { GameState, Point, CaptureInfo } from './bagchal';
import { executeMove, checkIfTigersAreTrapped, getBoardPositionHash, checkForDraw } from './bagchal';

/**
 * Represents a move in the Bagchal game
 */
export interface Move {
	from: number | null; // null for placement moves
	to: number;
	jumpedGoatId?: number | null; // for tiger capture moves
	moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

/**
 * Game evaluator with configurable parameters for Minimax algorithm
 */
export class GameEvaluator {
	public readonly maxDepth: number;
	
	// Transposition table for memoization
	private transpositionTable = new Map<string, { score: number; move: Move | null; depth: number }>();
	private maxTableSize = 10000; // Prevent memory bloat
	
	// Evaluation weights
	private readonly WEIGHTS = {
		GOAT_CAPTURED: 100,     // Points per captured goat (for tigers)
		TIGER_MOBILITY: 10,     // Points per available tiger move
		POSITION_CONTROL: 5,    // Points for strategic positions
		ENDGAME: 1000,          // Points for win/loss states
		GOAT_MOBILITY: 8,       // Points per available goat move (for goats)
		TIGER_TRAPPED: 50,      // Penalty for trapped tigers
	};

	// Strategic positions (corners and center have higher value)
	private readonly STRATEGIC_POSITIONS = new Set([0, 2, 4, 10, 12, 14, 20, 22, 24]);

	constructor(maxDepth: number = 7) {
		this.maxDepth = maxDepth;
	}

	/**
	 * Clear the transposition table (call between games)
	 */
	public clearCache(): void {
		this.transpositionTable.clear();
	}

	/**
	 * Generate a unique hash for the game state
	 */
	private getStateHash(state: GameState): string {
		return `${state.board.join('')}_${state.turn}_${state.phase}_${state.goatsPlaced}_${state.goatsCaptured}`;
	}

	/**
	 * Cache a result in the transposition table
	 */
	private cacheResult(stateHash: string, score: number, move: Move | null, depth: number): void {
		// Prevent table from growing too large
		if (this.transpositionTable.size >= this.maxTableSize) {
			// Clear oldest entries (simple strategy)
			const keys = Array.from(this.transpositionTable.keys());
			for (let i = 0; i < keys.length / 2; i++) {
				this.transpositionTable.delete(keys[i]);
			}
		}
		
		this.transpositionTable.set(stateHash, { score, move, depth });
	}

	/**
	 * Main Minimax algorithm with Alpha-Beta pruning and memoization
	 * @param state Current game state
	 * @param depth Current search depth
	 * @param alpha Alpha value for pruning
	 * @param beta Beta value for pruning
	 * @param maximizing True if maximizing player (tigers), false for minimizing (goats)
	 * @param adjacency Adjacency map for the board
	 * @param points Point definitions for the board
	 * @returns Tuple of [score, bestMove]
	 */
	public minimax(
		state: GameState,
		depth: number,
		alpha: number,
		beta: number,
		maximizing: boolean,
		adjacency: Map<number, number[]>,
		points: Point[]
	): [number, Move | null] {
		// Check transposition table
		const stateHash = this.getStateHash(state);
		const cached = this.transpositionTable.get(stateHash);
		if (cached && cached.depth >= depth) {
			return [cached.score, cached.move];
		}

		// Terminal state check
		if (depth === 0 || this.isGameOver(state, adjacency, points)) {
			const score = this.evaluatePosition(state, adjacency, points);
			this.cacheResult(stateHash, score, null, depth);
			return [score, null];
		}

		const validMoves = this.getValidMoves(state, adjacency, points);
		
		// No valid moves available
		if (validMoves.length === 0) {
			return [this.evaluatePosition(state, adjacency, points), null];
		}

		// Order moves for better pruning efficiency
		const orderedMoves = this.orderMoves(validMoves, state, maximizing);

		let bestMove: Move | null = null;

		if (maximizing) {
			// Tigers (maximizing player)
			let maxEval = -Infinity;
			
			for (const move of orderedMoves) {
				const newState = this.applyMove(state, move, adjacency, points);
				const [evaluation] = this.minimax(newState, depth - 1, alpha, beta, false, adjacency, points);
				
				if (evaluation > maxEval) {
					maxEval = evaluation;
					bestMove = move;
				}
				
				alpha = Math.max(alpha, evaluation);
				
				// Alpha-beta pruning
				if (beta <= alpha) {
					break;
				}
			}
			
			// Cache the result
			this.cacheResult(stateHash, maxEval, bestMove, depth);
			return [maxEval, bestMove];
		} else {
			// Goats (minimizing player)
			let minEval = Infinity;
			
			for (const move of orderedMoves) {
				const newState = this.applyMove(state, move, adjacency, points);
				const [evaluation] = this.minimax(newState, depth - 1, alpha, beta, true, adjacency, points);
				
				if (evaluation < minEval) {
					minEval = evaluation;
					bestMove = move;
				}
				
				beta = Math.min(beta, evaluation);
				
				// Alpha-beta pruning
				if (beta <= alpha) {
					break;
				}
			}
			
			// Cache the result
			this.cacheResult(stateHash, minEval, bestMove, depth);
			return [minEval, bestMove];
		}
	}

	/**
	 * Evaluates the current position and returns a score
	 * Positive scores favor tigers, negative scores favor goats
	 */
	private evaluatePosition(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		// Check for terminal states first
		if (state.winner === 'TIGER') {
			return this.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'GOAT') {
			return -this.WEIGHTS.ENDGAME;
		}
		if (state.winner === 'DRAW') {
			return 0; // Draw is neutral
		}

		let score = 0;

		// Goats captured (heavily favors tigers)
		score += state.goatsCaptured * this.WEIGHTS.GOAT_CAPTURED;

		// Phase-specific evaluation
		if (state.phase === 'PLACEMENT') {
			score += this.evaluatePlacementPhase(state);
		} else {
			score += this.evaluateMovementPhase(state, adjacency, points);
		}

		return score;
	}

	/**
	 * Evaluation specific to placement phase
	 */
	private evaluatePlacementPhase(state: GameState): number {
		let score = 0;

		// Tiger mobility during placement
		const tigerMoves = this.getTigerMoves(state, new Map(), []);
		score += tigerMoves.length * this.WEIGHTS.TIGER_MOBILITY;

		// Strategic position control
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'GOAT' && this.STRATEGIC_POSITIONS.has(i)) {
				score -= this.WEIGHTS.POSITION_CONTROL; // Goats controlling strategic positions is bad for tigers
			}
		}

		// Goats placed (more goats = more constraints for tigers)
		score -= state.goatsPlaced * 2;

		return score;
	}

	/**
	 * Evaluation specific to movement phase
	 */
	private evaluateMovementPhase(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
		let score = 0;

		// Tiger mobility
		const tigerMoves = this.getTigerMoves(state, adjacency, points);
		score += tigerMoves.length * this.WEIGHTS.TIGER_MOBILITY;

		// Goat mobility (fewer goat moves is better for tigers)
		const goatMoves = this.getGoatMoves(state, adjacency);
		score -= goatMoves.length * this.WEIGHTS.GOAT_MOBILITY;

		// Check if tigers are getting trapped
		if (checkIfTigersAreTrapped(state, adjacency, points)) {
			score -= this.WEIGHTS.ENDGAME; // Very bad for tigers
		}

		// Individual tiger trap evaluation
		const trapCount = this.countTrappedTigers(state, adjacency);
		score -= trapCount * this.WEIGHTS.TIGER_TRAPPED;

		// Strategic position control in movement phase
		for (let i = 0; i < state.board.length; i++) {
			if (this.STRATEGIC_POSITIONS.has(i)) {
				if (state.board[i] === 'TIGER') {
					score += this.WEIGHTS.POSITION_CONTROL;
				} else if (state.board[i] === 'GOAT') {
					score -= this.WEIGHTS.POSITION_CONTROL;
				}
			}
		}

		return score;
	}

	/**
	 * Gets all valid moves for the current state
	 */
	private getValidMoves(state: GameState, adjacency: Map<number, number[]>, points: Point[]): Move[] {
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
	private getGoatMoves(state: GameState, adjacency: Map<number, number[]>): Move[] {
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
	private getTigerMoves(state: GameState, adjacency: Map<number, number[]>, points: Point[]): Move[] {
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
	 * Finds valid capture target positions for a tiger
	 */
	private findCaptureTargets(tigerPos: number, goatPos: number, state: GameState, adjacency: Map<number, number[]>, points: Point[]): number[] {
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
	private isValidCaptureLine(from: number, middle: number, to: number, points: Point[]): boolean {
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

	/**
	 * Applies a move to the game state and returns a new state
	 */
	private applyMove(state: GameState, move: Move, adjacency: Map<number, number[]>, points: Point[]): GameState {
		const newState: GameState = {
			board: [...state.board],
			turn: state.turn,
			phase: state.phase,
			goatsPlaced: state.goatsPlaced,
			goatsCaptured: state.goatsCaptured,
			selectedPieceId: null,
			winner: state.winner,
			validMoves: [],
			message: '',
			positionHistory: [...state.positionHistory],
			positionCounts: new Map(state.positionCounts)
		};

		if (move.moveType === 'PLACEMENT') {
			newState.board[move.to] = 'GOAT';
			newState.goatsPlaced++;
			
			if (newState.goatsPlaced >= 20) {
				newState.phase = 'MOVEMENT';
			}
			
			newState.turn = 'TIGER';
		} else if (move.moveType === 'MOVEMENT') {
			if (move.from !== null) {
				newState.board[move.from] = null;
				newState.board[move.to] = state.board[move.from!];
			}
			
			newState.turn = newState.turn === 'GOAT' ? 'TIGER' : 'GOAT';
		} else if (move.moveType === 'CAPTURE') {
			if (move.from !== null && move.jumpedGoatId !== null && move.jumpedGoatId !== undefined) {
				newState.board[move.from] = null;
				newState.board[move.to] = 'TIGER';
				newState.board[move.jumpedGoatId] = null;
				newState.goatsCaptured++;
			}
			
			newState.turn = 'GOAT';
		}

		// Track position for draw detection (only during movement phase)
		if (!newState.winner && newState.phase === 'MOVEMENT') {
			const currentPosition = getBoardPositionHash(newState);
			newState.positionHistory.push(currentPosition);
			
			// Limit position history to prevent memory issues
			if (newState.positionHistory.length > 50) {
				newState.positionHistory.shift();
			}
			
			// Check for draw
			if (checkForDraw(newState)) {
				newState.winner = 'DRAW';
			}
		}

		// Check for win conditions
		if (!newState.winner && newState.goatsCaptured >= 5) {
			newState.winner = 'TIGER';
		}

		// Check if tigers are trapped (only if no winner yet)
		if (!newState.winner && checkIfTigersAreTrapped(newState, adjacency, points)) {
			newState.winner = 'GOAT';
		}

		return newState;
	}

	/**
	 * Checks if the game is over
	 */
	private isGameOver(state: GameState, adjacency: Map<number, number[]>, points: Point[]): boolean {
		if (state.winner) return true;
		if (state.goatsCaptured >= 5) return true;
		if (checkIfTigersAreTrapped(state, adjacency, points)) return true;
		return false;
	}

	/**
	 * Orders moves for better alpha-beta pruning efficiency
	 * Prioritizes: captures > strategic positions > center > other moves
	 */
	private orderMoves(moves: Move[], state: GameState, maximizing: boolean): Move[] {
		return moves.sort((a, b) => {
			// Prioritize captures for tigers (highest priority)
			if (maximizing) {
				if (a.moveType === 'CAPTURE' && b.moveType !== 'CAPTURE') return -1;
				if (b.moveType === 'CAPTURE' && a.moveType !== 'CAPTURE') return 1;
			}

			// Secondary: Strategic positions
			const aStrategic = this.STRATEGIC_POSITIONS.has(a.to) ? 2 : 0;
			const bStrategic = this.STRATEGIC_POSITIONS.has(b.to) ? 2 : 0;
			
			// Tertiary: Center positions (id 12 is center of 5x5 board)
			const aCenter = a.to === 12 ? 1 : 0;
			const bCenter = b.to === 12 ? 1 : 0;
			
			const aScore = aStrategic + aCenter;
			const bScore = bStrategic + bCenter;
			
			return bScore - aScore;
		});
	}

	/**
	 * Counts the number of trapped tigers
	 */
	private countTrappedTigers(state: GameState, adjacency: Map<number, number[]>): number {
		let trappedCount = 0;

		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === 'TIGER') {
				const neighbors = adjacency.get(i) || [];
				let hasValidMove = false;

				for (const neighbor of neighbors) {
					if (state.board[neighbor] === null) {
						hasValidMove = true;
						break;
					}
				}

				if (!hasValidMove) {
					trappedCount++;
				}
			}
		}

		return trappedCount;
	}
}

/**
 * Main AI interface for the computer player
 */
export class ComputerPlayer {
	private evaluator: GameEvaluator;

	constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
		const depths = { easy: 4, medium: 6, hard: 8 };
		this.evaluator = new GameEvaluator(depths[difficulty]);
	}

	/**
	 * Gets the best move for the computer player
	 */
	public getBestMove(
		state: GameState,
		adjacency: Map<number, number[]>,
		points: Point[]
	): Move | null {
		try {
			const maximizing = state.turn === 'TIGER';
			const [, bestMove] = this.evaluator.minimax(
				state,
				this.evaluator.maxDepth,
				-Infinity,
				Infinity,
				maximizing,
				adjacency,
				points
			);

			return bestMove;
		} catch (error) {
			// Environment-based logging
			if (import.meta.env.DEV) {
				console.error('Error in computer move calculation:', error);
			}
			return null;
		}
	}

	/**
	 * Changes the difficulty level and clears cache
	 */
	public setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
		const depths = { easy: 4, medium: 6, hard: 8 };
		this.evaluator = new GameEvaluator(depths[difficulty]);
	}

	/**
	 * Clear the AI cache (call between games)
	 */
	public clearCache(): void {
		this.evaluator.clearCache();
	}
} 