import type { GameState, Point } from '../bagchal';

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
 * Evaluation weights for the minimax algorithm
 */
export interface EvaluationWeights {
	GOAT_CAPTURED: number;
	TIGER_MOBILITY: number;
	POSITION_CONTROL: number;
	ENDGAME: number;
	GOAT_MOBILITY: number;
	TIGER_TRAPPED: number;
	GOAT_CONNECTIVITY: number;
	TIGER_COORDINATION: number;
	CENTRALIZATION: number;
	TEMPO: number;
	CAPTURE_THREAT: number;
}

/**
 * Transposition table entry for memoization
 */
export interface TranspositionEntry {
	score: number;
	move: Move | null;
	depth: number;
	nodeType: 'exact' | 'lower' | 'upper';
}

/**
 * Strategic position sets
 */
export interface StrategicPositions {
	STRATEGIC_POSITIONS: Set<number>;
	CENTER_POSITIONS: Set<number>;
	CROSS_POSITIONS: Set<number>;
} 