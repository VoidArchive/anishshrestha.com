---
title: 'Why My Pathfinding Visualizer Forgot Its Past'
slug: 'pathfinding-visualizer-forgot-its-past'
description: 'For a year my pathfinding grid lit one cell at a time, because every step snapshotted the original grid instead of the live one. One working grid fixed it.'
date: '2026-11-04'
published: true
tags: ['algorithms', 'pathfinding', 'typescript', 'debugging', 'visualization']
labSlug: 'dsa-visualizer'
relatedLab:
  name: 'DSA Visualizer'
  url: '/labs/dsa-visualizer'
  description: 'Watch BFS, DFS, Dijkstra and A* explore a grid, with the visited area and the frontier painted as they grow'
---

The DSA Visualizer has had pathfinding since the first version: BFS, DFS, Dijkstra, and A* on a 25 by 15 grid. You draw walls, place a start and an end, and step through the search. For about a year it had a bug I never noticed because the animation looked plausible. Only one cell was ever lit. The explored area, the whole point of watching a search, never appeared.

## How steps work

Every algorithm in the visualizer produces a list of animation steps up front. A step holds a move, a description, and a partial state the store applies when the step plays:

```ts
steps.push({
	move: { type: 'VISIT_NODE', position: [x, y] },
	description: `Visiting node (${x}, ${y})`,
	state: {
		grid: this.updateGrid(grid, x, y, 'visited'),
		nodesVisited: ++count
	}
});
```

Stepping backwards is free with this design: the store just applies the earlier step's state. So each step's `grid` has to be a complete picture of the board at that moment.

## The bug

Here is the old `updateGrid`:

```ts
private static updateGrid(grid, x, y, type) {
  const newGrid = grid.map((row) => row.map((node) => ({ ...node })));
  newGrid[y][x].isVisited = true;
  return newGrid;
}
```

It clones `grid` and flags one node. The problem is which grid it clones. `grid` is the argument the algorithm received, the original board with walls and endpoints, and it never changes. So every step's snapshot was the original board plus exactly one visited cell. Apply step 50 and you see one cell. Apply step 51 and you see a different single cell. The frontier helper had the same shape and was never called at all.

The board faithfully rendered what it was given, and the search itself was correct. Only the record of it was wrong.

## The fix

The algorithms do not need to change. The helpers need one piece of shared state: a working grid for the current run, mutated as the search goes, with each step taking a snapshot of it.

```ts
private static work: GridNode[][] = [];

private static beginRun(grid) {
  this.work = grid.map((row) =>
    row.map((node) => ({ ...node, isVisited: false, isCurrent: false, isPath: false, isFrontier: false }))
  );
}

private static snapshot() {
  return this.work.map((row) => row.map((node) => ({ ...node })));
}

private static updateGrid(_grid, x, y, type) {
  this.clearCurrent();
  const node = this.work[y]?.[x];
  if (node) {
    node.isVisited = true;
    node.isFrontier = false;
    node.isCurrent = true;
  }
  return this.snapshot();
}
```

`generateSteps` calls `beginRun` before dispatching to an algorithm. From then on each snapshot carries everything explored before it, so the visited area grows, and stepping backwards still restores an earlier, smaller area because each snapshot is still complete.

Frontier cells were a one-line addition in each algorithm, right where a neighbour is queued:

```ts
queue.push({ x: nx, y: ny });
this.markFrontier(nx, ny);
```

## What it costs

A snapshot is a deep copy of 375 node objects. A search on this grid visits at most 375 cells, so a run holds roughly four hundred snapshots, around 150,000 small objects, on the order of 20 MB while the lab is open. The old code made the same number of copies; it just copied the wrong thing. If I ever let the grid grow, the snapshot becomes a diff instead of a copy. For 25 by 15 it is not worth the complexity.

## What I took from it

An animation that looks busy is not evidence that it is right. The tell was in the statistics row the whole time: "49 visited" next to a board showing one blue cell. I had read that row hundreds of times. Open the lab, press Play on BFS, and the blue area now spreads out from the start the way the number always said it did.
