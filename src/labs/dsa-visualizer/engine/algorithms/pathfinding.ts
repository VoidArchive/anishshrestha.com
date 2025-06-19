/*
Pathfinding Algorithms Implementation

Implements various pathfinding algorithms for the DSA visualizer.
Includes BFS, DFS, Dijkstra's algorithm, and A* search.
Generates animation steps to visualize the algorithm execution.
*/

import type { DSAMove, AnimationStep, PathfindingAlgorithm, GridNode } from '../../types';

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

  /**
   * Breadth-First Search implementation
   * Explores all neighbors at current depth before moving to next depth
   */
  private static breadthFirstSearch(
    grid: GridNode[][], 
    start: [number, number], 
    end: [number, number]
  ): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const [startX, startY] = start;
    const [endX, endY] = end;
    const visited = new Set<string>();
    const queue: { x: number; y: number; path: [number, number][] }[] = [];
    
    // Initial setup step
    steps.push({
      move: { type: 'HIGHLIGHT', indices: [] },
      description: `Starting BFS from (${startX}, ${startY}) to (${endX}, ${endY})`,
      state: {
        grid: this.updateGridWithCurrent(grid, startX, startY),
      }
    });
    
    queue.push({ x: startX, y: startY, path: [[startX, startY]] });
    visited.add(`${startX},${startY}`);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const { x, y, path } = current;
      
      // Show current node being explored
      steps.push({
        move: { type: 'HIGHLIGHT', indices: [] },
        description: `Exploring node (${x}, ${y})`,
        state: {
          grid: this.updateGridWithCurrent(grid, x, y),
        }
      });
      
      // Visit current node (mark as visited)
      if (!(x === startX && y === startY)) {
        steps.push({
          move: { type: 'VISIT_NODE', position: [x, y] },
          description: `Marking (${x}, ${y}) as visited`,
          state: {
            grid: this.updateGrid(grid, x, y, 'visited'),
            nodesVisited: steps.filter(s => s.move.type === 'VISIT_NODE').length + 1
          }
        });
      }
      
      // Check if we reached the end
      if (x === endX && y === endY) {
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
      
      // Explore neighbors - add all to frontier first
      const neighbors = this.getNeighbors(grid, x, y);
      const newFrontierNodes: [number, number][] = [];
      
      for (const [nx, ny] of neighbors) {
        const key = `${nx},${ny}`;
        if (!visited.has(key) && !grid[ny][nx].isWall) {
          visited.add(key);
          queue.push({ 
            x: nx, 
            y: ny, 
            path: [...path, [nx, ny]] 
          });
          newFrontierNodes.push([nx, ny]);
        }
      }
      
      // Show all new frontier nodes at once
      if (newFrontierNodes.length > 0) {
        let updatedGrid = grid;
        for (const [fx, fy] of newFrontierNodes) {
          updatedGrid = this.updateGridWithFrontier(updatedGrid, fx, fy);
        }
        
        steps.push({
          move: { type: 'ADD_TO_FRONTIER', position: newFrontierNodes[0] },
          description: `Added ${newFrontierNodes.length} nodes to frontier: ${newFrontierNodes.map(([fx, fy]) => `(${fx},${fy})`).join(', ')}`,
          state: {
            grid: updatedGrid,
            frontierNodes: [...(steps[steps.length - 1]?.state.frontierNodes || []), ...newFrontierNodes]
          }
        });
      }
    }
    
    if (steps.length === 0 || !steps[steps.length - 1].state.completed) {
      steps.push({
        move: { type: 'STEP_COMPLETE' },
        description: 'No path found',
        state: { completed: true }
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
    
    const dfs = (x: number, y: number, path: [number, number][]): boolean => {
      const key = `${x},${y}`;
      if (visited.has(key) || grid[y][x].isWall) {
        return false;
      }
      
      visited.add(key);
      
      // Visit current node
      if (!(x === startX && y === startY)) {
        steps.push({
          move: { type: 'VISIT_NODE', position: [x, y] },
          description: `Visiting node (${x}, ${y})`,
          state: {
            grid: this.updateGrid(grid, x, y, 'visited'),
            nodesVisited: steps.filter(s => s.move.type === 'VISIT_NODE').length + 1
          }
        });
      }
      
      // Check if we reached the end
      if (x === endX && y === endY) {
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
        return true;
      }
      
      // Explore neighbors
      const neighbors = this.getNeighbors(grid, x, y);
      for (const [nx, ny] of neighbors) {
        if (dfs(nx, ny, [...path, [nx, ny]])) {
          return true;
        }
      }
      
      return false;
    };
    
    if (!dfs(startX, startY, [[startX, startY]])) {
      steps.push({
        move: { type: 'STEP_COMPLETE' },
        description: 'No path found',
        state: { completed: true }
      });
    }
    
    return steps;
  }

  /**
   * Dijkstra's algorithm implementation
   * Finds shortest path using weighted distances
   */
  private static dijkstra(
    grid: GridNode[][], 
    start: [number, number], 
    end: [number, number]
  ): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const [startX, startY] = start;
    const [endX, endY] = end;
    const distances = new Map<string, number>();
    const previous = new Map<string, [number, number] | null>();
    const unvisited = new Set<string>();
    
    // Initialize distances
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const key = `${x},${y}`;
        distances.set(key, x === startX && y === startY ? 0 : Infinity);
        previous.set(key, null);
        if (!grid[y][x].isWall) {
          unvisited.add(key);
        }
      }
    }
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: [number, number] | null = null;
      let minDistance = Infinity;
      
      for (const key of unvisited) {
        const distance = distances.get(key)!;
        if (distance < minDistance) {
          minDistance = distance;
          const [x, y] = key.split(',').map(Number);
          current = [x, y];
        }
      }
      
      if (!current || minDistance === Infinity) break;
      
      const [x, y] = current;
      const currentKey = `${x},${y}`;
      unvisited.delete(currentKey);
      
      // Visit current node
      if (!(x === startX && y === startY)) {
        steps.push({
          move: { type: 'VISIT_NODE', position: [x, y] },
          description: `Visiting node (${x}, ${y}) with distance ${minDistance}`,
          state: {
            grid: this.updateGrid(grid, x, y, 'visited'),
            nodesVisited: steps.filter(s => s.move.type === 'VISIT_NODE').length + 1
          }
        });
      }
      
      // Check if we reached the end
      if (x === endX && y === endY) {
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
        break;
      }
      
      // Update distances to neighbors
      const neighbors = this.getNeighbors(grid, x, y);
      for (const [nx, ny] of neighbors) {
        const neighborKey = `${nx},${ny}`;
        if (unvisited.has(neighborKey)) {
          const newDistance = minDistance + 1; // All edges have weight 1
          if (newDistance < distances.get(neighborKey)!) {
            distances.set(neighborKey, newDistance);
            previous.set(neighborKey, [x, y]);
          }
        }
      }
    }
    
    if (steps.length === 0 || !steps[steps.length - 1].state.completed) {
      steps.push({
        move: { type: 'STEP_COMPLETE' },
        description: 'No path found',
        state: { completed: true }
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
    
    while (openSet.size > 0) {
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
      
      // Visit current node
      if (!(x === startX && y === startY)) {
        steps.push({
          move: { type: 'VISIT_NODE', position: [x, y] },
          description: `Visiting node (${x}, ${y}) with f-score ${minF.toFixed(1)}`,
          state: {
            grid: this.updateGrid(grid, x, y, 'visited'),
            nodesVisited: steps.filter(s => s.move.type === 'VISIT_NODE').length + 1
          }
        });
      }
      
      // Check if we reached the end
      if (x === endX && y === endY) {
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
    
    if (steps.length === 0 || !steps[steps.length - 1].state.completed) {
      steps.push({
        move: { type: 'STEP_COMPLETE' },
        description: 'No path found',
        state: { completed: true }
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
      
      if (current && current[0] === start[0] && current[1] === start[1]) {
        path.unshift(current);
        break;
      }
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
      [1, 0],  // right
      [0, 1],  // down
      [-1, 0]  // left
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
  private static updateGrid(grid: GridNode[][], x: number, y: number, type: 'visited'): GridNode[][] {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    if (newGrid[y] && newGrid[y][x]) {
      newGrid[y][x].isVisited = type === 'visited';
    }
    return newGrid;
  }

  /**
   * Updates grid with final path
   */
  private static updateGridWithPath(grid: GridNode[][], path: [number, number][]): GridNode[][] {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    
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
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    if (newGrid[y] && newGrid[y][x]) {
      newGrid[y][x].isFrontier = true;
    }
    return newGrid;
  }

  /**
   * Updates grid with current exploring node
   */
  private static updateGridWithCurrent(grid: GridNode[][], x: number, y: number): GridNode[][] {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    
    // Clear previous current nodes
    for (let row of newGrid) {
      for (let node of row) {
        node.isCurrent = false;
      }
    }
    
    // Set new current node
    if (newGrid[y] && newGrid[y][x]) {
      newGrid[y][x].isCurrent = true;
    }
    return newGrid;
  }
} 