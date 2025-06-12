---
title: 'Building Bagchal: Game AI and State Management with Svelte 5'
slug: 'bagchal-implementation'
description: 'Technical notes on implementing the traditional Nepali strategy game with TypeScript, SVG rendering, and minimax AI.'
date: '2025-06-12'
published: true
tags: ['sveltekit', 'game-dev', 'ai', 'typescript']
---

# Building Bagchal: Game AI and State Management

I built a web version of Bagchal, a traditional Nepali board game where 20 goats try to trap 4 tigers. The interesting parts were the AI implementation and managing complex game state with Svelte 5's new runes.

## Game State with Svelte 5 Runes

The game has two phases (placement/movement) and asymmetric rules. Svelte 5's `$state` and `$derived` made this straightforward:

```typescript
let gameState = $state<GameState>({
  board: initialBoard,
  turn: 'GOAT',
  phase: 'PLACEMENT',
  goatsPlaced: 0,
  goatsCaptured: 0,
  selectedPieceId: null,
  positionHistory: [],
  positionCounts: new Map()
});

// Cached tiger move calculation
let tigerMoveResult = $derived.by(() => {
  if (gameState.turn === 'TIGER' && gameState.selectedPieceId !== null) {
    return calculateValidTigerMoves(gameState, gameState.selectedPieceId, adjacency, points);
  }
  return { destinations: [], captures: [] };
});
```

The `$derived.by` automatically caches expensive move calculations. No manual dependency tracking needed.

## Board Representation

Bagchal isn't a simple grid—only certain positions connect diagonally. I used a graph approach:

```typescript
export function generateLines(points: Point[], size: number = 5): Line[] {
  const lines: Line[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Horizontal/vertical always connect
      const right = getPoint(x + 1, y);
      if (right) lines.push({...});
      
      // Diagonals only on intersection points
      if ((x + y) % 2 === 0) {
        const diag1 = getPoint(x + 1, y + 1);
        if (diag1) lines.push({...});
      }
    }
  }
  return lines;
}

// Build adjacency map for O(1) lookups
export function buildAdjacencyMap(points: Point[], lines: Line[]): Map<number, number[]> {
  const map = new Map<number, number[]>();
  lines.forEach(line => {
    // Connect endpoints bidirectionally
  });
  return map;
}
```

SVG rendering handles the visual representation with responsive scaling.

## AI Implementation

The AI uses minimax with alpha-beta pruning, but the evaluation function is where the intelligence lives. Tigers and goats need completely different strategies:

```typescript
export class PositionEvaluator {
  private static readonly WEIGHTS = {
    GOAT_CAPTURED: 200,
    TIGER_MOBILITY: 6,
    GOAT_CONNECTIVITY: 8,
    TIGER_COORDINATION: 20,
    CAPTURE_THREAT: 40,
  };

  static evaluatePosition(state: GameState, adjacency: Map<number, number[]>, points: Point[]): number {
    let score = state.goatsCaptured * this.WEIGHTS.GOAT_CAPTURED;
    
    if (state.phase === 'PLACEMENT') {
      score += this.evaluatePlacementPhase(state, adjacency, points);
    } else {
      score += this.evaluateMovementPhase(state, adjacency, points);
    }
    
    return score;
  }
}
```

The key insight was that goat connectivity matters more than individual piece value. Goats win by coordinating to block tiger movement, so the evaluation heavily weights positional control and trap formation.

### How the AI thinks

**Tiger strategy**

The tigers begin with the initiative and a natural material advantage, so the heuristic tries to keep that momentum going.

- **Mobility** – every empty neighbour that a tiger can step to adds a small positive score (`TIGER_MOBILITY`). The AI will prefer positions where at least one tiger has three or more exits.
- **Capture threats** – if a tiger can jump a neighbouring goat into a free landing vertex on the other side, the evaluator awards a larger bonus (`CAPTURE_THREAT`). This makes the engine line-up multi-jump sequences whenever possible.
- **Coordination** – isolated tigers are easy to fence in. A proximity bonus (`TIGER_COORDINATION`) keeps the cats within two edges of each other so they can assist with follow-up captures.

**Goat strategy**

Goats win by occupying space and working as a net. Their scoring terms reflect that cooperative play style:

- **Connectivity** – we flood-fill the goat graph (ignoring tigers) to measure the size of the largest connected group. Bigger clumps receive a higher score (`GOAT_CONNECTIVITY`) because they can pivot into three-sided blockades faster.
- **Tiger containment** – whenever a tiger's mobility drops below two exits the goats get a sizeable bonus. The closer a tiger is to being completely surrounded, the steeper the increase.
- **Early sacrifices** – during the placement phase losing one or two goats is acceptable if it lures a tiger onto a central vertex that can later be sealed off. The evaluator therefore only starts penalising captures after the fourth goat is taken.

Because Bagchal is fully asymmetric, the evaluator does not try to create a single scalar formula that fits both sides. Instead it flips the sign of all terms depending on whose turn it is, allowing each player to maximise its own bespoke heuristic.

## Modular AI Architecture

Originally had a 1138-line monolithic AI file. Refactored into focused modules:

- `computerPlayer.ts` - Main interface with difficulty levels
- `gameEvaluator.ts` - Minimax search with caching
- `evaluation.ts` - Position evaluation heuristics  
- `moveGeneration.ts` - Valid move calculation
- `moveOrdering.ts` - Move prioritization for better pruning

Each module handles one concern. The computer player just orchestrates:

```typescript
export class ComputerPlayer {
  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const depths = { easy: 3, medium: 5, hard: 7 };
    this.evaluator = new GameEvaluator(depths[difficulty]);
  }

  getBestMove(state: GameState, adjacency: Map<number, number[]>, points: Point[]): Move | null {
    return this.evaluator.minimax(state, this.maxDepth, -Infinity, Infinity, 
                                  state.turn === 'TIGER', adjacency, points)[1];
  }
}
```

## Performance Notes

- AI calculations stay under 2 seconds with iterative deepening
- Position caching prevents redundant evaluations
- Svelte's fine-grained reactivity only updates necessary DOM nodes
- Bundle size: ~45KB gzipped

The game works well on mobile. SVG scales cleanly and touch targets are sized appropriately.

## Takeaways

Svelte 5's runes eliminated a lot of state management boilerplate. The automatic memoization and dependency tracking just works.

Traditional games have nuanced rules that don't map cleanly to typical game algorithms. The AI evaluation function took more tuning than the search algorithm itself.

Graph-based board representation was the right choice over trying to hack a grid system. The adjacency map approach generalizes to other traditional board games too.

You can **[play it here](/bagchal)** or check the source on GitHub. 