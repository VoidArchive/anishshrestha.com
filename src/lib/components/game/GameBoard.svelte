<script lang="ts">
	import BagchalBoard from '../bagchal/BagchalBoard.svelte';
	import type { GameState } from '$lib/bagchal';

	interface Props {
		points: any;
		lines: any;
		gameState: GameState;
		validMoves: number[];
		handlePointClick: (id: number) => void;
	}

	let { points, lines, gameState, validMoves, handlePointClick }: Props = $props();
</script>

<section class="flex flex-col lg:order-2">
	<div class="section-card h-full">
		<h2 class="section-title">Bagchal Board</h2>
		
		<!-- Recessed Game Board Container -->
		<div class="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
			<!-- Carved Board Well -->
			<div class="board-well">
				<div class="board-inner">
					<div class="board-wrapper">
						<BagchalBoard {points} {lines} {gameState} {validMoves} {handlePointClick} />
					</div>
				</div>
			</div>
			
			<!-- Game Instructions based on current state -->
			<div class="mt-3 text-center">
				{#if gameState.winner}
					<p class="text-lg font-bold text-primary-red">
						{#if gameState.winner === 'DRAW'}
							🤝 It's a Draw!
						{:else}
							🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
						{/if}
					</p>
				{:else if gameState.phase === 'MOVEMENT'}
					<p class="text-text-secondary text-sm">
						{gameState.turn === 'GOAT' ? 'Select and move a goat' : 'Select a tiger and move or capture'}
					</p>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	/* Recessed Board Well Effect */
	.board-well {
		width: 100%;
		max-width: none;
		padding: 0.75rem;
		position: relative;
	}
	
	.board-inner {
		width: 100%;
        aspect-ratio: 1;
		height: 100%;
		background: linear-gradient(145deg, #151515, var(--color-bg-primary));
		padding: 0.75rem;
		position: relative;
		/* Deep inset effect */
		box-shadow: 
			/* Strong inset shadows for depth */
			inset 4px 4px 12px rgba(0, 0, 0, 0.7),
			inset -2px -2px 8px rgba(255, 255, 255, 0.04),
			/* Inner glow */
			inset 0 0 20px rgba(0, 0, 0, 0.5),
			/* Subtle red accent glow */
			inset 0 0 40px rgba(201, 42, 42, 0.02);
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
		width: min(95vw, 450px);
		height: min(95vw, 450px);
		max-width: none;
	}
	
	@media (min-width: 640px) {
		.board-wrapper :global(svg) {
			width: min(85vw, 500px);
			height: min(85vw, 500px);
		}
	}
	
	@media (min-width: 768px) {
		.board-wrapper :global(svg) {
			width: min(70vw, 550px);
			height: min(70vw, 550px);
		}
	}
	
	@media (min-width: 1024px) {
		.board-wrapper :global(svg) {
			width: min(50vw, 700px);
			height: min(50vw, 700px);
		}
	}
</style> 