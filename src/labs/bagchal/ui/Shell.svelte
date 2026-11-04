<script lang="ts">
	import { onMount } from 'svelte';
	import { gameState, points, lines, getValidMoves } from '#labs/bagchal/store.svelte.js';
	import GameBoard from './GameBoard.svelte';
	import GameSidebar from './GameSidebar.svelte';
	import WinnerModal from './WinnerModal.svelte';
	import ErrorBoundary from '#lib/components/ErrorBoundary.svelte';
	import GameLogicHandler from './GameLogicHandler.svelte';
	import ComputerAIHandler from './ComputerAIHandler.svelte';
	import GameStateHandler from './GameStateHandler.svelte';

	// Game history for undo functionality
	let moveHistory: string[] = $state([]);

	// Game settings
	let isPlayingComputer = $state(true);
	let playerSide = $state('GOAT');
	let gameMode: 'EASY' | 'HARD' = $state('EASY');

	// Component references
	let gameLogicHandler: GameLogicHandler | undefined = $state();
	let computerAIHandler: ComputerAIHandler | undefined = $state();
	let gameStateHandler: GameStateHandler | undefined = $state();
	let gameBoardRef: GameBoard | undefined = $state();

	// Local derived state
	let validMoves = $derived(getValidMoves());

	// Handlers for child components
	function setMoveHistory(history: string[]) {
		moveHistory = history;
	}

	function clearComputerCache() {
		if (computerAIHandler?.computerPlayer) {
			computerAIHandler.computerPlayer.clearCache();
		}
	}

	// Handlers for game settings
	function handleGameModeChange(isComputer: boolean) {
		isPlayingComputer = isComputer;
	}

	function handlePlayerSideChange(side: string) {
		playerSide = side;
	}

	function handleModeChange(newMode: 'EASY' | 'HARD') {
		gameMode = newMode;
		gameState.mode = newMode;
	}

	onMount(() => {
		gameStateHandler?.resetGame();
	});
</script>

<!-- Game State Handler -->
<GameStateHandler
	bind:this={gameStateHandler}
	{moveHistory}
	onSetMoveHistory={setMoveHistory}
	onClearComputerCache={clearComputerCache}
/>

<!-- Game Logic Handler -->
<GameLogicHandler
	bind:this={gameLogicHandler}
	onSaveGameState={() => gameStateHandler?.saveGameState()}
	onAddToHistory={(msg) => gameStateHandler?.addToHistory(msg)}
	onTriggerAnimation={(from, to, moveType, jumpedGoatId) => {
		const move = { from, to, moveType, jumpedGoatId };
		gameBoardRef?.triggerAnimation(move, 400); // Shorter for player moves
	}}
/>

<!-- Computer AI Handler -->
<ComputerAIHandler
	bind:this={computerAIHandler}
	{gameMode}
	{isPlayingComputer}
	{playerSide}
	lastUndoTime={gameStateHandler?.lastUndoTime || 0}
	onSaveGameState={() => gameStateHandler?.saveGameState()}
	onAddToHistory={(msg) => gameStateHandler?.addToHistory(msg)}
	onTriggerAnimation={(move) => gameBoardRef?.triggerAnimation(move, 1200)}
/>

<header class="lab-head">
	<span class="fig" aria-hidden="true">Fig. 5</span>
	<h1>Bagchal</h1>
	<p class="dek">The Nepali tigers-and-goats game, with a minimax opponent.</p>
</header>

<ErrorBoundary fallback="The Bagchal game encountered an error. Please try restarting the game.">
	<div class="flex flex-col gap-10 lg:grid lg:grid-cols-[350px_1fr] lg:gap-14">
		<GameBoard
			bind:this={gameBoardRef}
			{points}
			{lines}
			{gameState}
			{validMoves}
			handlePointClick={(id) => gameLogicHandler?.handlePointClick(id)}
			isComputerThinking={computerAIHandler?.isComputerThinking || false}
			{isPlayingComputer}
			{playerSide}
			{moveHistory}
		/>
		<GameSidebar
			{gameState}
			{isPlayingComputer}
			{playerSide}
			{gameMode}
			isComputerThinking={computerAIHandler?.isComputerThinking || false}
			canUndo={gameStateHandler?.canUndo || false}
			onReset={() => gameStateHandler?.resetGame()}
			onGameModeChange={handleGameModeChange}
			onPlayerSideChange={handlePlayerSideChange}
			onModeChange={handleModeChange}
			onUndo={() => gameStateHandler?.undoMove(isPlayingComputer ? 2 : 1)}
		/>
	</div>

	<WinnerModal
		{gameState}
		{moveHistory}
		{isPlayingComputer}
		{playerSide}
		onPlayAgain={() => gameStateHandler?.resetGame()}
		onSwitchSides={() => {
			playerSide = playerSide === 'GOAT' ? 'TIGER' : 'GOAT';
			gameStateHandler?.resetGame();
		}}
		onChangeMode={() => {
			gameMode = gameMode === 'EASY' ? 'HARD' : 'EASY';
			gameState.mode = gameMode;
			gameStateHandler?.resetGame();
		}}
	/>
</ErrorBoundary>

<style>
	.lab-head {
		margin-bottom: 40px;
	}
	.fig {
		display: block;
		font-family: var(--font-family-sans);
		font-weight: 700;
		font-size: clamp(40px, 5vw, 64px);
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--color-spot);
	}
	h1 {
		font-weight: 600;
		font-size: clamp(34px, 3vw, 40px);
		line-height: 1.02;
		letter-spacing: -0.015em;
		margin-top: 8px;
	}
	.dek {
		font-style: italic;
		font-size: 17px;
		margin-top: 8px;
	}
</style>
