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
			
			// CRITICAL SAFETY CHECK: In CLASSIC mode, never allow goat suicide moves
			if (bestMove && state.mode === 'CLASSIC' && state.turn === 'GOAT' && bestMove.moveType === 'PLACEMENT') {
				// Double-check this move won't result in immediate capture
				const testState = { ...state, board: [...state.board] };
				testState.board[bestMove.to] = 'GOAT';
				
				// Check if any tigers can capture this goat
				const neighbors = _adjacency.get(bestMove.to) || [];
				for (const neighbor of neighbors) {
					if (testState.board[neighbor] === 'TIGER') {
						const goatNeighbors = _adjacency.get(bestMove.to) || [];
						const possibleLandings = goatNeighbors.filter(pos => 
							pos !== neighbor && testState.board[pos] === null
						);
						
						if (possibleLandings.length > 0) {
							// This move would be suicidal - find a safe alternative
							console.warn('Rejected suicidal move, finding alternative...');
							return this.findSafeAlternative(state, _adjacency);
						}
					}
				}
			}
			
			return bestMove;
		} catch (err) {
			if (import.meta.env.DEV) console.error('AI move error:', err);
			return null;
		}
	}

	/**
	 * Find a safe placement move when the AI tries to make a suicidal move
	 */
	private findSafeAlternative(state: GameState, adjacency: Map<number, number[]>): Move | null {
		// Find any safe placement position
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === null) {
				const neighbors = adjacency.get(i) || [];
				let isSafe = true;
				
				for (const neighbor of neighbors) {
					if (state.board[neighbor] === 'TIGER') {
						const goatNeighbors = adjacency.get(i) || [];
						const possibleLandings = goatNeighbors.filter(pos => 
							pos !== neighbor && state.board[pos] === null
						);
						
						if (possibleLandings.length > 0) {
							isSafe = false;
							break;
						}
					}
				}
				
				if (isSafe) {
					return { from: null, to: i, moveType: 'PLACEMENT' };
				}
			}
		}
		
		// If no safe moves available, just return the first available placement
		for (let i = 0; i < state.board.length; i++) {
			if (state.board[i] === null) {
				return { from: null, to: i, moveType: 'PLACEMENT' };
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
