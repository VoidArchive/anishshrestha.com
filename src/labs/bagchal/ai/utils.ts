// Removed unused GameState import
import { generatePoints, generateLines, buildAdjacencyMap } from '$labs/bagchal/rules';

/**
 * Shared utilities for Bagchal AI components – single source of truth for
 * board topology (adjacency) and other geometric helpers.
 */

// ---------------------------------------------------------------------------
// 1. Board geometry
// ---------------------------------------------------------------------------

// Build points & lines once – these are immutable and light-weight.
const _points = generatePoints();
const _lines = generateLines(_points);

// Official adjacency map; converted to both Map and plain object for callers
export const ADJACENCY_MAP: Map<number, number[]> = buildAdjacencyMap(_points, _lines);

// Export immutable points for geometry consumers (AI, UI helpers, etc.)
export const POINTS = _points;

// Key board positions (derived from 5×5 grid indices)
export const BOARD_POSITIONS = {
	CENTER: 12,
	CORNERS: [0, 4, 20, 24],
	EDGE_MIDPOINTS: [2, 10, 14, 22],
	CROSS_POSITIONS: [6, 8, 16, 18]
};

// Removed unused utility functions:
// - getDistance: Manhattan distance calculation (not used)
// - getTigerPositions: Get tiger positions from state (not used)
// - getGoatPositions: Get goat positions from state (not used)
// - getJumpLanding: Calculate jump landing position (not used)
// - areCollinearAndAdjacent: Check collinear adjacency (not used)
