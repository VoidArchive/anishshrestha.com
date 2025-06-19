/**
 * Conway's Game of Life - Main Simulation Engine
 *
 * Controls the simulation timing, state transitions, and provides
 * a clean interface for starting, stopping, and stepping through generations.
 */

import type { SimulationState, GridDimensions } from '../rules/types';
import { nextGeneration, createInitialState, randomizeGrid, clearGrid } from '../rules';

/**
 * Game of Life simulation engine
 * Manages the simulation loop and provides controls for the game
 */
export class GameOfLifeEngine {
	private intervalId: number | null = null;
	private onStateUpdate: ((state: SimulationState) => void) | null = null;

	/**
	 * Creates initial simulation state
	 */
	createInitialSimulation(dimensions: GridDimensions): SimulationState {
		const { grid, stats } = createInitialState(dimensions.width, dimensions.height);

		return {
			grid,
			isRunning: false,
			generation: 0,
			speed: 200, // Default to normal speed
			gridSize: dimensions,
			selectedPattern: null,
			stats,
			wrapEdges: false
		};
	}

	/**
	 * Starts the simulation with automatic generation progression
	 */
	start(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		if (state.isRunning) return; // Already running

		this.onStateUpdate = onUpdate;
		state.isRunning = true;

		this.intervalId = window.setInterval(() => {
			this.stepGeneration(state);
		}, state.speed);

		onUpdate(state);
	}

	/**
	 * Stops the simulation
	 */
	stop(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		if (!state.isRunning) return; // Already stopped

		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}

		state.isRunning = false;
		onUpdate(state);
	}

	/**
	 * Advances the simulation by one generation
	 */
	stepGeneration(state: SimulationState): void {
		const result = nextGeneration(state.grid, state.wrapEdges);

		// Update state properties directly
		state.grid = result.grid;
		state.generation += 1;
		state.stats = {
			...result.stats,
			totalGenerations: state.generation
		};

		// Notify of state change
		if (this.onStateUpdate) {
			this.onStateUpdate(state);
		}
	}

	/**
	 * Updates simulation speed and restarts if running
	 */
	changeSpeed(
		state: SimulationState,
		newSpeed: number,
		onUpdate: (state: SimulationState) => void
	): void {
		const wasRunning = state.isRunning;

		if (wasRunning) {
			this.stop(state, onUpdate);
		}

		state.speed = newSpeed;

		if (wasRunning) {
			this.start(state, onUpdate);
		} else {
			onUpdate(state);
		}
	}

	/**
	 * Resets the simulation to initial state
	 */
	reset(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		this.stop(state, onUpdate);

		const { grid, stats } = createInitialState(state.gridSize.width, state.gridSize.height);

		state.grid = grid;
		state.generation = 0;
		state.stats = stats;
		state.selectedPattern = null;

		onUpdate(state);
	}

	/**
	 * Clears all cells in the grid
	 */
	clear(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		this.stop(state, onUpdate);

		state.grid = clearGrid(state.gridSize.width, state.gridSize.height);
		state.generation = 0;
		state.stats = {
			population: 0,
			born: 0,
			died: 0,
			totalGenerations: 0
		};

		onUpdate(state);
	}

	/**
	 * Populates grid with random cells
	 */
	randomize(
		state: SimulationState,
		onUpdate: (state: SimulationState) => void,
		probability: number = 0.3
	): void {
		this.stop(state, onUpdate);

		state.grid = randomizeGrid(state.gridSize.width, state.gridSize.height, probability);
		state.generation = 0;
		state.stats = {
			population: state.grid.flat().filter((cell) => cell).length,
			born: 0,
			died: 0,
			totalGenerations: 0
		};

		onUpdate(state);
	}

	/**
	 * Toggles wrap edges setting
	 */
	toggleWrapEdges(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		state.wrapEdges = !state.wrapEdges;
		onUpdate(state);
	}

	/**
	 * Cleanup method to clear any running intervals
	 */
	destroy(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.onStateUpdate = null;
	}
}
