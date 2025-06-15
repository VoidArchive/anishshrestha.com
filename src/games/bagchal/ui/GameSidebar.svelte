<script lang="ts">
	import type { GameState } from '$games/bagchal/rules';

	interface Props {
		gameState: GameState;
		isPlayingComputer: boolean;
		playerSide: string;
		gameMode: 'CLASSIC' | 'REFORGED';
		isComputerThinking: boolean;
		onReset: () => void;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onModeChange: (mode: 'CLASSIC' | 'REFORGED') => void;
		onUndo: () => void;
		canUndo: boolean;
	}

	let {
		gameState,
		isPlayingComputer,
		playerSide,
		gameMode,
		isComputerThinking,
		onReset,
		onGameModeChange,
		onPlayerSideChange,
		onModeChange,
		onUndo,
		canUndo
	}: Props = $props();

	// Determine if it's currently the computer's turn
	let isComputerTurn = $derived(isPlayingComputer && gameState.turn !== playerSide);

	function handleModeChange(isComputer: boolean) {
		onGameModeChange(isComputer);
		onReset(); // Reset the game when switching modes
	}

	function handleSideChange(side: string) {
		onPlayerSideChange(side);
		onReset(); // Reset the game when switching sides
	}

	function handleModeChangeLocal(mode: 'CLASSIC' | 'REFORGED') {
		if (mode !== gameMode) {
			onModeChange(mode);
			onReset(); // Restart game under new rules
		}
	}
</script>

<aside class="space-y-4 lg:order-1 lg:space-y-6">
	<!-- Game Status -->
	<div class="section-card">
		<h2 class="section-title">Game Status</h2>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-text-muted">Current Turn:</span>
				<div class="flex items-center gap-2">
					<span class="font-semibold capitalize" class:text-primary={gameState.turn === 'TIGER'}>
						{gameState.turn.toLowerCase()}
					</span>
					{#if isComputerTurn && !gameState.winner}
						<span class="text-text-muted text-xs">
							{isComputerThinking ? '(Computer)' : '(Your turn)'}
						</span>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-between">
				<span class="text-text-muted">Phase:</span>
				<span class="font-semibold capitalize">{gameState.phase.toLowerCase()}</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-text-muted">Goats Placed:</span>
				<span class="font-semibold">{gameState.goatsPlaced}/20</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-text-muted">Goats Captured:</span>
				<span class="text-primary font-semibold">{gameState.goatsCaptured}</span>
			</div>
			
			{#if gameState.phase === 'MOVEMENT'}
				<div class="flex items-center justify-between">
					<span class="text-text-muted">Moves without capture:</span>
					<span 
						class="font-semibold" 
						class:text-yellow-400={gameState.movesWithoutCapture >= 40}
						class:text-primary={gameState.movesWithoutCapture >= 50}
					>
						{gameState.movesWithoutCapture}/51
					</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Game Settings -->
	<div class="section-card">
		<h2 class="section-title">Game Mode</h2>
		<div class="space-y-3">
			<!-- Opponent Selection -->
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

			<!-- Player Side Selection (only when playing computer) -->
			<div class="flex items-center justify-between" class:disabled={!isPlayingComputer}>
				<span class="text-text-muted">Play as:</span>
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

			<!-- Game Rules Selection -->
			<div class="flex items-center justify-between">
				<span class="text-text-muted">Rules:</span>
				<div class="mode-buttons">
					<button
						class="mode-btn"
						class:active={gameMode === 'CLASSIC'}
						onclick={() => handleModeChangeLocal('CLASSIC')}
					>
						Classic
					</button>
					<button
						class="mode-btn"
						class:active={gameMode === 'REFORGED'}
						onclick={() => handleModeChangeLocal('REFORGED')}
						disabled
					>
						Reforged
					</button>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Game Controls -->
	<div class="section-card">
		<h2 class="section-title">Game Controls</h2>
		<div class="space-y-3">
			<div class="flex gap-2">
				<button
					onclick={onUndo}
					disabled={!canUndo || isComputerThinking}
					class="btn flex-1 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Undo
				</button>
				
				<button
					onclick={onReset}
					disabled={isComputerThinking}
					class="btn flex-1 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
				>
					Reset
				</button>
			</div>
		</div>
	</div>
	
	<!-- Quick Rules -->
	<div class="section-card">
		<h2 class="section-title">Quick Rules</h2>
		<div class="text-text-muted space-y-2 text-sm">
			<p><strong class="text-text">Goal:</strong></p>
			<ul class="ml-4 space-y-1 text-xs list-none">
				<li>Tigers: Capture 5 goats to win</li>
				<li>Goats: Block all tiger moves</li>
			</ul>
			<p><strong class="text-text">Phases:</strong></p>
			<ul class="ml-4 space-y-1 text-xs list-none">
				<li>Place 20 goats on board</li>
				<li>Move pieces strategically</li>
			</ul>
		</div>
	</div>
</aside>

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
		outline: none;
	}

	.mode-btn:hover:not(:disabled) {
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
	}

	.mode-btn:focus {
		outline: none;
	}

	.mode-btn.active {
		background: var(--color-bg-primary);
		border-color: var(--color-primary-red);
		color: var(--color-text-primary);
		font-weight: 700;
	}

	.mode-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.mode-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.disabled {
		opacity: 0.6;
	}

	.disabled .text-text-muted {
		opacity: 0.5;
	}
</style>
