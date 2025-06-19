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

// Create simulation state - not exported directly to avoid reassignment issues
let simulationState = $state<SimulationState>(
	engine.createInitialSimulation({ width: 40, height: 30 })
);

/**
 * Gets the current simulation state
 * This avoids the "cannot export state from module" error
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
	// Force Svelte reactivity update for manual steps
	simulationState = simulationState;
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

	// Update state by mutating the existing object
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

	// Update state by mutating the existing object
	simulationState.grid = insertPattern(simulationState.grid, pattern, x, y);
	simulationState.selectedPattern = patternName;
	simulationState.stats.population = simulationState.grid.flat().filter((cell) => cell).length;
}


/**
 * Cleanup function to call when component is destroyed
 */
export function destroySimulation(): void {
	engine.destroy();
}
