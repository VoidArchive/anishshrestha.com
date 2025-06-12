<script lang="ts">
	interface Props {
		isPlayingComputer: boolean;
		playerSide: string;
		aiDifficulty: 'easy' | 'medium' | 'hard';
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
		onReset: () => void;
	}

	let { isPlayingComputer, playerSide, aiDifficulty, onGameModeChange, onPlayerSideChange, onDifficultyChange, onReset }: Props = $props();

	function handleModeChange(isComputer: boolean) {
		onGameModeChange(isComputer);
		onReset(); // Reset the game when switching modes
	}

	function handleSideChange(side: string) {
		onPlayerSideChange(side);
		onReset(); // Reset the game when switching sides
	}

	function handleDifficultyChange(difficulty: 'easy' | 'medium' | 'hard') {
		onDifficultyChange(difficulty);
		// No need to reset the game when changing difficulty
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
					AI
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

		<!-- AI Difficulty Selection (only when playing computer) -->
		<div class="flex items-center justify-between" class:disabled={!isPlayingComputer}>
			<span class="text-text-secondary">AI MODE:</span>
			<div class="mode-buttons">
				<button 
					class="mode-btn difficulty-btn"
					class:active={aiDifficulty === 'easy'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleDifficultyChange('easy')}
					disabled={!isPlayingComputer}
					title="Easy: Depth 4 - Quick moves"
				>
					Easy
				</button>
				<button 
					class="mode-btn difficulty-btn"
					class:active={aiDifficulty === 'medium'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleDifficultyChange('medium')}
					disabled={!isPlayingComputer}
					title="Medium: Depth 6 - Balanced play"
				>
					Medium
				</button>
				<button 
					class="mode-btn difficulty-btn"
					class:active={aiDifficulty === 'hard'}
					class:disabled={!isPlayingComputer}
					onclick={() => handleDifficultyChange('hard')}
					disabled={!isPlayingComputer}
					title="Hard: Depth 8 - Strategic moves"
				>
					Hard
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
		outline: none; /* Remove focus outline */
	}

	.mode-btn:hover:not(:disabled) {
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
	}

	.mode-btn:focus {
		outline: none; /* Remove focus outline */
	}

	.mode-btn.active {
		background: var(--color-bg-primary);
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
		font-weight: 700; /* Slightly bolder text */
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

	/* Difficulty buttons styling */
	.difficulty-btn {
		min-width: 55px;
		font-size: 0.7rem;
	}
</style> 