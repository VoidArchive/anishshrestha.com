// Bagchal specific AI type definitions

export interface Move {
	from: number | null;
	to: number;
	jumpedGoatId?: number | null;
	moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

// Removed unused complex type interfaces:
// - EvaluationWeights: weights are hardcoded in PositionEvaluator
// - TranspositionEntry: handled by generic Minimax implementation
// - StrategicPositions: positions are hardcoded in MoveOrderer
