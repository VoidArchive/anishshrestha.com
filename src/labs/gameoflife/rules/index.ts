/**
 * Conway's Game of Life - Rules Engine
 *
 * Implements the classic Conway's Game of Life rules:
 * 1. Any live cell with 2-3 neighbors survives
 * 2. Any dead cell with exactly 3 neighbors becomes alive
 * 3. All other live cells die, all other dead cells stay dead
 */

import type { Grid, SimulationStats } from './types';

/**
 * Creates an empty grid of specified dimensions
 * All cells initialized as dead (false)
 */
export function createEmptyGrid(width: number, height: number): Grid {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(false));
}

/**
 * Creates initial simulation state with default values
 */
export function createInitialState(
	width: number = 30,
	height: number = 20
): {
	grid: Grid;
	stats: SimulationStats;
} {
	const grid = createEmptyGrid(width, height);
	const stats: SimulationStats = {
		population: 0,
		born: 0,
		died: 0,
		totalGenerations: 0
	};

	return { grid, stats };
}

/**
 * Counts living neighbors for a cell at given coordinates
 * Supports both bounded and wrapped (toroidal) grids
 */
export function countNeighbors(
	grid: Grid,
	x: number,
	y: number,
	wrapEdges: boolean = false
): number {
	const height = grid.length;
	const width = grid[0].length;
	let count = 0;

	// Check all 8 neighboring positions
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			// Skip the center cell (itself)
			if (dx === 0 && dy === 0) continue;

			let nx = x + dx;
			let ny = y + dy;

			if (wrapEdges) {
				// Wrap coordinates for toroidal topology
				nx = ((nx % width) + width) % width;
				ny = ((ny % height) + height) % height;
			} else {
				// Skip if coordinates are out of bounds
				if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
			}

			if (grid[ny][nx]) count++;
		}
	}

	return count;
}

/**
 * Applies Conway's Game of Life rules to generate next generation
 * Returns new grid and updated statistics
 */
export function nextGeneration(
	currentGrid: Grid,
	wrapEdges: boolean = false
): { grid: Grid; stats: SimulationStats } {
	const height = currentGrid.length;
	const width = currentGrid[0].length;
	const newGrid = createEmptyGrid(width, height);

	let population = 0;
	let born = 0;
	let died = 0;

	// Apply rules to each cell
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const isAlive = currentGrid[y][x];
			const neighbors = countNeighbors(currentGrid, x, y, wrapEdges);

			// Conway's rules implementation
			let willLive = false;

			if (isAlive) {
				// Live cell survives with 2-3 neighbors
				willLive = neighbors === 2 || neighbors === 3;
				if (!willLive) died++;
			} else {
				// Dead cell becomes alive with exactly 3 neighbors
				willLive = neighbors === 3;
				if (willLive) born++;
			}

			newGrid[y][x] = willLive;
			if (willLive) population++;
		}
	}

	const stats: SimulationStats = {
		population,
		born,
		died,
		totalGenerations: 0 // Will be set by calling code
	};

	return { grid: newGrid, stats };
}

/**
 * Counts total living cells in the grid
 */
export function countLivingCells(grid: Grid): number {
	return grid.flat().filter((cell) => cell).length;
}

/**
 * Toggles cell state at specified coordinates
 * Used for manual grid editing
 */
export function toggleCell(grid: Grid, x: number, y: number): Grid {
	if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
		return grid; // Out of bounds, no change
	}

	const newGrid = grid.map((row) => [...row]);
	newGrid[y][x] = !newGrid[y][x];
	return newGrid;
}

/**
 * Clears all cells in the grid (sets all to dead)
 */
export function clearGrid(width: number, height: number): Grid {
	return createEmptyGrid(width, height);
}

/**
 * Fills grid with random living cells based on probability
 * @param probability - Chance (0-1) for each cell to be alive
 */
export function randomizeGrid(width: number, height: number, probability: number = 0.3): Grid {
	return Array(height)
		.fill(null)
		.map(() =>
			Array(width)
				.fill(null)
				.map(() => Math.random() < probability)
		);
}
