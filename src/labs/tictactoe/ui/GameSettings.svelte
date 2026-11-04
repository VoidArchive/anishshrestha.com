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

<div class="section-card no-margin">
	<h2 class="section-title">Game Mode</h2>
	<div class="space-y-3">
		<!-- Opponent -->
		<div class="flex items-center justify-between">
			<span class="caps">Opponent</span>
			<div class="flex gap-2">
				<button
					class="btn min-w-16 justify-center"
					class:active={!isPlayingComputer}
					onclick={() => handleModeChange(false)}
				>
					Human
				</button>
				<button
					class="btn min-w-16 justify-center"
					class:active={isPlayingComputer}
					onclick={() => handleModeChange(true)}
				>
					AI
				</button>
			</div>
		</div>

		<!-- Side selection -->
		<div class="flex items-center justify-between">
			<span class="caps">Play as</span>
			<div class="flex gap-2">
				<button
					class="btn min-w-16 justify-center"
					class:active={playerSide === 'X'}
					onclick={() => handleSideChange('X')}
					disabled={!isPlayingComputer}
				>
					X
				</button>
				<button
					class="btn min-w-16 justify-center"
					class:active={playerSide === 'O'}
					onclick={() => handleSideChange('O')}
					disabled={!isPlayingComputer}
				>
					O
				</button>
			</div>
		</div>
	</div>
</div>
