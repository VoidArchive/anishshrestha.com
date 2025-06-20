/*
Pathfinding Algorithms Implementation

Implements various pathfinding algorithms for the DSA visualizer.
Includes BFS, DFS, Dijkstra's algorithm, and A* search.
Generates animation steps to visualize the algorithm execution.
*/

import type { AnimationStep, PathfindingAlgorithm, GridNode } from '../../types';

// Maximum animation steps to prevent browser hangs
// For 25x15 grid (375 cells), optimized for performance
const MAX_ANIMATION_STEPS = 4000;

/**
 * Simple priority queue implementation for Dijkstra's algorithm
 */
class PriorityQueue<T> {
	private items: T[] = [];
	private compare: (a: T, b: T) => number;

	constructor(compareFunction: (a: T, b: T) => number) {
		this.compare = compareFunction;
	}

	enqueue(item: T): void {
		this.items.push(item);
		this.bubbleUp(this.items.length - 1);
	}

	dequeue(): T | undefined {
		if (this.items.length === 0) return undefined;
		if (this.items.length === 1) return this.items.pop();

		const result = this.items[0];
		this.items[0] = this.items.pop()!;
		this.bubbleDown(0);
		return result;
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	private bubbleUp(index: number): void {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			if (this.compare(this.items[index], this.items[parentIndex]) >= 0) break;

			[this.items[index], this.items[parentIndex]] = [this.items[parentIndex], this.items[index]];
			index = parentIndex;
		}
	}

	private bubbleDown(index: number): void {
		while (true) {
			let minIndex = index;
			const leftChild = 2 * index + 1;
			const rightChild = 2 * index + 2;

			if (
				leftChild < this.items.length &&
				this.compare(this.items[leftChild], this.items[minIndex]) < 0
			) {
				minIndex = leftChild;
			}

			if (
				rightChild < this.items.length &&
				this.compare(this.items[rightChild], this.items[minIndex]) < 0
			) {
				minIndex = rightChild;
			}

			if (minIndex === index) break;

			[this.items[index], this.items[minIndex]] = [this.items[minIndex], this.items[index]];
			index = minIndex;
		}
	}
}

export class PathfindingAlgorithms {
	static generateSteps(
		grid: GridNode[][],
		algorithm: PathfindingAlgorithm,
		start: [number, number] | null,
		end: [number, number] | null
	): AnimationStep[] {
		if (!start || !end) {
			return [];
		}

		const steps: AnimationStep[] = [];

		switch (algorithm) {
			case 'BFS':
				return this.breadthFirstSearch(grid, start, end);
			case 'DFS':
				return this.depthFirstSearch(grid, start, end);
			case 'DIJKSTRA':
				return this.dijkstra(grid, start, end);
			case 'A_STAR':
				return this.aStar(grid, start, end);
			default:
				return steps;
		}
	}

	// New streaming API for lazy loading
	static *generateStepsStream(
		grid: GridNode[][],
		algorithm: PathfindingAlgorithm,
		start: [number, number] | null,
		end: [number, number] | null,
		batchSize: number = 20
	): Generator<AnimationStep[], void, unknown> {
		if (!start || !end) {
			return;
		}

		// Generate all steps first, then yield in batches
		// TODO: For true lazy loading, this should generate steps incrementally
		// For now, we generate all steps but yield them in batches for better UX
		const allSteps = this.generateSteps(grid, algorithm, start, end);

		for (let i = 0; i < allSteps.length; i += batchSize) {
			yield allSteps.slice(i, i + batchSize);
		}
	}

	/**
	 * Breadth-First Search implementation
	 * Explores all neighbors at current depth before moving to next depth
	 */
	private static breadthFirstSearch(
		grid: GridNode[][],
		start: [number, number],
		end: [number, number]
	): AnimationStep[] {
		// Input validation
		if (
			!this.isValidCoordinate(grid, start[0], start[1]) ||
			!this.isValidCoordinate(grid, end[0], end[1])
		) {
			return [this.createErrorStep('Invalid start or end coordinates')];
		}

		if (grid[start[1]][start[0]].isWall || grid[end[1]][end[0]].isWall) {
			return [this.createErrorStep('Start or end point is on a wall')];
		}

		const steps: AnimationStep[] = [];
		const [startX, startY] = start;
		const [endX, endY] = end;

		// Handle trivial case
		if (startX === endX && startY === endY) {
			return [
				{
					move: { type: 'SET_PATH', path: [[startX, startY]] },
					description: 'Start and end are the same point',
					state: {
						path: [[startX, startY]],
						pathLength: 1,
						completed: true
					}
				}
			];
		}

		const visited = new Set<string>();
		const previous = new Map<string, [number, number] | null>();
		const queue: { x: number; y: number }[] = [];
		let nodesVisitedCount = 0;

		// Initial setup step
		steps.push({
			move: { type: 'HIGHLIGHT', indices: [] },
			description: `Starting BFS from (${startX}, ${startY}) to (${endX}, ${endY})`,
			state: {
				grid: this.updateGridWithCurrent(grid, startX, startY)
			}
		});

		queue.push({ x: startX, y: startY });
		visited.add(`${startX},${startY}`);
		previous.set(`${startX},${startY}`, null);

		while (queue.length > 0 && steps.length < MAX_ANIMATION_STEPS) {
			const current = queue.shift()!;
			const { x, y } = current;

			// CRITICAL FIX: Only check for end when processing from queue
			if (x === endX && y === endY) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Found target node at (${x}, ${y})`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: ++nodesVisitedCount
					}
				});

				const path = this.reconstructPath(previous, start, end);
				steps.push({
					move: { type: 'SET_PATH', path },
					description: `Path found! Length: ${path.length}`,
					state: {
						grid: this.updateGridWithPath(grid, path),
						path,
						pathLength: path.length,
						completed: true
					}
				});
				return steps;
			}

			// Visit current node (mark as visited) - only for non-start nodes
			if (!(x === startX && y === startY)) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Visiting node (${x}, ${y})`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: ++nodesVisitedCount
					}
				});
			}

			// Explore neighbors - NO early termination here
			const neighbors = this.getNeighbors(grid, x, y);
			for (const [nx, ny] of neighbors) {
				const key = `${nx},${ny}`;

				if (!visited.has(key) && !grid[ny][nx].isWall) {
					visited.add(key);
					previous.set(key, [x, y]);
					queue.push({ x: nx, y: ny });
				}
			}
		}

		// Check termination condition
		if (steps.length >= MAX_ANIMATION_STEPS) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'Algorithm terminated (step limit reached)',
				state: { completed: true }
			});
		} else if (steps.length === 0 || !steps[steps.length - 1].state?.completed) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'No path found - Start and end are not connected',
				state: {
					completed: true,
					path: [], // Explicitly set empty path
					pathLength: 0
				}
			});
		}

		return steps;
	}

	/**
	 * Depth-First Search implementation
	 * Explores as far as possible along each branch before backtracking
	 */
	private static depthFirstSearch(
		grid: GridNode[][],
		start: [number, number],
		end: [number, number]
	): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const [startX, startY] = start;
		const [endX, endY] = end;
		const visited = new Set<string>();
		const previous = new Map<string, [number, number] | null>();
		const stack: { x: number; y: number }[] = [];

		// Use iterative DFS instead of recursive to have better control
		stack.push({ x: startX, y: startY });
		visited.add(`${startX},${startY}`);
		previous.set(`${startX},${startY}`, null);

		// Initial setup step
		steps.push({
			move: { type: 'HIGHLIGHT', indices: [] },
			description: `Starting DFS from (${startX}, ${startY}) to (${endX}, ${endY})`,
			state: {
				grid: this.updateGridWithCurrent(grid, startX, startY)
			}
		});

		while (stack.length > 0 && steps.length < MAX_ANIMATION_STEPS) {
			const current = stack.pop()!;
			const { x, y } = current;

			// Check if we reached the end
			if (x === endX && y === endY) {
				// Still add visit step for the end node
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Found target node at (${x}, ${y})`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: steps.filter((s) => s.move.type === 'VISIT_NODE').length + 1
					}
				});

				const path = this.reconstructPath(previous, start, end);
				steps.push({
					move: { type: 'SET_PATH', path },
					description: `Path found! Length: ${path.length}`,
					state: {
						grid: this.updateGridWithPath(grid, path),
						path,
						pathLength: path.length,
						completed: true
					}
				});
				break;
			}

			// Visit current node (mark as visited) - only for non-start nodes
			if (!(x === startX && y === startY)) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Visiting node (${x}, ${y})`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: steps.filter((s) => s.move.type === 'VISIT_NODE').length + 1
					}
				});
			}

			// Explore neighbors (in reverse order for DFS behavior)
			const neighbors = this.getNeighbors(grid, x, y).reverse();

			for (const [nx, ny] of neighbors) {
				const key = `${nx},${ny}`;

				if (!visited.has(key) && !grid[ny][nx].isWall) {
					visited.add(key);
					previous.set(key, [x, y]);
					stack.push({ x: nx, y: ny });
				}
			}
		}

		// Check termination condition
		if (steps.length >= MAX_ANIMATION_STEPS) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'Algorithm terminated (step limit reached)',
				state: { completed: true }
			});
		} else if (steps.length === 0 || !steps[steps.length - 1].state?.completed) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'No path found - Start and end are not connected',
				state: {
					completed: true,
					path: [], // Explicitly set empty path
					pathLength: 0
				}
			});
		}

		return steps;
	}

	/**
	 * Dijkstra's algorithm implementation
	 * Finds shortest path using weighted distances with proper priority queue
	 */
	private static dijkstra(
		grid: GridNode[][],
		start: [number, number],
		end: [number, number]
	): AnimationStep[] {
		// Input validation
		if (
			!this.isValidCoordinate(grid, start[0], start[1]) ||
			!this.isValidCoordinate(grid, end[0], end[1])
		) {
			return [this.createErrorStep('Invalid start or end coordinates')];
		}

		if (grid[start[1]][start[0]].isWall || grid[end[1]][end[0]].isWall) {
			return [this.createErrorStep('Start or end point is on a wall')];
		}

		const steps: AnimationStep[] = [];
		const [startX, startY] = start;
		const [endX, endY] = end;

		// Handle trivial case
		if (startX === endX && startY === endY) {
			return [
				{
					move: { type: 'SET_PATH', path: [[startX, startY]] },
					description: 'Start and end are the same point',
					state: {
						path: [[startX, startY]],
						pathLength: 1,
						completed: true
					}
				}
			];
		}

		const distances = new Map<string, number>();
		const previous = new Map<string, [number, number] | null>();
		const priorityQueue = new PriorityQueue<{
			key: string;
			x: number;
			y: number;
			distance: number;
		}>((a, b) => a.distance - b.distance);
		const visited = new Set<string>();
		let nodesVisitedCount = 0;

		// Initialize distances
		for (let y = 0; y < grid.length; y++) {
			for (let x = 0; x < grid[0].length; x++) {
				const key = `${x},${y}`;
				const distance = x === startX && y === startY ? 0 : Infinity;
				distances.set(key, distance);
				previous.set(key, null);

				if (!grid[y][x].isWall) {
					priorityQueue.enqueue({ key, x, y, distance });
				}
			}
		}

		// Initial setup step
		steps.push({
			move: { type: 'HIGHLIGHT', indices: [] },
			description: `Starting Dijkstra from (${startX}, ${startY}) to (${endX}, ${endY})`,
			state: {
				grid: this.updateGridWithCurrent(grid, startX, startY)
			}
		});

		while (!priorityQueue.isEmpty() && steps.length < MAX_ANIMATION_STEPS) {
			const current = priorityQueue.dequeue()!;
			const { x, y, distance: currentDistance } = current;
			const currentKey = `${x},${y}`;

			// Skip if already visited (could happen due to priority queue updates)
			if (visited.has(currentKey)) continue;
			visited.add(currentKey);

			// CRITICAL: Check for end ONLY when selected as minimum by Dijkstra
			if (x === endX && y === endY) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Found target node at (${x}, ${y}) with distance ${currentDistance}`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: ++nodesVisitedCount
					}
				});

				const path = this.reconstructPath(previous, start, end);
				steps.push({
					move: { type: 'SET_PATH', path },
					description: `Shortest path found! Length: ${path.length}`,
					state: {
						grid: this.updateGridWithPath(grid, path),
						path,
						pathLength: path.length,
						completed: true
					}
				});
				return steps;
			}

			// Visit current node
			if (!(x === startX && y === startY)) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Visiting node (${x}, ${y}) with distance ${currentDistance}`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: ++nodesVisitedCount
					}
				});
			}

			// Update distances to neighbors
			const neighbors = this.getNeighbors(grid, x, y);
			for (const [nx, ny] of neighbors) {
				const neighborKey = `${nx},${ny}`;
				if (!visited.has(neighborKey) && !grid[ny][nx].isWall) {
					const newDistance = currentDistance + 1; // All edges have weight 1
					const oldDistance = distances.get(neighborKey)!;

					if (newDistance < oldDistance) {
						distances.set(neighborKey, newDistance);
						previous.set(neighborKey, [x, y]);
						// Add updated distance to priority queue
						priorityQueue.enqueue({ key: neighborKey, x: nx, y: ny, distance: newDistance });
					}
				}
			}
		}

		// Check termination condition
		if (steps.length >= MAX_ANIMATION_STEPS) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'Algorithm terminated (step limit reached)',
				state: { completed: true }
			});
		} else if (steps.length === 0 || !steps[steps.length - 1].state?.completed) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'No path found - Start and end are not connected',
				state: {
					completed: true,
					path: [], // Explicitly set empty path
					pathLength: 0
				}
			});
		}

		return steps;
	}

	/**
	 * A* search algorithm implementation
	 * Uses heuristic to guide search toward goal
	 */
	private static aStar(
		grid: GridNode[][],
		start: [number, number],
		end: [number, number]
	): AnimationStep[] {
		const steps: AnimationStep[] = [];
		const [startX, startY] = start;
		const [endX, endY] = end;

		const gScore = new Map<string, number>();
		const fScore = new Map<string, number>();
		const previous = new Map<string, [number, number] | null>();
		const openSet = new Set<string>();
		const closedSet = new Set<string>();

		const startKey = `${startX},${startY}`;
		gScore.set(startKey, 0);
		fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
		openSet.add(startKey);

		while (openSet.size > 0 && steps.length < MAX_ANIMATION_STEPS) {
			// Find node in openSet with lowest fScore
			let current: [number, number] | null = null;
			let minF = Infinity;

			for (const key of openSet) {
				const f = fScore.get(key) || Infinity;
				if (f < minF) {
					minF = f;
					const [x, y] = key.split(',').map(Number);
					current = [x, y];
				}
			}

			if (!current) break;

			const [x, y] = current;
			const currentKey = `${x},${y}`;

			openSet.delete(currentKey);
			closedSet.add(currentKey);

			// Check if we reached the end FIRST
			if (x === endX && y === endY) {
				// Still add visit step for the end node
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Found target node at (${x}, ${y}) with f-score ${minF.toFixed(1)}`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: steps.filter((s) => s.move.type === 'VISIT_NODE').length + 1
					}
				});

				const path = this.reconstructPath(previous, start, end);
				steps.push({
					move: { type: 'SET_PATH', path },
					description: `Optimal path found! Length: ${path.length}`,
					state: {
						grid: this.updateGridWithPath(grid, path),
						path,
						pathLength: path.length,
						completed: true
					}
				});
				break;
			}

			// Visit current node (only for non-start, non-end nodes)
			if (!(x === startX && y === startY)) {
				steps.push({
					move: { type: 'VISIT_NODE', position: [x, y] },
					description: `Visiting node (${x}, ${y}) with f-score ${minF.toFixed(1)}`,
					state: {
						grid: this.updateGrid(grid, x, y, 'visited'),
						nodesVisited: steps.filter((s) => s.move.type === 'VISIT_NODE').length + 1
					}
				});
			}

			// Examine neighbors
			const neighbors = this.getNeighbors(grid, x, y);
			for (const [nx, ny] of neighbors) {
				const neighborKey = `${nx},${ny}`;

				if (closedSet.has(neighborKey) || grid[ny][nx].isWall) {
					continue;
				}

				const tentativeG = (gScore.get(currentKey) || 0) + 1;

				if (!openSet.has(neighborKey)) {
					openSet.add(neighborKey);
				} else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
					continue;
				}

				previous.set(neighborKey, [x, y]);
				gScore.set(neighborKey, tentativeG);
				fScore.set(neighborKey, tentativeG + this.heuristic(nx, ny, endX, endY));
			}
		}

		// Check termination condition
		if (steps.length >= MAX_ANIMATION_STEPS) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'Algorithm terminated (step limit reached)',
				state: { completed: true }
			});
		} else if (steps.length === 0 || !steps[steps.length - 1].state?.completed) {
			steps.push({
				move: { type: 'STEP_COMPLETE' },
				description: 'No path found - Start and end are not connected',
				state: {
					completed: true,
					path: [], // Explicitly set empty path
					pathLength: 0
				}
			});
		}

		return steps;
	}

	/**
	 * Manhattan distance heuristic for A*
	 */
	private static heuristic(x1: number, y1: number, x2: number, y2: number): number {
		return Math.abs(x1 - x2) + Math.abs(y1 - y2);
	}

	/**
	 * Reconstructs path from previous node mapping
	 */
	private static reconstructPath(
		previous: Map<string, [number, number] | null>,
		start: [number, number],
		end: [number, number]
	): [number, number][] {
		const path: [number, number][] = [];
		let current: [number, number] | null = end;

		while (current) {
			path.unshift(current);
			const key: string = `${current[0]},${current[1]}`;
			current = previous.get(key) || null;
		}

		return path;
	}

	/**
	 * Gets valid neighbors of a grid cell
	 */
	private static getNeighbors(grid: GridNode[][], x: number, y: number): [number, number][] {
		const neighbors: [number, number][] = [];
		const directions = [
			[0, -1], // up
			[1, 0], // right
			[0, 1], // down
			[-1, 0] // left
		];

		for (const [dx, dy] of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
				neighbors.push([nx, ny]);
			}
		}

		return neighbors;
	}

	/**
	 * Updates grid with visited node
	 */
	private static updateGrid(
		grid: GridNode[][],
		x: number,
		y: number,
		type: 'visited'
	): GridNode[][] {
		const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
		if (newGrid[y] && newGrid[y][x]) {
			newGrid[y][x].isVisited = type === 'visited';
		}
		return newGrid;
	}

	/**
	 * Updates grid with final path
	 */
	private static updateGridWithPath(grid: GridNode[][], path: [number, number][]): GridNode[][] {
		const newGrid = grid.map((row) => row.map((node) => ({ ...node })));

		for (const [x, y] of path) {
			if (newGrid[y] && newGrid[y][x] && !newGrid[y][x].isStart && !newGrid[y][x].isEnd) {
				newGrid[y][x].isPath = true;
			}
		}

		return newGrid;
	}

	/**
	 * Updates grid with frontier node
	 */
	private static updateGridWithFrontier(grid: GridNode[][], x: number, y: number): GridNode[][] {
		const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
		if (newGrid[y] && newGrid[y][x]) {
			newGrid[y][x].isFrontier = true;
		}
		return newGrid;
	}

	/**
	 * Updates grid with current exploring node
	 */
	private static updateGridWithCurrent(grid: GridNode[][], x: number, y: number): GridNode[][] {
		const newGrid = grid.map((row) => row.map((node) => ({ ...node })));

		// Clear previous current nodes
		for (const row of newGrid) {
			for (const node of row) {
				node.isCurrent = false;
			}
		}

		// Set new current node
		if (newGrid[y] && newGrid[y][x]) {
			newGrid[y][x].isCurrent = true;
		}
		return newGrid;
	}

	/**
	 * Validates if coordinates are within grid bounds
	 */
	private static isValidCoordinate(grid: GridNode[][], x: number, y: number): boolean {
		return x >= 0 && x < grid[0]?.length && y >= 0 && y < grid.length;
	}

	/**
	 * Creates an error step for invalid inputs
	 */
	private static createErrorStep(message: string): AnimationStep {
		return {
			move: { type: 'STEP_COMPLETE' },
			description: message,
			state: { completed: true }
		};
	}
}
