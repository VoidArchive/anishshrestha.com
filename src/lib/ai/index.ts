// Main AI exports
export { ComputerPlayer } from './computerPlayer';
export type { Move } from './types';

// Internal modules (exported for extensibility)
export { GameEvaluator } from './gameEvaluator';
export { PositionEvaluator } from './evaluation';
export { MoveGenerator } from './moveGeneration';
export { MoveOrderer } from './moveOrdering';

// Types
export type {
	EvaluationWeights,
	StrategicPositions,
	TranspositionEntry
} from './types';