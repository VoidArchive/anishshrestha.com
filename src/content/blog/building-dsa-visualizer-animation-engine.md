---
title: 'Building a DSA Visualizer and Its Animation Engine'
slug: 'building-dsa-visualizer-animation-engine'
description: 'How I built an interactive data structures and algorithms visualizer with step-by-step animations, covering sorting, pathfinding and performance optimization.'
date: '2025-06-25'
published: true
tags: ['algorithms', 'visualization', 'sveltekit', 'typescript', 'education']
labSlug: 'dsa-visualizer'
relatedLab:
  name: 'DSA Visualizer'
  url: '/labs/dsa-visualizer'
  description: 'Try the interactive visualizer with sorting algorithms and pathfinding in action'
---

## The educational motivation

When I started building the DSA Visualizer, I wanted an interactive tool that shows an algorithm one step at a time, which a static explanation can't do. I looked at the existing visualizers first, and most of them were either too simple or overwhelming. I wanted something in between that was still worth playing with.

The hard part was building one animation system for two very different kinds of algorithm: sorting, which works on arrays, and pathfinding, which works on graphs. Both needed smooth animation, step controls and annotations that explain each step, but their data structures and the way they are drawn have nothing in common.

## Animation engine architecture

### Step-based animation system

The visualizer runs on a step-based animation engine that breaks each algorithm into discrete moves it can draw. Each algorithm generates a sequence of `AnimationStep` objects that describe state changes:

```typescript
interface AnimationStep {
	move: DSAMove; // The fundamental operation
	description: string;
	state: Partial<VisualizationState>; // Visual state changes
}

interface DSAMove {
	type: 'COMPARE' | 'SWAP' | 'SET_VALUE' | 'HIGHLIGHT' | 'STEP_COMPLETE';
	indices?: number[]; // Array positions affected
	index?: number; // Single position operations
	value?: number; // Value assignments
}
```

Because of this, the engine does not need to know which algorithm it is running. Bubble sort comparing adjacent elements and Dijkstra's algorithm exploring graph nodes both reduce to a few basic moves that the renderer can draw.

### State management and immutability

State updates are immutable. Each step produces a new state and never modifies the existing one:

```typescript
steps.push({
	move: { type: 'SWAP', indices: [j, j + 1] },
	description: `Swapping elements at positions ${j} and ${j + 1}`,
	state: {
		array: [...arr], // New array copy
		comparing: [],
		swaps: steps.filter((s) => s.move.type === 'SWAP').length + 1
	}
});
```

The UI can hold a reference to any state object without worrying that it will be mutated later. It also makes step-backward and state history possible.

## Sorting algorithm implementations

### Bubble sort: the pedagogical foundation

I started with bubble sort because it is easy to see. Large elements "bubble" toward the end of the array, and that animates clearly:

```typescript
private static bubbleSort(arr: number[]): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            steps.push({
                move: { type: 'COMPARE', indices: [j, j + 1] },
                description: `Comparing elements at positions ${j} and ${j + 1}`,
                state: { comparing: [j, j + 1] }
            });

            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                steps.push({
                    move: { type: 'SWAP', indices: [j, j + 1] },
                    description: `Swapping elements at positions ${j} and ${j + 1}`,
                    state: {
                        array: [...arr],
                        comparing: [],
                        swaps: steps.filter(s => s.move.type === 'SWAP').length + 1
                    },

                });
            }
        }
        // Mark element as sorted
        steps.push({
            move: { type: 'HIGHLIGHT', indices: [n - i - 1] },
            description: `Element at position ${n - i - 1} is now in its final position`,
            state: {
                comparing: [],
                sorted: Array.from({ length: i + 1 }, (_, k) => n - k - 1)
            }
        });
    }

    return steps;
}
```

I track several pieces of visual state at once: `comparing` for current comparisons, `sorted` for finalized positions, and `swaps` for statistics. Together they show how far the algorithm has got.

### Quick sort: recursive visualization challenge

Quick sort was harder because it is recursive. I needed to show the partitioning and still keep the context of the recursive calls:

```typescript
private static quickSort(arr: number[], low: number, high: number): AnimationStep[] {
    const steps: AnimationStep[] = [];

    if (low < high) {
        // Add partitioning step
        steps.push({
            move: { type: 'HIGHLIGHT', indices: [low, high] },
            description: `Sorting subarray from ${low} to ${high}`,
            state: { pivot: high, partitioning: [low, high] }
        });

        const { pivotIndex, partitionSteps } = this.partition(arr, low, high);
        steps.push(...partitionSteps);

        // Recursive calls
        steps.push(...this.quickSort(arr, low, pivotIndex - 1));
        steps.push(...this.quickSort(arr, pivotIndex + 1, high));
    }

    return steps;
}
```

The partition function generates its own sequence of steps, which get merged into the main sequence. The algorithm is a tree of calls, but the visualization plays it as one linear sequence.

### Merge sort: memory visualization

Merge sort does its merging in temporary arrays, and that had to be shown too. I solved this by tracking merge operations explicitly:

```typescript
private static merge(arr: number[], left: number, mid: number, right: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
        steps.push({
            move: { type: 'COMPARE', indices: [left + i, mid + 1 + j] },
            description: `Comparing ${leftArr[i]} and ${rightArr[j]}`,
            state: { comparing: [left + i, mid + 1 + j], merging: [left, right] }
        });

        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            steps.push({
                move: { type: 'SET_VALUE', index: k, value: leftArr[i] },
                description: `Placing ${leftArr[i]} at position ${k}`,
                state: { array: [...arr], merging: [left, right] }
            });
            i++;
        } else {
            arr[k] = rightArr[j];
            steps.push({
                move: { type: 'SET_VALUE', index: k, value: rightArr[j] },
                description: `Placing ${rightArr[j]} at position ${k}`,
                state: { array: [...arr], merging: [left, right] }
            });
            j++;
        }
        k++;
    }

    return steps;
}
```

The hard part was keeping the picture readable while elements from two sorted subarrays interleave into a single sorted array.

## Pathfinding algorithm architecture

### Graph representation

Pathfinding algorithms work on graphs, so they need a different data structure:

```typescript
interface GridNode {
	x: number;
	y: number;
	type: 'EMPTY' | 'WALL' | 'START' | 'END';
	distance?: number; // For Dijkstra's algorithm
	heuristic?: number; // For A* algorithm
	parent?: GridNode; // For path reconstruction
	visited?: boolean; // For traversal tracking
}

type PathfindingGrid = GridNode[][];
```

A grid is easy to draw and still supports the graph operations the pathfinding algorithms need.

### Breadth-first search: layer-by-layer exploration

BFS was a good first pathfinding algorithm to visualize, because it explores layer by layer and the pattern is obvious on screen:

```typescript
private static bfs(grid: PathfindingGrid, start: GridNode, end: GridNode): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const queue: GridNode[] = [start];
    const visited = new Set<string>();

    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        const current = queue.shift()!;

        steps.push({
            move: { type: 'VISIT_NODE', node: current },
            description: `Exploring node at (${current.x}, ${current.y})`,
            state: { currentNode: current, visited: Array.from(visited) }
        });

        if (current === end) {
            // Path found - reconstruct and visualize
            const path = this.reconstructPath(current);
            steps.push({
                move: { type: 'PATH_FOUND', path },
                description: 'Shortest path found!',
                state: { path, completed: true }
            });
            break;
        }

        // Explore neighbors
        for (const neighbor of this.getNeighbors(grid, current)) {
            const key = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(key) && neighbor.type !== 'WALL') {
                visited.add(key);
                neighbor.parent = current;
                queue.push(neighbor);

                steps.push({
                    move: { type: 'ADD_TO_FRONTIER', node: neighbor },
                    description: `Adding (${neighbor.x}, ${neighbor.y}) to queue`,
                    state: { frontier: [...queue] }
                });
            }
        }
    }

    return steps;
}
```

### A\* algorithm: heuristic optimization

A\* needed two costs on screen: the distance from the start (g-cost) and the estimated distance to the goal (h-cost):

```typescript
private static aStar(grid: PathfindingGrid, start: GridNode, end: GridNode): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const openSet = [start];
    const closedSet = new Set<string>();

    start.distance = 0;
    start.heuristic = this.manhattanDistance(start, end);

    while (openSet.length > 0) {
        // Find node with lowest f-score (g + h)
        const current = openSet.reduce((lowest, node) => {
            const currentF = (node.distance || 0) + (node.heuristic || 0);
            const lowestF = (lowest.distance || 0) + (lowest.heuristic || 0);
            return currentF < lowestF ? node : lowest;
        });

        steps.push({
            move: { type: 'VISIT_NODE', node: current },
            description: `Exploring node at (${current.x}, ${current.y}) with f-score ${(current.distance || 0) + (current.heuristic || 0)}`,
            state: {
                currentNode: current,
                gCost: current.distance,
                hCost: current.heuristic,
                fCost: (current.distance || 0) + (current.heuristic || 0)
            }
        });

        // Process neighbors with cost calculations
        for (const neighbor of this.getNeighbors(grid, current)) {
            const tentativeDistance = (current.distance || 0) + 1;

            if (tentativeDistance < (neighbor.distance || Infinity)) {
                neighbor.parent = current;
                neighbor.distance = tentativeDistance;
                neighbor.heuristic = this.manhattanDistance(neighbor, end);

                steps.push({
                    move: { type: 'UPDATE_COST', node: neighbor },
                    description: `Updated costs for (${neighbor.x}, ${neighbor.y}): g=${neighbor.distance}, h=${neighbor.heuristic}`,
                    state: { updatedNode: neighbor }
                });
            }
        }
    }

    return steps;
}
```

With the Manhattan distance heuristic, A\* still finds optimal paths and performs significantly better than Dijkstra's algorithm.

## Performance optimization strategies

### Animation timing optimization

Getting the timing right across different algorithms took some tuning. These are the speed settings:

```typescript
const speedSettings = {
	INSTANT: 0, // No delay
	ULTRA_FAST: 10, // 10ms between steps
	VERY_FAST: 25, // 25ms between steps
	FAST: 50, // 50ms between steps
	NORMAL: 100, // 100ms between steps
	SLOW: 250, // 250ms between steps
	VERY_SLOW: 500 // 500ms between steps
};
```

Instant mode is for performance testing and algorithm analysis. The slower speeds are for learning.

### Memory management

With arrays of up to 50 elements and algorithms generating 1000+ steps, memory use started to matter:

```typescript
// Avoid creating unnecessary array copies
state: {
    array: [...arr],  // Only copy when array actually changes
    comparing: [i, j],  // Reuse indices rather than copying
    sorted: this.getSortedIndices(i)  // Generate indices lazily
}
```

Evaluating visualization state lazily reduces memory pressure during long algorithm runs.

## User interface integration

### Real-time control system

The control panel needed to support several ways of driving the animation:

1. Play/pause starts and stops automatic stepping
2. Step forward/backward gives manual control for detailed analysis
3. Speed control adjusts the timing while it runs
4. Skip to end jumps to the final sorted state
5. Reset returns to the initial state

```typescript
// In the control engine
function stepForward(state: VisualizationState): void {
	if (state.currentStep < state.totalSteps - 1) {
		state.currentStep++;
		const step = state.allSteps[state.currentStep];
		applyStep(state, step);
	}
}

function stepBackward(state: VisualizationState): void {
	if (state.currentStep > 0) {
		state.currentStep--;
		reconstructStateAtStep(state, state.currentStep);
	}
}
```

Stepping backward means reconstructing the state from the beginning up to the target step, because the animation system only stores forward deltas.

### Responsive grid rendering

The visualization grid has to handle different array sizes and screen sizes:

```typescript
// Dynamic sizing based on array length and viewport
function calculateBarDimensions(arrayLength: number, containerWidth: number) {
	const maxBarWidth = 60;
	const minBarWidth = 4;
	const gap = 2;

	const availableWidth = containerWidth - gap * (arrayLength - 1);
	const calculatedWidth = Math.floor(availableWidth / arrayLength);

	return {
		width: Math.max(minBarWidth, Math.min(maxBarWidth, calculatedWidth)),
		gap: gap
	};
}
```

The bars stay readable across array sizes and device screens.

## Educational design decisions

> A fun developer fact: all those statistics you see in the UI (comparisons, swaps, steps, operation counts) were originally `console.log()` debug statements. I had so many debugging variables scattered through my code to track what was happening during a run that I turned them into a proper stats card UI instead of deleting them. Sometimes the best features come from refusing to clean up your debugging mess.

### Algorithm complexity display

I added real-time complexity analysis to back up the theory:

```typescript
const algorithmComplexity = {
	BUBBLE_SORT: { time: 'O(n²)', space: 'O(1)', comparisons: 0, swaps: 0 },
	MERGE_SORT: { time: 'O(n log n)', space: 'O(n)', comparisons: 0, swaps: 0 },
	QUICK_SORT: { time: 'O(n log n) avg, O(n²) worst', space: 'O(log n)', comparisons: 0, swaps: 0 }
};
```

Showing the theoretical complexity next to the actual operation counts helps students connect the analysis with what the algorithm really does.

### Progressive disclosure

The interface uses progressive disclosure so beginners are not overwhelmed:

1. Basic mode has play/pause controls and speed adjustment
2. Advanced mode has step controls, statistics, and complexity analysis
3. Expert mode has algorithm parameter tuning and custom array input

### Interactive array manipulation

Users can shuffle, sort, or manually arrange the initial array:

```typescript
function shuffleArray(array: number[]): number[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Generate arrays with specific characteristics
function generateWorstCase(algorithm: SortingAlgorithm, size: number): number[] {
	switch (algorithm) {
		case 'QUICK_SORT':
			return Array.from({ length: size }, (_, i) => size - i); // Reverse sorted
		case 'BUBBLE_SORT':
			return Array.from({ length: size }, (_, i) => size - i); // Reverse sorted
		default:
			return shuffleArray(Array.from({ length: size }, (_, i) => i + 1));
	}
}
```

That lets you try an algorithm on its best case, worst case and average case.

## Technical challenges and solutions

### Cross-algorithm state management

Different algorithms need different visualization state. Sorting algorithms need array indices and comparison states, and pathfinding needs grid coordinates and path information. I solved this with a flexible state union:

```typescript
interface VisualizationState {
	// Common properties
	currentStep: number;
	totalSteps: number;
	isAnimating: boolean;

	// Sorting-specific
	array?: number[];
	comparing?: number[];
	sorted?: number[];
	swaps?: number;

	// Pathfinding-specific
	grid?: PathfindingGrid;
	currentNode?: GridNode;
	path?: GridNode[];
	visited?: Set<string>;
}
```

Each component reads the properties it understands and ignores the rest.

### Animation synchronization

Keeping animations smooth across different rendering contexts took careful timing coordination:

```typescript
class AnimationController {
	private animationFrame: number | null = null;

	private animate = (timestamp: number) => {
		if (this.shouldStep(timestamp)) {
			this.stepForward();
		}

		if (this.isRunning) {
			this.animationFrame = requestAnimationFrame(this.animate);
		}
	};

	private shouldStep(timestamp: number): boolean {
		return timestamp - this.lastStepTime >= this.stepInterval;
	}
}
```

Using `requestAnimationFrame` keeps the animations in sync with the browser's refresh rate.

## Future enhancements and lessons learned

### Potential extensions

1. 3D visualizations, since heap operations could benefit from a tree-structure view
2. Sound design, with audio feedback for comparisons and swaps to help accessibility
3. Algorithm racing, a side-by-side comparison of different algorithms on the same data
4. Custom algorithm support, with user-defined step sequences for novel algorithms
5. Performance profiling that measures actual execution time against theoretical complexity in real time

### Key design insights

Treating each animation step as an immutable state transition simplified debugging and made features like step-backward navigation possible. Starting with simple algorithms and adding complexity gradually helped validate the architecture.

Finding the right animation granularity, detailed enough to teach and still practical as a demonstration, took extensive user testing.

## Conclusion

Implementing the algorithms was the smaller part of the work. The larger part was an animation system that shows an abstract concept without overwhelming the learner.

The step-based architecture was flexible enough to handle both sorting and pathfinding with the same controls, and it lets people step through an algorithm and find the patterns themselves.

_The DSA Visualizer is at [/labs/dsa-visualizer](/labs/dsa-visualizer), with the full algorithm library and animation controls._
