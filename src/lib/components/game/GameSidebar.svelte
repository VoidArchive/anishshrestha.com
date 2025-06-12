<script lang="ts">
	import type { GameState } from '$lib/bagchal';
	import GameStatus from './GameStatus.svelte';
	import GameControls from './GameControls.svelte';
	import GameSettings from './GameSettings.svelte';
	import GameRules from './GameRules.svelte';
	import MoveHistory from './MoveHistory.svelte';

	interface Props {
		gameState: GameState;
		moveHistory: string[];
		isPlayingComputer: boolean;
		playerSide: string;
		aiDifficulty: 'easy' | 'medium' | 'hard';
		isComputerThinking: boolean;
		onReset: () => void;
		onGameModeChange: (isComputer: boolean) => void;
		onPlayerSideChange: (side: string) => void;
		onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
		onUndo: () => void;
		canUndo: boolean;
	}

	let { 
		gameState, 
		moveHistory, 
		isPlayingComputer,
		playerSide,
		aiDifficulty,
		isComputerThinking,
		onReset, 
		onGameModeChange,
		onPlayerSideChange,
		onDifficultyChange,
		onUndo,
		canUndo
	}: Props = $props();
</script>

<aside class="space-y-6 lg:order-1">
	<GameStatus {gameState} {isComputerThinking} {isPlayingComputer} {playerSide} />
	<GameSettings {isPlayingComputer} {playerSide} {aiDifficulty} {onGameModeChange} {onPlayerSideChange} {onDifficultyChange} {onReset} />
	<GameControls {onReset} {onUndo} {canUndo} />
	<GameRules />
	<MoveHistory {moveHistory} />
</aside> 