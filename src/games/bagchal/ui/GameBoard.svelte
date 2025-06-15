<script lang="ts">
	import type { GameState, Line, Point } from '$games/bagchal/rules';
	import BoardGrid from './BoardGrid.svelte';
	import PieceRenderer from './PieceRenderer.svelte';
	import Animation from './Animation.svelte';
	import MoveHistory from './MoveHistory.svelte';
	import type { Move } from '$games/bagchal/ai/types';

	interface Props {
		points: Point[];
		lines: Line[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
		isComputerThinking?: boolean;
		isPlayingComputer?: boolean;
		playerSide?: string;
		aiCalculatedMove?: Move | null;
		moveHistory?: string[];
	}

	let {
		points,
		lines,
		gameState,
		validMoves,
		handlePointClick,
		isComputerThinking = false,
		isPlayingComputer = false,
		playerSide = 'GOAT',
		aiCalculatedMove = null,
		moveHistory = []
	}: Props = $props();

	// Determine if it's computer's turn and should disable interaction
	let isComputerTurn = $derived(() => {
		const computerTurn = isPlayingComputer && gameState.turn !== playerSide;
		return computerTurn;
	});

	// Unified Animation state - works for both AI and player moves
	let showAnimation = $state(false);
	let animationProgress = $state(0);
	let currentAnimationMove = $state(null as Move | null);

	// Disable clicks when computer is thinking or animating
	function handleBoardClick(id: number) {
		if (isComputerThinking || showAnimation) return;
		handlePointClick(id);
	}

	// Function to get valid lines that connect from selected piece to valid moves
	function getValidLines(): Line[] {
		if (!gameState.selectedPieceId || validMoves.length === 0) return [];

		const selectedPoint = points[gameState.selectedPieceId];
		if (!selectedPoint) return [];

		const validLines: Line[] = [];

		// For each valid move, find the path
		validMoves.forEach((moveId) => {
			const movePoint = points[moveId];
			if (!movePoint) return;

			// Check for direct connections (normal moves)
			const directLine = lines.find(
				(line) =>
					(line.x1 === selectedPoint.x &&
						line.y1 === selectedPoint.y &&
						line.x2 === movePoint.x &&
						line.y2 === movePoint.y) ||
					(line.x2 === selectedPoint.x &&
						line.y2 === selectedPoint.y &&
						line.x1 === movePoint.x &&
						line.y1 === movePoint.y)
			);

			if (directLine) {
				validLines.push(directLine);
			} else {
				// For tiger captures - find path through intermediate goat
				if (
					gameState.selectedPieceId !== null &&
					gameState.board[gameState.selectedPieceId] === 'TIGER'
				) {
					// Find potential intermediate points (where goats might be)
					lines.forEach((firstLine) => {
						if (
							(firstLine.x1 === selectedPoint.x && firstLine.y1 === selectedPoint.y) ||
							(firstLine.x2 === selectedPoint.x && firstLine.y2 === selectedPoint.y)
						) {
							// Get the intermediate point
							const intermediateX =
								firstLine.x1 === selectedPoint.x && firstLine.y1 === selectedPoint.y
									? firstLine.x2
									: firstLine.x1;
							const intermediateY =
								firstLine.y1 === selectedPoint.y && firstLine.x1 === selectedPoint.x
									? firstLine.y2
									: firstLine.y1;

							// Check if there's a line from intermediate to target
							const secondLine = lines.find(
								(line) =>
									(line.x1 === intermediateX &&
										line.y1 === intermediateY &&
										line.x2 === movePoint.x &&
										line.y2 === movePoint.y) ||
									(line.x2 === intermediateX &&
										line.y2 === intermediateY &&
										line.x1 === movePoint.x &&
										line.y1 === movePoint.y)
							);

							if (secondLine) {
								// Add both line segments for the capture path
								validLines.push(firstLine);
								validLines.push(secondLine);
							}
						}
					});
				}
			}
		});

		// Remove duplicates
		return validLines.filter(
			(line, index, self) =>
				index ===
				self.findIndex(
					(l) => l.x1 === line.x1 && l.y1 === line.y1 && l.x2 === line.x2 && l.y2 === line.y2
				)
		);
	}

	// AI animation path - now handled directly in AIAnimation component
	function getAiAnimationPath() {
		if (!aiCalculatedMove) {
			return { lines: [], fromPoint: null, toPoint: null };
		}
		
		const fromPoint = aiCalculatedMove.from !== null ? points[aiCalculatedMove.from] : null;
		const toPoint = points[aiCalculatedMove.to];
		
		// Find connecting lines for the move path
		const pathLines: Line[] = [];
		if (fromPoint && toPoint) {
			// Find direct line connection
			const directLine = lines.find(line => 
				(line.x1 === fromPoint.x && line.y1 === fromPoint.y && line.x2 === toPoint.x && line.y2 === toPoint.y) ||
				(line.x2 === fromPoint.x && line.y2 === fromPoint.y && line.x1 === toPoint.x && line.y1 === toPoint.y)
			);
			if (directLine) {
				pathLines.push(directLine);
			}
		}
		
		return { lines: pathLines, fromPoint, toPoint };
	}

	let validLines = $derived(getValidLines());
	let aiAnimationPath = $derived(getAiAnimationPath());

	// Unified animation trigger function
	function triggerAnimation(move: Move, duration: number = 800) {
		currentAnimationMove = move;
		showAnimation = true;
		animateMove(duration);
	}

	// Clear animation when move is cleared
	$effect(() => {
		if (!currentAnimationMove) {
			showAnimation = false;
			animationProgress = 0;
		}
	});

	async function animateMove(duration: number) {
		// Reset animation
		animationProgress = 0;

		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Ease-out animation for smoother effect
			animationProgress = 1 - Math.pow(1 - progress, 3);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// Animation complete - clean up immediately
				showAnimation = false;
				animationProgress = 0;
				currentAnimationMove = null;
			}
		}

		requestAnimationFrame(animate);
	}

	// Export animation trigger for parent components
	export { triggerAnimation };
</script>

<section class="flex flex-col lg:order-2">
	<div class="section-card min-h-0 lg:h-full">
		<h2 class="section-title">Board</h2>

		<!-- Recessed Game Board Container -->
		<div class="flex flex-1 flex-col items-center justify-center p-2 sm:p-4 lg:p-6">
			<!-- Carved Board Well -->
			<div class="board-well">
				<div class="board-inner" class:thinking={isComputerThinking && isComputerTurn}>
					<div class="board-wrapper">
						<!-- SVG Board Container -->
						<svg
							viewBox="0 0 500 500"
							xmlns="http://www.w3.org/2000/svg"
							class="w-full h-full"
							preserveAspectRatio="xMidYMid meet"
							role="img"
							aria-label="Bagchal game board"
							style="background: transparent;"
						>
							<!-- Board Grid and Lines -->
							<BoardGrid 
								{lines} 
								{showAnimation} 
								{animationProgress} 
								{aiAnimationPath} 
							/>

							<!-- Game Pieces -->
							<PieceRenderer 
								{points} 
								{gameState} 
								{validMoves} 
								handlePointClick={handleBoardClick} 
							/>

							<!-- Unified Animation -->
							<Animation 
								{showAnimation} 
								{animationProgress} 
								currentMove={currentAnimationMove}
								{points} 
							/>
						</svg>
					</div>
				</div>
			</div>

			<!-- Game Instructions based on current state -->
			<div class="mt-2 text-center sm:mt-3">
				{#if gameState.winner}
					<p class="text-primary text-base font-bold sm:text-lg">
						{#if gameState.winner === 'DRAW'}
							🤝 It's a Draw!
						{:else}
							🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
						{/if}
					</p>
				{/if}
				<div class="flex h-8 items-center justify-center">
					{#if isComputerThinking && isComputerTurn()}
						<!-- AI Thinking Indicator -->
						<div
							class="bg-bg-primary border-primary/20 mx-auto flex max-w-xs items-center gap-2 border p-2 text-xs sm:text-sm"
						>
							<div class="thinking-dots">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<span class="text-primary font-medium">AI is thinking...</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Move history below the board -->
	{#if moveHistory}
		<MoveHistory {moveHistory} />
	{/if}
</section>

<style>
	/* Recessed Board Well Effect */
	.board-well {
		width: 100%;
		max-width: none;
		padding: 0.5rem;
		position: relative;
	}

	@media (min-width: 640px) {
		.board-well {
			padding: 0.75rem;
		}
	}

	.board-inner {
		width: 100%;
		aspect-ratio: 1;
		height: 100%;
		background: linear-gradient(145deg, #151515, var(--color-bg-primary));
		padding: 0.5rem;
		position: relative;
		/* Deep inset effect */
		box-shadow: 
			/* Strong inset shadows for depth */
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			/* Inner glow */ inset 0 0 20px rgba(0, 0, 0, 0.5),
			/* Subtle red accent glow */ inset 0 0 40px rgba(201, 42, 42, 0.02);
	}

	@media (min-width: 640px) {
		.board-inner {
			padding: 0.75rem;
		}
	}

	/* Add subtle texture overlay */
	.board-inner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.015) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(201, 42, 42, 0.008) 0%, transparent 50%);
		pointer-events: none;
	}

	/* Board wrapper styling - transparent to inherit board well background */
	.board-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 0.5rem;
		background: transparent;
		/* Remove rounded corners and box-shadow for seamless integration */
	}

	@media (min-width: 640px) {
		.board-wrapper {
			padding: 0.75rem;
		}
	}

	/* AI thinking animation */
	.thinking {
		animation: thinking-pulse 2s ease-in-out infinite;
	}

	@keyframes thinking-pulse {
		0%,
		100% {
			box-shadow: 
				inset 4px 4px 12px rgba(0, 0, 0, 0.7),
				inset -2px -2px 8px rgba(255, 255, 255, 0.04),
				inset 0 0 20px rgba(0, 0, 0, 0.5),
				inset 0 0 40px rgba(201, 42, 42, 0.02);
		}
		50% {
			box-shadow: 
				inset 4px 4px 12px rgba(0, 0, 0, 0.7),
				inset -2px -2px 8px rgba(255, 255, 255, 0.04),
				inset 0 0 20px rgba(0, 0, 0, 0.5),
				inset 0 0 40px rgba(201, 42, 42, 0.06);
		}
	}

	/* Thinking dots animation */
	.thinking-dots {
		display: flex;
		gap: 3px;
	}

	.thinking-dots span {
		width: 4px;
		height: 4px;
		background-color: var(--color-primary);
		border-radius: 50%;
		animation: thinking-dots 1.4s ease-in-out infinite both;
	}

	.thinking-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}
	.thinking-dots span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes thinking-dots {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
