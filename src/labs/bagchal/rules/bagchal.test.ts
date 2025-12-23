import { describe, it, expect } from 'vitest';
import {
	makeInitialBoard,
	generatePoints,
	generateLines,
	buildAdjacencyMap,
	calculateValidTigerMoves,
	calculateValidGoatMoves,
	executeMove,
	checkIfTigersAreTrapped,
	checkForDraw,
	getBoardPositionHash,
	type GameState
} from './bagchal';

// Helper to create a fresh game state
function createGameState(overrides: Partial<GameState> = {}): GameState {
	return {
		board: makeInitialBoard(),
		turn: 'GOAT',
		phase: 'PLACEMENT',
		goatsPlaced: 0,
		goatsCaptured: 0,
		winner: null,
		selectedPieceId: null,
		validMoves: [],
		message: '',
		positionHistory: [],
		positionCounts: new Map(),
		movesWithoutCapture: 0,
		mode: 'EASY',
		...overrides
	};
}

// Pre-compute board geometry (same as game uses)
const points = generatePoints();
const lines = generateLines(points);
const adjacency = buildAdjacencyMap(points, lines);

describe('makeInitialBoard', () => {
	it('creates a 25-element board', () => {
		const board = makeInitialBoard();
		expect(board).toHaveLength(25);
	});

	it('places 4 tigers at corners', () => {
		const board = makeInitialBoard();
		expect(board[0]).toBe('TIGER');
		expect(board[4]).toBe('TIGER');
		expect(board[20]).toBe('TIGER');
		expect(board[24]).toBe('TIGER');
	});

	it('leaves all other squares empty', () => {
		const board = makeInitialBoard();
		const corners = [0, 4, 20, 24];
		for (let i = 0; i < 25; i++) {
			if (!corners.includes(i)) {
				expect(board[i]).toBeNull();
			}
		}
	});
});

describe('generatePoints', () => {
	it('generates 25 points for a 5x5 grid', () => {
		const pts = generatePoints();
		expect(pts).toHaveLength(25);
	});

	it('assigns correct IDs (0-24)', () => {
		const pts = generatePoints();
		for (let i = 0; i < 25; i++) {
			expect(pts[i].id).toBe(i);
		}
	});

	it('calculates correct coordinates', () => {
		const pts = generatePoints(5, 100, 50);
		// Corner (0,0) should be at (50, 50)
		expect(pts[0].x).toBe(50);
		expect(pts[0].y).toBe(50);
		// Corner (4,0) should be at (450, 50)
		expect(pts[4].x).toBe(450);
		expect(pts[4].y).toBe(50);
		// Center (2,2) should be at (250, 250)
		expect(pts[12].x).toBe(250);
		expect(pts[12].y).toBe(250);
	});
});

describe('buildAdjacencyMap', () => {
	it('corner squares have correct neighbors', () => {
		// Top-left corner (0) should connect to 1 (right), 5 (down), and 6 (diagonal)
		const neighbors0 = adjacency.get(0) || [];
		expect(neighbors0).toContain(1);
		expect(neighbors0).toContain(5);
		expect(neighbors0).toContain(6); // Diagonal (0+0=0 is even)
	});

	it('center square has 8 neighbors', () => {
		// Center (12) should have 8 neighbors (all directions including diagonals)
		const neighbors12 = adjacency.get(12) || [];
		expect(neighbors12).toHaveLength(8);
		expect(neighbors12).toContain(6); // up-left diagonal
		expect(neighbors12).toContain(7); // up
		expect(neighbors12).toContain(8); // up-right diagonal
		expect(neighbors12).toContain(11); // left
		expect(neighbors12).toContain(13); // right
		expect(neighbors12).toContain(16); // down-left diagonal
		expect(neighbors12).toContain(17); // down
		expect(neighbors12).toContain(18); // down-right diagonal
	});

	it('edge squares without diagonals have correct neighbors', () => {
		// Square 1 (top edge, odd x+y) should only have horizontal/vertical neighbors
		const neighbors1 = adjacency.get(1) || [];
		expect(neighbors1).toContain(0); // left
		expect(neighbors1).toContain(2); // right
		expect(neighbors1).toContain(6); // down
		expect(neighbors1).not.toContain(5); // no diagonal (1+0=1 is odd)
		expect(neighbors1).not.toContain(7); // no diagonal
	});
});

describe('calculateValidTigerMoves', () => {
	it('tiger can move to adjacent empty squares', () => {
		const state = createGameState();
		const { destinations } = calculateValidTigerMoves(state, 0, adjacency, points);

		// Tiger at 0 should be able to move to 1, 5, 6 (all empty initially)
		expect(destinations).toContain(1);
		expect(destinations).toContain(5);
		expect(destinations).toContain(6);
	});

	it('tiger cannot move to occupied squares', () => {
		const state = createGameState();
		state.board[1] = 'GOAT';
		state.board[5] = 'GOAT';

		const { destinations, captures } = calculateValidTigerMoves(state, 0, adjacency, points);

		// Simple moves should only include 6 (the empty diagonal)
		const simpleMoves = destinations.filter((d) => !captures.some((c) => c.destinationId === d));
		expect(simpleMoves).toEqual([6]);
	});

	it('tiger can capture by jumping over goat', () => {
		const state = createGameState();
		state.board[1] = 'GOAT'; // Goat adjacent to tiger at 0

		const { captures } = calculateValidTigerMoves(state, 0, adjacency, points);

		// Tiger at 0 can jump over goat at 1 to land at 2
		expect(captures).toContainEqual({ destinationId: 2, jumpedGoatId: 1 });
	});

	it('tiger cannot capture if landing square is occupied', () => {
		const state = createGameState();
		state.board[1] = 'GOAT';
		state.board[2] = 'GOAT'; // Landing square blocked

		const { captures } = calculateValidTigerMoves(state, 0, adjacency, points);

		// No capture should be possible
		const captureOver1 = captures.find((c) => c.jumpedGoatId === 1);
		expect(captureOver1).toBeUndefined();
	});
});

describe('calculateValidGoatMoves', () => {
	it('goat can move to adjacent empty squares', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[12] = 'GOAT'; // Place goat in center

		const moves = calculateValidGoatMoves(state, 12, adjacency);

		// Center goat should be able to move to all 8 neighbors (except corners with tigers)
		expect(moves).toContain(7); // up
		expect(moves).toContain(11); // left
		expect(moves).toContain(13); // right
		expect(moves).toContain(17); // down
	});

	it('goat cannot move to occupied squares', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[12] = 'GOAT';
		state.board[7] = 'GOAT'; // Block one direction

		const moves = calculateValidGoatMoves(state, 12, adjacency);

		expect(moves).not.toContain(7);
	});

	it('goat cannot jump over pieces', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[12] = 'GOAT';

		const moves = calculateValidGoatMoves(state, 12, adjacency);

		// Goat should only move to adjacent squares, not jump
		expect(moves.every((m) => (adjacency.get(12) || []).includes(m))).toBe(true);
	});
});

describe('executeMove', () => {
	it('updates board position correctly', () => {
		const state = createGameState();
		state.board[12] = 'GOAT';
		state.turn = 'GOAT';
		state.phase = 'MOVEMENT';

		executeMove(state, 12, 7, null, adjacency, points);

		expect(state.board[12]).toBeNull();
		expect(state.board[7]).toBe('GOAT');
	});

	it('switches turn after move', () => {
		const state = createGameState();
		state.board[12] = 'GOAT';
		state.turn = 'GOAT';
		state.phase = 'MOVEMENT';

		executeMove(state, 12, 7, null, adjacency, points);

		expect(state.turn).toBe('TIGER');
	});

	it('handles capture correctly', () => {
		const state = createGameState();
		state.board[1] = 'GOAT';
		state.turn = 'TIGER';
		state.phase = 'MOVEMENT';

		executeMove(state, 0, 2, 1, adjacency, points);

		expect(state.board[0]).toBeNull(); // Tiger moved from
		expect(state.board[1]).toBeNull(); // Goat captured
		expect(state.board[2]).toBe('TIGER'); // Tiger moved to
		expect(state.goatsCaptured).toBe(1);
	});

	it('tiger wins when 5 goats captured', () => {
		const state = createGameState();
		state.board[1] = 'GOAT';
		state.goatsCaptured = 4;
		state.turn = 'TIGER';
		state.phase = 'MOVEMENT';

		executeMove(state, 0, 2, 1, adjacency, points);

		expect(state.goatsCaptured).toBe(5);
		expect(state.winner).toBe('TIGER');
	});

	it('increments movesWithoutCapture for non-capture moves', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.turn = 'TIGER';

		executeMove(state, 0, 1, null, adjacency, points);

		expect(state.movesWithoutCapture).toBe(1);
	});

	it('resets movesWithoutCapture on capture', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[1] = 'GOAT';
		state.turn = 'TIGER';
		state.movesWithoutCapture = 10;

		executeMove(state, 0, 2, 1, adjacency, points);

		expect(state.movesWithoutCapture).toBe(0);
	});
});

describe('checkIfTigersAreTrapped', () => {
	it('returns false when tigers have valid moves', () => {
		const state = createGameState();

		const trapped = checkIfTigersAreTrapped(state, adjacency, points);

		expect(trapped).toBe(false);
	});

	it('returns true when all tigers are surrounded', () => {
		const state = createGameState();
		// Create a board where all tigers are completely trapped
		// Tigers are at: 0, 4, 20, 24 (corners)
		//
		// Board layout:
		// 0  1  2  3  4
		// 5  6  7  8  9
		// 10 11 12 13 14
		// 15 16 17 18 19
		// 20 21 22 23 24

		// Surround tiger at 0: neighbors are 1, 5, 6
		state.board[1] = 'GOAT';
		state.board[5] = 'GOAT';
		state.board[6] = 'GOAT';
		state.board[2] = 'GOAT'; // Block capture over 1 -> 2
		state.board[10] = 'GOAT'; // Block capture over 5 -> 10
		state.board[12] = 'GOAT'; // Block capture over 6 -> 12

		// Surround tiger at 4: neighbors are 3, 8, 9
		state.board[3] = 'GOAT';
		state.board[8] = 'GOAT';
		state.board[9] = 'GOAT';
		// 2 already blocked, blocks capture over 3 -> 2
		state.board[14] = 'GOAT'; // Block capture over 9 -> 14
		// 12 already blocked, blocks capture over 8 -> 12

		// Surround tiger at 20: neighbors are 15, 16, 21
		state.board[15] = 'GOAT';
		state.board[16] = 'GOAT';
		state.board[21] = 'GOAT';
		// 10 already blocked, blocks capture over 15 -> 10
		// 12 already blocked, blocks capture over 16 -> 12
		state.board[22] = 'GOAT'; // Block capture over 21 -> 22

		// Surround tiger at 24: neighbors are 18, 19, 23
		state.board[18] = 'GOAT';
		state.board[19] = 'GOAT';
		state.board[23] = 'GOAT';
		// 12 already blocked, blocks capture over 18 -> 12
		// 14 already blocked, blocks capture over 19 -> 14
		// 22 already blocked, blocks capture over 23 -> 22

		const trapped = checkIfTigersAreTrapped(state, adjacency, points);

		expect(trapped).toBe(true);
	});
});

describe('checkForDraw', () => {
	it('returns false during placement phase', () => {
		const state = createGameState({ phase: 'PLACEMENT' });
		state.movesWithoutCapture = 100;

		expect(checkForDraw(state)).toBe(false);
	});

	it('returns true after 51 moves without capture', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.movesWithoutCapture = 51;

		expect(checkForDraw(state)).toBe(true);
	});

	it('returns false at 50 moves without capture', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.movesWithoutCapture = 50;

		expect(checkForDraw(state)).toBe(false);
	});

	it('returns true on 5-fold position repetition', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		const positionHash = getBoardPositionHash(state);
		state.positionCounts.set(positionHash, 5);

		expect(checkForDraw(state)).toBe(true);
	});

	it('returns false on 4-fold position repetition', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		const positionHash = getBoardPositionHash(state);
		state.positionCounts.set(positionHash, 4);

		expect(checkForDraw(state)).toBe(false);
	});
});

describe('getBoardPositionHash', () => {
	it('includes board state in hash', () => {
		const state1 = createGameState();
		const state2 = createGameState();
		state2.board[12] = 'GOAT';

		expect(getBoardPositionHash(state1)).not.toBe(getBoardPositionHash(state2));
	});

	it('includes turn in hash', () => {
		const state1 = createGameState({ turn: 'GOAT' });
		const state2 = createGameState({ turn: 'TIGER' });

		expect(getBoardPositionHash(state1)).not.toBe(getBoardPositionHash(state2));
	});

	it('produces consistent hashes', () => {
		const state = createGameState();

		expect(getBoardPositionHash(state)).toBe(getBoardPositionHash(state));
	});
});
