<script lang="ts">
	interface Props {
		isPlayingComputer: boolean;
		onGameModeChange: (isComputer: boolean) => void;
		onReset: () => void;
	}

	let { isPlayingComputer, onGameModeChange, onReset }: Props = $props();

	function handleModeChange(isComputer: boolean) {
		onGameModeChange(isComputer);
		onReset(); // Reset the game when switching modes
	}
</script>

<div class="section-card">
	<h2 class="section-title">Game Mode</h2>
	<div class="space-y-3">
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

	.mode-btn:hover {
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
	.mode-btn:active {
		transform: translateY(1px);
	}
</style> 