<script lang="ts">
	import type { GameState } from '#labs/bagchal/rules/index.js';

	interface Props {
		gameState: GameState;
		isPlayingComputer: boolean;
		playerSide: string;
		gameMode: 'EASY' | 'HARD';
		isComputerThinking: boolean;
		onReset: () => void;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onModeChange: (mode: 'EASY' | 'HARD') => void;
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

	function handleModeChangeLocal(mode: 'EASY' | 'HARD') {
		if (mode !== gameMode) {
			onModeChange(mode);
			onReset(); // Restart game under new difficulty
		}
	}
</script>

<aside class="sidebar lg:order-1">
	<section>
		<h2 class="section-title">Game Status</h2>
		<dl class="rows">
			<div>
				<dt class="caps">Turn</dt>
				<dd>
					{gameState.turn === 'TIGER' ? 'Tigers' : 'Goats'}
					{#if isComputerTurn && !gameState.winner}
						<i>{isComputerThinking ? '(computer)' : '(you)'}</i>
					{/if}
				</dd>
			</div>
			<div>
				<dt class="caps">Phase</dt>
				<dd>{gameState.phase === 'PLACEMENT' ? 'Placement' : 'Movement'}</dd>
			</div>
			<div>
				<dt class="caps">Goats placed</dt>
				<dd>{gameState.goatsPlaced}/20</dd>
			</div>
			<div>
				<dt class="caps">Goats captured</dt>
				<dd>{gameState.goatsCaptured}</dd>
			</div>
			{#if gameState.phase === 'MOVEMENT'}
				<div>
					<dt class="caps">Moves without capture</dt>
					<dd class:warn={gameState.movesWithoutCapture >= 40}>
						{gameState.movesWithoutCapture}/51
					</dd>
				</div>
			{/if}
		</dl>
	</section>

	<section>
		<h2 class="section-title">Game Mode</h2>
		<dl class="rows">
			<div>
				<dt class="caps">Opponent</dt>
				<dd class="choices">
					<button
						class="btn"
						class:active={!isPlayingComputer}
						onclick={() => handleModeChange(false)}
					>
						Human
					</button>
					<button
						class="btn"
						class:active={isPlayingComputer}
						onclick={() => handleModeChange(true)}
					>
						AI
					</button>
				</dd>
			</div>
			<div>
				<dt class="caps">Play as</dt>
				<dd class="choices">
					<button
						class="btn"
						class:active={playerSide === 'GOAT'}
						onclick={() => handleSideChange('GOAT')}
						disabled={!isPlayingComputer}
					>
						Goat
					</button>
					<button
						class="btn"
						class:active={playerSide === 'TIGER'}
						onclick={() => handleSideChange('TIGER')}
						disabled={!isPlayingComputer}
					>
						Tiger
					</button>
				</dd>
			</div>
			<div>
				<dt class="caps">Difficulty</dt>
				<dd class="choices">
					<button
						class="btn"
						class:active={gameMode === 'EASY'}
						onclick={() => handleModeChangeLocal('EASY')}
						disabled={!isPlayingComputer}
					>
						Easy
					</button>
					<button
						class="btn"
						class:active={gameMode === 'HARD'}
						onclick={() => handleModeChangeLocal('HARD')}
						disabled={!isPlayingComputer}
					>
						Hard
					</button>
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h2 class="section-title">Game Controls</h2>
		<div class="choices">
			<button onclick={onUndo} disabled={!canUndo || isComputerThinking} class="btn">Undo</button>
			<button onclick={onReset} disabled={isComputerThinking} class="btn">Reset</button>
		</div>
	</section>

	<section>
		<h2 class="section-title">Quick Rules</h2>
		<dl class="rows">
			<div>
				<dt class="caps">Goal</dt>
				<dd class="prose">Tigers capture five goats; goats block every tiger move.</dd>
			</div>
			<div>
				<dt class="caps">Phases</dt>
				<dd class="prose">Place twenty goats, then move pieces along the lines.</dd>
			</div>
		</dl>
	</section>
</aside>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
		font-size: 15.5px;
	}
	.rows div {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		padding: 6px 0;
		border-top: 1px solid var(--color-ink);
	}
	.rows div:first-child {
		border-top: 0;
		padding-top: 0;
	}
	.rows dt {
		color: var(--color-spot-text);
		white-space: nowrap;
	}
	.rows dd {
		margin: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.rows dd.prose {
		flex: 1;
		text-align: left;
	}
	.rows dd i {
		margin-left: 4px;
	}
	.warn {
		color: var(--color-spot-text);
	}
	.choices {
		display: flex;
		gap: 8px;
	}
	.choices .btn {
		min-width: 64px;
		justify-content: center;
	}
</style>
