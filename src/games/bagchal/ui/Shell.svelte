<script lang="ts">
	import { onMount } from 'svelte';
	import {
		gameState,
		points,
		lines,
		getValidMoves
	} from '$games/bagchal/store.svelte';
	import GameBoard from './GameBoard.svelte';
	import GameSidebar from './GameSidebar.svelte';
	import WinnerModal from './WinnerModal.svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
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
	let gameBoardRef: any = $state();

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
	{moveHistory}
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

<ErrorBoundary fallback="The Bagchal game encountered an error. Please try restarting the game.">
	<div class="flex flex-col gap-4 lg:grid lg:h-full lg:grid-cols-[350px_1fr] lg:gap-8">
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