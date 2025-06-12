import type { GameState, Point } from '../bagchal';
import type { Move, TranspositionEntry } from './types';
import { checkIfTigersAreTrapped, getBoardPositionHash, checkForDraw } from '../bagchal';
import { MoveGenerator } from './moveGeneration';
import { PositionEvaluator } from './evaluation';
import { MoveOrderer } from './moveOrdering';

/**
 * Game evaluator with configurable parameters for Minimax algorithm
 */
export class GameEvaluator {
	public readonly maxDepth: number;
	
	// Transposition table for memoization
	private transpositionTable = new Map<string, TranspositionEntry>();
	private maxTableSize = 50000; // Increased for better performance

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
		// More comprehensive hash including position history length for draw detection
		const historyLength = state.positionHistory.length;
		return `${state.board.join('')}_${state.turn}_${state.phase}_${state.goatsPlaced}_${state.goatsCaptured}_${historyLength}`;
	}

	/**
	 * Cache a result in the transposition table with better replacement strategy
	 */
	private cacheResult(stateHash: string, score: number, move: Move | null, depth: number, nodeType: 'exact' | 'lower' | 'upper'): void {
		// Always replace strategy for entries with lower depth
		const existing = this.transpositionTable.get(stateHash);
		if (existing && existing.depth > depth) {
			return; // Keep deeper search result
		}
		
		// Prevent table from growing too large
		if (this.transpositionTable.size >= this.maxTableSize) {
			// Clear 25% of entries (simple LRU approximation)
			const keys = Array.from(this.transpositionTable.keys());
			const deleteCount = Math.floor(keys.length * 0.25);
			for (let i = 0; i < deleteCount; i++) {
				this.transpositionTable.delete(keys[i]);
			}
		}
		
		this.transpositionTable.set(stateHash, { score, move, depth, nodeType });
	}

	/**
	 * Main Minimax algorithm with Alpha-Beta pruning and improved memoization
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
		const originalAlpha = alpha;
		const originalBeta = beta;
		
		// Check transposition table with proper bounds
		const stateHash = this.getStateHash(state);
		const cached = this.transpositionTable.get(stateHash);
		if (cached && cached.depth >= depth) {
			if (cached.nodeType === 'exact') {
				return [cached.score, cached.move];
			} else if (cached.nodeType === 'lower' && cached.score >= beta) {
				return [cached.score, cached.move];
			} else if (cached.nodeType === 'upper' && cached.score <= alpha) {
				return [cached.score, cached.move];
			}
		}

		// Terminal state check
		if (depth === 0 || this.isGameOver(state, adjacency, points)) {
			const score = PositionEvaluator.evaluatePosition(state, adjacency, points);
			this.cacheResult(stateHash, score, null, depth, 'exact');
			return [score, null];
		}

		const validMoves = MoveGenerator.getValidMoves(state, adjacency, points);
		
		// No valid moves available - should not happen in Bagchal, but safety check
		if (validMoves.length === 0) {
			const score = maximizing ? -50000 : 50000;
			return [score, null];
		}

		// Order moves for better pruning efficiency
		const orderedMoves = MoveOrderer.orderMoves(validMoves, state, maximizing, adjacency, points);

		let bestMove: Move | null = null;
		let bestScore: number;

		if (maximizing) {
			// Tigers (maximizing player)
			bestScore = -Infinity;
			
			for (const move of orderedMoves) {
				const newState = this.applyMove(state, move, adjacency, points);
				const [evaluation] = this.minimax(newState, depth - 1, alpha, beta, false, adjacency, points);
				
				if (evaluation > bestScore) {
					bestScore = evaluation;
					bestMove = move;
				}
				
				alpha = Math.max(alpha, evaluation);
				
				// Alpha-beta pruning
				if (beta <= alpha) {
					break;
				}
			}
		} else {
			// Goats (minimizing player)
			bestScore = Infinity;
			
			for (const move of orderedMoves) {
				const newState = this.applyMove(state, move, adjacency, points);
				const [evaluation] = this.minimax(newState, depth - 1, alpha, beta, true, adjacency, points);
				
				if (evaluation < bestScore) {
					bestScore = evaluation;
					bestMove = move;
				}
				
				beta = Math.min(beta, evaluation);
				
				// Alpha-beta pruning
				if (beta <= alpha) {
					break;
				}
			}
		}
		
		// Determine node type for transposition table
		let nodeType: 'exact' | 'lower' | 'upper';
		if (bestScore <= originalAlpha) {
			nodeType = 'upper';
		} else if (bestScore >= originalBeta) {
			nodeType = 'lower';
		} else {
			nodeType = 'exact';
		}
		
		// Cache the result
		this.cacheResult(stateHash, bestScore, bestMove, depth, nodeType);
		return [bestScore, bestMove];
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

		// Update position tracking for draw detection
		if (newState.phase === 'MOVEMENT') {
			const positionHash = getBoardPositionHash(newState);
			const currentCount = newState.positionCounts.get(positionHash) || 0;
			newState.positionCounts.set(positionHash, currentCount + 1);
			newState.positionHistory.push(positionHash);
			
			// Limit history size
			if (newState.positionHistory.length > 100) {
				const oldPosition = newState.positionHistory.shift()!;
				const oldCount = newState.positionCounts.get(oldPosition) || 0;
				if (oldCount <= 1) {
					newState.positionCounts.delete(oldPosition);
				} else {
					newState.positionCounts.set(oldPosition, oldCount - 1);
				}
			}
		}

		// Check for win conditions in the correct order
		if (!newState.winner) {
			// Check tiger win first
			if (newState.goatsCaptured >= 5) {
				newState.winner = 'TIGER';
			}
			// Then check goat win
			else if (checkIfTigersAreTrapped(newState, adjacency, points)) {
				newState.winner = 'GOAT';
			}
			// Finally check for draw
			else if (newState.phase === 'MOVEMENT' && checkForDraw(newState)) {
				newState.winner = 'DRAW';
			}
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
		if (state.phase === 'MOVEMENT' && checkForDraw(state)) return true;
		return false;
	}
} 