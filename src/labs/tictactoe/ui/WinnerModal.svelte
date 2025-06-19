<script lang="ts">
	import type { GameState } from '$labs/tictactoe/rules';

	export let gameState: GameState;
	export let onPlayAgain: () => void;

	function handlePlayAgain() {
		onPlayAgain();
	}
</script>

{#if gameState.winner}
	<!-- Backdrop -->
	<div class="modal-backdrop">
		<!-- Modal card -->
		<div class="modal-card visible">
			<section class="winner-section">
				<div class="winner-icon">
					{#if gameState.winner === 'DRAW'}
						<svg
							class="icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#f8f8f8"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></svg
						>
					{:else if gameState.winner === 'X'}
						<svg
							class="icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#f8f8f8"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
						>
					{:else}
						<svg
							class="icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#f8f8f8"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><circle cx="12" cy="12" r="9" /></svg
						>
					{/if}
				</div>
				<h2 class="winner-title">
					{gameState.winner === 'DRAW' ? "It's a Draw!" : `${gameState.winner} Wins!`}
				</h2>
				<p class="winner-subtitle">Thanks for playing.</p>
			</section>

			<section class="actions-section">
				<button class="action-btn primary" onclick={handlePlayAgain}>Play Again</button>
			</section>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-card {
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		max-width: 320px;
		width: 90%;
		text-align: center;
		transform: translateY(20px) scale(0.95);
		transition: all 0.3s ease;
	}

	.modal-card.visible {
		transform: translateY(0) scale(1);
	}

	.winner-section {
		padding: 2rem 1.5rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.icon {
		width: 64px;
		height: 64px;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	.winner-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.25rem;
		text-transform: uppercase;
	}

	.winner-subtitle {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.875rem;
	}

	.actions-section {
		padding: 1.5rem;
	}

	.action-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		border-color: var(--color-primary-red);
	}

	.action-btn.primary {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
	}

	.action-btn.primary:hover {
		background: #b91c1c;
	}
</style>
