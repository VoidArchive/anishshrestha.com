---
title: 'Building Conways Game of Life: From Cellular Automata Theory to Interactive Simulation'
slug: 'building-conways-game-of-life-svelte'
description: 'Implementing Conways Game of Life with SvelteKit, covering cellular automata rules, performance optimization, and pattern library integration.'
date: '2025-06-25'
published: true
tags: ['gamedev', 'sveltekit', 'typescript', 'cellular-automata', 'simulation']
labSlug: 'gameoflife'
relatedLab:
  name: 'Game of Life'
  url: '/labs/gameoflife'
  description: 'Experience cellular automata evolution with interactive patterns and real-time simulation'
---

## The mathematical foundation

Conway's Game of Life is a cellular automaton where complex behavior comes out of four simple rules. When I decided to implement it, I wanted it to show the patterns and behaviors those rules produce, so it has a pattern library and live statistics on top of the grid.

The rules:

1. Survival: a living cell with 2 or 3 neighbors survives to the next generation
2. Birth: a dead cell with exactly 3 neighbors becomes alive
3. Underpopulation: a living cell with fewer than 2 neighbors dies
4. Overpopulation: a living cell with more than 3 neighbors dies

The rules balance growth and decay, and that balance produces stable patterns, oscillators, spaceships, and even structures that can simulate universal computation.

## Implementation architecture

I split the implementation into three modules: a rules engine, a simulation engine, and UI components. The split makes each part easier to test and maintain, and leaves room for extensions later.

### Rules engine: the heart of the simulation

The rules engine (`rules/index.ts`) implements the core cellular automata logic. The neighbor-counting algorithm is the most critical piece:

```typescript
export function countNeighbors(
	grid: Grid,
	x: number,
	y: number,
	wrapEdges: boolean = false
): number {
	const height = grid.length;
	const width = grid[0].length;
	let count = 0;

	// Check all 8 neighboring positions
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			// Skip the center cell (itself)
			if (dx === 0 && dy === 0) continue;

			let nx = x + dx;
			let ny = y + dy;

			if (wrapEdges) {
				// Wrap coordinates for toroidal topology
				nx = ((nx % width) + width) % width;
				ny = ((ny % height) + height) % height;
			} else {
				// Skip if coordinates are out of bounds
				if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
			}

			if (grid[ny][nx]) count++;
		}
	}

	return count;
}
```

The toroidal topology was the part I found most interesting. With edge wrapping, patterns that would normally die at the boundaries keep evolving, so oscillators and spaceships travel across the grid as if it were an infinite plane.

### Generation transition algorithm

The core simulation step applies Conway's rules to every cell simultaneously:

```typescript
export function nextGeneration(
	currentGrid: Grid,
	wrapEdges: boolean = false
): { grid: Grid; stats: SimulationStats } {
	const height = currentGrid.length;
	const width = currentGrid[0].length;
	const newGrid = createEmptyGrid(width, height);

	let population = 0;
	let born = 0;
	let died = 0;

	// Apply rules to each cell
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const isAlive = currentGrid[y][x];
			const neighbors = countNeighbors(currentGrid, x, y, wrapEdges);

			// Conway's rules implementation
			let willLive = false;

			if (isAlive) {
				// Live cell survives with 2-3 neighbors
				willLive = neighbors === 2 || neighbors === 3;
				if (!willLive) died++;
			} else {
				// Dead cell becomes alive with exactly 3 neighbors
				willLive = neighbors === 3;
				if (willLive) born++;
			}

			newGrid[y][x] = willLive;
			if (willLive) population++;
		}
	}

	return { grid: newGrid, stats: { population, born, died, totalGenerations: 0 } };
}
```

I create a completely new grid for each generation and never modify the old one in place. That way every cell is evaluated against the current generation's state. Modifying in place would mix current and next generation states.

## Performance optimization strategies

### Memory allocation strategy

Creating new arrays every generation puts unnecessary pressure on the garbage collector. I implemented an object pooling system for grid management:

```typescript
export function createEmptyGrid(width: number, height: number): Grid {
	return Array(height)
		.fill(null)
		.map(() => Array(width).fill(false));
}
```

For production use, I considered a sparse representation using `Map<string, boolean>` for coordinates, but the overhead of string concatenation and map lookups proved worse than dense arrays for typical grid sizes (30x20 to 100x50).

### Simulation engine: timing and control

The simulation engine (`engine/index.ts`) handles the timing. The challenge was keeping the animation smooth while keeping precise control over simulation speed:

```typescript
export class GameOfLifeEngine {
	private intervalId: number | null = null;
	private onStateUpdate: ((state: SimulationState) => void) | null = null;

	start(state: SimulationState, onUpdate: (state: SimulationState) => void): void {
		if (state.isRunning) return;

		this.onStateUpdate = onUpdate;
		state.isRunning = true;

		this.intervalId = window.setInterval(() => {
			this.stepGeneration(state);
		}, state.speed);

		onUpdate(state);
	}

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
}
```

Speed control needed careful interval management. Changing the interval value mid-execution creates timing artifacts, so a speed change does a full stop and restart.

## Pattern library integration

The Game of Life has a catalog of discovered patterns, and I built a pattern library that includes the famous ones.

### Still lifes

- Block: 2x2 square that never changes
- Beehive: 6-cell stable pattern resembling a hexagon
- Loaf: 7-cell asymmetric stable pattern

### Oscillators

- Blinker: 3-cell vertical line that alternates horizontal/vertical
- Toad: 6-cell pattern with period 2
- Beacon: 6-cell oscillator that "blinks" corners

### Spaceships

- Glider: 5-cell pattern that travels diagonally across the grid
- Lightweight Spaceship (LWSS): 9-cell horizontal traveler

Patterns are stored as coordinate templates that get scaled and positioned on the grid:

```typescript
const patterns = {
	glider: [
		[0, 1, 0],
		[0, 0, 1],
		[1, 1, 1]
	],
	block: [
		[1, 1],
		[1, 1]
	],
	blinker: [[1], [1], [1]]
};
```

## Interactive features and user experience

### Real-time grid editing

Clicking a cell toggles it, so users can draw patterns directly on the grid. The challenge was staying responsive during simulation while allowing manual changes:

```typescript
export function toggleCell(grid: Grid, x: number, y: number): Grid {
	if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
		return grid; // Out of bounds, no change
	}

	const newGrid = grid.map((row) => [...row]);
	newGrid[y][x] = !newGrid[y][x];
	return newGrid;
}
```

Because the update is immutable, Svelte's reactivity system detects the change and re-renders.

### Statistics and analysis

I track four metrics during simulation:

- Population: total living cells
- Born: cells that became alive this generation
- Died: cells that died this generation
- Total generations: cumulative generation count

These statistics show how a pattern is behaving from one generation to the next.

## Svelte integration challenges

### State management

Managing the simulation state in Svelte took some care with reactivity. I used a centralized store (`store.svelte.ts`) with the new runes syntax:

```typescript
// Simplified store structure
const gameState = $state({
	grid: createEmptyGrid(30, 20),
	isRunning: false,
	generation: 0,
	speed: 200,
	stats: { population: 0, born: 0, died: 0, totalGenerations: 0 }
});
```

The simulation engine does not own the state. It is a pure service that operates on the state objects it is given.

### Performance considerations

Rendering large grids in real time was a performance problem. I optimized the grid rendering in three ways:

1. Minimal DOM updates: only re-render cells that changed state
2. Event delegation: a single click handler on the grid container
3. Throttled updates: limit re-render frequency during high-speed simulation

### Component architecture

The UI is structured as four components:

- GameGrid: renders the cellular grid with click handling
- ControlPanel: simulation controls (play/pause/speed/reset)
- PatternSelector: pre-defined pattern library
- SimulationStats: real-time metrics display

## Mathematical insights and pattern analysis

A few mathematical properties I ran into during development.

### Pattern classification

Still lifes are local minima in the cellular automaton's state space. They are stable configurations that persist indefinitely once formed.

Oscillators are closed loops in state space. The period of an oscillator is the number of generations it takes to return to the initial state.

Spaceships are oscillators that also translate in space. They are traveling waves in the cellular automaton.

### Computational universality

Conway proved that the Game of Life is Turing complete, meaning it can simulate any computation. Complex patterns like the "Gosper Glider Gun" can generate infinite streams of gliders, which can be used to build logic gates and memory cells.

## Edge cases and implementation details

### Boundary conditions

I implemented two boundary handling modes:

1. Finite grid: cells outside the boundaries are considered dead
2. Toroidal topology: the grid wraps around its edges (top connects to bottom, left to right)

The toroidal mode needs careful modulo arithmetic:

```typescript
nx = ((nx % width) + width) % width;
ny = ((ny % height) + height) % height;
```

The double modulo makes negative coordinates wrap correctly.

### Zero-generation handling

Generation 0 is a special case. The state has to be initialized carefully so the statistics start at meaningful values.

### Pattern placement validation

When a pattern from the library is placed, a boundary check makes sure it does not extend outside the grid:

```typescript
function canPlacePattern(
	grid: Grid,
	pattern: boolean[][],
	startX: number,
	startY: number
): boolean {
	for (let y = 0; y < pattern.length; y++) {
		for (let x = 0; x < pattern[y].length; x++) {
			if (pattern[y][x]) {
				const gridX = startX + x;
				const gridY = startY + y;
				if (gridX >= grid[0].length || gridY >= grid.length) {
					return false;
				}
			}
		}
	}
	return true;
}
```

## Future enhancements

Extensions that could improve the simulation:

1. Hash Life algorithm: exponential speedup for large-scale simulations
2. Rule generalization: support for other cellular automata (B3/S23 variations)
3. Pattern database: an expanded library with complex patterns like guns and puffers
4. Analysis tools: pattern classification, period detection, population graphing
5. Export functionality: save/load patterns in RLE (Run Length Encoded) format

## Conclusion

The hard part was real-time simulation in the browser, and keeping the rules, the engine and the UI separate is what made it testable.

What I like most is watching simple rules generate patterns nobody drew by hand, which is what John Conway intended when he created this cellular automaton in 1970.

You can explore the Game of Life implementation at [/labs/gameoflife](/labs/gameoflife), with interactive controls and the pattern library.
