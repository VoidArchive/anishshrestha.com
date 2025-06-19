<script lang="ts">
	import type { GameState } from '$labs/bagchal/rules';

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

	// Show modal with animation when winner is determined
	$effect(() => {
		if (gameState.winner) {
			setTimeout(() => (modalVisible = true), 100);
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

	function handleChangeMode() {
		if (onChangeMode) {
			modalVisible = false;
			setTimeout(onChangeMode, 200);
		}
	}

	// Get performance color classes
	function getPerformanceColor(performance: string): string {
		switch (performance.toLowerCase()) {
			case 'excellent':
				return 'text-green-500';
			case 'good':
				return 'text-yellow-500';
			case 'fair':
				return 'text-orange-500';
			case 'bad':
				return 'text-red-500';
			case 'draw':
				return 'text-gray-500';
			default:
				return 'text-text';
		}
	}
</script>

{#if gameState.winner}
	<!-- Modal Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
			{modalVisible ? 'opacity-100' : 'opacity-0'}
			transition-opacity duration-300"
	>
		<!-- Modal Card -->
		<div
			class="bg-bg-primary border-border max-h-[80vh] w-full max-w-md overflow-y-auto border-2
				{modalVisible ? 'translate-y-0 scale-100' : 'translate-y-5 scale-95'}
				shadow-[0_8px_0_rgba(201,42,42,0.2),0_12px_20px_rgba(0,0,0,0.3)] transition-all duration-300
				ease-out"
		>
			<!-- Winner Announcement -->
			<div class="border-border border-b p-8 pb-4 text-center">
				<!-- Winner Icon with bounce animation -->
				<div class="mb-4 animate-bounce">
					{#if gameState.winner === 'DRAW'}
						<div class="text-5xl">🤝</div>
					{:else if gameState.winner === 'TIGER'}
						<img src="/icons/tiger.svg" alt="Tiger" class="inline-block h-12 w-12" />
					{:else}
						<img src="/icons/goat.svg" alt="Goat" class="inline-block h-12 w-12" />
					{/if}
				</div>

				<!-- Winner Title -->
				<h2 class="text-text mb-2 text-2xl font-bold tracking-wide uppercase">
					{#if gameState.winner === 'DRAW'}
						It's a Draw!
					{:else if isPlayingComputer && playerWon !== null}
						{playerWon ? 'Victory!' : 'Defeat!'}
					{:else}
						{gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
					{/if}
				</h2>

				<!-- Winner Subtitle -->
				<p class="text-text-muted text-sm">
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
			{#if stats}
				<div class="border-border border-b p-6">
					<h3 class="text-text mb-4 text-base font-semibold tracking-wider uppercase">
						Game Summary
					</h3>

					<div class="grid grid-cols-2 gap-4">
						<!-- Total Moves -->
						<div class="flex flex-col items-center text-center">
							<span class="text-text-muted mb-1 text-xs tracking-wider uppercase">
								Total Moves
							</span>
							<span class="text-text text-xl font-bold">
								{stats.totalMoves}
							</span>
						</div>

						<!-- Goats Captured -->
						<div class="flex flex-col items-center text-center">
							<span class="text-text-muted mb-1 text-xs tracking-wider uppercase">
								Goats Captured
							</span>
							<span class="text-text text-xl font-bold">
								{stats.goatsCaptured}
							</span>
						</div>

						{#if isPlayingComputer}
							<!-- Your Moves -->
							<div class="flex flex-col items-center text-center">
								<span class="text-text-muted mb-1 text-xs tracking-wider uppercase">
									Your Moves
								</span>
								<span class="text-text text-xl font-bold">
									{stats.playerMoves}
								</span>
							</div>

							<!-- Performance -->
							<div class="flex flex-col items-center text-center">
								<span class="text-text-muted mb-1 text-xs tracking-wider uppercase">
									Performance
								</span>
								<span
									class="text-base font-bold tracking-wider uppercase {getPerformanceColor(
										stats.performance
									)}"
								>
									{stats.performance}
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex flex-col gap-3 p-6">
				<button
					onclick={handlePlayAgain}
					class="bg-primary border-primary w-full border px-6 py-3 text-sm
						font-semibold tracking-wider text-white uppercase
						transition-all duration-200
						hover:border-red-700
						hover:bg-red-700 active:translate-y-px"
				>
					Play Again
				</button>

				{#if isPlayingComputer && onSwitchSides}
					<button
						onclick={handleSwitchSides}
						class="bg-bg-secondary border-border text-text hover:border-primary hover:text-text w-full border
							px-6 py-3 text-sm font-semibold
							tracking-wider uppercase
							transition-all
							duration-200 active:translate-y-px"
					>
						Switch Sides
					</button>
				{/if}

				{#if isPlayingComputer && onChangeMode}
					<button
						onclick={handleChangeMode}
						class="bg-bg-secondary border-border text-text hover:border-primary hover:text-text w-full border
							px-6 py-3 text-sm font-semibold
							tracking-wider uppercase
							transition-all
							duration-200 active:translate-y-px"
					>
						Change Mode
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
