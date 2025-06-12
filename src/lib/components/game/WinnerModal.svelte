<script lang="ts">
	import type { GameState } from '$lib/bagchal';

	interface Props {
		gameState: GameState;
		onPlayAgain: () => void;
	}

	let { gameState, onPlayAgain }: Props = $props();
</script>

{#if gameState.winner}
	<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
		<div class="mx-auto max-w-sm bg-white dark:bg-gray-800 p-8 text-center shadow-2xl">
			<h2 class="mb-4 text-4xl font-bold text-green-600">
				🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
			</h2>
			<p class="mb-4 text-text-secondary">
				{gameState.winner === 'TIGER' 
					? `Captured ${gameState.goatsCaptured} goats!` 
					: 'All tigers are trapped!'}
			</p>
			<button
				onclick={onPlayAgain}
				class="mt-4 bg-indigo-600 px-8 py-3 text-white transition hover:bg-indigo-700"
			>
				Play Again
			</button>
		</div>
	</div>
{/if} 