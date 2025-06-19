/**
 * Conway's Game of Life - Type Definitions
 *
 * This file defines the core types used throughout the Game of Life simulation.
 * Includes grid representation, simulation state, and pattern definitions.
 */

// Basic cell state - alive (true) or dead (false)
export type CellState = boolean;

// 2D grid representation for the game board
export type Grid = CellState[][];

// Coordinate system for cell positions
export interface Coordinate {
	x: number;
	y: number;
}

// Grid dimensions configuration
export interface GridDimensions {
	width: number;
	height: number;
}

// Simulation statistics for tracking population changes
export interface SimulationStats {
	population: number; // Current living cells
	born: number; // Cells born in last generation
	died: number; // Cells died in last generation
	totalGenerations: number;
}

// Pre-defined pattern for seeding the grid
export interface Pattern {
	name: string;
	description: string;
	grid: Grid;
	width: number;
	height: number;
}

// Main simulation state
export interface SimulationState {
	grid: Grid;
	isRunning: boolean;
	generation: number;
	speed: number; // Milliseconds between generations
	gridSize: GridDimensions;
	selectedPattern: string | null;
	stats: SimulationStats;
	wrapEdges: boolean; // Whether edges wrap around (toroidal topology)
}

// Speed presets for easier control
export enum SimulationSpeed {
	VERY_SLOW = 1000,
	SLOW = 500,
	NORMAL = 200,
	FAST = 100,
	VERY_FAST = 50
}

// Pattern categories for organization
export enum PatternCategory {
	OSCILLATORS = 'oscillators',
	SPACESHIPS = 'spaceships',
	STILL_LIFES = 'still-lifes',
	RANDOM = 'random'
}
