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
