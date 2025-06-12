<script lang="ts">
	interface Props {
		isPlayingComputer: boolean;
		playerSide: string;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onReset: () => void;
	}

	let { isPlayingComputer, playerSide, onGameModeChange, onPlayerSideChange, onReset }: Props = $props();

	function handleModeChange(isComputer: boolean) {
		onGameModeChange(isComputer);
		onReset(); // Reset the game when switching modes
	}

	function handleSideChange(side: string) {
		onPlayerSideChange(side);
		onReset(); // Reset the game when switching sides
	}
</script>

<div class="section-card">
	<h2 class="section-title">Game Mode</h2>
	<div class="space-y-3">
		<!-- Opponent Selection -->
		<div class="flex items-center justify-between">
			<span class="text-text-secondary">Opponent:</span>
			<div class="mode-buttons">
				<button 
					class="mode-btn"
					class:active={!isPlayingComputer}
					onclick={() => handleModeChange(false)}
				>
					Human
				</button>
				<button 
					class="mode-btn"
					class:active={isPlayingComputer}
					onclick={() => handleModeChange(true)}
				>
					Computer
				</button>
			</div>
		</div>

		<!-- Player Side Selection (only when playing computer) -->
		<div class="flex items-center justify-between" class:disabled={!isPlayingComputer}>
			<span class="text-text-secondary">Play as:</span>
			<div class="mode-buttons">
				<button 
					class="mode-btn"
					class:active={playerSide === 'GOAT'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleSideChange('GOAT')}
					disabled={!isPlayingComputer}
				>
					Goat
				</button>
				<button 
					class="mode-btn"
					class:active={playerSide === 'TIGER'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleSideChange('TIGER')}
					disabled={!isPlayingComputer}
				>
					Tiger
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.mode-buttons {
		display: flex;
		gap: 4px;
	}

	.mode-btn {
		padding: 6px 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 70px;
	}

	.mode-btn:hover:not(:disabled) {
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
	}

	.mode-btn.active {
		background: var(--color-primary-red);
		border-color: var(--color-primary-red);
		color: white;
	}

	.mode-btn:first-child {
		border-right: none;
	}

	.mode-btn:last-child {
		border-left: none;
	}

	/* Subtle pressed effect */
	.mode-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	/* Disabled state */
	.mode-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.disabled {
		opacity: 0.6;
	}

	.disabled .text-text-secondary {
		opacity: 0.5;
	}
</style> 