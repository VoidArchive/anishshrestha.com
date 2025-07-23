/**
 * Conway's Game of Life - Reactive State Management
 *
 * Manages the simulation state using Svelte runes and provides
 * reactive functions for controlling the Game of Life simulation.
 */

import type { SimulationState } from './rules/types';
import { SimulationSpeed } from './rules/types';
import { GameOfLifeEngine } from './engine';
import { toggleCell } from './rules';
import { insertPattern, getPatternByName } from './engine/patterns';

// Create singleton engine instance
const engine = new GameOfLifeEngine();

// Reactive simulation state - exported directly for consistent pattern
export const simulationState = $state<SimulationState>(
	engine.createInitialSimulation({ width: 40, height: 30 })
);

/**
 * Gets the current simulation state
 */
export function getSimulationState(): SimulationState {
	return simulationState;
}

/**
 * Starts the simulation
 */
export function startSimulation(): void {
	engine.start(simulationState, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Stops the simulation
 */
export function stopSimulation(): void {
	engine.stop(simulationState, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Steps through one generation manually
 */
export function stepGeneration(): void {
	engine.stepGeneration(simulationState);
	// NOTE: Svelte 5 runes automatically detect state changes, no workaround needed
}

/**
 * Resets the simulation to empty grid
 */
export function resetSimulation(): void {
	engine.reset(simulationState, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Clears all cells in the grid
 */
export function clearGrid(): void {
	engine.clear(simulationState, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Populates grid with random cells
 */
export function randomizeGrid(probability: number = 0.3): void {
	engine.randomize(
		simulationState,
		() => {
			// Engine will mutate state directly, no need for reassignment
			// Svelte 5 runes will automatically detect changes
		},
		probability
	);
}

/**
 * Changes simulation speed
 */
export function changeSpeed(speed: SimulationSpeed): void {
	engine.changeSpeed(simulationState, speed, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Toggles edge wrapping mode
 */
export function toggleWrapEdges(): void {
	engine.toggleWrapEdges(simulationState, () => {
		// Engine will mutate state directly, no need for reassignment
		// Svelte 5 runes will automatically detect changes
	});
}

/**
 * Toggles a cell at specified coordinates
 * Used for manual grid editing
 */
export function toggleCellAt(x: number, y: number): void {
	// Stop simulation during manual editing
	if (simulationState.isRunning) {
		stopSimulation();
	}

	// NOTE: Direct property mutation for consistent state management pattern
	simulationState.grid = toggleCell(simulationState.grid, x, y);
	simulationState.stats.population = simulationState.grid.flat().filter((cell) => cell).length;
}

/**
 * Inserts a predefined pattern at specified coordinates
 */
export function insertPatternAt(patternName: string, x: number, y: number): void {
	const pattern = getPatternByName(patternName);
	if (!pattern) return;

	// Stop simulation during pattern insertion
	if (simulationState.isRunning) {
		stopSimulation();
	}

	// NOTE: Direct property mutation for consistent state management pattern
	simulationState.grid = insertPattern(simulationState.grid, pattern, x, y);
	simulationState.selectedPattern = patternName;
	simulationState.stats.population = simulationState.grid.flat().filter((cell) => cell).length;
}

/**
 * Resizes the grid to new dimensions
 * NOTE: This is primarily for testing virtualization with larger grids
 */
export function resizeGrid(width: number, height: number): void {
	// Stop simulation during resize
	if (simulationState.isRunning) {
		stopSimulation();
	}

	// Create new grid with same pattern preservation logic
	const newGrid = Array(height)
		.fill(null)
		.map(() => Array(width).fill(false));

	// Copy existing cells that fit in the new dimensions
	const copyWidth = Math.min(simulationState.gridSize.width, width);
	const copyHeight = Math.min(simulationState.gridSize.height, height);

	for (let y = 0; y < copyHeight; y++) {
		for (let x = 0; x < copyWidth; x++) {
			if (simulationState.grid[y] && simulationState.grid[y][x]) {
				newGrid[y][x] = true;
			}
		}
	}

	// Update state
	simulationState.grid = newGrid;
	simulationState.gridSize = { width, height };
	simulationState.generation = 0;
	simulationState.stats = {
		population: newGrid.flat().filter((cell) => cell).length,
		born: 0,
		died: 0,
		totalGenerations: 0
	};
}

/**
 * Cleanup function to call when component is destroyed
 */
export function destroySimulation(): void {
	engine.destroy();
}
