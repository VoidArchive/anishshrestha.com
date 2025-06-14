// Bagchal specific AI type definitions

export interface Move {
  from: number | null;
  to: number;
  jumpedGoatId?: number | null;
  moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

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

export interface TranspositionEntry {
  score: number;
  move: Move | null;
  depth: number;
  nodeType: 'exact' | 'lower' | 'upper';
}

export interface StrategicPositions {
  STRATEGIC_POSITIONS: Set<number>;
  CENTER_POSITIONS: Set<number>;
  CROSS_POSITIONS: Set<number>;
}
