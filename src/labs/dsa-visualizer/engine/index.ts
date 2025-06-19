import type { BaseEngine } from '$core/engine/BaseEngine';
import type {
	DSAMove,
	DSAState,
	AnimationStep,
	AlgorithmType,
	SortingAlgorithm,
	PathfindingAlgorithm,
	GridNode
} from '../types';
import { SortingAlgorithms } from './algorithms/sorting';
import { PathfindingAlgorithms } from './algorithms/pathfinding';

export class DSAEngine implements BaseEngine<DSAMove, DSAState> {
	private animationSteps: AnimationStep[] = [];
	private stepGenerator: Generator<AnimationStep[], void, unknown> | null = null;
	private isGenerating: boolean = false;

	initialState(): DSAState {
		return {
			mode: 'SORTING',
			algorithm: 'BUBBLE_SORT',

			// Sorting state
			array: this.generateRandomArray(20, 10, 100),
			arraySize: 20,
			comparing: [],
			sorted: [],

			// Pathfinding state - optimized size for performance
			grid: this.createEmptyGrid(25, 15),
			gridSize: { width: 25, height: 15 },
			start: null,
			end: null,
			visitedNodes: [],
			frontierNodes: [],
			currentNode: null,
			path: [],

			// Animation state
			currentStep: 0,
			totalSteps: 0,
			isAnimating: false,
			animationSpeed: 100,
			completed: false,

			// Statistics
			comparisons: 0,
			swaps: 0,
			nodesVisited: 0,
			pathLength: 0
		};
	}

	validMoves(state: DSAState): DSAMove[] {
		if (state.isAnimating && state.currentStep < this.animationSteps.length) {
			return [this.animationSteps[state.currentStep].move];
		}

		// Return available control moves
		const moves: DSAMove[] = [];

		if (!state.isAnimating && !state.completed) {
			moves.push({ type: 'STEP_COMPLETE' }); // Start animation
		}

		return moves;
	}

	applyMove(state: DSAState, move: DSAMove): DSAState {
		const newState = { ...state };

		switch (move.type) {
			case 'COMPARE':
				newState.comparing = [...move.indices];
				newState.comparisons++;
				break;

			case 'SWAP':
				if (newState.mode === 'SORTING') {
					const [i, j] = move.indices;
					const newArray = [...newState.array];
					[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
					newState.array = newArray;
					newState.swaps++;
				}
				newState.comparing = [];
				break;

			case 'SET_VALUE':
				if (newState.mode === 'SORTING') {
					const newArray = [...newState.array];
					newArray[move.index] = move.value;
					newState.array = newArray;
				}
				break;

			case 'HIGHLIGHT':
				newState.comparing = [...move.indices];
				break;

			case 'VISIT_NODE':
				if (newState.mode === 'PATHFINDING') {
					newState.visitedNodes = [...newState.visitedNodes, move.position];
					newState.nodesVisited++;
				}
				break;

			case 'SET_PATH':
				if (newState.mode === 'PATHFINDING') {
					newState.path = [...move.path];
					newState.pathLength = move.path.length;
				}
				break;

			case 'STEP_COMPLETE':
				newState.currentStep++;
				if (newState.currentStep >= newState.totalSteps) {
					newState.completed = true;
					newState.isAnimating = false;
					newState.comparing = [];
				}
				break;
		}

		return newState;
	}

	evaluate(state: DSAState): number {
		if (state.completed) {
			return state.mode === 'SORTING'
				? 1000 - state.swaps - state.comparisons
				: 1000 - state.nodesVisited + state.pathLength;
		}

		return (state.currentStep / Math.max(state.totalSteps, 1)) * 100;
	}

	// Algorithm preparation methods
	prepareAlgorithm(state: DSAState): DSAState {
		this.animationSteps = [];
		this.stepGenerator = null;
		this.isGenerating = false;

		if (state.mode === 'SORTING') {
			// Sorting: Generate all steps upfront (fast)
			this.animationSteps = SortingAlgorithms.generateSteps(
				state.array,
				state.algorithm as SortingAlgorithm
			);
		} else if (state.mode === 'PATHFINDING') {
			// Pathfinding: Use streaming generation for instant start
			if (state.start && state.end) {
				try {
					const plainStart: [number, number] = [state.start[0], state.start[1]];
					const plainEnd: [number, number] = [state.end[0], state.end[1]];

					// Generate all steps for now (to fix current issues)
					// TODO: Implement true incremental generation later
					this.animationSteps = PathfindingAlgorithms.generateSteps(
						state.grid,
						state.algorithm as PathfindingAlgorithm,
						plainStart,
						plainEnd
					);

					// Clear generator since we have all steps
					this.stepGenerator = null;
				} catch (error) {
					console.error('Error initializing pathfinding stream:', error);
					this.animationSteps = [
						{
							move: { type: 'STEP_COMPLETE' },
							description: 'Failed to initialize pathfinding',
							state: { completed: true }
						}
					];
				}
			} else {
				// No start or end point set
				this.animationSteps = [
					{
						move: { type: 'STEP_COMPLETE' },
						description: 'Please set both start and end points',
						state: { completed: true }
					}
				];
			}
		}

		return {
			...state,
			currentStep: 0,
			totalSteps: this.animationSteps.length, // Always use actual length now
			isAnimating: true,
			completed: false,
			comparisons: 0,
			swaps: 0,
			nodesVisited: 0,
			pathLength: 0,
			comparing: [],
			sorted: [],
			visitedNodes: [],
			path: []
		};
	}

	// Utility methods
	generateRandomArray(size: number, min: number, max: number): number[] {
		return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
	}

	createEmptyGrid(width: number, height: number): GridNode[][] {
		const grid: GridNode[][] = [];

		for (let y = 0; y < height; y++) {
			grid[y] = [];
			for (let x = 0; x < width; x++) {
				grid[y][x] = {
					x,
					y,
					isWall: false,
					isStart: false,
					isEnd: false,
					isVisited: false,
					isPath: false,
					isFrontier: false,
					isCurrent: false,
					distance: Infinity,
					heuristic: 0,
					parent: null
				};
			}
		}

		return grid;
	}

	// State modification methods
	setAlgorithm(state: DSAState, algorithm: SortingAlgorithm | PathfindingAlgorithm): DSAState {
		return {
			...state,
			algorithm,
			completed: false,
			isAnimating: false,
			currentStep: 0,
			totalSteps: 0
		};
	}

	setMode(state: DSAState, mode: AlgorithmType): DSAState {
		const newState = {
			...state,
			mode,
			completed: false,
			isAnimating: false,
			currentStep: 0,
			totalSteps: 0,
			comparing: [],
			sorted: [],
			visitedNodes: [],
			path: [],
			start: null,
			end: null
		};

		if (mode === 'SORTING') {
			newState.algorithm = 'BUBBLE_SORT';
			newState.array = this.generateRandomArray(state.arraySize, 10, 100);
		} else {
			newState.algorithm = 'BFS';
			// Create optimized grid for pathfinding
			const gridSize = { width: 25, height: 15 };
			newState.grid = this.createEmptyGrid(gridSize.width, gridSize.height);
			newState.gridSize = gridSize;
		}

		return newState;
	}

	setArraySize(state: DSAState, size: number): DSAState {
		return {
			...state,
			arraySize: size,
			array: this.generateRandomArray(size, 10, 100),
			completed: false,
			isAnimating: false,
			currentStep: 0,
			totalSteps: 0,
			comparing: [],
			sorted: []
		};
	}

	shuffleArray(state: DSAState): DSAState {
		return {
			...state,
			array: this.generateRandomArray(state.arraySize, 10, 100),
			completed: false,
			isAnimating: false,
			currentStep: 0,
			totalSteps: 0,
			comparing: [],
			sorted: []
		};
	}

	getCurrentStep(): AnimationStep | null {
		if (this.animationSteps.length === 0) return null;

		return this.animationSteps[
			Math.min(this.animationSteps.length - 1, Math.max(0, this.animationSteps.length - 1))
		];
	}

	getStepAt(index: number): AnimationStep | null {
		if (index < 0) return null;

		// For streaming: aggressively load more batches if needed
		while (this.stepGenerator && index >= this.animationSteps.length - 5) {
			const loadedBatch = this.loadNextBatch();
			if (!loadedBatch) break; // No more batches available
		}

		if (index >= this.animationSteps.length) return null;
		return this.animationSteps[index];
	}

	// Batch management methods
	private getBatchSize(algorithm: PathfindingAlgorithm): number {
		// Algorithm-specific batch sizes for optimal performance
		switch (algorithm) {
			case 'A_STAR':
				return 30; // A* is efficient, larger batches
			case 'BFS':
				return 25; // BFS explores systematically
			case 'DIJKSTRA':
				return 20; // Dijkstra processes many nodes
			case 'DFS':
				return 15; // DFS can be unpredictable, smaller batches
			default:
				return 20;
		}
	}

	private loadNextBatch(): boolean {
		if (!this.stepGenerator || this.isGenerating) return false;

		this.isGenerating = true;
		try {
			const result = this.stepGenerator.next();
			if (!result.done && result.value && result.value.length > 0) {
				this.animationSteps.push(...result.value);
				return true; // Successfully loaded batch
			} else {
				// Generator finished
				this.stepGenerator = null;
				return false;
			}
		} catch (error) {
			console.error('Error loading next batch:', error);
			this.stepGenerator = null;
			return false;
		} finally {
			this.isGenerating = false;
		}
	}

	getStepDescription(state: DSAState): string {
		const step = this.getStepAt(state.currentStep);
		return step?.description || '';
	}

	getTotalSteps(): number {
		return this.animationSteps.length;
	}

	// Check if streaming is complete
	isStreamComplete(): boolean {
		return this.stepGenerator === null;
	}

	// Get current loaded step count for streaming progress
	getLoadedSteps(): number {
		return this.animationSteps.length;
	}
}
