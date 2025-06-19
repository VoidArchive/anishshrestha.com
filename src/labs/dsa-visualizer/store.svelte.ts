/*
DSA Visualizer Store - Reactive State Management

Handles state management for Data Structures and Algorithms visualization.
Provides reactive store for sorting and pathfinding algorithm animations.
Controls animation flow, user interactions, and algorithm execution.
*/

import { DSAEngine } from './engine';
import type {
	DSAState,
	DSAMove,
	AlgorithmType,
	SortingAlgorithm,
	PathfindingAlgorithm
} from './types';

// Create engine instance
const engine = new DSAEngine();

// Reactive state with proper Svelte reactivity
export const dsaState = $state<DSAState>(engine.initialState());

// Animation control
let animationTimeoutId: number | null = null;

/**
 * Applies a move to the current state and updates reactive state
 * Used by animation system to progress through algorithm steps
 */
export function applyMove(move: DSAMove) {
	const newState = engine.applyMove(dsaState, move);

	// Update state properties individually for proper reactivity
	dsaState.array = newState.array;
	dsaState.grid = newState.grid;
	dsaState.comparing = newState.comparing;
	dsaState.sorted = newState.sorted;
	dsaState.visitedNodes = newState.visitedNodes;
	dsaState.frontierNodes = newState.frontierNodes || [];
	dsaState.currentNode = newState.currentNode || null;
	dsaState.path = newState.path;
	dsaState.currentStep = newState.currentStep;
	dsaState.completed = newState.completed;
	dsaState.isAnimating = newState.isAnimating;
	dsaState.comparisons = newState.comparisons;
	dsaState.swaps = newState.swaps;
	dsaState.nodesVisited = newState.nodesVisited;
	dsaState.pathLength = newState.pathLength;
}

/**
 * Resets the visualization to initial state
 * Preserves user settings (mode, algorithm, size, speed)
 */
export function resetVisualization() {
	if (animationTimeoutId) {
		clearTimeout(animationTimeoutId);
		animationTimeoutId = null;
	}

	const newState = engine.initialState();

	// Preserve current settings
	newState.mode = dsaState.mode;
	newState.algorithm = dsaState.algorithm;
	newState.arraySize = dsaState.arraySize;
	newState.animationSpeed = dsaState.animationSpeed;
	newState.turboMode = dsaState.turboMode;

	// Generate appropriate data for current mode
	if (newState.mode === 'SORTING') {
		newState.array = engine.generateRandomArray(newState.arraySize, 10, 100);
	} else {
		// Use consistent grid size to prevent layout shifts
		const gridSize = { width: 40, height: 25 };
		newState.grid = engine.createEmptyGrid(gridSize.width, gridSize.height);
		newState.gridSize = gridSize;
	}

	// Update all state properties for reactivity
	dsaState.mode = newState.mode;
	dsaState.algorithm = newState.algorithm;
	dsaState.array = newState.array;
	dsaState.arraySize = newState.arraySize;
	dsaState.grid = newState.grid;
	dsaState.gridSize = newState.gridSize;
	dsaState.comparing = newState.comparing;
	dsaState.sorted = newState.sorted;
	dsaState.visitedNodes = newState.visitedNodes;
	dsaState.path = newState.path;
	dsaState.start = newState.start;
	dsaState.end = newState.end;
	dsaState.currentStep = newState.currentStep;
	dsaState.totalSteps = newState.totalSteps;
	dsaState.isAnimating = newState.isAnimating;
	dsaState.animationSpeed = newState.animationSpeed;
	dsaState.turboMode = newState.turboMode;
	dsaState.completed = newState.completed;
	dsaState.comparisons = newState.comparisons;
	dsaState.swaps = newState.swaps;
	dsaState.nodesVisited = newState.nodesVisited;
	dsaState.pathLength = newState.pathLength;
	dsaState.frontierNodes = newState.frontierNodes || [];
	dsaState.currentNode = newState.currentNode || null;
}

/**
 * Sets the algorithm and resets visualization state
 */
export function setAlgorithm(algorithm: SortingAlgorithm | PathfindingAlgorithm) {
	const newState = engine.setAlgorithm(dsaState, algorithm);

	dsaState.algorithm = newState.algorithm;
	dsaState.completed = newState.completed;
	dsaState.isAnimating = newState.isAnimating;
	dsaState.currentStep = newState.currentStep;
	dsaState.totalSteps = newState.totalSteps;
}

/**
 * Changes between sorting and pathfinding modes
 */
export function setMode(mode: AlgorithmType) {
	if (animationTimeoutId) {
		clearTimeout(animationTimeoutId);
		animationTimeoutId = null;
	}

	const newState = engine.setMode(dsaState, mode);

	// Update all relevant state properties
	dsaState.mode = newState.mode;
	dsaState.algorithm = newState.algorithm;
	dsaState.array = newState.array;
	dsaState.grid = newState.grid;
	dsaState.gridSize = newState.gridSize;
	dsaState.comparing = newState.comparing;
	dsaState.sorted = newState.sorted;
	dsaState.visitedNodes = newState.visitedNodes;
	dsaState.path = newState.path;
	dsaState.start = newState.start;
	dsaState.end = newState.end;
	dsaState.currentStep = newState.currentStep;
	dsaState.totalSteps = newState.totalSteps;
	dsaState.isAnimating = newState.isAnimating;
	dsaState.completed = newState.completed;
	dsaState.comparisons = newState.comparisons;
	dsaState.swaps = newState.swaps;
	dsaState.nodesVisited = newState.nodesVisited;
	dsaState.pathLength = newState.pathLength;
}

/**
 * Updates array size for sorting algorithms
 */
export function setArraySize(size: number) {
	if (dsaState.isAnimating) return;

	dsaState.arraySize = size;

	// Regenerate array with new size
	dsaState.array = engine.generateRandomArray(size, 10, 100);
	dsaState.sorted = [];
	dsaState.comparing = [];
	dsaState.swaps = 0;
	dsaState.comparisons = 0;
	dsaState.currentStep = 0;
	dsaState.totalSteps = 0;
	dsaState.completed = false;
}

/**
 * Shuffle array for sorting mode or generate random walls for pathfinding mode.
 * Provides appropriate randomization based on current mode.
 */
export function shuffleArray() {
	if (dsaState.isAnimating) return;

	if (dsaState.mode === 'SORTING') {
		// Shuffle the array for sorting algorithms
		for (let i = dsaState.array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[dsaState.array[i], dsaState.array[j]] = [dsaState.array[j], dsaState.array[i]];
		}

		// Reset sorting state
		dsaState.sorted = [];
		dsaState.comparing = [];
		dsaState.swaps = 0;
		dsaState.comparisons = 0;
		dsaState.currentStep = 0;
		dsaState.totalSteps = 0;
		dsaState.completed = false;
	} else if (dsaState.mode === 'PATHFINDING') {
		// Generate random walls (approximately 25% of empty cells)
		const wallProbability = 0.25;

		for (let y = 0; y < dsaState.gridSize.height; y++) {
			for (let x = 0; x < dsaState.gridSize.width; x++) {
				const node = dsaState.grid[y][x];

				// Don't place walls on start or end points
				if (node && !node.isStart && !node.isEnd) {
					node.isWall = Math.random() < wallProbability;
					node.isVisited = false;
					node.isPath = false;
					node.distance = Infinity;
					node.heuristic = 0;
					node.parent = null;
				}
			}
		}

		// Reset pathfinding statistics
		dsaState.visitedNodes = [];
		dsaState.path = [];
		dsaState.nodesVisited = 0;
		dsaState.pathLength = 0;
		dsaState.currentStep = 0;
		dsaState.totalSteps = 0;
		dsaState.completed = false;
	}
}

/**
 * Updates animation speed
 */
export function setAnimationSpeed(speed: number) {
	dsaState.animationSpeed = speed;
}

/**
 * Toggles turbo mode for faster algorithm visualization
 */
export function setTurboMode(enabled: boolean) {
	dsaState.turboMode = enabled;
}

/**
 * Skips to the end of the algorithm animation
 */
export function skipToEnd() {
	if (!dsaState.isAnimating && dsaState.totalSteps === 0) return;

	// Stop current animation
	if (animationTimeoutId) {
		clearTimeout(animationTimeoutId);
		animationTimeoutId = null;
	}

	// Apply all remaining steps instantly
	while (dsaState.currentStep < dsaState.totalSteps) {
		const step = engine.getStepAt(dsaState.currentStep);
		if (step) {
			// Apply state first, then only non-data moves
			if (step.state) {
				applyStepState(step.state);
			}
			if (step.move.type === 'COMPARE' || step.move.type === 'HIGHLIGHT') {
				applyMove(step.move);
			}
		}
		dsaState.currentStep++;
	}

	dsaState.isAnimating = false;
	dsaState.completed = true;
}

/**
 * Starts algorithm animation
 */
export function startAnimation() {
	if (dsaState.isAnimating) return;

	const preparedState = engine.prepareAlgorithm(dsaState);

	// Update state with prepared animation data
	dsaState.currentStep = preparedState.currentStep;
	dsaState.totalSteps = preparedState.totalSteps;
	dsaState.isAnimating = preparedState.isAnimating;
	dsaState.completed = preparedState.completed;
	dsaState.comparisons = preparedState.comparisons;
	dsaState.swaps = preparedState.swaps;
	dsaState.nodesVisited = preparedState.nodesVisited;
	dsaState.pathLength = preparedState.pathLength;
	dsaState.comparing = preparedState.comparing;
	dsaState.sorted = preparedState.sorted;
	dsaState.visitedNodes = preparedState.visitedNodes;
	dsaState.path = preparedState.path;

	if (dsaState.totalSteps > 0 || dsaState.totalSteps === -1) {
		runNextStep();
	} else {
		dsaState.isAnimating = false;
	}
}

/**
 * Pauses the current animation
 */
export function pauseAnimation() {
	if (animationTimeoutId) {
		clearTimeout(animationTimeoutId);
		animationTimeoutId = null;
	}
	dsaState.isAnimating = false;
}

/**
 * Resumes paused animation
 */
export function resumeAnimation() {
	if (!dsaState.completed && dsaState.currentStep < dsaState.totalSteps) {
		dsaState.isAnimating = true;
		runNextStep();
	}
}

/**
 * Steps forward one animation step
 */
export function stepForward() {
	if (
		dsaState.completed ||
		(dsaState.totalSteps > 0 && dsaState.currentStep >= dsaState.totalSteps)
	)
		return;

	const step = engine.getStepAt(dsaState.currentStep);


	if (step) {
		// Apply step state updates
		if (step.state) {
			applyStepState(step.state);
		}

		// Apply the move (only for UI effects, not data changes)
		if (step.move.type === 'COMPARE' || step.move.type === 'HIGHLIGHT') {
			applyMove(step.move);
		}

		// Progress to next step
		dsaState.currentStep++;

		// Check completion
		if (dsaState.totalSteps > 0 && dsaState.currentStep >= dsaState.totalSteps) {
			dsaState.completed = true;
			dsaState.isAnimating = false;
		}
	}
}

/**
 * Steps backward one animation step
 */
export function stepBackward() {
	if (dsaState.currentStep <= 0) return;

	dsaState.currentStep--;

	// Reapply all steps up to current step
	const resetState = engine.prepareAlgorithm(dsaState);
	applyStepState(resetState);

	for (let i = 0; i < dsaState.currentStep; i++) {
		const step = engine.getStepAt(i);
		if (step) {
			if (step.state) {
				applyStepState(step.state);
			}
			// Same fix - only apply non-data moves to avoid conflicts
			if (step.move.type === 'COMPARE' || step.move.type === 'HIGHLIGHT') {
				applyMove(step.move);
			}
		}
	}
}

/**
 * Runs the next animation step
 */
function runNextStep() {
	if (!dsaState.isAnimating || dsaState.completed) {
		dsaState.isAnimating = false;
		return;
	}

	if (dsaState.currentStep >= dsaState.totalSteps) {
		dsaState.isAnimating = false;
		dsaState.completed = true;
		return;
	}

	const step = engine.getStepAt(dsaState.currentStep);


	if (step) {
		// Apply step state updates (contains the corrected array/grid state)
		if (step.state) {
			applyStepState(step.state);
		}

		// Apply the move for side effects (stats, comparisons, etc.) but not for data changes
		if (step.move.type !== 'STEP_COMPLETE') {
			// Only apply moves that don't modify the main data structures
			// since step.state already contains the correct data
			if (step.move.type === 'COMPARE' || step.move.type === 'HIGHLIGHT') {
				applyMove(step.move);
			} else {
				// For SWAP, SET_VALUE, etc., only update counters and UI state
				if (step.move.type === 'SWAP') {
					dsaState.swaps = step.state.swaps !== undefined ? step.state.swaps : dsaState.swaps + 1;
					dsaState.comparing = [];
				} else if (step.move.type === 'VISIT_NODE') {
					dsaState.nodesVisited =
						step.state.nodesVisited !== undefined
							? step.state.nodesVisited
							: dsaState.nodesVisited + 1;
				}
			}
		}

		// Progress to next step
		dsaState.currentStep++;

		// Handle instant mode (0ms delay) with performance safeguards
		if (dsaState.animationSpeed === 0) {
			// Run steps in batches to prevent browser hanging
			const BATCH_SIZE = 50;
			let batchCount = 0;

			while (dsaState.currentStep < dsaState.totalSteps && batchCount < BATCH_SIZE) {
				const nextStep = engine.getStepAt(dsaState.currentStep);
				if (nextStep) {
					if (nextStep.state) {
						applyStepState(nextStep.state);
					}
					if (nextStep.move.type !== 'STEP_COMPLETE') {
						// Same fix as above - only apply non-data moves
						if (nextStep.move.type === 'COMPARE' || nextStep.move.type === 'HIGHLIGHT') {
							applyMove(nextStep.move);
						}
					}
					dsaState.currentStep++;
					batchCount++;
				} else {
					break;
				}
			}

			if (dsaState.currentStep >= dsaState.totalSteps) {
				dsaState.completed = true;
				dsaState.isAnimating = false;
				dsaState.comparing = [];
			} else {
				// Continue with next batch after yielding to browser
				animationTimeoutId = setTimeout(() => {
					runNextStep();
				}, 0);
			}
			return;
		}

		// Check completion
		if (dsaState.currentStep >= dsaState.totalSteps) {
			dsaState.completed = true;
			dsaState.isAnimating = false;
			dsaState.comparing = [];
		} else {
			// Handle turbo mode - skip non-key steps
			let delay = dsaState.animationSpeed;
			if (dsaState.turboMode && step && !step.isKeyStep) {
				delay = Math.min(delay / 4, 10); // Much faster for non-key steps
			}

			// Minimum delay to prevent browser hangs
			delay = Math.max(delay, 1);

			// Schedule next step
			animationTimeoutId = setTimeout(() => {
				runNextStep();
			}, delay);
		}
	} else {
		dsaState.isAnimating = false;
	}
}

/**
 * Applies partial state updates from animation steps
 */
function applyStepState(stepState: Partial<DSAState>) {
	if (stepState.array !== undefined) dsaState.array = stepState.array;
	if (stepState.grid !== undefined) dsaState.grid = stepState.grid;
	if (stepState.comparing !== undefined) dsaState.comparing = stepState.comparing;
	if (stepState.sorted !== undefined) dsaState.sorted = stepState.sorted;
	if (stepState.visitedNodes !== undefined) dsaState.visitedNodes = stepState.visitedNodes;
	if (stepState.path !== undefined) dsaState.path = stepState.path;
	if (stepState.completed !== undefined) dsaState.completed = stepState.completed;
	if (stepState.comparisons !== undefined) dsaState.comparisons = stepState.comparisons;
	if (stepState.swaps !== undefined) dsaState.swaps = stepState.swaps;
	if (stepState.nodesVisited !== undefined) dsaState.nodesVisited = stepState.nodesVisited;
	if (stepState.pathLength !== undefined) dsaState.pathLength = stepState.pathLength;
}

// Derived getters
export function getCurrentStepDescription(): string {
	return engine.getStepDescription(dsaState);
}

export function getValidMoves(): DSAMove[] {
	return engine.validMoves(dsaState);
}

export function getProgressPercentage(): number {
	if (dsaState.totalSteps <= 0) return 0;
	return Math.round((dsaState.currentStep / dsaState.totalSteps) * 100);
}

// Grid utilities for pathfinding
export function toggleWall(x: number, y: number) {
	if (dsaState.mode !== 'PATHFINDING' || dsaState.isAnimating) return;

	const node = dsaState.grid[y]?.[x];
	if (node && !node.isStart && !node.isEnd) {
		node.isWall = !node.isWall;
		// Trigger reactivity by updating the grid reference
		dsaState.grid = [...dsaState.grid];
	}
}

export function setStartPoint(x: number, y: number) {
	if (dsaState.mode !== 'PATHFINDING' || dsaState.isAnimating) return;

	// Clear previous start
	if (dsaState.start) {
		const [prevX, prevY] = dsaState.start;
		dsaState.grid[prevY][prevX].isStart = false;
	}

	// Set new start
	const node = dsaState.grid[y]?.[x];
	if (node && !node.isWall && !node.isEnd) {
		node.isStart = true;
		node.isWall = false;
		dsaState.start = [x, y];
		// Trigger reactivity
		dsaState.grid = [...dsaState.grid];
	}
}

export function setEndPoint(x: number, y: number) {
	if (dsaState.mode !== 'PATHFINDING' || dsaState.isAnimating) return;

	// Clear previous end
	if (dsaState.end) {
		const [prevX, prevY] = dsaState.end;
		dsaState.grid[prevY][prevX].isEnd = false;
	}

	// Set new end
	const node = dsaState.grid[y]?.[x];
	if (node && !node.isWall && !node.isStart) {
		node.isEnd = true;
		node.isWall = false;
		dsaState.end = [x, y];
		// Trigger reactivity
		dsaState.grid = [...dsaState.grid];
	}
}

/**
 * Clear all walls from the pathfinding grid.
 * Resets all nodes except start and end points to empty state.
 */
export function clearWalls() {
	if (dsaState.mode !== 'PATHFINDING' || dsaState.isAnimating) return;

	// Clear walls from all nodes
	for (let y = 0; y < dsaState.gridSize.height; y++) {
		for (let x = 0; x < dsaState.gridSize.width; x++) {
			const node = dsaState.grid[y][x];
			if (node && !node.isStart && !node.isEnd) {
				node.isWall = false;
				node.isVisited = false;
				node.isPath = false;
				node.distance = Infinity;
				node.heuristic = 0;
				node.parent = null;
			}
		}
	}

	// Reset pathfinding statistics
	dsaState.visitedNodes = [];
	dsaState.path = [];
	dsaState.nodesVisited = 0;
	dsaState.pathLength = 0;
	dsaState.currentStep = 0;
	dsaState.totalSteps = 0;
	dsaState.completed = false;
}
