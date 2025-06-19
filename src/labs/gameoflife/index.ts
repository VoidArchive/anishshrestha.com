/**
 * Conway's Game of Life - Barrel Exports
 *
 * Central export point for all Game of Life functionality.
 * Provides clean imports for other parts of the application.
 */

// Export all types
export type * from './rules/types';

// Export core rules functionality
export {
	createEmptyGrid,
	createInitialState,
	countNeighbors,
	nextGeneration,
	countLivingCells,
	toggleCell,
	clearGrid,
	randomizeGrid
} from './rules';

// Export engine functionality
export { GameOfLifeEngine } from './engine';

// Export pattern functionality
export * from './engine/patterns';

// Export reactive store
export * from './store.svelte';

// Export UI components
export { default as GameOfLifeShell } from './ui/Shell.svelte';
export { default as GameGrid } from './ui/GameGrid.svelte';
export { default as ControlPanel } from './ui/ControlPanel.svelte';
export { default as SimulationStats } from './ui/SimulationStats.svelte';
export { default as PatternSelector } from './ui/PatternSelector.svelte';
