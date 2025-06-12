<script lang="ts">
	import { onMount } from 'svelte';
	import BagchalBoard from './bagchal/BagchalBoard.svelte';
	import { gameState, points, lines, adjacency, getValidMoves, getCurrentTigerCaptures, resetGameState } from '$lib/state.svelte';
	import { executeMove, checkIfTigersAreTrapped } from '$lib/bagchal';
	
	// Game history
	let moveHistory: string[] = $state([]);
	
	// Game settings
	let showHints = $state(true);
	let soundEnabled = $state(true);
	
	// Local derived state
	let validMoves = $derived(getValidMoves());
	let currentTigerCaptures = $derived(getCurrentTigerCaptures());
	
	// Handle board position clicks
	function handlePointClick(id: number) {
		console.log(
			`Click on ID: ${id}, Current Turn: ${gameState.turn}, Phase: ${gameState.phase}, Selected: ${gameState.selectedPieceId}`
		);

		if (gameState.winner) {
			console.log('Game already won, ignoring click.');
			return;
		}

		const pieceAtClickId = gameState.board[id];
		const currentlySelectedId = gameState.selectedPieceId;

		// --- GOAT'S TURN ---
		if (gameState.turn === 'GOAT') {
			// --- PLACEMENT PHASE ---
			if (gameState.phase === 'PLACEMENT') {
				if (pieceAtClickId === null) {
					// Place the goat
					gameState.board[id] = 'GOAT';
					gameState.goatsPlaced++;
					console.log(`Goat placed at ${id}. Total placed: ${gameState.goatsPlaced}`);
					
					// Add to move history
					moveHistory.push(`Goat placed at position ${id}`);

					// Check for Goat Win by Trapping
					console.log('Checking for trap after placement...');
					if (checkIfTigersAreTrapped(gameState, adjacency, points)) {
						console.log('Goats Win! Tigers detected as trapped after placement.');
						gameState.winner = 'GOAT';
						moveHistory.push('Goats win by trapping tigers!');
					}

					// Change phase if 20 goats are placed AND no winner yet
					if (!gameState.winner && gameState.goatsPlaced >= 20) {
						gameState.phase = 'MOVEMENT';
						console.log('Goat phase changed to MOVEMENT.');
					}

					// Switch turn ONLY if no winner was determined
					if (!gameState.winner) {
						console.log('Switching turn to TIGER.');
						gameState.turn = 'TIGER';
					}

					// Reset selection
					gameState.selectedPieceId = null;
				}
				return;
			}
			// --- MOVEMENT PHASE ---
			else {
				if (pieceAtClickId === 'GOAT') {
					// Selecting a goat
					gameState.selectedPieceId = id;
				} else if (
					pieceAtClickId === null &&
					currentlySelectedId !== null &&
					validMoves.includes(id)
				) {
					// Moving a goat
					executeMove(gameState, currentlySelectedId, id, null, adjacency, points);
					moveHistory.push(`Goat moved from ${currentlySelectedId} to ${id}`);
				} else {
					// Invalid click
					gameState.selectedPieceId = null; // Deselect
				}
				return;
			}
		}

		// --- TIGER'S TURN ---
		if (gameState.turn === 'TIGER') {
			if (pieceAtClickId === 'TIGER') {
				// Selecting a tiger
				gameState.selectedPieceId = id;
			} else if (
				pieceAtClickId === null &&
				currentlySelectedId !== null &&
				validMoves.includes(id)
			) {
				// Moving/Capturing
				const captureInfo = currentTigerCaptures.find((c) => c.destinationId === id);
				const jumpedGoatId = captureInfo ? captureInfo.jumpedGoatId : null;
				
				if (jumpedGoatId) {
					moveHistory.push(`Tiger captured goat at ${jumpedGoatId} and moved to ${id}`);
				} else {
					moveHistory.push(`Tiger moved from ${currentlySelectedId} to ${id}`);
				}
				
				executeMove(gameState, currentlySelectedId, id, jumpedGoatId, adjacency, points);
			} else {
				// Invalid click
				if (currentlySelectedId !== null) {
					gameState.selectedPieceId = null; // Deselect
				}
			}
			return;
		}
	}

	function resetGame() {
		resetGameState();
		moveHistory = [];
	}
	
	onMount(() => {
		resetGame();
		console.log('Bagchal game initialized');
	});
</script>

<div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 h-full">
	<!-- Game Board - First on mobile, second on desktop -->
	<section class="flex flex-col lg:order-2">
		<div class="section-card h-full">
			<h2 class="section-title">Bagchal Board</h2>
			
			<!-- Game Board Container -->
			<div class="flex-1 flex flex-col items-center justify-center p-4">
				<!-- Game Board -->
				<div class="board-wrapper w-full max-w-none">
					<BagchalBoard {points} {lines} {gameState} {validMoves} {handlePointClick} />
				</div>
				
				<!-- Game Instructions based on current state -->
				<div class="mt-3 text-center">
					{#if gameState.winner}
						<p class="text-lg font-bold text-primary-red">
							🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
						</p>
					{:else if gameState.phase === 'PLACEMENT'}
						<p class="text-text-secondary text-sm">
							Click to place goat #{gameState.goatsPlaced + 1}
						</p>
					{:else}
						<p class="text-text-secondary text-sm">
							{gameState.turn === 'GOAT' ? 'Select and move a goat' : 'Select a tiger and move or capture'}
						</p>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- Sidebar - Second on mobile, first on desktop -->
	<aside class="space-y-6 lg:order-1">
		<!-- Game Status Card -->
		<div class="section-card">
			<h2 class="section-title">Game Status</h2>
			<div class="space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-text-secondary">Current Turn:</span>
					<span class="capitalize font-semibold" class:text-primary-red={gameState.turn === 'TIGER'}>
						{gameState.turn.toLowerCase()}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-text-secondary">Phase:</span>
					<span class="capitalize font-semibold">{gameState.phase.toLowerCase()}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-text-secondary">Goats Placed:</span>
					<span class="font-semibold">{gameState.goatsPlaced}/20</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-text-secondary">Goats Captured:</span>
					<span class="font-semibold text-primary-red">{gameState.goatsCaptured}</span>
				</div>
			</div>
		</div>
		
		<!-- Game Controls -->
		<div class="section-card">
			<h2 class="section-title">Game Controls</h2>
			<div class="space-y-3">
				<button class="btn w-full" onclick={resetGame}>
					New Game
				</button>
				<button class="btn w-full" disabled>
					Undo Move
				</button>
				<button class="btn w-full" disabled>
					Save Game
				</button>
			</div>
		</div>
		
		<!-- Game Settings -->
		<div class="section-card">
			<h2 class="section-title">Settings</h2>
			<div class="space-y-3">
				<label class="flex items-center justify-between cursor-pointer">
					<span class="text-text-secondary">Show Hints</span>
					<input 
						type="checkbox" 
						bind:checked={showHints}
						class="w-4 h-4 text-primary-red bg-bg-primary border-border focus:ring-primary-red"
					>
				</label>
				<label class="flex items-center justify-between cursor-pointer">
					<span class="text-text-secondary">Sound Effects</span>
					<input 
						type="checkbox" 
						bind:checked={soundEnabled}
						class="w-4 h-4 text-primary-red bg-bg-primary border-border focus:ring-primary-red"
					>
				</label>
			</div>
		</div>
		
		<!-- Game Rules -->
		<div class="section-card">
			<h2 class="section-title">Quick Rules</h2>
			<div class="text-sm text-text-secondary space-y-2">
				<p><strong class="text-text-primary">Goal:</strong></p>
				<ul class="text-xs space-y-1 ml-4">
					<li>• Tigers: Capture 5 goats to win</li>
					<li>• Goats: Block all tiger moves</li>
				</ul>
				<p><strong class="text-text-primary">Phases:</strong></p>
				<ul class="text-xs space-y-1 ml-4">
					<li>• Place 20 goats on board</li>
					<li>• Move pieces strategically</li>
				</ul>
			</div>
		</div>
		
		<!-- Move History -->
		<div class="section-card">
			<h2 class="section-title">Move History</h2>
			<div class="max-h-32 overflow-y-auto">
				{#if moveHistory.length === 0}
					<p class="text-text-secondary text-sm">No moves yet</p>
				{:else}
					<ul class="text-sm space-y-1">
						{#each moveHistory as move, index}
							<li class="text-text-secondary">
								{index + 1}. {move}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</aside>
</div>

<!-- Winner Modal -->
{#if gameState.winner}
	<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="mx-auto max-w-sm bg-white dark:bg-gray-800 p-8 text-center shadow-2xl">
			<h2 class="mb-4 text-4xl font-bold text-green-600">
				🎉 {gameState.winner === 'TIGER' ? 'Tigers' : 'Goats'} Win!
			</h2>
			<p class="mb-4 text-text-secondary">
				{gameState.winner === 'TIGER' 
					? `Captured ${gameState.goatsCaptured} goats!` 
					: 'All tigers are trapped!'}
			</p>
			<button
				onclick={resetGame}
				class="mt-4 bg-indigo-600 px-8 py-3 text-white transition hover:bg-indigo-700"
			>
				Play Again
			</button>
		</div>
	</div>
{/if}

<style>
	/* Custom checkbox styling for dark theme */
	input[type="checkbox"] {
		appearance: none;
		background-color: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 3px;
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		position: relative;
		transition: all 0.3s ease;
	}
	
	input[type="checkbox"]:checked {
		background-color: var(--color-primary-red);
		border-color: var(--color-primary-red);
	}
	
	input[type="checkbox"]:checked::after {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 0.75rem;
		font-weight: bold;
	}
	
	input[type="checkbox"]:hover {
		border-color: var(--color-primary-red);
	}
	
	/* Disable button styling */
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	button:disabled:hover {
		border-color: var(--color-border);
		color: var(--color-text-primary);
	}
	
	/* Scrollbar for move history */
	.max-h-32::-webkit-scrollbar {
		width: 4px;
	}
	
	.max-h-32::-webkit-scrollbar-track {
		background: var(--color-bg-primary);
	}
	
	.max-h-32::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 2px;
	}
	
	.max-h-32::-webkit-scrollbar-thumb:hover {
		background: var(--color-primary-red);
	}
	
	/* Board wrapper styling */
	.board-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 400px;
	}
	
	/* Make board responsive and larger */
	.board-wrapper :global(svg) {
		width: min(80vw, 600px);
		height: min(80vw, 600px);
		max-width: none;
	}
	
	@media (min-width: 1024px) {
		.board-wrapper :global(svg) {
			width: min(50vw, 700px);
			height: min(50vw, 700px);
		}
	}
</style> 