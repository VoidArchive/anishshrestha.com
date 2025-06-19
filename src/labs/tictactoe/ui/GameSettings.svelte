<script lang="ts">
	interface Props {
		isPlayingComputer: boolean;
		playerSide: 'X' | 'O';
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: 'X' | 'O') => void;
		onReset: () => void;
	}

	let { isPlayingComputer, playerSide, onGameModeChange, onPlayerSideChange, onReset }: Props =
		$props();

	function handleModeChange(isComputer: boolean) {
		onGameModeChange(isComputer);
		onReset();
	}

	function handleSideChange(side: 'X' | 'O') {
		onPlayerSideChange(side);
		onReset();
	}
</script>

<div class="section-card">
	<h2 class="section-title">Game Mode</h2>
	<div class="space-y-3">
		<!-- Opponent -->
		<div class="flex items-center justify-between">
			<span class="text-text-muted">Opponent:</span>
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
					AI
				</button>
			</div>
		</div>

		<!-- Side selection -->
		<div class="flex items-center justify-between" class:disabled={!isPlayingComputer}>
			<span class="text-text-muted">Play as:</span>
			<div class="mode-buttons">
				<button
					class="mode-btn"
					class:active={playerSide === 'X'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleSideChange('X')}
					disabled={!isPlayingComputer}
				>
					X
				</button>
				<button
					class="mode-btn"
					class:active={playerSide === 'O'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleSideChange('O')}
					disabled={!isPlayingComputer}
				>
					O
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.mode-buttons {
		display: flex;
		gap: 8px;
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
		background: var(--color-bg-primary);
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
	}

	.mode-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.disabled {
		opacity: 0.6;
	}
</style>
