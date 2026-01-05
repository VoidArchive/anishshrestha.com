export interface Move {
  from: number | null;
  to: number;
  jumpedGoatId?: number | null;
  moveType: 'PLACEMENT' | 'MOVEMENT' | 'CAPTURE';
}

