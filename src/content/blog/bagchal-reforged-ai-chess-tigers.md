---
title: 'Implementing Minimax AI for Bagchal: Asymmetric Game Tree Search'
slug: 'bagchal-reforged-ai-chess-tigers'
description: 'Technical implementation of minimax algorithm with alpha-beta pruning for Bagchal, addressing asymmetric gameplay and evaluation function optimization.'
date: '2025-06-13'
published: true
tags: ['ai', 'game-dev', 'sveltekit', 'minimax', 'typescript']
---

# Implementing Minimax AI for Bagchal: Asymmetric Game Tree Search

## The Rule

Bagchal is a traditional Nepali board game played on a 5×5 grid with 25 intersection points connected by orthogonal and diagonal lines. The game features two distinct phases and asymmetric gameplay between two players: one controlling four tigers and another controlling twenty goats. During the placement phase, the tiger player begins with four tigers positioned at the four corners of the board, while the goat player places their twenty goats one by one on any empty intersection. Tigers can move to adjacent intersections during this phase, and critically, they can capture goats by jumping over them to an empty adjacent space—similar to checkers but in any direction along the connecting lines.

Once all twenty goats are placed, the game transitions to the movement phase where both tigers and goats can move to adjacent intersections along the board's lines. Tigers continue their ability to capture goats through jumping, while goats cannot capture anything but can block tiger movement through strategic positioning. The victory conditions are asymmetric: tigers win by capturing five goats total, while goats win by immobilizing all four tigers simultaneously—trapping them so none can make a legal move. This creates a fundamental tension where tigers must balance aggressive capturing with maintaining mobility, while goats must coordinate to create strategic blockades while minimizing losses during the vulnerable placement phase. 



## The First Attempt: When Perfect Becomes Boring

My first AI was mathematically beautiful and absolutely terrible to play against. I implemented a standard minimax algorithm with alpha-beta pruning—the kind of thing that looks impressive in computer science papers:

```typescript
function minimax(state: GameState, depth: number, alpha: number, beta: number, maximizing: boolean): number {
    if (depth === 0 || isTerminal(state)) {
        return evaluate(state);
    }
    // ... the usual minimax dance
}
```

At depth 16, it was unbeatable. At depth 12, it was still crushing me every time. The problem wasn't that the AI was bad, it was that it was *too good*.

Analysis revealed that perfect play in Bagchal converges to a draw. Both sides possess optimal strategies that, when executed flawlessly, result in stalemate. Multiple attempts to implement an unbeatable AI consistently resulted in drawn games. Unless utilizing dedicated chess engine optimizations with extensive opening books and endgame tables, the game reaches theoretical completion at relatively shallow search depths. However, for practical gameplay, "good enough" AI performance proves optimal for user engagement. 

## Evaluation Function Design

The primary challenge was developing an effective position evaluation heuristic rather than optimizing the search algorithm. The evaluation function must quantify positional advantages for asymmetric players with fundamentally different objectives and constraints.

Parameter tuning was conducted through extensive gameplay testing:

```typescript
private static readonly WEIGHTS = {
    GOAT_CAPTURED: 400,      // Direct victory condition progress
    TIGER_MOBILITY: 12,      // Available move count per tiger
    GOAT_CONNECTIVITY: 15,   // Adjacent goat relationships
    TIGER_COORDINATION: 40,  // Tiger pair positioning synergy
    CAPTURE_THREAT: 100      // Immediate capture opportunities
};
```

Weight determination was based on statistical analysis of hundreds of test games. `GOAT_CAPTURED: 400` reflects empirical data showing a captured goat equivalent to approximately 33 mobility points. `TIGER_COORDINATION: 40` accounts for cooperative capture patterns unavailable to isolated tigers.

Critical insight: goat victory depends on network connectivity rather than individual piece strength. Fragmented goat formations are vulnerable to sequential captures, while connected formations create effective tiger containment structures.

## Circular Evaluation Bug Resolution

A critical bug emerged during development causing infinite loops in the move selection process. The AI would initiate move calculation but never terminate, resulting in browser hangs and 100% CPU utilization.

Root cause analysis identified circular preferences in the evaluation function. The AI would establish transitive relationships where position A > position B > position C > position A, creating an infinite comparison cycle.

Implementation of timeout and depth limits resolved the issue:

```typescript
// Failsafe: Prevent infinite loops with hard limits
if (searchDepth > maxDepth || timeElapsed > maxTime) {
    return bestMoveFound || validMoves[0];
}
```

This solution implements a pragmatic approach: when optimal solutions are computationally intractable, the system defaults to the best available option within time constraints. This reflects a key principle that deterministic behavior with bounded computation time is preferable to unlimited optimization attempts.

## Asymmetric Player Modeling

The solution required implementing distinct evaluation strategies for each player type. Tigers and goats operate under fundamentally different strategic frameworks requiring separate algorithmic approaches.

Tiger evaluation prioritizes tactical objectives: immediate capture opportunities, multi-turn capture sequences, and inter-tiger coordination patterns. The evaluation function emphasizes aggressive positioning and mobility maintenance.

Goat evaluation focuses on strategic defensive patterns: mutual support networks, collective blocking formations, and tiger movement restriction. The function rewards connectivity and cooperative positioning over individual piece optimization.

```typescript
if (state.phase === 'PLACEMENT') {
    // Placement phase vulnerability assessment
    if (isImmediatelyCaptureable(position)) {
        return -50000; // Critical positioning penalty
    }
} else {
    // Movement phase strategic evaluation
    score += evaluateMovementDynamics(state);
}
```

## Optimal Difficulty Calibration

The final implementation focused on balancing computational strength with user engagement. While deeper search algorithms and more sophisticated evaluation functions were technically feasible, the objective was optimal user experience rather than maximum playing strength.

Empirical testing determined depth 5-7 as the optimal search range. This provides sufficient lookahead for strategic planning while maintaining manageable computational complexity and occasional tactical errors that preserve game competitiveness for human players.

## Strategic Pattern Recognition

Bagchal implementation reveals interesting parallels to predator-prey behavioral models. Tigers operate as semi-autonomous agents with occasional coordination, while goats function as a collective defensive network. The AI system successfully models both approaches.

Tiger coordination patterns emerged through evaluation function optimization, producing paired hunting behaviors where one tiger forces goat movement toward capture positions occupied by another tiger. Goat strategies developed sacrificial positioning tactics, accepting individual piece loss to achieve superior collective formations.

Critical to both strategies is opponent intention prediction. Tiger evaluation learned to identify goat trap formations, while goat evaluation developed threat assessment algorithms to prioritize blocking the most dangerous tiger movements.

## Implementation Results

The Bagchal AI implementation demonstrates that effective game AI prioritizes situational appropriateness over theoretical optimality. Move selection balances mathematical accuracy with strategic relevance based on game state and phase requirements.

The AI exhibits deliberately imperfect play characteristics: tactical errors, occasional trap vulnerabilities, and missed capture opportunities. These limitations serve the design objective of providing challenging yet beatable opposition that maintains user engagement without overwhelming difficulty.

Key algorithmic achievements include successful asymmetric player modeling, coordinated multi-piece strategies for tigers, and collective defensive network optimization for goats. The system implements traditional board game patterns while adapting to Bagchal's unique dual-phase gameplay structure.

TWithout utilizing chess engine-level optimizations (opening databases, extensive endgame tables, and deeper search trees), the current implementation represents a complete solution where "good enough" performance achieves optimal user experience.

---

*The Bagchal AI implementation is available at **[/games/bagchal](/games/bagchal)** for testing and gameplay.