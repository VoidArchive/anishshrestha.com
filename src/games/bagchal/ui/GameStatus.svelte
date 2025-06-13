<script lang="ts">
	import type { GameState } from '$games/bagchal/rules';

	interface Props {
		gameState: GameState;
		isComputerThinking?: boolean;
		isPlayingComputer?: boolean;
		playerSide?: string;
	}

	let {
		gameState,
		isComputerThinking = false,
		isPlayingComputer = false,
		playerSide = 'GOAT'
	}: Props = $props();

	// Determine if it's currently the computer's turn
	let isComputerTurn = $derived(isPlayingComputer && gameState.turn !== playerSide);
</script>

<div class="section-card">
	<h2 class="section-title">Game Status</h2>
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<span class="text-text-secondary">Current Turn:</span>
			<div class="flex items-center gap-2">
				<span class="font-semibold capitalize" class:text-primary-red={gameState.turn === 'TIGER'}>
					{gameState.turn.toLowerCase()}
				</span>
				{#if isComputerTurn && !gameState.winner}
					<span class="text-text-secondary text-xs">
						{isComputerThinking ? '(Computer)' : '(Your turn)'}
					</span>
				{/if}
			</div>
		</div>

		<!-- AI Thinking Indicator -->
		{#if isComputerThinking && isComputerTurn && !gameState.winner}
			<div class="bg-bg-primary border-primary-red/20 flex items-center gap-2 rounded border p-2">
				<div class="thinking-dots">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<span class="text-primary-red text-sm font-medium">AI is thinking...</span>
			</div>
		{/if}

		<div class="flex items-center justify-between">
			<span class="text-text-secondary">Phase:</span>
			<span class="font-semibold capitalize">{gameState.phase.toLowerCase()}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-text-secondary">Goats Placed:</span>
			<span class="font-semibold">{gameState.goatsPlaced}/20</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-text-secondary">Goats Captured:</span>
			<span class="text-primary-red font-semibold">{gameState.goatsCaptured}</span>
		</div>
		
		{#if gameState.phase === 'MOVEMENT'}
			<div class="flex items-center justify-between">
				<span class="text-text-secondary">Moves without capture:</span>
				<span 
					class="font-semibold" 
					class:text-yellow-400={gameState.movesWithoutCapture >= 40}
					class:text-primary-red={gameState.movesWithoutCapture >= 50}
				>
					{gameState.movesWithoutCapture}/51
				</span>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Thinking dots animation */
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
