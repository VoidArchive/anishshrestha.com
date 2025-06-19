export type AlgorithmType = 'SORTING' | 'PATHFINDING';

export type SortingAlgorithm =
	| 'BUBBLE_SORT'
	| 'SELECTION_SORT'
	| 'INSERTION_SORT'
	| 'QUICK_SORT'
	| 'MERGE_SORT'
	| 'HEAP_SORT';

export type PathfindingAlgorithm = 'A_STAR' | 'DIJKSTRA' | 'BFS' | 'DFS';

export type DSAMove =
	| { type: 'COMPARE'; indices: [number, number] }
	| { type: 'SWAP'; indices: [number, number] }
	| { type: 'SET_VALUE'; index: number; value: number }
	| { type: 'HIGHLIGHT'; indices: number[] }
	| { type: 'VISIT_NODE'; position: [number, number] }
	| { type: 'SET_PATH'; path: [number, number][] }
	| { type: 'ADD_TO_FRONTIER'; position: [number, number] }
	| { type: 'REMOVE_FROM_FRONTIER'; position: [number, number] }
	| { type: 'STEP_COMPLETE' };

export type NodeState = 'unvisited' | 'frontier' | 'visited' | 'current' | 'path';

export interface GridNode {
	x: number;
	y: number;
	isWall: boolean;
	isStart: boolean;
	isEnd: boolean;
	isVisited: boolean;
	isPath: boolean;
	isFrontier: boolean;
	isCurrent: boolean;
	distance: number;
	heuristic: number;
	fScore?: number;
	gScore?: number;
	parent: GridNode | null;
}

export interface DSAState {
	mode: AlgorithmType;
	algorithm: SortingAlgorithm | PathfindingAlgorithm;

	// Sorting state
	array: number[];
	arraySize: number;
	comparing: number[];
	sorted: number[];

	// Pathfinding state
	grid: GridNode[][];
	gridSize: { width: number; height: number };
	start: [number, number] | null;
	end: [number, number] | null;
	visitedNodes: [number, number][];
	frontierNodes: [number, number][];
	currentNode: [number, number] | null;
	path: [number, number][];

	// Animation state
	currentStep: number;
	totalSteps: number;
	isAnimating: boolean;
	animationSpeed: number; // ms between steps
	completed: boolean;

	// Statistics
	comparisons: number;
	swaps: number;
	nodesVisited: number;
	pathLength: number;
}

export interface AnimationStep {
	move: DSAMove;
	description: string;
	state?: Partial<DSAState>;
}
