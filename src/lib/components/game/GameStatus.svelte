<script lang="ts">
	import type { GameState } from '$lib/bagchal';

	interface Props {
		gameState: GameState;
	}

	let { gameState }: Props = $props();
</script>

<div class="section-card">
	<h2 class="section-title">Game Status</h2>
	<div class="space-y-3">
		<div class="flex justify-between items-center">
			<span class="text-text-secondary">Current Turn:</span>
			<span class="capitalize font-semibold" class:text-primary-red={gameState.turn === 'TIGER'}>
				{gameState.turn.toLowerCase()}
			</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-text-secondary">Phase:</span>
			<span class="capitalize font-semibold">{gameState.phase.toLowerCase()}</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-text-secondary">Goats Placed:</span>
			<span class="font-semibold">{gameState.goatsPlaced}/20</span>
		</div>
		<div class="flex justify-between items-center">
			<span class="text-text-secondary">Goats Captured:</span>
			<span class="font-semibold text-primary-red">{gameState.goatsCaptured}</span>
		</div>
	</div>
</div> 