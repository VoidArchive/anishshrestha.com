import { BoidsEngine } from './engine';
import type { SimulationState } from './rules/types';

const engine = new BoidsEngine();

// Create reactive state with default canvas size (will be updated on mount)
export const state: SimulationState = $state(engine.createInitialState(800, 600));

export function startSimulation(): void {
	engine.start(state);
}

export function stopSimulation(): void {
	engine.stop(state);
}

export function toggleSimulation(): void {
	engine.toggle(state);
}

export function resetSimulation(): void {
	engine.reset(state);
}

export function updateBoidCount(count: number): void {
	engine.updateBoidCount(state, count);
}

export function updateCanvasSize(width: number, height: number): void {
	engine.updateCanvasSize(state, width, height);
}

export function destroySimulation(): void {
	engine.destroy(state);
}
