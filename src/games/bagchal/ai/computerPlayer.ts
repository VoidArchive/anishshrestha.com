import type { GameState, Point, GameMode } from '$games/bagchal/rules';
import type { Move } from './types';
import { Minimax } from '$core/ai';
import { BagchalEngine } from '$games/bagchal/engine';

/**
 * Main AI interface encapsulating search & difficulty management for Bagchal.
 */
export class ComputerPlayer {
	private engine: Minimax<Move, GameState>;
	private mode: GameMode;
	private maxDepth: number;

	constructor(mode: GameMode = 'CLASSIC') {
		this.mode = mode;
		const depthMap: Record<GameMode, number> = {
			CLASSIC: 6,  // Reduced from 10 to 6 for better performance
			REFORGED: 6
		};
		this.maxDepth = depthMap[mode];
		this.engine = new Minimax<Move, GameState>(BagchalEngine, { 
			maxDepth: this.maxDepth,
			stateHash: this.hashGameState as <S>(state: S) => string
		});
	}

	/**
	 * Efficient hash function for game states to improve transposition table performance
	 */
	private hashGameState(state: GameState): string {
		// Create a compact string representation of the essential game state
		const boardStr = state.board.map(cell => cell === null ? '0' : cell === 'GOAT' ? '1' : '2').join('');
		return `${boardStr}|${state.turn}|${state.phase}|${state.goatsPlaced}|${state.goatsCaptured}`;
	}

	/** Return the best move found for the current position. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBestMove(state: GameState, _adjacency: Map<number, number[]>, _points: Point[]): Move | null {
		try {
			const maximizing = state.turn === 'TIGER';
			// Use the engine directly instead of iterative deepening
			const [bestMove] = this.engine.search(state, maximizing);
			
					// Simple fallback for edge cases
		return bestMove || this.getEmergencyMove(state, _adjacency);
		} catch (err) {
			if (import.meta.env.DEV) console.error('AI move error:', err);
			return null;
		}
	}

	/**
	 * Emergency move fallback for edge cases
	 */
	private getEmergencyMove(state: GameState, adjacency: Map<number, number[]>): Move | null {
		if (state.phase === 'PLACEMENT') {
			// Return first available placement
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === null) {
					return { from: null, to: i, moveType: 'PLACEMENT' };
				}
			}
		} else {
			// Return first available movement
			for (let i = 0; i < state.board.length; i++) {
				if (state.board[i] === 'GOAT') {
					const neighbors = adjacency.get(i) || [];
					for (const neighbor of neighbors) {
						if (state.board[neighbor] === null) {
							return { from: i, to: neighbor, moveType: 'MOVEMENT' };
						}
					}
				}
			}
		}
		return null;
	}

	setMode(mode: GameMode): void {
		this.mode = mode;
		const depthMap: Record<GameMode, number> = {
			CLASSIC: 6,
			REFORGED: 6
		};
		this.maxDepth = depthMap[mode];
		this.engine = new Minimax<Move, GameState>(BagchalEngine, { 
			maxDepth: this.maxDepth,
			stateHash: this.hashGameState as <S>(state: S) => string
		});
	}

	getMode(): GameMode {
		return this.mode;
	}

	clearCache(): void {
		this.engine.clearCache();
	}
}
