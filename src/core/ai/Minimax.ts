// Generic alpha-beta search usable by any game engine implementing BaseEngine
import type { BaseEngine } from '$core/engine/BaseEngine';

/**
 * Optional configuration for the Minimax search.
 */
export interface MinimaxOptions {
	/** Maximum search depth. Defaults to 4. */
	maxDepth?: number;
	/** Whether to use an in-memory transposition table. Defaults to true. */
	useTranspositionTable?: boolean;
	/** Maximum number of entries to keep in the transposition table. */
	tableSize?: number;
	/**
	 * A stable hashing function for game states. If omitted, JSON.stringify is used.
	 */
	stateHash?<S>(state: S): string;
	/**
	 * Optional move ordering function to improve alpha-beta pruning.
	 * Receives the list of legal moves for a node and should return them in the
	 * desired visiting order.
	 */
	orderMoves?: (moves: unknown[], state: unknown, maximizing: boolean) => unknown[];
}

interface TTEntry {
	score: number;
	depth: number;
}

/**
 * Generic alpha-beta minimax implementation that delegates game-specific logic to
 * a {@link BaseEngine}. The engine is responsible for:
 *   – generating valid moves
 *   – applying a move and returning a **new** state (immutably)
 *   – evaluating a terminal or quiescent position
 *
 * The Minimax class contains no game-specific code, so it can be reused across
 * different games (Bagchal, Tic-Tac-Toe, Chess, …) as long as a compatible
 * engine is provided.
 */
export class Minimax<M = unknown, S = unknown> {
	private readonly maxDepth: number;
	private readonly useTT: boolean;
	private readonly tableSize: number;
	private readonly tt = new Map<string, TTEntry>();
	private readonly hashFn: (state: S) => string;
	private readonly orderMovesFn?: (moves: M[], state: S, maximizing: boolean) => M[];

	constructor(
		private readonly engine: BaseEngine<M, S>,
		options: MinimaxOptions = {}
	) {
		this.maxDepth = options.maxDepth ?? 4;
		this.useTT = options.useTranspositionTable ?? true;
		this.tableSize = options.tableSize ?? 30_000;
		this.hashFn = options.stateHash ?? ((state) => JSON.stringify(state));
		if (options.orderMoves) {
			this.orderMovesFn = options.orderMoves as (moves: M[], state: S, maximizing: boolean) => M[];
		}
	}

	/** Clear the transposition table (useful between games). */
	public clearCache(): void {
		this.tt.clear();
	}

	/**
	 * Perform a search. If `overrideDepth` is provided, the algorithm searches to
	 * that depth instead of the instance's configured `maxDepth`. This is handy
	 * for iterative-deepening callers.
	 */
	public search(state: S, maximisingPlayer = true, overrideDepth?: number): [M | null, number] {
		const depth = overrideDepth ?? this.maxDepth;
		const [score, move] = this.minimax(state, depth, -Infinity, Infinity, maximisingPlayer);
		return [move, score];
	}

	// ---------------------------------------------------------------------
	// Internal helpers
	// ---------------------------------------------------------------------

	private minimax(
		state: S,
		depth: number,
		alpha: number,
		beta: number,
		maximising: boolean
	): [number, M | null] {
		// Leaf node or depth limit reached ➜ static evaluation
		if (depth === 0) {
			return [this.staticEval(state), null];
		}

		// Hash lookup for already analysed positions
		let hash: string | null = null;
		if (this.useTT) {
			hash = this.hashFn(state);
			const cached = this.tt.get(hash);
			if (cached && cached.depth >= depth) {
				return [cached.score, null];
			}
		}

		const movesRaw = this.engine.validMoves(state);
		const moves = this.orderMovesFn
			? this.orderMovesFn(movesRaw as M[], state, maximising)
			: movesRaw;
		if (moves.length === 0) {
			// No legal moves — usually a loss or draw. Let evaluation function decide.
			return [this.staticEval(state), null];
		}

		let bestMove: M | null = null;
		let bestScore = maximising ? -Infinity : Infinity;

		for (const move of moves) {
			const newState = this.engine.applyMove(state, move);
			const [score] = this.minimax(newState, depth - 1, alpha, beta, !maximising);

			if (maximising) {
				if (score > bestScore) {
					bestScore = score;
					bestMove = move;
				}
				alpha = Math.max(alpha, score);
			} else {
				if (score < bestScore) {
					bestScore = score;
					bestMove = move;
				}
				beta = Math.min(beta, score);
			}

			// Alpha-beta pruning
			if (beta <= alpha) break;
		}

		// Store in transposition table
		if (this.useTT && hash) {
			if (this.tt.size >= this.tableSize) {
				// rudimentary cache eviction – delete first entry
				const firstKey = this.tt.keys().next().value as string | undefined;
				if (firstKey !== undefined) {
					this.tt.delete(firstKey);
				}
			}
			this.tt.set(hash, { score: bestScore, depth });
		}

		return [bestScore, bestMove];
	}

	private staticEval(state: S): number {
		if (!this.engine.evaluate) return 0;
		return this.engine.evaluate(state);
	}
}
