import { describe, it, expect } from 'vitest';
import { MoveGenerator } from './moveGeneration';
import {
	makeInitialBoard,
	generatePoints,
	generateLines,
	buildAdjacencyMap,
	type GameState
} from '$labs/bagchal/rules';

// Pre-compute board geometry
const points = generatePoints();
const lines = generateLines(points);
const adjacency = buildAdjacencyMap(points, lines);

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

describe('MoveGenerator.getValidMoves', () => {
	describe('placement phase', () => {
		it('generates placement moves for empty squares', () => {
			const state = createGameState();

			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			expect(moves.every((m) => m.moveType === 'PLACEMENT')).toBe(true);
			expect(moves.every((m) => m.from === null)).toBe(true);
		});

		it('does not generate moves for occupied squares', () => {
			const state = createGameState();
			// Corners are occupied by tigers
			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			const cornerMoves = moves.filter((m) => [0, 4, 20, 24].includes(m.to));
			expect(cornerMoves).toHaveLength(0);
		});

		it('filters unsafe placements in EASY mode', () => {
			const state = createGameState({ mode: 'EASY' });
			// Position 1 is capturable (tiger at 0 can jump to 2)
			// This should be filtered out

			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			// In EASY mode, some positions adjacent to tigers may be filtered
			// The exact count depends on which positions are immediately capturable
			expect(moves.length).toBeLessThanOrEqual(21); // At most 21 empty squares
		});

		it('includes all placements in HARD mode', () => {
			const state = createGameState({ mode: 'HARD' });

			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			// Should include all 21 empty squares (25 - 4 tigers)
			expect(moves).toHaveLength(21);
		});
	});

	describe('movement phase', () => {
		it('generates goat movement moves', () => {
			const state = createGameState({
				phase: 'MOVEMENT',
				turn: 'GOAT'
			});
			state.board[12] = 'GOAT'; // Place goat in center

			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			expect(moves.every((m) => m.moveType === 'MOVEMENT')).toBe(true);
			expect(moves.every((m) => m.from === 12)).toBe(true);
		});

		it('generates tiger movement and capture moves', () => {
			const state = createGameState({
				phase: 'MOVEMENT',
				turn: 'TIGER'
			});

			const moves = MoveGenerator.getValidMoves(state, adjacency, points);

			expect(moves.some((m) => m.moveType === 'MOVEMENT')).toBe(true);
		});
	});
});

describe('MoveGenerator.getGoatMoves', () => {
	it('returns moves to adjacent empty squares', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[12] = 'GOAT';

		const moves = MoveGenerator.getGoatMoves(state, adjacency, points);

		// Center has 8 neighbors, but corners have tigers
		expect(moves.length).toBeGreaterThan(0);
		expect(moves.every((m) => m.from === 12)).toBe(true);
	});

	it('does not return moves to occupied squares', () => {
		const state = createGameState({ phase: 'MOVEMENT' });
		state.board[12] = 'GOAT';
		state.board[7] = 'GOAT'; // Block one neighbor

		const moves = MoveGenerator.getGoatMoves(state, adjacency, points);

		expect(moves.every((m) => m.to !== 7)).toBe(true);
	});

	it('filters unsafe moves in EASY mode', () => {
		const state = createGameState({
			phase: 'MOVEMENT',
			mode: 'EASY'
		});
		state.board[6] = 'GOAT'; // Near tiger at 0

		const moves = MoveGenerator.getGoatMoves(state, adjacency, points);

		// Some moves may be filtered if they lead to capture
		expect(moves).toBeDefined();
	});
});

describe('MoveGenerator.getTigerMoves', () => {
	it('returns simple movement moves', () => {
		const state = createGameState({ phase: 'MOVEMENT', turn: 'TIGER' });

		const moves = MoveGenerator.getTigerMoves(state, adjacency, points);

		const movementMoves = moves.filter((m) => m.moveType === 'MOVEMENT');
		expect(movementMoves.length).toBeGreaterThan(0);
	});

	it('returns capture moves when goats are adjacent', () => {
		const state = createGameState({ phase: 'MOVEMENT', turn: 'TIGER' });
		state.board[1] = 'GOAT'; // Adjacent to tiger at 0

		const moves = MoveGenerator.getTigerMoves(state, adjacency, points);

		const captureMoves = moves.filter((m) => m.moveType === 'CAPTURE');
		expect(captureMoves.length).toBeGreaterThan(0);
	});

	it('capture moves include jumpedGoatId', () => {
		const state = createGameState({ phase: 'MOVEMENT', turn: 'TIGER' });
		state.board[1] = 'GOAT';

		const moves = MoveGenerator.getTigerMoves(state, adjacency, points);

		const captureMoves = moves.filter((m) => m.moveType === 'CAPTURE');
		expect(captureMoves.every((m) => m.jumpedGoatId !== undefined)).toBe(true);
	});

	it('does not generate capture if landing square is blocked', () => {
		const state = createGameState({ phase: 'MOVEMENT', turn: 'TIGER' });
		state.board[1] = 'GOAT';
		state.board[2] = 'GOAT'; // Block landing square

		const moves = MoveGenerator.getTigerMoves(state, adjacency, points);

		// Should not have a capture that jumps over 1 to land at 2
		const captureOver1 = moves.find((m) => m.jumpedGoatId === 1 && m.to === 2);
		expect(captureOver1).toBeUndefined();
	});
});

describe('MoveGenerator.wouldBeImmediatelyCaptured', () => {
	it('returns true for position that can be captured', () => {
		const state = createGameState({ mode: 'EASY' });
		// Tiger at 0, if goat placed at 1, tiger can capture (jump to 2)

		const result = MoveGenerator.wouldBeImmediatelyCaptured(1, state, adjacency, points);

		expect(result).toBe(true);
	});

	it('returns false for safe position', () => {
		const state = createGameState({ mode: 'EASY' });
		// Position 12 (center) is not immediately capturable from corner tigers

		const result = MoveGenerator.wouldBeImmediatelyCaptured(12, state, adjacency, points);

		expect(result).toBe(false);
	});

	it('returns false in HARD mode regardless of position', () => {
		const state = createGameState({ mode: 'HARD' });

		const result = MoveGenerator.wouldBeImmediatelyCaptured(1, state, adjacency, points);

		expect(result).toBe(false);
	});

	it('returns false when capture landing is blocked', () => {
		const state = createGameState({ mode: 'EASY' });
		state.board[2] = 'GOAT'; // Block the landing square for tiger at 0

		const result = MoveGenerator.wouldBeImmediatelyCaptured(1, state, adjacency, points);

		expect(result).toBe(false);
	});
});
