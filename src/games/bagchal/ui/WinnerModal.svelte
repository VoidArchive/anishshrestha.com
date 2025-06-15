<script lang="ts">
	import type { GameState } from '$games/bagchal/rules';

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
			case 'excellent': return 'text-green-500';
			case 'good': return 'text-yellow-500';
			case 'fair': return 'text-orange-500';
			case 'bad': return 'text-red-500';
			case 'draw': return 'text-gray-500';
			default: return 'text-text';
		}
	}
</script>

{#if gameState.winner}
	<!-- Modal Overlay -->
	<div 
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4
			{modalVisible ? 'opacity-100' : 'opacity-0'}
			transition-opacity duration-300"
	>
		<!-- Modal Card -->
		<div 
			class="bg-bg-primary border-2 border-border max-w-md w-full max-h-[80vh] overflow-y-auto
				{modalVisible ? 'translate-y-0 scale-100' : 'translate-y-5 scale-95'}
				transition-all duration-300 ease-out
				shadow-[0_8px_0_rgba(201,42,42,0.2),0_12px_20px_rgba(0,0,0,0.3)]"
		>
			<!-- Winner Announcement -->
			<div class="text-center p-8 pb-4 border-b border-border">
				<!-- Winner Icon with bounce animation -->
				<div class="mb-4 animate-bounce">
					{#if gameState.winner === 'DRAW'}
						<div class="text-5xl">🤝</div>
					{:else if gameState.winner === 'TIGER'}
						<img src="/icons/tiger.svg" alt="Tiger" class="w-12 h-12 inline-block" />
					{:else}
						<img src="/icons/goat.svg" alt="Goat" class="w-12 h-12 inline-block" />
					{/if}
				</div>

				<!-- Winner Title -->
				<h2 class="text-2xl font-bold text-text mb-2 uppercase tracking-wide">
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
				<div class="p-6 border-b border-border">
					<h3 class="text-base font-semibold text-text mb-4 uppercase tracking-wider">
						Game Summary
					</h3>
					
					<div class="grid grid-cols-2 gap-4">
						<!-- Total Moves -->
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-text-muted mb-1 uppercase tracking-wider">
								Total Moves
							</span>
							<span class="text-xl font-bold text-text">
								{stats.totalMoves}
							</span>
						</div>

						<!-- Goats Captured -->
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-text-muted mb-1 uppercase tracking-wider">
								Goats Captured
							</span>
							<span class="text-xl font-bold text-text">
								{stats.goatsCaptured}
							</span>
						</div>

						{#if isPlayingComputer}
							<!-- Your Moves -->
							<div class="flex flex-col items-center text-center">
								<span class="text-xs text-text-muted mb-1 uppercase tracking-wider">
									Your Moves
								</span>
								<span class="text-xl font-bold text-text">
									{stats.playerMoves}
								</span>
							</div>

							<!-- Performance -->
							<div class="flex flex-col items-center text-center">
								<span class="text-xs text-text-muted mb-1 uppercase tracking-wider">
									Performance
								</span>
								<span class="text-base font-bold uppercase tracking-wider {getPerformanceColor(stats.performance)}">
									{stats.performance}
								</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="p-6 flex flex-col gap-3">
				<button 
					onclick={handlePlayAgain}
					class="w-full px-6 py-3 text-sm font-semibold uppercase tracking-wider
						bg-primary border border-primary text-white
						hover:bg-red-700 hover:border-red-700
						active:translate-y-px
						transition-all duration-200"
				>
					Play Again
				</button>

				{#if isPlayingComputer && onSwitchSides}
					<button 
						onclick={handleSwitchSides}
						class="w-full px-6 py-3 text-sm font-semibold uppercase tracking-wider
							bg-bg-secondary border border-border text-text
							hover:border-primary hover:text-text
							active:translate-y-px
							transition-all duration-200"
					>
						Switch Sides
					</button>
				{/if}

				{#if isPlayingComputer && onChangeMode}
					<button 
						onclick={handleChangeMode}
						class="w-full px-6 py-3 text-sm font-semibold uppercase tracking-wider
							bg-bg-secondary border border-border text-text
							hover:border-primary hover:text-text
							active:translate-y-px
							transition-all duration-200"
					>
						Change Mode
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
