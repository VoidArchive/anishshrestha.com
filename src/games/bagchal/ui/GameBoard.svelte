<script lang="ts">
	import BagchalBoard from './BagchalBoard.svelte';
	import type { GameState } from '$games/bagchal/rules';
	import MoveHistory from './MoveHistory.svelte';

	interface Props {
		points: any;
		lines: any;
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
		isComputerThinking?: boolean;
		isPlayingComputer?: boolean;
		playerSide?: string;
		aiCalculatedMove?: any;
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

	// Animation state for AI move visualization
	let showAiAnimation = $state(false);
	let animationProgress = $state(0);

	// Disable clicks when computer is thinking or animating
	function handleBoardClick(id: number) {
		if (isComputerThinking || showAiAnimation) return;
		handlePointClick(id);
	}

	// Watch for AI calculated move to trigger animation
	$effect(() => {
		if (aiCalculatedMove && isComputerTurn() && !gameState.winner) {
			showAiAnimation = true;
			animateAiMove();
		} else if (!aiCalculatedMove) {
			// Clear animation when no AI move
			showAiAnimation = false;
			animationProgress = 0;
		}
	});

	async function animateAiMove() {
		// Reset animation
		animationProgress = 0;

		// Faster, smoother animation
		const duration = 600; // 0.6 seconds
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			animationProgress = progress;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// Animation complete, hide it immediately
				showAiAnimation = false;
				animationProgress = 0;
			}
		}

		requestAnimationFrame(animate);
	}
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
						<BagchalBoard
							{points}
							{lines}
							{gameState}
							{validMoves}
							handlePointClick={handleBoardClick}
							{aiCalculatedMove}
							{showAiAnimation}
							{animationProgress}
						/>
					</div>
				</div>
			</div>

			<!-- Game Instructions based on current state -->
			<div class="mt-2 text-center sm:mt-3">
				{#if gameState.winner}
					<p class="text-primary-red text-base font-bold sm:text-lg">
						{#if gameState.winner === 'DRAW'}
							🤝 It's a Draw!
						{:else}
							🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
						{/if}
					</p>
				{:else if isComputerThinking && isComputerTurn()}
					<!-- AI Thinking Indicator moved from GameStatus -->
					<div class="bg-bg-primary border-primary-red/20 mx-auto flex max-w-xs items-center gap-2 rounded border p-2 text-xs sm:text-sm">
						<div class="thinking-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
						<span class="text-primary-red font-medium">AI is thinking...</span>
					</div>
				{:else if gameState.phase === 'MOVEMENT'}
					<p class="text-text-secondary text-xs sm:text-sm">
						{gameState.turn === 'GOAT'
							? 'Select and move a goat'
							: 'Select a tiger and move or capture'}
					</p>
				{/if}
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

	/* Board wrapper styling */
	.board-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 1;
	}

	/* Make board responsive and larger */
	.board-wrapper :global(svg) {
		width: min(90vw, 350px);
		height: min(90vw, 350px);
		max-width: none;
	}

	@media (min-width: 640px) {
		.board-wrapper :global(svg) {
			width: min(80vw, 450px);
			height: min(80vw, 450px);
		}
	}

	@media (min-width: 768px) {
		.board-wrapper :global(svg) {
			width: min(65vw, 500px);
			height: min(65vw, 500px);
		}
	}

	@media (min-width: 1024px) {
		.board-wrapper :global(svg) {
			width: min(45vw, 600px);
			height: min(45vw, 600px);
		}
	}

	/* Thinking dots animation (moved from GameStatus) */
	.thinking-dots {
		display: flex;
		gap: 3px;
		align-items: center;
	}

	.thinking-dots span {
		width: 4px;
		height: 4px;
		background-color: var(--color-primary-red);
		border-radius: 50%;
		animation: thinking-pulse 1.4s ease-in-out infinite both;
	}

	.thinking-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.thinking-dots span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes thinking-pulse {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
