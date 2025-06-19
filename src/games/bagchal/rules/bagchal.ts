export type Player = 'GOAT' | 'TIGER';
export type GamePhase = 'PLACEMENT' | 'MOVEMENT';
export type PieceType = Player | null;
export type GameMode = 'EASY' | 'HARD';

export interface Point {
  id: number;
  x: number;
  y: number;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GameState {
  board: PieceType[];
  turn: Player;
  phase: GamePhase;
  goatsPlaced: number;
  goatsCaptured: number;
  winner: Player | 'DRAW' | null;
  selectedPieceId: number | null;
  validMoves: number[];
  message: string;
  positionHistory: string[]; // Track board positions for draw detection
  positionCounts: Map<string, number>; // Fast O(1) position counting
  mode: GameMode; // Difficulty level: easy or hard
  movesWithoutCapture: number; // Track moves in movement phase without capture for 51-move rule
}

export interface CaptureInfo {
  destinationId: number;
  jumpedGoatId: number;
}

// Generate grid points
export function generatePoints(
  size: number = 5,
  cellSize: number = 100,
  offset: number = 50
): Point[] {
  const points: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      points.push({ id: y * size + x, x: offset + x * cellSize, y: offset + y * cellSize });
    }
  }
  return points;
}

// Generate lines based on adjacency rules
export function generateLines(points: Point[], size: number = 5): Line[] {
  const lines: Line[] = [];
  function getPoint(x: number, y: number) {
    return x < 0 || x >= size || y < 0 || y >= size ? null : points[y * size + x];
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const start = getPoint(x, y);
      if (!start) continue;

      // Horizontal line
      const right = getPoint(x + 1, y);
      if (right) lines.push({ x1: start.x, y1: start.y, x2: right.x, y2: right.y });

      // Vertical Line
      const down = getPoint(x, y + 1);
      if (down) lines.push({ x1: start.x, y1: start.y, x2: down.x, y2: down.y });

      // Diagonal Line
      const diag1 = getPoint(x + 1, y + 1);
      if (diag1 && (x + y) % 2 === 0)
        lines.push({ x1: start.x, y1: start.y, x2: diag1.x, y2: diag1.y });
      const diag2 = getPoint(x - 1, y + 1);
      if (diag2 && (x + y) % 2 === 0)
        lines.push({ x1: start.x, y1: start.y, x2: diag2.x, y2: diag2.y });
    }
  }
  return lines;
}

// Create initial board with corner tigers
export function makeInitialBoard(size: number = 5): PieceType[] {
  const total = size * size;
  const board: PieceType[] = Array(total).fill(null);
  const corners = [0, size - 1, size * (size - 1), total - 1];
  corners.forEach((id) => (board[id] = 'TIGER'));
  return board;
}

// Build adjacency map from lines
export function buildAdjacencyMap(points: Point[], lines: Line[]): Map<number, number[]> {
  const map = new Map<number, number[]>();
  lines.forEach((line) => {
    const p1 = points.find((p) => p.x === line.x1 && p.y === line.y1);
    const p2 = points.find((p) => p.x === line.x2 && p.y === line.y2);
    if (!p1 || !p2) return;
    map.set(p1.id, [...(map.get(p1.id) || []), p2.id]);
    map.set(p2.id, [...(map.get(p2.id) || []), p1.id]);
  });
  return map;
}

// Calculate valid tiger moves and captures
export function calculateValidTigerMoves(
  state: GameState,
  tigerId: number,
  adjacency: Map<number, number[]>,
  points: Point[]
): { destinations: number[]; captures: CaptureInfo[] } {
  const destinations: number[] = [];
  const captures: CaptureInfo[] = [];
  const neighbors = adjacency.get(tigerId) || [];
  const tigerPoint = points.find((p) => p.id === tigerId);
  if (!tigerPoint) return { destinations, captures };

  neighbors.forEach((adjId) => {
    const piece = state.board[adjId];
    if (piece === null) {
      // Simple move to adjacent empty spot
      destinations.push(adjId);
    } else if (piece === 'GOAT') {
      // Potential jump over this goat
      const adjPoint = points.find((p) => p.id === adjId);
      if (!adjPoint) return;

      // Calculate the vector from tiger to goat
      const dx = adjPoint.x - tigerPoint.x;
      const dy = adjPoint.y - tigerPoint.y;

      // Calculate the potential destination coordinates (2 steps in the same direction)
      const destX = adjPoint.x + dx;
      const destY = adjPoint.y + dy;

      // Find the point at the destination coordinates
      const destPoint = points.find((p) => p.x === destX && p.y === destY);

      // Check if the destination point exists, is empty, AND is actually adjacent to the goat
      if (
        destPoint &&
        state.board[destPoint.id] === null &&
        (adjacency.get(adjId) || []).includes(destPoint.id)
      ) {
        destinations.push(destPoint.id);
        captures.push({ destinationId: destPoint.id, jumpedGoatId: adjId });
      }
    }
  });
  return { destinations, captures };
}

// Calculate valid goat moves
export function calculateValidGoatMoves(
  state: GameState,
  goatId: number,
  adjacency: Map<number, number[]>
): number[] {
  return (adjacency.get(goatId) || []).filter((nid) => state.board[nid] === null);
}

// Generate a hash string for the current board position
export function getBoardPositionHash(state: GameState): string {
  return state.board.map((piece) => piece || 'E').join('') + '_' + state.turn;
}

// Check for draw by position repetition or 51-move rule
export function checkForDraw(state: GameState): boolean {
  if (state.phase !== 'MOVEMENT') return false;

  // Check for 51-move rule (no captures in 51 moves during movement phase)
  if (state.movesWithoutCapture >= 51) {
    return true;
  }

  const currentPosition = getBoardPositionHash(state);
  const positionCount = state.positionCounts.get(currentPosition) || 0;

  // If the same position occurs 5 or more times, it's a draw
  return positionCount >= 5;
}

export function checkIfTigersAreTrapped(
  state: GameState,
  adjacency: Map<number, number[]>,
  points: Point[]
): boolean {
  state.message = '--- Checking if tigers are trapped ---';
  const tigerIds: number[] = [];
  state.board.forEach((piece, id) => {
    if (piece === 'TIGER') {
      tigerIds.push(id);
    }
  });
  state.message = `Tiger IDs found:, ${tigerIds}`;

  if (tigerIds.length === 0) {
    state.message = 'No tigers found, returning false.\n --- Trap check finished ---';
    return false;
  }

  for (const tigerId of tigerIds) {
    const { destinations } = calculateValidTigerMoves(state, tigerId, adjacency, points);
    if (destinations.length > 0) {
      state.message = `Tiger ${tigerId} CAN move. Returning false (not trapped. \n --- Trap check finished ---`;
      return false;
    }
  }
  state.message =
    'NO tigers found with valid moves. Returning true (trapped). \n --- Trap check finished ---';
  return true;
}

// Execute move
export function executeMove(
  state: GameState,
  fromId: number,
  toId: number,
  jumpedGoatId: number | null,
  adjacency: Map<number, number[]>,
  points: Point[]
): void {
  const movingPiece = state.board[fromId];

  // 1. Update Board State
  state.board[toId] = movingPiece!;
  state.board[fromId] = null;
  state.message = `Moved ${movingPiece} from ${fromId} to ${toId}. Board updated.`;

  // 2. Handle Capture & Check TIGER win by capture
  let captureOccurred = false;
  if (movingPiece === 'TIGER' && jumpedGoatId !== null) {
    if (state.board[jumpedGoatId] === 'GOAT') {
      state.board[jumpedGoatId] = null;
      state.goatsCaptured++;
      captureOccurred = true;
      state.message = `Goat captured. Total captured: ${state.goatsCaptured}`;
      if (state.goatsCaptured >= 5) {
        state.message = 'Tiger wins by capturing 5 goats!';
        state.winner = 'TIGER';
      }
    } else {
      state.message = `Attempted capture move, but ID ${jumpedGoatId} is not a GOAT.`;
    }
  }

  // 2.5. Update move counter for 51-move rule (only during movement phase)
  if (state.phase === 'MOVEMENT') {
    if (captureOccurred) {
      state.movesWithoutCapture = 0; // Reset counter on capture
    } else {
      state.movesWithoutCapture++; // Increment counter for non-capture moves
    }
  }

  // 3. Check GOAT win by trapping after a GOAT move
  if (!state.winner && movingPiece === 'GOAT') {
    if (checkIfTigersAreTrapped(state, adjacency, points)) {
      state.message = 'Goats Win! Tigers detected as trapped after goat move.';
      state.winner = 'GOAT';
    } else {
      state.message = 'Tigers are not trapped after goat move.';
    }
  }

  // 4. Switch turn ONLY if no winner was determined
  if (!state.winner) {
    state.turn = state.turn === 'GOAT' ? 'TIGER' : 'GOAT';
    state.message = `Turn switched to: ${state.turn}`;
  } else {
    state.message = `Winner found (${state.winner}), turn remains ${state.turn}`;
  }

  // 5. Track position for draw detection (only during movement phase)
  if (!state.winner && state.phase === 'MOVEMENT') {
    const currentPosition = getBoardPositionHash(state);
    state.positionHistory.push(currentPosition);

    // Update position count
    const currentCount = state.positionCounts.get(currentPosition) || 0;
    state.positionCounts.set(currentPosition, currentCount + 1);

    // Limit position history to last 50 positions to prevent memory issues
    if (state.positionHistory.length > 50) {
      const removedPosition = state.positionHistory.shift()!;
      // Decrement count for removed position
      const removedCount = state.positionCounts.get(removedPosition) || 0;
      if (removedCount <= 1) {
        state.positionCounts.delete(removedPosition);
      } else {
        state.positionCounts.set(removedPosition, removedCount - 1);
      }
    }

    // Check for draw
    if (checkForDraw(state)) {
      state.winner = 'DRAW';
      if (state.movesWithoutCapture >= 51) {
        state.message = 'Game drawn by 51-move rule (no captures in 51 moves)!';
      } else {
        state.message = 'Game drawn by position repetition!';
      }
    }
  }

  // 6. Reset selection ALWAYS after a successful move
  state.selectedPieceId = null;

}

// Reset game to initial state
export function resetGame(state: GameState, points: Point[]): void {
  const size = Math.sqrt(points.length);

  state.board = makeInitialBoard(size);
  state.turn = 'GOAT';
  state.phase = 'PLACEMENT';
  state.goatsPlaced = 0;
  state.goatsCaptured = 0;
  state.winner = null;
  state.selectedPieceId = null;
  state.validMoves = [];
  state.message = '';
  state.positionHistory = []; // Reset position history for draw detection
  state.positionCounts = new Map(); // Reset position counts
  state.movesWithoutCapture = 0; // Reset move counter for 51-move rule
}
