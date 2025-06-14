export type Player = string;

export type MoveType = string;

export interface Move {
  from: number | null;
  to: number;
  meta?: unknown;
  type: MoveType;
}

export interface GameState<B = unknown> {
  board: B;
  turn: Player;
  winner: Player | 'DRAW' | null;
}
