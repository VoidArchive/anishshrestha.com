<script lang="ts">
	import type { GameState } from '$lib/bagchal';

	interface Props {
		gameState: GameState;
		moveHistory: string[];
		isPlayingComputer: boolean;
		playerSide: string;
		onPlayAgain: () => void;
		onSwitchSides?: () => void;
		onChangeDifficulty?: () => void;
	}

	let { 
		gameState, 
		moveHistory, 
		isPlayingComputer, 
		playerSide, 
		onPlayAgain, 
		onSwitchSides, 
		onChangeDifficulty 
	}: Props = $props();

	// Calculate game statistics
	let gameStats = $derived(() => {
		if (!gameState.winner) return null;

		const totalMoves = moveHistory.length;
		const playerMoves = moveHistory.filter(move => 
			!move.toLowerCase().includes('computer')
		).length;
		const computerMoves = totalMoves - playerMoves;

		// Determine if player won/lost/drew
		const playerWon = isPlayingComputer 
			? gameState.winner === playerSide
			: null;
		const isDraw = gameState.winner === 'DRAW';

		// Performance rating for computer games
		let performance = '';
		if (isPlayingComputer && !isDraw && playerWon !== null) {
			if (playerWon) {
				if (playerSide === 'GOAT' && gameState.goatsCaptured <= 1) {
					performance = 'Excellent';
				} else if (playerSide === 'TIGER' && totalMoves <= 30) {
					performance = 'Excellent';
				} else {
					performance = 'Good';
				}
			} else {
				// Player lost - rate based on how well they fought
				if (playerSide === 'GOAT') {
					// Goats lost, so tigers captured 5. Rate based on game length
					if (totalMoves >= 50) {
						performance = 'Good'; // Put up a long fight
					} else if (totalMoves >= 30) {
						performance = 'Fair'; // Decent resistance
					} else {
						performance = 'Bad'; // Quick defeat
					}
				} else {
					// Tigers lost (goats trapped them) - rate based on captures made
					if (gameState.goatsCaptured >= 3) {
						performance = 'Good'; // Got close to winning
					} else if (gameState.goatsCaptured >= 1) {
						performance = 'Fair'; // Made some progress
					} else {
						performance = 'Bad'; // No captures
					}
				}
			}
		} else if (isDraw) {
			performance = 'Draw'; // Special case for draws
		}

		return {
			totalMoves,
			playerMoves,
			computerMoves,
			goatsCaptured: gameState.goatsCaptured,
			playerWon,
			isDraw,
			performance
		};
	});

	// Animation state
	let modalVisible = $state(false);

	// Show modal with animation when winner is determined
	$effect(() => {
		if (gameState.winner) {
			setTimeout(() => modalVisible = true, 100);
		} else {
			modalVisible = false;
		}
	});

	function handlePlayAgain() {
		modalVisible = false;
		setTimeout(onPlayAgain, 200);
	}

	function handleSwitchSides() {
		if (onSwitchSides) {
			modalVisible = false;
			setTimeout(onSwitchSides, 200);
		}
	}
</script>

{#if gameState.winner}
	<div class="modal-overlay" class:visible={modalVisible}>
		<div class="modal-card" class:visible={modalVisible}>
			<!-- Winner Announcement -->
			<div class="winner-section">
				<div class="winner-icon">
					{#if gameState.winner === 'DRAW'}
						🤝
					{:else if gameState.winner === 'TIGER'}
						<img src="/icons/tiger.svg" alt="Tiger" class="winner-img" />
					{:else}
						<img src="/icons/goat.svg" alt="Goat" class="winner-img" />
					{/if}
				</div>
				<h2 class="winner-title">
					{#if gameState.winner === 'DRAW'}
						It's a Draw!
					{:else if isPlayingComputer && gameStats()}
						{gameStats()?.playerWon ? 'Victory!' : 'Defeat!'}
					{:else}
						{gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
					{/if}
				</h2>
				<p class="winner-subtitle">
					{#if gameState.winner === 'DRAW'}
						Position repeated too many times!
					{:else if gameState.winner === 'TIGER'}
						Captured {gameState.goatsCaptured} goats!
					{:else}
						All tigers are trapped!
					{/if}
				</p>
			</div>

			<!-- Game Statistics -->
			{#if gameStats()}
				{@const stats = gameStats()}
				<div class="stats-section">
					<h3 class="stats-title">Game Summary</h3>
					<div class="stats-grid">
						<div class="stat-item">
							<span class="stat-label">Total Moves</span>
							<span class="stat-value">{stats?.totalMoves}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Goats Captured</span>
							<span class="stat-value">{stats?.goatsCaptured}</span>
						</div>
						{#if isPlayingComputer}
							<div class="stat-item">
								<span class="stat-label">Your Moves</span>
								<span class="stat-value">{stats?.playerMoves}</span>
							</div>
							<div class="stat-item">
								<span class="stat-label">Performance</span>
								<span class="stat-value performance {stats?.performance.toLowerCase()}">
									{stats?.performance}
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="actions-section">
				<button class="action-btn primary" onclick={handlePlayAgain}>
					Play Again
				</button>
				
				{#if isPlayingComputer && onSwitchSides}
					<button class="action-btn secondary" onclick={handleSwitchSides}>
						Switch Sides
					</button>
				{/if}
				
				{#if isPlayingComputer && onChangeDifficulty}
					<button class="action-btn secondary" onclick={onChangeDifficulty}>
						Change Difficulty
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		opacity: 0;
		transition: opacity 0.3s ease;
		backdrop-filter: blur(4px);
	}

	.modal-overlay.visible {
		opacity: 1;
	}

	.modal-card {
		background: var(--color-bg-primary);
		border: 2px solid var(--color-border);
		max-width: 400px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
		transform: translateY(20px) scale(0.95);
		transition: all 0.3s ease;
		
		/* Sharp, angular shadow */
		box-shadow: 
			0 8px 0 rgba(201, 42, 42, 0.2),
			0 12px 20px rgba(0, 0, 0, 0.3);
	}

	.modal-card.visible {
		transform: translateY(0) scale(1);
	}

	.winner-section {
		text-align: center;
		padding: 2rem 2rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.winner-icon {
		margin-bottom: 1rem;
		animation: bounce 0.6s ease;
	}

	.winner-img {
		width: 3rem;
		height: 3rem;
		display: inline-block;
	}

	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-10px); }
	}

	.winner-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-text-primary);
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.winner-subtitle {
		color: var(--color-text-secondary);
		margin: 0;
		font-size: 0.9rem;
	}

	.stats-section {
		padding: 1.5rem 2rem;
		border-bottom: 1px solid var(--color-border);
	}

	.stats-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--color-text-primary);
	}

	.stat-value.performance {
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value.performance.excellent {
		color: #10b981; /* Green */
	}

	.stat-value.performance.good {
		color: #f59e0b; /* Amber */
	}

	.stat-value.performance.fair {
		color: #f97316; /* Orange */
	}

	.stat-value.performance.bad {
		color: #ef4444; /* Red */
	}

	.stat-value.performance.draw {
		color: #6b7280; /* Gray */
	}

	.actions-section {
		padding: 1.5rem 2rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.action-btn {
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}

	.action-btn:hover {
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
	}

	.action-btn.primary {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
	}

	.action-btn.primary:hover {
		background: #b91c1c;
		border-color: #b91c1c;
	}

	.action-btn:active {
		transform: translateY(1px);
	}

	/* Responsive design */
	@media (max-width: 480px) {
		.modal-card {
			width: 95%;
			margin: 1rem;
		}

		.winner-section {
			padding: 1.5rem 1.5rem 1rem;
		}

		.stats-section, .actions-section {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
		}

		.winner-icon {
			font-size: 2.5rem;
		}

		.winner-title {
			font-size: 1.25rem;
		}
	}
</style> 