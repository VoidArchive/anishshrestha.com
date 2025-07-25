<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { GameState, Line, Point } from '$labs/bagchal/rules';
	import BoardGrid from './BoardGrid.svelte';
	import PieceRenderer from './PieceRenderer.svelte';
	import Animation from './Animation.svelte';
	import MoveHistory from './MoveHistory.svelte';
	import type { Move } from '$labs/bagchal/ai/types';

	interface Props {
		points: Point[];
		lines: Line[];
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
		isComputerThinking?: boolean;
		isPlayingComputer?: boolean;
		playerSide?: string;
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
		moveHistory = []
	}: Props = $props();

	// Determine if it's computer's turn and should disable interaction
	let isComputerTurn = $derived(() => {
		const computerTurn = isPlayingComputer && gameState.turn !== playerSide;
		return computerTurn;
	});

	// Phase transition notification state
	let showPhaseTransition = $state(false);
	let phaseTransitionVisible = $state(false);
	let previousPhase = $state(gameState.phase);

	// Timeout tracking for cleanup
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

	// Watch for phase transitions from PLACEMENT to MOVEMENT
	$effect(() => {
		if (previousPhase === 'PLACEMENT' && gameState.phase === 'MOVEMENT') {
			showPhaseTransition = true;
			phaseTransitionVisible = true;

			// Hide the notification after 3 seconds
			try {
				const timeoutId1 = setTimeout(() => {
					try {
						phaseTransitionVisible = false;
						// Remove from DOM after fade out animation
						const timeoutId2 = setTimeout(() => {
							try {
								showPhaseTransition = false;
							} catch (error) {
								// NOTE: Error during phase transition cleanup - reset state
								console.warn('Phase transition cleanup failed:', error);
								showPhaseTransition = false;
							}
						}, 300);
						activeTimeouts.push(timeoutId2);
					} catch (error) {
						// NOTE: Error during phase transition fade - reset state
						console.warn('Phase transition fade failed:', error);
						showPhaseTransition = false;
						phaseTransitionVisible = false;
					}
				}, 3000);
				activeTimeouts.push(timeoutId1);
			} catch (error) {
				// NOTE: Error during phase transition setup - reset state
				console.warn('Phase transition setup failed:', error);
				showPhaseTransition = false;
				phaseTransitionVisible = false;
			}
		}
		previousPhase = gameState.phase;
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

	// Drag and drop handlers
	function handleDragStart(id: number) {
		if (isComputerThinking || showAnimation) return;
		// Auto-select the piece being dragged
		if (!gameState.selectedPieceId) {
			handlePointClick(id);
		}
	}

	function handleDragEnd() {
		// Keep selection active for click-based interactions
	}

	function handleDrop(id: number) {
		if (isComputerThinking || showAnimation) return;
		handlePointClick(id);
	}

	// Removed unused function getAiAnimationPath() and related derived state

	// Unified animation trigger function - faster for better gameplay experience
	function triggerAnimation(move: Move, duration: number = 400) {
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
		try {
			// Reset animation
			animationProgress = 0;

			const startTime = Date.now();
			let animationFrameId: number;

			function animate() {
				try {
					const elapsed = Date.now() - startTime;
					const progress = Math.min(elapsed / duration, 1);

					// Snappy ease-out animation for responsive gameplay
					animationProgress = 1 - Math.pow(1 - progress, 2);

					if (progress < 1) {
						try {
							animationFrameId = requestAnimationFrame(animate);
						} catch (rafError) {
							// WARN: requestAnimationFrame failed - fallback to setTimeout
							console.warn('requestAnimationFrame failed, using setTimeout fallback:', rafError);
							setTimeout(animate, 16); // ~60fps fallback
						}
					} else {
						// Animation complete - clean up immediately
						showAnimation = false;
						animationProgress = 0;
						currentAnimationMove = null;
					}
				} catch (error) {
					// NOTE: Error during animation frame - graceful cleanup
					console.warn('Animation frame error:', error);
					// Clean up animation state
					showAnimation = false;
					animationProgress = 0;
					currentAnimationMove = null;
					if (animationFrameId) {
						try {
							cancelAnimationFrame(animationFrameId);
						} catch (cancelError) {
							console.warn('Failed to cancel animation frame:', cancelError);
						}
					}
				}
			}

			try {
				animationFrameId = requestAnimationFrame(animate);
			} catch (rafError) {
				// WARN: Initial requestAnimationFrame failed - fallback to setTimeout
				console.warn('Initial requestAnimationFrame failed, using setTimeout fallback:', rafError);
				setTimeout(animate, 16); // ~60fps fallback
			}
		} catch (error) {
			// NOTE: Error during animation setup - reset animation state
			console.warn('Animation setup failed:', error);
			showAnimation = false;
			animationProgress = 0;
			currentAnimationMove = null;
		}
	}

	// Cleanup function to clear all active timeouts
	function cleanup() {
		activeTimeouts.forEach((timeoutId) => {
			clearTimeout(timeoutId);
		});
		activeTimeouts = [];
		showPhaseTransition = false;
		phaseTransitionVisible = false;
		showAnimation = false;
		animationProgress = 0;
		currentAnimationMove = null;
	}

	// Clear timeouts when component is destroyed
	onDestroy(() => {
		cleanup();
	});

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
							class="h-full w-full"
							preserveAspectRatio="xMidYMid meet"
							role="img"
							aria-label="Bagchal game board"
							style="background: transparent;"
						>
							<!-- Board Grid and Lines -->
							<BoardGrid {lines} />

							<!-- Game Pieces -->
							<PieceRenderer
								{points}
								{gameState}
								{validMoves}
								handlePointClick={handleBoardClick}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								onDrop={handleDrop}
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
					{#if showPhaseTransition}
						<!-- Phase Transition Notification -->
						<div
							class="phase-transition-notification mx-auto flex max-w-sm items-center justify-center gap-2 border p-2 text-xs sm:text-sm"
							class:visible={phaseTransitionVisible}
						>
							<div class="phase-transition-icon">🐐</div>
							<span class="text-primary font-medium">Goats can now move!</span>
						</div>
					{:else if isComputerThinking && isComputerTurn()}
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

	/* Phase transition notification styles */
	.phase-transition-notification {
		background: linear-gradient(145deg, var(--color-bg-secondary), var(--color-bg-primary));
		border-color: var(--color-primary);
		opacity: 0;
		transform: translateY(-10px) scale(0.95);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow:
			0 4px 15px rgba(201, 42, 42, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.phase-transition-notification.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.phase-transition-icon {
		animation: phase-bounce 0.6s ease-out;
		filter: drop-shadow(0 0 3px rgba(201, 42, 42, 0.3));
	}

	@keyframes phase-bounce {
		0% {
			transform: scale(0.3) rotate(-10deg);
			opacity: 0;
		}
		50% {
			transform: scale(1.1) rotate(5deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
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
