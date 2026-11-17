---
title: 'Building a Bagchal AI with Minimax for an Asymmetric Game'
slug: 'bagchal-reforged-ai-chess-tigers'
description: 'Building an AI for the traditional Nepali board game Bagchal, with asymmetric gameplay, minimax optimization, and strategic evaluation functions.'
date: '2025-06-25'
published: true
tags: ['ai', 'game-dev', 'sveltekit', 'minimax', 'typescript', 'nepal']
labSlug: 'bagchal'
relatedLab:
  name: 'Bagchal'
  url: '/labs/bagchal'
  description: 'Play the traditional Nepali tiger-goat strategy game with AI opponents'
---

## Understanding Bagchal: traditional strategy meets modern AI

Bagchal is a traditional Nepali board game, and the first thing that caught my attention was its asymmetric design. The two players have different objectives, different capabilities and different win conditions, all on the same board.

### Game mechanics and rules

Bagchal is played on a 5×5 grid with 25 intersection points connected by orthogonal and diagonal lines, creating a network of 60 possible moves from the center position. The two sides get different pieces and different rules.

The tigers have 4 pieces, which start at the four corners. A tiger moves to an adjacent intersection along a line and captures a goat by jumping over it, like in checkers. Tigers win by capturing 5 goats in total.

The goats have 20 pieces, which enter one by one during the placement phase and can only move after all of them are placed. Goats cannot capture anything. They win by immobilizing all the tigers at the same time.

The game has two phases. In placement, goats enter while tigers move and capture. In movement, both sides move freely. The early game resembles piece development in chess, and the endgame becomes a tactical puzzle of mobility and positioning.

For an AI this is an interesting game because neither player knows the optimal strategy. The game tree is complex enough that perfect play requires deep calculation, but shallow enough that human intuition remains competitive.

## The first attempt: when perfect becomes boring

My first AI was mathematically elegant and absolutely terrible to play against. I started with textbook minimax with alpha-beta pruning:

```typescript
function minimax(
	state: GameState,
	depth: number,
	alpha: number,
	beta: number,
	maximizing: boolean
): number {
	if (depth === 0 || isTerminal(state)) {
		return evaluate(state);
	}

	if (maximizing) {
		let maxEval = -Infinity;
		for (const move of generateMoves(state)) {
			const eval = minimax(applyMove(state, move), depth - 1, alpha, beta, false);
			maxEval = Math.max(maxEval, eval);
			alpha = Math.max(alpha, eval);
			if (beta <= alpha) break; // Alpha-beta pruning
		}
		return maxEval;
	} else {
		// ... symmetric for minimizing player
	}
}
```

At depth 16, the AI was unbeatable. At depth 12, it still beat me consistently, and that was the problem.

### The perfect play problem

After a lot of testing I found that optimal play in Bagchal typically converges to draws. Both tigers and goats have defensive strategies that lead to stalemate positions when executed perfectly. That is a design problem, because an AI that plays perfectly is no fun to play against.

Bagchal, like many traditional games, was designed for human players with limited calculation ability, pattern recognition skills, and occasional mistakes. A computer that never makes a tactical error takes away the human element that makes the game engaging.

I needed an AI that was challenging but beatable, one that made human-like decisions and still played a coherent strategy.

## Evaluation function design

The main challenge was the position evaluation heuristic. Optimizing the search algorithm mattered less. The evaluation function has to put a number on positional advantage for two players with different objectives and constraints.

I tuned the parameters by playing a lot of test games:

```typescript
private static readonly WEIGHTS = {
    GOAT_CAPTURED: 400,      // Direct victory condition progress
    TIGER_MOBILITY: 12,      // Available move count per tiger
    GOAT_CONNECTIVITY: 15,   // Adjacent goat relationships
    TIGER_COORDINATION: 40,  // Tiger pair positioning synergy
    CAPTURE_THREAT: 100      // Immediate capture opportunities
};
```

The weights came from statistical analysis of hundreds of test games. `GOAT_CAPTURED: 400` reflects data showing that a captured goat is worth approximately 33 mobility points. `TIGER_COORDINATION: 40` accounts for cooperative capture patterns that an isolated tiger does not have.

Goat victory depends on how the goats connect to each other more than on the strength of any one piece. Fragmented goat formations are vulnerable to sequential captures, while connected formations contain the tigers.

## Circular evaluation bug resolution

During development the move selection started looping forever. The AI would begin calculating a move and never finish, the browser hung, and the CPU sat at 100%.

The cause was circular preferences in the evaluation function. The AI would rank position A above position B, B above C, and C above A, so the comparison never ended.

Timeout and depth limits fixed it:

```typescript
// Failsafe: Prevent infinite loops with hard limits
if (searchDepth > maxDepth || timeElapsed > maxTime) {
	return bestMoveFound || validMoves[0];
}
```

When the optimal move is too expensive to compute, the AI returns the best move it has found within the time limit. I would take deterministic behavior with bounded computation time over an unlimited search for the best move.

## Asymmetric player modeling

Tigers and goats play by different strategies, so each side needed its own evaluation.

Tiger evaluation is tactical. It looks at immediate capture opportunities, multi-turn capture sequences, and coordination between tigers, and it favors aggressive positioning and keeping mobility.

Goat evaluation is defensive. It looks at mutual support networks, collective blocking formations, and restricting tiger movement, and it rewards connectivity and cooperative positioning over optimizing any single piece.

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

## Optimal difficulty calibration

The last step was balancing playing strength against how engaging the game is. Deeper search and more sophisticated evaluation functions were technically feasible, but I wanted the best experience for the player and did not need maximum playing strength.

Testing put the best search range at depth 5-7. That is enough lookahead for strategic planning, the computation stays manageable, and the AI still makes the occasional tactical error that keeps the game competitive for a human.

## Strategic pattern recognition

Bagchal has parallels to predator-prey behavioral models. Tigers act as semi-autonomous agents that occasionally coordinate, while goats work as a collective defensive network. The AI models both.

Tiger coordination came out of tuning the evaluation function. The tigers hunt in pairs, with one forcing goats to move toward capture positions held by the other. Goats developed sacrificial positioning, giving up a piece to get a better collective formation.

Both strategies depend on predicting what the opponent intends. Tiger evaluation learned to identify goat trap formations, and goat evaluation learned to assess threats so that it blocks the most dangerous tiger movements first.

## Architecture and implementation details

The game engine had to handle both phases of play and keep the game logic separate from the AI decision-making.

### Game state representation

I represented the board as a 25-position array with connectivity information:

```typescript
interface GameState {
	board: (Piece | null)[]; // 25 positions, 0-24
	phase: 'PLACEMENT' | 'MOVEMENT'; // Current game phase
	currentPlayer: 'TIGER' | 'GOAT'; // Whose turn
	goatsPlaced: number; // Goats on board
	goatsCaptured: number; // Tigers' score
	lastMove?: Move; // For UI animation
}

interface Piece {
	type: 'TIGER' | 'GOAT';
	id: number; // Unique identifier
}
```

The connectivity matrix defines legal moves:

```typescript
const CONNECTIONS: number[][] = [
	[1, 5, 6], // Position 0 connects to 1, 5, 6
	[0, 2, 5, 6, 7], // Position 1 connects to 0, 2, 5, 6, 7
	[1, 3, 7, 8] // And so on...
	// ... full 25-position connectivity map
];
```

This representation makes move generation and validation efficient and keeps the code readable.

### Move generation and validation

Move generation had to handle both placement and movement phases:

```typescript
function generateMoves(state: GameState): Move[] {
	const moves: Move[] = [];

	if (state.phase === 'PLACEMENT' && state.currentPlayer === 'GOAT') {
		// Goat placement: find empty positions
		for (let i = 0; i < 25; i++) {
			if (state.board[i] === null) {
				moves.push({ type: 'PLACE', to: i });
			}
		}
	} else {
		// Movement phase: generate piece moves
		for (let i = 0; i < 25; i++) {
			const piece = state.board[i];
			if (piece && piece.type === state.currentPlayer) {
				moves.push(...generatePieceMoves(state, i));
			}
		}
	}

	return moves;
}

function generatePieceMoves(state: GameState, from: number): Move[] {
	const moves: Move[] = [];

	for (const to of CONNECTIONS[from]) {
		if (state.board[to] === null) {
			// Simple move to empty position
			moves.push({ type: 'MOVE', from, to });
		} else if (canCapture(state, from, to)) {
			// Tiger capture move
			const capturePos = getCaptureTarget(from, to);
			if (capturePos !== -1 && state.board[capturePos] === null) {
				moves.push({ type: 'CAPTURE', from, to: capturePos, captured: to });
			}
		}
	}

	return moves;
}
```

### Performance optimizations

Three optimizations kept the game responsive.

Move ordering puts captures and central moves first, which gives better alpha-beta pruning:

```typescript
function orderMoves(moves: Move[], state: GameState): Move[] {
	return moves.sort((a, b) => {
		// Captures first
		if (a.type === 'CAPTURE' && b.type !== 'CAPTURE') return -1;
		if (b.type === 'CAPTURE' && a.type !== 'CAPTURE') return 1;

		// Central positions preferred
		const centerValueA = getCenterValue(a.to || a.from);
		const centerValueB = getCenterValue(b.to || b.from);
		return centerValueB - centerValueA;
	});
}
```

Transposition tables cache position evaluations to avoid recalculation:

```typescript
const transpositionTable = new Map<string, { score: number; depth: number }>();

function getPositionKey(state: GameState): string {
	return `${state.board.map((p) => p?.type[0] || '-').join('')}_${state.phase}_${state.currentPlayer}`;
}
```

Iterative deepening increases the search depth gradually for better time management:

```typescript
function iterativeDeepening(state: GameState, maxTime: number): Move {
	let bestMove: Move = generateMoves(state)[0];
	const startTime = Date.now();

	for (let depth = 1; depth <= maxDepth; depth++) {
		if (Date.now() - startTime > maxTime * 0.8) break;

		const result = minimax(state, depth, -Infinity, Infinity, true);
		if (result.move) bestMove = result.move;
	}

	return bestMove;
}
```

## Results and lessons learned

The final Bagchal AI is competitive and still enjoyable to play against. It handles both short-term tactics and long-term positioning, so a game feels like playing a person. By adjusting search depth and evaluation weights, the same engine covers difficulty levels from beginner to expert.

The asymmetric evaluation approach could be applied to other games with unequal player roles.

### Performance metrics

Final AI characteristics:

- Search depth: 5-7 moves (adjustable)
- Response time: less than 500ms on modern hardware
- Win rate vs humans: ~65% (balanced for engagement)
- Memory usage: less than 50MB for full game tree cache

### Future improvements

Things that could make it stronger:

1. An opening book of pre-computed best moves for common opening positions
2. Endgame tables, meaning perfect play databases for positions with few pieces
3. Neural network evaluation functions trained on expert games
4. Parallel search on multiple threads for faster deep analysis

## Conclusion

Building the Bagchal AI taught me to think about how the game feels to the person playing it. The depth-16 version was the strongest thing I built and the least fun, so the version that shipped is the one that gives a human a real game and sometimes loses.

Bagchal's asymmetric design still produces positions I find interesting after all the analysis.

You can play the complete Bagchal implementation against the AI at [/labs/bagchal](/labs/bagchal). It has multiple difficulty levels and traditional rule variations.
