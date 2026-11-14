<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { GameState, Line, Point } from '#labs/bagchal/rules/index.js';
	import BoardGrid from './BoardGrid.svelte';
	import PieceRenderer from './PieceRenderer.svelte';
	import Animation from './Animation.svelte';
	import MoveHistory from './MoveHistory.svelte';
	import type { Move } from '#labs/bagchal/ai/types.js';

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
	// Initialize to PLACEMENT since games always start in that phase
	let previousPhase = $state<'PLACEMENT' | 'MOVEMENT'>('PLACEMENT');

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
	<!-- The board is the plate: ink lines on paper inside a 1.5px ink border -->
	<svg
		viewBox="0 0 500 500"
		xmlns="http://www.w3.org/2000/svg"
		class="board"
		preserveAspectRatio="xMidYMid meet"
		role="img"
		aria-label="Bagchal game board"
	>
		<BoardGrid {lines} />
		<PieceRenderer
			{points}
			{gameState}
			{validMoves}
			handlePointClick={handleBoardClick}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDrop={handleDrop}
		/>
		<Animation {showAnimation} {animationProgress} currentMove={currentAnimationMove} {points} />
	</svg>

	<!-- Reading row: the live state of the plate, spot colour while the game runs -->
	<div class="reading caps" class:over={gameState.winner} role="status" aria-live="polite">
		<span class="state">
			{#if gameState.winner === 'DRAW'}
				Draw
			{:else if gameState.winner}
				{gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} win
			{:else if showPhaseTransition}
				<span class="notice" class:visible={phaseTransitionVisible}>Goats can now move</span>
			{:else if isComputerThinking && isComputerTurn()}
				Thinking
			{:else}
				{gameState.turn === 'TIGER' ? 'Tigers' : 'Goats'} to {gameState.phase === 'PLACEMENT' &&
				gameState.turn === 'GOAT'
					? 'place'
					: 'move'}
			{/if}
		</span>
		<span>Goats placed {gameState.goatsPlaced}/20</span>
		<span>Captured {gameState.goatsCaptured}</span>
	</div>

	{#if moveHistory}
		<MoveHistory {moveHistory} />
	{/if}
</section>

<style>
	.board {
		display: block;
		width: 100%;
		max-width: 680px;
		height: auto;
		aspect-ratio: 1;
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
	}
	.reading {
		max-width: 680px;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 18px;
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--color-ink);
		color: var(--color-spot-text);
		font-variant-numeric: tabular-nums;
	}
	.reading.over {
		color: var(--color-ink);
	}
	.state::before {
		content: '';
		display: inline-block;
		width: 8px;
		height: 8px;
		margin-right: 8px;
		background: currentColor;
		vertical-align: 1px;
	}
	.notice {
		opacity: 0;
		transition: opacity 300ms ease-out;
	}
	.notice.visible {
		opacity: 1;
	}
</style>
