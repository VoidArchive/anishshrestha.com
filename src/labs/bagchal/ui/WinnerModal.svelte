<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { GameState } from '#labs/bagchal/rules/index.js';

	interface Props {
		gameState: GameState;
		moveHistory: string[];
		isPlayingComputer: boolean;
		playerSide: string;
		onPlayAgain: () => void;
		onSwitchSides?: () => void;
		onChangeMode?: () => void;
	}

	let {
		gameState,
		moveHistory,
		isPlayingComputer,
		playerSide,
		onPlayAgain,
		onSwitchSides,
		onChangeMode
	}: Props = $props();

	// Calculate game statistics
	let gameStats = $derived(() => {
		if (!gameState.winner) return null;

		const totalMoves = moveHistory.length;
		const playerMoves = moveHistory.filter(
			(move) => !move.toLowerCase().includes('computer')
		).length;
		const computerMoves = totalMoves - playerMoves;

		// Determine if player won/lost/drew
		const playerWon = isPlayingComputer ? gameState.winner === playerSide : null;
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
					if (totalMoves >= 50) {
						performance = 'Good';
					} else if (totalMoves >= 30) {
						performance = 'Fair';
					} else {
						performance = 'Bad';
					}
				} else {
					if (gameState.goatsCaptured >= 3) {
						performance = 'Good';
					} else if (gameState.goatsCaptured >= 1) {
						performance = 'Fair';
					} else {
						performance = 'Bad';
					}
				}
			}
		} else if (isDraw) {
			performance = 'Draw';
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
	let stats = $derived(gameStats());
	let playerWon = $derived(stats?.playerWon ?? null);

	// Timeout tracking for cleanup
	let activeTimeouts: ReturnType<typeof setTimeout>[] = [];

	// Show modal with animation when winner is determined
	$effect(() => {
		if (gameState.winner) {
			try {
				const timeoutId = setTimeout(() => {
					try {
						modalVisible = true;
					} catch (error) {
						// NOTE: Error showing modal - display immediately
						console.warn('Modal visibility animation failed:', error);
						modalVisible = true;
					}
				}, 100);
				activeTimeouts.push(timeoutId);
			} catch (error) {
				// NOTE: setTimeout for modal failed - show immediately
				console.warn('Modal setTimeout failed:', error);
				modalVisible = true;
			}
		} else {
			modalVisible = false;
		}
	});

	function handlePlayAgain() {
		modalVisible = false;
		try {
			const timeoutId = setTimeout(onPlayAgain, 200);
			activeTimeouts.push(timeoutId);
		} catch (error) {
			// NOTE: setTimeout for play again failed - execute immediately
			console.warn('Play again setTimeout failed:', error);
			onPlayAgain();
		}
	}

	function handleSwitchSides() {
		if (onSwitchSides) {
			modalVisible = false;
			try {
				const timeoutId = setTimeout(onSwitchSides, 200);
				activeTimeouts.push(timeoutId);
			} catch (error) {
				// NOTE: setTimeout for switch sides failed - execute immediately
				console.warn('Switch sides setTimeout failed:', error);
				onSwitchSides();
			}
		}
	}

	function handleChangeMode() {
		if (onChangeMode) {
			modalVisible = false;
			try {
				const timeoutId = setTimeout(onChangeMode, 200);
				activeTimeouts.push(timeoutId);
			} catch (error) {
				// NOTE: setTimeout for change mode failed - execute immediately
				console.warn('Change mode setTimeout failed:', error);
				onChangeMode();
			}
		}
	}

	// Cleanup function to clear all active timeouts
	function cleanup() {
		activeTimeouts.forEach((timeoutId) => {
			clearTimeout(timeoutId);
		});
		activeTimeouts = [];
	}

	// Clear timeouts when component is destroyed
	onDestroy(() => {
		cleanup();
	});
</script>

{#if gameState.winner}
	<div class="overlay" class:visible={modalVisible}>
		<div class="plate" role="dialog" aria-modal="true" aria-labelledby="winner-title">
			<h2 id="winner-title">
				{#if gameState.winner === 'DRAW'}
					A draw
				{:else if isPlayingComputer && playerWon !== null}
					{playerWon ? 'You win' : 'You lose'}
				{:else}
					{gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} win
				{/if}
			</h2>
			<p class="dek">
				{#if gameState.winner === 'DRAW'}
					The position repeated too many times.
				{:else if gameState.winner === 'TIGER'}
					The tigers captured {gameState.goatsCaptured} goats.
				{:else}
					Every tiger is trapped.
				{/if}
			</p>

			{#if stats}
				<dl class="rows">
					<div>
						<dt class="caps">Total moves</dt>
						<dd>{stats.totalMoves}</dd>
					</div>
					<div>
						<dt class="caps">Goats captured</dt>
						<dd>{stats.goatsCaptured}</dd>
					</div>
					{#if isPlayingComputer}
						<div>
							<dt class="caps">Your moves</dt>
							<dd>{stats.playerMoves}</dd>
						</div>
						<div>
							<dt class="caps">Performance</dt>
							<dd>{stats.performance}</dd>
						</div>
					{/if}
				</dl>
			{/if}

			<div class="actions">
				<button onclick={handlePlayAgain} class="btn active">Play again</button>
				{#if isPlayingComputer && onSwitchSides}
					<button onclick={handleSwitchSides} class="btn">Switch sides</button>
				{/if}
				{#if isPlayingComputer && onChangeMode}
					<button onclick={handleChangeMode} class="btn">Change mode</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: color-mix(in srgb, var(--color-ink) 60%, transparent);
		opacity: 0;
		transition: opacity 300ms ease-out;
	}
	.overlay.visible {
		opacity: 1;
	}
	.plate {
		width: 100%;
		max-width: 28rem;
		max-height: 80vh;
		overflow-y: auto;
		padding: 24px;
		border: 1.5px solid var(--color-ink);
		background: var(--color-paper);
		color: var(--color-ink);
	}
	h2 {
		font-size: 28px;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.015em;
	}
	.dek {
		font-style: italic;
		font-size: 17px;
		margin-top: 6px;
	}
	.rows {
		margin-top: 20px;
		border-top: 1.5px solid var(--color-ink);
		font-size: 15.5px;
	}
	.rows div {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 0;
		border-bottom: 1px solid var(--color-ink);
	}
	.rows dt {
		color: var(--color-spot-text);
	}
	.rows dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 24px;
	}
</style>
